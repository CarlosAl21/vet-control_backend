import { OmitType } from '@nestjs/swagger';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';

// Self-registration never accepts a role: the entity defaults it to 'usuario'.
// Staff accounts with a role are created through the admin-only POST /usuarios.
export class RegisterDto extends OmitType(CreateUsuarioDto, ['rol'] as const) {}
