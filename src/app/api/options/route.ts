import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  supabaseAdmin,
} from "@/lib/supabase.server";

const ENTITY_MAP: Record<string, { table: string; column: string }> = {
  tags: { table: "tag_options", column: "label" },
  free_from: { table: "free_from_options", column: "label" },
  occasions: { table: "occasion_options", column: "label" },
  serving_ideas: { table: "serving_idea_options", column: "label" },
};

async function authorize() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: Request) {
  const user = await authorize();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { entityType, label } = body as {
    entityType: string;
    label: string;
  };

  const entity = ENTITY_MAP[entityType];
  if (!entity) {
    return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
  }

  const trimmed = label?.trim();
  if (!trimmed) {
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  }

  const insertData = { [entity.column]: trimmed };

  const { data, error } = await supabaseAdmin
    .from(entity.table)
    .insert(insertData)
    .select("id, " + entity.column)
    .single<Record<string, unknown>>();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Option already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { id: data.id, label: data[entity.column] },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const user = await authorize();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { entityType, id } = body as { entityType: string; id: number };

  const entity = ENTITY_MAP[entityType];
  if (!entity) {
    return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
  }

  if (!id || typeof id !== "number") {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from(entity.table)
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
