import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase.server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  }

  if (type === "new_product") {
    const { data } = await supabaseAdmin
      .from("products")
      .select("slug")
      .eq("id", id)
      .single();
    if (data?.slug) {
      return NextResponse.json({ href: `/products/${data.slug}` });
    }
  }

  if (type === "new_category") {
    const { data } = await supabaseAdmin
      .from("categories")
      .select("slug")
      .eq("id", id)
      .single();
    if (data?.slug) {
      return NextResponse.json({ href: `/?category=${data.slug}#products` });
    }
  }

  return NextResponse.json({ href: null });
}
