"use client";

import { useStore } from "@/lib/store";
import { Menu, Moon, Sun, Bell } from "lucide-react";
import { GlobalSearch } from "./global-search";

export function Header() {
  const { setSidebarOpen, sidebarOpen, darkMode, toggleDarkMode, notifications } = useStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-md md:px-6">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          )}
        </button>
      </div>
    </header>
  );
}
