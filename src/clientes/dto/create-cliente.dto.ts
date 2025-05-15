import { IsNotEmpty, IsString } from "class-validator";
import { Empresa } from "src/empresas/entities/empresa.entity";

export class CreateClienteDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    apellido: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    telefono: string;

    @IsString()
    @IsNotEmpty()
    direccion: string;
    
    @IsNotEmpty()
    id_empresa: Empresa; // Cambiado a string para reflejar el ID de la empresa
}
