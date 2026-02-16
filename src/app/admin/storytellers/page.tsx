"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FormModal } from "@/components/admin/form-modal";
import { TextInput, TextArea, CheckboxInput } from "@/components/admin/form-fields";
import { TagInput } from "@/components/admin/tag-input";
import { ImageUpload } from "@/components/admin/image-upload";
import type { Storyteller } from "@/lib/supabase/types";

const EMPTY: Partial<Storyteller> = {
  slug: "",
  name: "",
  role: "",
  bio: "",
  portrait_url: "",
  signature_experiences: [],
  linked_storyworld_ids: [],
  linked_theme_ids: [],
  published: true,
};

const columns: Column<Storyteller>[] = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
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

export default function StorytellersPage() {
  const [data, setData] = useState<Storyteller[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Storyteller>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("ah_storytellers").select("*").order("name");
    setData(data ?? []);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing({ ...EMPTY }); setModal(true); }
  function openEdit(row: Storyteller) { setEditing({ ...row }); setModal(true); }

  async function handleDelete(id: string) {
    await supabase.from("ah_storytellers").delete().eq("id", id);
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
      await supabase.from("ah_storytellers").update(payload).eq("id", id);
    } else {
      await supabase.from("ah_storytellers").insert(payload);
    }
    setLoading(false);
    setModal(false);
    load();
  }

  function set<K extends keyof Storyteller>(key: K, value: Storyteller[K]) {
    setEditing((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <DataTable
        title="Storytellers"
        columns={columns}
        data={data}
        onAdd={openNew}
        onEdit={openEdit}
        onDelete={handleDelete}
        searchField="name"
      />

      <FormModal
        title={editing.id ? "Edit Storyteller" : "New Storyteller"}
        open={modal}
        onClose={() => setModal(false)}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Name" name="name" value={editing.name ?? ""} onChange={(v) => set("name", v)} required />
          <TextInput label="Slug" name="slug" value={editing.slug ?? ""} onChange={(v) => set("slug", v)} required />
        </div>
        <TextInput label="Role" name="role" value={editing.role ?? ""} onChange={(v) => set("role", v)} />
        <TextArea label="Bio" name="bio" value={editing.bio ?? ""} onChange={(v) => set("bio", v)} rows={4} />
        <ImageUpload label="Portrait" value={editing.portrait_url ?? ""} onChange={(v) => set("portrait_url", v)} />
        <TagInput label="Signature Experiences" value={editing.signature_experiences ?? []} onChange={(v) => set("signature_experiences", v)} />
        <TagInput label="Linked Storyworld IDs" value={editing.linked_storyworld_ids ?? []} onChange={(v) => set("linked_storyworld_ids", v)} />
        <TagInput label="Linked Theme IDs" value={editing.linked_theme_ids ?? []} onChange={(v) => set("linked_theme_ids", v)} />
        <CheckboxInput label="Published" name="published" checked={editing.published ?? true} onChange={(v) => set("published", v)} />
      </FormModal>
    </div>
  );
}
