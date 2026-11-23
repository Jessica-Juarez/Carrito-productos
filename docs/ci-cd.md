# Caso de estudio: liberacion continua del carrito de productos

## Contexto y justificacion del pipeline

El sistema del caso de estudio es una tienda de productos con frontend Next.js, API REST en Express y persistencia MongoDB. Se usa GitHub Actions porque el codigo ya vive en GitHub: las solicitudes de cambio pueden validarse antes de integrarse y cada cambio aceptado en `main` o `master` puede publicarse como imagen versionada en GitHub Container Registry (GHCR). Docker Compose mantiene los tres servicios coordinados en el entorno de liberacion y en el servidor.

El flujo aplica estas etapas:

1. **Validacion en pull requests y pushes:** instala dependencias, ejecuta ESLint, compila el frontend y verifica la sintaxis del backend.
2. **Prueba de liberacion:** construye los contenedores, los inicia con MongoDB y revisa que frontend y API respondan antes de publicar.
3. **Liberacion continua:** al integrar cambios en `main` o `master` y configurar `APP_PUBLIC_API_URL`, publica imagenes de frontend y backend en GHCR con el SHA del commit. El tag inmutable permite identificar exactamente la version liberada.
4. **Despliegue continuo opcional:** cuando tambien se activa `DEPLOY_ENABLED`, GitHub Actions se conecta por SSH al servidor Linux, descarga esas imagenes y actualiza los servicios. Compose espera los health checks antes de marcar la actualizacion como completada.

El despliegue remoto requiere un servidor Docker y credenciales que solo la persona administradora del repositorio puede configurar. Mientras `APP_PUBLIC_API_URL` no tenga un valor, los jobs de publicacion y despliegue se omiten, pero el pipeline continua validando y probando el codigo.

## Despliegue en Vercel

Vercel ejecuta Next.js y Express como dos proyectos; MongoDB Atlas aloja la base de datos. El entorno Docker de CI sigue ejecutandose para validar los cambios, pero Vercel no usa los scripts SSH ni `docker-compose.deploy.yml`. La integracion Git de Vercel despliega en paralelo con GitHub Actions: por si sola no espera que las pruebas terminen.

1. Importa este repositorio en Vercel como proyecto frontend, con directorio raiz `.` y framework Next.js. Configura `master` como rama de produccion si no se selecciona automaticamente. Guarda la URL de produccion del frontend. Este primer despliegue aun no podra autenticar usuarios.
2. Importa el mismo repositorio como otro proyecto, con directorio raiz `backend` y framework Express. En las variables de entorno de produccion de Vercel configura:
   - `MONGODB_URI`: cadena de conexion del cluster Atlas con usuario, contraseña y base de datos. Guardala directamente en Vercel; no la compartas ni la subas a Git.
   - `JWT_SECRET`: secreto aleatorio largo y unico, almacenado directamente en Vercel.
   - `CORS_ORIGIN`: URL de produccion del frontend, sin barra final.
3. Despliega la API. Comprueba que `https://<dominio-api>/health` responda `{"status":"ok","database":"connected"}`. Si falla, revisa las credenciales y la lista de acceso de red de Atlas. Permitir `0.0.0.0/0` habilita intentos desde cualquier IP; usa una contraseña fuerte y permisos minimos.
4. En las variables de produccion del proyecto frontend, agrega `NEXT_PUBLIC_API_URL` con la URL publica de la API terminada en `/api`. Vuelve a desplegar el frontend, ya que Next.js incorpora esa URL durante la compilacion.
5. Prueba registro e inicio de sesion desde el frontend. Para cambios futuros, la integracion Git desplegara los pushes a la rama de produccion; verifica tambien el resultado de GitHub Actions.

Para este flujo no es necesario configurar `APP_PUBLIC_API_URL` ni `DEPLOY_ENABLED` en GitHub: esas variables pertenecen al despliegue alternativo por Docker/GHCR y SSH. Las variables de Vercel deben configurarse en el entorno de produccion de cada proyecto. Los valores sensibles no deben colocarse en variables publicas `NEXT_PUBLIC_`.

