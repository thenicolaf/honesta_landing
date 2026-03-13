import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { metadata as siteMetadata } from "./metadata";
import { structuredData } from "./structured-data";
import { Footer, Navbar } from "@/sections";
import { CartProvider, FavoritesProvider } from "@/providers";
import { createSupabaseServerClient } from "@/lib/supabase.server";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${jost.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <CartProvider userId={user?.id ?? null}>
          <FavoritesProvider userId={user?.id ?? null}>
            <Navbar
              user={user ? { email: user.email! } : null}
              isAdmin={profile?.role === "admin"}
            />
            {children}
            <Footer />
          </FavoritesProvider>
        </CartProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
