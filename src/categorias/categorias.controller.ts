import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('categorias')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva categoría' })
  @ApiBody({ type: CreateCategoriaDto, description: 'Datos para crear la categoría' })
  @ApiResponse({ status: 201, description: 'Categoría creada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.create(createCategoriaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiResponse({ status: 200, description: 'Lista de categorías obtenida.' })
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiParam({ name: 'id', description: 'ID de la categoría', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Categoría encontrada.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría por ID' })
  @ApiParam({ name: 'id', description: 'ID de la categoría a actualizar', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateCategoriaDto, description: 'Datos para actualizar la categoría' })
  @ApiResponse({ status: 200, description: 'Categoría actualizada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  update(@Param('id') id: string, @Body() updateCategoriaDto: UpdateCategoriaDto) {
    return this.categoriasService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una categoría por ID' })
  @ApiParam({ name: 'id', description: 'ID de la categoría a eliminar', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  remove(@Param('id') id: string) {
    return this.categoriasService.remove(id);
  }
}
