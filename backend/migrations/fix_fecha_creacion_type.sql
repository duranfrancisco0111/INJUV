-- Script SQL para cambiar el tipo de la columna fecha_creacion de INTEGER a DATE
-- Ejecutar este script en la base de datos PostgreSQL

-- Verificar si la columna existe y cambiar su tipo
DO $$ 
BEGIN
    -- Verificar si la columna existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'fecha_creacion'
    ) THEN
        -- Cambiar el tipo de la columna de INTEGER a DATE
        ALTER TABLE organizaciones 
        ALTER COLUMN fecha_creacion TYPE DATE USING 
            CASE 
                WHEN fecha_creacion IS NULL THEN NULL
                WHEN fecha_creacion::text ~ '^\d{4}-\d{2}-\d{2}$' THEN fecha_creacion::text::DATE
                ELSE NULL
            END;
        
        RAISE NOTICE 'Columna fecha_creacion cambiada de INTEGER a DATE';
    ELSE
        RAISE NOTICE 'La columna fecha_creacion no existe en la tabla organizaciones';
    END IF;
END $$;

