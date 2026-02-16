"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface AiGenerateProps {
  contentType: string;
  existingData: Record<string, unknown>;
  emptyFields: string[];
  onGenerated: (data: Record<string, unknown>) => void;
}

export function AiGenerate({
  contentType,
  existingData,
  emptyFields,
  onGenerated,
}: AiGenerateProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  async function handleGenerate() {
    if (emptyFields.length === 0) {
      setError("All fields are already filled");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          existingData,
          customPrompt: customPrompt.trim() || undefined,
          fields: emptyFields,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const { generated } = await res.json();
      onGenerated(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-dashed border-[var(--border)] rounded p-3 bg-[var(--background)]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
        >
          <Sparkles size={14} />
          AI Content Generator
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {emptyFields.length > 0 && (
          <span className="text-xs text-[var(--muted-foreground)]">
            {emptyFields.length} empty field{emptyFields.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3">
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Optional: add context like 'Focus on nightlife in Berlin' or 'Make it more adventurous'... Leave blank for auto-generated content."
            rows={2}
            className="px-3 py-2 text-xs bg-[var(--muted)] border border-[var(--border)] rounded text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors resize-y"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || emptyFields.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  Generate Empty Fields
                </>
              )}
            </button>
            {error && <span className="text-xs text-red-400">{error}</span>}
          </div>
          <p className="text-xs text-[var(--muted-foreground)]/60">
            Generates content for empty fields only. Existing content is preserved and used as context.
          </p>
        </div>
      )}
    </div>
  );
}
