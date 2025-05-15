import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';

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
  id_cliente: Cliente;

  @IsNotEmpty()
  id_empresa: Empresa; // Cambiado a Empresa para reflejar la relación con la entidad Empresa
}
