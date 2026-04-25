"use client";

import { useState } from "react";
function IconGithub({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function IconCheck({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconLoader({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

const SOURCES = [
  { value: "ai_orchestration_labs", label: "AI Orchestration Labs training program" },
  { value: "independent_hackathon", label: "Independent hackathon" },
  { value: "college_event", label: "College / university event" },
  { value: "personal_project", label: "Personal project" },
  { value: "other", label: "Other" },
];

const DOMAINS = [
  { value: "fintech", label: "Fintech" },
  { value: "healthcare", label: "Healthcare" },
  { value: "edtech", label: "EdTech" },
  { value: "logistics", label: "Logistics" },
  { value: "hr_tech", label: "HR Tech" },
  { value: "agriculture", label: "Agriculture" },
  { value: "other", label: "Other" },
];

const DURATIONS = [
  { value: "under_4h", label: "Under 4 hours" },
  { value: "4_8h", label: "4–8 hours" },
  { value: "full_day", label: "Full day (8–12 hours)" },
  { value: "multiple_days", label: "Multiple days" },
];

const AI_TOOLS = ["Claude", "ChatGPT", "Cursor", "GitHub Copilot", "Gemini", "Other"];

const BRIEF_OPTIONS = [
  { value: "detailed_brief", label: "Yes — I wrote a detailed brief" },
  { value: "partial", label: "Partial — I gave some direction" },
  { value: "no_direct", label: "No — I described the problem directly" },
  { value: "no_ai_led", label: "No — I let the AI figure it out" },
];

const REDIRECTION_OPTIONS = [
  { value: "0", label: "0" },
  { value: "1_3", label: "1–3" },
  { value: "4_10", label: "4–10" },
  { value: "10_plus", label: "10+" },
];

const TESTED_OPTIONS = [
  { value: "yes_thoroughly", label: "Yes — thoroughly" },
  { value: "partially", label: "Partially" },
  { value: "no", label: "No" },
];

type FormState = {
  consent_data: boolean;
  wants_report: boolean;
  first_name: string;
  email: string;
  source: string;
  problem_statement: string;
  domain: string;
  duration: string;
  pre_ai_thinking: string;
  ai_tools: string[];
  brief_quality: string;
  ai_redirections: string;
  self_tested: string;
  repo_url: string;
  extra_context: string;
};

const INITIAL: FormState = {
  consent_data: false,
  wants_report: false,
  first_name: "",
  email: "",
  source: "",
  problem_statement: "",
  domain: "",
  duration: "",
  pre_ai_thinking: "",
  ai_tools: [],
  brief_quality: "",
  ai_redirections: "",
  self_tested: "",
  repo_url: "",
  extra_context: "",
};

function RadioOption({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.625rem 0.875rem",
        borderRadius: "0.625rem",
        border: `1px solid ${checked ? "var(--color-blue)" : "var(--color-border)"}`,
        background: checked ? "rgba(96,165,250,0.08)" : "transparent",
        cursor: "pointer",
        transition: "all 0.15s",
        fontSize: "0.875rem",
        color: "var(--color-text)",
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ accentColor: "var(--color-blue)" }}
      />
      {label}
    </label>
  );
}

function CheckOption({
  value,
  label,
  checked,
  onChange,
}: {
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.625rem 0.875rem",
        borderRadius: "0.625rem",
        border: `1px solid ${checked ? "var(--color-purple)" : "var(--color-border)"}`,
        background: checked ? "rgba(167,139,250,0.08)" : "transparent",
        cursor: "pointer",
        transition: "all 0.15s",
        fontSize: "0.875rem",
        color: "var(--color-text)",
      }}
    >
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ accentColor: "var(--color-purple)" }}
      />
      {label}
    </label>
  );
}

function SectionCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            width: "1.75rem",
            height: "1.75rem",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {number}
        </div>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export default function SubmitPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleTool(tool: string) {
    set(
      "ai_tools",
      form.ai_tools.includes(tool)
        ? form.ai_tools.filter((t) => t !== tool)
        : [...form.ai_tools, tool]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.consent_data) {
      setError("You must agree to the data consent to submit.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/navigator-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
          background: "var(--color-bg)",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <div
            style={{
              width: "4rem",
              height: "4rem",
              borderRadius: "50%",
              background: "rgba(96,165,250,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <IconCheck size={32} />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--color-text)",
              marginBottom: "0.75rem",
            }}
          >
            Submitted
          </h1>
          <p
            style={{
              color: "var(--color-text-sec)",
              lineHeight: 1.6,
              marginBottom: "0.5rem",
            }}
          >
            {form.wants_report
              ? "We will run the AhaaIQ parser on your repo and email you when your Navigator score is ready."
              : "We will run the AhaaIQ parser on your repo. Thank you for contributing anonymously."}
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            Thank you for helping build AhaaIQ.
          </p>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    borderRadius: "0.625rem",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--color-text)",
    marginBottom: "0.5rem",
  };

  const helperStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    color: "var(--color-text-muted)",
    marginTop: "0.375rem",
  };

  const fieldStyle: React.CSSProperties = { marginBottom: "1.25rem" };
  const gridStyle: React.CSSProperties = { display: "grid", gap: "0.5rem" };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        padding: "3rem 1rem 4rem",
      }}
    >
      <div style={{ maxWidth: "42rem", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconGithub size={18} color="#fff" />
            </div>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
              }}
            >
              AhaaIQ
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 700,
              color: "var(--color-text)",
              marginBottom: "0.875rem",
              lineHeight: 1.25,
            }}
          >
            Submit Your Project
          </h1>

          <p
            style={{
              color: "var(--color-text-sec)",
              lineHeight: 1.7,
              marginBottom: "0.75rem",
            }}
          >
            AhaaIQ evaluates how developers navigate Gen AI tools during a build — not just what
            they built, but how they thought, directed, and controlled the AI to get there.
          </p>
          <p
            style={{
              color: "var(--color-text-sec)",
              lineHeight: 1.7,
              marginBottom: "0.75rem",
            }}
          >
            Submit your project repo and a short context form. We will run the AhaaIQ parser on
            your repo. If you want your Navigator score, add your name and email at the end.
          </p>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.8125rem",
              lineHeight: 1.6,
            }}
          >
            Your data is used anonymously to train the model. Your name and repo will never appear
            in any output or public dataset. Your data will never be sold or shared with third
            parties.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Section 1 — Consent */}
          <SectionCard number="1" title="Consent">
            <label
              style={{
                display: "flex",
                gap: "0.875rem",
                padding: "1rem",
                borderRadius: "0.75rem",
                border: `1px solid ${form.consent_data ? "var(--color-blue)" : "var(--color-border)"}`,
                background: form.consent_data ? "rgba(96,165,250,0.06)" : "transparent",
                cursor: "pointer",
                marginBottom: "0.75rem",
                transition: "all 0.15s",
              }}
            >
              <input
                type="checkbox"
                checked={form.consent_data}
                onChange={(e) => set("consent_data", e.target.checked)}
                style={{
                  accentColor: "var(--color-blue)",
                  marginTop: "0.125rem",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text)",
                  lineHeight: 1.6,
                }}
              >
                I agree that my anonymised project data may be used to train AhaaIQ&apos;s
                evaluation model. My name and repo URL will never appear in any output or public
                dataset.{" "}
                <span style={{ color: "var(--color-pink)", fontWeight: 600 }}>Required</span>
              </span>
            </label>
          </SectionCard>

          {/* Section 2 — About You */}
          <SectionCard number="2" title="About You">
            <div style={{ ...fieldStyle, marginBottom: 0 }}>
              <label style={labelStyle}>Where did you build this project?</label>
              <div style={gridStyle}>
                {SOURCES.map((s) => (
                  <RadioOption
                    key={s.value}
                    name="source"
                    value={s.value}
                    label={s.label}
                    checked={form.source === s.value}
                    onChange={() => set("source", s.value)}
                  />
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Section 3 — The Problem */}
          <SectionCard number="3" title="The Problem">
            <div style={fieldStyle}>
              <label style={labelStyle}>
                Paste the exact problem statement you were given
              </label>
              <textarea
                style={{ ...inputStyle, minHeight: "7rem", resize: "vertical" }}
                value={form.problem_statement}
                onChange={(e) => set("problem_statement", e.target.value)}
                placeholder="Paste the problem statement here..."
                required
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Domain</label>
              <div
                style={{
                  ...gridStyle,
                  gridTemplateColumns: "repeat(auto-fill, minmax(9rem, 1fr))",
                }}
              >
                {DOMAINS.map((d) => (
                  <RadioOption
                    key={d.value}
                    name="domain"
                    value={d.value}
                    label={d.label}
                    checked={form.domain === d.value}
                    onChange={() => set("domain", d.value)}
                  />
                ))}
              </div>
            </div>

            <div style={{ ...fieldStyle, marginBottom: 0 }}>
              <label style={labelStyle}>How long did you have to build?</label>
              <div style={gridStyle}>
                {DURATIONS.map((d) => (
                  <RadioOption
                    key={d.value}
                    name="duration"
                    value={d.value}
                    label={d.label}
                    checked={form.duration === d.value}
                    onChange={() => set("duration", d.value)}
                  />
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Section 4 — Your Approach */}
          <SectionCard number="4" title="Your Approach">
            <div style={fieldStyle}>
              <label style={labelStyle}>
                What did you do before opening your AI tool?
              </label>
              <p style={helperStyle}>
                There are no wrong answers. A student who let AI do everything is as
                valuable to us as one who planned for an hour. We need both.
              </p>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: "6rem",
                  resize: "vertical",
                  marginTop: "0.375rem",
                }}
                value={form.pre_ai_thinking}
                onChange={(e) => set("pre_ai_thinking", e.target.value)}
                placeholder="Describe what you thought through before starting..."
                required
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>AI tools used</label>
              <p style={helperStyle}>Select all that apply</p>
              <div
                style={{
                  ...gridStyle,
                  gridTemplateColumns: "repeat(auto-fill, minmax(9rem, 1fr))",
                  marginTop: "0.375rem",
                }}
              >
                {AI_TOOLS.map((t) => (
                  <CheckOption
                    key={t}
                    value={t}
                    label={t}
                    checked={form.ai_tools.includes(t)}
                    onChange={() => toggleTool(t)}
                  />
                ))}
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>
                Did you write a brief before starting?
              </label>
              <div style={gridStyle}>
                {BRIEF_OPTIONS.map((o) => (
                  <RadioOption
                    key={o.value}
                    name="brief_quality"
                    value={o.value}
                    label={o.label}
                    checked={form.brief_quality === o.value}
                    onChange={() => set("brief_quality", o.value)}
                  />
                ))}
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>
                How many times did you redirect or correct the AI?
              </label>
              <div
                style={{
                  ...gridStyle,
                  gridTemplateColumns: "repeat(4, 1fr)",
                }}
              >
                {REDIRECTION_OPTIONS.map((o) => (
                  <RadioOption
                    key={o.value}
                    name="ai_redirections"
                    value={o.value}
                    label={o.label}
                    checked={form.ai_redirections === o.value}
                    onChange={() => set("ai_redirections", o.value)}
                  />
                ))}
              </div>
            </div>

            <div style={{ ...fieldStyle, marginBottom: 0 }}>
              <label style={labelStyle}>
                Did you test the output yourself before finishing?
              </label>
              <div style={gridStyle}>
                {TESTED_OPTIONS.map((o) => (
                  <RadioOption
                    key={o.value}
                    name="self_tested"
                    value={o.value}
                    label={o.label}
                    checked={form.self_tested === o.value}
                    onChange={() => set("self_tested", o.value)}
                  />
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Section 5 — Your Repo */}
          <SectionCard number="5" title="Your Repo">
            <div style={fieldStyle}>
              <label style={labelStyle}>Public GitHub repo URL</label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-muted)",
                    pointerEvents: "none",
                  }}
                >
                  <IconGithub size={16} color="var(--color-text-muted)" />
                </div>
                <input
                  style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                  value={form.repo_url}
                  onChange={(e) => set("repo_url", e.target.value)}
                  placeholder="https://github.com/username/repo"
                  required
                />
              </div>
              <p style={helperStyle}>Must be public and have at least 5 commits</p>
            </div>

            <div style={{ ...fieldStyle, marginBottom: 0 }}>
              <label style={labelStyle}>
                Any context the evaluator should know?{" "}
                <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
                  Optional
                </span>
              </label>
              <textarea
                style={{ ...inputStyle, minHeight: "5rem", resize: "vertical" }}
                value={form.extra_context}
                onChange={(e) => set("extra_context", e.target.value)}
                placeholder="Team size, constraints, incomplete features..."
              />
            </div>
          </SectionCard>

          {/* Section 6 — Your Report */}
          <SectionCard number="6" title="Your Report">
            <div style={fieldStyle}>
              <label style={labelStyle}>
                Do you want your Navigator score when it is ready?
              </label>
              <div style={gridStyle}>
                <RadioOption
                  name="wants_report"
                  value="yes"
                  label="Yes — send it to me"
                  checked={form.wants_report === true}
                  onChange={() => set("wants_report", true)}
                />
                <RadioOption
                  name="wants_report"
                  value="no"
                  label="No — I am submitting anonymously"
                  checked={form.wants_report === false && form.source !== ""}
                  onChange={() => {
                    set("wants_report", false);
                    set("first_name", "");
                    set("email", "");
                  }}
                />
              </div>
            </div>

            {form.wants_report && (
              <>
                <div style={fieldStyle}>
                  <label style={labelStyle}>First name</label>
                  <input
                    style={inputStyle}
                    value={form.first_name}
                    onChange={(e) => set("first_name", e.target.value)}
                    placeholder="Your first name"
                    required={form.wants_report}
                  />
                </div>
                <div style={{ ...fieldStyle, marginBottom: 0 }}>
                  <label style={labelStyle}>Email address</label>
                  <input
                    style={inputStyle}
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                    required={form.wants_report}
                  />
                  <p style={helperStyle}>
                    Only used to send your Navigator score. Never used for anything else.
                  </p>
                </div>
              </>
            )}
          </SectionCard>

          {error && (
            <div
              style={{
                padding: "0.875rem 1rem",
                borderRadius: "0.75rem",
                background: "rgba(244,114,182,0.1)",
                border: "1px solid rgba(244,114,182,0.3)",
                color: "var(--color-pink)",
                fontSize: "0.875rem",
                marginBottom: "1.25rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {submitting ? (
              <>
                <IconLoader size={16} />
                Submitting...
              </>
            ) : (
              "Submit Project"
            )}
          </button>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              marginTop: "1rem",
            }}
          >
            Takes 5 minutes · Data used anonymously · Never sold or shared
          </p>
        </form>
      </div>
    </div>
  );
}
