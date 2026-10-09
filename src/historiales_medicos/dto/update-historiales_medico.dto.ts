import { PartialType } from '@nestjs/swagger';
import { CreateHistorialesMedicoDto } from './create-historiales_medico.dto';

export class UpdateHistorialesMedicoDto extends PartialType(CreateHistorialesMedicoDto) {}
