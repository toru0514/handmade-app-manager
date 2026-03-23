import { getSupabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const { title, url, description } = body;

  if (!title || !url) {
    return Response.json(
      { error: "title and url are required" },
      { status: 400 }
    );
  }

  // Get max sort_order
  const { data: maxData } = await supabase
    .from("links")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder =
    maxData && maxData.length > 0 ? maxData[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("links")
    .insert({
      title,
      url,
      description: description || null,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
