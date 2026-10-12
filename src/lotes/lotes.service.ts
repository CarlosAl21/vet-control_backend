import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { EstadoLote, Lote } from './entities/lote.entity';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Producto } from 'src/productos/entities/producto.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
  ) {}

  async create(dto: CreateLoteDto, empresaId: string | null): Promise<Lote> {
    try {
      if (!empresaId) {
        throw new ForbiddenException('El usuario no pertenece a ninguna empresa');
      }

      // The tenant always comes from the JWT; any body id_empresa is discarded.
      const { id_producto, id_proveedor, ...rest } = dto as CreateLoteDto & { id_empresa?: unknown };
      delete (rest as { id_empresa?: unknown }).id_empresa;

      const productoId = await this.resolveProducto(id_producto, empresaId);
      const proveedorId = await this.resolveProveedor(id_proveedor, empresaId);

      const now = new Date();
      const fechaVencimiento = new Date(dto.fecha_venc);

      const estado = fechaVencimiento < now ? EstadoLote.VENCIDO : EstadoLote.ACTIVO;

      const lote = this.loteRepository.create({
        ...rest,
        estado, // fuerza el estado basado en la fecha
        id_producto: { id_producto: productoId },
        id_proveedor: { id_proveedor: proveedorId },
        id_empresa: { id_empresa: empresaId },
      });

      return await this.loteRepository.save(lote);
    } catch (error) {
      console.error('Error al crear el lote:', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el lote');
    }
  }

  async findAll(empresaId: string): Promise<Lote[]> {
    try {
      return await this.loteRepository.find({
        where: { id_empresa: Equal(empresaId) },
        relations: ['id_producto', 'id_proveedor', 'id_empresa'],
      });
    } catch (error) {
      console.error('Error al obtener los lotes:', error);
      throw new InternalServerErrorException('Error al obtener los lotes');
    }
  }

  async findOne(id: string, empresaId: string | null): Promise<Lote> {
    try {
      // Equal() keeps the tenant filter even when empresaId is null (no rows -> 404).
      const lote = await this.loteRepository.findOne({
        where: { id_lote: id, id_empresa: Equal(empresaId) },
        relations: ['id_producto', 'id_proveedor', 'id_empresa'],
      });
      if (!lote) throw new NotFoundException('Lote no encontrado');

      const now = new Date();
      const vencido = new Date(lote.fecha_venc) < now;
      const nuevoEstado = vencido ? EstadoLote.VENCIDO : EstadoLote.ACTIVO;

      if (lote.estado !== nuevoEstado) {
        lote.estado = nuevoEstado;
        await this.loteRepository.save(lote);
      }
      return lote;
    } catch (error) {
      console.error('Error al buscar el lote:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el lote');
    }
  }

  async update(id: string, dto: UpdateLoteDto, empresaId: string | null): Promise<Lote> {
    try {
      const lote = await this.findOne(id, empresaId);
      const { id_producto, id_proveedor, ...rest } = dto as UpdateLoteDto & { id_empresa?: unknown };
      delete (rest as { id_empresa?: unknown }).id_empresa;

      if (id_producto !== undefined) {
        const productoId = await this.resolveProducto(id_producto, empresaId as string);
        lote.id_producto = { id_producto: productoId } as Producto;
      }
      if (id_proveedor !== undefined) {
        const proveedorId = await this.resolveProveedor(id_proveedor, empresaId as string);
        lote.id_proveedor = { id_proveedor: proveedorId } as Proveedor;
      }

      Object.assign(lote, rest);
      return await this.loteRepository.save(lote);
    } catch (error) {
      console.error('Error al actualizar el lote:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el lote');
    }
  }

  async remove(id: string, empresaId: string | null): Promise<void> {
    try {
      const lote = await this.findOne(id, empresaId);
      await this.loteRepository.remove(lote);
    } catch (error) {
      console.error('Error al eliminar el lote:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el lote');
    }
  }

  async descontarStock(id_lote: string, cantidad: number, empresaId: string | null): Promise<void> {
    try {
      // Equal() keeps the tenant filter even when empresaId is null (no rows -> 404).
      const lote = await this.loteRepository.findOne({
        where: { id_lote: Equal(id_lote), id_empresa: Equal(empresaId) },
      });
      if (!lote) {
        throw new NotFoundException('Lote no encontrado');
      }
      if (cantidad > lote.stock_actual) {
        throw new BadRequestException('Cantidad solicitada supera el stock disponible');
      }

      lote.stock_actual -= cantidad;
      lote.estado = lote.stock_actual === 0 ? EstadoLote.AGOTADO : EstadoLote.ACTIVO;

      await this.loteRepository.save(lote);
    } catch (error) {
      console.error('Error al descontar stock del lote:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al descontar stock del lote');
    }
  }

  /** Accepts either a plain id string or a relation object like `{ [key]: id }`. */
  private extractId(value: unknown, key: string): string | undefined {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      const id = (value as Record<string, unknown>)[key];
      if (typeof id === 'string') return id;
    }
    return undefined;
  }

  private async resolveProducto(value: unknown, empresaId: string): Promise<string> {
    const id = this.extractId(value, 'id_producto');
    const producto = id
      ? await this.loteRepository.manager.findOne(Producto, {
          where: { id_producto: Equal(id), id_empresa: Equal(empresaId) },
        })
      : null;
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return id as string;
  }

  private async resolveProveedor(value: unknown, empresaId: string): Promise<string> {
    const id = this.extractId(value, 'id_proveedor');
    const proveedor = id
      ? await this.loteRepository.manager.findOne(Proveedor, {
          where: { id_proveedor: Equal(id), id_empresa: Equal(empresaId) },
        })
      : null;
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    return id as string;
  }
}
