import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Fuera sapos y culebras, no hay nada que ver aquí, solo un saludo desde el backend de Vet Control! 🐸';
  }
}
