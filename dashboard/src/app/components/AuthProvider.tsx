"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/register", "/auth/callback"];
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("gp_token");
    if (stored) {
      // Validate with backend
      fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${stored}` } })
        .then(r => r.ok ? r.json() : null)
        .then(res => {
          if (res && res.success && res.data) { 
            setUser(res.data); 
            setToken(stored); 
          }
          else { localStorage.removeItem("gp_token"); }
        })
        .catch(() => { localStorage.removeItem("gp_token"); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Route guard: redirect unauthenticated users to /login
  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_ROUTES.some(r => pathname?.startsWith(r));
    if (!user && !isPublic) {
      router.replace("/login");
    }
    if (user && isPublic) {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (!res.ok || !result.success) throw new Error(result.error || "Login failed");
    
    const data = result.data;
    localStorage.setItem("gp_token", data.access_token);
    // Support old code that reads "token"
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    router.replace("/");
  }, [router]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const result = await res.json();
    if (!res.ok || !result.success) throw new Error(result.error || "Registration failed");
    // Auto-login after register
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem("gp_token");
    localStorage.removeItem("token");
    localStorage.removeItem("connected");
    setUser(null);
    setToken(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
