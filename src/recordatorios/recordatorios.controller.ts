import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecordatoriosService } from './recordatorios.service';
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Recordatorios')
@Controller('recordatorios')
export class RecordatoriosController {
  constructor(private readonly recordatoriosService: RecordatoriosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo recordatorio' })
  @ApiBody({
    description: 'Datos para crear un recordatorio',
    examples: {
      ejemplo: {
        summary: 'Recordatorio de vacuna',
        value: {
          tipo: 'vacuna',
          titulo: 'Vacunación anual',
          descripcion: 'Vacuna contra la rabia',
          fecha_programada: '2023-10-01',
          completado: false,
          id_mascota: { id_mascota: 'mascota123' }
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Recordatorio creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createRecordatorioDto: CreateRecordatorioDto) {
    return this.recordatoriosService.create(createRecordatorioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los recordatorios' })
  @ApiResponse({ status: 200, description: 'Listado de recordatorios.' })
  findAll() {
    return this.recordatoriosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un recordatorio por ID' })
  @ApiParam({ name: 'id', description: 'ID del recordatorio', example: 'recor123' })
  @ApiResponse({ status: 200, description: 'Recordatorio encontrado.' })
  @ApiResponse({ status: 404, description: 'Recordatorio no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.recordatoriosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un recordatorio por ID' })
  @ApiParam({ name: 'id', description: 'ID del recordatorio a actualizar', example: 'recor123' })
  @ApiBody({
    description: 'Datos para actualizar un recordatorio',
    examples: {
      ejemplo: {
        summary: 'Actualizar recordatorio',
        value: {
          tipo: 'medicamento',
          titulo: 'Tratamiento antibiótico',
          descripcion: 'Antibiótico para infección',
          fecha_programada: '2023-11-15',
          completado: true,
          id_mascota: { id_mascota: 'mascota123' }
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Recordatorio actualizado correctamente.' })
  @ApiResponse({ status: 404, description: 'Recordatorio no encontrado.' })
  update(@Param('id') id: string, @Body() updateRecordatorioDto: UpdateRecordatorioDto) {
    return this.recordatoriosService.update(id, updateRecordatorioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un recordatorio por ID' })
  @ApiParam({ name: 'id', description: 'ID del recordatorio a eliminar', example: 'recor123' })
  @ApiResponse({ status: 200, description: 'Recordatorio eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Recordatorio no encontrado.' })
  remove(@Param('id') id: string) {
    return this.recordatoriosService.remove(id);
  }

  @Get('mascota/:id_mascota')
  @ApiOperation({ summary: 'Obtener recordatorios por ID de mascota' })
  @ApiParam({ name: 'id_mascota', description: 'ID de la mascota', example: 'mascota123' })
  @ApiResponse({ status: 200, description: 'Listado de recordatorios para la mascota.' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrada o sin recordatorios.' })
  findByMascota(@Param('id_mascota') id_mascota: string) {
    return this.recordatoriosService.findByMascotaId(id_mascota);
  }
}
