import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthHeader } from "../_components/AuthHeader";
import { VerifyEmailPage } from "@/pages_flow/verify-email/VerifyEmailPage";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Enter the verification code sent to your email.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  if (!email) {
    redirect("/signup");
  }

  return (
    <>
      <AuthHeader subtitle="Verify your email" />
      <VerifyEmailPage email={email} />
    </>
  );
}
