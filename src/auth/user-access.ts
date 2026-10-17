import { Role } from './enums/role.enum';

export interface Requester {
  userId: string;
  rol: string;
  empresaId: string | null;
}

const STAFF_ROLES: string[] = [Role.ADMIN, Role.RECEPCIONISTA, Role.VETERINARIO];

/**
 * How the caller may read the records of `targetUserId`:
 * - 'self': their own records, across every clinic they are a cliente of;
 * - 'staff': clinic staff, limited to the records of their own clinic;
 * - null: no access (callers answer 404, as for any foreign record).
 */
export function userAccess(requester: Requester, targetUserId: string): 'self' | 'staff' | null {
  if (requester.userId === targetUserId) return 'self';
  if (STAFF_ROLES.includes(requester.rol) && requester.empresaId) return 'staff';
  return null;
}
