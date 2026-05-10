import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "./components/AuthProvider";
import AppShell from "./components/AppShell";

export const metadata: Metadata = {
  title: "GitPulse | AI-Powered Repository Orchestration",
  description: "Connect repositories, analyse architecture, and orchestrate AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
