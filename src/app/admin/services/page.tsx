"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FormModal } from "@/components/admin/form-modal";
import { TextInput, TextArea, NumberInput, CheckboxInput, SelectInput } from "@/components/admin/form-fields";
import { TagInput } from "@/components/admin/tag-input";
import { ImageUpload } from "@/components/admin/image-upload";
import { AiGenerate } from "@/components/admin/ai-generate";
import type { Service } from "@/lib/supabase/types";

const GENERATABLE_FIELDS: (keyof Service)[] = [
  "description", "region_availability", "meta_title", "meta_description",
];

const SERVICE_TYPES = [
  { label: "Curation", value: "curation" },
  { label: "Concierge", value: "concierge" },
  { label: "Experience Design", value: "experience-design" },
  { label: "Group Travel", value: "group-travel" },
  { label: "Corporate", value: "corporate" },
  { label: "Celebration", value: "celebration" },
  { label: "Wellness", value: "wellness" },
];

const EMPTY: Partial<Service> = {
  slug: "",
  title: "",
  description: "",
  service_type: "",
  region_availability: [],
  image_url: "",
  video_url: "",
  display_order: 0,
  published: true,
  meta_title: "",
  meta_description: "",
};

const columns: Column<Service>[] = [
  { key: "title", label: "Title" },
  { key: "service_type", label: "Type" },
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

export default function ServicesPage() {
  const [data, setData] = useState<Service[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Service>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("ah_services").select("*").order("display_order");
    setData(data ?? []);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing({ ...EMPTY }); setModal(true); }
  function openEdit(row: Service) { setEditing({ ...row }); setModal(true); }

  async function handleDelete(id: string) {
    await supabase.from("ah_services").delete().eq("id", id);
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
      await supabase.from("ah_services").update(payload).eq("id", id);
    } else {
      await supabase.from("ah_services").insert(payload);
    }
    setLoading(false);
    setModal(false);
    load();
  }

  function set<K extends keyof Service>(key: K, value: Service[K]) {
    setEditing((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <DataTable
        title="Services"
        columns={columns}
        data={data}
        onAdd={openNew}
        onEdit={openEdit}
        onDelete={handleDelete}
        searchField="title"
      />

      <FormModal
        title={editing.id ? "Edit Service" : "New Service"}
        open={modal}
        onClose={() => setModal(false)}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Title" name="title" value={editing.title ?? ""} onChange={(v) => set("title", v)} required />
          <TextInput label="Slug" name="slug" value={editing.slug ?? ""} onChange={(v) => set("slug", v)} required />
        </div>
        <TextArea label="Description" name="description" value={editing.description ?? ""} onChange={(v) => set("description", v)} rows={4} />
        <SelectInput label="Service Type" name="service_type" value={editing.service_type ?? ""} onChange={(v) => set("service_type", v)} options={SERVICE_TYPES} />
        <TagInput label="Region Availability" value={editing.region_availability ?? []} onChange={(v) => set("region_availability", v)} />
        <ImageUpload label="Image" value={editing.image_url ?? ""} onChange={(v) => set("image_url", v)} />
        <TextInput label="Video URL" name="video_url" value={editing.video_url ?? ""} onChange={(v) => set("video_url", v)} type="url" />
        <div className="grid grid-cols-2 gap-4">
          <NumberInput label="Display Order" name="display_order" value={editing.display_order ?? 0} onChange={(v) => set("display_order", v ?? 0)} />
          <CheckboxInput label="Published" name="published" checked={editing.published ?? true} onChange={(v) => set("published", v)} />
        </div>
        <AiGenerate
          contentType="service"
          existingData={editing as Record<string, unknown>}
          emptyFields={GENERATABLE_FIELDS.filter((f) => {
            const v = editing[f];
            return !v || v === "" || (Array.isArray(v) && v.length === 0);
          })}
          onGenerated={(data) => setEditing((prev) => ({ ...prev, ...data }))}
        />
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
