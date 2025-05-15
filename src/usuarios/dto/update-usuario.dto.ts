import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
    @ApiProperty({
        example: 'a1234567890bcdef12345678',
        description: 'ID único del usuario que se desea actualizar',
    })
    @IsString()
    @IsNotEmpty()
    id_usuario: string;
}
