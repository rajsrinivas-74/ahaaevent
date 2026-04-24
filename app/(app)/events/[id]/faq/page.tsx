"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { EventFaq } from "@/lib/types";
import { useToast } from "@/components/toast";
import { ListSkeleton } from "@/components/skeleton";

export default function FaqPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [faqs, setFaqs] = useState<EventFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function load() {
    const res = await fetch(`/api/faq?event_id=${eventId}`);
    const data = await res.json();
    setFaqs(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [eventId]);

  function startAdd() { setAdding(true); setEditingId(null); setQuestion(""); setAnswer(""); }
  function startEdit(faq: EventFaq) { setEditingId(faq.id); setAdding(false); setQuestion(faq.question); setAnswer(faq.answer); }
  function cancel() { setAdding(false); setEditingId(null); setQuestion(""); setAnswer(""); }

  async function handleSave() {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    if (adding) {
      await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, question, answer }),
      });
      toast("FAQ added");
    } else {
      await fetch(`/api/faq/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      toast("FAQ updated");
    }
    setSaving(false);
    cancel();
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/faq/${id}`, { method: "DELETE" });
    toast("FAQ deleted", "info");
    load();
  }

  const inp = "w-full rounded-lg px-3 py-2 text-sm";
  const inpStyle = { background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" };

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">FAQ</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-sec)" }}>Frequently asked questions shown on your public event page</p>
        </div>
        {!adding && !editingId && (
          <button onClick={startAdd} className="btn-primary">+ Add FAQ</button>
        )}
      </div>

      {(adding || editingId) && (
        <div className="card mb-6 space-y-4">
          <h2 className="font-semibold text-sm">{adding ? "New FAQ" : "Edit FAQ"}</h2>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-sec)" }}>Question</label>
            <input value={question} onChange={e => setQuestion(e.target.value)}
              className={inp} style={inpStyle} placeholder="e.g. Who can participate?" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-sec)" }}>Answer</label>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)}
              rows={4} className={`${inp} resize-none`} style={inpStyle} placeholder="Provide a clear answer…" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save"}</button>
            <button onClick={cancel} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Next step prompt */}
      {!adding && !editingId && (
        <div className="flex justify-end mb-4">
          <Link href={`/events/${eventId}/preview`} className="btn-secondary" style={{ fontSize: "0.8rem" }}>
            Preview Event →
          </Link>
        </div>
      )}

      {loading ? <ListSkeleton rows={3} /> : faqs.length === 0 && !adding ? (
        <div className="text-center py-12" style={{ border: "1px dashed var(--color-border)", borderRadius: "1rem" }}>
          <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>No FAQs yet</p>
          <button onClick={startAdd} className="btn-primary">Add your first FAQ</button>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map(faq => (
            <div key={faq.id} className="card">
              {editingId !== faq.id && (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{faq.question}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-sec)" }}>{faq.answer}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(faq)} className="btn-secondary" style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}>Edit</button>
                    <button onClick={() => handleDelete(faq.id)} className="btn-secondary" style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", color: "#ff6568", borderColor: "#ff656840" }}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
