import type { Metadata } from "next";
import { AuthHeader } from "../_components/AuthHeader";
import { ForgotPasswordPage } from "@/pages_flow/forgot-password/ForgotPasswordPage";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your HONESTA account password.",
};

export default function Page() {
  return (
    <>
      <AuthHeader subtitle="Reset your password" />
      <ForgotPasswordPage />
    </>
  );
}
