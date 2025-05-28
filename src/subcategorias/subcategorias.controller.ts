import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SubcategoriasService } from './subcategorias.service';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Subcategorías')
@Controller('subcategorias')
export class SubcategoriasController {
  constructor(private readonly subcategoriasService: SubcategoriasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear una nueva subcategoría' })
  @ApiResponse({ status: 201, description: 'Subcategoría creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createSubcategoriaDto: CreateSubcategoriaDto) {
    return this.subcategoriasService.create(createSubcategoriaDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Obtener todas las subcategorías' })
  @ApiResponse({ status: 200, description: 'Lista de subcategorías obtenida exitosamente' })
  findAll() {
    return this.subcategoriasService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Obtener una subcategoría por ID' })
  @ApiParam({ name: 'id', description: 'ID de la subcategoría' })
  @ApiResponse({ status: 200, description: 'Subcategoría encontrada' })
  @ApiResponse({ status: 404, description: 'Subcategoría no encontrada' })
  findOne(@Param('id') id: string) {
    return this.subcategoriasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Actualizar una subcategoría' })
  @ApiParam({ name: 'id', description: 'ID de la subcategoría a actualizar' })
  @ApiResponse({ status: 200, description: 'Subcategoría actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Subcategoría no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateSubcategoriaDto: UpdateSubcategoriaDto,
  ) {
    return this.subcategoriasService.update(id, updateSubcategoriaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Eliminar una subcategoría por ID' })
  @ApiParam({ name: 'id', description: 'ID de la subcategoría a eliminar' })
  @ApiResponse({ status: 200, description: 'Subcategoría eliminada correctamente' })
  @ApiResponse({ status: 404, description: 'Subcategoría no encontrada' })
  remove(@Param('id') id: string) {
    return this.subcategoriasService.remove(id);
  }
}
