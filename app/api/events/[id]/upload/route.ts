import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null; // "logo" | "banner"

  if (!file || !type) return NextResponse.json({ error: "Missing file or type" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${params.id}/${type}.${ext}`;

  const serviceClient = createServiceRoleClient();
  const { error } = await serviceClient.storage
    .from("event-assets")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = serviceClient.storage
    .from("event-assets")
    .getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
