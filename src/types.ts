/**
 * API contract types. These mirror the Java DTOs in `flag-service`:
 * `FlagResponse`, `TenantResponse`, `UserResponse`, and the login response.
 */

export type Role = 'PLATFORM_ADMIN' | 'TENANT_USER'

export interface LoginResponse {
  token: string
  tenantId: string
  role: Role
}

export interface Flag {
  id: string
  tenantId: string
  name: string
  value: boolean
  version: number
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  username: string
  tenantId: string
  role: Role
  createdAt: string
}

export interface CreateFlagInput {
  name: string
  value: boolean
}
