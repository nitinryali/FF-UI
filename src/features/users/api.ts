import { apiFetch } from '../../lib/api'
import type { Role, User } from '../../types'

export interface CreateUserInput {
  username: string
  password: string
  tenantId: string
  role: Role
}

/** Creates a tenant-bound account. Platform admins only. */
export function createUser(input: CreateUserInput): Promise<User> {
  return apiFetch<User>('/users', { method: 'POST', body: input })
}
