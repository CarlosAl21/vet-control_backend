import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Facturas')
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Crear una nueva factura' })
  @ApiBody({ type: CreateFacturaDto })
  @ApiResponse({ status: 201, description: 'Factura creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear factura.' })
  @ApiResponse({ status: 403, description: 'Usuario sin empresa.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  create(@Body() createFacturaDto: CreateFacturaDto, @CurrentUser() user: any) {
    return this.facturasService.create(createFacturaDto, user.empresaId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener todas las facturas de la empresa del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de facturas retornada.' })
  findAll(@CurrentUser() user: any) {
    return this.facturasService.findAll(user.empresaId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener una factura por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la factura', example: 'uuid-factura-1234' })
  @ApiResponse({ status: 200, description: 'Factura encontrada y retornada.' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.facturasService.findOne(id, user.empresaId);
  }

  @Get('empresa/:id_empresa')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener las facturas de la empresa del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de facturas retornada.' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada.' })
  findByEmpresa(@Param('id_empresa') id_empresa: string, @CurrentUser() user: any) {
    return this.facturasService.findByEmpresa(id_empresa, user.empresaId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Actualizar una factura por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la factura a actualizar', example: 'uuid-factura-1234' })
  @ApiBody({ type: UpdateFacturaDto })
  @ApiResponse({ status: 200, description: 'Factura actualizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para actualizar la factura.' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada.' })
  update(
    @Param('id') id: number,
    @Body() updateFacturaDto: UpdateFacturaDto,
    @CurrentUser() user: any,
  ) {
    return this.facturasService.update(id, updateFacturaDto, user.empresaId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Eliminar una factura por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la factura a eliminar', example: 'uuid-factura-1234' })
  @ApiResponse({ status: 200, description: 'Factura eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.facturasService.remove(id, user.empresaId);
  }

  @Get('usuario/:id_usuario')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener facturas por ID de usuario' })
  @ApiParam({ name: 'id_usuario', description: 'ID del usuario', example: 'uuid-usuario-1234' })
  @ApiResponse({ status: 200, description: 'Lista de facturas para el usuario.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado o sin facturas.' })
  findByUserId(@Param('id_usuario') id_usuario: string) {
    return this.facturasService.findByUserId(id_usuario);
  }
}
