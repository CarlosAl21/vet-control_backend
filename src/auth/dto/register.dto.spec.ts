import { ValidationPipe } from '@nestjs/common';
import { RegisterDto } from './register.dto';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';

describe('RegisterDto', () => {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });
  const body = {
    nombre: 'Juan',
    apellido: 'Perez',
    email: 'juan@mail.com',
    telefono: '0987654321',
    direccion: 'Quito',
    contraseña: 'Secret123',
    id_empresa: 'empresa-1',
  };

  it('strips rol so self-registration cannot pick a role', async () => {
    const result = await pipe.transform(
      { ...body, rol: 'admin' },
      { type: 'body', metatype: RegisterDto },
    );

    expect(result).toBeInstanceOf(RegisterDto);
    expect(result).not.toHaveProperty('rol');
    expect(result.email).toBe('juan@mail.com');
  });
});

describe('CreateUsuarioDto (admin staff creation)', () => {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });
  const body = {
    nombre: 'Ana',
    apellido: 'Lopez',
    email: 'ana@mail.com',
    telefono: '0987654321',
    direccion: 'Quito',
    contraseña: 'Secret123',
    id_empresa: 'empresa-1',
  };

  it('accepts a known role', async () => {
    const result = await pipe.transform(
      { ...body, rol: 'veterinario' },
      { type: 'body', metatype: CreateUsuarioDto },
    );
    expect(result.rol).toBe('veterinario');
  });

  it('rejects an unknown role', async () => {
    await expect(
      pipe.transform(
        { ...body, rol: 'superadmin' },
        { type: 'body', metatype: CreateUsuarioDto },
      ),
    ).rejects.toThrow();
  });
});
