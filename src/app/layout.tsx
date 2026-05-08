import { Cormorant_Garamond, Jost } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { metadata as siteMetadata } from "./metadata";
import { structuredData } from "./structured-data";
import { Footer, Navbar } from "@/sections";
import {
  CartProvider,
  FavoritesProvider,
  NotificationsProvider,
} from "@/providers";
import { ToastProvider, CookieConsent } from "@/shared/ui";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import { getCartItemCount } from "@/lib/cartDb";
import { getUnreadCount } from "@/lib/notificationsDb";
import { COOKIE_CONSENT_KEY } from "@/shared/consts";
import { cookies } from "next/headers";
import { Analytics } from "./_components/Analytics";
import { GAEventDispatcher } from "./_components/GAEventDispatcher";
import { Suspense } from "react";

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
  const [supabase, cookieStore] = await Promise.all([
    createSupabaseServerClient(),
    cookies(),
  ]);
  const hasConsent = cookieStore.has(COOKIE_CONSENT_KEY);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, cartItemCount, unreadNotificationCount] = user
    ? await Promise.all([
        supabase
          .from("profiles")
          .select("role, allow_notifications")
          .eq("id", user.id)
          .single(),
        getCartItemCount(supabase, user.id),
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data }) =>
            data?.role
              ? getUnreadCount(user.id, data.role, user.created_at)
              : 0,
          ),
      ])
    : [{ data: null }, 0, 0];

  return (
    <html lang="en">
      <head />
      <body
        className={`${cormorant.variable} ${jost.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <CartProvider
          userId={user?.id ?? null}
          initialItemCount={cartItemCount}
        >
          <FavoritesProvider userId={user?.id ?? null}>
            <NotificationsProvider
              role={profile?.role ?? null}
              userId={user?.id}
              allowNotifications={profile?.allow_notifications ?? true}
              initialUnreadCount={unreadNotificationCount}
            >
              <Navbar
                user={user ? { email: user.email! } : null}
                isAdmin={profile?.role === "admin"}
              />
              {children}
              <Footer />
            </NotificationsProvider>
          </FavoritesProvider>
        </CartProvider>
        <ToastProvider />
        <CookieConsent show={!hasConsent} />
        <Analytics />
        <Suspense fallback={null}>
          <GAEventDispatcher />
        </Suspense>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
