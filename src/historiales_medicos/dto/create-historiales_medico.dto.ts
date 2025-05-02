import { IsNotEmpty, IsString } from "class-validator";
import { Mascota } from "src/mascotas/entities/mascota.entity";

export class CreateHistorialesMedicoDto {
    @IsString()
    @IsNotEmpty()
    fecha: string;

    @IsString()
    @IsNotEmpty()
    diagnostico: string;

    @IsString()
    @IsNotEmpty()
    tratamiento: string;

    @IsString()
    notas: string;

    @IsNotEmpty()
    id_mascota: Mascota;
}
