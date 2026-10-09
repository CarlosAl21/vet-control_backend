import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMascotaDto } from 'src/mascotas/dto/create-mascota.dto';
import { CreateProductoDto } from 'src/productos/dto/create-producto.dto';
import { CreateDetalleHistorialDto } from './create-detalle_historial.dto';

// Fields the UI can leave empty must not be rejected when omitted.
describe('Create DTOs accept omitted optional fields', () => {
  const cases: Array<[string, new () => object, string[]]> = [
    ['CreateMascotaDto', CreateMascotaDto, ['tamano', 'num_microchip_collar']],
    ['CreateProductoDto', CreateProductoDto, ['id_subcategoria']],
    [
      'CreateDetalleHistorialDto',
      CreateDetalleHistorialDto,
      [
        'peso_kg',
        'temperatura_c',
        'frecuencia_cardiaca',
        'frecuencia_respiratoria',
        'diagnostico',
        'tratamiento',
        'observaciones',
      ],
    ],
  ];

  it.each(cases)('%s does not require its optional fields', async (_name, dto, fields) => {
    const errors = await validate(plainToInstance(dto, {}));
    const failing = errors.map((e) => e.property).filter((p) => fields.includes(p));
    expect(failing).toEqual([]);
  });
});
