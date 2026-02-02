-- Agregar columna horas_voluntariado a la tabla postulaciones
-- Esta columna almacenará las horas de voluntariado específicas de cada postulación/oportunidad
ALTER TABLE postulaciones 
ADD COLUMN IF NOT EXISTS horas_voluntariado INTEGER DEFAULT 0;

