import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthHeader } from "../_components/AuthHeader";
import { ResetPasswordPage } from "@/pages_flow/reset-password/ResetPasswordPage";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your HONESTA account.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  if (!email) {
    redirect("/forgot-password");
  }

  return (
    <>
      <AuthHeader subtitle="Reset your password" />
      <ResetPasswordPage email={email} />
    </>
  );
}
