import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

describe('UsuariosService token revocation', () => {
  let repository: {
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    increment: jest.Mock;
  };
  let service: UsuariosService;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    repository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn().mockImplementation(async (u) => u),
      update: jest.fn().mockResolvedValue(undefined),
      increment: jest.fn().mockResolvedValue(undefined),
    };
    service = new UsuariosService(
      repository as unknown as Repository<Usuario>,
    );
  });

  afterEach(() => jest.restoreAllMocks());

  it('incrementTokenVersion increments token_version by one', async () => {
    await service.incrementTokenVersion('user-1');

    expect(repository.increment).toHaveBeenCalledWith(
      { id_usuario: 'user-1' },
      'token_version',
      1,
    );
  });

  it('getTokenVersion returns the stored version or null', async () => {
    repository.findOne.mockResolvedValueOnce({ token_version: 5 });
    await expect(service.getTokenVersion('user-1')).resolves.toBe(5);

    repository.findOne.mockResolvedValueOnce(null);
    await expect(service.getTokenVersion('missing')).resolves.toBeNull();
  });

  it('resetPasswordWithToken revokes existing sessions', async () => {
    repository.findOne.mockResolvedValue({
      id_usuario: 'user-1',
      contraseña: 'old-hash',
      resetPasswordToken: 'token',
      resetPasswordExpires: new Date(Date.now() + 60_000),
    });

    await expect(
      service.resetPasswordWithToken('token', 'NewPassword123'),
    ).resolves.toBe(true);
    expect(repository.increment).toHaveBeenCalledWith(
      { id_usuario: 'user-1' },
      'token_version',
      1,
    );
  });

  it('update revokes existing sessions when the password changes', async () => {
    const currentHash = await bcrypt.hash('OldPassword123', 4);
    repository.findOneBy.mockResolvedValue({
      id_usuario: 'user-1',
      contraseña: currentHash,
    });
    repository.findOne.mockResolvedValue({
      id_usuario: 'user-1',
      contraseña: 'new-hash',
    });

    await service.update('user-1', {
      contraseña: 'NewPassword123',
      currentPassword: 'OldPassword123',
    });

    expect(repository.increment).toHaveBeenCalledWith(
      { id_usuario: 'user-1' },
      'token_version',
      1,
    );
  });

  it('update does not revoke sessions when the password is unchanged', async () => {
    repository.findOneBy.mockResolvedValue({ id_usuario: 'user-1' });
    repository.findOne.mockResolvedValue({ id_usuario: 'user-1' });

    await service.update('user-1', { nombre: 'Ana' });

    expect(repository.increment).not.toHaveBeenCalled();
  });

  it('update lets another user (admin) change a password without currentPassword', async () => {
    repository.findOneBy.mockResolvedValue({
      id_usuario: 'user-1',
      contraseña: 'old-hash',
    });
    repository.findOne.mockResolvedValue({ id_usuario: 'user-1' });

    await service.update('user-1', { contraseña: 'NewPassword123' }, 'admin-1');

    const [, updateData] = repository.update.mock.calls[0];
    expect(await bcrypt.compare('NewPassword123', updateData.contraseña)).toBe(true);
    expect(repository.increment).toHaveBeenCalled();
  });

  it('update requires currentPassword when users change their own password', async () => {
    repository.findOneBy.mockResolvedValue({
      id_usuario: 'user-1',
      contraseña: 'old-hash',
    });

    await expect(
      service.update('user-1', { contraseña: 'NewPassword123' }, 'user-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('UpdateUsuarioDto treats currentPassword as optional', async () => {
    const errors = await validate(plainToInstance(UpdateUsuarioDto, {}));
    expect(errors.map((e) => e.property)).toEqual([]);
  });
});
