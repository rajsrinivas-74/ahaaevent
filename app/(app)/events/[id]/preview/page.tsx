"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Event, EventBranding, EventFaq, FormField, FormSection } from "@/lib/types";
import { PublicEventView } from "@/components/public-event-view";

function generateHtml(
  event: Event,
  branding: EventBranding | null,
  faq: EventFaq[],
  sections: FormSection[],
  fields: FormField[],
): string {
  const bg      = branding?.background_color || "#020617";
  const primary = branding?.primary_color    || "#3b82a6";
  const accent  = branding?.accent_color     || "#6b5fa7";
  const font    = branding?.font_preset      || "Inter";

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const fieldHtml = (f: FormField) => {
    const opts = f.options ?? [];
    const inputBox = (content: string, extra = "") =>
      `<div style="width:100%;background:#ffffff08;border:1px solid #ffffff15;border-radius:0.75rem;padding:0.625rem 0.875rem;color:#ffffff80;font-size:0.875rem;${extra}">${content}</div>`;
    let control = "";
    if (f.type === "short_text") control = inputBox("Short answer");
    else if (f.type === "long_text") control = inputBox("Long answer", "min-height:4.5rem;");
    else if (f.type === "dropdown") control = inputBox(`<span>Select an option</span><span style="color:${primary};float:right;">▾</span>`);
    else if (f.type === "radio" || f.type === "checkbox")
      control = opts.map(o => `<div style="display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;color:#ffffffcc;margin-bottom:0.5rem;">
        <div style="width:1rem;height:1rem;border-radius:${f.type === "radio" ? "50%" : "0.25rem"};border:1px solid ${primary}60;flex-shrink:0;"></div>${o}</div>`).join("");
    else if (f.type === "file") control = inputBox(`<span style="color:${primary};">📎</span> Upload file`, "text-align:center;padding:1rem;");
    return `
      <div style="margin-bottom:1.25rem;">
        <div style="display:flex;align-items:center;gap:0.375rem;margin-bottom:0.375rem;">
          <label style="font-size:0.875rem;font-weight:500;color:#f8fafc;">${f.label}</label>
          ${f.required ? `<span style="font-size:0.75rem;color:${accent};">*</span>` : ""}
        </div>
        ${f.helper_text ? `<p style="font-size:0.75rem;color:#ffffff50;margin-bottom:0.375rem;">${f.helper_text}</p>` : ""}
        ${control}
      </div>`;
  };

  const formSection = fields.length === 0 ? "" : `
    <div>
      <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem;color:#ffffff60;">Submission Form</p>
      ${sections.length > 0
        ? sections.map(sec => {
            const sf = fields.filter(f => f.section_id === sec.id);
            if (!sf.length) return "";
            return `<p style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.5rem;color:${primary}cc;">${sec.title}</p>
                    ${sf.map(fieldHtml).join("")}`;
          }).join("")
        : fields.map(fieldHtml).join("")
      }
    </div>`;

  const faqSection = faq.length === 0 ? "" : `
    <div>
      <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem;color:#ffffff60;">FAQ</p>
      ${faq.map(f => `
        <div style="background:#ffffff08;border:1px solid #ffffff15;border-radius:0.75rem;padding:1rem;margin-bottom:0.75rem;">
          <p style="font-size:0.875rem;font-weight:600;margin-bottom:0.5rem;">${f.question}</p>
          <p style="font-size:0.875rem;color:#ffffffcc;line-height:1.6;">${f.answer}</p>
        </div>`).join("")}
    </div>`;

  const prizesSection = event.prizes && event.prizes.length > 0 ? `
    <div>
      <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem;color:#ffffff60;">Prizes</p>
      ${event.prizes.map((p, i) => `
        <div style="display:flex;justify-content:space-between;align-items:center;border-radius:0.75rem;padding:0.75rem 1rem;margin-bottom:0.5rem;background:${i===0?`${accent}20`:"#ffffff08"};border:1px solid ${i===0?`${accent}40`:"#ffffff15"};">
          <span style="font-size:0.875rem;font-weight:600;color:${i===0?accent:"#f8fafc"};">${i===0?"🏆 ":i===1?"🥈 ":i===2?"🥉 ":""}${p.label}</span>
          <span style="font-size:0.875rem;font-weight:700;color:${i===0?accent:"#ffffffcc"};">${p.value}</span>
        </div>`).join("")}
    </div>` : "";

  const criteriaSection = event.judging_criteria && event.judging_criteria.length > 0 ? `
    <div>
      <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem;color:#ffffff60;">Judging Criteria</p>
      ${event.judging_criteria.map(c => `
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
          <span style="font-size:0.875rem;flex:1;color:#ffffffcc;">${c.name}</span>
          <div style="display:flex;align-items:center;gap:0.5rem;min-width:120px;">
            <div style="flex:1;height:6px;border-radius:9999px;overflow:hidden;background:#ffffff15;">
              <div style="height:100%;border-radius:9999px;width:${c.weight}%;background:linear-gradient(90deg,${primary},${accent});"></div>
            </div>
            <span style="font-size:0.75rem;font-weight:600;color:${primary};">${c.weight}%</span>
          </div>
        </div>`).join("")}
    </div>` : "";

  const countdownSection = event.start_date ? `
    <div style="text-align:center;border-radius:1rem;padding:1.5rem;background:${primary}15;border:1px solid ${primary}30;">
      <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:${primary};margin-bottom:1rem;">Starts on</p>
      <p style="font-size:1.125rem;font-weight:700;">${formatDate(event.start_date)}</p>
      <p style="font-size:0.875rem;color:#ffffff80;margin-top:0.25rem;">${formatTime(event.start_date)}</p>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${event.name}</title>
  <meta name="description" content="${event.tagline || event.description || ""}" />
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${bg}; color: #f8fafc; font-family: '${font}', system-ui, sans-serif; line-height: 1.5; }
    a { color: inherit; }
    .container { max-width: 672px; margin: 0 auto; padding: 2rem 1rem; }
    .section { margin-bottom: 2rem; }
  </style>
</head>
<body>
  ${branding?.banner_url ? `<div style="width:100%;height:200px;overflow:hidden;"><img src="${branding.banner_url}" alt="Banner" style="width:100%;height:100%;object-fit:cover;" /></div>` : ""}

  <div style="padding:2rem 1.5rem;text-align:center;border-bottom:1px solid ${primary}30;">
    ${branding?.logo_url ? `<img src="${branding.logo_url}" alt="Logo" style="width:4rem;height:4rem;border-radius:0.75rem;object-fit:cover;margin:0 auto 1rem;" />` : ""}
    <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:0.5rem;">${event.name}</h1>
    ${event.tagline ? `<p style="font-size:1.125rem;color:${primary}cc;margin-bottom:1rem;">${event.tagline}</p>` : ""}
    <div style="display:flex;justify-content:center;gap:1.5rem;margin-top:1rem;">
      <div style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">${event.visitor_count}</p><p style="font-size:0.75rem;color:#ffffff80;">👁 Visitors</p></div>
      <div style="width:1px;background:#ffffff20;"></div>
      <div style="text-align:center;"><p style="font-size:1.5rem;font-weight:700;">${event.registration_count}</p><p style="font-size:0.75rem;color:#ffffff80;">✅ Registered</p></div>
    </div>
  </div>

  <div class="container">
    <div class="section">${countdownSection}</div>

    <div class="section" style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
      ${event.type ? `<div style="border-radius:0.75rem;padding:1rem;background:${primary}10;border:1px solid ${primary}20;"><p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:${primary};margin-bottom:0.25rem;">Type</p><p style="font-size:0.875rem;font-weight:500;text-transform:capitalize;">${event.type.replace("_"," ")}</p></div>` : ""}
      ${event.venue_type ? `<div style="border-radius:0.75rem;padding:1rem;background:${accent}10;border:1px solid ${accent}20;"><p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:${accent};margin-bottom:0.25rem;">Format</p><p style="font-size:0.875rem;font-weight:500;text-transform:capitalize;">${event.venue_type.replace("_"," ")}</p></div>` : ""}
    </div>

    ${event.description ? `<div class="section"><p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:#ffffff60;margin-bottom:0.75rem;">About</p><p style="font-size:0.875rem;line-height:1.7;color:#ffffffcc;">${event.description}</p></div>` : ""}

    ${prizesSection ? `<div class="section">${prizesSection}</div>` : ""}
    ${criteriaSection ? `<div class="section">${criteriaSection}</div>` : ""}
    ${formSection ? `<div class="section">${formSection}</div>` : ""}
    ${faqSection ? `<div class="section">${faqSection}</div>` : ""}

    ${event.contact_email ? `<div class="section" style="text-align:center;"><p style="font-size:0.75rem;color:#ffffff60;margin-bottom:0.25rem;">Questions? Reach out at</p><a href="mailto:${event.contact_email}" style="font-size:0.875rem;font-weight:500;color:${primary};">${event.contact_email}</a></div>` : ""}
  </div>
</body>
</html>`;
}

export default function PreviewPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [branding, setBranding] = useState<EventBranding | null>(null);
  const [faq, setFaq] = useState<EventFaq[]>([]);
  const [sections, setSections] = useState<FormSection[]>([]);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${eventId}`).then(r => r.json()),
      fetch(`/api/events/${eventId}/branding`).then(r => r.json()),
      fetch(`/api/faq?event_id=${eventId}`).then(r => r.json()),
      fetch(`/api/form?event_id=${eventId}`).then(r => r.json()),
    ]).then(([e, b, f, form]) => {
      setEvent(e);
      setBranding(b);
      setFaq(f);
      setSections(form.sections || []);
      setFields(form.fields || []);
      setLoading(false);
    });
  }, [eventId]);

  function handleDownload() {
    if (!event) return;
    const html = generateHtml(event, branding, faq, sections, fields);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.name.toLowerCase().replace(/\s+/g, "-")}-event-page.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div style={{ color: "var(--color-text-sec)" }}>Loading preview…</div>;
  if (!event) return null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Preview</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-sec)" }}>How your public event page will look</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} className="btn-secondary" style={{ fontSize: "0.8rem" }}>
            ↓ Download HTML
          </button>
          <a href={`/e/${event.join_code}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: "0.8rem" }}>
            Open public page ↗
          </a>
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
        <PublicEventView event={event} branding={branding} faq={faq} sections={sections} fields={fields} preview />
      </div>
    </div>
  );
}
