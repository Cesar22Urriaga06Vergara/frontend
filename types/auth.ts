// types/auth.ts

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  RECEPCIONISTA = 'recepcionista',
  CLIENTE = 'cliente',
  CAFETERIA = 'cafeteria',
  LAVANDERIA = 'lavanderia',
  SPA = 'spa',
  ROOM_SERVICE = 'room_service',
}

export interface User {
  id: number
  _id?: string | number
  name?: string
  fullName: string
  email: string
  role: UserRole
  isActive: boolean
  lastLogin?: string
  idEmpleado?: number
  idCliente?: number
  idHotel?: number
  discoveredClues?: number[]
  createdAt?: string
  updatedAt?: string
  totalScore?: number
}

// ── Request DTOs ──

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  nombre: string
  apellido: string
  email: string
  password: string
  role?: UserRole
  idEmpleado?: number
  idCliente?: number
  idHotel?: number
}

export interface RegisterClienteRequest {
  fullName: string
  email: string
  password: string
  idCliente?: number
}

export interface RefreshTokenRequest {
  userId: string
  refreshToken: string
}

export interface PasswordResetRequestDto {
  email: string
}

export interface PasswordResetVerifyDto {
  email: string
  token: string
}

export interface PasswordResetConfirmDto {
  email: string
  token: string
  newPassword: string
}

// ── Response DTOs ──

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
}

export interface RegisterResponse {
  message: string
  user: User
  token: string
  refreshToken: string
}

export interface ProfileResponse {
  message: string
  user: User
}

export interface PasswordResetRequestResponse {
  message: string
  expiresAt?: string
  attemptsRemaining?: number
}

export interface PasswordResetVerifyResponse {
  message: string
  isValid: boolean
  canProceed: boolean
  attemptsRemaining?: number
}

export interface PasswordResetConfirmResponse {
  message: string
  success: boolean
}

// ── Admin DTOs ──

export interface UpdateUserRequest {
  fullName?: string
  email?: string
  role?: UserRole
  password?: string
  isActive?: boolean
  idEmpleado?: number
  idCliente?: number
}

export interface UsersListResponse {
  message: string
  users: User[]
  count: number
}

export interface UserResponse {
  message: string
  user: User
}

export interface PasswordResetStats {
  total: number
  active: number
  expired: number
  used: number
  lastCleanup: string
}

export interface PasswordResetStatsResponse {
  message: string
  stats: PasswordResetStats
}

export interface CleanupResponse {
  message: string
  deletedCount: number
}
