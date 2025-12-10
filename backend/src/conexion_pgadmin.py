import psycopg2

try: 
    connection = psycopg2.connect(
        host = "localhost",
        user = "postgres",
        password = "fran0405",
        database = "INJUV"
    )
    print("conexion exitosa")
    cursor = connection.cursor()
except Exception as ex:
    print(ex)

finally:
    connection.close()
    print("conexion terminada")