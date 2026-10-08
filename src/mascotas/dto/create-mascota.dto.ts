import { DeepPartial } from 'typeorm';
import { IsNotEmpty, IsString, IsNumber, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Usuario } from 'src/usuarios/entities/usuario.entity';

export class CreateMascotaDto {
    @ApiProperty({
        example: 'Firulais',
        description: 'Nombre de la mascota',
    })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({
        example: 'Perro',
        description: 'Especie de la mascota',
    })
    @IsString()
    @IsNotEmpty()
    especie: string;

    @ApiProperty({
        example: 'Labrador',
        description: 'Raza de la mascota',
    })
    @IsString()
    @IsNotEmpty()
    raza: string;

    @ApiProperty({
        example: 'Macho',
        description: 'Sexo de la mascota',
    })
    @IsString()
    @IsNotEmpty()
    sexo: string;

    @ApiProperty({
        example: '2018-05-20',
        description: 'Fecha de nacimiento de la mascota (YYYY-MM-DD)',
    })
    @IsString()
    @IsNotEmpty()
    fecha_nacimiento: string;

    @ApiProperty({
        example: 'Negro',
        description: 'Color de la mascota',
    })
    @IsString()
    @IsNotEmpty()
    color: string;

    @ApiProperty({
        example: 12.5,
        description: 'Peso actual de la mascota en kilogramos',
    })
    @IsNumber()
    @IsNotEmpty()
    peso_actual: number;

    @ApiProperty({
        example: 'Mediano',
        description: 'Tamaño de la mascota',
    })
    @IsString()
    @IsNotEmpty()
    tamano: string;

    @ApiProperty({
        example: '950098765432100',
        description: 'Numero de microchip',
    })
    @IsString()
    @IsNotEmpty()
    num_microchip_collar: string;

    @ApiProperty({
        example: true,
        description: 'Si la mascota está esterilizada o no',
    })
    @IsBoolean()
    @IsNotEmpty()
    esterilizado: boolean;

    @ApiProperty({
        example: { id_usuaro: '62f4c7b3d48f7c1b9a9d1234' },
        description: 'Usuario al que pertenece la mascota',
    })
    @IsNotEmpty()
    id_usuario: DeepPartial<Usuario>;
}
