import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRecordatorioDto } from './create-recordatorio.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRecordatorioDto extends PartialType(CreateRecordatorioDto) {
    @ApiProperty({example: '123e4567-e89b-12d3-a456-42661417400',description: 'ID del recordatorio a actualizar',type: String,})
    @IsString()
    @IsNotEmpty()
    id_recordatorio: string; // Aseguramos que el ID del recordatorio sea una cadena de texto
}
