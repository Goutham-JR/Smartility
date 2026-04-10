"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore, Role } from "@/lib/store";
import { employeesApi, residentsApi, ApiEmployee, ApiResident } from "@/lib/api";
import { Zap, Shield, Users, Wrench, Home } from "lucide-react";

const roles: { role: Role; icon: typeof Shield; desc: string }[] = [
  { role: "Admin", icon: Shield, desc: "Full access to all features" },
  { role: "Manager", icon: Users, desc: "Manage employees & tasks" },
  { role: "Staff", icon: Wrench, desc: "View your assigned tasks" },
  { role: "Resident", icon: Home, desc: "Raise tickets & track issues" },
];

export default function LoginPage() {
  const [selected, setSelected] = useState<Role>("Admin");
  const [entityId, setEntityId] = useState("");
  const [employeeList, setEmployeeList] = useState<ApiEmployee[]>([]);
  const [residentList, setResidentList] = useState<ApiResident[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const { login, isAuthenticated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (selected === "Staff" && employeeList.length === 0) {
      setLoadingList(true);
      employeesApi.getAll().then((emps) => {
        const active = emps.filter((e) => e.status === "Active");
        setEmployeeList(active);
        if (active.length > 0) setEntityId(active[0]._id);
      }).catch(() => {}).finally(() => setLoadingList(false));
    }
    if (selected === "Resident" && residentList.length === 0) {
      setLoadingList(true);
      residentsApi.getAll().then((res) => {
        const active = res.filter((r) => r.status === "Active");
        setResidentList(active);
        if (active.length > 0) setEntityId(active[0]._id);
      }).catch(() => {}).finally(() => setLoadingList(false));
    }
    if (selected === "Admin" || selected === "Manager") setEntityId("");
  }, [selected, employeeList.length, residentList.length]);

  const handleLogin = () => {
    if (selected === "Staff") {
      const emp = employeeList.find((e) => e._id === entityId);
      login(selected, entityId, emp?.name || "Staff User");
    } else if (selected === "Resident") {
      const res = residentList.find((r) => r._id === entityId);
      login(selected, entityId, res?.name || "Resident User");
    } else {
      login(selected);
    }
  };

  const needsPicker = selected === "Staff" || selected === "Resident";
  const canLogin = !needsPicker || entityId;
  const pickerList = selected === "Staff" ? employeeList : residentList;
  const entityName = selected === "Staff"
    ? employeeList.find((e) => e._id === entityId)?.name
    : residentList.find((r) => r._id === entityId)?.name;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/30 to-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Zap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Smartility</h1>
          <p className="mt-1 text-muted-foreground">AI-Powered Facility Management</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <h2 className="mb-1 text-lg font-semibold">Welcome back</h2>
          <p className="mb-6 text-sm text-muted-foreground">Select your role to continue</p>

          <div className="grid grid-cols-2 gap-3">
            {roles.map(({ role, icon: Icon, desc }) => (
              <button key={role} onClick={() => { setSelected(role); setEntityId(""); }}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 ${selected === role ? "border-primary bg-primary/5 shadow-sm" : "border-transparent bg-accent/50 hover:border-border"}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected === role ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{role}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </button>
            ))}
          </div>

          {needsPicker && (
            <div className="mt-4 rounded-xl border border-border bg-accent/30 p-4 animate-fade-in">
              <p className="mb-2 text-sm font-medium">Select your identity</p>
              {loadingList ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <select value={entityId} onChange={(e) => setEntityId(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
                  {pickerList.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} - {"role" in item ? item.role : `Flat ${(item as ApiResident).flatNumber}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <button onClick={handleLogin} disabled={!canLogin}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50">
            {needsPicker && entityName ? `Continue as ${entityName}` : `Continue as ${selected}`}
          </button>

          <p className="mt-4 text-center text-xs text-muted-foreground">Demo mode - no credentials required</p>
        </div>
      </div>
    </div>
  );
}
