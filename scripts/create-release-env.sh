#!/usr/bin/env bash
set -euo pipefail

env_file="${1:-.env.release}"

if [[ -e "$env_file" ]]; then
  printf 'No se sobrescribe %s. Eliminalo manualmente si quieres regenerarlo.\n' "$env_file" >&2
  exit 1
fi

read -r -p "Origen publico del frontend (ej. http://localhost:3000): " app_origin
read -r -p "URL publica de la API (ej. http://localhost:5000/api): " app_public_api_url
app_origin="${app_origin%$'\r'}"
app_public_api_url="${app_public_api_url%$'\r'}"

if [[ -z "$app_origin" || -z "$app_public_api_url" ]]; then
  printf 'APP_ORIGIN y APP_PUBLIC_API_URL son obligatorios.\n' >&2
  exit 1
fi

for url in "$app_origin" "$app_public_api_url"; do
  case "$url" in
    http://*|https://*) ;;
    *)
      printf 'Las URL deben ser absolutas y usar http o https.\n' >&2
      exit 1
      ;;
  esac
  case "$url" in
    *[[:space:]]*)
      printf 'Las URL no pueden contener espacios.\n' >&2
      exit 1
      ;;
  esac
done

if ! command -v openssl >/dev/null 2>&1; then
  printf 'Se requiere openssl para generar las credenciales.\n' >&2
  exit 1
fi

mongodb_root_password="$(openssl rand -hex 24)"
jwt_secret="$(openssl rand -hex 32)"

umask 077
printf '%s\n' \
  'IMAGE_TAG=local' \
  "APP_ORIGIN=$app_origin" \
  "APP_PUBLIC_API_URL=$app_public_api_url" \
  'MONGODB_ROOT_USERNAME=carrito_admin' \
  "MONGODB_ROOT_PASSWORD=$mongodb_root_password" \
  "JWT_SECRET=$jwt_secret" > "$env_file"

printf 'Entorno creado en %s. No lo compartas ni lo agregues al repositorio.\n' "$env_file"
