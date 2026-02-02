-- Agregar columna para marcar si la reseña del usuario es pública
ALTER TABLE postulaciones 
ADD COLUMN IF NOT EXISTS resena_usuario_publica BOOLEAN DEFAULT true;

-- Comentario explicativo
COMMENT ON COLUMN postulaciones.resena_usuario_publica IS 'Indica si la reseña del usuario sobre la organización es pública (true) o privada (false). Por defecto es pública.';

