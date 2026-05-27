import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedoreDto } from './dto/create-proveedor.dto';
import { UpdateProveedoreDto } from './dto/update-proveedor.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Proveedores')
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ApiResponse({ status: 201, description: 'Proveedor creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createProveedoreDto: CreateProveedoreDto) {
    return this.proveedoresService.create(createProveedoreDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener todos los proveedores' })
  @ApiResponse({ status: 200, description: 'Listado de proveedores' })
  findAll(@CurrentUser() user: any) {
    return this.proveedoresService.findAll(user.empresaId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un proveedor' })
  @ApiParam({ name: 'id', description: 'ID del proveedor a actualizar' })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateProveedoreDto: UpdateProveedoreDto,
  ) {
    return this.proveedoresService.update(id, updateProveedoreDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un proveedor por ID' })
  @ApiParam({ name: 'id', description: 'ID del proveedor a eliminar' })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  remove(@Param('id') id: string) {
    return this.proveedoresService.remove(id);
  }
}
