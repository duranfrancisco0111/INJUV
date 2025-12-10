-- Script SQL para permitir valores NULL en la columna id_usuario_org de la tabla organizaciones
-- Ejecutar este script en la base de datos PostgreSQL

-- Permitir NULL en id_usuario_org
DO $$ 
BEGIN
    -- Verificar si la columna existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizaciones' 
        AND column_name = 'id_usuario_org'
    ) THEN
        -- Cambiar la columna para permitir NULL
        ALTER TABLE organizaciones 
        ALTER COLUMN id_usuario_org DROP NOT NULL;
        
        RAISE NOTICE 'Columna id_usuario_org ahora permite valores NULL';
    ELSE
        RAISE NOTICE 'La columna id_usuario_org no existe en la tabla organizaciones';
    END IF;
END $$;

