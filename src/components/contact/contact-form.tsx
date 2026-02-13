"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { INVESTMENT_LEVELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

interface ContactFormProps {
  prefillDestination?: string;
  prefillThemeId?: string;
  prefillStoryworldId?: string;
  aiDraft?: string;
}

export function ContactForm({
  prefillDestination,
  prefillThemeId,
  prefillStoryworldId,
  aiDraft,
}: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(false);
    const form = e.currentTarget;
    const data = new FormData(form);

    const supabase = createClient();
    const { error } = await supabase.from("ah_inquiries").insert({
      name: data.get("name") as string,
      email: data.get("email") as string,
      phone: (data.get("phone") as string) || null,
      destination: (data.get("destination") as string) || null,
      travel_dates: (data.get("travel_dates") as string) || null,
      group_size: data.get("group_size") ? Number(data.get("group_size")) : null,
      investment_level: (data.get("investment_level") as string) || null,
      preferences: (data.get("preferences") as string) || null,
      ai_draft_itinerary: aiDraft || null,
      source_storyworld_id: prefillStoryworldId || null,
      source_theme_id: prefillThemeId || null,
    });

    if (error) {
      setError(true);
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center bg-foreground text-background">
          <Check size={28} />
        </div>
        <h3 className="font-serif text-2xl font-light">Thank You</h3>
        <p className="max-w-sm text-muted-foreground">
          Your story curator will contact you within 24 hours with your Insider
          Journey.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name & Email */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:border-foreground focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Phone & Destination */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:border-foreground focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="destination" className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Destination
          </label>
          <input
            id="destination"
            name="destination"
            type="text"
            defaultValue={prefillDestination}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Dates & Group Size */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="travel_dates" className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Travel Dates
          </label>
          <input
            id="travel_dates"
            name="travel_dates"
            type="text"
            placeholder="e.g. March 15-22, 2026"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="group_size" className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Group Size
          </label>
          <input
            id="group_size"
            name="group_size"
            type="number"
            min="1"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Investment Level */}
      <div>
        <label htmlFor="investment_level" className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
          Investment Level
        </label>
        <select
          id="investment_level"
          name="investment_level"
          className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:border-foreground focus:outline-none"
        >
          <option value="">Select level</option>
          {INVESTMENT_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label} — {level.description}
            </option>
          ))}
        </select>
      </div>

      {/* Preferences */}
      <div>
        <label htmlFor="preferences" className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
          Journey Preferences
        </label>
        <textarea
          id="preferences"
          name="preferences"
          rows={4}
          placeholder="Tell us about your ideal journey..."
          className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="nav-text inline-flex items-center gap-2 bg-foreground px-8 py-3 text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Send size={14} />
        {submitting ? "Sending..." : "Send Inquiry"}
      </button>

      {error && (
        <p className="text-sm text-red-500">
          Something went wrong. Please try again or email us directly.
        </p>
      )}
    </form>
  );
}
