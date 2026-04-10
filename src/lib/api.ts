const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3015/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// Employees
export const employeesApi = {
  getAll: () => request<ApiEmployee[]>("/employees"),
  create: (data: Omit<ApiEmployee, "_id">) => request<ApiEmployee>("/employees", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ApiEmployee>) => request<ApiEmployee>(`/employees/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/employees/${id}`, { method: "DELETE" }),
};

// Communities
export const communitiesApi = {
  getAll: () => request<ApiCommunity[]>("/communities"),
  create: (data: Omit<ApiCommunity, "_id">) => request<ApiCommunity>("/communities", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ApiCommunity>) => request<ApiCommunity>(`/communities/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/communities/${id}`, { method: "DELETE" }),
};

// Tasks
export const tasksApi = {
  getAll: () => request<ApiTask[]>("/tasks"),
  create: (data: Omit<ApiTask, "_id">) => request<ApiTask>("/tasks", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ApiTask>) => request<ApiTask>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/tasks/${id}`, { method: "DELETE" }),
  complete: (id: string, performedBy: string, performedByRole: string) =>
    request<ApiTask>(`/tasks/${id}/complete`, { method: "POST", body: JSON.stringify({ performedBy, performedByRole }) }),
  reassign: (id: string, newAssigneeId: string, performedBy: string, performedByRole: string) =>
    request<ApiTask>(`/tasks/${id}/reassign`, { method: "POST", body: JSON.stringify({ newAssigneeId, performedBy, performedByRole }) }),
};

// Residents
export const residentsApi = {
  getAll: () => request<ApiResident[]>("/residents"),
  create: (data: Omit<ApiResident, "_id">) => request<ApiResident>("/residents", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ApiResident>) => request<ApiResident>(`/residents/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/residents/${id}`, { method: "DELETE" }),
};

// Tickets
export const ticketsApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<ApiTicket[]>(`/tickets${qs}`);
  },
  create: (data: Record<string, unknown>) => request<ApiTicket>("/tickets", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ApiTicket>) => request<ApiTicket>(`/tickets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/tickets/${id}`, { method: "DELETE" }),
  assign: (id: string, assigneeId: string, performedBy: string, performedByRole: string) =>
    request<ApiTicket>(`/tickets/${id}/assign`, { method: "POST", body: JSON.stringify({ assigneeId, performedBy, performedByRole }) }),
  resolve: (id: string, performedBy: string, performedByRole: string) =>
    request<ApiTicket>(`/tickets/${id}/resolve`, { method: "POST", body: JSON.stringify({ performedBy, performedByRole }) }),
  close: (id: string, performedBy: string, performedByRole: string) =>
    request<ApiTicket>(`/tickets/${id}/close`, { method: "POST", body: JSON.stringify({ performedBy, performedByRole }) }),
};

// Attendance
export const attendanceApi = {
  getByDate: (date: string) => request<ApiAttendance[]>(`/attendance?date=${date}`),
  getByEmployee: (id: string, month: string) => request<ApiAttendance[]>(`/attendance/employee/${id}?month=${month}`),
  clockIn: (employeeId: string, communityId?: string) =>
    request<ApiAttendance>("/attendance/clock-in", { method: "POST", body: JSON.stringify({ employeeId, communityId }) }),
  clockOut: (employeeId: string) =>
    request<ApiAttendance>("/attendance/clock-out", { method: "POST", body: JSON.stringify({ employeeId }) }),
  create: (data: Record<string, unknown>) => request<ApiAttendance>("/attendance", { method: "POST", body: JSON.stringify(data) }),
  getStats: (date: string) => request<AttendanceStats>(`/attendance/stats?date=${date}`),
};

// Water Levels
export const waterLevelsApi = {
  getAll: (communityId?: string) => {
    const qs = communityId ? `?communityId=${communityId}` : "";
    return request<ApiWaterLevel[]>(`/water-levels${qs}`);
  },
  getLatest: () => request<ApiWaterLevel[]>("/water-levels/latest"),
  create: (data: Record<string, unknown>) => request<ApiWaterLevel>("/water-levels", { method: "POST", body: JSON.stringify(data) }),
};

// Logs
export const logsApi = {
  getAll: (page = 1, limit = 50) => request<LogsResponse>(`/logs?page=${page}&limit=${limit}`),
};

// Dashboard stats
export const dashboardApi = {
  getStats: () => request<DashboardStats>("/tasks/stats/dashboard"),
};

// Types
export interface ApiEmployee { _id: string; name: string; role: string; phone: string; status: "Active" | "Inactive"; communityId?: string | null; createdAt?: string; }
export interface ApiCommunity { _id: string; name: string; address: string; type: string; employeeIds: string[]; createdAt?: string; }
export interface ApiTask { _id: string; title: string; description: string; assigneeId?: string | null; communityId?: string | null; status: "Pending" | "In Progress" | "Completed"; priority: "Low" | "Medium" | "High"; createdAt?: string; }
export interface ApiResident { _id: string; name: string; phone: string; email: string; communityId: string; flatNumber: string; status: "Active" | "Inactive"; createdAt?: string; }
export interface ApiTicket { _id: string; title: string; description: string; category: string; residentId: string; communityId: string; assigneeId?: string | null; status: "Open" | "In Progress" | "Resolved" | "Closed"; priority: "Low" | "Medium" | "High" | "Urgent"; createdAt?: string; }
export interface ApiAttendance { _id: string; employeeId: string; communityId?: string | null; date: string; clockIn?: string | null; clockOut?: string | null; status: "Present" | "Absent" | "Late" | "Half Day"; createdAt?: string; }
export interface ApiWaterLevel { _id: string; communityId: string; tankName: string; levelPercent: number; recordedAt: string; recordedBy: string; }
export interface AttendanceStats { date: string; totalEmployees: number; present: number; late: number; halfDay: number; absent: number; attendanceRate: number; }
export interface DashboardStats { totalEmployees: number; activeEmployees: number; totalCommunities: number; totalTasks: number; pending: number; inProgress: number; completed: number; highPriority: number; }
export interface ApiLog { _id: string; action: string; performedBy: string; performedByRole: string; targetType: string; targetId?: string; targetName: string; details: string; createdAt: string; }
export interface LogsResponse { logs: ApiLog[]; total: number; page: number; totalPages: number; }
