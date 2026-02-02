-- Script SQL para agregar la columna reseña_organizacion a la tabla postulaciones
-- Ejecutar este script en la base de datos PostgreSQL

-- Verificar y agregar columna reseña_organizacion si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'postulaciones' 
        AND column_name = 'reseña_organizacion'
    ) THEN
        ALTER TABLE postulaciones 
        ADD COLUMN "reseña_organizacion" TEXT;
        
        RAISE NOTICE 'Columna reseña_organizacion agregada a la tabla postulaciones';
    ELSE
        RAISE NOTICE 'La columna reseña_organizacion ya existe en la tabla postulaciones';
    END IF;
END $$;

-- Verificar y agregar columna calificacion_usuario_org si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'postulaciones' 
        AND column_name = 'calificacion_usuario_org'
    ) THEN
        ALTER TABLE postulaciones 
        ADD COLUMN calificacion_usuario_org NUMERIC(3, 1);
        
        RAISE NOTICE 'Columna calificacion_usuario_org agregada a la tabla postulaciones';
    ELSE
        RAISE NOTICE 'La columna calificacion_usuario_org ya existe en la tabla postulaciones';
    END IF;
END $$;

