import { Role } from './enums/role.enum';
import { userAccess } from './user-access';

const requester = (rol: string, empresaId: string | null = 'emp-1', userId = 'u-1') => ({ userId, rol, empresaId });

describe('userAccess', () => {
  it.each([Role.USUARIO, Role.ADMIN, Role.VETERINARIO])('lets a %s read their own records', (rol) => {
    expect(userAccess(requester(rol), 'u-1')).toBe('self');
  });

  it.each([Role.ADMIN, Role.RECEPCIONISTA, Role.VETERINARIO])('lets a %s read another user within their clinic', (rol) => {
    expect(userAccess(requester(rol), 'u-2')).toBe('staff');
  });

  it('denies a plain usuario reading another user', () => {
    expect(userAccess(requester(Role.USUARIO), 'u-2')).toBeNull();
  });

  it('denies staff without an empresa reading another user', () => {
    expect(userAccess(requester(Role.ADMIN, null), 'u-2')).toBeNull();
  });
});
