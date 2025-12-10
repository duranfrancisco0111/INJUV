-- Script SQL para agregar la columna organizacion_id a la tabla oportunidades si no existe
-- Ejecutar este script en la base de datos PostgreSQL

-- Verificar y agregar columna organizacion_id si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'oportunidades' 
        AND column_name = 'organizacion_id'
    ) THEN
        ALTER TABLE oportunidades 
        ADD COLUMN organizacion_id INTEGER;
        
        -- Agregar foreign key constraint si no existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_oportunidades_organizacion' 
            AND table_name = 'oportunidades'
        ) THEN
            ALTER TABLE oportunidades 
            ADD CONSTRAINT fk_oportunidades_organizacion 
            FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id);
        END IF;
        
        RAISE NOTICE 'Columna organizacion_id agregada a la tabla oportunidades';
    ELSE
        RAISE NOTICE 'La columna organizacion_id ya existe en la tabla oportunidades';
    END IF;
END $$;