## Entorno requerido

### Integracion y liberacion

- Repositorio GitHub con Actions y GHCR habilitados.
- GitHub Actions `ubuntu-latest`, Node.js 22, Docker y Docker Compose v2.
- Acciones oficiales `actions/checkout@v4` y `actions/setup-node@v4`.
- Pull requests hacia `main` o `master`; pushes a esas ramas generan la liberacion.

### Despliegue

- Servidor Linux accesible por SSH, Docker Engine y Docker Compose v2 (2.20 o posterior para `--wait`).
- Puertos 3000 y 5000 accesibles para el ejemplo, o un proxy inverso HTTPS que enrute al frontend y a la API.
- Volumen Docker persistente para MongoDB. MongoDB no publica un puerto al host.
- URL publica del frontend permitida en CORS (`APP_ORIGIN`) y URL publica de la API compilada en el cliente (`APP_PUBLIC_API_URL`). En un despliegue con TLS, ambas deben usar HTTPS y el proxy debe enrutar `/api` al backend.

## Configuracion de GitHub

En **Settings > Secrets and variables > Actions**, agrega:

| Tipo | Nombre | Uso |
|---|---|---|
| Variable | `APP_PUBLIC_API_URL` | URL absoluta de la API, terminada en `/api`; queda incluida en el bundle del frontend. |
| Variable | `DEPLOY_ENABLED` | Usa el valor `true` para habilitar el job de despliegue automatico. |
| Variable | `DEPLOY_HOST` | Host o IP del servidor Linux. |
| Variable | `DEPLOY_USER` | Usuario SSH con acceso a Docker. |
| Variable | `DEPLOY_PATH` | Ruta absoluta sin espacios, por ejemplo `/opt/carrito-productos`. |
| Secreto | `DEPLOY_SSH_KEY` | Llave privada SSH dedicada al despliegue. |
| Secreto | `DEPLOY_KNOWN_HOSTS` | Clave de host SSH del servidor, verificada antes de registrarla. |

El job de despliegue usa el entorno GitHub `production`; agrega alli una regla de aprobacion si se requiere autorizacion manual. `GITHUB_TOKEN` recibe permisos de escritura a paquetes unicamente en el job de publicacion y se usa temporalmente para que el servidor descargue las imagenes.

Antes del primer despliegue, crea en el servidor `$DEPLOY_PATH/.env` con estos valores (no lo subas al repositorio):

```dotenv
APP_ORIGIN=https://tienda.ejemplo.com
MONGODB_ROOT_USERNAME=carrito_admin
MONGODB_ROOT_PASSWORD=<valor aleatorio largo>
JWT_SECRET=<valor aleatorio largo>
FRONTEND_PORT=3000
BACKEND_PORT=5000
```

Genera secretos con `openssl rand -hex 32`. Para la URL del cliente, `APP_PUBLIC_API_URL` debe apuntar a la direccion accesible por los navegadores, por ejemplo `https://api.ejemplo.com/api`; no uses el nombre interno `backend` ni `localhost` en produccion. Las imagenes privadas de GHCR se descargan durante cada despliegue usando el token de vida corta del workflow.

## Niveles de servicio propuestos

Estos son objetivos iniciales para el caso de estudio, no un contrato de disponibilidad medido:

| Indicador | Objetivo | Medicion |
|---|---|---|
| Disponibilidad mensual | >= 99.5% | Sondeo HTTP externo a frontend y `/health` de API, excluyendo mantenimiento anunciado. |
| Tiempo de respuesta | p95 < 500 ms para API y p95 < 2 s para pagina inicial | APM o medicion sintetica desde la misma region, ventana de 5 minutos. |
| Recuperacion tras fallo | RTO <= 30 min | Tiempo desde la alerta hasta restaurar servicio. |
| Perdida de datos | RPO <= 24 h | Respaldo diario de MongoDB y prueba periodica de restauracion. |
| Liberacion | <= 10 min desde merge hasta imagen disponible | Duracion del workflow de GitHub Actions. |

