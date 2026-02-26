-- Tabla de documentos de la sección Academia (repositorio)
CREATE TABLE IF NOT EXISTS academia_documentos (
    id SERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    archivo_filename VARCHAR(255) NOT NULL,
    archivo_mime VARCHAR(120),
    archivo_tamano_bytes BIGINT,
    autor VARCHAR(150),
    fecha_edicion TIMESTAMP,
    descripcion VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
