import { IsNotEmpty, IsString } from "class-validator";

export class CreateEmpresaDto {
    @IsString()
    @IsNotEmpty()
    nombre: string; // Nombre de la empresa
    
    @IsString()
    @IsNotEmpty()
    ruc: string; // RUC de la empresa
    
    @IsString()
    @IsNotEmpty()
    direccion: string; // Dirección de la empresa

    @IsString()
    @IsNotEmpty()
    telefono: string; // Teléfono de la empresa

    @IsString()
    @IsNotEmpty()
    email: string; // Correo electrónico de la empresa
}
