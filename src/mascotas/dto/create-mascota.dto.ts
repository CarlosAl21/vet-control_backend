import { IsNotEmpty, IsString } from "class-validator";
import { Cliente } from "src/clientes/entities/cliente.entity";

export class CreateMascotaDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    especie: string;
    
    @IsString()
    @IsNotEmpty()
    raza: string;

    @IsString()
    @IsNotEmpty()
    sexo: string;

    @IsString()
    @IsNotEmpty()
    fecha_nacimiento: string;

    @IsString()
    @IsNotEmpty()
    color: string;

    @IsNotEmpty()
    id_cliente: Cliente;
}
