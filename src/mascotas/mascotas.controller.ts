import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MascotasService } from './mascotas.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Mascotas')
@ApiBearerAuth() // Indica que usa autenticación Bearer (JWT)
@Controller('mascotas')
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear una nueva mascota' })
  @ApiResponse({ status: 201, description: 'Mascota creada correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createMascotaDto: CreateMascotaDto) {
    return this.mascotasService.create(createMascotaDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Obtener todas las mascotas' })
  @ApiResponse({ status: 200, description: 'Lista de mascotas' })
  findAll() {
    return this.mascotasService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Obtener una mascota por ID' })
  @ApiParam({ name: 'id', description: 'ID de la mascota' })
  @ApiResponse({ status: 200, description: 'Mascota encontrada' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrada' })
  findOne(@Param('id') id: string) {
    return this.mascotasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Actualizar una mascota existente' })
  @ApiParam({ name: 'id', description: 'ID de la mascota a actualizar' })
  @ApiResponse({ status: 200, description: 'Mascota actualizada correctamente' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrada' })
  update(@Param('id') id: string, @Body() updateMascotaDto: UpdateMascotaDto) {
    return this.mascotasService.update(id, updateMascotaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Eliminar una mascota por ID' })
  @ApiParam({ name: 'id', description: 'ID de la mascota a eliminar' })
  @ApiResponse({ status: 200, description: 'Mascota eliminada correctamente' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrada' })
  remove(@Param('id') id: string) {
    return this.mascotasService.remove(id);
  }
}