Los umbrales deben revisarse con mediciones reales, capacidad del servidor y una politica de respaldos operativa antes de presentarlos como SLA acordado.

## Metricas y monitoreo

- **Disponibilidad:** solicitudes correctas a `GET /` y `GET /health`; el health check de la API falla con HTTP 503 si MongoDB no esta conectado.
- **Latencia y errores:** p50/p95/p99, tasa de respuestas 5xx, errores de autenticacion y solicitudes por minuto del backend. Instrumentar con Prometheus/Grafana u otro APM antes de fijar alertas.
- **Recursos:** CPU, memoria y reinicios de los contenedores; espacio libre y uso del volumen de MongoDB.
- **Entrega:** duracion y resultado de cada job, tiempo desde merge hasta publicacion y fallos de health check durante el despliegue.
- **Alertas iniciales:** disponibilidad menor a 99.5% en la ventana mensual, p95 de API > 500 ms durante 5 minutos, errores 5xx > 5% durante 5 minutos, o disco > 80%.

Compose registra la salud de los contenedores y los logs quedan disponibles con `docker compose logs -f`. Para medicion historica y alertas externas se debe instalar/configurar el agente de monitoreo elegido en el servidor.

## Parametros de las herramientas

| Herramienta | Parametros usados |
|---|---|
| GitHub Actions | Ramas `main`/`master`; Node.js 22; validacion en PR; liberacion por SHA en push; permisos minimos de lectura de contenido y escritura de paquetes solo al publicar. |
| Docker | Imagen base Node.js 22; `NEXT_PUBLIC_API_URL` se fija al construir el frontend; el backend corre con `NODE_ENV=production`. |
| Docker Compose | Puertos frontend 3000 y API 5000 por defecto; checks cada 30 s, timeout 10 s, reintentos 3 (MongoDB: 5); volumen `mongodb_data`; politicas `unless-stopped`. |
| GHCR | Dos imagenes versionadas: `frontend:<SHA>` y `backend:<SHA>` bajo `ghcr.io/jessica-juarez/carrito-productos`. |
| SSH | Llave dedicada y `known_hosts` prevalidado; la llave y el token del registro se almacenan como secretos de Actions. |
| API | `PORT=5000`, `MONGODB_URI` interno de Compose, `JWT_SECRET` secreto y `CORS_ORIGIN` igual al origen del frontend. |

## Scripts y ejecucion

| Archivo | Funcion |
|---|---|
| `.github/workflows/ci-cd.yml` | Pipeline de validacion, prueba de liberacion, publicacion y despliegue. |
| `docker-compose.release.yml` | Construye y levanta el entorno temporal/local de liberacion. |
| `scripts/create-release-env.sh` | Genera `.env.release` local con secretos aleatorios. |
| `scripts/release-env.sh` | Construye e inicia el entorno de liberacion y espera sus health checks. |
| `scripts/test-release.sh` | Verifica que frontend y endpoint de salud respondan. |
| `docker-compose.deploy.yml` | Define los servicios con imagenes ya publicadas en GHCR para el host remoto. |
| `scripts/deploy.sh` y `scripts/deploy-remote.sh` | Copian la configuracion y actualizan los contenedores por SSH. |

En Linux, macOS o WSL, la prueba local se ejecuta asi:

```bash
bash scripts/create-release-env.sh
bash scripts/release-env.sh
bash scripts/test-release.sh
docker compose --env-file .env.release -f docker-compose.release.yml down
```

Los scripts estan escritos para Bash y requieren Docker Compose v2 y `curl`; el generador de entorno tambien requiere `openssl`. En Windows, ejecutalos desde WSL o Git Bash. El archivo `.env.release` contiene secretos, esta excluido por `.gitignore` y no debe compartirse.
