"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  title: string;
  columns: Column<T>[];
  data: T[];
  onAdd: () => void;
  onEdit: (row: T) => void;
  onDelete: (id: string) => void;
  searchField?: keyof T;
}

export function DataTable<T extends { id: string }>({
  title,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  searchField,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");

  const filtered = searchField
    ? data.filter((row) => {
        const val = row[searchField];
        return typeof val === "string" && val.toLowerCase().includes(search.toLowerCase());
      })
    : data;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light font-serif">{title}</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus size={14} />
          Add New
        </button>
      </div>

      {searchField && (
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--muted)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
          />
        </div>
      )}

      <div className="border border-[var(--border)] rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--muted)]">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal"
                >
                  {col.label}
                </th>
              ))}
              <th className="w-24 px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-[var(--muted-foreground)]"
                >
                  No records found
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3">
                      {col.render
                        ? col.render(row)
                        : String(row[col.key as keyof T] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(row)}
                        className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this record?")) onDelete(row.id);
                        }}
                        className="p-1 text-[var(--muted-foreground)] hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[var(--muted-foreground)] mt-2">
        {filtered.length} record{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
