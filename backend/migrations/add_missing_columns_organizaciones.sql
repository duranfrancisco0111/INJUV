-- Script SQL para agregar columnas faltantes a la tabla organizaciones
-- Ejecutar este script en la base de datos PostgreSQL

-- Agregar columna id_usuario_admin si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'id_usuario_admin'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN id_usuario_admin INTEGER;
        
        -- Agregar foreign key constraint
        ALTER TABLE organizaciones 
        ADD CONSTRAINT fk_organizaciones_usuario_admin 
        FOREIGN KEY (id_usuario_admin) REFERENCES usuarios(id);
    END IF;
END $$;

-- Agregar columna ciudad si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'ciudad'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN ciudad VARCHAR(100);
    END IF;
END $$;

-- Agregar columna siglas_nombre si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'siglas_nombre'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN siglas_nombre VARCHAR(100);
    END IF;
END $$;

-- Agregar columna documentos_legales si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'documentos_legales'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN documentos_legales JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Agregar columna fecha_creacion si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'fecha_creacion'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN fecha_creacion DATE;
    END IF;
END $$;

-- Agregar columna descripcion_breve si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'descripcion_breve'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN descripcion_breve VARCHAR(500);
    END IF;
END $$;

-- Agregar columna area_trabajo si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'area_trabajo'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN area_trabajo VARCHAR(100);
    END IF;
END $$;

-- Agregar columna tipo_org si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'tipo_org'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN tipo_org VARCHAR(100);
    END IF;
END $$;

-- Agregar columna sitio_web si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'sitio_web'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN sitio_web TEXT;
    END IF;
END $$;

-- Agregar columna redes_sociales si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'redes_sociales'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN redes_sociales JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Agregar columna experiencia_anios si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'experiencia_anios'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN experiencia_anios INTEGER;
    END IF;
END $$;

-- Agregar columna voluntarios_anuales si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'voluntarios_anuales'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN voluntarios_anuales VARCHAR(100);
    END IF;
END $$;

-- Agregar columna certificacion si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'certificacion'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN certificacion JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Verificar que created_at existe, si no agregarlo
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE organizaciones 
        ADD COLUMN created_at TIMESTAMP;
    END IF;
END $$;

