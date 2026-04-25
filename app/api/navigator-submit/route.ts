import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      consent_data,
      wants_report,
      first_name,
      email,
      source,
      problem_statement,
      domain,
      duration,
      pre_ai_thinking,
      ai_tools,
      brief_quality,
      ai_redirections,
      self_tested,
      repo_url,
      extra_context,
    } = body;

    if (!consent_data) {
      return NextResponse.json(
        { error: "Data consent is required." },
        { status: 400 }
      );
    }

    const coreFields = [source, problem_statement, domain, duration, pre_ai_thinking, brief_quality, ai_redirections, self_tested, repo_url];
    if (coreFields.some((v) => !v || String(v).trim() === "")) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (wants_report && (!first_name?.trim() || !email?.trim())) {
      return NextResponse.json(
        { error: "Name and email are required to receive your report." },
        { status: 400 }
      );
    }

    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+/.test(repo_url)) {
      return NextResponse.json(
        { error: "Please enter a valid public GitHub repo URL." },
        { status: 400 }
      );
    }

    if (wants_report && email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }
    }

    const repoPath = repo_url.trim().replace("https://github.com/", "").replace(/\/$/, "");
    const githubHeaders: HeadersInit = {
      Accept: "application/vnd.github+json",
      "User-Agent": "AhaaIQ-Submit",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    };
    const githubRes = await fetch(`https://api.github.com/repos/${repoPath}`, {
      headers: githubHeaders,
    });
    if (githubRes.status === 404) {
      return NextResponse.json(
        { error: "Repo not found or is private. Make sure the repo is public before submitting." },
        { status: 400 }
      );
    }
    if (!githubRes.ok) {
      return NextResponse.json(
        { error: "Could not verify the GitHub repo. Please check the URL and try again." },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { error: dbError } = await supabase
      .schema("ahaa")
      .from("navigator_submissions")
      .insert({
        consent_data: true,
        wants_report: wants_report ?? false,
        first_name: wants_report ? first_name.trim() : null,
        email: wants_report ? email.trim().toLowerCase() : null,
        source,
        problem_statement: problem_statement.trim(),
        domain,
        duration,
        pre_ai_thinking: pre_ai_thinking.trim(),
        ai_tools: ai_tools ?? [],
        brief_quality,
        ai_redirections,
        self_tested,
        repo_url: repo_url.trim(),
        extra_context: extra_context?.trim() || null,
        status: "submitted",
      });

    if (dbError) {
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "This repo or email has already been submitted." },
          { status: 409 }
        );
      }
      console.error("navigator_submissions insert error:", dbError);
      return NextResponse.json(
        { error: "Submission failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("navigator-submit route error:", err);
    return NextResponse.json(
      { error: "Unexpected error. Please try again." },
      { status: 500 }
    );
  }
}
