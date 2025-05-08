import { IsNotEmpty, IsString } from "class-validator";
import { Categoria } from "src/categorias/entities/categoria.entity";

export class CreateSubcategoriaDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsNotEmpty()
    id_categoria: Categoria;
}
