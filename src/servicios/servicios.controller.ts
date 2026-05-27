import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Servicios')
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo servicio' })
  @ApiBody({
    description: 'Datos para crear un servicio',
    examples: {
      ejemplo: {
        summary: 'Servicio de consulta',
        value: {
          nombre: 'Consulta general',
          tipo: 'consulta',
          precio: 25.0,
          duracion_min: 15,
          id_empresa: { id_empresa: 'empresa123' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Servicio creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.serviciosService.create(createServicioDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener todos los servicios' })
  @ApiResponse({ status: 200, description: 'Listado de servicios.' })
  findAll(@CurrentUser() user: any) {
    return this.serviciosService.findAll(user.empresaId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener un servicio por ID' })
  @ApiParam({ name: 'id', description: 'ID del servicio', example: 'servicio123' })
  @ApiResponse({ status: 200, description: 'Servicio encontrado.' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.serviciosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un servicio por ID' })
  @ApiParam({ name: 'id', description: 'ID del servicio a actualizar', example: 'servicio123' })
  @ApiBody({
    description: 'Datos para actualizar un servicio',
    examples: {
      ejemplo: {
        summary: 'Actualizar servicio',
        value: {
          nombre: 'Consulta especializada',
          tipo: 'consulta',
          precio: 35.0,
          duracion_min: 30,
          id_empresa: { id_empresa: 'empresa123' },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Servicio actualizado correctamente.' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado.' })
  update(@Param('id') id: string, @Body() updateServicioDto: UpdateServicioDto) {
    return this.serviciosService.update(id, updateServicioDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un servicio por ID' })
  @ApiParam({ name: 'id', description: 'ID del servicio a eliminar', example: 'servicio123' })
  @ApiResponse({ status: 200, description: 'Servicio eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado.' })
  remove(@Param('id') id: string) {
    return this.serviciosService.remove(id);
  }

  @Get('empresa/:id_empresa')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener servicios por empresa' })
  @ApiParam({ name: 'id_empresa', description: 'ID de la empresa', example: 'empresa123' })
  @ApiResponse({ status: 200, description: 'Listado de servicios de la empresa.' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada.' })
  findByEmpresa(@Param('id_empresa') id_empresa: string) {
    return this.serviciosService.findByEmpresa(id_empresa);
  }
}
