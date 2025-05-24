import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',  // Permite solicitudes desde cualquier origen (ajustar según necesidad)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
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
