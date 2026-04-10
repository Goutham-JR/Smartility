"use client";

import { useState, useEffect, useCallback } from "react";
import { logsApi, ApiLog } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  Pencil,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const actionConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  task_completed: { label: "Completed", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  task_reassigned: { label: "Reassigned", icon: RefreshCw, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  task_created: { label: "Created", icon: Plus, color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
  task_updated: { label: "Updated", icon: Pencil, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  task_deleted: { label: "Deleted", icon: Trash2, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
};

const defaultAction = { label: "Action", icon: ScrollText, color: "bg-muted text-muted-foreground" };

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState("All");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await logsApi.getAll(page, 20);
      setLogs(res.logs);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch {
      console.error("Failed to fetch logs");
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtered = filterAction === "All" ? logs : logs.filter((l) => l.action === filterAction);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">{total} total log entries</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/80"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="All">All Actions</option>
          <option value="task_completed">Completed</option>
          <option value="task_reassigned">Reassigned</option>
          <option value="task_created">Created</option>
          <option value="task_updated">Updated</option>
          <option value="task_deleted">Deleted</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16">
          <ScrollText className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">No activity logs yet</p>
          <p className="text-sm text-muted-foreground">Actions like task completion and reassignment will appear here</p>
        </div>
      )}

      {/* Log entries */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((log) => {
            const config = actionConfig[log.action] || defaultAction;
            const Icon = config.icon;
            return (
              <Card key={log._id} className="border-0 shadow-sm">
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-medium">{log.details || log.action}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{log.performedBy}</span>
                      <span>·</span>
                      <Badge variant="secondary" className="text-xs">{log.performedByRole}</Badge>
                      <span>·</span>
                      <span title={formatFullDate(log.createdAt)}>{formatTime(log.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
