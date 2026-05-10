"use client";

import { useAuth } from "./AuthProvider";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/register", "/auth/callback"];

/** Wraps the app shell — shows sidebar only when authenticated and not on a public page */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.some(r => pathname?.startsWith(r));

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "var(--bg-primary)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
            margin: "0 auto 1.5rem",
            animation: "pulse 1.5s ease-in-out infinite"
          }} />
          <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Initializing GitPulse…</div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }

  if (!user || isPublic) {
    // Unauthenticated or on a public page — render children alone
    return <>{children}</>;
  }

  // Authenticated — render full dashboard shell with sidebar
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
