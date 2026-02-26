-- Documentos de Academia pueden pertenecer a una organización (panel org) o ser globales (admin)
ALTER TABLE academia_documentos
ADD COLUMN IF NOT EXISTS organizacion_id INTEGER REFERENCES organizaciones(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_academia_documentos_organizacion ON academia_documentos(organizacion_id);
