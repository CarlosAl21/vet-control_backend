import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Cliente } from "src/clientes/entities/cliente.entity";

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
        example: 'Labrador Retriever',
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
        example: 'Marrón',
        description: 'Color de la mascota',
    })
    @IsString()
    @IsNotEmpty()
    color: string;

    @ApiProperty({
        example: { id_cliente: '62f4c7b3d48f7c1b9a9d1234' },
        description: 'Cliente al que pertenece la mascota',
    })
    @IsNotEmpty()
    id_cliente: Cliente;
}
