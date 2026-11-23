# Carrito de productos

Aplicacion web con frontend Next.js, API REST en Express y base de datos MongoDB.

## Desarrollo local

Instala dependencias del frontend y del backend y configura las variables locales de MongoDB/JWT en `backend/src/.env`. No publiques ese archivo ni uses sus valores de desarrollo en produccion.

```bash
npm install
npm run dev
```

En otra terminal, inicia el backend:

```bash
cd backend
npm install
npm run dev
```

## Liberacion y despliegue

La guia del caso de estudio documenta el pipeline de GitHub Actions, los niveles de servicio, metricas, parametros de las herramientas y los requisitos para habilitar despliegue remoto:

- [Caso de estudio CI/CD](docs/ci-cd.md)
- [Pipeline GitHub Actions](.github/workflows/ci-cd.yml)
- [Entorno de liberacion](docker-compose.release.yml)
- [Entorno de despliegue](docker-compose.deploy.yml)
