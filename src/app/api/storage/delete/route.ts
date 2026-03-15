import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import { deleteProductImage } from "@/lib/storage";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const url = body?.url as string | undefined;

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  await deleteProductImage(url);
  return NextResponse.json({ success: true });
}
