"use client";

import { useState } from "react";
import { useStore, Task } from "@/lib/store";
import { getPermissions } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Clock, ArrowUpCircle, CheckCircle2, Pencil, Trash2, AlertTriangle, UserCheck, RefreshCw } from "lucide-react";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

const priorityColors: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  High: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const statusIcons: Record<string, typeof Clock> = {
  Pending: Clock,
  "In Progress": ArrowUpCircle,
  Completed: CheckCircle2,
};

function TaskForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Task;
  onSave: (data: Omit<Task, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const { employees, communities } = useStore();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId ?? "");
  const [communityId, setCommunityId] = useState(initial?.communityId ?? "");
  const [status, setStatus] = useState<Task["status"]>(initial?.status ?? "Pending");
  const [priority, setPriority] = useState<Task["priority"]>(initial?.priority ?? "Medium");

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title" className="mt-1" />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task..."
          className="mt-1"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Assign To</Label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Community</Label>
          <select
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Priority</Label>
          <div className="mt-1 flex gap-1">
            {(["Low", "Medium", "High"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                  priority === p ? priorityColors[p] + " ring-2 ring-ring" : "bg-accent text-muted-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Status</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Task["status"])}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => {
            if (!title.trim()) return;
            onSave({ title, description, assigneeId: assigneeId || undefined, communityId: communityId || undefined, status, priority });
            onClose();
          }}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
        >
          {initial ? "Update" : "Create"} Task
        </button>
        <button onClick={onClose} className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-muted-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, completeTask, reassignTask, employees, communities, userRole, staffEmployeeId } = useStore();
  const perms = getPermissions(userRole);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reassignId, setReassignId] = useState<string | null>(null);
  const [reassignTo, setReassignTo] = useState("");

  // Staff only sees their assigned tasks
  const visibleTasks = userRole === "Staff" && staffEmployeeId
    ? tasks.filter((t) => t.assigneeId === staffEmployeeId)
    : tasks;

  const filtered = visibleTasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    if (filterPriority !== "All" && t.priority !== filterPriority) return false;
    return true;
  });

  const getAssigneeName = (id?: string) => {
    if (!id) return "Unassigned";
    return employees.find((e) => e.id === id)?.name ?? "Unknown";
  };

  const getCommunityName = (id?: string) => {
    if (!id) return "";
    return communities.find((c) => c.id === id)?.name ?? "";
  };

  const pendingCount = visibleTasks.filter((t) => t.status === "Pending").length;
  const inProgressCount = visibleTasks.filter((t) => t.status === "In Progress").length;
  const completedCount = visibleTasks.filter((t) => t.status === "Completed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{userRole === "Staff" ? "My Tasks" : "Tasks & Complaints"}</h1>
          <p className="text-muted-foreground">{visibleTasks.length} {userRole === "Staff" ? "assigned to you" : "total tasks"}</p>
        </div>
        {perms.canAddTask && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90">
                <Plus className="h-4 w-4" /> Create Task
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm onSave={(data) => addTask(data)} onClose={() => setAddOpen(false)} />
          </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option>All</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option>All</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16">
          <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">No tasks found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new task</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const StatusIcon = statusIcons[task.status];
            return (
              <Card key={task.id} className="group border-0 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <StatusIcon className={`h-5 w-5 shrink-0 ${task.status === "Completed" ? "text-emerald-500" : task.status === "In Progress" ? "text-blue-500" : "text-amber-500"}`} />
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{getAssigneeName(task.assigneeId)}</span>
                      {getCommunityName(task.communityId) && (
                        <>
                          <span>·</span>
                          <span>{getCommunityName(task.communityId)}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{task.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[task.status]}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                    {/* Complete button - everyone can mark tasks complete (except already completed) */}
                    {task.status !== "Completed" && (
                      <button
                        onClick={() => completeTask(task.id)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                      </button>
                    )}
                    {/* Reassign button - everyone can reassign (except completed tasks) */}
                    {task.status !== "Completed" && (
                      <button
                        onClick={() => { setReassignId(task.id); setReassignTo(""); }}
                        className="flex items-center gap-1 rounded-lg bg-blue-100 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Reassign
                      </button>
                    )}
                    {/* Edit - Admin/Manager only */}
                    {perms.canEditTask && (
                    <Dialog open={editingId === task.id} onOpenChange={(open) => setEditingId(open ? task.id : null)}>
                      <DialogTrigger className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
                          <Pencil className="h-4 w-4" />
                      </DialogTrigger>
                      <DialogContent className="rounded-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Task</DialogTitle>
                        </DialogHeader>
                        <TaskForm
                          initial={task}
                          onSave={(data) => updateTask(task.id, data)}
                          onClose={() => setEditingId(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    )}
                    {/* Delete - Admin only */}
                    {perms.canDeleteTask && (
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reassign Dialog */}
      <Dialog open={reassignId !== null} onOpenChange={(open) => { if (!open) setReassignId(null); }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reassign Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select an employee to reassign &quot;{visibleTasks.find((t) => t.id === reassignId)?.title}&quot; to:
            </p>
            <select
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            >
              <option value="">Select employee...</option>
              {employees
                .filter((e) => e.status === "Active" && e.id !== (visibleTasks.find((t) => t.id === reassignId)?.assigneeId))
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.role}
                  </option>
                ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (reassignId && reassignTo) {
                    await reassignTask(reassignId, reassignTo);
                    setReassignId(null);
                  }
                }}
                disabled={!reassignTo}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
              >
                Reassign
              </button>
              <button
                onClick={() => setReassignId(null)}
                className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
