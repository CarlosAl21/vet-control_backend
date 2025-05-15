import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { DetalleFacturaService } from './detalle_facturas.service';
import { CreateDetalleFacturaDto } from './dto/create-detalle_factura.dto';
import { UpdateDetalleFacturaDto } from './dto/update-detalle_factura.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('DetalleFactura')
@Controller('detalle-factura')
export class DetalleFacturaController {
  constructor(private readonly detalleService: DetalleFacturaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo detalle de factura' })
  @ApiBody({ type: CreateDetalleFacturaDto, description: 'Datos para crear un detalle de factura' })
  @ApiResponse({ status: 201, description: 'Detalle de factura creado exitosamente.' })
  create(@Body() dto: CreateDetalleFacturaDto) {
    return this.detalleService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los detalles de factura' })
  @ApiResponse({ status: 200, description: 'Lista de detalles de factura.' })
  findAll() {
    return this.detalleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un detalle de factura por ID' })
  @ApiParam({ name: 'id', description: 'ID del detalle de factura' })
  @ApiResponse({ status: 200, description: 'Detalle de factura encontrado.' })
  @ApiResponse({ status: 404, description: 'Detalle de factura no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.detalleService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un detalle de factura existente' })
  @ApiParam({ name: 'id', description: 'ID del detalle de factura a actualizar' })
  @ApiBody({ type: UpdateDetalleFacturaDto, description: 'Datos para actualizar el detalle de factura' })
  @ApiResponse({ status: 200, description: 'Detalle de factura actualizado correctamente.' })
  @ApiResponse({ status: 404, description: 'Detalle de factura no encontrado.' })
  update(@Param('id') id: string, @Body() dto: UpdateDetalleFacturaDto) {
    return this.detalleService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un detalle de factura por ID' })
  @ApiParam({ name: 'id', description: 'ID del detalle de factura a eliminar' })
  @ApiResponse({ status: 200, description: 'Detalle de factura eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Detalle de factura no encontrado.' })
  remove(@Param('id') id: string) {
    return this.detalleService.remove(id);
  }
}
