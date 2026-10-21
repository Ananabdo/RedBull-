import type { Metadata, Viewport } from "next";
import { Anton, Inter_Tight } from "next/font/google";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const inter = Inter_Tight({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Red Bull — Energy, Engineered",
  description:
    "An unofficial design concept: a scroll-driven 3D storefront for Red Bull Energy Drink and its editions.",
};

export const viewport: Viewport = {
  themeColor: "#0b1a46",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
