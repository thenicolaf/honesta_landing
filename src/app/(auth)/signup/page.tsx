import type { Metadata } from "next";
import { SignupPage } from "@/pages_flow/signup/SignupPage";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your HONESTA account to start shopping.",
};

export default function Page() {
  return <SignupPage />;
}
