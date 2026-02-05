"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useRouter, usePathname } from "next/navigation";

interface User {
    name: string;
    email: string;
    picture: string;
    isAdmin?: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    loading: boolean;
    refreshAdminStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const savedUser = localStorage.getItem("auth_user");
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            // Re-check admin status on load to ensure stale sessions are updated
            const updatedUser = { ...parsedUser, isAdmin: checkAdmin(parsedUser.email) };
            setUser(updatedUser);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading) {
            if (!user && pathname !== "/login") {
                router.push("/login");
            } else if (user && pathname === "/login") {
                router.push("/");
            }
        }
    }, [user, loading, pathname, router]);

    const checkAdmin = (email: string) => {
        const adminList = JSON.parse(localStorage.getItem("admin_list") || '["harrypark@madeone.kr"]');
        return adminList.includes(email);
    };

    const login = (userData: User) => {
        const userWithRole = { ...userData, isAdmin: checkAdmin(userData.email) };
        setUser(userWithRole);
        localStorage.setItem("auth_user", JSON.stringify(userWithRole));
        router.push("/");
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user");
        router.push("/login");
    };

    const refreshAdminStatus = () => {
        if (!user) return;
        const isAdmin = checkAdmin(user.email);
        if (user.isAdmin !== isAdmin) {
            const updatedUser = { ...user, isAdmin };
            setUser(updatedUser);
            localStorage.setItem("auth_user", JSON.stringify(updatedUser));
        }
    };

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "875374026106-sm300i0093g0puid7erhfeftu747thiu.apps.googleusercontent.com";

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <AuthContext.Provider value={{ user, login, logout, loading, refreshAdminStatus }}>
                {children}
            </AuthContext.Provider>
        </GoogleOAuthProvider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
