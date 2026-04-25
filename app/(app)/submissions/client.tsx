"use client";

import { useState } from "react";
import type { NavigatorSubmission, NavigatorSubmissionStatus } from "@/lib/types";

const STATUS_COLORS: Record<NavigatorSubmissionStatus, { bg: string; color: string; border: string }> = {
  submitted: { bg: "rgba(96,165,250,0.12)", color: "#93c5fd", border: "rgba(96,165,250,0.3)" },
  parsed:    { bg: "rgba(167,139,250,0.12)", color: "#c4b5fd", border: "rgba(167,139,250,0.3)" },
  scored:    { bg: "rgba(0,199,88,0.12)", color: "#00c758", border: "rgba(0,199,88,0.3)" },
};

const DOMAIN_LABELS: Record<string, string> = {
  fintech: "Fintech", healthcare: "Healthcare", edtech: "EdTech",
  logistics: "Logistics", hr_tech: "HR Tech", agriculture: "Agriculture", other: "Other",
};

const SOURCE_LABELS: Record<string, string> = {
  ai_orchestration_labs: "AI Orch Labs",
  independent_hackathon: "Hackathon",
  college_event: "College",
  personal_project: "Personal",
  other: "Other",
};

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      className="card"
      style={{ textAlign: "center", padding: "1.25rem" }}
    >
      <div style={{ fontSize: "1.75rem", fontWeight: 700, color: accent, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.375rem" }}>
        {label}
      </div>
    </div>
  );
}

function Badge({ status }: { status: NavigatorSubmissionStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.125rem 0.625rem",
        borderRadius: "9999px",
        fontSize: "0.7rem",
        fontWeight: 600,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function Row({
  s,
  onSelect,
}: {
  s: NavigatorSubmission;
  onSelect: (s: NavigatorSubmission) => void;
}) {
  return (
    <tr
      onClick={() => onSelect(s)}
      style={{
        borderBottom: "1px solid var(--color-border)",
        cursor: "pointer",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-card-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem", color: "var(--color-text)" }}>
        {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
      </td>
      <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem", color: "var(--color-text)" }}>
        {s.wants_report ? (s.first_name ?? "—") : <span style={{ color: "var(--color-text-muted)" }}>Anonymous</span>}
      </td>
      <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem", color: "var(--color-text-sec)" }}>
        {SOURCE_LABELS[s.source] ?? s.source}
      </td>
      <td style={{ padding: "0.875rem 1rem", fontSize: "0.8125rem", color: "var(--color-text-sec)" }}>
        {DOMAIN_LABELS[s.domain] ?? s.domain}
      </td>
      <td style={{ padding: "0.875rem 1rem" }}>
        <a
          href={s.repo_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-blue)",
            textDecoration: "none",
            maxWidth: "14rem",
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {s.repo_url.replace("https://github.com/", "")}
        </a>
      </td>
      <td style={{ padding: "0.875rem 1rem" }}>
        <Badge status={s.status} />
      </td>
    </tr>
  );
}

function DetailPanel({
  s,
  onClose,
}: {
  s: NavigatorSubmission;
  onClose: () => void;
}) {
  const Field = ({ label, value }: { label: string; value: string | string[] | null }) => (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.875rem", color: "var(--color-text)", lineHeight: 1.6 }}>
        {Array.isArray(value)
          ? value.join(", ") || "—"
          : value || "—"}
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        background: "rgba(0,0,0,0.5)",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "min(32rem, 100%)",
          maxHeight: "calc(100vh - 2rem)",
          overflowY: "auto",
          padding: "1.5rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontWeight: 600, color: "var(--color-text)", marginBottom: "0.25rem" }}>
              {s.wants_report ? s.first_name : "Anonymous"}
            </div>
            <Badge status={s.status} />
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: "1.25rem",
              lineHeight: 1,
              padding: "0.25rem",
            }}
          >
            ×
          </button>
        </div>

        {s.wants_report && s.email && (
          <div
            style={{
              padding: "0.625rem 0.875rem",
              borderRadius: "0.625rem",
              background: "rgba(96,165,250,0.08)",
              border: "1px solid rgba(96,165,250,0.2)",
              fontSize: "0.8125rem",
              color: "var(--color-blue)",
              marginBottom: "1.25rem",
            }}
          >
            {s.email}
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.25rem" }}>
          <Field label="Source" value={SOURCE_LABELS[s.source] ?? s.source} />
          <Field label="Domain" value={DOMAIN_LABELS[s.domain] ?? s.domain} />
          <Field label="Duration" value={s.duration.replace(/_/g, " ")} />
          <Field label="Problem Statement" value={s.problem_statement} />
          <Field label="Before AI" value={s.pre_ai_thinking} />
          <Field label="AI Tools" value={s.ai_tools} />
          <Field label="Brief Quality" value={s.brief_quality.replace(/_/g, " ")} />
          <Field label="Redirections" value={s.ai_redirections.replace(/_/g, "–")} />
          <Field label="Self Tested" value={s.self_tested.replace(/_/g, " ")} />
          <Field label="Repo" value={null} />
          <a
            href={s.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontSize: "0.8125rem",
              color: "var(--color-blue)",
              marginBottom: "1rem",
              wordBreak: "break-all",
            }}
          >
            {s.repo_url}
          </a>
          {s.extra_context && (
            <Field label="Extra Context" value={s.extra_context} />
          )}
          <Field
            label="Submitted"
            value={new Date(s.created_at).toLocaleString("en-IN")}
          />
        </div>
      </div>
    </div>
  );
}

export function SubmissionsClient({
  submissions,
  stats,
}: {
  submissions: NavigatorSubmission[];
  stats: { total: number; wantsReport: number; parsed: number; scored: number };
}) {
  const [selected, setSelected] = useState<NavigatorSubmission | null>(null);
  const [filter, setFilter] = useState<NavigatorSubmissionStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = submissions.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.repo_url.toLowerCase().includes(q) ||
        s.first_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q) ||
        s.source.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <div style={{ maxWidth: "72rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "0.375rem" }}>
            Navigator Submissions
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            AhaaIQ training data — project submissions from developers
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))",
            gap: "1rem",
            marginBottom: "1.75rem",
          }}
        >
          <StatCard label="Total" value={stats.total} accent="var(--color-text)" />
          <StatCard label="Want Report" value={stats.wantsReport} accent="var(--color-blue)" />
          <StatCard label="Parsed" value={stats.parsed} accent="var(--color-purple)" />
          <StatCard label="Scored" value={stats.scored} accent="#00c758" />
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            style={{
              flex: "1 1 14rem",
              padding: "0.5rem 0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
              fontSize: "0.875rem",
              outline: "none",
            }}
            placeholder="Search by name, email, domain, repo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {(["all", "submitted", "parsed", "scored"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.625rem",
                border: `1px solid ${filter === f ? "var(--color-blue)" : "var(--color-border)"}`,
                background: filter === f ? "rgba(96,165,250,0.1)" : "transparent",
                color: filter === f ? "var(--color-blue)" : "var(--color-text-muted)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}
          >
            {submissions.length === 0
              ? "No submissions yet. Share the form link to get started."
              : "No submissions match your filter."}
          </div>
        ) : (
          <div
            className="card"
            style={{ padding: 0, overflow: "hidden" }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Date", "Name", "Source", "Domain", "Repo", "Status"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "var(--color-text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <Row key={s.id} s={s} onSelect={setSelected} />
                  ))}
                </tbody>
              </table>
            </div>
            <div
              style={{
                padding: "0.75rem 1rem",
                borderTop: "1px solid var(--color-border)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              {filtered.length} of {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <DetailPanel s={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
