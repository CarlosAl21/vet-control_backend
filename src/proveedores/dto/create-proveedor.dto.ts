import { IsNotEmpty, IsString } from "class-validator";
import { Empresa } from "src/empresas/entities/empresa.entity";

export class CreateProveedoreDto {
    @IsString()
    @IsNotEmpty()
    nombre: string; // Nombre del proveedor

    @IsString()
    @IsNotEmpty()
    direccion: string; // Dirección del proveedor

    @IsString()
    @IsNotEmpty()
    telefono: string; // Teléfono del proveedor

    @IsString()
    @IsNotEmpty()
    email: string; // Correo electrónico del proveedor

    @IsNotEmpty()
    id_empresa: Empresa; // Identificador de la empresa a la que pertenece el proveedor
}
