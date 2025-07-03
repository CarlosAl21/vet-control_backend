import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { DeepPartial } from "typeorm";
import { Mascota } from "src/mascotas/entities/mascota.entity";

export class CreateRecordatorioDto {
    @ApiProperty({ enum: ['vacuna', 'medicamento', 'desparacitacion'] })
    @IsEnum(['vacuna', 'medicamento', 'desparacitacion'])
    @IsString()
    @IsNotEmpty()
    tipo: 'vacuna' | 'medicamento' | 'desparacitacion';

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

    @ApiProperty({ type: () => Mascota, description: 'ID de la mascota asociada al recordatorio' })
    @IsNotEmpty()
    id_mascota: DeepPartial<Mascota>;
}
