import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetalleHistorialService } from './detalle_historial.service';
import { CreateDetalleHistorialDto } from './dto/create-detalle_historial.dto';
import { UpdateDetalleHistorialDto } from './dto/update-detalle_historial.dto';

@Controller('detalle-historial')
export class DetalleHistorialController {
  constructor(private readonly detalleHistorialService: DetalleHistorialService) {}

  @Post()
  create(@Body() createDetalleHistorialDto: CreateDetalleHistorialDto) {
    return this.detalleHistorialService.create(createDetalleHistorialDto);
  }

  @Get()
  findAll() {
    return this.detalleHistorialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleHistorialService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleHistorialDto: UpdateDetalleHistorialDto) {
    return this.detalleHistorialService.update(id, updateDetalleHistorialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleHistorialService.remove(id);
  }
}
