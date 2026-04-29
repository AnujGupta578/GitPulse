import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orchestrator | World-Class Architecture Analysis",
  description: "Commit-Driven Workflow Orchestration Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
