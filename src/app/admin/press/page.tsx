"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FormModal } from "@/components/admin/form-modal";
import { TextInput, TextArea, NumberInput } from "@/components/admin/form-fields";
import type { PressItem } from "@/lib/supabase/types";

const EMPTY: Partial<PressItem> = {
  title: "",
  source: "",
  quote: "",
  published_at: "",
  pdf_url: "",
  thumbnail_url: "",
  video_url: "",
  display_order: 0,
};

const columns: Column<PressItem>[] = [
  { key: "title", label: "Title" },
  { key: "source", label: "Source" },
  { key: "published_at", label: "Date" },
  { key: "display_order", label: "Order" },
];

export default function PressPage() {
  const [data, setData] = useState<PressItem[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<PressItem>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("ah_press_items").select("*").order("display_order");
    setData(data ?? []);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing({ ...EMPTY }); setModal(true); }
  function openEdit(row: PressItem) { setEditing({ ...row }); setModal(true); }

  async function handleDelete(id: string) {
    await supabase.from("ah_press_items").delete().eq("id", id);
    load();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { id, ...rest } = editing;
    const payload = Object.fromEntries(
      Object.entries(rest).map(([k, v]) => [k, v === "" ? null : v])
    );
    if (id) {
      await supabase.from("ah_press_items").update(payload).eq("id", id);
    } else {
      await supabase.from("ah_press_items").insert(payload);
    }
    setLoading(false);
    setModal(false);
    load();
  }

  function set<K extends keyof PressItem>(key: K, value: PressItem[K]) {
    setEditing((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <DataTable
        title="Press"
        columns={columns}
        data={data}
        onAdd={openNew}
        onEdit={openEdit}
        onDelete={handleDelete}
        searchField="title"
      />

      <FormModal
        title={editing.id ? "Edit Press Item" : "New Press Item"}
        open={modal}
        onClose={() => setModal(false)}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <TextInput label="Title" name="title" value={editing.title ?? ""} onChange={(v) => set("title", v)} required />
        <TextInput label="Source" name="source" value={editing.source ?? ""} onChange={(v) => set("source", v)} required />
        <TextArea label="Quote" name="quote" value={editing.quote ?? ""} onChange={(v) => set("quote", v)} rows={3} />
        <TextInput label="Published Date" name="published_at" value={editing.published_at ?? ""} onChange={(v) => set("published_at", v)} type="date" />
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="PDF URL" name="pdf_url" value={editing.pdf_url ?? ""} onChange={(v) => set("pdf_url", v)} type="url" />
          <TextInput label="Thumbnail URL" name="thumbnail_url" value={editing.thumbnail_url ?? ""} onChange={(v) => set("thumbnail_url", v)} type="url" />
        </div>
        <TextInput label="Video URL" name="video_url" value={editing.video_url ?? ""} onChange={(v) => set("video_url", v)} type="url" />
        <NumberInput label="Display Order" name="display_order" value={editing.display_order ?? 0} onChange={(v) => set("display_order", v ?? 0)} />
      </FormModal>
    </div>
  );
}
