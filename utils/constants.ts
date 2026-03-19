// utils/constants.ts
import { UserRole } from '~/types/auth'

export const ROLE_LABELS: Record<string, string> = {
  [UserRole.SUPERADMIN]: 'SuperAdministrador',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.RECEPCIONISTA]: 'Recepcionista',
  [UserRole.CLIENTE]: 'Cliente',
  [UserRole.CAFETERIA]: 'Cafetería',
  [UserRole.LAVANDERIA]: 'Lavandería',
  [UserRole.SPA]: 'Spa',
  [UserRole.ROOM_SERVICE]: 'Room Service',
}

export const ROLE_COLORS: Record<string, string> = {
  [UserRole.SUPERADMIN]: 'success',
  [UserRole.ADMIN]: 'error',
  [UserRole.RECEPCIONISTA]: 'warning',
  [UserRole.CLIENTE]: 'primary',
  [UserRole.CAFETERIA]: 'orange',
  [UserRole.LAVANDERIA]: 'purple',
  [UserRole.SPA]: 'pink',
  [UserRole.ROOM_SERVICE]: 'indigo',
}

export const ROLE_ICONS: Record<string, string> = {
  [UserRole.SUPERADMIN]: 'mdi-shield-admin',
  [UserRole.ADMIN]: 'mdi-shield-crown',
  [UserRole.RECEPCIONISTA]: 'mdi-account-tie',
  [UserRole.CLIENTE]: 'mdi-account',
  [UserRole.CAFETERIA]: 'mdi-coffee',
  [UserRole.LAVANDERIA]: 'mdi-washing-machine',
  [UserRole.SPA]: 'mdi-spa',
  [UserRole.ROOM_SERVICE]: 'mdi-bell-service-outline',
}

export const ROLE_DEFAULT_ROUTE: Record<string, string> = {
  [UserRole.SUPERADMIN]: '/superadmin',
  [UserRole.ADMIN]: '/admin',
  [UserRole.RECEPCIONISTA]: '/recepcionista',
  [UserRole.CLIENTE]: '/cliente',
  [UserRole.CAFETERIA]: '/reportes/area/cafeteria',
  [UserRole.LAVANDERIA]: '/reportes/area/lavanderia',
  [UserRole.SPA]: '/reportes/area/spa',
  [UserRole.ROOM_SERVICE]: '/reportes/area/room-service',
}
