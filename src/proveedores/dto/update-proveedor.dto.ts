import { PartialType } from '@nestjs/swagger';
import { CreateProveedoreDto } from './create-proveedor.dto';

export class UpdateProveedoreDto extends PartialType(CreateProveedoreDto) {}
