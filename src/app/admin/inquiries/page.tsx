"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Download, Eye } from "lucide-react";
import { exportCSV } from "@/lib/utils/export-csv";
import Link from "next/link";
import type { Inquiry } from "@/lib/supabase/types";

const STATUSES = ["all", "new", "contacted", "qualified", "converted", "closed"] as const;

const STATUS_COLORS: Record<string, string> = {
  new: "text-blue-400",
  contacted: "text-yellow-400",
  qualified: "text-green-400",
  converted: "text-emerald-400",
  closed: "text-[var(--muted-foreground)]",
};

export default function InquiriesPage() {
  const [data, setData] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from("ah_inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    setData(data ?? []);
  }

  useEffect(() => { load(); }, []);

  const filtered = data
    .filter((row) => filter === "all" || row.status === filter || (filter === "new" && !row.status))
    .filter((row) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        (row.destination?.toLowerCase().includes(q) ?? false)
      );
    });

  function handleExport() {
    const rows = filtered.map((row) => ({
      Name: row.name,
      Email: row.email,
      Phone: row.phone ?? "",
      Destination: row.destination ?? "",
      "Travel Dates": row.travel_dates ?? "",
      "Group Size": row.group_size ?? "",
      "Investment Level": row.investment_level ?? "",
      Preferences: row.preferences ?? "",
      Status: row.status ?? "new",
      "Created At": row.created_at,
    }));
    exportCSV(rows as Record<string, unknown>[], `inquiries-${new Date().toISOString().split("T")[0]}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light font-serif">Inquiries</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors cursor-pointer"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded transition-colors cursor-pointer ${
                filter === s
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, destination..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--muted)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
          />
        </div>
      </div>

      <div className="border border-[var(--border)] rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--muted)]">
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Name</th>
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Email</th>
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Destination</th>
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Status</th>
              <th className="text-left px-4 py-3 text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-normal">Date</th>
              <th className="w-16 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                  No inquiries found
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{row.email}</td>
                  <td className="px-4 py-3">{row.destination ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs uppercase tracking-wider ${STATUS_COLORS[row.status ?? "new"] ?? ""}`}>
                      {row.status ?? "new"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/inquiries/${row.id}`}
                      className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <Eye size={14} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[var(--muted-foreground)] mt-2">
        {filtered.length} inquiry{filtered.length !== 1 ? "ies" : ""}
      </p>
    </div>
  );
}
