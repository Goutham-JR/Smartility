import { create } from "zustand";
import { employeesApi, communitiesApi, tasksApi, residentsApi, ticketsApi } from "./api";

export type Role = "Admin" | "Manager" | "Staff" | "Resident";

export interface Employee { id: string; name: string; role: string; phone: string; status: "Active" | "Inactive"; communityId?: string; }
export interface Community { id: string; name: string; address: string; employeeIds: string[]; type: string; }
export interface Task { id: string; title: string; description: string; assigneeId?: string; communityId?: string; status: "Pending" | "In Progress" | "Completed"; priority: "Low" | "Medium" | "High"; createdAt: string; }
export interface Resident { id: string; name: string; phone: string; email: string; communityId: string; flatNumber: string; status: "Active" | "Inactive"; }
export interface Ticket { id: string; title: string; description: string; category: string; residentId: string; communityId: string; assigneeId?: string; status: "Open" | "In Progress" | "Resolved" | "Closed"; priority: "Low" | "Medium" | "High" | "Urgent"; createdAt: string; }
export interface Notification { id: string; message: string; type: "success" | "error" | "info"; timestamp: number; }
export interface ChatMessage { id: string; role: "user" | "assistant"; content: string; }

interface AppState {
  isAuthenticated: boolean; userRole: Role; userName: string;
  staffEmployeeId: string | null; residentId: string | null;
  login: (role: Role, entityId?: string, entityName?: string) => void; logout: () => void;
  sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void;
  loading: boolean; fetchAll: () => Promise<void>;
  employees: Employee[]; addEmployee: (e: Omit<Employee, "id">) => Promise<void>; updateEmployee: (id: string, d: Partial<Employee>) => Promise<void>; deleteEmployee: (id: string) => Promise<void>;
  communities: Community[]; addCommunity: (c: Omit<Community, "id">) => Promise<void>; updateCommunity: (id: string, d: Partial<Community>) => Promise<void>; deleteCommunity: (id: string) => Promise<void>;
  tasks: Task[]; addTask: (t: Omit<Task, "id" | "createdAt">) => Promise<void>; updateTask: (id: string, d: Partial<Task>) => Promise<void>; deleteTask: (id: string) => Promise<void>; completeTask: (id: string) => Promise<void>; reassignTask: (id: string, newId: string) => Promise<void>;
  residents: Resident[]; addResident: (r: Omit<Resident, "id">) => Promise<void>; updateResident: (id: string, d: Partial<Resident>) => Promise<void>; deleteResident: (id: string) => Promise<void>;
  tickets: Ticket[]; addTicket: (t: Record<string, unknown>) => Promise<void>; updateTicket: (id: string, d: Partial<Ticket>) => Promise<void>; deleteTicket: (id: string) => Promise<void>; assignTicket: (id: string, assigneeId: string) => Promise<void>; resolveTicket: (id: string) => Promise<void>; closeTicket: (id: string) => Promise<void>;
  notifications: Notification[]; addNotification: (msg: string, type?: "success" | "error" | "info") => void; removeNotification: (id: string) => void;
  chatMessages: ChatMessage[]; chatOpen: boolean; setChatOpen: (o: boolean) => void; addChatMessage: (m: Omit<ChatMessage, "id">) => void; clearChat: () => void;
  darkMode: boolean; toggleDarkMode: () => void;
}

