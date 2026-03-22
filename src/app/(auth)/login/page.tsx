import type { Metadata } from "next";
import { LoginPage } from "@/pages_flow/login/LoginPage";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your HONESTA account to track orders and manage favorites.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginPage next={next ?? "/"} />;
}
