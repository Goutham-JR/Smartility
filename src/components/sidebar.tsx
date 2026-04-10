"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  LayoutDashboard, Users, Building2, ClipboardList, Settings, LogOut,
  ChevronLeft, ChevronRight, Zap, ScrollText, Home, Ticket, Clock, Droplets, UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/store";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Manager", "Staff", "Resident"] as Role[] },
  { href: "/employees", label: "Employees", icon: Users, roles: ["Admin", "Manager"] as Role[] },
  { href: "/communities", label: "Communities", icon: Building2, roles: ["Admin", "Manager"] as Role[] },
  { href: "/residents", label: "Residents", icon: Home, roles: ["Admin", "Manager"] as Role[] },
  { href: "/tasks", label: "Tasks", icon: ClipboardList, roles: ["Admin", "Manager", "Staff"] as Role[] },
  { href: "/tickets", label: "Tickets", icon: Ticket, roles: ["Admin", "Manager", "Staff", "Resident"] as Role[] },
  { href: "/attendance", label: "Attendance", icon: Clock, roles: ["Admin", "Manager", "Staff"] as Role[] },
  { href: "/water-levels", label: "Water Levels", icon: Droplets, roles: ["Admin", "Manager", "Staff"] as Role[] },
  { href: "/logs", label: "Activity Logs", icon: ScrollText, roles: ["Admin", "Manager"] as Role[] },
  { href: "/users", label: "User Mgmt", icon: UserCog, roles: ["Admin"] as Role[] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["Admin"] as Role[] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, logout, userRole, userName } = useStore();

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={cn("fixed top-0 left-0 z-50 flex h-full flex-col border-r border-border bg-card transition-all duration-300 lg:relative lg:z-auto", sidebarOpen ? "w-64" : "w-0 lg:w-16", !sidebarOpen && "overflow-hidden lg:overflow-visible")}>
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          {sidebarOpen && <span className="text-lg font-bold tracking-tight">Smartility</span>}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {allNavItems.filter((item) => item.roles.includes(userRole)).map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200", active ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          {sidebarOpen && (
            <div className="mb-2 rounded-xl bg-accent/50 p-3">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
          )}
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-accent lg:flex">
          {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      </aside>
    </>
  );
}
