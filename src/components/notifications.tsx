"use client";

import { useStore } from "@/lib/store";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export function Notifications() {
  const { notifications, removeNotification } = useStore();

  if (notifications.length === 0) return null;

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
  };

  const colors = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    error: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
    info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {notifications.map((n) => {
        const Icon = icons[n.type];
        return (
          <div
            key={n.id}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg animate-slide-in-right ${colors[n.type]}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">{n.message}</span>
            <button onClick={() => removeNotification(n.id)} className="ml-2 shrink-0 opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
