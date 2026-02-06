-- Agregar organizacion_id a biblioteca_documentos para filtrar por organización
-- Las organizaciones suben documentos; los voluntarios pueden filtrar por organización, fecha y temática.

-- Crear tablas si no existen (compatible con esquema_bdd_completo.sql)
CREATE TABLE IF NOT EXISTS biblioteca_tematicas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS biblioteca_documentos (
    id SERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    archivo_filename VARCHAR(255) NOT NULL,
    archivo_mime VARCHAR(120),
    archivo_tamano_bytes BIGINT,
    autor VARCHAR(150),
    fecha_edicion TIMESTAMP,
    descripcion VARCHAR(500),
    tematica_id INTEGER REFERENCES biblioteca_tematicas(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Agregar organizacion_id si la tabla ya existe sin esa columna
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'biblioteca_documentos' AND column_name = 'organizacion_id'
    ) THEN
        ALTER TABLE biblioteca_documentos
        ADD COLUMN organizacion_id INTEGER REFERENCES organizaciones(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_biblioteca_documentos_tematica ON biblioteca_documentos(tematica_id);
CREATE INDEX IF NOT EXISTS idx_biblioteca_documentos_fecha_edicion ON biblioteca_documentos(fecha_edicion);
CREATE INDEX IF NOT EXISTS idx_biblioteca_documentos_organizacion ON biblioteca_documentos(organizacion_id);

-- Insertar temáticas por defecto (mismas categorías de la página: noticias/voluntariado)
INSERT INTO biblioteca_tematicas (nombre) VALUES
    ('Voluntariado'),
    ('Medio Ambiente'),
    ('Educación'),
    ('Salud'),
    ('Emergencia'),
    ('Noticias'),
    ('Desarrollo Comunitario'),
    ('Cultura'),
    ('Deportes')
ON CONFLICT (nombre) DO NOTHING;
