-- Script SQL para agregar las columnas de reseña del usuario sobre la organización
-- Ejecutar este script en la base de datos PostgreSQL

-- Verificar y agregar columna resena_usuario_sobre_org si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'postulaciones' 
        AND column_name = 'resena_usuario_sobre_org'
    ) THEN
        ALTER TABLE postulaciones 
        ADD COLUMN resena_usuario_sobre_org TEXT;
        
        RAISE NOTICE 'Columna resena_usuario_sobre_org agregada a la tabla postulaciones';
    ELSE
        RAISE NOTICE 'La columna resena_usuario_sobre_org ya existe en la tabla postulaciones';
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

