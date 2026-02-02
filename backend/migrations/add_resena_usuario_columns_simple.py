"""
Script simple para agregar las columnas de reseña del usuario sobre la organización.
Usa psycopg2 directamente, no requiere Flask.
"""
import psycopg2

def main():
    try:
        print("🔌 Conectando a la base de datos...")
        connection = psycopg2.connect(
            host="localhost",
            user="postgres",
            password="fran0405",
            database="INJUV"
        )
        cursor = connection.cursor()
        print("✅ Conexión exitosa\n")
        
        # Lista de columnas a agregar
        columns_to_add = [
            ('resena_usuario_sobre_org', 'TEXT'),
            ('calificacion_usuario_org', 'NUMERIC(3, 1)'),
        ]
        
        print("📋 Verificando y agregando columnas faltantes...\n")
        
        for column_name, column_type in columns_to_add:
            # Verificar si la columna existe
            check_query = """
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'postulaciones' 
                AND column_name = %s
            """
            cursor.execute(check_query, (column_name,))
            result = cursor.fetchone()
            
            if not result:
                print(f"➕ Agregando columna: {column_name} ({column_type})...")
                alter_query = f"ALTER TABLE postulaciones ADD COLUMN {column_name} {column_type}"
                cursor.execute(alter_query)
                connection.commit()
                print(f"✅ Columna {column_name} agregada exitosamente\n")
            else:
                print(f"ℹ️  La columna {column_name} ya existe, omitiendo...\n")
        
        print("✨ ¡Migración completada exitosamente!")
        cursor.close()
        connection.close()
        return 0
        
    except Exception as e:
        print(f"❌ Error durante la migración: {str(e)}")
        import traceback
        traceback.print_exc()
        if 'connection' in locals():
            connection.rollback()
            connection.close()
        return 1

if __name__ == "__main__":
    exit(main())

