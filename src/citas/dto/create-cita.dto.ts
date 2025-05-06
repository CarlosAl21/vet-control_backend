import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { Mascota } from "src/mascotas/entities/mascota.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";

export class CreateCitaDto {
    @IsDate()
    @IsNotEmpty()
    fecha_hora: Date;

    @IsString()
    @IsNotEmpty()
    motivo: string;

    @IsString()
    @IsNotEmpty()
    estado: string;

    @IsNotEmpty()
    usuarioId: Usuario;

    @IsNotEmpty()
    mascotaId: Mascota;
}
