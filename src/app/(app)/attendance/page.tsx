"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { getPermissions } from "@/lib/permissions";
import { attendanceApi, ApiAttendance, AttendanceStats } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, UserCheck, UserX, AlertTriangle, LogIn, LogOut } from "lucide-react";

const statusColors: Record<string, string> = {
  Present: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  Absent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Late: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "Half Day": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

function formatTime(dateStr?: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function AttendancePage() {
  const { employees, userRole, staffEmployeeId, addNotification } = useStore();
  const perms = getPermissions(userRole);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState<ApiAttendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockedIn, setClockedIn] = useState(false);
  const [clockedOut, setClockedOut] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, st] = await Promise.all([attendanceApi.getByDate(date), attendanceApi.getStats(date)]);
      setRecords(recs);
      setStats(st);
      if (staffEmployeeId) {
        const myRec = recs.find((r) => r.employeeId === staffEmployeeId);
        setClockedIn(!!myRec?.clockIn);
        setClockedOut(!!myRec?.clockOut);
      }
    } catch { console.error("Failed to fetch attendance"); }
    setLoading(false);
  }, [date, staffEmployeeId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClockIn = async () => {
    if (!staffEmployeeId) return;
    const emp = employees.find((e) => e.id === staffEmployeeId);
    try {
      await attendanceApi.clockIn(staffEmployeeId, emp?.communityId);
      addNotification("Clocked in successfully");
      fetchData();
    } catch { addNotification("Failed to clock in", "error"); }
  };

  const handleClockOut = async () => {
    if (!staffEmployeeId) return;
    try {
      await attendanceApi.clockOut(staffEmployeeId);
      addNotification("Clocked out successfully");
      fetchData();
    } catch { addNotification("Failed to clock out", "error"); }
  };

  const activeEmployees = employees.filter((e) => e.status === "Active");
  const getEmployeeName = (id: string) => employees.find((e) => e.id === id)?.name ?? "Unknown";
  const getEmployeeRole = (id: string) => employees.find((e) => e.id === id)?.role ?? "";
  const getRecord = (empId: string) => records.find((r) => r.employeeId === empId);

  const isToday = date === new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">{isToday ? "Today" : date}</p>
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </div>

      {/* Staff clock in/out */}
      {userRole === "Staff" && isToday && (
        <Card className="border-0 shadow-sm border-l-4 border-l-primary">
          <CardContent className="flex flex-wrap items-center gap-4 p-5">
            <Clock className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">Your Attendance</p>
              <p className="text-sm text-muted-foreground">{clockedIn ? (clockedOut ? "Shift completed" : "Currently working") : "Not clocked in yet"}</p>
            </div>
            {!clockedIn && (
              <button onClick={handleClockIn} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
                <LogIn className="h-5 w-5" /> Clock In
              </button>
            )}
            {clockedIn && !clockedOut && (
              <button onClick={handleClockOut} className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
                <LogOut className="h-5 w-5" /> Clock Out
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-0 shadow-sm"><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30"><UserCheck className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{stats.present}</p><p className="text-sm text-muted-foreground">Present</p></div>
          </CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{stats.late}</p><p className="text-sm text-muted-foreground">Late</p></div>
          </CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-900/30"><UserX className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{stats.absent}</p><p className="text-sm text-muted-foreground">Absent</p></div>
          </CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Clock className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{stats.attendanceRate}%</p><p className="text-sm text-muted-foreground">Rate</p></div>
          </CardContent></Card>
        </div>
      )}

      {/* Employee table */}
      {(perms.canManageAttendance || perms.canViewAttendance) && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Employee</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Clock In</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Clock Out</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {(userRole === "Staff" ? activeEmployees.filter((e) => e.id === staffEmployeeId) : activeEmployees).map((emp) => {
                  const rec = getRecord(emp.id);
                  return (
                    <tr key={emp.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                      <td className="px-4 py-3 font-medium">{emp.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{emp.role}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatTime(rec?.clockIn)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatTime(rec?.clockOut)}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${statusColors[rec?.status || "Absent"]}`}>{rec?.status || "Absent"}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
