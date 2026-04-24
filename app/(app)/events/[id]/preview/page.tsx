"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Event, EventBranding, EventFaq, FormField, FormSection } from "@/lib/types";

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

  if (loading) return <div style={{ color: "var(--color-text-sec)" }}>Loading preview…</div>;
  if (!event) return null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Preview</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-sec)" }}>How your public event page will look</p>
        </div>
        <a href={`/e/${event.join_code}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: "0.8rem" }}>
          Open public page ↗
        </a>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
        <PublicEventView event={event} branding={branding} faq={faq} sections={sections} fields={fields} preview />
      </div>
    </div>
  );
}

export function PublicEventView({
  event, branding, faq, sections = [], fields = [], preview = false
}: {
  event: Event;
  branding: EventBranding | null;
  faq: EventFaq[];
  sections?: FormSection[];
  fields?: FormField[];
  preview?: boolean;
}) {
  const bg = branding?.background_color || "#020617";
  const primary = branding?.primary_color || "#3b82a6";
  const accent = branding?.accent_color || "#6b5fa7";
  const font = branding?.font_preset || "Inter";

  const start = event.start_date ? new Date(event.start_date) : null;

  return (
    <div style={{ background: bg, color: "#f8fafc", fontFamily: font, minHeight: preview ? "auto" : "100vh" }}>
      {/* Banner */}
      {branding?.banner_url && (
        <div className="w-full" style={{ height: "200px", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={branding.banner_url} alt="Event banner" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-8 text-center" style={{ borderBottom: `1px solid ${primary}30` }}>
        {branding?.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={branding.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover mx-auto mb-4" />
        )}
        <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
        {event.tagline && <p className="text-lg mb-4" style={{ color: `${primary}cc` }}>{event.tagline}</p>}

        {/* Visitor + Registration stats */}
        <div className="flex items-center justify-center gap-6 mt-4 mb-2">
          <div className="text-center">
            <p className="text-2xl font-bold">{event.visitor_count}</p>
            <p className="text-xs" style={{ color: "#ffffff80" }}>👁 Visitors</p>
          </div>
          <div className="w-px h-8" style={{ background: "#ffffff20" }} />
          <div className="text-center">
            <p className="text-2xl font-bold">{event.registration_count}</p>
            <p className="text-xs" style={{ color: "#ffffff80" }}>✅ Registered</p>
          </div>
        </div>

        {/* Participants gauge */}
        {event.max_participants && event.max_participants > 0 && (
          <ParticipantsGauge
            registered={event.registration_count}
            max={event.max_participants}
            primary={primary}
            accent={accent}
          />
        )}
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto space-y-8">
        {/* Countdown */}
        {start && <Countdown start={start} primary={primary} />}

        {/* Event details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {event.type && (
              <div className="rounded-xl p-4" style={{ background: `${primary}10`, border: `1px solid ${primary}20` }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: `${primary}` }}>Type</p>
                <p className="text-sm font-medium capitalize">{event.type.replace("_", " ")}</p>
              </div>
            )}
            {event.venue_type && (
              <div className="rounded-xl p-4" style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: `${accent}` }}>Format</p>
                <p className="text-sm font-medium capitalize">{event.venue_type.replace("_", " ")}</p>
              </div>
            )}
          </div>
          {event.theme && (
            <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid #ffffff15" }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#ffffff60" }}>Theme</p>
              <p className="text-sm font-medium">{event.theme}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#ffffff60" }}>About</p>
            <p className="text-sm leading-relaxed" style={{ color: "#ffffffcc" }}>{event.description}</p>
          </div>
        )}

        {/* Tracks */}
        {event.tracks && event.tracks.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#ffffff60" }}>Tracks</p>
            <div className="flex flex-wrap gap-2">
              {event.tracks.map((t, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: `${primary}20`, color: primary, border: `1px solid ${primary}40` }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Eligibility + Submission Deadline */}
        {(event.eligibility || event.submission_deadline) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {event.eligibility && (
              <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid #ffffff15" }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#ffffff60" }}>Eligibility</p>
                <p className="text-sm font-medium">{event.eligibility}</p>
              </div>
            )}
            {event.submission_deadline && (
              <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid #ffffff15" }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#ffffff60" }}>Submission Deadline</p>
                <p className="text-sm font-medium">
                  {new Date(event.submission_deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}
                  {new Date(event.submission_deadline).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Team Size */}
        {(event.team_min || event.team_max) && (
          <div className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid #ffffff15" }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#ffffff60" }}>Team Size</p>
            <p className="text-sm font-medium">
              {event.team_min && event.team_max
                ? `${event.team_min}–${event.team_max} members`
                : event.team_min
                ? `Min ${event.team_min} members`
                : `Max ${event.team_max} members`}
            </p>
          </div>
        )}

        {/* Prizes */}
        {event.prizes && event.prizes.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#ffffff60" }}>Prizes</p>
            <div className="space-y-2">
              {event.prizes.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: i === 0 ? `${accent}20` : "#ffffff08", border: `1px solid ${i === 0 ? `${accent}40` : "#ffffff15"}` }}>
                  <span className="text-sm font-semibold" style={{ color: i === 0 ? accent : "#f8fafc" }}>
                    {i === 0 ? "🏆 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : ""}{p.label}
                  </span>
                  <span className="text-sm font-bold" style={{ color: i === 0 ? accent : "#ffffffcc" }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Judging Criteria */}
        {event.judging_criteria && event.judging_criteria.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#ffffff60" }}>Judging Criteria</p>
            <div className="space-y-2">
              {event.judging_criteria.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm flex-1" style={{ color: "#ffffffcc" }}>{c.name}</span>
                  <div className="flex items-center gap-2" style={{ minWidth: "120px" }}>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#ffffff15" }}>
                      <div className="h-full rounded-full" style={{ width: `${c.weight}%`, background: `linear-gradient(90deg, ${primary}, ${accent})` }} />
                    </div>
                    <span className="text-xs font-semibold flex-shrink-0" style={{ color: primary }}>{c.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {event.status === "live" && (
          <div className="text-center">
            <a
              href={`${process.env.NEXT_PUBLIC_AHAA_HUB_URL || "https://ahaahub.aiorchestrator.in"}/register/${event.join_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              Register Now →
            </a>
          </div>
        )}

        {/* Submission Form Preview */}
        {fields.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#ffffff60" }}>Submission Form</p>
            <div className="space-y-4">
              {sections.length > 0
                ? sections.map(sec => {
                    const sectionFields = fields.filter(f => f.section_id === sec.id);
                    if (sectionFields.length === 0) return null;
                    return (
                      <div key={sec.id}>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: `${primary}cc` }}>{sec.title}</p>
                        <div className="space-y-3">
                          {sectionFields.map(f => <FormFieldPreview key={f.id} field={f} primary={primary} accent={accent} />)}
                        </div>
                      </div>
                    );
                  })
                : fields.map(f => <FormFieldPreview key={f.id} field={f} primary={primary} accent={accent} />)
              }
            </div>
          </div>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#ffffff60" }}>FAQ</p>
            <div className="space-y-3">
              {faq.map(f => (
                <div key={f.id} className="rounded-xl p-4" style={{ background: "#ffffff08", border: "1px solid #ffffff15" }}>
                  <p className="text-sm font-semibold mb-2">{f.question}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#ffffffcc" }}>{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {event.contact_email && (
          <div className="text-center pt-2">
            <p className="text-xs mb-1" style={{ color: "#ffffff60" }}>Questions? Reach out at</p>
            <a href={`mailto:${event.contact_email}`} className="text-sm font-medium" style={{ color: primary }}>
              {event.contact_email}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function FormFieldPreview({ field, primary, accent }: { field: FormField; primary: string; accent: string }) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#ffffff08",
    border: "1px solid #ffffff15",
    borderRadius: "0.75rem",
    padding: "0.625rem 0.875rem",
    color: "#ffffff80",
    fontSize: "0.875rem",
    pointerEvents: "none",
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-sm font-medium" style={{ color: "#f8fafc" }}>{field.label}</label>
        {field.required && <span className="text-xs" style={{ color: accent }}>*</span>}
      </div>
      {field.helper_text && (
        <p className="text-xs mb-1.5" style={{ color: "#ffffff50" }}>{field.helper_text}</p>
      )}
      {field.type === "short_text" && (
        <div style={inputStyle}>Short answer</div>
      )}
      {field.type === "long_text" && (
        <div style={{ ...inputStyle, minHeight: "4.5rem" }}>Long answer</div>
      )}
      {(field.type === "dropdown") && (
        <div style={{ ...inputStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Select an option</span>
          <span style={{ color: primary }}>▾</span>
        </div>
      )}
      {(field.type === "radio" || field.type === "checkbox") && field.options && (
        <div className="space-y-2">
          {field.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "#ffffffcc" }}>
              <div style={{ width: "1rem", height: "1rem", borderRadius: field.type === "radio" ? "50%" : "0.25rem", border: `1px solid ${primary}60`, flexShrink: 0 }} />
              {opt}
            </div>
          ))}
        </div>
      )}
      {field.type === "file" && (
        <div style={{ ...inputStyle, textAlign: "center", padding: "1rem" }}>
          <span style={{ color: primary }}>📎</span> Upload file
        </div>
      )}
    </div>
  );
}

