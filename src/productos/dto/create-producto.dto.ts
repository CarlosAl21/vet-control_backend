import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Empresa } from "src/empresas/entities/empresa.entity";
import { Subcategoria } from "src/subcategorias/entities/subcategoria.entity";
import { DeepPartial } from "typeorm";

export class CreateProductoDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsNumber()
    @IsNotEmpty()
    precio_unitario: number; // Cambiado a string para evitar problemas de precisión con decimales

    @IsNotEmpty()
    subcategoriaId: DeepPartial<Subcategoria>; // ID de la subcategoría a la que pertenece el producto

    @IsNotEmpty()
    id_empresa: DeepPartial<Empresa>; // ID de la empresa a la que pertenece el producto
}
