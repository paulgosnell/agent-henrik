"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FormModal } from "@/components/admin/form-modal";
import { TextInput, TextArea } from "@/components/admin/form-fields";
import { Pencil, ExternalLink, FileText } from "lucide-react";
import type { PageMeta } from "@/lib/supabase/types";

const CONTENT_PAGES = new Set([
  "/about/story",
  "/about/booking-process",
  "/about/pricing-faq",
  "/legal/terms",
  "/legal/data-protection",
  "/legal/imprint",
]);

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

  const hasContent = (path: string) => CONTENT_PAGES.has(path);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const update: Record<string, unknown> = {
      meta_title: editing.meta_title || null,
      meta_description: editing.meta_description || null,
      updated_at: new Date().toISOString(),
    };
    if (hasContent(editing.page_path || "")) {
      update.subtitle = editing.subtitle || null;
      update.body = editing.body || null;
      update.image_url = editing.image_url || null;
    }
    await supabase
      .from("ah_page_meta")
      .update(update)
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
          Edit SEO metadata and page content. Pages with a <FileText size={12} className="inline" /> icon have editable body content.
        </p>
      </div>

      <div className="border border-[var(--border)] rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--muted)]">
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Page</th>
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Path</th>
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Meta Title</th>
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Content</th>
              <th className="w-16 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr
                key={page.id}
                className="border-t border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium">
                  {pageName(page.page_path)}
                  {hasContent(page.page_path) && (
                    <FileText size={12} className="inline ml-2 text-[var(--muted-foreground)]" />
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--muted-foreground)] font-mono text-xs">{page.page_path}</td>
                <td className="px-4 py-3 max-w-[200px] truncate">{page.meta_title || "-"}</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
                  {hasContent(page.page_path) ? (
                    page.body ? (
                      <span className="text-xs text-green-500">Has content</span>
                    ) : (
                      <span className="text-xs text-amber-500">No content</span>
                    )
                  ) : (
                    <span className="text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={page.page_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                      title="Preview"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => openEdit(page)}
                      className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
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

        {/* SEO fields */}
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

        {/* Content fields — only for editable pages */}
        {hasContent(editing.page_path || "") && (
          <>
            <div className="pt-4 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Page Content</p>
            </div>
            <TextInput
              label="Subtitle"
              name="subtitle"
              value={editing.subtitle ?? ""}
              onChange={(v) => setEditing((p) => ({ ...p, subtitle: v }))}
              placeholder="Subtitle shown below the page title"
            />
            <TextInput
              label="Image URL"
              name="image_url"
              type="url"
              value={editing.image_url ?? ""}
              onChange={(v) => setEditing((p) => ({ ...p, image_url: v }))}
              placeholder="Hero image URL (optional)"
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                Body Content (HTML)
              </label>
              <p className="text-[10px] text-[var(--muted-foreground)] mb-1">
                Paste HTML content directly. Supports headings, paragraphs, lists, links, and bold/italic text.
              </p>
              <textarea
                value={editing.body ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, body: e.target.value }))}
                rows={16}
                className="px-3 py-2 text-xs font-mono bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors resize-y"
                placeholder="<h2>Section Title</h2><p>Your content here...</p>"
              />
            </div>
          </>
        )}
      </FormModal>
    </div>
  );
}
