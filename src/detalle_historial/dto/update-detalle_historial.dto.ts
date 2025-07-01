import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDetalleHistorialDto } from './create-detalle_historial.dto';

export class UpdateDetalleHistorialDto extends PartialType(CreateDetalleHistorialDto) {
    @ApiProperty({
        description: 'ID del detalle de historial médico a actualizar',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: String,
    })
    id_detalle_historial: string;
}
