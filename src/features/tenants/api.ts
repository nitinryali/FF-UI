import { apiFetch } from '../../lib/api'
import type { Tenant } from '../../types'

export function listTenants(): Promise<Tenant[]> {
  return apiFetch<Tenant[]>('/tenants')
}

export function createTenant(name: string): Promise<Tenant> {
  return apiFetch<Tenant>('/tenants', { method: 'POST', body: { name } })
}

export function deleteTenant(id: string): Promise<void> {
  return apiFetch<void>(`/tenants/${id}`, { method: 'DELETE' })
}
