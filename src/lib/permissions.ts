import type { Role } from "./store";

export const permissions = {
  Admin: {
    canAddEmployee: true, canEditEmployee: true, canDeleteEmployee: true,
    canAddCommunity: true, canEditCommunity: true, canDeleteCommunity: true,
    canAddTask: true, canEditTask: true, canDeleteTask: true,
    canExport: true, canViewAllTasks: true, canViewInsights: true,
    canViewResidents: true, canAddResident: true, canEditResident: true, canDeleteResident: true,
    canViewTickets: true, canManageTickets: true, canDeleteTicket: true, canRaiseTicket: false, canCloseTicket: false,
    canViewAttendance: true, canManageAttendance: true,
    canViewWaterLevels: true, canManageWaterLevels: true,
    canManageUsers: true,
  },
  Manager: {
    canAddEmployee: true, canEditEmployee: true, canDeleteEmployee: false,
    canAddCommunity: true, canEditCommunity: true, canDeleteCommunity: false,
    canAddTask: true, canEditTask: true, canDeleteTask: false,
    canExport: true, canViewAllTasks: true, canViewInsights: true,
    canViewResidents: true, canAddResident: true, canEditResident: true, canDeleteResident: false,
    canViewTickets: true, canManageTickets: true, canDeleteTicket: false, canRaiseTicket: false, canCloseTicket: false,
    canViewAttendance: true, canManageAttendance: true,
    canViewWaterLevels: true, canManageWaterLevels: true,
    canManageUsers: false,
  },
  Staff: {
    canAddEmployee: false, canEditEmployee: false, canDeleteEmployee: false,
    canAddCommunity: false, canEditCommunity: false, canDeleteCommunity: false,
    canAddTask: false, canEditTask: false, canDeleteTask: false,
    canExport: false, canViewAllTasks: false, canViewInsights: false,
    canViewResidents: false, canAddResident: false, canEditResident: false, canDeleteResident: false,
    canViewTickets: true, canManageTickets: false, canDeleteTicket: false, canRaiseTicket: false, canCloseTicket: false,
    canViewAttendance: true, canManageAttendance: false,
    canViewWaterLevels: true, canManageWaterLevels: true,
    canManageUsers: false,
  },
  Resident: {
    canAddEmployee: false, canEditEmployee: false, canDeleteEmployee: false,
    canAddCommunity: false, canEditCommunity: false, canDeleteCommunity: false,
    canAddTask: false, canEditTask: false, canDeleteTask: false,
    canExport: false, canViewAllTasks: false, canViewInsights: false,
    canViewResidents: false, canAddResident: false, canEditResident: false, canDeleteResident: false,
    canViewTickets: true, canManageTickets: false, canDeleteTicket: false, canRaiseTicket: true, canCloseTicket: true,
    canViewAttendance: false, canManageAttendance: false,
    canViewWaterLevels: false, canManageWaterLevels: false,
    canManageUsers: false,
  },
} as const;

export function getPermissions(role: Role) {
  return permissions[role];
}
