"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useRouter, usePathname } from "next/navigation";

interface User {
    name: string;
    email: string;
    picture: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    loading: boolean;
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
            setUser(JSON.parse(savedUser));
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

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("auth_user", JSON.stringify(userData));
        router.push("/");
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("auth_user");
        router.push("/login");
    };

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "875374026106-sm300i0093g0puid7erhfeftu747thiu.apps.googleusercontent.com";
    console.log("AuthProvider ClientID:", clientId ? "Loaded" : "Missing");

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <AuthContext.Provider value={{ user, login, logout, loading }}>
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
