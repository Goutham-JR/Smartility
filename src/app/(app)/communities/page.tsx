"use client";

import { useState } from "react";
import { useStore, Community } from "@/lib/store";
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
import { Plus, MapPin, Users, Building2, ClipboardList, Pencil, Trash2 } from "lucide-react";

function CommunityForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Community;
  onSave: (data: Omit<Community, "id">) => void;
  onClose: () => void;
}) {
  const { employees } = useStore();
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [type, setType] = useState(initial?.type ?? "Residential");
  const [selectedEmps, setSelectedEmps] = useState<string[]>(initial?.employeeIds ?? []);

  const toggleEmployee = (id: string) => {
    setSelectedEmps((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Community Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" className="mt-1" />
      </div>
      <div>
        <Label>Address</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address" className="mt-1" />
      </div>
      <div>
        <Label>Type</Label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option>Residential</option>
          <option>Commercial</option>
          <option>Industrial</option>
        </select>
      </div>
      <div>
        <Label>Assign Employees</Label>
        <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-input p-2">
          {employees.map((emp) => (
            <label key={emp.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent cursor-pointer">
              <input
                type="checkbox"
                checked={selectedEmps.includes(emp.id)}
                onChange={() => toggleEmployee(emp.id)}
                className="rounded"
              />
              {emp.name} - {emp.role}
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => {
            if (!name.trim()) return;
            onSave({ name, address, type, employeeIds: selectedEmps });
            onClose();
          }}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
        >
          {initial ? "Update" : "Add"} Community
        </button>
        <button onClick={onClose} className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-muted-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function CommunitiesPage() {
  const { communities, addCommunity, updateCommunity, deleteCommunity, employees, tasks, userRole } = useStore();
  const perms = getPermissions(userRole);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = communities.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Communities</h1>
          <p className="text-muted-foreground">{communities.length} managed communities</p>
        </div>
        {perms.canAddCommunity && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90">
                <Plus className="h-4 w-4" /> Add Community
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add New Community</DialogTitle>
              </DialogHeader>
              <CommunityForm onSave={(data) => addCommunity(data)} onClose={() => setAddOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative max-w-sm">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16">
          <Building2 className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">No communities found</p>
          <p className="text-sm text-muted-foreground">Add your first community to get started</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((comm) => {
          const commEmployees = employees.filter((e) => comm.employeeIds.includes(e.id));
          const commTasks = tasks.filter((t) => t.communityId === comm.id);
          const activeTasks = commTasks.filter((t) => t.status !== "Completed").length;

          return (
            <Card key={comm.id} className="group overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{comm.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {comm.address}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {comm.type}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-accent/50 p-3 text-center">
                    <Users className="mx-auto h-4 w-4 text-muted-foreground" />
                    <p className="mt-1 text-lg font-bold">{commEmployees.length}</p>
                    <p className="text-xs text-muted-foreground">Staff</p>
                  </div>
                  <div className="rounded-xl bg-accent/50 p-3 text-center">
                    <ClipboardList className="mx-auto h-4 w-4 text-muted-foreground" />
                    <p className="mt-1 text-lg font-bold">{commTasks.length}</p>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  <div className="rounded-xl bg-accent/50 p-3 text-center">
                    <Building2 className="mx-auto h-4 w-4 text-muted-foreground" />
                    <p className="mt-1 text-lg font-bold">{activeTasks}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>

                {commEmployees.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Assigned Staff</p>
                    <div className="flex flex-wrap gap-1">
                      {commEmployees.slice(0, 4).map((emp) => (
                        <span
                          key={emp.id}
                          className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {emp.name.split(" ")[0]}
                        </span>
                      ))}
                      {commEmployees.length > 4 && (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                          +{commEmployees.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {(perms.canEditCommunity || perms.canDeleteCommunity) && (
                <div className="mt-4 flex gap-2 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  {perms.canEditCommunity && (
                  <Dialog
                    open={editingId === comm.id}
                    onOpenChange={(open) => setEditingId(open ? comm.id : null)}
                  >
                    <DialogTrigger className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
                        <Pencil className="h-3 w-3" /> Edit
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Community</DialogTitle>
                      </DialogHeader>
                      <CommunityForm
                        initial={comm}
                        onSave={(data) => updateCommunity(comm.id, data)}
                        onClose={() => setEditingId(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  )}
                  {perms.canDeleteCommunity && (
                  <button
                    onClick={() => deleteCommunity(comm.id)}
                    className="flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                  )}
                </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
