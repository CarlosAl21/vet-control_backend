import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Clientes')
@ApiBearerAuth()
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiBody({
    description: 'Datos para crear un cliente',
    examples: {
      ejemplo: {
        summary: 'Ejemplo de cliente',
        value: {
          id_empresa: { id_empresa: 'abc123xyz' },
          email: 'juan.perez@email.com'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Cliente creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(
    @Body() body: { id_empresa: { id_empresa: string }, email: string }
  ) {
    const { email, ...createClienteDto } = body;
    return this.clientesService.create(createClienteDto, email);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener todos los clientes' })
  @ApiResponse({ status: 200, description: 'Listado de clientes.' })
  findAll(@CurrentUser() user: any) {
    return this.clientesService.findAll(user.empresaId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Actualizar un cliente por ID' })
  @ApiBody({
    description: 'Datos para actualizar un cliente',
    examples: {
      ejemplo: {
        summary: 'Ejemplo de actualización de cliente',
        value: {
          id_empresa: { id_empresa: 'abc123xyz' },
          id_usuario: { id_usuario: 'user123xyz' }
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Cliente actualizado correctamente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Eliminar un cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  remove(@Param('id') id: string) {
    return this.clientesService.remove(id);
  }

  @Get('search/:email')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Buscar usuario por email' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  findByEmail(@Param('email') email: string) {
    return this.clientesService.validateUserExists(email);
  }

  @Get('mascotas/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener mascotas de un cliente por ID' })
  @ApiResponse({ status: 200, description: 'Mascotas encontradas.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  findMascotasByClienteId(@Param('id') id: string) {
    return this.clientesService.obtenerMascotasPorCliente(id);
  }

  @Get('usuario/:id_usuario')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener clientes por ID de usuario' })
  @ApiResponse({ status: 200, description: 'Clientes encontrados.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  findByUserId(@Param('id_usuario') id_usuario: string) {
    return this.clientesService.FindByUserId(id_usuario);
  }

  @Get('userEmail/:email/:empresaId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIO, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener cliente por email de usuario y empresa' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  findByUserEmail(@Param('email') email: string, @Param('empresaId') empresaId: string) {
    return this.clientesService.FindByEmail(email, empresaId);
  }
}
