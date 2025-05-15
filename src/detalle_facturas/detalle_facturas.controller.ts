import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { DetalleFacturaService } from './detalle_facturas.service';
import { CreateDetalleFacturaDto } from './dto/create-detalle_factura.dto';
import { UpdateDetalleFacturaDto } from './dto/update-detalle_factura.dto';

@Controller('detalle-factura')
export class DetalleFacturaController {
  constructor(private readonly detalleService: DetalleFacturaService) {}

  @Post()
  create(@Body() dto: CreateDetalleFacturaDto) {
    return this.detalleService.create(dto);
  }

  @Get()
  findAll() {
    return this.detalleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDetalleFacturaDto) {
    return this.detalleService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleService.remove(id);
  }
}
