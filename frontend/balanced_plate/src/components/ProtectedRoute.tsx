import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../api/constants";
import React, { useState, useEffect } from "react";
import type { JwtPayload } from "jwt-decode";

interface DecodedToken {
    payload: JwtPayload;
    exp: number;
}

function ProtectedRoute({ children } : { children: React.ReactNode}) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        auth().catch((error) => {
            console.error("Authentication error:", error);
            setIsAuthorized(false);
        });
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
            setIsAuthorized(false);
            return;
        }

        try {
            const res = await api.post("/api/auth/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error("Token refresh error:", error);
            // Clear tokens on refresh failure
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }

        try {
            const decoded: DecodedToken = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;

            if (tokenExpiration < now) {
                await refreshToken();
            } else {
                setIsAuthorized(true);
            }
        } catch (error) {
            console.error("Token decode error:", error);
            // Clear invalid token
            localStorage.removeItem(ACCESS_TOKEN);
            setIsAuthorized(false);
        }
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? <>{children}</> : <Navigate to="/login" />;
}

export default ProtectedRoute;