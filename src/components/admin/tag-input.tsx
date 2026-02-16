"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}

export function TagInput({ label, value, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
        {label}
      </label>
      <div className="flex flex-wrap gap-1 p-2 bg-[var(--background)] border border-[var(--border)] rounded min-h-[38px]">
        {value.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--muted)] rounded"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="hover:text-red-400 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? "Type and press Enter..." : ""}
          className="flex-1 min-w-[120px] text-sm bg-transparent outline-none text-[var(--foreground)]"
        />
      </div>
    </div>
  );
}
