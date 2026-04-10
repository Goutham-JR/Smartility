"use client";

import { useState } from "react";
import { useStore, Employee } from "@/lib/store";
import { getPermissions } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Search, Pencil, Trash2, Phone, Users, LayoutGrid, List } from "lucide-react";

const roleOptions = ["Supervisor", "Housekeeping", "Security Guard", "Gardener", "Maintenance", "Electrician", "Plumber"];

function EmployeeForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Employee;
  onSave: (data: Omit<Employee, "id">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "Supervisor");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [status, setStatus] = useState<"Active" | "Inactive">(initial?.status ?? "Active");

  return (
    <div className="space-y-4">
      <div>
        <Label>Full Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" className="mt-1" />
      </div>
      <div>
        <Label>Role</Label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          {roleOptions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="mt-1" />
      </div>
      <div>
        <Label>Status</Label>
        <div className="mt-1 flex gap-2">
          {(["Active", "Inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                status === s ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => {
            if (!name.trim()) return;
            onSave({ name, role, phone, status });
            onClose();
          }}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
        >
          {initial ? "Update" : "Add"} Employee
        </button>
        <button onClick={onClose} className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-muted-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, communities, userRole } = useStore();
  const perms = getPermissions(userRole);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = employees.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.role.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole !== "All" && e.role !== filterRole) return false;
    if (filterStatus !== "All" && e.status !== filterStatus) return false;
    return true;
  });

  const getCommunityName = (id?: string) => {
    if (!id) return "Unassigned";
    return communities.find((c) => c.id === id)?.name ?? "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">{employees.length} total employees</p>
        </div>
        {perms.canAddEmployee && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90">
                <Plus className="h-4 w-4" /> Add Employee
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <EmployeeForm onSave={(data) => addEmployee(data)} onClose={() => setAddOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option>All</option>
          {roleOptions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <div className="flex rounded-lg border border-input">
          <button
            onClick={() => setView("grid")}
            className={`p-2 ${view === "grid" ? "bg-accent" : ""}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 ${view === "list" ? "bg-accent" : ""}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16">
          <Users className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">No employees found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new employee</p>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((emp) => (
            <Card key={emp.id} className="group overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                      {emp.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{emp.name}</p>
                      <p className="text-sm text-muted-foreground">{emp.role}</p>
                    </div>
                  </div>
                  <Badge variant={emp.status === "Active" ? "default" : "secondary"} className="text-xs">
                    {emp.status}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> {emp.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" /> {getCommunityName(emp.communityId)}
                  </div>
                </div>
                {(perms.canEditEmployee || perms.canDeleteEmployee) && (
                <div className="mt-4 flex gap-2 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  {perms.canEditEmployee && (
                  <Dialog
                    open={editingId === emp.id}
                    onOpenChange={(open) => setEditingId(open ? emp.id : null)}
                  >
                    <DialogTrigger className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
                        <Pencil className="h-3 w-3" /> Edit
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                      </DialogHeader>
                      <EmployeeForm
                        initial={emp}
                        onSave={(data) => updateEmployee(emp.id, data)}
                        onClose={() => setEditingId(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  )}
                  {perms.canDeleteEmployee && (
                  <button
                    onClick={() => deleteEmployee(emp.id)}
                    className="flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                  )}
                </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List view */}
      {view === "list" && filtered.length > 0 && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Community</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">{emp.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.role}</td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{getCommunityName(emp.communityId)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={emp.status === "Active" ? "default" : "secondary"} className="text-xs">
                        {emp.status}
                      </Badge>
                    </td>
                    {(perms.canEditEmployee || perms.canDeleteEmployee) && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {perms.canEditEmployee && (
                        <button
                          onClick={() => setEditingId(emp.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        )}
                        {perms.canDeleteEmployee && (
                        <button
                          onClick={() => deleteEmployee(emp.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        )}
                      </div>
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
