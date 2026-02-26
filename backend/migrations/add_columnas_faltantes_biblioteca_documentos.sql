-- Añade columnas que puede esperar el modelo BibliotecaDocumento (ejecutar en pgAdmin si el auto-fix falla)
-- Si tu PostgreSQL no soporta IF NOT EXISTS, quita esa parte y ejecuta solo los ALTER que falten.

ALTER TABLE biblioteca_documentos ADD COLUMN IF NOT EXISTS archivo_tamano_bytes BIGINT;
ALTER TABLE biblioteca_documentos ADD COLUMN IF NOT EXISTS descripcion VARCHAR(500);
ALTER TABLE biblioteca_documentos ADD COLUMN IF NOT EXISTS archivo_mime VARCHAR(120);
ALTER TABLE biblioteca_documentos ADD COLUMN IF NOT EXISTS autor VARCHAR(150);
ALTER TABLE biblioteca_documentos ADD COLUMN IF NOT EXISTS fecha_edicion TIMESTAMP;
ALTER TABLE biblioteca_documentos ADD COLUMN IF NOT EXISTS tematica_id INTEGER REFERENCES biblioteca_tematicas(id) ON DELETE SET NULL;
ALTER TABLE biblioteca_documentos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE biblioteca_documentos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
