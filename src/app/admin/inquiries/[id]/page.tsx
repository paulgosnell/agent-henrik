"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import type { Inquiry, InquiryNote } from "@/lib/supabase/types";

const STATUSES = ["new", "contacted", "qualified", "converted", "closed"] as const;

export default function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [notes, setNotes] = useState<InquiryNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from("ah_inquiries")
      .select("*")
      .eq("id", id)
      .single();
    setInquiry(data);

    const { data: notesData } = await supabase
      .from("ah_inquiry_notes")
      .select("*")
      .eq("inquiry_id", id)
      .order("created_at", { ascending: true });
    setNotes(notesData ?? []);
  }

  useEffect(() => { load(); }, [id]);

  async function updateStatus(status: string) {
    await supabase.from("ah_inquiries").update({ status }).eq("id", id);
    load();
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSaving(true);
    await supabase.from("ah_inquiry_notes").insert({
      inquiry_id: id,
      note: newNote.trim(),
    });
    setNewNote("");
    setSaving(false);
    load();
  }

  if (!inquiry) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--muted-foreground)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/inquiries"
        className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Inquiries
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light font-serif mb-1">{inquiry.name}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{inquiry.email}</p>
        </div>
        <select
          value={inquiry.status ?? "new"}
          onChange={(e) => updateStatus(e.target.value)}
          className="px-3 py-2 text-sm bg-[var(--muted)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none cursor-pointer"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <InfoCard label="Phone" value={inquiry.phone} />
        <InfoCard label="Destination" value={inquiry.destination} />
        <InfoCard label="Travel Dates" value={inquiry.travel_dates} />
        <InfoCard label="Group Size" value={inquiry.group_size?.toString()} />
        <InfoCard label="Investment Level" value={inquiry.investment_level} />
        <InfoCard
          label="Submitted"
          value={new Date(inquiry.created_at).toLocaleString()}
        />
      </div>

      {inquiry.preferences && (
        <div className="mb-8">
          <h3 className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
            Preferences
          </h3>
          <p className="text-sm p-4 border border-[var(--border)] rounded bg-[var(--muted)]">
            {inquiry.preferences}
          </p>
        </div>
      )}

      {inquiry.ai_draft_itinerary && (
        <div className="mb-8">
          <h3 className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
            AI Draft Itinerary
          </h3>
          <div
            className="text-sm p-4 border border-[var(--border)] rounded bg-[var(--muted)] prose prose-sm prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: inquiry.ai_draft_itinerary }}
          />
        </div>
      )}

      <div>
        <h3 className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
          Notes
        </h3>
        <div className="flex flex-col gap-3 mb-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 border border-[var(--border)] rounded bg-[var(--muted)]"
            >
              <p className="text-sm mb-1">{note.note}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {new Date(note.created_at).toLocaleString()}
              </p>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)]">No notes yet</p>
          )}
        </div>

        <form onSubmit={addNote} className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 px-3 py-2 text-sm bg-[var(--muted)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
          />
          <button
            type="submit"
            disabled={saving || !newNote.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm">{value || "-"}</p>
    </div>
  );
}
