import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { LotesService } from './lotes.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Lotes')
@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear un nuevo lote' })
  @ApiBody({ type: CreateLoteDto })
  @ApiResponse({ status: 201, description: 'Lote creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() dto: CreateLoteDto) {
    return this.lotesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Obtener todos los lotes' })
  @ApiResponse({ status: 200, description: 'Lista de lotes.' })
  findAll() {
    return this.lotesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Obtener un lote por ID' })
  @ApiParam({ name: 'id', description: 'ID del lote', example: 'lote123' })
  @ApiResponse({ status: 200, description: 'Lote encontrado.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.lotesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Eliminar un lote por ID' })
  @ApiParam({ name: 'id', description: 'ID del lote a eliminar', example: 'lote123' })
  @ApiResponse({ status: 200, description: 'Lote eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Lote no encontrado.' })
  remove(@Param('id') id: string) {
    return this.lotesService.remove(id);
  }
}
