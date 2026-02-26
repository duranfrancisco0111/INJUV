-- Columna de tamaño de archivo en biblioteca_documentos (compatible con el modelo)
ALTER TABLE biblioteca_documentos
ADD COLUMN IF NOT EXISTS archivo_tamano_bytes BIGINT;
