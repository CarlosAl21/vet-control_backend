import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateClienteDto } from './create-cliente.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateClienteDto extends PartialType(CreateClienteDto) {
    @ApiProperty({ example: 'abc123', description: 'Identificador único del cliente' })
    @IsString()
    @IsNotEmpty()
    id_cliente: string;
}
