import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HistorialesMedicosService } from './historiales_medicos.service';
import { CreateHistorialesMedicoDto } from './dto/create-historiales_medico.dto';
import { UpdateHistorialesMedicoDto } from './dto/update-historiales_medico.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('historiales-medicos')
export class HistorialesMedicosController {
  constructor(private readonly historialesMedicosService: HistorialesMedicosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createHistorialesMedicoDto: CreateHistorialesMedicoDto) {
    return this.historialesMedicosService.create(createHistorialesMedicoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.historialesMedicosService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.historialesMedicosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateHistorialesMedicoDto: UpdateHistorialesMedicoDto) {
    return this.historialesMedicosService.update(id, updateHistorialesMedicoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.historialesMedicosService.remove(id);
  }
}
