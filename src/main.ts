import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(cookieParser());

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, Cookie',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('VetControl API')
    .setDescription(
      `API del Sistema VetControl para la gestión integral de clínicas veterinarias.

      Desarrollado por Carlos Alvarado y Jade Ramirez.

      **Nota importante:** Algunos endpoints requieren autenticación previa para poder ser accedidos. 
      Por favor, asegúrate de autenticarte correctamente antes de realizar peticiones a dichos módulos.

      Esta documentación facilita la exploración y prueba de los servicios RESTful ofrecidos por VetControl.`
    )
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
