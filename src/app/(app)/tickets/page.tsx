"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { getPermissions } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Ticket, CheckCircle2, UserCheck, XCircle, Clock, AlertTriangle } from "lucide-react";

const categories = ["Water", "Electricity", "Plumbing", "Security", "Cleaning", "Elevator", "Parking", "Other"];
const statusColors: Record<string, string> = {
  Open: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  Closed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};
const priorityColors: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  High: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Urgent: "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200",
};

export default function TicketsPage() {
  const { tickets, addTicket, assignTicket, resolveTicket, closeTicket, deleteTicket, employees, residents, communities, userRole, staffEmployeeId, residentId } = useStore();
  const perms = getPermissions(userRole);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [assignId, setAssignId] = useState<string | null>(null);
  const [assignTo, setAssignTo] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Other");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");

  const visibleTickets = userRole === "Resident" && residentId
    ? tickets.filter((t) => t.residentId === residentId)
    : userRole === "Staff" && staffEmployeeId
    ? tickets.filter((t) => t.assigneeId === staffEmployeeId)
    : tickets;

  const filtered = visibleTickets.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    if (filterCategory !== "All" && t.category !== filterCategory) return false;
    return true;
  });

  const openCount = visibleTickets.filter((t) => t.status === "Open").length;
  const inProgressCount = visibleTickets.filter((t) => t.status === "In Progress").length;
  const resolvedCount = visibleTickets.filter((t) => t.status === "Resolved").length;

  const getResidentName = (id: string) => residents.find((r) => r.id === id)?.name ?? "Unknown";
  const getResidentFlat = (id: string) => { const r = residents.find((r) => r.id === id); return r ? `${r.flatNumber}` : ""; };
  const getAssigneeName = (id?: string) => { if (!id) return "Unassigned"; return employees.find((e) => e.id === id)?.name ?? "Unknown"; };
  const getCommunityName = (id: string) => communities.find((c) => c.id === id)?.name ?? "";

  const handleRaiseTicket = async () => {
    if (!title.trim()) return;
    const resident = residents.find((r) => r.id === residentId);
    await addTicket({
      title, description: desc, category, priority,
      residentId: residentId!, communityId: resident?.communityId || "",
      performedBy: resident?.name || "Resident", performedByRole: "Resident",
    });
    setTitle(""); setDesc(""); setCategory("Other"); setPriority("Medium"); setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{userRole === "Resident" ? "My Tickets" : userRole === "Staff" ? "Assigned Tickets" : "Tickets & Complaints"}</h1>
          <p className="text-muted-foreground">{visibleTickets.length} {userRole === "Resident" ? "tickets raised" : "total tickets"}</p>
        </div>
        {perms.canRaiseTicket && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90">
              <Plus className="h-4 w-4" /> Raise Ticket
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Raise a Complaint</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief description of the issue" className="mt-1" /></div>
                <div><Label>Details</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Explain the issue in detail..." className="mt-1" rows={3} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Category</Label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><Label>Priority</Label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleRaiseTicket} className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Submit Ticket</button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm"><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"><Clock className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{openCount}</p><p className="text-sm text-muted-foreground">Open</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"><Ticket className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{inProgressCount}</p><p className="text-sm text-muted-foreground">In Progress</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{resolvedCount}</p><p className="text-sm text-muted-foreground">Resolved</p></div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option>All</option><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option>All</option>{categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16">
          <Ticket className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">No tickets found</p>
          <p className="text-sm text-muted-foreground">{userRole === "Resident" ? "Raise a ticket to report an issue" : "No tickets match your filters"}</p>
        </div>
      )}

      {/* Ticket list */}
      <div className="space-y-3">
        {filtered.map((ticket) => (
          <Card key={ticket.id} className="group border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-muted-foreground">{ticket.category}</span>
                  </div>
                  <p className="font-semibold">{ticket.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>By {getResidentName(ticket.residentId)}</span>
                    {getResidentFlat(ticket.residentId) && <><span>·</span><span>Flat {getResidentFlat(ticket.residentId)}</span></>}
                    <span>·</span><span>{getCommunityName(ticket.communityId)}</span>
                    <span>·</span><span>{getAssigneeName(ticket.assigneeId)}</span>
                    <span>·</span><span>{ticket.createdAt}</span>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[ticket.status]}`}>{ticket.status}</span>
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-wrap gap-2 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                {perms.canManageTickets && ticket.status !== "Closed" && ticket.status !== "Resolved" && (
                  <button onClick={() => { setAssignId(ticket.id); setAssignTo(""); }}
                    className="flex items-center gap-1 rounded-lg bg-blue-100 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                    <UserCheck className="h-3.5 w-3.5" /> Assign
                  </button>
                )}
                {perms.canManageTickets && (ticket.status === "In Progress" || ticket.status === "Open") && (
                  <button onClick={() => resolveTicket(ticket.id)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                  </button>
                )}
                {perms.canCloseTicket && ticket.status === "Resolved" && (
                  <button onClick={() => closeTicket(ticket.id)}
                    className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                    <XCircle className="h-3.5 w-3.5" /> Close
                  </button>
                )}
                {perms.canDeleteTicket && (
                  <button onClick={() => deleteTicket(ticket.id)}
                    className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Dialog */}
      <Dialog open={assignId !== null} onOpenChange={(o) => { if (!o) setAssignId(null); }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Assign Ticket</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Assign &quot;{tickets.find((t) => t.id === assignId)?.title}&quot; to:</p>
            <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
              <option value="">Select employee...</option>
              {employees.filter((e) => e.status === "Active").map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={async () => { if (assignId && assignTo) { await assignTicket(assignId, assignTo); setAssignId(null); } }} disabled={!assignTo}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">Assign</button>
              <button onClick={() => setAssignId(null)} className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-muted-foreground">Cancel</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
