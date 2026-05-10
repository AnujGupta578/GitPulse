"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (token) {
      // Store the token for the AuthProvider to pick up
      localStorage.setItem("gp_token", token);
      localStorage.setItem("token", token); // Backward compatibility
      
      // Redirect to repositories or dashboard
      router.replace("/repositories?syncing=true");
    } else {
      // If no token, something went wrong, send back to login
      router.replace("/login?error=no_token_received");
    }
  }, [router, searchParams]);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      color: "white",
      flexDirection: "column",
      gap: "1.5rem"
    }}>
      <div style={{
        width: "50px",
        height: "50px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
        animation: "pulse 1.5s infinite"
      }} />
      <div style={{ fontSize: "1.1rem", fontWeight: 500 }}>Finalizing authentication...</div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
