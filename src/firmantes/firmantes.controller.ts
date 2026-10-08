import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { FirmantesService } from './firmantes.service';
import type { FirmanteRequester } from './firmantes.service';
import { CreateFirmanteDto } from './dto/create-firmante.dto';
import { UpdateFirmanteDto } from './dto/update-firmante.dto';

@ApiTags('Firmantes')
@Controller('firmantes')
@UseGuards(RolesGuard)
export class FirmantesController {
  constructor(private readonly firmantesService: FirmantesService) {}

  // No @Roles: RolesGuard only requires a valid JWT, so every authenticated role can read.
  @Get()
  @ApiOperation({ summary: 'List report signers of the current company' })
  @ApiResponse({ status: 200, description: 'Signers ordered by orden ASC' })
  findAll(@CurrentUser() user: FirmanteRequester) {
    return this.firmantesService.findAll(user);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a report signer for the current company' })
  @ApiResponse({ status: 201, description: 'Signer created' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  create(@Body() createFirmanteDto: CreateFirmanteDto, @CurrentUser() user: FirmanteRequester) {
    return this.firmantesService.create(createFirmanteDto, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a report signer' })
  @ApiParam({ name: 'id', description: 'Signer ID' })
  @ApiResponse({ status: 200, description: 'Signer updated' })
  @ApiResponse({ status: 404, description: 'Signer not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFirmanteDto: UpdateFirmanteDto,
    @CurrentUser() user: FirmanteRequester,
  ) {
    return this.firmantesService.update(id, updateFirmanteDto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a report signer' })
  @ApiParam({ name: 'id', description: 'Signer ID' })
  @ApiResponse({ status: 200, description: 'Signer deleted' })
  @ApiResponse({ status: 404, description: 'Signer not found' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: FirmanteRequester) {
    return this.firmantesService.remove(id, user);
  }
}
