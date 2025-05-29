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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Facturas')
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear una nueva factura' })
  @ApiBody({ type: CreateFacturaDto })
  @ApiResponse({ status: 201, description: 'Factura creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear factura.' })
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturasService.create(createFacturaDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener una factura por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la factura', example: 'uuid-factura-1234' })
  @ApiResponse({ status: 200, description: 'Factura encontrada y retornada.' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada.' })
  findOne(@Param('id') id: string) {
    return this.facturasService.findOne(id);
  }
  

  @Get(':id_empresa')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @ApiOperation({ summary: 'Obtener todas las facturas o filtrar por empresa' })
  @ApiResponse({ status: 200, description: 'Lista de facturas retornada.' })
  findAll(@Param('id_empresa') id_empresa: string) {
    return this.facturasService.findByEmpresa(id_empresa);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Eliminar una factura por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la factura a eliminar', example: 'uuid-factura-1234' })
  @ApiResponse({ status: 200, description: 'Factura eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada.' })
  remove(@Param('id') id: string) {
    return this.facturasService.remove(id);
  }
}
