-- Categoría para documentos Academia: Guías y Manuales, Plantillas y Formatos, Videos Tutoriales
ALTER TABLE academia_documentos ADD COLUMN IF NOT EXISTS categoria VARCHAR(80);
