"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FormModal } from "@/components/admin/form-modal";
import { TextInput, TextArea, CheckboxInput, SelectInput } from "@/components/admin/form-fields";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import type { JournalArticle } from "@/lib/supabase/types";

const CATEGORIES = [
  { label: "City Spotlights", value: "city-spotlights" },
  { label: "Scene Reports", value: "scene-reports" },
  { label: "Insider Interviews", value: "insider-interviews" },
  { label: "Trend Watch", value: "trend-watch" },
];

const EMPTY: Partial<JournalArticle> = {
  slug: "",
  title: "",
  category: "",
  hero_image_url: "",
  content: "",
  excerpt: "",
  published_at: "",
  published: true,
  meta_title: "",
  meta_description: "",
};

const columns: Column<JournalArticle>[] = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  {
    key: "published_at",
    label: "Date",
    render: (row) => row.published_at ? new Date(row.published_at).toLocaleDateString() : "",
  },
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

export default function JournalPage() {
  const [data, setData] = useState<JournalArticle[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<JournalArticle>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("ah_journal_articles").select("*").order("published_at", { ascending: false });
    setData(data ?? []);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing({ ...EMPTY }); setModal(true); }
  function openEdit(row: JournalArticle) { setEditing({ ...row }); setModal(true); }

  async function handleDelete(id: string) {
    await supabase.from("ah_journal_articles").delete().eq("id", id);
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
      await supabase.from("ah_journal_articles").update(payload).eq("id", id);
    } else {
      await supabase.from("ah_journal_articles").insert(payload);
    }
    setLoading(false);
    setModal(false);
    load();
  }

  function set<K extends keyof JournalArticle>(key: K, value: JournalArticle[K]) {
    setEditing((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <DataTable
        title="Journal"
        columns={columns}
        data={data}
        onAdd={openNew}
        onEdit={openEdit}
        onDelete={handleDelete}
        searchField="title"
      />

      <FormModal
        title={editing.id ? "Edit Article" : "New Article"}
        open={modal}
        onClose={() => setModal(false)}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Title" name="title" value={editing.title ?? ""} onChange={(v) => set("title", v)} required />
          <TextInput label="Slug" name="slug" value={editing.slug ?? ""} onChange={(v) => set("slug", v)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectInput label="Category" name="category" value={editing.category ?? ""} onChange={(v) => set("category", v)} options={CATEGORIES} />
          <TextInput label="Published Date" name="published_at" value={editing.published_at?.split("T")[0] ?? ""} onChange={(v) => set("published_at", v)} type="date" />
        </div>
        <ImageUpload label="Hero Image" value={editing.hero_image_url ?? ""} onChange={(v) => set("hero_image_url", v)} />
        <TextArea label="Excerpt" name="excerpt" value={editing.excerpt ?? ""} onChange={(v) => set("excerpt", v)} rows={2} />
        <RichTextEditor label="Content" value={editing.content ?? ""} onChange={(v) => set("content", v)} />
        <CheckboxInput label="Published" name="published" checked={editing.published ?? true} onChange={(v) => set("published", v)} />
        <div className="border-t border-[var(--border)] pt-4 mt-2">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-3">SEO Metadata</p>
          <div className="flex flex-col gap-3">
            <TextInput label="Meta Title" name="meta_title" value={editing.meta_title ?? ""} onChange={(v) => set("meta_title", v)} placeholder="Override page title for search engines" />
            <TextArea label="Meta Description" name="meta_description" value={editing.meta_description ?? ""} onChange={(v) => set("meta_description", v)} rows={2} placeholder="Override description for search engines" />
          </div>
        </div>
      </FormModal>
    </div>
  );
}
