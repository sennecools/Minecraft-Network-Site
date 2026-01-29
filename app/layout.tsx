import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sen's Network - Premium Minecraft Modded Servers",
  description: "Join Sen's Network featuring All the Mods 10 and custom modpacks. Experience premium modded Minecraft with an active community of 1000+ Discord members.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-zinc-950 text-white`} suppressHydrationWarning>
        <Navigation />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
