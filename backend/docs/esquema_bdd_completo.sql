-- =============================================================================
-- ESQUEMA COMPLETO DE LA BASE DE DATOS - INJUV (Voluntariado)
-- Para compartir con el equipo. PostgreSQL.
-- Generado a partir de los modelos en backend/src/app.py y migraciones.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USUARIOS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    rut VARCHAR(20),
    email VARCHAR(150),
    telefono VARCHAR(20),
    region VARCHAR(100),
    ciudad VARCHAR(100),
    comuna VARCHAR(100),
    sexo VARCHAR(100),
    fecha_nacimiento DATE,
    password_hash VARCHAR(100),
    rol VARCHAR(100),
    hora_voluntariado INTEGER,
    certificado_voluntariado JSONB DEFAULT '[]'::jsonb,
    certificado_personales JSONB DEFAULT '[]'::jsonb,
    organizacion_afiliada INTEGER,
    created_at TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. ORGANIZACIONES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    siglas_nombre VARCHAR(100),
    documentos_legales JSONB DEFAULT '[]'::jsonb,
    rut VARCHAR(20),
    email_contacto VARCHAR(150),
    fecha_creacion DATE,
    telefono_contacto VARCHAR(20),
    region VARCHAR(100),
    ciudad VARCHAR(100),
    comuna VARCHAR(100),
    descripcion TEXT,
    descripcion_breve VARCHAR(500),
    id_usuario_org INTEGER REFERENCES usuarios(id),
    area_trabajo VARCHAR(100),
    tipo_org VARCHAR(100),
    sitio_web TEXT,
    redes_sociales JSONB DEFAULT '[]'::jsonb,
    experiencia_anios INTEGER,
    voluntarios_anuales VARCHAR(100),
    certificacion JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_organizaciones_id_usuario_org ON organizaciones(id_usuario_org);

-- -----------------------------------------------------------------------------
-- 3. OPORTUNIDADES (voluntariados publicados por organizaciones)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS oportunidades (
    id SERIAL PRIMARY KEY,
    organizacion_id INTEGER NOT NULL REFERENCES organizaciones(id),
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    meta_postulantes INTEGER,
    cupo_maximo INTEGER,
    fecha_limite_postulacion DATE,
    fecha_inicio_voluntariado DATE,
    fecha_fin_voluntariado DATE,
    horas_voluntariado INTEGER,
    estado VARCHAR(20),
    responsable_nombre VARCHAR(50),
    responsable_apellido VARCHAR(50),
    responsable_email VARCHAR(255),
    responsable_email_institucional VARCHAR(255),
    responsable_telefono VARCHAR(30),
    region_opor VARCHAR(255),
    ciudad_opor VARCHAR(255),
    comuna_opor VARCHAR(255),
    tipo_de_voluntariado VARCHAR(100),
    created_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_oportunidades_organizacion_id ON oportunidades(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_oportunidades_estado ON oportunidades(estado);
CREATE INDEX IF NOT EXISTS idx_oportunidades_fecha_limite ON oportunidades(fecha_limite_postulacion);

-- -----------------------------------------------------------------------------
-- 4. POSTULACIONES (usuarios postulados a oportunidades)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS postulaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    oportunidad_id INTEGER NOT NULL REFERENCES oportunidades(id),
    estado VARCHAR(50),
    motivo_no_seleccion VARCHAR(255),
    motivo_no_seleccion_otro TEXT,
    estado_confirmacion VARCHAR(20),
    asistencia_capacitacion VARCHAR(20),
    asistencia_actividad VARCHAR(20),
    tiene_certificado BOOLEAN,
    ruta_certificado_pdf TEXT,
    resena_org_sobre_voluntario TEXT,
    resena_org_publica BOOLEAN,
    calificacion_org NUMERIC(3, 1),
    "reseña_org" TEXT,
    horas_voluntariado INTEGER DEFAULT 0,
    resena_usuario_publica BOOLEAN DEFAULT true,
    "reseña_organizacion" TEXT,
    calificacion_usuario_org NUMERIC(3, 1),
    resena_usuario_sobre_org TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
-- Opcional: evitar doble postulación por usuario/oportunidad:
-- ALTER TABLE postulaciones ADD CONSTRAINT uq_postulacion_usuario_oportunidad UNIQUE(usuario_id, oportunidad_id);

CREATE INDEX IF NOT EXISTS idx_postulaciones_usuario_id ON postulaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_postulaciones_oportunidad_id ON postulaciones(oportunidad_id);
CREATE INDEX IF NOT EXISTS idx_postulaciones_estado ON postulaciones(estado);

-- -----------------------------------------------------------------------------
-- 5. NOTICIAS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    resumen VARCHAR(500),
    autor_id INTEGER REFERENCES usuarios(id),
    estado VARCHAR(20) DEFAULT 'activa',
    imagen_noticia VARCHAR(500),
    fecha_publicacion TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_noticias_autor_id ON noticias(autor_id);
CREATE INDEX IF NOT EXISTS idx_noticias_estado ON noticias(estado);
CREATE INDEX IF NOT EXISTS idx_noticias_fecha_publicacion ON noticias(fecha_publicacion);

-- -----------------------------------------------------------------------------
-- 6. BIBLIOTECA - Temáticas (para filtros de documentos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS biblioteca_tematicas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE
);

-- -----------------------------------------------------------------------------
-- 7. BIBLIOTECA - Documentos (repositorio abierto para voluntarios)
-- -----------------------------------------------------------------------------
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
    organizacion_id INTEGER REFERENCES organizaciones(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biblioteca_documentos_tematica ON biblioteca_documentos(tematica_id);
CREATE INDEX IF NOT EXISTS idx_biblioteca_documentos_fecha_edicion ON biblioteca_documentos(fecha_edicion);
CREATE INDEX IF NOT EXISTS idx_biblioteca_documentos_organizacion ON biblioteca_documentos(organizacion_id);

-- =============================================================================
-- FIN DEL ESQUEMA
-- =============================================================================
