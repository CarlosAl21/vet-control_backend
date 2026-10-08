# Vet Control — Backend

Backend API para la gestión de una clínica veterinaria. Implementado con NestJS y TypeScript, este repositorio contiene la lógica para manejar usuarios, clientes, mascotas, citas, facturas, productos y otros módulos relacionados.

**Estado:** Código fuente del backend (API REST) — adaptar variables de entorno para producción.

**Tecnologías principales:** NestJS, TypeScript, TypeORM, MySQL/Postgres/Oracle, Stripe, Cloudinary.

**Índice rápido**
- Descripción
- Estructura de carpetas
- Requisitos
- Instalación
- Dependencias
- Ejecución

---

## Descripción

API backend para el control administrativo de una clínica veterinaria: gestión de clientes, mascotas, citas, historial médico, fotos, facturación, productos, proveedores y recordatorios.

El proyecto está organizado por módulos dentro de `src/`, siguiendo la arquitectura modular de NestJS.

## Estructura de carpetas (resumen)

Raíz del proyecto:

- `src/`
  - `auth/` — autenticación y autorización (JWT, roles)
  - `categorias/`
  - `citas/` — gestión de citas
  - `clientes/` — clientes
  - `cloudinary/` — subida y manejo de imágenes
  - `detalle_facturas/`
  - `detalle_historial/`
  - `empresas/`
  - `facturas/`
  - `fotos_historial/`
  - `historiales_medicos/`
  - `lotes/`
  - `mail/` — plantillas y envío de correo
  - `mascotas/` — mascotas
  - `productos/`
  - `proveedores/`
  - `recordatorios/`
  - `servicios/`
  - `stripe/` — integración con Stripe
  - `subcategorias/`
  - `usuarios/` — gestión de usuarios y roles
  - `test/` — pruebas e2e

Además en la raíz están los archivos de configuración: `nest-cli.json`, `tsconfig.json`, `package.json`, `test/`, etc.

> Nota: La lista anterior es un resumen — consulte `src/` para ver todos los módulos y sus entidades.

## Requisitos

- Node.js (recomendado >= 18)
- npm (o yarn)
- Base de datos: MySQL / PostgreSQL / Oracle (según configuración en `TypeORM`)
- Acceso a servicios opcionales: Cloudinary (para imágenes), Stripe (pagos)

## Instalación

1. Clonar el repositorio y entrar en la carpeta del proyecto:

```powershell
git clone <repo-url>
cd vet-control_backend
```

2. Instalar dependencias:

```powershell
npm install
```

3. (Opcional) Instalar Nest CLI globalmente para ejecutar comandos de desarrollo:

```powershell
npm install -g @nestjs/cli
```

4. Configurar variables de entorno: crear un archivo `.env` con la configuración de la base de datos y credenciales (por ejemplo `DB_HOST`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `CLOUDINARY_URL`, `STRIPE_KEY`, etc.). Este proyecto usa `@nestjs/config`.

## Dependencias (principales)

Dependencias relevantes (ver `package.json` para la lista completa y versiones):

- Framework y utilidades: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/swagger`.
- ORM y DB: `typeorm`, `@nestjs/typeorm`, `mysql2`, `pg`, `oracledb`.
- Autenticación: `passport`, `@nestjs/passport`, `@nestjs/jwt`, `passport-jwt`, `bcrypt`, `bcryptjs`.
- Validación/Transformación: `class-validator`, `class-transformer`.
- Servicios externos: `cloudinary`, `stripe`.
- Otras: `reflect-metadata`, `rxjs`, `date-fns`.

Dependencias de desarrollo (resumen): `typescript`, `ts-node`, `jest`, `ts-jest`, `eslint`, `prettier`, `@nestjs/cli`.

Para ver versiones exactas consulte el archivo `package.json`.

## Scripts / Ejecución

Comandos disponibles (definidos en `package.json`):

- Desarrollo (watch):

```powershell
npm run start:dev
```

- Iniciar en modo normal (compila la carpeta `dist` si existe):

```powershell
npm run start
```

- Producción (ejecuta `dist`):

```powershell
npm run build
npm run start:prod
```

- Tests unitarios / e2e:

```powershell
npm run test
npm run test:e2e
```

---

## Configuración adicional

- Asegúrese de crear un `.env` con las variables necesarias antes de ejecutar la aplicación.
- Revise `src/app.module.ts` y los módulos de `src/` para ajustar proveedores y la conexión a la base de datos.

## Contribuir

Si desea contribuir, abra un issue o cree un merge request con cambios claros y pruebas cuando aplique.

## Licencia

Consulte la licencia del repositorio. (Actualmente `package.json` indica `UNLICENSED`.)
