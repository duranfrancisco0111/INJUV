-- Estado de revisión para documentos de Academia subidos por organizaciones.
-- pendiente = en revisión por admin; aprobado = público; rechazado = no publicado.

-- Añadir columna estado si no existe (compatible con PostgreSQL 9.4+)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'academia_documentos' AND column_name = 'estado'
  ) THEN
    ALTER TABLE academia_documentos
    ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'pendiente';
  END IF;
END $$;

-- Documentos ya existentes se consideran aprobados
UPDATE academia_documentos SET estado = 'aprobado' WHERE estado = 'pendiente' OR estado IS NULL;

-- Índice para filtrar por estado
CREATE INDEX IF NOT EXISTS idx_academia_documentos_estado ON academia_documentos(estado);
