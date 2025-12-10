"""
Script para actualizar la tabla organizaciones con las columnas faltantes.
Ejecutar este script para agregar todas las columnas necesarias.
Usa SQLAlchemy que ya está configurado en el proyecto.
"""
import sys
import os

# Agregar el directorio src al path para importar app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from app import app, db
from sqlalchemy import text

def main():
    """Función principal para actualizar la tabla organizaciones"""
    with app.app_context():
        try:
            print("🔌 Conectando a la base de datos...")
            
            # Lista de columnas a agregar con sus definiciones SQL
            columns_to_add = [
                ('id_usuario_admin', 'INTEGER'),
                ('ciudad', 'VARCHAR(100)'),
                ('siglas_nombre', 'VARCHAR(100)'),
                ('documentos_legales', 'JSONB DEFAULT \'[]\'::jsonb'),
                ('fecha_creacion', 'DATE'),
                ('descripcion_breve', 'VARCHAR(500)'),
                ('area_trabajo', 'VARCHAR(100)'),
                ('tipo_org', 'VARCHAR(100)'),
                ('sitio_web', 'TEXT'),
                ('redes_sociales', 'JSONB DEFAULT \'[]\'::jsonb'),
                ('experiencia_anios', 'INTEGER'),
                ('voluntarios_anuales', 'VARCHAR(100)'),
                ('certificacion', 'JSONB DEFAULT \'[]\'::jsonb'),
                ('created_at', 'TIMESTAMP'),
            ]
            
            print("📋 Verificando y agregando columnas faltantes...\n")
            
            # Agregar cada columna si no existe
            for column_name, column_def in columns_to_add:
                # Verificar si la columna existe
                check_query = text("""
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'organizaciones' AND column_name = :col_name
                """)
                result = db.session.execute(check_query, {'col_name': column_name}).fetchone()
                
                if not result:
                    # Agregar la columna
                    alter_query = text(f"""
                        ALTER TABLE organizaciones 
                        ADD COLUMN {column_name} {column_def}
                    """)
                    db.session.execute(alter_query)
                    db.session.commit()
                    print(f"✅ Columna '{column_name}' agregada")
                else:
                    print(f"⏭️  Columna '{column_name}' ya existe")
            
            # Verificar y agregar foreign key para id_usuario_admin
            print("\n🔗 Verificando foreign keys...\n")
            fk_check = text("""
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_organizaciones_usuario_admin' 
                AND table_name = 'organizaciones'
            """)
            fk_exists = db.session.execute(fk_check).fetchone()
            
            if not fk_exists:
                # Verificar que la columna existe antes de agregar FK
                col_check = text("""
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'organizaciones' AND column_name = 'id_usuario_admin'
                """)
                if db.session.execute(col_check).fetchone():
                    fk_query = text("""
                        ALTER TABLE organizaciones 
                        ADD CONSTRAINT fk_organizaciones_usuario_admin 
                        FOREIGN KEY (id_usuario_admin) REFERENCES usuarios(id)
                    """)
                    db.session.execute(fk_query)
                    db.session.commit()
                    print("✅ Foreign key 'fk_organizaciones_usuario_admin' agregada")
                else:
                    print("⚠️  No se puede agregar FK: la columna 'id_usuario_admin' no existe")
            else:
                print("⏭️  Foreign key 'fk_organizaciones_usuario_admin' ya existe")
            
            print("\n✅ Actualización completada exitosamente")
            
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return 1
        
    return 0

if __name__ == "__main__":
    exit(main())
