"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Users, Home, UserCog } from "lucide-react";

export default function UsersPage() {
  const { employees, residents, communities, updateEmployee, updateResident } = useStore();
  const [search, setSearch] = useState("");
  const getCommunityName = (id?: string) => { if (!id) return "-"; return communities.find((c) => c.id === id)?.name ?? "Unknown"; };

  const allUsers = [
    ...employees.map((e) => ({ id: e.id, name: e.name, type: "Employee" as const, detail: e.role, community: getCommunityName(e.communityId), status: e.status, raw: e })),
    ...residents.map((r) => ({ id: r.id, name: r.name, type: "Resident" as const, detail: `Flat ${r.flatNumber}`, community: getCommunityName(r.communityId), status: r.status, raw: r })),
  ];

  const filteredAll = allUsers.filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()));
  const filteredEmployees = filteredAll.filter((u) => u.type === "Employee");
  const filteredResidents = filteredAll.filter((u) => u.type === "Resident");

  const toggleStatus = async (user: typeof allUsers[0]) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    if (user.type === "Employee") await updateEmployee(user.id, { status: newStatus });
    else await updateResident(user.id, { status: newStatus });
  };

  const UserTable = ({ users }: { users: typeof allUsers }) => (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-accent/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Detail</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Community</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-xs">{u.type === "Employee" ? <><Users className="mr-1 h-3 w-3 inline" />{u.type}</> : <><Home className="mr-1 h-3 w-3 inline" />{u.type}</>}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.detail}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.community}</td>
                <td className="px-4 py-3"><Badge variant={u.status === "Active" ? "default" : "secondary"} className="text-xs">{u.status}</Badge></td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(u)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium ${u.status === "Active" ? "bg-destructive/10 text-destructive" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30"}`}>
                    {u.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">{allUsers.length} total users ({employees.length} employees, {residents.length} residents)</p>
        </div>
        <UserCog className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({filteredAll.length})</TabsTrigger>
          <TabsTrigger value="employees">Employees ({filteredEmployees.length})</TabsTrigger>
          <TabsTrigger value="residents">Residents ({filteredResidents.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4"><UserTable users={filteredAll} /></TabsContent>
        <TabsContent value="employees" className="mt-4"><UserTable users={filteredEmployees} /></TabsContent>
        <TabsContent value="residents" className="mt-4"><UserTable users={filteredResidents} /></TabsContent>
      </Tabs>
    </div>
  );
}
