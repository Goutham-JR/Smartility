"use client";

import { useState } from "react";
import { useStore, Resident } from "@/lib/store";
import { getPermissions } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Home, Phone, Mail, MapPin, Pencil, Trash2 } from "lucide-react";

function ResidentForm({ initial, onSave, onClose }: { initial?: Resident; onSave: (d: Omit<Resident, "id">) => void; onClose: () => void }) {
  const { communities } = useStore();
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [communityId, setCommunityId] = useState(initial?.communityId ?? (communities[0]?.id || ""));
  const [flatNumber, setFlatNumber] = useState(initial?.flatNumber ?? "");
  const [status, setStatus] = useState<"Active" | "Inactive">(initial?.status ?? "Active");

  return (
    <div className="space-y-4">
      <div><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" className="mt-1" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="mt-1" /></div>
        <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="mt-1" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Community</Label>
          <select value={communityId} onChange={(e) => setCommunityId(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            {communities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><Label>Flat / Door No.</Label><Input value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} placeholder="A-304" className="mt-1" /></div>
      </div>
      <div><Label>Status</Label>
        <div className="mt-1 flex gap-2">
          {(["Active", "Inactive"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${status === s ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={() => { if (!name.trim() || !flatNumber.trim()) return; onSave({ name, phone, email, communityId, flatNumber, status }); onClose(); }}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">{initial ? "Update" : "Add"} Resident</button>
        <button onClick={onClose} className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-muted-foreground">Cancel</button>
      </div>
    </div>
  );
}

export default function ResidentsPage() {
  const { residents, addResident, updateResident, deleteResident, communities, userRole } = useStore();
  const perms = getPermissions(userRole);
  const [search, setSearch] = useState("");
  const [filterCommunity, setFilterCommunity] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = residents.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.flatNumber.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCommunity !== "All" && r.communityId !== filterCommunity) return false;
    return true;
  });

  const getCommunityName = (id: string) => communities.find((c) => c.id === id)?.name ?? "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Residents</h1>
          <p className="text-muted-foreground">{residents.length} total residents</p>
        </div>
        {perms.canAddResident && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90">
              <Plus className="h-4 w-4" /> Add Resident
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Add New Resident</DialogTitle></DialogHeader>
              <ResidentForm onSave={(d) => addResident(d)} onClose={() => setAddOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search residents or flat no..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={filterCommunity} onChange={(e) => setFilterCommunity(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option value="All">All Communities</option>
          {communities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16">
          <Home className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">No residents found</p>
          <p className="text-sm text-muted-foreground">Add residents to track their details</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((res) => (
          <Card key={res.id} className="group overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">{res.name[0]}</div>
                  <div>
                    <p className="font-semibold">{res.name}</p>
                    <p className="text-sm text-muted-foreground">Flat {res.flatNumber}</p>
                  </div>
                </div>
                <Badge variant={res.status === "Active" ? "default" : "secondary"} className="text-xs">{res.status}</Badge>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {getCommunityName(res.communityId)}</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {res.phone || "-"}</div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {res.email || "-"}</div>
              </div>
              {(perms.canEditResident || perms.canDeleteResident) && (
                <div className="mt-4 flex gap-2 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  {perms.canEditResident && (
                    <Dialog open={editingId === res.id} onOpenChange={(o) => setEditingId(o ? res.id : null)}>
                      <DialogTrigger className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
                        <Pencil className="h-3 w-3" /> Edit
                      </DialogTrigger>
                      <DialogContent className="rounded-2xl">
                        <DialogHeader><DialogTitle>Edit Resident</DialogTitle></DialogHeader>
                        <ResidentForm initial={res} onSave={(d) => updateResident(res.id, d)} onClose={() => setEditingId(null)} />
                      </DialogContent>
                    </Dialog>
                  )}
                  {perms.canDeleteResident && (
                    <button onClick={() => deleteResident(res.id)} className="flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
