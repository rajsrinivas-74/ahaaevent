import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahaa Event Hub",
  description: "Create branded event pages in minutes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
