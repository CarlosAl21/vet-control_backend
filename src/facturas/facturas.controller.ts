import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

@ApiTags('Facturas')
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva factura' })
  @ApiBody({ type: CreateFacturaDto })
  @ApiResponse({ status: 201, description: 'Factura creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear factura.' })
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturasService.create(createFacturaDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una factura por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la factura', example: 'uuid-factura-1234' })
  @ApiResponse({ status: 200, description: 'Factura encontrada y retornada.' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada.' })
  findOne(@Param('id') id: string) {
    return this.facturasService.findOne(id);
  }
  
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una factura por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la factura a actualizar', example: 'uuid-factura-1234' })
  @ApiBody({ type: UpdateFacturaDto })
  @ApiResponse({ status: 200, description: 'Factura actualizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para actualizar la factura.' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada.' })
  update(@Param('id') id: string, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturasService.update(id, updateFacturaDto);
  }
  
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una factura por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la factura a eliminar', example: 'uuid-factura-1234' })
  @ApiResponse({ status: 200, description: 'Factura eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada.' })
  remove(@Param('id') id: string) {
    return this.facturasService.remove(id);
  }
}
