"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormSection, FormField, FormFieldType } from "@/lib/types";
import { useToast } from "@/components/toast";
import { ListSkeleton } from "@/components/skeleton";

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: "short_text", label: "Short Text" },
  { value: "long_text",  label: "Long Text"  },
  { value: "dropdown",   label: "Dropdown"   },
  { value: "radio",      label: "Radio"      },
  { value: "checkbox",   label: "Checkbox"   },
  { value: "file",       label: "File Upload"},
];

const HAS_OPTIONS: FormFieldType[] = ["dropdown", "radio", "checkbox"];

interface FormData {
  sections: FormSection[];
  fields: FormField[];
}

const inp = "w-full rounded-lg px-3 py-2 text-sm";
const inpStyle = { background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" };

export default function FormBuilderPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [data, setData] = useState<FormData>({ sections: [], fields: [] });
  const [loading, setLoading] = useState(true);
  const [showAddField, setShowAddField] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<FormFieldType>("short_text");
  const [fieldSection, setFieldSection] = useState("");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldHelper, setFieldHelper] = useState("");
  const [fieldOptions, setFieldOptions] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const { toast } = useToast();

  // drag state
  const dragId = useRef<string | null>(null);
  const dragOver = useRef<string | null>(null);

  async function load() {
    const res = await fetch(`/api/form?event_id=${eventId}`);
    const d = await res.json();
    setData(d);
    setLoading(false);
  }

  useEffect(() => { load(); }, [eventId]);

  async function addSection() {
    if (!sectionTitle.trim()) return;
    setSaving(true);
    await fetch("/api/form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "section", event_id: eventId, title: sectionTitle }),
    });
    setSectionTitle(""); setShowAddSection(false); setSaving(false);
    toast("Section added");
    load();
  }

  async function addField() {
    if (!fieldLabel.trim()) return;
    setSaving(true);
    await fetch("/api/form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "field", event_id: eventId,
        section_id: fieldSection || null,
        label: fieldLabel, field_type: fieldType,
        helper_text: fieldHelper, required: fieldRequired,
        options: HAS_OPTIONS.includes(fieldType) ? fieldOptions.split("\n").map(o => o.trim()).filter(Boolean) : null,
      }),
    });
    setFieldLabel(""); setFieldType("short_text"); setFieldSection(""); setFieldRequired(false);
    setFieldHelper(""); setFieldOptions(""); setShowAddField(false); setSaving(false);
    toast("Field added");
    load();
  }

  async function saveEditField() {
    if (!editingField) return;
    setSaving(true);
    await fetch(`/api/form/${editingField.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        record_type: "field",
        label: editingField.label,
        helper_text: editingField.helper_text,
        required: editingField.required,
        char_limit: editingField.char_limit,
        options: editingField.options,
      }),
    });
    setEditingField(null); setSaving(false);
    toast("Field updated");
    load();
  }

  async function deleteField(id: string) {
    await fetch(`/api/form/${id}?record_type=field`, { method: "DELETE" });
    toast("Field removed", "info");
    load();
  }

  async function deleteSection(id: string) {
    await fetch(`/api/form/${id}?record_type=section`, { method: "DELETE" });
    toast("Section removed", "info");
    load();
  }

  // Reorder fields by dragging — persists new `order` values
  async function handleDrop(groupFields: FormField[]) {
    const fromId = dragId.current;
    const toId = dragOver.current;
    if (!fromId || !toId || fromId === toId) return;

    const fromIdx = groupFields.findIndex(f => f.id === fromId);
    const toIdx   = groupFields.findIndex(f => f.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...groupFields];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Optimistic update
    const otherFields = data.fields.filter(f => !groupFields.some(g => g.id === f.id));
    setData(d => ({ ...d, fields: [...otherFields, ...reordered] }));

    // Persist orders
    await Promise.all(reordered.map((f, i) =>
      fetch(`/api/form/${f.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record_type: "field", order: i }),
      })
    ));
  }

  if (loading) return (
    <div className="max-w-2xl">
      <div className="mb-6"><div className="h-7 w-36 rounded animate-pulse" style={{ background: "var(--color-border)" }} /></div>
      <ListSkeleton rows={5} />
    </div>
  );

  const ungrouped = data.fields.filter(f => !f.section_id).sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Form Builder</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-sec)" }}>Build the submission form participants fill out</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowAddSection(true); setShowAddField(false); }} className="btn-secondary" style={{ fontSize: "0.8rem" }}>+ Section</button>
          <button onClick={() => { setShowAddField(true); setShowAddSection(false); }} className="btn-primary" style={{ fontSize: "0.8rem" }}>+ Field</button>
        </div>
      </div>

      {showAddSection && (
        <div className="card mb-4 space-y-3">
          <p className="font-semibold text-sm">New Section</p>
          <input value={sectionTitle} onChange={e => setSectionTitle(e.target.value)}
            placeholder="Section title e.g. Team Details" autoFocus
            className={inp} style={inpStyle} />
          <div className="flex gap-2">
            <button onClick={addSection} disabled={saving} className="btn-primary" style={{ fontSize: "0.8rem" }}>{saving ? "Adding…" : "Add Section"}</button>
            <button onClick={() => setShowAddSection(false)} className="btn-secondary" style={{ fontSize: "0.8rem" }}>Cancel</button>
          </div>
        </div>
      )}

      {showAddField && (
        <div className="card mb-4 space-y-3">
          <p className="font-semibold text-sm">New Field</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-text-sec)" }}>Label *</label>
              <input value={fieldLabel} onChange={e => setFieldLabel(e.target.value)}
                placeholder="e.g. Project Name" autoFocus className={inp} style={inpStyle} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-text-sec)" }}>Type</label>
              <select value={fieldType} onChange={e => setFieldType(e.target.value as FormFieldType)}
                className={inp} style={inpStyle}>
                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-text-sec)" }}>Section (optional)</label>
              <select value={fieldSection} onChange={e => setFieldSection(e.target.value)} className={inp} style={inpStyle}>
                <option value="">No section</option>
                {data.sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-text-sec)" }}>Helper text</label>
              <input value={fieldHelper} onChange={e => setFieldHelper(e.target.value)}
                placeholder="Optional hint" className={inp} style={inpStyle} />
            </div>
          </div>
          {HAS_OPTIONS.includes(fieldType) && (
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-text-sec)" }}>Options (one per line)</label>
              <textarea value={fieldOptions} onChange={e => setFieldOptions(e.target.value)}
                rows={3} placeholder={"Option A\nOption B\nOption C"}
                className={`${inp} resize-none`} style={inpStyle} />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={fieldRequired} onChange={e => setFieldRequired(e.target.checked)} className="accent-blue-500" />
            Required field
          </label>
          <div className="flex gap-2">
            <button onClick={addField} disabled={saving} className="btn-primary" style={{ fontSize: "0.8rem" }}>{saving ? "Adding…" : "Add Field"}</button>
            <button onClick={() => setShowAddField(false)} className="btn-secondary" style={{ fontSize: "0.8rem" }}>Cancel</button>
          </div>
        </div>
      )}

      {data.sections.length === 0 && data.fields.length === 0 ? (
        <div className="text-center py-12" style={{ border: "1px dashed var(--color-border)", borderRadius: "1rem" }}>
          <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>No fields yet</p>
          <button onClick={() => setShowAddField(true)} className="btn-primary">Add your first field</button>
        </div>
      ) : (
        <div className="space-y-4">
          {ungrouped.length > 0 && (
            <FieldGroup
              fields={ungrouped} editingField={editingField}
              setEditingField={setEditingField} onSave={saveEditField}
              onDelete={deleteField} saving={saving}
              dragId={dragId} dragOver={dragOver} onDrop={() => handleDrop(ungrouped)}
            />
          )}
          {data.sections.map(section => {
            const sFields = data.fields.filter(f => f.section_id === section.id).sort((a, b) => a.order - b.order);
            return (
              <div key={section.id}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>{section.title}</p>
                  <button onClick={() => deleteSection(section.id)} className="text-xs" style={{ color: "#ff656870" }}>Remove section</button>
                </div>
                <div className="space-y-2 pl-3" style={{ borderLeft: "2px solid var(--color-border)" }}>
                  {sFields.length === 0 ? (
                    <p className="text-xs py-2" style={{ color: "var(--color-text-muted)" }}>No fields in this section</p>
                  ) : (
                    <FieldGroup
                      fields={sFields} editingField={editingField}
                      setEditingField={setEditingField} onSave={saveEditField}
                      onDelete={deleteField} saving={saving}
                      dragId={dragId} dragOver={dragOver} onDrop={() => handleDrop(sFields)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FieldGroup({
  fields, editingField, setEditingField, onSave, onDelete, saving, dragId, dragOver, onDrop,
}: {
  fields: FormField[];
  editingField: FormField | null;
  setEditingField: (f: FormField | null) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  saving: boolean;
  dragId: React.MutableRefObject<string | null>;
  dragOver: React.MutableRefObject<string | null>;
  onDrop: () => void;
}) {
  return (
    <div className="space-y-2">
      {fields.map(field => (
        <FieldRow
          key={field.id} field={field}
          editing={editingField?.id === field.id}
          editingField={editingField} setEditingField={setEditingField}
          onSave={onSave} onDelete={onDelete} saving={saving}
          onDragStart={() => { dragId.current = field.id; }}
          onDragEnter={() => { dragOver.current = field.id; }}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}

function FieldRow({
  field, editing, editingField, setEditingField, onSave, onDelete, saving,
  onDragStart, onDragEnter, onDrop,
}: {
  field: FormField;
  editing: boolean;
  editingField: FormField | null;
  setEditingField: (f: FormField | null) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  saving: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDrop: () => void;
}) {
  const inpS = { background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" };
  const hasOpts = editingField && HAS_OPTIONS.includes(editingField.type);

  if (editing && editingField) {
    return (
      <div className="card space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
          Editing: {FIELD_TYPES.find(t => t.value === editingField.type)?.label}
        </p>
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--color-text-sec)" }}>Label</label>
          <input value={editingField.label}
            onChange={e => setEditingField({ ...editingField, label: e.target.value })}
            className="w-full rounded-lg px-3 py-2 text-sm" style={inpS} autoFocus />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--color-text-sec)" }}>Helper text</label>
          <input value={editingField.helper_text || ""}
            onChange={e => setEditingField({ ...editingField, helper_text: e.target.value })}
            placeholder="Optional hint shown under the field"
            className="w-full rounded-lg px-3 py-2 text-sm" style={inpS} />
        </div>
        {hasOpts && (
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--color-text-sec)" }}>Options (one per line)</label>
            <textarea
              value={(editingField.options || []).join("\n")}
              onChange={e => setEditingField({ ...editingField, options: e.target.value.split("\n").map(o => o.trim()).filter(Boolean) })}
              rows={4} placeholder={"Option A\nOption B\nOption C"}
              className="w-full rounded-lg px-3 py-2 text-sm resize-none" style={inpS} />
          </div>
        )}
        {(editingField.type === "short_text" || editingField.type === "long_text") && (
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--color-text-sec)" }}>Character limit</label>
            <input type="number" min={1}
              value={editingField.char_limit || ""}
              onChange={e => setEditingField({ ...editingField, char_limit: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="No limit" className="w-full rounded-lg px-3 py-2 text-sm" style={inpS} />
          </div>
        )}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={editingField.required}
            onChange={e => setEditingField({ ...editingField, required: e.target.checked })} className="accent-blue-500" />
          Required field
        </label>
        <div className="flex gap-2">
          <button onClick={onSave} disabled={saving} className="btn-primary" style={{ fontSize: "0.75rem" }}>{saving ? "Saving…" : "Save"}</button>
          <button onClick={() => setEditingField(null)} className="btn-secondary" style={{ fontSize: "0.75rem" }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card flex items-center gap-3 cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
      style={{ transition: "opacity 0.15s" }}
    >
      {/* Drag handle */}
      <span className="flex-shrink-0 select-none" style={{ color: "var(--color-text-muted)", cursor: "grab" }}>
        ⠿
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{field.label}</p>
          {field.required && <span className="text-xs" style={{ color: "#ff6568" }}>*</span>}
        </div>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {FIELD_TYPES.find(t => t.value === field.type)?.label}
          {field.helper_text && ` · ${field.helper_text}`}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={() => setEditingField(field)} className="btn-secondary" style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}>Edit</button>
        <button onClick={() => onDelete(field.id)} className="btn-secondary" style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", color: "#ff6568", borderColor: "#ff656840" }}>Delete</button>
      </div>
    </div>
  );
}
