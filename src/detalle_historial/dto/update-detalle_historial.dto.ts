import { PartialType } from '@nestjs/swagger';
import { CreateDetalleHistorialDto } from './create-detalle_historial.dto';

export class UpdateDetalleHistorialDto extends PartialType(CreateDetalleHistorialDto) {}
