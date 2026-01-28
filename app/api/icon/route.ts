import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        const domain = new URL(targetUrl).origin;

        // 1. Try to fetch the page to look for manifest or icons
        const response = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) });
        const html = await response.text();

        // 2. Look for manifest
        const manifestMatch = html.match(/<link[^>]+rel="manifest"[^>]+href="([^"]+)"/);
        if (manifestMatch) {
            const manifestUrl = new URL(manifestMatch[1], domain).toString();
            const manifestRes = await fetch(manifestUrl);
            const manifest = await manifestRes.json();

            if (manifest.icons && manifest.icons.length > 0) {
                // Find the largest or specifically named icon
                const bestIcon = manifest.icons.reduce((prev: any, curr: any) => {
                    const prevSize = parseInt(prev.sizes?.split('x')[0] || '0');
                    const currSize = parseInt(curr.sizes?.split('x')[0] || '0');
                    return currSize > prevSize ? curr : prev;
                });
                return NextResponse.json({ icon: new URL(bestIcon.src, manifestUrl).toString() });
            }
        }

        // 3. Look for apple-touch-icon
        const appleIconMatch = html.match(/<link[^>]+rel="apple-touch-icon"[^>]+href="([^"]+)"/);
        if (appleIconMatch) {
            return NextResponse.json({ icon: new URL(appleIconMatch[1], domain).toString() });
        }

        // 4. Look for generic icon
        const iconMatch = html.match(/<link[^>]+rel="(?:shortcut )?icon"[^>]+href="([^"]+)"/);
        if (iconMatch) {
            return NextResponse.json({ icon: new URL(iconMatch[1], domain).toString() });
        }

        // 5. Fallback: Check if /logo.png exists (common for some apps)
        const logoRes = await fetch(`${domain}/logo.png`, { method: 'HEAD' });
        if (logoRes.ok) {
            return NextResponse.json({ icon: `${domain}/logo.png` });
        }

        // 6. Last resort: Google Favicon Service
        return NextResponse.json({ icon: `https://www.google.com/s2/favicons?domain=${new URL(targetUrl).hostname}&sz=128` });

    } catch (error) {
        console.error('Error fetching icon:', error);
        // If anything fails, return the Google fallback instead of erroring
        try {
            const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
            return NextResponse.json({ icon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128` });
        } catch {
            return NextResponse.json({ icon: null });
        }
    }
}
