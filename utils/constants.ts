// utils/constants.ts
import { UserRole } from '~/types/auth'

export const ROLE_LABELS: Record<string, string> = {
  [UserRole.SUPERADMIN]: 'SuperAdministrador',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.RECEPCIONISTA]: 'Recepcionista',
  [UserRole.CAJERO]: 'Cajero',
  [UserRole.CLIENTE]: 'Cliente',
  [UserRole.CAFETERIA]: 'Cafetería',
  [UserRole.LAVANDERIA]: 'Lavandería',
  [UserRole.SPA]: 'Spa',
  [UserRole.ROOM_SERVICE]: 'Room Service',
  [UserRole.MINIBAR]: 'Minibar',
  [UserRole.TRANSPORTE]: 'Transporte',
  [UserRole.TOURS]: 'Tours',
  [UserRole.EVENTOS]: 'Eventos',
  [UserRole.MANTENIMIENTO]: 'Mantenimiento',
}

export const ROLE_COLORS: Record<string, string> = {
  [UserRole.SUPERADMIN]: 'success',
  [UserRole.ADMIN]: 'error',
  [UserRole.RECEPCIONISTA]: 'warning',
  [UserRole.CAJERO]: 'green',
  [UserRole.CLIENTE]: 'primary',
  [UserRole.CAFETERIA]: 'orange',
  [UserRole.LAVANDERIA]: 'purple',
  [UserRole.SPA]: 'pink',
  [UserRole.ROOM_SERVICE]: 'indigo',
  [UserRole.MINIBAR]: 'teal',
  [UserRole.TRANSPORTE]: 'blue',
  [UserRole.TOURS]: 'cyan',
  [UserRole.EVENTOS]: 'deep-purple',
  [UserRole.MANTENIMIENTO]: 'brown',
}

export const ROLE_ICONS: Record<string, string> = {
  [UserRole.SUPERADMIN]: 'mdi-shield-admin',
  [UserRole.ADMIN]: 'mdi-shield-crown',
  [UserRole.RECEPCIONISTA]: 'mdi-account-tie',
  [UserRole.CAJERO]: 'mdi-cash-register',
  [UserRole.CLIENTE]: 'mdi-account',
  [UserRole.CAFETERIA]: 'mdi-coffee',
  [UserRole.LAVANDERIA]: 'mdi-washing-machine',
  [UserRole.SPA]: 'mdi-spa',
  [UserRole.ROOM_SERVICE]: 'mdi-bell-service-outline',
  [UserRole.MINIBAR]: 'mdi-fridge-outline',
  [UserRole.TRANSPORTE]: 'mdi-car-outline',
  [UserRole.TOURS]: 'mdi-map-marker-path',
  [UserRole.EVENTOS]: 'mdi-party-popper',
  [UserRole.MANTENIMIENTO]: 'mdi-toolbox-outline',
}

export const ROLE_DEFAULT_ROUTE: Record<string, string> = {
  [UserRole.SUPERADMIN]: '/superadmin',
  [UserRole.ADMIN]: '/admin',
  [UserRole.RECEPCIONISTA]: '/recepcionista',
  [UserRole.CAJERO]: '/recepcionista/caja',
  [UserRole.CLIENTE]: '/cliente',
  [UserRole.CAFETERIA]: '/areas/cafeteria',
  [UserRole.LAVANDERIA]: '/areas/lavanderia',
  [UserRole.SPA]: '/areas/spa',
  [UserRole.ROOM_SERVICE]: '/areas/room-service',
  [UserRole.MINIBAR]: '/areas/minibar',
  [UserRole.TRANSPORTE]: '/areas/transporte',
  [UserRole.TOURS]: '/areas/tours',
  [UserRole.EVENTOS]: '/areas/eventos',
  [UserRole.MANTENIMIENTO]: '/areas/mantenimiento',
}
