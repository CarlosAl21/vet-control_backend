import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirmantesService } from './firmantes.service';
import { FirmantesController } from './firmantes.controller';
import { Firmante } from './entities/firmante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Firmante])],
  controllers: [FirmantesController],
  providers: [FirmantesService],
  exports: [FirmantesService],
})
export class FirmantesModule {}
