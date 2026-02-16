"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FormModal } from "@/components/admin/form-modal";
import { TextInput, TextArea, NumberInput, CheckboxInput } from "@/components/admin/form-fields";
import { TagInput } from "@/components/admin/tag-input";
import type { Theme } from "@/lib/supabase/types";

const EMPTY: Partial<Theme> = {
  slug: "",
  title: "",
  definition: "",
  tagline: "",
  includes: [],
  activities: [],
  purpose: "",
  arrival_elements: [],
  immersion_elements: [],
  climax_elements: [],
  reflection_elements: [],
  tone_keywords: [],
  emphasize: [],
  avoid: [],
  image_url: "",
  video_url: "",
  display_order: 0,
  published: true,
};

const columns: Column<Theme>[] = [
  { key: "title", label: "Title" },
  { key: "slug", label: "Slug" },
  { key: "display_order", label: "Order" },
  {
    key: "published",
    label: "Status",
    render: (row) => (
      <span className={row.published ? "text-green-400" : "text-[var(--muted-foreground)]"}>
        {row.published ? "Published" : "Draft"}
      </span>
    ),
  },
];

export default function ThemesPage() {
  const [data, setData] = useState<Theme[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Theme>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("ah_themes").select("*").order("display_order");
    setData(data ?? []);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing({ ...EMPTY });
    setModal(true);
  }

  function openEdit(row: Theme) {
    setEditing({ ...row });
    setModal(true);
  }

  async function handleDelete(id: string) {
    await supabase.from("ah_themes").delete().eq("id", id);
    load();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { id, ...rest } = editing;
    // Clean up empty strings to null
    const payload = Object.fromEntries(
      Object.entries(rest).map(([k, v]) => [k, v === "" ? null : v])
    );

    if (id) {
      await supabase.from("ah_themes").update(payload).eq("id", id);
    } else {
      await supabase.from("ah_themes").insert(payload);
    }
    setLoading(false);
    setModal(false);
    load();
  }

  function set<K extends keyof Theme>(key: K, value: Theme[K]) {
    setEditing((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <DataTable
        title="Themes"
        columns={columns}
        data={data}
        onAdd={openNew}
        onEdit={openEdit}
        onDelete={handleDelete}
        searchField="title"
      />

      <FormModal
        title={editing.id ? "Edit Theme" : "New Theme"}
        open={modal}
        onClose={() => setModal(false)}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Title" name="title" value={editing.title ?? ""} onChange={(v) => set("title", v)} required />
          <TextInput label="Slug" name="slug" value={editing.slug ?? ""} onChange={(v) => set("slug", v)} required />
        </div>
        <TextInput label="Tagline" name="tagline" value={editing.tagline ?? ""} onChange={(v) => set("tagline", v)} />
        <TextArea label="Definition" name="definition" value={editing.definition ?? ""} onChange={(v) => set("definition", v)} />
        <TextArea label="Purpose" name="purpose" value={editing.purpose ?? ""} onChange={(v) => set("purpose", v)} />
        <TagInput label="Includes" value={editing.includes ?? []} onChange={(v) => set("includes", v)} />
        <TagInput label="Activities" value={editing.activities ?? []} onChange={(v) => set("activities", v)} />
        <TagInput label="Arrival Elements" value={editing.arrival_elements ?? []} onChange={(v) => set("arrival_elements", v)} />
        <TagInput label="Immersion Elements" value={editing.immersion_elements ?? []} onChange={(v) => set("immersion_elements", v)} />
        <TagInput label="Climax Elements" value={editing.climax_elements ?? []} onChange={(v) => set("climax_elements", v)} />
        <TagInput label="Reflection Elements" value={editing.reflection_elements ?? []} onChange={(v) => set("reflection_elements", v)} />
        <TagInput label="Tone Keywords" value={editing.tone_keywords ?? []} onChange={(v) => set("tone_keywords", v)} />
        <TagInput label="Emphasize" value={editing.emphasize ?? []} onChange={(v) => set("emphasize", v)} />
        <TagInput label="Avoid" value={editing.avoid ?? []} onChange={(v) => set("avoid", v)} />
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Image URL" name="image_url" value={editing.image_url ?? ""} onChange={(v) => set("image_url", v)} type="url" />
          <TextInput label="Video URL" name="video_url" value={editing.video_url ?? ""} onChange={(v) => set("video_url", v)} type="url" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumberInput label="Display Order" name="display_order" value={editing.display_order ?? 0} onChange={(v) => set("display_order", v ?? 0)} />
          <CheckboxInput label="Published" name="published" checked={editing.published ?? true} onChange={(v) => set("published", v)} />
        </div>
      </FormModal>
    </div>
  );
}
