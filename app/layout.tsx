import "./globals.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { Header } from "@/components/header";
import { Navbar } from "@/components/navbar";
import { Canvas } from "@/components/canvas";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-themed";

export const metadata = {
  title: "Elisa Smart Analysis Q&A",
  description:
    "Chat with a Postgres database using natural language powered by the AI SDK by Vercel.",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistMono.className} ${GeistSans.className}`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div
            className="min-h-screen dark:bg-gradient-to-br dark:from-black dark:to-slate-900  text-slate-900 dark:text-slate-100 relative overflow-hidden"
          >
            <Canvas />
            <div className="p-6 relative z-10">
              <Header />
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-2 lg:col-span-2">
                  <Navbar />
                </div>
                <div className="col-span-12 md:col-span-12 lg:col-span-10">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
