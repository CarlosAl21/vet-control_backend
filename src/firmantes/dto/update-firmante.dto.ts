import { PartialType } from '@nestjs/swagger';
import { CreateFirmanteDto } from './create-firmante.dto';

export class UpdateFirmanteDto extends PartialType(CreateFirmanteDto) {}
