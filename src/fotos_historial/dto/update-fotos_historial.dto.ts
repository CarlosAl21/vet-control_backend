import { PartialType } from '@nestjs/swagger';
import { CreateFotosHistorialDto } from './create-fotos_historial.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFotosHistorialDto extends PartialType(CreateFotosHistorialDto) {
    @IsString()
    @IsNotEmpty()
    id_fotos_historial: string;
}
