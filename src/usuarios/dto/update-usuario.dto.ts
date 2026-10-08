import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @ApiProperty({
    description:
      'Contraseña actual del usuario, necesaria para confirmar cambios sensibles como la contraseña',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;
}
