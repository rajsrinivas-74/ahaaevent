"use client";

import { useState } from "react";
import type { EventBranding } from "@/lib/types";

const FONT_PRESETS = ["Inter", "Poppins", "Space Grotesk", "Playfair Display", "JetBrains Mono"];

interface BrandingFormProps {
  eventId: string;
  initialData: EventBranding | null;
  onSave: (data: Partial<EventBranding>) => Promise<void>;
}

export function BrandingForm({ eventId, initialData, onSave }: BrandingFormProps) {
  const [primaryColor, setPrimaryColor] = useState(initialData?.primary_color || "#2563EB");
  const [backgroundColor, setBackgroundColor] = useState(initialData?.background_color || "#0F172A");
  const [accentColor, setAccentColor] = useState(initialData?.accent_color || "#1E40AF");
  const [fontPreset, setFontPreset] = useState(initialData?.font_preset || "Inter");
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || "");
  const [bannerUrl, setBannerUrl] = useState(initialData?.banner_url || "");
  const [loading, setLoading] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "logo");
    formData.append("eventId", eventId);

    // Upload via Supabase Storage would go through an upload endpoint
    // For now, store as data URL for preview
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setBannerUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSave({
      primary_color: primaryColor,
      background_color: backgroundColor,
      accent_color: accentColor,
      font_preset: fontPreset,
      logo_url: logoUrl || null,
      banner_url: bannerUrl || null,
    });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* File Uploads */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-gray-800 pb-2">Images</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white file:cursor-pointer"
          />
          {logoUrl && (
            <div className="mt-2 w-16 h-16 rounded bg-gray-800 overflow-hidden">
              <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Banner</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white file:cursor-pointer"
          />
          {bannerUrl && (
            <div className="mt-2 w-full h-32 rounded bg-gray-800 overflow-hidden">
              <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </section>

      {/* Colours */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-gray-800 pb-2">Colours</h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Primary</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Background</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Accent</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Font */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-gray-800 pb-2">Typography</h2>

        <div>
          <label htmlFor="fontPreset" className="block text-sm font-medium mb-1">Font</label>
          <select
            id="fontPreset"
            value={fontPreset}
            onChange={(e) => setFontPreset(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none"
          >
            {FONT_PRESETS.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Branding"}
      </button>
    </form>
  );
}
