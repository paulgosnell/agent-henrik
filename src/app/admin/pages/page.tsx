"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FormModal } from "@/components/admin/form-modal";
import { TextInput, TextArea } from "@/components/admin/form-fields";
import { Pencil } from "lucide-react";
import type { PageMeta } from "@/lib/supabase/types";

export default function PagesPage() {
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<PageMeta>>({});
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from("ah_page_meta")
      .select("*")
      .order("page_path");
    setPages((data as PageMeta[]) ?? []);
  }

  useEffect(() => { load(); }, []);

  function openEdit(page: PageMeta) {
    setEditing({ ...page });
    setModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase
      .from("ah_page_meta")
      .update({
        meta_title: editing.meta_title || null,
        meta_description: editing.meta_description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editing.id);
    setLoading(false);
    setModal(false);
    load();
  }

  const pageName = (path: string) => {
    if (path === "/") return "Homepage";
    return path
      .split("/")
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "))
      .join(" / ");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-light font-serif">Pages</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Edit SEO metadata (title and description) for static pages
        </p>
      </div>

      <div className="border border-[var(--border)] rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--muted)]">
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Page</th>
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Path</th>
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Meta Title</th>
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Meta Description</th>
              <th className="w-16 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr
                key={page.id}
                className="border-t border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium">{pageName(page.page_path)}</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)] font-mono text-xs">{page.page_path}</td>
                <td className="px-4 py-3 max-w-[200px] truncate">{page.meta_title || "-"}</td>
                <td className="px-4 py-3 max-w-[300px] truncate text-[var(--muted-foreground)]">{page.meta_description || "-"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openEdit(page)}
                    className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormModal
        title={`Edit: ${editing.page_path ? pageName(editing.page_path) : ""}`}
        open={modal}
        onClose={() => setModal(false)}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <p className="text-xs text-[var(--muted-foreground)] font-mono">{editing.page_path}</p>
        <TextInput
          label="Meta Title"
          name="meta_title"
          value={editing.meta_title ?? ""}
          onChange={(v) => setEditing((p) => ({ ...p, meta_title: v }))}
          placeholder="Page title shown in search results and browser tab"
        />
        <TextArea
          label="Meta Description"
          name="meta_description"
          value={editing.meta_description ?? ""}
          onChange={(v) => setEditing((p) => ({ ...p, meta_description: v }))}
          rows={3}
          placeholder="Description shown in search results (recommended: 150-160 characters)"
        />
      </FormModal>
    </div>
  );
}
