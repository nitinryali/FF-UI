import { apiFetch } from '../../lib/api'
import type { CreateFlagInput, Flag } from '../../types'

export function listFlags(tenantId: string): Promise<Flag[]> {
  return apiFetch<Flag[]>('/flags', { tenantId })
}

export function getFlag(tenantId: string, name: string): Promise<Flag> {
  return apiFetch<Flag>(`/flags/${encodeURIComponent(name)}`, { tenantId })
}

export function createFlag(tenantId: string, input: CreateFlagInput): Promise<Flag> {
  return apiFetch<Flag>('/flags', { method: 'POST', tenantId, body: input })
}

export function updateFlagValue(tenantId: string, id: string, value: boolean): Promise<Flag> {
  return apiFetch<Flag>(`/flags/${id}`, { method: 'PATCH', tenantId, body: { value } })
}

export function deleteFlag(tenantId: string, id: string): Promise<void> {
  return apiFetch<void>(`/flags/${id}`, { method: 'DELETE', tenantId })
}
