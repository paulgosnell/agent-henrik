"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSite } from "@/components/admin/site-context";
import { Search, Download, ChevronDown, ChevronRight, Trash2, MessageSquare, Mail, Phone } from "lucide-react";
import { exportCSV } from "@/lib/utils/export-csv";
import type { Lead, BookingInquiry } from "@/lib/supabase/types";

const STATUSES = ["all", "new", "contacted", "qualified", "converted", "closed"] as const;

const STATUS_COLORS: Record<string, string> = {
  new: "text-blue-400",
  contacted: "text-yellow-400",
  qualified: "text-green-400",
  converted: "text-emerald-400",
  closed: "text-[var(--muted-foreground)]",
};

const SOURCE_BADGES: Record<string, string> = {
  "contact-form": "bg-blue-500/20 text-blue-400",
  "concierge_chat": "bg-purple-500/20 text-purple-400",
  "liv_chat": "bg-purple-500/20 text-purple-400",
};

export default function LeadsPage() {
  const { site } = useSite();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookingInquiries, setBookingInquiries] = useState<BookingInquiry[]>([]);
  const [conversations, setConversations] = useState<Array<{ session_id: string; messages: Array<{ role: string; content: string }>; updated_at: string }>>([]);
  const supabase = createClient();

  const load = useCallback(async () => {
    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (site !== "all") {
      query = query.eq("site", site);
    }

    const { data } = await query;
    setLeads((data as Lead[]) ?? []);
  }, [site]);

  useEffect(() => { load(); }, [load]);

  async function expandLead(lead: Lead) {
    if (expandedId === lead.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(lead.id);

    // Load booking inquiries for this email
    const { data: inquiries } = await supabase
      .from("booking_inquiries")
      .select("*")
      .eq("email", lead.email)
      .order("created_at", { ascending: false });
    setBookingInquiries((inquiries as BookingInquiry[]) ?? []);

    // Load conversations
    const { data: convos } = await supabase
      .from("ah_concierge_sessions")
      .select("session_id, messages, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5);
    // Filter by checking if any message contains the email
    const matched = (convos ?? []).filter((c: { messages: Array<{ content: string }> }) =>
      c.messages?.some((m: { content: string }) => m.content?.includes(lead.email))
    );
    setConversations(matched);
  }

  async function updateLeadStatus(leadId: string, status: string) {
    await supabase.from("leads").update({ status }).eq("id", leadId);
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status } : l));
  }

  async function deleteLead(leadId: string) {
    await supabase.from("leads").delete().eq("id", leadId);
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (expandedId === leadId) setExpandedId(null);
  }

  const filtered = leads
    .filter((row) => filter === "all" || row.status === filter)
    .filter((row) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (row.name?.toLowerCase().includes(q) ?? false) ||
        row.email.toLowerCase().includes(q) ||
        (row.notes?.toLowerCase().includes(q) ?? false)
      );
    });

  function handleExport() {
    const rows = filtered.map((row) => ({
      Name: row.name ?? "",
      Email: row.email,
      Phone: row.phone ?? "",
      Source: row.source,
      Status: row.status,
      Notes: row.notes ?? "",
      Site: row.site,
      "Created At": row.created_at,
    }));
    exportCSV(rows as Record<string, unknown>[], `leads-${new Date().toISOString().split("T")[0]}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light font-serif">Leads</h1>
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
            placeholder="Search name, email..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--muted)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-[var(--muted-foreground)]">No leads found</div>
        ) : (
          filtered.map((lead) => (
            <div key={lead.id} className="border border-[var(--border)] rounded overflow-hidden">
              <button
                onClick={() => expandLead(lead)}
                className="w-full flex items-center gap-4 px-4 py-3 text-sm hover:bg-[var(--muted)]/50 transition-colors cursor-pointer"
              >
                {expandedId === lead.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="font-medium flex-shrink-0 w-40 text-left">{lead.name || "—"}</span>
                <span className="text-[var(--muted-foreground)] flex-shrink-0 w-56 text-left">{lead.email}</span>
                <span className={`text-xs uppercase tracking-wider flex-shrink-0 w-20 text-left ${SOURCE_BADGES[lead.source] || "bg-gray-500/20 text-gray-400"} px-2 py-0.5 rounded`}>
                  {lead.source.replace(/[-_]/g, " ")}
                </span>
                <span className={`text-xs uppercase tracking-wider flex-shrink-0 w-20 text-left ${STATUS_COLORS[lead.status] || ""}`}>
                  {lead.status}
                </span>
                {lead.site !== "henrik" && (
                  <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0 w-16 text-left">{lead.site}</span>
                )}
                <span className="text-[var(--muted-foreground)] ml-auto text-xs">
                  {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </button>

              {expandedId === lead.id && (
                <div className="border-t border-[var(--border)] px-4 py-4 bg-[var(--muted)]/30 space-y-4">
                  {/* Status + Actions */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Status:</span>
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="text-sm bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1 text-[var(--foreground)]"
                      >
                        {STATUSES.filter((s) => s !== "all").map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                        <Phone size={12} /> {lead.phone}
                      </a>
                    )}
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                      <Mail size={12} /> Email
                    </a>
                    <button
                      onClick={() => { if (confirm("Delete this lead?")) deleteLead(lead.id); }}
                      className="ml-auto flex items-center gap-1 text-sm text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>

                  {/* Notes */}
                  {lead.notes && (
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
                    </div>
                  )}

                  {/* Booking Inquiries */}
                  {bookingInquiries.length > 0 && (
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Booking Inquiries</p>
                      {bookingInquiries.map((bi) => (
                        <div key={bi.id} className="border border-[var(--border)] rounded p-3 text-sm space-y-1 mb-2">
                          {bi.group_size && <p><span className="text-[var(--muted-foreground)]">Group:</span> {bi.group_size}</p>}
                          {bi.budget_range && <p><span className="text-[var(--muted-foreground)]">Budget:</span> {bi.budget_range}</p>}
                          {bi.special_requests && <p className="whitespace-pre-wrap text-xs mt-2">{bi.special_requests}</p>}
                          <p className="text-xs text-[var(--muted-foreground)]">{new Date(bi.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Conversations */}
                  {conversations.length > 0 && (
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <MessageSquare size={12} /> Conversations
                      </p>
                      {conversations.map((convo) => (
                        <div key={convo.session_id} className="border border-[var(--border)] rounded p-3 text-sm space-y-2 mb-2 max-h-60 overflow-y-auto">
                          {convo.messages?.map((msg: { role: string; content: string }, i: number) => (
                            <div key={i} className={`text-xs ${msg.role === "user" ? "text-blue-400" : "text-[var(--muted-foreground)]"}`}>
                              <span className="uppercase tracking-wider font-medium">{msg.role === "user" ? "Guest" : "Henrik"}:</span>{" "}
                              {msg.content}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <p className="text-xs text-[var(--muted-foreground)] mt-2">
        {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
