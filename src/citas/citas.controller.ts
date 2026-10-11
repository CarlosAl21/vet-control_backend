import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { CreateOwnerCitaDto } from './dto/create-owner-cita.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
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
  @ApiResponse({ status: 404, description: 'Usuario o mascota no encontrados en la clínica.' })
  create(@Body() createCitaDto: CreateCitaDto, @CurrentUser() user: any) {
    return this.citasService.create(createCitaDto, user.empresaId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener todas las citas' })
  @ApiResponse({ status: 200, description: 'Lista de citas obtenida correctamente.' })
  findAll(@CurrentUser() user: any) {
    return this.citasService.findAll(user.empresaId);
  }

  @Post('mine')
  @UseGuards(RolesGuard, ThrottlerGuard)
  @Roles(Role.USUARIO)
  @ApiOperation({ summary: 'Solicitar una cita como dueño' })
  @ApiBody({ type: CreateOwnerCitaDto, description: 'Datos para solicitar una cita' })
  @ApiResponse({ status: 201, description: 'Cita solicitada correctamente (estado Pendiente).' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Mascota o clínica no encontradas para el dueño.' })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes.' })
  createMine(@Body() createOwnerCitaDto: CreateOwnerCitaDto, @CurrentUser() user: any) {
    return this.citasService.createForOwner(createOwnerCitaDto, user.userId);
  }

  // Owner routes are declared before ':id' so 'mine' is not captured as a cita id.
  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(Role.USUARIO)
  @ApiOperation({ summary: 'Obtener las citas del dueño autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de citas del dueño.' })
  findAllMine(@CurrentUser() user: any) {
    return this.citasService.findAllForOwner(user.userId);
  }

  @Get('mine/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.USUARIO)
  @ApiOperation({ summary: 'Obtener una cita propia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cita', example: 'cita-1234abcd' })
  @ApiResponse({ status: 200, description: 'Cita encontrada.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  findOneMine(@Param('id') id: string, @CurrentUser() user: any) {
    return this.citasService.findOneForOwner(id, user.userId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener una cita por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cita', example: 'cita-1234abcd' })
  @ApiResponse({ status: 200, description: 'Cita encontrada.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.citasService.findOne(id, user.empresaId);
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
  update(@Param('id') id: string, @Body() updateCitaDto: UpdateCitaDto, @CurrentUser() user: any) {
    return this.citasService.update(id, updateCitaDto, user.empresaId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Eliminar una cita por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cita a eliminar', example: 'cita-1234abcd' })
  @ApiResponse({ status: 200, description: 'Cita eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.citasService.remove(id, user.empresaId);
  }
}
