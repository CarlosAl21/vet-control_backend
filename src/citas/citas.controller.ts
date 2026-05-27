import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Citas')
@ApiBearerAuth()
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Crear una nueva cita' })
  @ApiBody({ type: CreateCitaDto, description: 'Datos para crear una cita' })
  @ApiResponse({ status: 201, description: 'Cita creada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createCitaDto: CreateCitaDto) {
    return this.citasService.create(createCitaDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener todas las citas' })
  @ApiResponse({ status: 200, description: 'Lista de citas obtenida correctamente.' })
  findAll(@CurrentUser() user: any) {
    return this.citasService.findAll(user.empresaId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener una cita por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cita', example: 'cita-1234abcd' })
  @ApiResponse({ status: 200, description: 'Cita encontrada.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  findOne(@Param('id') id: string) {
    return this.citasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Actualizar una cita por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cita a actualizar', example: 'cita-1234abcd' })
  @ApiBody({ type: UpdateCitaDto, description: 'Datos para actualizar la cita' })
  @ApiResponse({ status: 200, description: 'Cita actualizada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  update(@Param('id') id: string, @Body() updateCitaDto: UpdateCitaDto) {
    return this.citasService.update(id, updateCitaDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Eliminar una cita por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cita a eliminar', example: 'cita-1234abcd' })
  @ApiResponse({ status: 200, description: 'Cita eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  remove(@Param('id') id: string) {
    return this.citasService.remove(id);
  }
}
