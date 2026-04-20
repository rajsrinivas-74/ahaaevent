"use client";

import { useState } from "react";
import type { Event, EventType, VenueType, JoinCodeMode } from "@/lib/types";

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "hackathon", label: "Hackathon" },
  { value: "ideathon", label: "Ideathon" },
  { value: "pitch_competition", label: "Pitch Competition" },
  { value: "innovation_challenge", label: "Innovation Challenge" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
];

const VENUE_TYPES: { value: VenueType; label: string }[] = [
  { value: "online", label: "Online" },
  { value: "in_person", label: "In Person" },
  { value: "hybrid", label: "Hybrid" },
];

interface EventFormProps {
  initialData?: Event | null;
  mode?: "create" | "edit";
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export function EventForm({ initialData, mode = "create", onSubmit }: EventFormProps) {
  const isPublished = initialData?.status === "live";

  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<EventType>(initialData?.type || "hackathon");
  const [theme, setTheme] = useState(initialData?.theme || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [endDate, setEndDate] = useState(initialData?.end_date || "");
  const [timezone, setTimezone] = useState(initialData?.timezone || "Asia/Kolkata");
  const [venueType, setVenueType] = useState<VenueType | "">(initialData?.venue_type || "");
  const [meetingLink, setMeetingLink] = useState(initialData?.meeting_link || "");
  const [maxParticipants, setMaxParticipants] = useState(initialData?.max_participants?.toString() || "");
  const [joinCodeMode, setJoinCodeMode] = useState<JoinCodeMode>(initialData?.join_code_mode || "auto");
  const [joinCode, setJoinCode] = useState(initialData?.join_code || "");
  const [joinCodeError, setJoinCodeError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Event name is required";
    if (!type) newErrors.type = "Event type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function checkJoinCode(code: string) {
    if (!code.trim()) return;
    const res = await fetch(`/api/events/check-join-code?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    if (!data.available) {
      setJoinCodeError("This join code is already taken");
    } else {
      setJoinCodeError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (joinCodeMode === "custom" && joinCodeError) return;

    setLoading(true);
    await onSubmit({
      name,
      type,
      theme: theme || null,
      description: description || null,
      tagline: tagline || null,
      start_date: startDate || null,
      end_date: endDate || null,
      timezone,
      venue_type: venueType || null,
      meeting_link: meetingLink || null,
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      join_code_mode: joinCodeMode,
      join_code: joinCodeMode === "custom" ? joinCode : undefined,
    });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Basic Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-gray-800 pb-2">Basic Information</h2>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Event Name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPublished}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">Event Type *</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as EventType)}
            disabled={isPublished}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errors.type && <p className="text-red-400 text-sm mt-1">{errors.type}</p>}
        </div>

        <div>
          <label htmlFor="theme" className="block text-sm font-medium mb-1">Theme</label>
          <input
            id="theme"
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            disabled={isPublished}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="tagline" className="block text-sm font-medium mb-1">Tagline</label>
          <input
            id="tagline"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none"
          />
        </div>
      </section>

      {/* Schedule */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-gray-800 pb-2">Schedule</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">Start Date</label>
            <input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">End Date</label>
            <input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium mb-1">Timezone</label>
          <input
            id="timezone"
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={isPublished}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </section>

      {/* Venue */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-gray-800 pb-2">Venue</h2>

        <div>
          <label htmlFor="venueType" className="block text-sm font-medium mb-1">Venue Type</label>
          <select
            id="venueType"
            value={venueType}
            onChange={(e) => setVenueType(e.target.value as VenueType)}
            disabled={isPublished}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select venue type</option>
            {VENUE_TYPES.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>

        {(venueType === "online" || venueType === "hybrid") && (
          <div>
            <label htmlFor="meetingLink" className="block text-sm font-medium mb-1">Meeting Link</label>
            <input
              id="meetingLink"
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              disabled={isPublished}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="https://"
            />
          </div>
        )}

        <div>
          <label htmlFor="maxParticipants" className="block text-sm font-medium mb-1">Max Participants</label>
          <input
            id="maxParticipants"
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            disabled={isPublished}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            min={1}
          />
        </div>
      </section>

      {/* Join Code */}
      {!isPublished && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-gray-800 pb-2">Join Code</h2>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="joinCodeMode"
                value="auto"
                checked={joinCodeMode === "auto"}
                onChange={() => setJoinCodeMode("auto")}
                className="text-primary"
              />
              <span className="text-sm">Auto-generate</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="joinCodeMode"
                value="custom"
                checked={joinCodeMode === "custom"}
                onChange={() => setJoinCodeMode("custom")}
                className="text-primary"
              />
              <span className="text-sm">Custom code</span>
            </label>
          </div>

          {joinCodeMode === "custom" && (
            <div>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onBlur={() => checkJoinCode(joinCode)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary focus:outline-none"
                placeholder="Enter custom join code"
              />
              {joinCodeError && <p className="text-red-400 text-sm mt-1">{joinCodeError}</p>}
            </div>
          )}
        </section>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Event"}
      </button>
    </form>
  );
}
