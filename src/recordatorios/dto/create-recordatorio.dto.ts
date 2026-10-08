import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRecordatorioDto {
    @ApiProperty({ enum: ['vacuna', 'medicamento', 'desparacitacion'] })
    @IsEnum(['vacuna', 'medicamento', 'desparacitacion'])
    @IsString()
    @IsNotEmpty()
    tipo: 'vacuna' | 'medicamento' | 'desparacitacion';

    @ApiProperty({ example: 'Vacunación anual', description: 'Título del recordatorio' })
    @IsString()
    @IsNotEmpty()
    titulo: string;

    @ApiProperty({ example: 'Vacuna contra la rabia', description: 'Descripción del recordatorio' })
    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @ApiProperty({ example: '2023-10-01', description: 'Fecha programada para el recordatorio' })
    @IsString()
    @IsNotEmpty()
    fecha_programada: Date;

    @ApiProperty({ example: 'false', description: 'Indica si el recordatorio está completado' })
    @IsNotEmpty()
    completado: boolean;

    @ApiProperty({ example: 'uuid-mascota-1234', description: 'ID de la mascota asociada al recordatorio' })
    @IsString()
    @IsNotEmpty()
    id_mascota: string;
}
