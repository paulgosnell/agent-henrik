"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FormModal } from "@/components/admin/form-modal";
import { TextInput, TextArea, NumberInput, CheckboxInput } from "@/components/admin/form-fields";
import { TagInput } from "@/components/admin/tag-input";
import { ImageUpload } from "@/components/admin/image-upload";
import type { Storyworld } from "@/lib/supabase/types";

const EMPTY: Partial<Storyworld> = {
  slug: "",
  name: "",
  region: "",
  atmosphere: "",
  arrival_mood: "",
  immersion_zones: [],
  climax_moments: [],
  reflection_moments: [],
  suggested_theme_ids: [],
  hero_image_url: "",
  hero_video_url: "",
  latitude: null,
  longitude: null,
  published: true,
  display_order: 0,
  meta_title: "",
  meta_description: "",
};

const columns: Column<Storyworld>[] = [
  { key: "name", label: "Name" },
  { key: "region", label: "Region" },
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

export default function StoryworldsPage() {
  const [data, setData] = useState<Storyworld[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Storyworld>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("ah_storyworlds").select("*").order("display_order");
    setData(data ?? []);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing({ ...EMPTY }); setModal(true); }
  function openEdit(row: Storyworld) { setEditing({ ...row }); setModal(true); }

  async function handleDelete(id: string) {
    await supabase.from("ah_storyworlds").delete().eq("id", id);
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
      await supabase.from("ah_storyworlds").update(payload).eq("id", id);
    } else {
      await supabase.from("ah_storyworlds").insert(payload);
    }
    setLoading(false);
    setModal(false);
    load();
  }

  function set<K extends keyof Storyworld>(key: K, value: Storyworld[K]) {
    setEditing((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <DataTable
        title="Storyworlds"
        columns={columns}
        data={data}
        onAdd={openNew}
        onEdit={openEdit}
        onDelete={handleDelete}
        searchField="name"
      />

      <FormModal
        title={editing.id ? "Edit Storyworld" : "New Storyworld"}
        open={modal}
        onClose={() => setModal(false)}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Name" name="name" value={editing.name ?? ""} onChange={(v) => set("name", v)} required />
          <TextInput label="Slug" name="slug" value={editing.slug ?? ""} onChange={(v) => set("slug", v)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Region" name="region" value={editing.region ?? ""} onChange={(v) => set("region", v)} />
          <TextArea label="Atmosphere" name="atmosphere" value={editing.atmosphere ?? ""} onChange={(v) => set("atmosphere", v)} rows={2} />
        </div>
        <TextArea label="Arrival Mood" name="arrival_mood" value={editing.arrival_mood ?? ""} onChange={(v) => set("arrival_mood", v)} rows={2} />
        <TagInput label="Immersion Zones" value={editing.immersion_zones ?? []} onChange={(v) => set("immersion_zones", v)} />
        <TagInput label="Climax Moments" value={editing.climax_moments ?? []} onChange={(v) => set("climax_moments", v)} />
        <TagInput label="Reflection Moments" value={editing.reflection_moments ?? []} onChange={(v) => set("reflection_moments", v)} />
        <TagInput label="Suggested Theme IDs" value={editing.suggested_theme_ids ?? []} onChange={(v) => set("suggested_theme_ids", v)} />
        <ImageUpload label="Hero Image" value={editing.hero_image_url ?? ""} onChange={(v) => set("hero_image_url", v)} />
        <TextInput label="Hero Video URL" name="hero_video_url" value={editing.hero_video_url ?? ""} onChange={(v) => set("hero_video_url", v)} type="url" />
        <div className="grid grid-cols-2 gap-4">
          <NumberInput label="Latitude" name="latitude" value={editing.latitude ?? null} onChange={(v) => set("latitude", v)} />
          <NumberInput label="Longitude" name="longitude" value={editing.longitude ?? null} onChange={(v) => set("longitude", v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumberInput label="Display Order" name="display_order" value={editing.display_order ?? 0} onChange={(v) => set("display_order", v ?? 0)} />
          <CheckboxInput label="Published" name="published" checked={editing.published ?? true} onChange={(v) => set("published", v)} />
        </div>
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
