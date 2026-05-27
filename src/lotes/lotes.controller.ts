import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { LotesService } from './lotes.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Lotes')
@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo lote' })
  @ApiBody({ type: CreateLoteDto })
  @ApiResponse({ status: 201, description: 'Lote creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() dto: CreateLoteDto) {
    return this.lotesService.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener todos los lotes' })
  @ApiResponse({ status: 200, description: 'Lista de lotes.' })
  findAll(@CurrentUser() user: any) {
    return this.lotesService.findAll(user.empresaId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener un lote por ID' })
  @ApiParam({ name: 'id', description: 'ID del lote', example: 'lote123' })
  @ApiResponse({ status: 200, description: 'Lote encontrado.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.lotesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un lote por ID' })
  @ApiParam({ name: 'id', description: 'ID del lote a actualizar', example: 'lote123' })
  @ApiBody({ type: UpdateLoteDto })
  @ApiResponse({ status: 200, description: 'Lote actualizado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  update(@Param('id') id: string, @Body() dto: UpdateLoteDto) {
    return this.lotesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un lote por ID' })
  @ApiParam({ name: 'id', description: 'ID del lote a eliminar', example: 'lote123' })
  @ApiResponse({ status: 200, description: 'Lote eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  remove(@Param('id') id: string) {
    return this.lotesService.remove(id);
  }
}
