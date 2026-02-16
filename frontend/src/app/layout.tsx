import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { AuthProvider } from "@/components/ui/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusFlow — Penn Org & Event Platform",
  description:
    "The all-in-one platform for Penn student organizations. Create events, sell tickets, manage check-in, and engage your community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
