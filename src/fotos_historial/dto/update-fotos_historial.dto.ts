import { PartialType } from '@nestjs/swagger';
import { CreateFotosHistorialDto } from './create-fotos_historial.dto';

export class UpdateFotosHistorialDto extends PartialType(CreateFotosHistorialDto) {}
