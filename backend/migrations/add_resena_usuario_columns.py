"""
Script para agregar las columnas de reseña del usuario sobre la organización a la tabla postulaciones.
Ejecutar este script para agregar las columnas necesarias.
"""
import sys
import os

# Agregar el directorio src al path para importar app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from app import app, db
from sqlalchemy import text

def main():
    """Función principal para agregar las columnas de reseña del usuario"""
    with app.app_context():
        try:
            print("🔌 Conectando a la base de datos...")
            
            # Lista de columnas a agregar con sus definiciones SQL
            columns_to_add = [
                ('resena_usuario_sobre_org', 'TEXT'),
                ('calificacion_usuario_org', 'NUMERIC(3, 1)'),
            ]
            
            print("📋 Verificando y agregando columnas faltantes...\n")
            
            # Agregar cada columna si no existe
            for column_name, column_type in columns_to_add:
                check_query = text(f"""
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'postulaciones' 
                    AND column_name = '{column_name}'
                """)
                
                result = db.session.execute(check_query).fetchone()
                
                if not result:
                    print(f"➕ Agregando columna: {column_name} ({column_type})...")
                    alter_query = text(f"ALTER TABLE postulaciones ADD COLUMN {column_name} {column_type}")
                    db.session.execute(alter_query)
                    db.session.commit()
                    print(f"✅ Columna {column_name} agregada exitosamente\n")
                else:
                    print(f"ℹ️  La columna {column_name} ya existe, omitiendo...\n")
            
            print("✨ ¡Migración completada exitosamente!")
            
        except Exception as e:
            print(f"❌ Error durante la migración: {str(e)}")
            db.session.rollback()
            import traceback
            traceback.print_exc()
            return 1
    
    return 0

if __name__ == "__main__":
    exit(main())

