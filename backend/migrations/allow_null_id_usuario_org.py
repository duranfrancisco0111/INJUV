"""
Script para permitir valores NULL en la columna id_usuario_org de la tabla organizaciones
Ejecutar: python backend/migrations/allow_null_id_usuario_org.py
"""
import sys
import os

# Agregar el directorio src al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from app import app, db
from sqlalchemy import text

def main():
    """Función principal para ejecutar la migración"""
    with app.app_context():
        try:
            print("🔌 Conectando a la base de datos...")
            
            # Ejecutar ALTER TABLE para permitir NULL
            print("📋 Ejecutando migración: permitir NULL en id_usuario_org...")
            alter_query = text("ALTER TABLE organizaciones ALTER COLUMN id_usuario_org DROP NOT NULL")
            db.session.execute(alter_query)
            db.session.commit()
            
            print("✅ Migración ejecutada exitosamente")
            print("✅ La columna id_usuario_org ahora permite valores NULL")
            return 0
            
        except Exception as e:
            db.session.rollback()
            error_msg = str(e)
            
            # Si el error es que ya no tiene NOT NULL, considerarlo como éxito
            if 'does not have a NOT NULL constraint' in error_msg or 'does not exist' in error_msg.lower():
                print("ℹ️  La columna ya permite valores NULL o no existe la restricción")
                return 0
            
            print(f"❌ Error al ejecutar migración: {error_msg}")
            import traceback
            print(traceback.format_exc())
            return 1

if __name__ == "__main__":
    exit(main())

