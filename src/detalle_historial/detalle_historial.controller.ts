import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DetalleHistorialService } from './detalle_historial.service';
import { CreateDetalleHistorialDto } from './dto/create-detalle_historial.dto';
import { UpdateDetalleHistorialDto } from './dto/update-detalle_historial.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('detalle-historial')
@Controller('detalle-historial')
export class DetalleHistorialController {
  constructor(private readonly detalleHistorialService: DetalleHistorialService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear un nuevo detalle de historial' })
  @ApiResponse({ status: 201, description: 'Detalle de historial creado exitosamente.' })
  @ApiBody({
    description: 'Datos para crear un detalle de historial',
    examples: {
      ejemplo: {
        summary: 'Ejemplo de detalle de historial',
        value: {
          id_historial: { id_historial: 'abc123', diagnostico: 'Gripe canina' },
          fecha_registro: '2025-06-24',
          tratamiento: 'Antibióticos y reposo',
          medicamento: 'Amoxicilina',
          dosis: '500mg',
          observaciones: 'El paciente mostró mejoría al tercer día de tratamiento.',
          peso: 12.5,
          temperatura: 38.5,
          frecuencia_cardiaca: 120
        }
      }
    }
  })
  create(@Body() createDetalleHistorialDto: CreateDetalleHistorialDto) {
    return this.detalleHistorialService.create(createDetalleHistorialDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Obtener todos los detalles de historial' })
  @ApiResponse({ status: 200, description: 'Lista de detalles de historial.' })
  findAll() {
    return this.detalleHistorialService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Obtener un detalle de historial por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de historial encontrado.' })
  @ApiResponse({ status: 404, description: 'Detalle de historial no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.detalleHistorialService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Actualizar un detalle de historial por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de historial actualizado.' })
  @ApiResponse({ status: 404, description: 'Detalle de historial no encontrado.' })
  @ApiBody({
    description: 'Datos para actualizar un detalle de historial',
    examples: {
      ejemplo: {
        summary: 'Ejemplo de actualización de detalle de historial',
        value: {
          id_historial: { id_historial: 'abc123', diagnostico: 'Gripe canina' },
          fecha_registro: '2025-06-25',
          tratamiento: 'Reposo',
          medicamento: 'Ibuprofeno',
          dosis: '200mg',
          observaciones: 'Sin cambios significativos.',
          peso: 13.0,
          temperatura: 38.0,
          frecuencia_cardiaca: 115
        }
      }
    }
  })
  update(@Param('id') id: string, @Body() updateDetalleHistorialDto: UpdateDetalleHistorialDto) {
    return this.detalleHistorialService.update(id, updateDetalleHistorialDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Eliminar un detalle de historial por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de historial eliminado.' })
  @ApiResponse({ status: 404, description: 'Detalle de historial no encontrado.' })
  remove(@Param('id') id: string) {
    return this.detalleHistorialService.remove(id);
  }

  @Get('historial/:id_historial')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Obtener detalles de historial por ID de historial' })
  @ApiResponse({ status: 200, description: 'Detalles de historial encontrados.' })
  @ApiResponse({ status: 404, description: 'Historial no encontrado o sin detalles.' })
  findByHistorialId(@Param('id_historial') id_historial: string) {
    return this.detalleHistorialService.findByHistorialId(id_historial);
  }
}
