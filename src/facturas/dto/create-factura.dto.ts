import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';

export class CreateFacturaDto {
  @ApiProperty({
    example: '2025-05-14T10:30:00Z',
    description: 'Fecha de emisión de la factura en formato ISO 8601',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha_emision: Date;

  @ApiProperty({
    example: 150.75,
    description: 'Total de la factura',
  })
  @IsNumber()
  @IsNotEmpty()
  total: number;

  @ApiProperty({
    example: 'Tarjeta de crédito',
    description: 'Método de pago utilizado',
  })
  @IsString()
  @IsNotEmpty()
  metodo_pago: string;

  @ApiProperty({
    example: 'uuid-cliente-1234',
    description: 'ID del cliente asociado a la factura',
  })
  @IsNotEmpty()
  id_cliente: Cliente;

  @ApiProperty({
    example: 'uuid-empresa-5678',
    description: 'ID de la empresa que emite la factura',
  })
  @IsNotEmpty()
  id_empresa: Empresa;
}
