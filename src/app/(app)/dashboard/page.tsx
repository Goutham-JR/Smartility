"use client";

import { useStore } from "@/lib/store";
import { getPermissions } from "@/lib/permissions";
import { Users, Building2, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const attendanceData = [
  { day: "Mon", rate: 92 },
  { day: "Tue", rate: 88 },
  { day: "Wed", rate: 95 },
  { day: "Thu", rate: 85 },
  { day: "Fri", rate: 91 },
  { day: "Sat", rate: 78 },
  { day: "Sun", rate: 70 },
];

const taskData = [
  { month: "Jan", completed: 24, pending: 8 },
  { month: "Feb", completed: 30, pending: 5 },
  { month: "Mar", completed: 28, pending: 12 },
  { month: "Apr", completed: 35, pending: 6 },
];

const insights = [
  { text: "Attendance dropped by 12% this weekend", type: "warning" as const },
  { text: "3 high-priority tasks need immediate attention", type: "alert" as const },
  { text: "TechPark Plaza has only 2 staff assigned", type: "warning" as const },
  { text: "Task completion rate improved by 8% this month", type: "success" as const },
];

const recentActivity = [
  { text: "Rajesh Kumar clocked in at Sunrise Towers", time: "2 min ago" },
  { text: "Water leak task marked as In Progress", time: "15 min ago" },
  { text: "New employee Karan Malhotra added", time: "1 hour ago" },
  { text: "Security camera repair task created", time: "2 hours ago" },
  { text: "Monthly garden maintenance completed", time: "3 hours ago" },
];

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame: number;
    const duration = 1000;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function DashboardPage() {
  const { employees, communities, tasks, userRole, userName } = useStore();
  const perms = getPermissions(userRole);
  const activeEmployees = employees.filter((e) => e.status === "Active").length;
  const activeTasks = tasks.filter((t) => t.status !== "Completed").length;
  const avgAttendance = Math.round(attendanceData.reduce((a, b) => a + b.rate, 0) / attendanceData.length);

  const kpis = [
    { label: "Total Employees", value: employees.length, icon: Users, color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30", trend: "+2 this week", up: true },
    { label: "Communities", value: communities.length, icon: Building2, color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30", trend: "All active", up: true },
    { label: "Avg Attendance", value: avgAttendance, suffix: "%", icon: CheckCircle2, color: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30", trend: "-3% vs last week", up: false },
    { label: "Active Issues", value: activeTasks, icon: AlertTriangle, color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30", trend: `${tasks.filter((t) => t.priority === "High").length} high priority`, up: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {userName}. Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-sm animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">
                    <AnimatedCounter target={kpi.value} suffix={kpi.suffix} />
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                {kpi.up ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-amber-500" />
                )}
                <span className="text-muted-foreground">{kpi.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts - Admin & Manager only */}
      {perms.canViewInsights && (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.2 260)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.55 0.2 260)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}
                />
                <Area type="monotone" dataKey="rate" stroke="oklch(0.55 0.2 260)" fill="url(#attendGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}
                />
                <Bar dataKey="completed" fill="oklch(0.55 0.2 260)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" fill="oklch(0.75 0.15 50)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      )}

      {/* AI Insights + Activity */}
      {perms.canViewInsights && (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs">AI</span>
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((ins, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl p-3 text-sm ${
                  ins.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                    : ins.type === "alert"
                    ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                    : "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                }`}
              >
                {ins.type === "success" ? (
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                {ins.text}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
}
