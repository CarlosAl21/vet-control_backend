import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { DetalleFactura } from './entities/detalle_factura.entity';
import { CreateDetalleFacturaDto } from './dto/create-detalle_factura.dto';
import { UpdateDetalleFacturaDto } from './dto/update-detalle_factura.dto';
import { LotesService } from 'src/lotes/lotes.service';
import { EstadoLote, Lote } from 'src/lotes/entities/lote.entity';
import { Factura } from 'src/facturas/entities/factura.entity';

@Injectable()
export class DetalleFacturaService {
  constructor(
    @InjectRepository(DetalleFactura)
    private readonly detalleRepo: Repository<DetalleFactura>,
    @InjectRepository(Lote)
    private readonly lotesRepository: Repository<Lote>,
    private readonly lotesService: LotesService,
  ) {}

  async create(dto: CreateDetalleFacturaDto, empresaId: string | null) {
    if (!empresaId) {
      throw new ForbiddenException('El usuario no pertenece a ninguna empresa');
    }

    const { id_lote, id_factura, ...rest } = dto;
    // Both the factura and the lote must belong to the caller's clinic before any stock is touched.
    const facturaId = await this.resolveFactura(id_factura, empresaId);
    if (id_lote) {
      const lote = await this.findLote(id_lote, empresaId);
      if (lote.estado === EstadoLote.VENCIDO || lote.estado === EstadoLote.AGOTADO) {
        throw new BadRequestException('El producto no está disponible');
      }

      await this.lotesService.descontarStock(id_lote, dto.cantidad, empresaId);
    }

    const subtotal = dto.cantidad * dto.precio_unitario;
    const detalle = this.detalleRepo.create({
      ...rest,
      subtotal,
      id_factura: { id_factura: facturaId } as Factura,
      id_lote: id_lote ? { id_lote } as Lote : null,
    });

    return this.detalleRepo.save(detalle);
  }

  findAll(empresaId: string | null) {
    return this.scopedQuery(empresaId).getMany();
  }

  async findOne(id: string, empresaId: string | null) {
    try {
      return await this.findOwned(id, empresaId);
    } catch (error) {
      console.error('Error al buscar el detalle de factura:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el detalle de factura');
    }
  }

  async update(id: string, dto: UpdateDetalleFacturaDto, empresaId: string | null) {
    try {
      const detalle = await this.findOwned(id, empresaId);
      const cantidad = dto.cantidad ?? detalle.cantidad;
      const precio = dto.precio_unitario ?? detalle.precio_unitario;
      const { id_lote, id_factura, ...rest } = dto;
      if (id_factura !== undefined) {
        const facturaId = await this.resolveFactura(id_factura, empresaId as string);
        detalle.id_factura = { id_factura: facturaId } as Factura;
      }
      if (id_lote) {
        detalle.id_lote = await this.findLote(id_lote, empresaId as string);
      }
      this.detalleRepo.merge(detalle, { ...rest, subtotal: cantidad * precio });
      return await this.detalleRepo.save(detalle);
    } catch (error) {
      console.error('Error al actualizar el detalle de factura:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el detalle de factura');
    }
  }

  async remove(id: string, empresaId: string | null) {
    try {
      const detalle = await this.findOwned(id, empresaId);
      return await this.detalleRepo.remove(detalle);
    } catch (error) {
      console.error('Error al eliminar el detalle de factura:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el detalle de factura');
    }
  }

  /**
   * Details of the caller's clinic, reached through the factura, with the same
   * relations the responses always carried (id_factura, id_lote).
   * A find-where nested through `id_factura` cannot be used: the relation shares its
   * name with the FK column, so TypeORM sends the nested object as the integer FK value.
   * A null empresaId compiles to `= NULL`, which matches no rows.
   */
  private scopedQuery(empresaId: string | null) {
    return this.detalleRepo
      .createQueryBuilder('detalle')
      .innerJoinAndSelect('detalle.id_factura', 'factura')
      .leftJoinAndSelect('detalle.id_lote', 'lote')
      .where('factura.id_empresa = :empresaId', { empresaId });
  }

  // Details of other clinics are indistinguishable from missing ones (404).
  private async findOwned(id: string, empresaId: string | null): Promise<DetalleFactura> {
    const detalle = await this.scopedQuery(empresaId)
      .andWhere('detalle.id_detalle = :id', { id })
      .getOne();
    if (!detalle) {
      throw new NotFoundException('Detalle de factura no encontrado');
    }
    return detalle;
  }

  /** Accepts a numeric id or a relation object like `{ id_factura: 1 }`; returns the owned factura id. */
  private async resolveFactura(value: unknown, empresaId: string): Promise<number> {
    const raw =
      value && typeof value === 'object' ? (value as Record<string, unknown>).id_factura : value;
    const id = Number(raw);
    const factura =
      raw !== undefined && raw !== null && !isNaN(id)
        ? await this.detalleRepo.manager.findOne(Factura, {
            where: { id_factura: Equal(id), id_empresa: Equal(empresaId) },
          })
        : null;
    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }
    return id;
  }

  private async findLote(id_lote: string, empresaId: string): Promise<Lote> {
    const lote = await this.lotesRepository.findOne({
      where: { id_lote: Equal(id_lote), id_empresa: Equal(empresaId) },
    });
    if (!lote) {
      throw new NotFoundException('Lote no encontrado');
    }
    return lote;
  }
}
