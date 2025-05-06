import { IsNotEmpty, IsString } from "class-validator";

export class CreateUsuarioDto {
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
    contraseña: string;

}
