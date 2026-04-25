import { createServiceRoleClient } from "@/lib/supabase/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { NavigatorSubmission } from "@/lib/types";
import { SubmissionsClient } from "./client";

export default async function SubmissionsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .schema("ahaa")
    .from("navigator_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("submissions fetch error:", error);
  }

  const submissions = (data ?? []) as NavigatorSubmission[];

  const stats = {
    total: submissions.length,
    wantsReport: submissions.filter((s) => s.wants_report).length,
    parsed: submissions.filter((s) => s.status === "parsed").length,
    scored: submissions.filter((s) => s.status === "scored").length,
  };

  return <SubmissionsClient submissions={submissions} stats={stats} />;
}
