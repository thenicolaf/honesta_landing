import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { metadata as siteMetadata } from "./metadata";
import { structuredData } from "./structured-data";
import { Footer, Navbar } from "@/sections";
import { CartProvider } from "@/providers";

export { siteMetadata as metadata };

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${jost.variable} antialiased flex flex-col min-h-screen`}
      >
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
