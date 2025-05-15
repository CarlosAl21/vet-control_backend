import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Empresas')
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva empresa' })
  @ApiBody({ type: CreateEmpresaDto, description: 'Datos para crear una empresa' })
  @ApiResponse({ status: 201, description: 'Empresa creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresasService.create(createEmpresaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las empresas' })
  @ApiResponse({ status: 200, description: 'Lista de empresas.' })
  findAll() {
    return this.empresasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una empresa por su ID' })
  @ApiParam({ name: 'id', description: 'ID único de la empresa', example: 'abc123xyz' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada.' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada.' })
  findOne(@Param('id') id: string) {
    return this.empresasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una empresa por su ID' })
  @ApiParam({ name: 'id', description: 'ID único de la empresa', example: 'abc123xyz' })
  @ApiBody({ type: UpdateEmpresaDto, description: 'Datos para actualizar la empresa' })
  @ApiResponse({ status: 200, description: 'Empresa actualizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada.' })
  update(@Param('id') id: string, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    return this.empresasService.update(id, updateEmpresaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una empresa por su ID' })
  @ApiParam({ name: 'id', description: 'ID único de la empresa', example: 'abc123xyz' })
  @ApiResponse({ status: 200, description: 'Empresa eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada.' })
  remove(@Param('id') id: string) {
    return this.empresasService.remove(id);
  }
}
