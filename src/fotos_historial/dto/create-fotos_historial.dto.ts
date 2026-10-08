import { IsNotEmpty, IsString } from "class-validator";
import { HistorialesMedico } from "src/historiales_medicos/entities/historiales_medico.entity";
import { DeepPartial } from "typeorm";

export class CreateFotosHistorialDto {
    @IsString()
    @IsNotEmpty()
    url: string;

    @IsString()
    @IsNotEmpty()
    public_id: string;

    @IsNotEmpty()
    id_historial: DeepPartial<HistorialesMedico>; // Assuming this is a string, adjust type if necessary
}
