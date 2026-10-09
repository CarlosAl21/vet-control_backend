import { plainToInstance } from 'class-transformer';
import { CreateCitaDto } from 'src/citas/dto/create-cita.dto';
import { CreateDetalleFacturaDto } from 'src/detalle_facturas/dto/create-detalle_factura.dto';
import { CreateDetalleHistorialDto } from 'src/detalle_historial/dto/create-detalle_historial.dto';
import { CreateFacturaDto } from 'src/facturas/dto/create-factura.dto';
import { CreateMascotaDto } from 'src/mascotas/dto/create-mascota.dto';
import { CreateProductoDto } from 'src/productos/dto/create-producto.dto';
import { CreateServicioDto } from 'src/servicios/dto/create-servicio.dto';
import { CreateLoteDto } from './create-lote.dto';

// The global ValidationPipe uses transform: true without implicit conversion,
// so numeric and date fields must declare their target type explicitly.
describe('Create DTOs convert numeric and date fields', () => {
  const numericCases: Array<[string, new () => object, string[]]> = [
    ['CreateDetalleHistorialDto', CreateDetalleHistorialDto, ['peso_kg', 'temperatura_c', 'frecuencia_cardiaca', 'frecuencia_respiratoria']],
    ['CreateLoteDto', CreateLoteDto, ['stock_actual']],
    ['CreateFacturaDto', CreateFacturaDto, ['total']],
    ['CreateDetalleFacturaDto', CreateDetalleFacturaDto, ['cantidad', 'precio_unitario', 'subtotal']],
    ['CreateProductoDto', CreateProductoDto, ['precio_unitario']],
    ['CreateServicioDto', CreateServicioDto, ['precio', 'duracion_min']],
    ['CreateMascotaDto', CreateMascotaDto, ['peso_actual']],
  ];

  it.each(numericCases)('%s converts numeric strings to numbers', (_name, dto, fields) => {
    const plain = Object.fromEntries(fields.map((f) => [f, '12']));
    const instance = plainToInstance(dto, plain) as Record<string, unknown>;
    for (const field of fields) {
      expect(instance[field]).toBe(12);
    }
  });

  const dateCases: Array<[string, new () => object, string[]]> = [
    ['CreateLoteDto', CreateLoteDto, ['fecha_entrada', 'fecha_venc']],
    ['CreateCitaDto', CreateCitaDto, ['fecha_hora']],
  ];

  it.each(dateCases)('%s converts ISO strings to Date', (_name, dto, fields) => {
    const plain = Object.fromEntries(fields.map((f) => [f, '2026-01-15T10:00:00.000Z']));
    const instance = plainToInstance(dto, plain) as Record<string, unknown>;
    for (const field of fields) {
      expect(instance[field]).toBeInstanceOf(Date);
    }
  });
});
