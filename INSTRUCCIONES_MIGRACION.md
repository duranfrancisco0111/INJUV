# Instrucciones para Agregar Columnas de Reseña del Usuario

## Problema
El error indica que las columnas `resena_usuario_sobre_org` y `calificacion_usuario_org` no existen en la tabla `postulaciones` de la base de datos.

## Solución

Tienes dos opciones para agregar las columnas:

### Opción 1: Ejecutar el script SQL directamente (RECOMENDADO)

1. Abre pgAdmin o tu cliente PostgreSQL favorito
2. Conéctate a la base de datos `INJUV`
3. Ejecuta el siguiente script SQL que está en `backend/migrations/add_resena_usuario_columns.sql`:

```sql
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
```

### Opción 2: Ejecutar el script Python

1. Activa tu entorno virtual:
   ```powershell
   cd backend
   .\env\Scripts\Activate.ps1
   ```

2. Ejecuta el script de migración:
   ```powershell
   cd migrations
   python add_resena_usuario_columns_simple.py
   ```

## Verificación

Después de ejecutar la migración, puedes verificar que las columnas fueron agregadas ejecutando:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'postulaciones' 
AND column_name IN ('resena_usuario_sobre_org', 'calificacion_usuario_org');
```

Deberías ver ambas columnas listadas.

## Reiniciar el servidor

Después de ejecutar la migración, reinicia tu servidor Flask para que los cambios surtan efecto.

