# Resumen de tablas de la base de datos – INJUV

Documento de referencia para el equipo. El DDL completo está en `esquema_bdd_completo.sql`.

| # | Tabla | Descripción |
|---|--------|-------------|
| 1 | **usuarios** | Usuarios del sistema (voluntarios, organizaciones, admin). Incluye datos personales, RUT, región, certificados y organización afiliada. |
| 2 | **organizaciones** | Organizaciones que publican oportunidades de voluntariado. Datos legales, contacto, descripción, redes, certificación. Relacionada con `usuarios` vía `id_usuario_org`. |
| 3 | **oportunidades** | Oportunidades de voluntariado publicadas por una organización. Incluye fechas de inicio/fin, horas de voluntariado, cupos, responsable, ubicación. |
| 4 | **postulaciones** | Relación usuario–oportunidad: postulaciones, estado, reseñas y calificaciones (org↔voluntario), certificado, horas de voluntariado. |
| 5 | **noticias** | Noticias del portal. Título, contenido, resumen, autor (`usuarios.id`), estado, imagen, fecha de publicación. |
| 6 | **biblioteca_tematicas** | Catálogo de temáticas para clasificar documentos de la sección Biblioteca. |
| 7 | **biblioteca_documentos** | Documentos de la Biblioteca: archivo, autor, fecha, descripción, temática (`biblioteca_tematicas.id`). |

## Relaciones principales

- **organizaciones** → `id_usuario_org` → **usuarios**(id)
- **oportunidades** → `organizacion_id` → **organizaciones**(id)
- **postulaciones** → `usuario_id` → **usuarios**(id), `oportunidad_id` → **oportunidades**(id)
- **noticias** → `autor_id` → **usuarios**(id)
- **biblioteca_documentos** → `tematica_id` → **biblioteca_tematicas**(id)

## Uso del DDL

- **Proyecto nuevo:** ejecutar `esquema_bdd_completo.sql` en una base PostgreSQL vacía para crear todas las tablas e índices.
- **Base ya existente:** ese script usa `CREATE TABLE IF NOT EXISTS` y `CREATE INDEX IF NOT EXISTS`; las tablas/índices que ya existan no se modifican. Para añadir solo columnas nuevas usad los scripts en `backend/migrations/`.
