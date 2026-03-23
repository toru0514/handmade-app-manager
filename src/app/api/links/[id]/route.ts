import { getSupabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;
  const body = await request.json();
  const { title, url, description } = body;

  if (!title || !url) {
    return Response.json(
      { error: "title and url are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("links")
    .update({ title, url, description: description || null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await params;

  const { error } = await supabase.from("links").delete().eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
