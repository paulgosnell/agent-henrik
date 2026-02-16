"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function AdminHeader() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-end px-6 gap-4">
      <span className="text-sm text-[var(--muted-foreground)]">{email}</span>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
      >
        <LogOut size={14} />
        Logout
      </button>
    </header>
  );
}
