import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Cliente } from 'src/clientes/entities/cliente.entity';

export class CreateFacturaDto {
  @IsDateString()
  @IsNotEmpty()
  fecha_emision: Date;

  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsString()
  @IsNotEmpty()
  metodo_pago: string;

  @IsNotEmpty()
  id_cliente: string;
}
