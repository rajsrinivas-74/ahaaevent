"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Event } from "@/lib/types";
import { useToast } from "@/components/toast";
import { CardSkeleton } from "@/components/skeleton";

type Prize = { place: number; label: string; value: string };
type Criterion = { name: string; weight: number; expectations: string };
type SaveStatus = "idle" | "saving" | "saved" | "error";

const inp = "w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none";
const inpStyle = { background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" };

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const map = {
    saving: { text: "Saving…",    color: "var(--color-text-muted)" },
    saved:  { text: "Saved ✓",    color: "#00c758" },
    error:  { text: "Save failed", color: "#ff6568" },
  };
  const { text, color } = map[status as Exclude<SaveStatus, "idle">];
  return <span className="text-xs font-medium" style={{ color }}>{text}</span>;
}

export default function EvaluationPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [loading, setLoading]       = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const [criteria, setCriteria]     = useState<Criterion[]>([]);
  const [prizes, setPrizes]         = useState<Prize[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef  = useRef(false);
  const savedRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then(r => r.json())
      .then((e: Event) => {
        setCriteria(e.judging_criteria || []);
        setPrizes(e.prizes || []);
        setLoading(false);
      });
  }, [eventId]);

  async function save(c: Criterion[], p: Prize[]) {
    setSaveStatus("saving");
    const total = c.reduce((s, x) => s + x.weight, 0);
    const normalised = total > 0
      ? c.map(x => ({ ...x, weight: Math.round((x.weight / total) * 100) }))
      : c;
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judging_criteria: normalised.length > 0 ? normalised : null,
          prizes: p.length > 0 ? p : null,
        }),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
      if (savedRef.current) clearTimeout(savedRef.current);
      savedRef.current = setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    }
  }

  function debounce(c: Criterion[], p: Prize[]) {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(c, p), 1500);
  }

  function updateCriteria(next: Criterion[]) {
    setCriteria(next);
    debounce(next, prizes);
  }

  function updatePrizes(next: Prize[]) {
    setPrizes(next);
    debounce(criteria, next);
  }

  function addCriterion() {
    updateCriteria([...criteria, { name: "", weight: 20, expectations: "" }]);
  }

  function addPrize() {
    const ordinal = ["1st", "2nd", "3rd"][prizes.length] ?? `${prizes.length + 1}th`;
    updatePrizes([...prizes, { place: prizes.length + 1, label: `${ordinal} Place`, value: "" }]);
  }

  const total = criteria.reduce((s, c) => s + c.weight, 0);

  if (loading) return (
    <div className="max-w-2xl space-y-4">
      <div className="h-7 w-48 rounded animate-pulse" style={{ background: "var(--color-border)" }} />
      <CardSkeleton rows={4} />
      <CardSkeleton rows={3} />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Evaluation</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-sec)" }}>
            Judging criteria and prizes — used by Ahaa IQ for scoring
          </p>
        </div>
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Judging Criteria */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Judging Criteria</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Weights are auto-normalised to 100% on save
            </p>
          </div>
          <button type="button" onClick={addCriterion} className="btn-secondary px-3 py-1 text-xs">
            + Add Criterion
          </button>
        </div>

        {criteria.length === 0 ? (
          <div className="text-center py-8 rounded-xl" style={{ border: "1px dashed var(--color-border)" }}>
            <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>
              No criteria yet — Ahaa IQ needs these to score submissions
            </p>
            <button onClick={addCriterion} className="btn-primary text-sm px-4 py-2">
              Add First Criterion
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {criteria.map((c, i) => (
              <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                {/* Name + weight row */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text" value={c.name}
                    onChange={e => updateCriteria(criteria.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    placeholder="Criterion name e.g. Innovation"
                    className={inp} style={{ ...inpStyle, flex: "1 1 auto" }}
                  />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number" value={c.weight} min={1} max={100}
                      onChange={e => updateCriteria(criteria.map((x, j) => j === i ? { ...x, weight: parseInt(e.target.value) || 1 } : x))}
                      className={inp} style={{ ...inpStyle, width: "70px", textAlign: "right" }}
                    />
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>pts</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateCriteria(criteria.filter((_, j) => j !== i))}
                    className="flex-shrink-0 px-2 py-2 rounded-xl text-sm"
                    style={{ background: "rgba(255,101,104,0.1)", color: "#ff6568", border: "1px solid rgba(255,101,104,0.2)" }}
                  >✕</button>
                </div>
                {/* Expectations */}
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
                    What are you looking for? <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>(used by Ahaa IQ to score)</span>
                  </label>
                  <textarea
                    value={c.expectations}
                    onChange={e => updateCriteria(criteria.map((x, j) => j === i ? { ...x, expectations: e.target.value } : x))}
                    rows={2}
                    placeholder={`Describe what a strong ${c.name || "submission"} looks like — e.g. "Is the problem novel? Does it address an unmet need?"`}
                    className="w-full rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none"
                    style={inpStyle}
                  />
                </div>
              </div>
            ))}

            {/* Weight summary */}
            <div className="pt-1 space-y-2">
              {criteria.map((c, i) => (
                c.name.trim() ? (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs w-32 truncate flex-shrink-0" style={{ color: "var(--color-text-sec)" }}>{c.name}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${total > 0 ? Math.round((c.weight / total) * 100) : 0}%`,
                          background: "linear-gradient(90deg, var(--color-blue), var(--color-purple))",
                        }}
                      />
                    </div>
                    <span className="text-xs flex-shrink-0 font-semibold" style={{ color: "var(--color-blue)", minWidth: "36px", textAlign: "right" }}>
                      {total > 0 ? Math.round((c.weight / total) * 100) : 0}%
                    </span>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prizes */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Prizes</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Shown on the public event page</p>
          </div>
          <button type="button" onClick={addPrize} className="btn-secondary px-3 py-1 text-xs">
            + Add Prize
          </button>
        </div>

        {prizes.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--color-text-muted)" }}>
            No prizes added yet
          </p>
        ) : (
          <div className="space-y-3">
            {prizes.map((p, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="flex-shrink-0 text-lg">{i === 0 ? "🏆" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎖"}</span>
                <input
                  type="text" value={p.label}
                  onChange={e => updatePrizes(prizes.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                  placeholder="Label (e.g. Winner)"
                  className={inp} style={{ ...inpStyle, flex: "1 1 35%" }}
                />
                <input
                  type="text" value={p.value}
                  onChange={e => updatePrizes(prizes.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                  placeholder="Value (e.g. ₹50,000 + Cloud Credits)"
                  className={inp} style={{ ...inpStyle, flex: "1 1 50%" }}
                />
                <button
                  type="button"
                  onClick={() => updatePrizes(prizes.filter((_, j) => j !== i).map((x, j) => ({ ...x, place: j + 1 })))}
                  className="flex-shrink-0 px-2 py-2 rounded-xl text-sm"
                  style={{ background: "rgba(255,101,104,0.1)", color: "#ff6568", border: "1px solid rgba(255,101,104,0.2)" }}
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next step */}
      <div className="flex justify-end">
        <Link href={`/events/${eventId}/preview`} className="btn-secondary text-sm">
          Preview Event →
        </Link>
      </div>
    </div>
  );
}
