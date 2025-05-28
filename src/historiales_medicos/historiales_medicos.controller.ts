import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HistorialesMedicosService } from './historiales_medicos.service';
import { CreateHistorialesMedicoDto } from './dto/create-historiales_medico.dto';
import { UpdateHistorialesMedicoDto } from './dto/update-historiales_medico.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Historiales Médicos')
@ApiBearerAuth()
@Controller('historiales-medicos')
export class HistorialesMedicosController {
  constructor(private readonly historialesMedicosService: HistorialesMedicosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear un nuevo historial médico' })
  @ApiBody({ type: CreateHistorialesMedicoDto })
  @ApiResponse({ status: 201, description: 'Historial médico creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  create(@Body() createHistorialesMedicoDto: CreateHistorialesMedicoDto) {
    return this.historialesMedicosService.create(createHistorialesMedicoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todos los historiales médicos' })
  @ApiResponse({ status: 200, description: 'Lista de historiales médicos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findAll() {
    return this.historialesMedicosService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener historial médico por ID' })
  @ApiParam({ name: 'id', description: 'ID del historial médico', example: 'hist123' })
  @ApiResponse({ status: 200, description: 'Historial médico encontrado.' })
  @ApiResponse({ status: 404, description: 'Historial médico no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findOne(@Param('id') id: string) {
    return this.historialesMedicosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Actualizar historial médico por ID' })
  @ApiParam({ name: 'id', description: 'ID del historial médico a actualizar', example: 'hist123' })
  @ApiBody({ type: UpdateHistorialesMedicoDto })
  @ApiResponse({ status: 200, description: 'Historial médico actualizado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Historial médico no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  update(@Param('id') id: string, @Body() updateHistorialesMedicoDto: UpdateHistorialesMedicoDto) {
    return this.historialesMedicosService.update(id, updateHistorialesMedicoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Eliminar historial médico por ID' })
  @ApiParam({ name: 'id', description: 'ID del historial médico a eliminar', example: 'hist123' })
  @ApiResponse({ status: 200, description: 'Historial médico eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Historial médico no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  remove(@Param('id') id: string) {
    return this.historialesMedicosService.remove(id);
  }
}