let notifId = 0;
const uid = () => Math.random().toString(36).slice(2, 10);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEmployee(e: any): Employee { return { id: e._id, name: e.name, role: e.role, phone: e.phone, status: e.status, communityId: e.communityId || undefined }; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCommunity(c: any): Community { return { id: c._id, name: c.name, address: c.address, type: c.type, employeeIds: c.employeeIds }; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTask(t: any): Task { return { id: t._id, title: t.title, description: t.description, assigneeId: t.assigneeId || undefined, communityId: t.communityId || undefined, status: t.status, priority: t.priority, createdAt: t.createdAt?.slice(0, 10) || "" }; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapResident(r: any): Resident { return { id: r._id, name: r.name, phone: r.phone, email: r.email, communityId: r.communityId, flatNumber: r.flatNumber, status: r.status }; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTicket(t: any): Ticket { return { id: t._id, title: t.title, description: t.description, category: t.category, residentId: t.residentId, communityId: t.communityId, assigneeId: t.assigneeId || undefined, status: t.status, priority: t.priority, createdAt: t.createdAt?.slice(0, 10) || "" }; }

function saveAuth(role: Role, entityId?: string, entityName?: string) {
  const name = entityName || `${role} User`;
  const staffEmployeeId = role === "Staff" ? (entityId || null) : null;
  const residentId = role === "Resident" ? (entityId || null) : null;
  try { localStorage.setItem("smartility_auth", JSON.stringify({ isAuthenticated: true, userRole: role, userName: name, staffEmployeeId, residentId })); } catch {}
}
function clearAuth() { try { localStorage.removeItem("smartility_auth"); } catch {} }

export function hydrateAuth() {
  try { const s = localStorage.getItem("smartility_auth"); if (s) useStore.setState(JSON.parse(s)); } catch {}
}

export const useStore = create<AppState>((set, get) => ({
  isAuthenticated: false, userRole: "Admin", userName: "Demo User", staffEmployeeId: null, residentId: null,
  login: (role, entityId, entityName) => {
    saveAuth(role, entityId, entityName);
    const name = entityName || `${role} User`;
    set({ isAuthenticated: true, userRole: role, userName: name, staffEmployeeId: role === "Staff" ? (entityId || null) : null, residentId: role === "Resident" ? (entityId || null) : null });
  },
  logout: () => { clearAuth(); set({ isAuthenticated: false, userRole: "Admin", userName: "Demo User", staffEmployeeId: null, residentId: null }); },

  sidebarOpen: true, setSidebarOpen: (o) => set({ sidebarOpen: o }),

  loading: false,
  fetchAll: async () => {
    set({ loading: true });
    try {
      const [emps, comms, tsks, ress, tkts] = await Promise.all([
        employeesApi.getAll(), communitiesApi.getAll(), tasksApi.getAll(), residentsApi.getAll(), ticketsApi.getAll(),
      ]);
      set({ employees: emps.map(mapEmployee), communities: comms.map(mapCommunity), tasks: tsks.map(mapTask), residents: ress.map(mapResident), tickets: tkts.map(mapTicket), loading: false });
    } catch (err) { console.error("Fetch failed:", err); get().addNotification("Failed to load data", "error"); set({ loading: false }); }
  },

  // Employees
  employees: [],
  addEmployee: async (emp) => { try { const c = await employeesApi.create(emp as never); set((s) => ({ employees: [mapEmployee(c), ...s.employees] })); get().addNotification(`Employee "${emp.name}" added`); } catch { get().addNotification("Failed to add employee", "error"); } },
  updateEmployee: async (id, d) => { try { const u = await employeesApi.update(id, d); set((s) => ({ employees: s.employees.map((e) => e.id === id ? mapEmployee(u) : e) })); get().addNotification("Employee updated"); } catch { get().addNotification("Failed to update", "error"); } },
  deleteEmployee: async (id) => { const emp = get().employees.find((e) => e.id === id); try { await employeesApi.delete(id); set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })); if (emp) get().addNotification(`Employee "${emp.name}" removed`); } catch { get().addNotification("Failed to delete", "error"); } },

  // Communities
  communities: [],
  addCommunity: async (c) => { try { const n = await communitiesApi.create(c as never); set((s) => ({ communities: [mapCommunity(n), ...s.communities] })); get().addNotification(`Community "${c.name}" added`); } catch { get().addNotification("Failed to add community", "error"); } },
  updateCommunity: async (id, d) => { try { const u = await communitiesApi.update(id, d); set((s) => ({ communities: s.communities.map((c) => c.id === id ? mapCommunity(u) : c) })); get().addNotification("Community updated"); } catch { get().addNotification("Failed to update", "error"); } },
  deleteCommunity: async (id) => { const c = get().communities.find((c) => c.id === id); try { await communitiesApi.delete(id); set((s) => ({ communities: s.communities.filter((c) => c.id !== id) })); if (c) get().addNotification(`Community "${c.name}" removed`); } catch { get().addNotification("Failed to delete", "error"); } },

  // Tasks
  tasks: [],
  addTask: async (t) => { try { const n = await tasksApi.create(t as never); set((s) => ({ tasks: [mapTask(n), ...s.tasks] })); get().addNotification(`Task "${t.title}" created`); } catch { get().addNotification("Failed to create task", "error"); } },
  updateTask: async (id, d) => { try { const u = await tasksApi.update(id, d); set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? mapTask(u) : t) })); get().addNotification("Task updated"); } catch { get().addNotification("Failed to update", "error"); } },
  deleteTask: async (id) => { const t = get().tasks.find((t) => t.id === id); try { await tasksApi.delete(id); set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })); if (t) get().addNotification(`Task "${t.title}" removed`); } catch { get().addNotification("Failed to delete", "error"); } },
  completeTask: async (id) => { const { userName, userRole } = get(); try { const u = await tasksApi.complete(id, userName, userRole); set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? mapTask(u) : t) })); get().addNotification("Task completed"); } catch { get().addNotification("Failed to complete", "error"); } },
  reassignTask: async (id, newId) => { const { userName, userRole } = get(); try { const u = await tasksApi.reassign(id, newId, userName, userRole); set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? mapTask(u) : t) })); const emp = get().employees.find((e) => e.id === newId); get().addNotification(`Task reassigned to ${emp?.name || "employee"}`); } catch { get().addNotification("Failed to reassign", "error"); } },

  // Residents
  residents: [],
  addResident: async (r) => { try { const n = await residentsApi.create(r as never); set((s) => ({ residents: [mapResident(n), ...s.residents] })); get().addNotification(`Resident "${r.name}" added`); } catch { get().addNotification("Failed to add resident", "error"); } },
  updateResident: async (id, d) => { try { const u = await residentsApi.update(id, d); set((s) => ({ residents: s.residents.map((r) => r.id === id ? mapResident(u) : r) })); get().addNotification("Resident updated"); } catch { get().addNotification("Failed to update", "error"); } },
  deleteResident: async (id) => { const r = get().residents.find((r) => r.id === id); try { await residentsApi.delete(id); set((s) => ({ residents: s.residents.filter((r) => r.id !== id) })); if (r) get().addNotification(`Resident "${r.name}" removed`); } catch { get().addNotification("Failed to delete", "error"); } },

  // Tickets
  tickets: [],
  addTicket: async (t) => { try { const n = await ticketsApi.create(t); set((s) => ({ tickets: [mapTicket(n), ...s.tickets] })); get().addNotification("Ticket raised successfully"); } catch { get().addNotification("Failed to raise ticket", "error"); } },
  updateTicket: async (id, d) => { try { const u = await ticketsApi.update(id, d); set((s) => ({ tickets: s.tickets.map((t) => t.id === id ? mapTicket(u) : t) })); get().addNotification("Ticket updated"); } catch { get().addNotification("Failed to update", "error"); } },
  deleteTicket: async (id) => { try { await ticketsApi.delete(id); set((s) => ({ tickets: s.tickets.filter((t) => t.id !== id) })); get().addNotification("Ticket deleted"); } catch { get().addNotification("Failed to delete", "error"); } },
  assignTicket: async (id, assigneeId) => { const { userName, userRole } = get(); try { const u = await ticketsApi.assign(id, assigneeId, userName, userRole); set((s) => ({ tickets: s.tickets.map((t) => t.id === id ? mapTicket(u) : t) })); const emp = get().employees.find((e) => e.id === assigneeId); get().addNotification(`Ticket assigned to ${emp?.name || "employee"}`); } catch { get().addNotification("Failed to assign", "error"); } },
  resolveTicket: async (id) => { const { userName, userRole } = get(); try { const u = await ticketsApi.resolve(id, userName, userRole); set((s) => ({ tickets: s.tickets.map((t) => t.id === id ? mapTicket(u) : t) })); get().addNotification("Ticket resolved"); } catch { get().addNotification("Failed to resolve", "error"); } },
  closeTicket: async (id) => { const { userName, userRole } = get(); try { const u = await ticketsApi.close(id, userName, userRole); set((s) => ({ tickets: s.tickets.map((t) => t.id === id ? mapTicket(u) : t) })); get().addNotification("Ticket closed"); } catch { get().addNotification("Failed to close", "error"); } },

  // Notifications
  notifications: [],
  addNotification: (message, type = "success") => { const id = String(++notifId); set((s) => ({ notifications: [...s.notifications, { id, message, type, timestamp: Date.now() }] })); setTimeout(() => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })), 4000); },
  removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  // Chat
  chatMessages: [], chatOpen: false,
  setChatOpen: (o) => set({ chatOpen: o }),
  addChatMessage: (m) => set((s) => ({ chatMessages: [...s.chatMessages, { ...m, id: uid() }] })),
  clearChat: () => set({ chatMessages: [] }),

  // Dark mode
  darkMode: false,
  toggleDarkMode: () => set((s) => { const n = !s.darkMode; if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", n); return { darkMode: n }; }),
}));
