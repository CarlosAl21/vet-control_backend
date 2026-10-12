import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { DetalleFacturaService } from './detalle_facturas.service';
import { CreateDetalleFacturaDto } from './dto/create-detalle_factura.dto';
import { UpdateDetalleFacturaDto } from './dto/update-detalle_factura.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('DetalleFactura')
@Controller('detalle-factura')
export class DetalleFacturaController {
  constructor(private readonly detalleService: DetalleFacturaService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Crear un nuevo detalle de factura' })
  @ApiBody({ type: CreateDetalleFacturaDto, description: 'Datos para crear un detalle de factura' })
  @ApiResponse({ status: 201, description: 'Detalle de factura creado exitosamente.' })
  @ApiResponse({ status: 403, description: 'Usuario sin empresa.' })
  @ApiResponse({ status: 404, description: 'Factura o lote no encontrado.' })
  create(@Body() dto: CreateDetalleFacturaDto, @CurrentUser() user: any) {
    return this.detalleService.create(dto, user.empresaId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener los detalles de factura de la empresa del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de detalles de factura.' })
  findAll(@CurrentUser() user: any) {
    return this.detalleService.findAll(user.empresaId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Obtener un detalle de factura por ID' })
  @ApiParam({ name: 'id', description: 'ID del detalle de factura' })
  @ApiResponse({ status: 200, description: 'Detalle de factura encontrado.' })
  @ApiResponse({ status: 404, description: 'Detalle de factura no encontrado.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.detalleService.findOne(id, user.empresaId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Actualizar un detalle de factura existente' })
  @ApiParam({ name: 'id', description: 'ID del detalle de factura a actualizar' })
  @ApiBody({ type: UpdateDetalleFacturaDto, description: 'Datos para actualizar el detalle de factura' })
  @ApiResponse({ status: 200, description: 'Detalle de factura actualizado correctamente.' })
  @ApiResponse({ status: 404, description: 'Detalle de factura no encontrado.' })
  update(@Param('id') id: string, @Body() dto: UpdateDetalleFacturaDto, @CurrentUser() user: any) {
    return this.detalleService.update(id, dto, user.empresaId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPCIONISTA)
  @ApiOperation({ summary: 'Eliminar un detalle de factura por ID' })
  @ApiParam({ name: 'id', description: 'ID del detalle de factura a eliminar' })
  @ApiResponse({ status: 200, description: 'Detalle de factura eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Detalle de factura no encontrado.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.detalleService.remove(id, user.empresaId);
  }
}
