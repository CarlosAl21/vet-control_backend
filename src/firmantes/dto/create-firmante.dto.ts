import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

// The owning company is taken from the JWT; any body company field is stripped by the global whitelist.
export class CreateFirmanteDto {
    @ApiProperty({ example: 'Dra. Ana Pérez', description: 'Signer full name' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 'Directora médica', description: 'Signer position shown on reports' })
    @IsString()
    @IsNotEmpty()
    puesto: string;

    @ApiProperty({ example: 1, description: 'Display order on reports (ascending)' })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    orden: number;
}