function ParticipantsGauge({
  registered, max, primary, accent,
}: {
  registered: number;
  max: number;
  primary: string;
  accent: string;
}) {
  const pct = Math.min((registered / max) * 100, 100);
  const spotsLeft = Math.max(max - registered, 0);
  const isFull = registered >= max;

  const gaugeStroke = pct >= 90 ? "#ff6568" : pct >= 70 ? "#f99c00" : primary;

  const R = 54;
  const cx = 64;
  const cy = 64;
  const startAngle = -210;
  const totalAngle = 240;
  const sweepAngle = (pct / 100) * totalAngle;

  function polarToXY(angle: number, r: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const arcStart = polarToXY(startAngle, R);
  const arcEnd = polarToXY(startAngle + totalAngle, R);
  const fillEnd = polarToXY(startAngle + sweepAngle, R);

  const trackPath = `M ${arcStart.x} ${arcStart.y} A ${R} ${R} 0 1 1 ${arcEnd.x} ${arcEnd.y}`;
  const fillPath = pct > 0
    ? `M ${arcStart.x} ${arcStart.y} A ${R} ${R} 0 ${sweepAngle > 180 ? 1 : 0} 1 ${fillEnd.x} ${fillEnd.y}`
    : "";

  void accent;

  return (
    <div className="mx-auto mt-4 mb-2" style={{ maxWidth: "200px" }}>
      <div className="relative flex items-center justify-center">
        <svg width="128" height="100" viewBox="0 0 128 100">
          <path d={trackPath} fill="none" stroke="#ffffff15" strokeWidth="10" strokeLinecap="round" />
          {fillPath && (
            <path d={fillPath} fill="none" stroke={gaugeStroke} strokeWidth="10" strokeLinecap="round" />
          )}
          <text x={cx} y={cy + 4} textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">
            {Math.round(pct)}%
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fill="#ffffff80" fontSize="7">
            filled
          </text>
        </svg>
      </div>
      <div className="text-center -mt-2">
        {isFull ? (
          <p className="text-xs font-semibold" style={{ color: "#ff6568" }}>Fully booked</p>
        ) : (
          <p className="text-xs" style={{ color: "#ffffff80" }}>
            <span className="font-semibold text-white">{spotsLeft}</span> spot{spotsLeft !== 1 ? "s" : ""} left of {max}
          </p>
        )}
      </div>
    </div>
  );
}

function Countdown({ start, primary }: { start: Date; primary: string }) {
  const [now, setNow] = useState(() => new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const diff = start.getTime() - now.getTime();
  const started = diff <= 0;

  if (started) {
    return (
      <div className="text-center rounded-2xl p-4" style={{ background: "rgba(0,199,88,0.1)", border: "1px solid rgba(0,199,88,0.3)" }}>
        <p className="font-semibold" style={{ color: "#00c758" }}>🟢 Event is live</p>
      </div>
    );
  }

  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const pad  = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="text-center rounded-2xl p-6" style={{ background: `${primary}15`, border: `1px solid ${primary}30` }}>
      <p className="text-xs uppercase tracking-widest mb-4" style={{ color: primary }}>Starts in</p>
      <div className="flex items-end justify-center gap-2 sm:gap-4">
        {[
          { val: days, label: "days" },
          { val: hrs,  label: "hrs"  },
          { val: mins, label: "min"  },
          { val: secs, label: "sec"  },
        ].map(({ val, label }, i, arr) => (
          <div key={label} className="flex items-end gap-2 sm:gap-4">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold tabular-nums leading-none">{pad(val)}</p>
              <p className="text-xs mt-1" style={{ color: "#ffffff60" }}>{label}</p>
            </div>
            {i < arr.length - 1 && (
              <p className="text-2xl font-bold mb-5" style={{ color: "#ffffff40" }}>:</p>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs mt-4" style={{ color: "#ffffff60" }}>
        {start.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        {" · "}
        {start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}
