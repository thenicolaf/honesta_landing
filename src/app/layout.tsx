import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "HONESTA — Natural Dried Fruits. Sweetness Before Marketing.",
  description:
    "Handcrafted dried fruits and pastila. 100% fruit. No sugar. No additives. Small batch production with love.",
  keywords: ["dried fruits", "natural snacks", "no sugar", "handcrafted", "healthy sweets"],
  openGraph: {
    title: "HONESTA — Natural Dried Fruits",
    description: "Handcrafted dried fruits and pastila. 100% fruit. No sugar. No additives.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${jost.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
