CREATE SCHEMA carrito_app;
REVOKE ALL ON SCHEMA carrito_app FROM PUBLIC;
REVOKE ALL ON SCHEMA carrito_app FROM anon, authenticated;

CREATE TABLE carrito_app.usuarios (
  id uuid PRIMARY KEY,
  nombre text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  carrito jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON ALL TABLES IN SCHEMA carrito_app FROM PUBLIC, anon, authenticated;
