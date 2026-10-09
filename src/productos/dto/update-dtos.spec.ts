import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateCategoriaDto } from 'src/categorias/dto/update-categoria.dto';
import { UpdateCitaDto } from 'src/citas/dto/update-cita.dto';
import { UpdateClienteDto } from 'src/clientes/dto/update-cliente.dto';
import { UpdateDetalleFacturaDto } from 'src/detalle_facturas/dto/update-detalle_factura.dto';
import { UpdateDetalleHistorialDto } from 'src/detalle_historial/dto/update-detalle_historial.dto';
import { UpdateEmpresaDto } from 'src/empresas/dto/update-empresa.dto';
import { UpdateFotosHistorialDto } from 'src/fotos_historial/dto/update-fotos_historial.dto';
import { UpdateHistorialesMedicoDto } from 'src/historiales_medicos/dto/update-historiales_medico.dto';
import { UpdateLoteDto } from 'src/lotes/dto/update-lote.dto';
import { UpdateMascotaDto } from 'src/mascotas/dto/update-mascota.dto';
import { UpdateProductoDto } from './update-producto.dto';
import { UpdateProveedoreDto } from 'src/proveedores/dto/update-proveedor.dto';
import { UpdateRecordatorioDto } from 'src/recordatorios/dto/update-recordatorio.dto';
import { UpdateServicioDto } from 'src/servicios/dto/update-servicio.dto';
import { UpdateSubcategoriaDto } from 'src/subcategorias/dto/update-subcategoria.dto';

// The record id comes only from the :id route param, so every update body
// must be fully optional (a partial update with no id in the body is valid).
describe('Update DTOs accept a partial body without an id', () => {
  const dtos: Array<[string, new () => object]> = [
    ['UpdateCategoriaDto', UpdateCategoriaDto],
    ['UpdateCitaDto', UpdateCitaDto],
    ['UpdateClienteDto', UpdateClienteDto],
    ['UpdateDetalleFacturaDto', UpdateDetalleFacturaDto],
    ['UpdateDetalleHistorialDto', UpdateDetalleHistorialDto],
    ['UpdateEmpresaDto', UpdateEmpresaDto],
    ['UpdateFotosHistorialDto', UpdateFotosHistorialDto],
    ['UpdateHistorialesMedicoDto', UpdateHistorialesMedicoDto],
    ['UpdateLoteDto', UpdateLoteDto],
    ['UpdateMascotaDto', UpdateMascotaDto],
    ['UpdateProductoDto', UpdateProductoDto],
    ['UpdateProveedoreDto', UpdateProveedoreDto],
    ['UpdateRecordatorioDto', UpdateRecordatorioDto],
    ['UpdateServicioDto', UpdateServicioDto],
    ['UpdateSubcategoriaDto', UpdateSubcategoriaDto],
  ];

  it.each(dtos)('%s validates an empty body', async (_name, dto) => {
    const errors = await validate(plainToInstance(dto, {}));
    expect(errors.map((e) => e.property)).toEqual([]);
  });
});
