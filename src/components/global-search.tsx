"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Search, Users, Building2, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchResult {
  type: "employee" | "community" | "task";
  label: string;
  sub: string;
  href: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { employees, communities, tasks } = useStore();

  const results: SearchResult[] = [];
  if (query.length >= 2) {
    const q = query.toLowerCase();
    employees
      .filter((e) => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((e) =>
        results.push({ type: "employee", label: e.name, sub: e.role, href: "/employees" })
      );
    communities
      .filter((c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((c) =>
        results.push({ type: "community", label: c.name, sub: c.address, href: "/communities" })
      );
    tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((t) =>
        results.push({ type: "task", label: t.title, sub: t.status, href: "/tasks" })
      );
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const icons = {
    employee: Users,
    community: Building2,
    task: ClipboardList,
  };

  return (
    <div ref={ref} className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search employees, communities, tasks..."
        className="pl-9 bg-accent/50 border-0 focus-visible:ring-1"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
      />
      {focused && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-card p-2 shadow-lg">
          {results.map((r, i) => {
            const Icon = icons[r.type];
            return (
              <button
                key={i}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                onClick={() => {
                  router.push(r.href);
                  setQuery("");
                  setFocused(false);
                }}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
