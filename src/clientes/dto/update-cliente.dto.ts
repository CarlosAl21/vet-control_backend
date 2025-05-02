import { PartialType } from '@nestjs/swagger';
import { CreateClienteDto } from './create-cliente.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateClienteDto extends PartialType(CreateClienteDto) {
    @IsString()
    @IsNotEmpty()
    id_cliente: string;
}
