"use client";

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const handleSuccess = (credentialResponse: any) => {
        const decoded: any = jwtDecode(credentialResponse.credential);
        const email = decoded.email;

        // Domain Check
        if (!email.endsWith("@madeone.kr")) {
            setError("Only @madeone.kr accounts are allowed access.");
            return;
        }

        login({
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture,
        });
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-sm relative z-10"
            >
                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-16 relative w-64 h-16"
                    >
                        <Image
                            src="/logo_horizontal.png"
                            alt="MADEONE"
                            fill
                            className="object-contain brightness-0 invert"
                            priority
                        />
                    </motion.div>

                    {/* Login Container */}
                    <div className="w-full space-y-8 flex flex-col items-center">
                        <div className="relative group/btn w-full flex justify-center scale-110">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur-lg transition duration-1000 group-hover/btn:duration-200" />
                            <div className="relative bg-zinc-900/40 backdrop-blur-md rounded-xl overflow-hidden border border-white/5 p-1">
                                <GoogleLogin
                                    onSuccess={handleSuccess}
                                    onError={() => setError("Login Failed. Please try again.")}
                                    theme="filled_black"
                                    shape="rectangular"
                                    size="large"
                                    text="signin_with"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 w-full"
                                >
                                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                    <p className="text-red-500 text-xs font-medium leading-relaxed">
                                        {error}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-20"
                    >
                        <p className="text-zinc-500 text-[11px] font-bold tracking-[0.4em] uppercase">
                            MADEONE ONLY
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Extreme Fine Detail */}
            <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none opacity-20">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-500/50 to-transparent" />
            </div>
        </div>
    );
}
