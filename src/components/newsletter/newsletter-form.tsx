"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting" || !email) return;

    setStatus("submitting");
    const supabase = createClient();
    const { error } = await supabase.from("ah_newsletter_subscribers").insert({
      email: email.toLowerCase().trim(),
    });

    if (error) {
      // Duplicate email constraint will return error - treat as success
      if (error.code === "23505") {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-muted-foreground">
        Welcome to the Insider Circle. Your first dispatch is on its way.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="flex-1 border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        required
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="nav-text bg-foreground px-6 py-3 text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "submitting" ? "..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="absolute mt-14 text-xs text-red-500">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
