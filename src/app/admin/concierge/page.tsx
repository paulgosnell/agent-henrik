"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { ConciergeInstruction } from "@/lib/supabase/types";

const CATEGORIES = [
  { value: "promote", label: "Promote", color: "text-green-400", description: "Things the AI should highlight and recommend" },
  { value: "avoid", label: "Avoid", color: "text-red-400", description: "Things the AI should never say or do" },
  { value: "knowledge", label: "Knowledge", color: "text-blue-400", description: "Facts and context the AI should know" },
  { value: "tone", label: "Tone", color: "text-amber-400", description: "How the AI should communicate" },
  { value: "general", label: "General", color: "text-[var(--muted-foreground)]", description: "Other guidelines" },
] as const;

type Category = typeof CATEGORIES[number]["value"];

const EMPTY: Partial<ConciergeInstruction> = {
  title: "",
  category: "promote",
  instruction: "",
  is_active: true,
  priority: 0,
};

export default function ConciergePage() {
  const [instructions, setInstructions] = useState<ConciergeInstruction[]>([]);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<ConciergeInstruction>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from("ah_concierge_instructions")
      .select("*")
      .order("priority", { ascending: false });
    setInstructions(data ?? []);
  }

  useEffect(() => { load(); }, []);

  const filtered = filter === "all"
    ? instructions
    : instructions.filter((i) => i.category === filter);

  async function toggleActive(id: string, current: boolean) {
    await supabase
      .from("ah_concierge_instructions")
      .update({ is_active: !current, updated_at: new Date().toISOString() })
      .eq("id", id);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this instruction?")) return;
    await supabase.from("ah_concierge_instructions").delete().eq("id", id);
    load();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { id, created_at, updated_at, ...rest } = editing as ConciergeInstruction;
    const payload = { ...rest, updated_at: new Date().toISOString() };

    if (id) {
      await supabase.from("ah_concierge_instructions").update(payload).eq("id", id);
    } else {
      await supabase.from("ah_concierge_instructions").insert(payload);
    }
    setLoading(false);
    setModal(false);
    load();
  }

  function getCategoryMeta(cat: string) {
    return CATEGORIES.find((c) => c.value === cat) || CATEGORIES[4];
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-light">Concierge Settings</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Control what Agent Henrik says and knows. Instructions are injected into the AI system prompt.
          </p>
        </div>
        <button
          onClick={() => { setEditing({ ...EMPTY }); setModal(true); }}
          className="flex items-center gap-2 rounded bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition-colors hover:opacity-90"
        >
          <Plus size={16} />
          Add Instruction
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`rounded px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
            filter === "all"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          All ({instructions.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = instructions.filter((i) => i.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`rounded px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                filter === cat.value
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Instructions list */}
      {filtered.length === 0 ? (
        <div className="rounded border border-[var(--border)] bg-[var(--muted)] p-8 text-center text-sm text-[var(--muted-foreground)]">
          No instructions yet. Add one to start customizing Agent Henrik&apos;s behavior.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => {
            const meta = getCategoryMeta(item.category);
            return (
              <div
                key={item.id}
                className={`rounded border border-[var(--border)] bg-[var(--muted)] p-4 transition-opacity ${
                  !item.is_active ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs uppercase tracking-wider font-medium ${meta.color}`}>
                        {meta.label}
                      </span>
                      {item.priority > 0 && (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          Priority: {item.priority}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{item.instruction}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(item.id, item.is_active)}
                      className="p-1.5 rounded hover:bg-[var(--background)]/50 transition-colors"
                      title={item.is_active ? "Disable" : "Enable"}
                    >
                      {item.is_active ? (
                        <ToggleRight size={20} className="text-green-400" />
                      ) : (
                        <ToggleLeft size={20} className="text-[var(--muted-foreground)]" />
                      )}
                    </button>
                    <button
                      onClick={() => { setEditing({ ...item }); setModal(true); }}
                      className="p-1.5 rounded hover:bg-[var(--background)]/50 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded hover:bg-[var(--background)]/50 transition-colors text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl"
          >
            <h2 className="mb-4 font-serif text-lg font-light">
              {editing.id ? "Edit Instruction" : "New Instruction"}
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                  Title *
                </label>
                <input
                  type="text"
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
                  required
                  placeholder="e.g. Always recommend private tours"
                  className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                    Category *
                  </label>
                  <select
                    value={editing.category ?? "promote"}
                    onChange={(e) => setEditing((p) => ({ ...p, category: e.target.value as Category }))}
                    className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label} — {cat.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={editing.priority ?? 0}
                    onChange={(e) => setEditing((p) => ({ ...p, priority: Number(e.target.value) || 0 }))}
                    className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                  />
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Higher = more prominent in AI prompt</p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                  Instruction *
                </label>
                <textarea
                  value={editing.instruction ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, instruction: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Write the instruction as you'd tell a human concierge..."
                  className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-none resize-y"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="rounded px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
