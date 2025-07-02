import { DeepPartial } from 'typeorm';
import { IsNotEmpty, IsString } from "class-validator";
import { Empresa } from "src/empresas/entities/empresa.entity";
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

export class CreateClienteDto {

    @ApiProperty({ type: () => Empresa, description: 'Entidad empresa asociada al cliente' })
    @IsNotEmpty()
    id_empresa: DeepPartial<Empresa>; // Cambiado a string para reflejar el ID de la empresa

    @ApiProperty({ type: () => Usuario, description: 'Entidad usuario asociada al cliente' })
    @IsNotEmpty()
    id_usuario: DeepPartial<Usuario>;
    
}
