import { LoginPage } from "@/pages_flow/login/LoginPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginPage next={next ?? "/"} />;
}
