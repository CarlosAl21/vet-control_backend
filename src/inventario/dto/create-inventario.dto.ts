import { IsNotEmpty, IsString } from "class-validator";

export class CreateInventarioDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsNotEmpty()
    stock: number;

    @IsNotEmpty()
    precio_unitario: number;

    @IsString()
    @IsNotEmpty()
    categoria: string;
    
}
