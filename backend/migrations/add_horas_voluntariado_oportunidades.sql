-- Agregar columna horas_voluntariado a la tabla oportunidades
-- Esta columna representa las horas estimadas del voluntariado (definidas por la organización)

ALTER TABLE oportunidades
ADD COLUMN IF NOT EXISTS horas_voluntariado INTEGER;

-- Opcional: validar que no sea negativa
-- ALTER TABLE oportunidades
-- ADD CONSTRAINT oportunidades_horas_voluntariado_non_negative CHECK (horas_voluntariado IS NULL OR horas_voluntariado >= 0);

