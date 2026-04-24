"use client";

import { useEffect, useRef, useState } from "react";
import type { EventBranding } from "@/lib/types";

const FONT_PRESETS = ["Inter", "Poppins", "Space Grotesk", "Playfair Display", "JetBrains Mono"];

const sectionLabel = "text-xs font-semibold uppercase tracking-widest mb-4";
const sectionStyle = { color: "var(--color-text-muted)" };

interface BrandingFormProps {
  eventId: string;
  initialData: EventBranding | null;
  onSave: (data: Partial<EventBranding>) => Promise<void>;
}

function ColorField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}</label>
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-10 h-10 rounded-xl flex-shrink-0 cursor-pointer"
          style={{ background: value, border: "2px solid var(--color-border)" }}
        />
        <input
          ref={ref}
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="hidden"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={7}
          className="flex-1 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none"
          style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
        />
      </div>
    </div>
  );
}

function UploadField({
  label, hint, preview, uploading, accept, onFile,
}: {
  label: string;
  hint: string;
  preview: string;
  uploading: boolean;
  accept: string;
  onFile: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{hint}</p>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="btn-secondary text-sm px-4 py-2"
      >
        {uploading ? "Uploading…" : preview ? "Replace" : "Choose file"}
      </button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
      />
      {preview && (
        <div
          className="mt-2 rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--color-border)", background: "var(--color-bg)" }}
        >
          <img src={preview} alt={label} className="max-h-32 w-full object-contain" />
        </div>
      )}
    </div>
  );
}

export function BrandingForm({ eventId, initialData, onSave }: BrandingFormProps) {
  const [primary, setPrimary] = useState(initialData?.primary_color || "#2563EB");
  const [bg, setBg] = useState(initialData?.background_color || "#0F172A");
  const [accent, setAccent] = useState(initialData?.accent_color || "#1E40AF");
  const [font, setFont] = useState(initialData?.font_preset || "Inter");
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || "");
  const [bannerUrl, setBannerUrl] = useState(initialData?.banner_url || "");
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync form state when initialData changes (e.g. after AI palette applied)
  useEffect(() => {
    if (!initialData) return;
    setPrimary(initialData.primary_color || "#2563EB");
    setBg(initialData.background_color || "#0F172A");
    setAccent(initialData.accent_color || "#1E40AF");
    setFont(initialData.font_preset || "Inter");
    setLogoUrl(initialData.logo_url || "");
    setBannerUrl(initialData.banner_url || "");
  }, [initialData]);

  async function uploadFile(file: File, type: "logo" | "banner") {
    const setUploading = type === "logo" ? setLogoUploading : setBannerUploading;
    const setUrl = type === "logo" ? setLogoUrl : setBannerUrl;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const res = await fetch(`/api/events/${eventId}/upload`, { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setUrl(data.url);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      primary_color: primary,
      background_color: bg,
      accent_color: accent,
      font_preset: font,
      logo_url: logoUrl || null,
      banner_url: bannerUrl || null,
    });
    setSaving(false);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl">
      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-6 min-w-0">
        {/* Images */}
        <div className="card space-y-5">
          <p className={sectionLabel} style={sectionStyle}>Images</p>
          <UploadField
            label="Logo"
            hint="PNG or SVG, displayed top-left on the event page"
            preview={logoUrl}
            uploading={logoUploading}
            accept="image/*"
            onFile={f => uploadFile(f, "logo")}
          />
          <UploadField
            label="Banner"
            hint="Wide image (1200×400 recommended) shown as hero background"
            preview={bannerUrl}
            uploading={bannerUploading}
            accept="image/*"
            onFile={f => uploadFile(f, "banner")}
          />
        </div>

        {/* Colours */}
        <div className="card space-y-5">
          <p className={sectionLabel} style={sectionStyle}>Colours</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ColorField label="Primary" value={primary} onChange={setPrimary} />
            <ColorField label="Background" value={bg} onChange={setBg} />
            <ColorField label="Accent" value={accent} onChange={setAccent} />
          </div>
        </div>

        {/* Typography */}
        <div className="card space-y-4">
          <p className={sectionLabel} style={sectionStyle}>Typography</p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Font Preset</label>
            <select
              value={font}
              onChange={e => setFont(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
            >
              {FONT_PRESETS.map(f => (
                <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
              ))}
            </select>
          </div>
          <div className="pt-2 text-sm" style={{ fontFamily: font, color: "var(--color-text-sec)" }}>
            The quick brown fox jumps over the lazy dog — 1234567890
          </div>
        </div>

        <button type="submit" disabled={saving || logoUploading || bannerUploading} className="btn-primary px-6 py-2.5 font-semibold">
          {saving ? "Saving…" : "Save Branding"}
        </button>
      </form>

      {/* Live Preview */}
      <div className="lg:w-80 flex-shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-muted)" }}>
          Live Preview
        </p>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--color-border)", fontFamily: font }}
        >
          {/* Banner */}
          <div
            className="h-24 relative flex items-end p-3"
            style={{ background: bannerUrl ? `url(${bannerUrl}) center/cover` : bg }}
          >
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
            {logoUrl && (
              <img src={logoUrl} alt="logo" className="relative z-10 h-8 w-8 rounded object-contain" style={{ background: "#fff", padding: "2px" }} />
            )}
          </div>
          {/* Card body */}
          <div className="p-4 space-y-3" style={{ background: bg }}>
            <div className="h-3 rounded w-3/4" style={{ background: primary, opacity: 0.8 }} />
            <div className="h-2 rounded w-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <div className="h-2 rounded w-5/6" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div
              className="mt-4 rounded-lg px-3 py-1.5 text-xs font-semibold text-center"
              style={{ background: primary, color: "#fff" }}
            >
              Register Now
            </div>
            <div className="flex gap-2 mt-2">
              {[accent, `${primary}66`].map((c, i) => (
                <div key={i} className="h-2 rounded flex-1" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: "var(--color-text-muted)" }}>
          Updates as you pick colours
        </p>
      </div>
    </div>
  );
}
