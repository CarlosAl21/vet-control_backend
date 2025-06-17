import { Injectable } from '@nestjs/common';
import { CreateFotosHistorialDto } from './dto/create-fotos_historial.dto';
import { UpdateFotosHistorialDto } from './dto/update-fotos_historial.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Express } from 'express';
import { Multer } from 'multer';
import { InjectRepository } from '@nestjs/typeorm';
import { FotosHistorial } from './entities/fotos_historial.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FotosHistorialService {

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(FotosHistorial)
    private readonly fotosHistorialRepository: Repository<FotosHistorial>,
  ) {}

  async create(createFotosHistorialDto: CreateFotosHistorialDto) {
    try {
      const newFotoHistorial = this.fotosHistorialRepository.create(createFotosHistorialDto);
      const savedFotoHistorial = await this.fotosHistorialRepository.save(newFotoHistorial);
      return savedFotoHistorial;
    } catch (error) {
      console.error('Error creating fotosHistorial:', error);
      throw new Error('Error creating fotosHistorial');
      
    }
  }

  findAll() {
    return this.fotosHistorialRepository.find({
      relations: ['historial'], // Assuming you want to include the historial relation
    });
  }

  async findOne(id: string) {
    try {
      const fotoHistorial = await this.fotosHistorialRepository.findOne({
        where: { id_fotos_historial: id },
        relations: ['historial'], // Assuming you want to include the historial relation
      });
      if (!fotoHistorial) {
        throw new Error(`FotosHistorial with id ${id} not found`);
      }
      return fotoHistorial;
    } catch (error) {
      console.error('Error finding fotosHistorial:', error);
      throw new Error('Error finding fotosHistorial');
      
    }
  }

  async update(id: string, updateFotosHistorialDto: UpdateFotosHistorialDto) {
    try {
      const existingFotoHistorial = await this.fotosHistorialRepository.findOne({
        where: { id_fotos_historial: id },
      });
      if (!existingFotoHistorial) {
        throw new Error(`FotosHistorial with id ${id} not found`);
      }
      const updatedFotoHistorial = this.fotosHistorialRepository.merge(existingFotoHistorial, updateFotosHistorialDto);
      return await this.fotosHistorialRepository.save(updatedFotoHistorial);
    } catch (error) {
      console.error('Error updating fotosHistorial:', error);
      throw new Error('Error updating fotosHistorial');
      
    }
  }


  async uploadImages(files: Array<Multer.File>) {
    const uploadPromises = files.map(file => this.cloudinaryService.upload(file));
    const results = await Promise.all(uploadPromises);
    return results;
  }
  
}
