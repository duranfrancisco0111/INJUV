from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from sqlalchemy import func, text
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
import os
import base64
import io
try:
    from openpyxl import Workbook
    from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
    from openpyxl.drawing.image import Image
    OPENPYXL_AVAILABLE = True
    print("✅ openpyxl está disponible")
except ImportError as e:
    OPENPYXL_AVAILABLE = False
    print(f"⚠️ openpyxl no está instalado. Error: {e}")
    print("⚠️ Asegúrate de activar el entorno virtual (env) y ejecutar: pip install openpyxl")
    print(f"⚠️ Python actual: {__import__('sys').executable}")

app = Flask(__name__)

# Configurar CORS manualmente si flask_cors no está instalado
@app.after_request
def after_request(response):
    # Solo agregar headers si no existen ya (para evitar duplicación)
    if 'Access-Control-Allow-Origin' not in response.headers:
        response.headers['Access-Control-Allow-Origin'] = '*'
    if 'Access-Control-Allow-Headers' not in response.headers:
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    if 'Access-Control-Allow-Methods' not in response.headers:
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

# Manejar solicitudes OPTIONS para CORS
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return response

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:fran0405@localhost/INJUV'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuración de Flask-Mail
# Para Gmail, necesitas usar una "Contraseña de aplicación" en lugar de tu contraseña normal
# Ve a: https://myaccount.google.com/apppasswords
# También puedes configurar estas variables en un archivo .env o como variables de entorno del sistema
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True').lower() in ['true', '1', 'yes']
app.config['MAIL_USE_SSL'] = os.environ.get('MAIL_USE_SSL', 'False').lower() in ['true', '1', 'yes']
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', '')  # Tu email
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', '')  # Tu contraseña de aplicación
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME'])

# Si no hay credenciales configuradas, Flask-Mail se inicializará pero no enviará emails
# Esto permite que la aplicación funcione sin email configurado (solo mostrará warnings)

db = SQLAlchemy(app)
mail = Mail(app)


# Modelo de prueba (opcional)
class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100))
    apellido = db.Column(db.String(100))
    rut = db.Column(db.String(20), nullable=True)  # Hacer opcional
    email = db.Column(db.String(150))
    telefono = db.Column(db.String(20), nullable=True)
    region = db.Column(db.String(100), nullable=True)
    ciudad = db.Column(db.String(100), nullable=True)
    comuna = db.Column(db.String(100), nullable=True)
    sexo = db.Column(db.String(100), nullable=True)
    fecha_nacimiento = db.Column(db.Date, nullable=True)
    password_hash = db.Column(db.String(100))
    rol = db.Column(db.String(100), nullable=True)
    hora_voluntariado = db.Column(db.Integer, nullable=True)
    certificado_voluntariado = db.Column(db.JSON, default=list, nullable=True)
    certificado_personales = db.Column(db.JSON, default=list, nullable=True)
    organizacion_afiliada = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, nullable=True)
       
class Organizacion(db.Model):
    __tablename__ = 'organizaciones'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=True)
    siglas_nombre = db.Column(db.String(100), nullable=True)
    documentos_legales = db.Column(db.JSON, default=list, nullable=True)
    rut = db.Column(db.String(20), nullable=True)
    email_contacto = db.Column(db.String(150), nullable=True)
    fecha_creacion = db.Column(db.Date, nullable=True)
    telefono_contacto = db.Column(db.String(20), nullable=True)
    region = db.Column(db.String(100), nullable=True)
    ciudad = db.Column(db.String(100), nullable=True)
    comuna = db.Column(db.String(100), nullable=True)
    descripcion = db.Column(db.Text, nullable=True)
    descripcion_breve = db.Column(db.String(500), nullable=True)
    id_usuario_org = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    area_trabajo = db.Column(db.String(100), nullable=True)
    tipo_org = db.Column(db.String(100), nullable=True)
    sitio_web = db.Column(db.Text, nullable=True)
    redes_sociales = db.Column(db.JSON, default=list, nullable=True)
    experiencia_anios = db.Column(db.Integer, nullable=True)
    voluntarios_anuales = db.Column(db.String(100), nullable=True)
    certificacion = db.Column(db.JSON, default=list, nullable=True)
    reseña_organizacion = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, nullable=True)

class Postulacion(db.Model):
    __tablename__ = 'postulaciones'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    oportunidad_id = db.Column(db.Integer, db.ForeignKey('oportunidades.id'))
    estado = db.Column(db.String(50))
    motivo_no_seleccion = db.Column(db.String(255))
    motivo_no_seleccion_otro = db.Column(db.Text)  # Corregido: debe coincidir con el nombre en la BD
    estado_confirmacion = db.Column(db.String(20))
    asistencia_capacitacion = db.Column(db.String(20))
    asistencia_actividad = db.Column(db.String(20))
    tiene_certificado = db.Column(db.Boolean)
    ruta_certificado_pdf = db.Column(db.Text)
    resena_org_sobre_voluntario = db.Column(db.Text)
    resena_org_publica = db.Column(db.Boolean)
    calificacion_org = db.Column(db.Numeric(3, 1))  # Permite valores de 0.0 a 5.0 con un decimal
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

class Oportunidad(db.Model):
    __tablename__ = 'oportunidades'

    id = db.Column(db.Integer, primary_key=True)
    organizacion_id = db.Column(db.Integer, nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    meta_postulantes = db.Column(db.Integer)
    cupo_maximo = db.Column(db.Integer)
    fecha_limite_postulacion = db.Column(db.Date)
    estado = db.Column(db.String(20))
    responsable_nombre = db.Column(db.String(50))
    responsable_apellido = db.Column(db.String(50))
    responsable_email = db.Column(db.String(255))
    responsable_email_institucional = db.Column(db.String(255))
    responsable_telefono = db.Column(db.String(30))
    region_opor = db.Column(db.String(255))
    ciudad_opor = db.Column(db.String(255))
    comuna_opor = db.Column(db.String(255))
    tipo_de_voluntariado = db.Column('tipo_de_voluntariado', db.String(100), nullable=True)
    # area_voluntariado es un alias que apunta a la misma columna tipo_de_voluntariado
    @property
    def area_voluntariado(self):
        return self.tipo_de_voluntariado
    
    @area_voluntariado.setter
    def area_voluntariado(self, value):
        self.tipo_de_voluntariado = value
    created_at = db.Column(db.DateTime)

class Noticia(db.Model):
    __tablename__ = 'noticias'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    resumen = db.Column(db.String(500), nullable=True)
    autor_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    estado = db.Column(db.String(20), default='activa')  # activa, inactiva, borrador
    imagen_noticia = db.Column(db.String(500), nullable=True)
    fecha_publicacion = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)



@app.route("/")
def home():
    return "Conexion exitosa con Flask + PostgreSQL"

# Endpoint para registrar usuarios (útil para crear usuarios de prueba)
@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.json
        
        email = data.get('email')
        password = data.get('password')
        nombre = data.get('nombre', '')
        apellido = data.get('apellido', '')
        rut = data.get('rut', '').strip().upper()
        rol = data.get('rol', 'user')
        fecha_nacimiento_str = data.get('fecha_nacimiento')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Email y contraseña son requeridos'
            }), 400
        
        if not rut:
            return jsonify({
                'success': False,
                'error': 'El RUT es requerido'
            }), 400
        
        # Verificar si el RUT ya está registrado
        rut_limpio = rut.replace('.', '').replace('-', '')
        usuario_rut_existente = Usuario.query.filter_by(rut=rut_limpio).first()
        if usuario_rut_existente:
            return jsonify({
                'success': False,
                'error': 'El RUT ya está registrado'
            }), 400
        
        # Convertir fecha de nacimiento de string a Date si se proporciona
        fecha_nacimiento = None
        if fecha_nacimiento_str:
            try:
                from datetime import datetime
                fecha_nacimiento = datetime.strptime(fecha_nacimiento_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Formato de fecha de nacimiento inválido'
                }), 400
        
        # Verificar si el usuario ya existe
        usuario_existente = Usuario.query.filter_by(email=email).first()
        if usuario_existente:
            return jsonify({
                'success': False,
                'error': 'El email ya está registrado'
            }), 400
        
        # Crear nuevo usuario (campos opcionales pueden ser None)
        nuevo_usuario = Usuario(
            email=email,
            password_hash=generate_password_hash(password),
            nombre=nombre,
            apellido=apellido,
            rol=rol,
            rut=rut_limpio,  # RUT sin puntos ni guion
            telefono=None,
            region=None,
            comuna=None,
            sexo=None,
            fecha_nacimiento=fecha_nacimiento,
            created_at=datetime.now()
        )
        
        try:
            db.session.add(nuevo_usuario)
            db.session.commit()
        except Exception as db_error:
            # Si falla por restricción de NOT NULL en rut, intentar con valor por defecto
            if 'rut' in str(db_error).lower() or 'not null' in str(db_error).lower():
                # Intentar con un RUT temporal basado en el email
                rut_temporal = email.split('@')[0].replace('.', '').replace('-', '')[:12] or 'TEMP'
                nuevo_usuario.rut = rut_temporal
                db.session.rollback()
                db.session.add(nuevo_usuario)
                db.session.commit()
            else:
                raise
        
        return jsonify({
            'success': True,
            'message': 'Usuario registrado exitosamente',
            'user': {
                'id': nuevo_usuario.id,
                'email': nuevo_usuario.email,
                'nombre': nuevo_usuario.nombre,
                'apellido': nuevo_usuario.apellido,
                'rol': nuevo_usuario.rol
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint de login
@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Email y contraseña son requeridos'
            }), 400
        
        # Buscar usuario por email
        usuario = Usuario.query.filter_by(email=email).first()
        
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Email o contraseña incorrectos'
            }), 401
        
        # Verificar contraseña
        if not check_password_hash(usuario.password_hash, password):
            return jsonify({
                'success': False,
                'error': 'Email o contraseña incorrectos'
            }), 401
        
        # Asegurar que el rol siempre tenga un valor
        rol_usuario = usuario.rol if usuario.rol else 'user'
        
        return jsonify({
            'success': True,
            'message': 'Inicio de sesión exitoso',
            'user': {
                'id': usuario.id,
                'email': usuario.email,
                'nombre': usuario.nombre,
                'apellido': usuario.apellido,
                'rol': rol_usuario
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para actualizar información de contacto del usuario
@app.route("/api/usuario/contacto", methods=["PUT"])
def actualizar_contacto():
    try:
        data = request.json
        
        user_id = data.get('user_id')
        email = data.get('email')
        telefono = data.get('telefono')
        region = data.get('region')
        ciudad = data.get('ciudad')
        comuna = data.get('comuna')
        
        if not user_id:
            return jsonify({'success': False, 'error': 'user_id es requerido'}), 400
        
        # Buscar el usuario
        usuario = Usuario.query.get(user_id)
        
        if not usuario:
            return jsonify({'success': False, 'error': 'Usuario no encontrado'}), 404
        
        # Actualizar los campos (permitir valores vacíos para limpiar campos)
        if email is not None:
            usuario.email = email if email else None
        if telefono is not None:
            usuario.telefono = telefono if telefono else None
        if region is not None:
            usuario.region = region if region else None
        if ciudad is not None:
            usuario.ciudad = ciudad if ciudad else None
        if comuna is not None:
            usuario.comuna = comuna if comuna else None
        
        # Guardar en la base de datos
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Información de contacto actualizada exitosamente',
            'contacto': {
                'email': usuario.email,
                'telefono': usuario.telefono,
                'region': usuario.region,
                'ciudad': usuario.ciudad,
                'comuna': usuario.comuna
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Endpoint para obtener información de contacto del usuario
@app.route("/api/usuario/<int:user_id>/contacto", methods=["GET"])
def obtener_contacto(user_id):
    try:
        usuario = Usuario.query.get(user_id)
        
        if not usuario:
            return jsonify({'success': False, 'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'success': True,
            'contacto': {
                'email': usuario.email or '',
                'telefono': usuario.telefono or '',
                'region': usuario.region or '',
                'ciudad': usuario.ciudad or '',
                'comuna': usuario.comuna or ''
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Endpoint para obtener información completa del usuario
@app.route("/api/usuario/<int:user_id>", methods=["GET"])
def obtener_usuario(user_id):
    try:
        usuario = Usuario.query.get(user_id)
        
        if not usuario:
            return jsonify({'success': False, 'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'success': True,
            'usuario': {
                'id': usuario.id,
                'nombre': usuario.nombre or '',
                'apellido': usuario.apellido or '',
                'email': usuario.email or '',
                'telefono': usuario.telefono or '',
                'region': usuario.region or '',
                'comuna': usuario.comuna or '',
                'rol': usuario.rol or '',
                'rut': usuario.rut or '',
                'fecha_nacimiento': usuario.fecha_nacimiento.isoformat() if usuario.fecha_nacimiento else None,
                'hora_voluntariado': usuario.hora_voluntariado if usuario.hora_voluntariado else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Eliminar cuenta de usuario
@app.route("/api/usuarios/<int:user_id>", methods=["DELETE"])
def eliminar_usuario(user_id):
    try:
        data = request.json or {}
        confirmar_eliminacion = data.get('confirmar', False)
        
        if not confirmar_eliminacion:
            return jsonify({
                'success': False,
                'error': 'Se requiere confirmación para eliminar la cuenta'
            }), 400
        
        # Buscar el usuario
        usuario = Usuario.query.get(user_id)
        
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404
        
        # Obtener todas las postulaciones del usuario
        postulaciones = Postulacion.query.filter_by(usuario_id=user_id).all()
        
        # Verificar si el usuario es administrador de una organización
        organizacion = Organizacion.query.filter_by(id_usuario_org=user_id).first()
        
        if organizacion:
            # Si tiene una organización, eliminar también las oportunidades y postulaciones asociadas
            oportunidades = Oportunidad.query.filter_by(organizacion_id=organizacion.id).all()
            
            for oportunidad in oportunidades:
                # Eliminar postulaciones de cada oportunidad
                postulaciones_oportunidad = Postulacion.query.filter_by(oportunidad_id=oportunidad.id).all()
                for post in postulaciones_oportunidad:
                    db.session.delete(post)
                # Eliminar la oportunidad
                db.session.delete(oportunidad)
            
            # Eliminar la organización
            db.session.delete(organizacion)
        
        # Eliminar todas las postulaciones del usuario
        for postulacion in postulaciones:
            db.session.delete(postulacion)
        
        # Eliminar el usuario
        db.session.delete(usuario)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Cuenta eliminada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error al eliminar usuario: {error_trace}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Obtener organización por usuario admin
@app.route("/api/organizaciones/usuario/<int:usuario_id>", methods=["GET"])
def obtener_organizacion_por_usuario(usuario_id):
    try:
        organizacion = Organizacion.query.filter_by(id_usuario_org=usuario_id).first()
        
        if not organizacion:
            return jsonify({
                'success': False,
                'error': 'No se encontró una organización asociada a este usuario'
            }), 404
        
        # Procesar certificaciones (puede ser una lista JSON o None)
        certificaciones = organizacion.certificacion if organizacion.certificacion else []
        if isinstance(certificaciones, str):
            try:
                import json
                certificaciones = json.loads(certificaciones)
            except:
                certificaciones = []
        
        return jsonify({
            'success': True,
            'organizacion': {
                'id': organizacion.id,
                'nombre': organizacion.nombre,
                'rut': organizacion.rut or '',
                'email_contacto': organizacion.email_contacto,
                'telefono_contacto': organizacion.telefono_contacto,
                'region': organizacion.region,
                'comuna': organizacion.comuna,
                'descripcion': organizacion.descripcion or '',
                'id_usuario_org': organizacion.id_usuario_org,
                'certificacion': certificaciones,
                'created_at': organizacion.created_at.strftime('%Y-%m-%d %H:%M:%S') if organizacion.created_at else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Obtener organización por ID
@app.route("/api/organizaciones/<int:organizacion_id>", methods=["GET"])
def obtener_organizacion(organizacion_id):
    try:
        organizacion = Organizacion.query.get(organizacion_id)
        
        if not organizacion:
            return jsonify({
                'success': False,
                'error': 'Organización no encontrada'
            }), 404
        
        # Procesar certificaciones (puede ser una lista JSON o None)
        certificaciones = organizacion.certificacion if organizacion.certificacion else []
        if isinstance(certificaciones, str):
            try:
                import json
                certificaciones = json.loads(certificaciones)
            except:
                certificaciones = []
        
        return jsonify({
            'success': True,
            'organizacion': {
                'id': organizacion.id,
                'nombre': organizacion.nombre,
                'rut': organizacion.rut or '',
                'email_contacto': organizacion.email_contacto,
                'telefono_contacto': organizacion.telefono_contacto,
                'region': organizacion.region,
                'comuna': organizacion.comuna,
                'descripcion': organizacion.descripcion or '',
                'id_usuario_org': organizacion.id_usuario_org,
                'certificacion': certificaciones,
                'created_at': organizacion.created_at.strftime('%Y-%m-%d %H:%M:%S') if organizacion.created_at else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Actualizar información de la organización
@app.route("/api/organizaciones/<int:organizacion_id>", methods=["PUT"])
def actualizar_organizacion(organizacion_id):
    try:
        data = request.json
        
        # Buscar la organización
        organizacion = Organizacion.query.get(organizacion_id)
        
        if not organizacion:
            return jsonify({
                'success': False,
                'error': 'Organización no encontrada'
            }), 404
        
        # Verificar que el usuario que hace la solicitud es el administrador
        id_usuario_org = data.get('id_usuario_org')
        if id_usuario_org and organizacion.id_usuario_org != id_usuario_org:
            return jsonify({
                'success': False,
                'error': 'No tienes permisos para actualizar esta organización'
            }), 403
        
        # Actualizar campos (solo los que se proporcionen)
        if 'nombre' in data:
            organizacion.nombre = data.get('nombre')
        if 'rut' in data:
            rut = data.get('rut', '').strip().upper().replace('.', '').replace('-', '')
            # Verificar que el RUT no esté en uso por otra organización
            if rut:
                otra_org = Organizacion.query.filter_by(rut=rut).first()
                if otra_org and otra_org.id != organizacion_id:
                    return jsonify({
                        'success': False,
                        'error': 'El RUT ya está registrado por otra organización'
                    }), 400
            organizacion.rut = rut if rut else None
        if 'email_contacto' in data:
            email = data.get('email_contacto')
            # Verificar que el email no esté en uso por otra organización
            otra_org = Organizacion.query.filter_by(email_contacto=email).first()
            if otra_org and otra_org.id != organizacion_id:
                return jsonify({
                    'success': False,
                    'error': 'El correo electrónico ya está registrado por otra organización'
                }), 400
            organizacion.email_contacto = email
        if 'telefono_contacto' in data:
            organizacion.telefono_contacto = data.get('telefono_contacto')
        if 'region' in data:
            organizacion.region = data.get('region')
        if 'comuna' in data:
            organizacion.comuna = data.get('comuna')
        if 'descripcion' in data:
            organizacion.descripcion = data.get('descripcion')
        if 'certificacion' in data:
            # Actualizar certificaciones
            certificaciones = data.get('certificacion')
            print(f"Recibidas certificaciones para actualizar: {certificaciones}")
            print(f"Tipo de certificaciones recibidas: {type(certificaciones)}")
            
            if isinstance(certificaciones, list):
                organizacion.certificacion = certificaciones
                print(f"Certificaciones guardadas como lista: {organizacion.certificacion}")
            elif isinstance(certificaciones, str):
                try:
                    import json
                    organizacion.certificacion = json.loads(certificaciones)
                    print(f"Certificaciones parseadas desde string: {organizacion.certificacion}")
                except Exception as e:
                    print(f"Error al parsear certificaciones: {e}")
                    organizacion.certificacion = []
            else:
                print(f"Tipo de certificaciones no reconocido, estableciendo lista vacía")
                organizacion.certificacion = []
        
        db.session.commit()
        print(f"Certificaciones después del commit: {organizacion.certificacion}")
        
        # Procesar certificaciones para la respuesta
        certificaciones_respuesta = organizacion.certificacion if organizacion.certificacion else []
        if isinstance(certificaciones_respuesta, str):
            try:
                import json
                certificaciones_respuesta = json.loads(certificaciones_respuesta)
            except:
                certificaciones_respuesta = []
        
        return jsonify({
            'success': True,
            'message': 'Información de la organización actualizada exitosamente',
            'organizacion': {
                'id': organizacion.id,
                'nombre': organizacion.nombre,
                'rut': organizacion.rut or '',
                'email_contacto': organizacion.email_contacto,
                'telefono_contacto': organizacion.telefono_contacto,
                'region': organizacion.region,
                'comuna': organizacion.comuna,
                'descripcion': organizacion.descripcion or '',
                'certificacion': certificaciones_respuesta
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para subir archivo de certificación de organización
@app.route("/api/organizaciones/<int:organizacion_id>/certificacion/upload", methods=["POST"])
def subir_certificacion_organizacion(organizacion_id):
    try:
        # Verificar que se envió un archivo
        if 'archivo' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No se proporcionó ningún archivo'
            }), 400
        
        file = request.files['archivo']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No se seleccionó ningún archivo'
            }), 400
        
        # Verificar que la organización existe
        organizacion = Organizacion.query.get(organizacion_id)
        if not organizacion:
            return jsonify({
                'success': False,
                'error': 'Organización no encontrada'
            }), 404
        
        # Verificar permisos
        id_usuario_org = request.form.get('id_usuario_org')
        if id_usuario_org and organizacion.id_usuario_org != int(id_usuario_org):
            return jsonify({
                'success': False,
                'error': 'No tienes permisos para subir certificaciones a esta organización'
            }), 403
        
        # Validar tipo de archivo
        allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({
                'success': False,
                'error': f'Tipo de archivo no permitido. Formatos permitidos: {", ".join(allowed_extensions)}'
            }), 400
        
        # Validar tamaño (máximo 10MB)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            return jsonify({
                'success': False,
                'error': 'El archivo es demasiado grande. Tamaño máximo: 10MB'
            }), 400
        
        # Crear directorio de certificaciones de organizaciones si no existe
        certificaciones_dir = os.path.join(os.getcwd(), 'certificaciones_organizaciones')
        if not os.path.exists(certificaciones_dir):
            os.makedirs(certificaciones_dir)
        
        # Generar nombre único para el archivo
        from werkzeug.utils import secure_filename
        filename = f"cert_org_{organizacion_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_ext}"
        filename = secure_filename(filename)
        filepath = os.path.join(certificaciones_dir, filename)
        
        # Guardar el archivo
        file.save(filepath)
        
        # Retornar la ruta relativa para almacenar en la base de datos
        ruta_relativa = f"certificaciones_organizaciones/{filename}"
        
        return jsonify({
            'success': True,
            'message': 'Archivo subido exitosamente',
            'ruta': ruta_relativa,
            'filename': filename
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error al subir certificación: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para descargar archivo de certificación
@app.route("/api/organizaciones/certificacion/<path:filename>", methods=["GET"])
def descargar_certificacion_organizacion(filename):
    try:
        filepath = os.path.join(os.getcwd(), 'certificaciones_organizaciones', filename)
        if os.path.exists(filepath):
            return send_file(filepath, as_attachment=True)
        else:
            return jsonify({
                'success': False,
                'error': 'Archivo no encontrado'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para registrar una organización
@app.route("/api/organizacion/registrar", methods=["POST"])
def registrar_organizacion():
    try:
        data = request.json
        
        nombre = data.get('nombre')
        rut = data.get('rut', '').strip().upper().replace('.', '').replace('-', '') if data.get('rut') else ''
        fecha_creacion_str = data.get('fecha_creacion')
        region = data.get('region')
        ciudad = data.get('ciudad')
        comuna = data.get('comuna')
        descripcion = data.get('descripcion')
        sitio_web = data.get('sitio_web')
        redes_sociales = data.get('redes_sociales')
        id_usuario_org = data.get('id_usuario_org')
        
        # Validaciones de campos obligatorios
        if not nombre or not fecha_creacion_str or not region or not ciudad or not comuna or not descripcion:
            return jsonify({
                'success': False,
                'error': 'Los campos obligatorios son: nombre, fecha de fundación, región, ciudad, comuna y descripción'
            }), 400
        
        # Convertir fecha de creación de string a Date
        fecha_creacion = None
        if fecha_creacion_str:
            try:
                fecha_creacion = datetime.strptime(fecha_creacion_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Formato de fecha inválido. Use el formato YYYY-MM-DD'
                }), 400
        
        if not id_usuario_org:
            return jsonify({
                'success': False,
                'error': 'ID de usuario organizador es requerido'
            }), 400
        
        # Verificar que el usuario existe
        usuario = Usuario.query.get(id_usuario_org)
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404
        
        # Usar el email del usuario como email_contacto si no se proporciona
        email_contacto = usuario.email
        
        # Verificar si el RUT ya está registrado (si se proporciona)
        if rut:
            organizacion_existente = Organizacion.query.filter_by(rut=rut).first()
            if organizacion_existente:
                return jsonify({
                    'success': False,
                    'error': 'El RUT ya está registrado'
                }), 400
        
        # Procesar redes sociales: mantener como lista o convertir a lista
        redes_sociales_data = None
        if redes_sociales:
            if isinstance(redes_sociales, list):
                redes_sociales_data = redes_sociales
            elif isinstance(redes_sociales, str):
                # Si es string, convertir a lista
                redes_sociales_data = [linea.strip() for linea in redes_sociales.split('\n') if linea.strip()]
            else:
                redes_sociales_data = [str(redes_sociales)]
        
        # Crear nueva organización
        nueva_organizacion = Organizacion(
            nombre=nombre,
            rut=rut if rut else None,
            email_contacto=email_contacto,
            telefono_contacto=None,  # Ya no es obligatorio
            fecha_creacion=fecha_creacion,
            region=region,
            ciudad=ciudad,
            comuna=comuna,
            descripcion=descripcion,
            sitio_web=sitio_web if sitio_web else None,
            redes_sociales=redes_sociales_data if redes_sociales_data else [],
            id_usuario_org=id_usuario_org,
            created_at=datetime.now()
        )
        
        db.session.add(nueva_organizacion)
        
        # Actualizar el rol del usuario a 'organizacion' si no es admin
        if usuario.rol != 'admin':
            usuario.rol = 'organizacion'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Organización registrada exitosamente',
            'organizacion': {
                'id': nueva_organizacion.id,
                'nombre': nueva_organizacion.nombre,
                'email_contacto': nueva_organizacion.email_contacto,
                'region': nueva_organizacion.region,
                'ciudad': nueva_organizacion.ciudad,
                'comuna': nueva_organizacion.comuna,
                'sitio_web': nueva_organizacion.sitio_web
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# ENDPOINTS PARA OPORTUNIDADES
# ============================================

# Listar todas las oportunidades (con filtros opcionales)
@app.route("/api/oportunidades", methods=["GET"])
def listar_oportunidades():
    try:
        estado = request.args.get('estado')  # activa, cerrada, todas, o None para todas
        region = request.args.get('region')
        area_voluntariado = request.args.get('area') or request.args.get('tipo_de_voluntariado')  # Filtro por área de voluntariado
        organizacion_id_str = request.args.get('organizacion_id')
        print(f"📥 Parámetros recibidos - estado: '{estado}', region: '{region}', area_voluntariado: '{area_voluntariado}', organizacion_id: '{organizacion_id_str}'")
        organizacion_id = None
        if organizacion_id_str:
            try:
                organizacion_id = int(organizacion_id_str)
                print(f"✅ organizacion_id convertido a int: {organizacion_id}")
            except (ValueError, TypeError) as e:
                print(f"❌ Error: organizacion_id '{organizacion_id_str}' no es un entero válido: {e}")
                organizacion_id = None
        else:
            print(f"⚠️ No se recibió parámetro organizacion_id")
        
        # Si se especifica organizacion_id, usar consulta directa simple (más confiable)
        if organizacion_id:
            print(f"🔍 Buscando oportunidades para organizacion_id = {organizacion_id} (tipo: {type(organizacion_id)})")
            
            # PRIMERO: Verificar todas las oportunidades en la BD sin filtro
            todas_oportunidades = Oportunidad.query.all()
            print(f"📊 Total de oportunidades en BD (sin filtro): {len(todas_oportunidades)}")
            for op in todas_oportunidades:
                print(f"  - ID: {op.id}, Título: {op.titulo}, Organizacion_id: {op.organizacion_id} (tipo: {type(op.organizacion_id)})")
            
            # SEGUNDO: Hacer la consulta con el filtro
            print(f"🔍 Ejecutando consulta: Oportunidad.query.filter(Oportunidad.organizacion_id == {organizacion_id})")
            oportunidades = Oportunidad.query.filter(Oportunidad.organizacion_id == organizacion_id).all()
            print(f"✅ Oportunidades encontradas con filtro: {len(oportunidades)}")
            
            # TERCERO: Si no encuentra nada, intentar con diferentes tipos de comparación
            if len(oportunidades) == 0:
                print(f"⚠️ No se encontraron resultados. Intentando con filter_by...")
                oportunidades = Oportunidad.query.filter_by(organizacion_id=organizacion_id).all()
                print(f"✅ Oportunidades encontradas con filter_by: {len(oportunidades)}")
                
                # Si aún no encuentra nada, verificar si hay un problema de tipo
                if len(oportunidades) == 0:
                    print(f"⚠️ Aún no se encontraron resultados. Verificando tipos...")
                    # Intentar con string también
                    oportunidades_str = Oportunidad.query.filter(Oportunidad.organizacion_id == str(organizacion_id)).all()
                    print(f"✅ Intentando con string '{str(organizacion_id)}': {len(oportunidades_str)}")
                    if len(oportunidades_str) > 0:
                        oportunidades = oportunidades_str
            
            # Si se especifica estado y NO es 'todas', filtrar después en Python
            # IMPORTANTE: Si NO se especifica estado, devolver TODAS las oportunidades de la organización
            if estado and estado != 'todas' and estado != 'all':
                print(f"🔍 Aplicando filtro de estado: {estado}")
                oportunidades_antes = len(oportunidades)
                oportunidades = [op for op in oportunidades if op.estado == estado]
                print(f"✅ Oportunidades después del filtro de estado: {len(oportunidades)} (de {oportunidades_antes})")
            else:
                # Si no se especifica estado o es 'todas', devolver TODAS las oportunidades de la organización
                print(f"🔍 No se aplicará filtro de estado, devolviendo TODAS las oportunidades de la organización")
            
            # Mostrar detalles de las oportunidades encontradas
            if oportunidades:
                for op in oportunidades:
                    print(f"  ✓ ID: {op.id}, Título: {op.titulo}, Estado: '{op.estado}', Organizacion_id: {op.organizacion_id}")
            else:
                # Verificar todas las oportunidades en la BD para debug
                todas_sin_filtro = Oportunidad.query.all()
                print(f"  ⚠️ No se encontraron oportunidades. Total en BD: {len(todas_sin_filtro)}")
                for op in todas_sin_filtro:
                    print(f"    - ID: {op.id}, Título: {op.titulo}, Organizacion_id: {op.organizacion_id} (tipo: {type(op.organizacion_id)})")
        else:
            # Si no hay organizacion_id, usar query normal
            print(f"🔍 No hay organizacion_id, buscando todas las oportunidades")
            print(f"📥 Parámetro estado recibido: '{estado}'")
            
            # PRIMERO: Verificar todas las oportunidades en la BD sin filtro
            todas_oportunidades = Oportunidad.query.all()
            print(f"📊 Total de oportunidades en BD (sin filtro): {len(todas_oportunidades)}")
            for op in todas_oportunidades:
                print(f"  - ID: {op.id}, Título: {op.titulo}, Estado: '{op.estado}', Organizacion_id: {op.organizacion_id}")
            
            query = Oportunidad.query
            
            # Aplicar filtro de estado
            # Por defecto, SIEMPRE mostrar solo activas a menos que se especifique 'todas' o 'all'
            if estado and estado not in ['todas', 'all']:
                print(f"🔍 Aplicando filtro de estado: '{estado}'")
                query = query.filter_by(estado=estado)
            elif estado in ['todas', 'all']:
                print(f"🔍 Estado es 'todas' o 'all', no aplicando filtro de estado")
            else:
                # Por defecto, mostrar solo activas si no se especifica estado
                print(f"🔍 No se especificó estado, usando filtro por defecto: 'activa'")
                query = query.filter_by(estado='activa')
            
            # Si se especifica region, usar region_opor de la tabla oportunidades
            if region and region.strip():
                region_clean = region.strip()
                print(f"🔍 Aplicando filtro de región: '{region_clean}'")
                # Usar coincidencia exacta o que contenga el valor completo
                query = query.filter(
                    Oportunidad.region_opor.ilike(f'%{region_clean}%')
                )
                print(f"✅ Query después del filtro de región: {query}")
                print(f"📋 Buscando region_opor que contenga: '{region_clean}'")
            
            # Si se especifica area_voluntariado, filtrar por área (solo si la columna existe)
            if area_voluntariado and area_voluntariado.strip():
                area_voluntariado_clean = area_voluntariado.strip()
                print(f"🔍 Aplicando filtro de tipo de voluntariado: '{area_voluntariado_clean}'")
                try:
                    # Verificar si la columna existe antes de usarla
                    from sqlalchemy import inspect
                    inspector = inspect(Oportunidad)
                    column_names = [col.name for col in inspector.columns]
                    
                    # Intentar con tipo_de_voluntariado primero (nombre real en BD), luego area_voluntariado
                    if 'tipo_de_voluntariado' in column_names:
                        # Usar coincidencia parcial (ilike ya es case-insensitive)
                        query = query.filter(Oportunidad.tipo_de_voluntariado.ilike(f'%{area_voluntariado_clean}%'))
                        print(f"✅ Query después del filtro de tipo de voluntariado: {query}")
                        print(f"📋 Buscando tipo_de_voluntariado que contenga: '{area_voluntariado_clean}'")
                    elif 'area_voluntariado' in column_names:
                        query = query.filter(Oportunidad.area_voluntariado.ilike(f'%{area_voluntariado_clean}%'))
                        print(f"✅ Query después del filtro de área: {query}")
                        print(f"📋 Buscando area_voluntariado que contenga: '{area_voluntariado_clean}'")
                    else:
                        print(f"⚠️ La columna tipo_de_voluntariado/area_voluntariado no existe en la BD, ignorando filtro")
                except Exception as e:
                    # Si hay algún error, ignorar el filtro
                    print(f"⚠️ Error al aplicar filtro de área: {e}, ignorando filtro")
                    pass
            
            try:
                oportunidades = query.all()
                print(f"✅ Oportunidades encontradas después de aplicar filtros SQL: {len(oportunidades)}")
                
                # Filtrar adicionalmente en Python para asegurar que cumplan los criterios
                oportunidades_filtradas = []
                for op in oportunidades:
                    # Verificar estado (debe ser 'activa' si no se especifica otro)
                    op_estado = getattr(op, 'estado', None) or 'activa'
                    if estado and estado not in ['todas', 'all']:
                        if op_estado.lower() != estado.lower():
                            print(f"  ❌ Oportunidad {op.id} descartada: estado '{op_estado}' != '{estado}'")
                            continue
                    elif estado in ['todas', 'all']:
                        # Si se especifica 'todas' o 'all', mostrar todas sin filtrar por estado
                        pass
                    else:
                        # Por defecto, solo mostrar activas
                        if op_estado.lower() != 'activa':
                            print(f"  ❌ Oportunidad {op.id} descartada: estado '{op_estado}' != 'activa' (por defecto)")
                            continue
                    
                    # Verificar región si se especificó (OBLIGATORIO si se especifica)
                    if region and region.strip():
                        op_region = getattr(op, 'region_opor', None)
                        if not op_region or not op_region.strip():
                            print(f"  ❌ Oportunidad {op.id} descartada: region_opor está vacío (filtro requiere: '{region}')")
                            continue
                        
                        op_region_lower = op_region.lower().strip()
                        region_lower = region.strip().lower()
                        
                        # Verificar coincidencia exacta o parcial (más estricto)
                        if region_lower not in op_region_lower:
                            print(f"  ❌ Oportunidad {op.id} descartada: region_opor '{op_region}' no contiene '{region}'")
                            continue
                        print(f"  ✓ Oportunidad {op.id} región OK: '{op_region}' contiene '{region}'")
                    
                    # Verificar tipo de voluntariado si se especificó (OBLIGATORIO si se especifica)
                    if area_voluntariado and area_voluntariado.strip():
                        op_tipo = getattr(op, 'tipo_de_voluntariado', None) or getattr(op, 'area_voluntariado', None)
                        if not op_tipo or not op_tipo.strip():
                            print(f"  ❌ Oportunidad {op.id} descartada: tipo_de_voluntariado está vacío (filtro requiere: '{area_voluntariado}')")
                            continue
                        
                        op_tipo_lower = op_tipo.lower().strip()
                        area_lower = area_voluntariado.strip().lower()
                        
                        # Verificar coincidencia parcial (más flexible)
                        # Comparar tanto si el filtro está contenido en el valor como si el valor está contenido en el filtro
                        if area_lower not in op_tipo_lower and op_tipo_lower not in area_lower:
                            print(f"  ❌ Oportunidad {op.id} descartada: tipo_de_voluntariado '{op_tipo}' no coincide con '{area_voluntariado}'")
                            print(f"     Comparación: '{op_tipo_lower}' vs '{area_lower}'")
                            continue
                        print(f"  ✓ Oportunidad {op.id} tipo OK: '{op_tipo}' coincide con '{area_voluntariado}'")
                    
                    oportunidades_filtradas.append(op)
                    print(f"  ✅ Oportunidad {op.id} cumple todos los filtros")
                
                oportunidades = oportunidades_filtradas
                print(f"✅ Oportunidades después de filtrado en Python: {len(oportunidades)}")
                
                # Debug: mostrar los valores de region_opor y tipo_de_voluntariado de las oportunidades encontradas
                if oportunidades:
                    print(f"📊 Valores de las oportunidades encontradas:")
                    for op in oportunidades[:5]:  # Mostrar solo las primeras 5
                        region_val = getattr(op, 'region_opor', None) or 'N/A'
                        tipo_val = getattr(op, 'tipo_de_voluntariado', None) or getattr(op, 'area_voluntariado', None) or 'N/A'
                        estado_val = getattr(op, 'estado', None) or 'N/A'
                        print(f"  - ID {op.id}: estado='{estado_val}', region_opor='{region_val}', tipo_de_voluntariado='{tipo_val}'")
                else:
                    print(f"⚠️ No se encontraron oportunidades con los filtros aplicados")
                    estado_filtro = estado if estado else 'activa'
                    print(f"🔍 Filtros aplicados: estado='{estado_filtro}', region='{region}', tipo_de_voluntariado='{area_voluntariado}'")
            except Exception as e:
                print(f"❌ Error al ejecutar query: {e}")
                import traceback
                print(traceback.format_exc())
                # Si hay error, intentar sin filtro de tipo de voluntariado
                if area_voluntariado:
                    print(f"🔄 Reintentando sin filtro de tipo de voluntariado...")
                    query = Oportunidad.query
                    if estado and estado != 'todas' and estado != 'all':
                        query = query.filter_by(estado=estado)
                    elif not estado:
                        query = query.filter_by(estado='activa')
                    if region:
                        query = query.filter(Oportunidad.region_opor.ilike(f'%{region}%'))
                    oportunidades = query.all()
                else:
                    raise
            print(f"✅ Oportunidades encontradas (sin filtro de organización): {len(oportunidades)}")
            
            # Si se aplicaron filtros y no hay resultados, NO mostrar todas las oportunidades
            # Solo mostrar todas si NO se aplicaron filtros
            filtros_aplicados = (region and region.strip()) or (area_voluntariado and area_voluntariado.strip()) or (estado and estado not in ['todas', 'all'])
            if len(oportunidades) == 0 and len(todas_oportunidades) > 0:
                if filtros_aplicados:
                    print(f"⚠️ La query con filtro no encontró resultados, pero hay {len(todas_oportunidades)} oportunidades en BD")
                    print(f"🔍 Filtros aplicados: region='{region}', area_voluntariado='{area_voluntariado}', estado='{estado}'")
                    print(f"❌ No se mostrarán todas las oportunidades porque se aplicaron filtros")
                    # Mantener lista vacía si se aplicaron filtros
                    oportunidades = []
                else:
                    print(f"⚠️ No se encontraron resultados sin filtros, mostrando todas las oportunidades")
                    oportunidades = todas_oportunidades
        
        resultado = []
        for op in oportunidades:
            try:
                organizacion = Organizacion.query.get(op.organizacion_id)
                # Contar postulaciones de forma segura (sin cargar el modelo completo para evitar errores de columnas)
                try:
                    num_postulaciones = db.session.query(func.count(Postulacion.id)).filter(Postulacion.oportunidad_id == op.id).scalar() or 0
                except Exception as count_error:
                    print(f"⚠️ Error al contar postulaciones para oportunidad {op.id}: {count_error}")
                    num_postulaciones = 0
                
                # Formatear fecha límite de forma segura
                fecha_limite_str = None
                if op.fecha_limite_postulacion:
                    try:
                        fecha_limite_str = op.fecha_limite_postulacion.strftime('%Y-%m-%d')
                    except Exception as date_error:
                        print(f"Error al formatear fecha_limite_postulacion: {date_error}")
                        fecha_limite_str = None
                
                # Formatear created_at de forma segura
                created_at_str = None
                if op.created_at:
                    try:
                        created_at_str = op.created_at.strftime('%Y-%m-%d %H:%M:%S')
                    except Exception as date_error:
                        print(f"Error al formatear created_at: {date_error}")
                        created_at_str = None
                
                # Obtener tipo_de_voluntariado de forma segura usando getattr (intentar ambos nombres)
                tipo_voluntariado_val = getattr(op, 'tipo_de_voluntariado', None) or getattr(op, 'area_voluntariado', None) or ''
                area_voluntariado_val = tipo_voluntariado_val  # Mantener compatibilidad
                
                # Obtener ciudad de organizacion de forma segura usando getattr
                organizacion_ciudad_val = getattr(organizacion, 'ciudad', None) or '' if organizacion else ''
                
                resultado.append({
                    'id': op.id,
                    'titulo': op.titulo if op.titulo else '',
                    'descripcion': op.descripcion if op.descripcion else '',
                    'organizacion_id': op.organizacion_id,
                    'organizacion_nombre': organizacion.nombre if organizacion and organizacion.nombre else '',
                    'organizacion_region': organizacion.region if organizacion and organizacion.region else '',
                    'organizacion_ciudad': organizacion_ciudad_val,
                    'organizacion_comuna': organizacion.comuna if organizacion and organizacion.comuna else '',
                    'region_opor': op.region_opor if op.region_opor else '',
                    'ciudad_opor': op.ciudad_opor if op.ciudad_opor else '',
                    'comuna_opor': op.comuna_opor if op.comuna_opor else '',
                    'meta_postulantes': op.meta_postulantes,
                    'cupo_maximo': op.cupo_maximo,
                    'fecha_limite_postulacion': fecha_limite_str,
                    'estado': op.estado if op.estado is not None else 'activa',
                    'num_postulaciones': num_postulaciones,
                    'created_at': created_at_str,
                    'responsable_nombre': op.responsable_nombre if op.responsable_nombre else '',
                    'responsable_apellido': op.responsable_apellido if op.responsable_apellido else '',
                    'responsable_email': op.responsable_email if op.responsable_email else '',
                    'responsable_email_institucional': op.responsable_email_institucional if op.responsable_email_institucional else '',
                    'responsable_telefono': op.responsable_telefono if op.responsable_telefono else '',
                    'area_voluntariado': area_voluntariado_val or '',
                    'tipo_de_voluntariado': tipo_voluntariado_val or ''
                })
            except Exception as op_error:
                print(f"Error al procesar oportunidad ID {op.id}: {op_error}")
                import traceback
                print(traceback.format_exc())
                # Continuar con la siguiente oportunidad en lugar de fallar completamente
                continue
        
        return jsonify({
            'success': True,
            'oportunidades': resultado
        }), 200
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error en listar_oportunidades: {str(e)}")
        print(error_trace)
        return jsonify({
            'success': False,
            'error': str(e),
            'details': error_trace if app.debug else None
        }), 500

# Obtener una oportunidad por ID
@app.route("/api/oportunidades/<int:oportunidad_id>", methods=["GET"])
def obtener_oportunidad(oportunidad_id):
    try:
        oportunidad = Oportunidad.query.get(oportunidad_id)
        
        if not oportunidad:
            return jsonify({
                'success': False,
                'error': 'Oportunidad no encontrada'
            }), 404
        
        organizacion = Organizacion.query.get(oportunidad.organizacion_id)
        num_postulaciones = Postulacion.query.filter_by(oportunidad_id=oportunidad.id).count()
        
        return jsonify({
            'success': True,
            'oportunidad': {
                'id': oportunidad.id,
                'titulo': oportunidad.titulo,
                'descripcion': oportunidad.descripcion,
                'organizacion_id': oportunidad.organizacion_id,
                'organizacion_nombre': organizacion.nombre if organizacion else '',
                'organizacion_region': organizacion.region if organizacion else '',
                'organizacion_comuna': organizacion.comuna if organizacion else '',
                'organizacion_email': organizacion.email_contacto if organizacion else '',
                'meta_postulantes': oportunidad.meta_postulantes,
                'cupo_maximo': oportunidad.cupo_maximo,
                'fecha_limite_postulacion': oportunidad.fecha_limite_postulacion.strftime('%Y-%m-%d') if oportunidad.fecha_limite_postulacion else None,
                'estado': oportunidad.estado,
                'num_postulaciones': num_postulaciones,
                'created_at': oportunidad.created_at.strftime('%Y-%m-%d %H:%M:%S') if oportunidad.created_at else None,
                'region_opor': oportunidad.region_opor if oportunidad.region_opor else '',
                'ciudad_opor': oportunidad.ciudad_opor if oportunidad.ciudad_opor else '',
                'comuna_opor': oportunidad.comuna_opor if oportunidad.comuna_opor else '',
                'tipo_de_voluntariado': getattr(oportunidad, 'tipo_de_voluntariado', None) or getattr(oportunidad, 'area_voluntariado', None) or '',
                'area_voluntariado': getattr(oportunidad, 'tipo_de_voluntariado', None) or getattr(oportunidad, 'area_voluntariado', None) or ''
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Crear una nueva oportunidad
@app.route("/api/oportunidades", methods=["POST"])
def crear_oportunidad():
    try:
        data = request.json
        
        organizacion_id = data.get('organizacion_id')
        titulo = data.get('titulo')
        descripcion = data.get('descripcion')
        meta_postulantes = data.get('meta_postulantes')
        cupo_maximo = data.get('cupo_maximo')
        fecha_limite_str = data.get('fecha_limite_postulacion')
        
        # Campos del responsable
        responsable_nombre = data.get('responsable_nombre')
        responsable_apellido = data.get('responsable_apellido')
        responsable_email = data.get('responsable_email')
        responsable_email_institucional = data.get('responsable_email_institucional')
        responsable_telefono = data.get('responsable_telefono')
        
        # Campos de ubicación
        region_opor = data.get('region_opor')
        ciudad_opor = data.get('ciudad_opor')
        comuna_opor = data.get('comuna_opor')
        
        # Campo de área de voluntariado
        area_voluntariado = data.get('area_voluntariado') or data.get('tipo_de_voluntariado')
        
        if not organizacion_id or not titulo or not descripcion:
            return jsonify({
                'success': False,
                'error': 'Organización, título y descripción son requeridos'
            }), 400
        
        # Verificar que la organización existe
        organizacion = Organizacion.query.get(organizacion_id)
        if not organizacion:
            return jsonify({
                'success': False,
                'error': 'Organización no encontrada'
            }), 404
        
        # Convertir fecha
        fecha_limite = None
        if fecha_limite_str:
            try:
                fecha_limite = datetime.strptime(fecha_limite_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Formato de fecha inválido (debe ser YYYY-MM-DD)'
                }), 400
        
        # Validar tipos de datos
        try:
            organizacion_id = int(organizacion_id)
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'ID de organización inválido'
            }), 400
        
        # Crear la oportunidad
        nueva_oportunidad = Oportunidad(
            organizacion_id=organizacion_id,
            titulo=titulo.strip(),
            descripcion=descripcion.strip(),
            meta_postulantes=int(meta_postulantes) if meta_postulantes else None,
            cupo_maximo=int(cupo_maximo) if cupo_maximo else None,
            fecha_limite_postulacion=fecha_limite,
            estado='activa',
            responsable_nombre=responsable_nombre.strip() if responsable_nombre else None,
            responsable_apellido=responsable_apellido.strip() if responsable_apellido else None,
            responsable_email=responsable_email.strip() if responsable_email else None,
            responsable_email_institucional=responsable_email_institucional.strip() if responsable_email_institucional else None,
            responsable_telefono=responsable_telefono.strip() if responsable_telefono else None,
            region_opor=region_opor.strip() if region_opor else None,
            ciudad_opor=ciudad_opor.strip() if ciudad_opor else None,
            comuna_opor=comuna_opor.strip() if comuna_opor else None,
            tipo_de_voluntariado=area_voluntariado.strip() if area_voluntariado else None,
            created_at=datetime.now()
        )
        
        try:
            db.session.add(nueva_oportunidad)
            db.session.flush()  # Para obtener el ID sin hacer commit
            
            # Verificar que se creó correctamente
            oportunidad_id = nueva_oportunidad.id
            print(f"Oportunidad creada con ID: {oportunidad_id}")
            
            db.session.commit()
            print(f"Commit exitoso para oportunidad ID: {oportunidad_id}")
            
            # Verificar que se guardó correctamente
            oportunidad_guardada = Oportunidad.query.get(oportunidad_id)
            if not oportunidad_guardada:
                raise Exception('La oportunidad no se guardó correctamente en la base de datos')
            
            return jsonify({
                'success': True,
                'message': 'Oportunidad creada exitosamente',
                'oportunidad': {
                    'id': nueva_oportunidad.id,
                    'titulo': nueva_oportunidad.titulo,
                    'estado': nueva_oportunidad.estado,
                    'organizacion_id': nueva_oportunidad.organizacion_id
                }
            }), 201
            
        except Exception as db_error:
            db.session.rollback()
            error_msg = str(db_error)
            print(f"ERROR al guardar en BD: {error_msg}")
            print(f"Datos recibidos: organizacion_id={organizacion_id} (tipo: {type(organizacion_id)}), titulo={titulo[:50]}, descripcion={descripcion[:50]}...")
            import traceback
            print(traceback.format_exc())
            return jsonify({
                'success': False,
                'error': f'Error al guardar en la base de datos: {error_msg}'
            }), 500
        
    except Exception as e:
        db.session.rollback()
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error completo: {error_trace}")
        return jsonify({
            'success': False,
            'error': str(e),
            'details': error_trace if app.debug else None
        }), 500

# Actualizar estado de una oportunidad
@app.route("/api/oportunidades/<int:oportunidad_id>/estado", methods=["PUT"])
def actualizar_estado_oportunidad(oportunidad_id):
    try:
        data = request.json
        nuevo_estado = data.get('estado')
        
        if not nuevo_estado:
            return jsonify({
                'success': False,
                'error': 'El nuevo estado es requerido'
            }), 400
        
        estados_validos = ['activa', 'cerrada', 'abierta']
        
        if nuevo_estado not in estados_validos:
            return jsonify({
                'success': False,
                'error': f'Estado inválido. Debe ser uno de: {", ".join(estados_validos)}'
            }), 400
        
        oportunidad = Oportunidad.query.get(oportunidad_id)
        
        if not oportunidad:
            return jsonify({
                'success': False,
                'error': 'Oportunidad no encontrada'
            }), 404
        
        oportunidad.estado = nuevo_estado
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Estado actualizado a {nuevo_estado} exitosamente',
            'oportunidad': {
                'id': oportunidad.id,
                'estado': oportunidad.estado
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Actualizar una oportunidad
@app.route("/api/oportunidades/<int:oportunidad_id>", methods=["PUT"])
def actualizar_oportunidad(oportunidad_id):
    try:
        oportunidad = Oportunidad.query.get(oportunidad_id)
        
        if not oportunidad:
            return jsonify({
                'success': False,
                'error': 'Oportunidad no encontrada'
            }), 404
        
        data = request.get_json()
        
        # Actualizar campos permitidos
        if 'titulo' in data:
            oportunidad.titulo = data['titulo'].strip() if data['titulo'] else oportunidad.titulo
        if 'descripcion' in data:
            oportunidad.descripcion = data['descripcion'].strip() if data['descripcion'] else oportunidad.descripcion
        if 'meta_postulantes' in data:
            oportunidad.meta_postulantes = int(data['meta_postulantes']) if data['meta_postulantes'] else None
        if 'cupo_maximo' in data:
            oportunidad.cupo_maximo = int(data['cupo_maximo']) if data['cupo_maximo'] else None
        if 'fecha_limite_postulacion' in data:
            if data['fecha_limite_postulacion']:
                try:
                    oportunidad.fecha_limite_postulacion = datetime.strptime(data['fecha_limite_postulacion'], '%Y-%m-%d').date()
                except ValueError:
                    pass
            else:
                oportunidad.fecha_limite_postulacion = None
        if 'region_opor' in data:
            oportunidad.region_opor = data['region_opor'].strip() if data['region_opor'] else None
        if 'ciudad_opor' in data:
            oportunidad.ciudad_opor = data['ciudad_opor'].strip() if data['ciudad_opor'] else None
        if 'comuna_opor' in data:
            oportunidad.comuna_opor = data['comuna_opor'].strip() if data['comuna_opor'] else None
        if 'tipo_de_voluntariado' in data or 'area_voluntariado' in data:
            tipo_val = data.get('tipo_de_voluntariado') or data.get('area_voluntariado')
            if tipo_val:
                oportunidad.tipo_de_voluntariado = tipo_val.strip()
            else:
                oportunidad.tipo_de_voluntariado = None
        
        # Actualizar información del responsable
        if 'responsable_nombre' in data:
            oportunidad.responsable_nombre = data['responsable_nombre'].strip() if data['responsable_nombre'] else None
        if 'responsable_apellido' in data:
            oportunidad.responsable_apellido = data['responsable_apellido'].strip() if data['responsable_apellido'] else None
        if 'responsable_email' in data:
            oportunidad.responsable_email = data['responsable_email'].strip() if data['responsable_email'] else None
        if 'responsable_email_institucional' in data:
            oportunidad.responsable_email_institucional = data['responsable_email_institucional'].strip() if data['responsable_email_institucional'] else None
        if 'responsable_telefono' in data:
            oportunidad.responsable_telefono = data['responsable_telefono'].strip() if data['responsable_telefono'] else None
        
        db.session.commit()
        
        # Obtener datos actualizados para la respuesta
        organizacion = Organizacion.query.get(oportunidad.organizacion_id)
        num_postulaciones = Postulacion.query.filter_by(oportunidad_id=oportunidad.id).count()
        tipo_voluntariado_val = getattr(oportunidad, 'tipo_de_voluntariado', None) or ''
        
        return jsonify({
            'success': True,
            'message': 'Oportunidad actualizada exitosamente',
            'oportunidad': {
                'id': oportunidad.id,
                'titulo': oportunidad.titulo,
                'descripcion': oportunidad.descripcion,
                'organizacion_id': oportunidad.organizacion_id,
                'organizacion_nombre': organizacion.nombre if organizacion else '',
                'meta_postulantes': oportunidad.meta_postulantes,
                'cupo_maximo': oportunidad.cupo_maximo,
                'fecha_limite_postulacion': oportunidad.fecha_limite_postulacion.strftime('%Y-%m-%d') if oportunidad.fecha_limite_postulacion else None,
                'estado': oportunidad.estado,
                'num_postulaciones': num_postulaciones,
                'region_opor': oportunidad.region_opor if oportunidad.region_opor else '',
                'ciudad_opor': oportunidad.ciudad_opor if oportunidad.ciudad_opor else '',
                'comuna_opor': oportunidad.comuna_opor if oportunidad.comuna_opor else '',
                'tipo_de_voluntariado': tipo_voluntariado_val,
                'area_voluntariado': tipo_voluntariado_val
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error al actualizar oportunidad: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Cerrar una oportunidad (mantener para compatibilidad)
@app.route("/api/oportunidades/<int:oportunidad_id>/cerrar", methods=["PUT"])
def cerrar_oportunidad(oportunidad_id):
    try:
        oportunidad = Oportunidad.query.get(oportunidad_id)
        
        if not oportunidad:
            return jsonify({
                'success': False,
                'error': 'Oportunidad no encontrada'
            }), 404
        
        oportunidad.estado = 'cerrada'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Oportunidad cerrada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# ENDPOINTS PARA NOTICIAS
# ============================================

# Listar todas las noticias
@app.route("/api/noticias", methods=["GET"])
def listar_noticias():
    try:
        estado = request.args.get('estado')  # activa, inactiva, todas
        noticias = Noticia.query
        
        if estado and estado not in ['todas', 'all']:
            noticias = noticias.filter_by(estado=estado)
        elif not estado:
            # Por defecto, mostrar solo activas
            noticias = noticias.filter_by(estado='activa')
        
        noticias = noticias.order_by(Noticia.created_at.desc()).all()
        
        resultado = []
        for noticia in noticias:
            autor = Usuario.query.get(noticia.autor_id) if noticia.autor_id else None
            resultado.append({
                'id': noticia.id,
                'titulo': noticia.titulo,
                'contenido': noticia.contenido,
                'resumen': noticia.resumen or '',
                'autor_id': noticia.autor_id,
                'autor_nombre': f"{autor.nombre} {autor.apellido}".strip() if autor else 'Administrador',
                'estado': noticia.estado,
                'imagen_url': noticia.imagen_noticia if noticia.imagen_noticia else '',  # Solo el nombre del archivo (filename)
                'imagen_filename': noticia.imagen_noticia if noticia.imagen_noticia else '',  # Solo el nombre del archivo (filename)
                'fecha_publicacion': noticia.fecha_publicacion.strftime('%Y-%m-%d %H:%M:%S') if noticia.fecha_publicacion else None,
                'created_at': noticia.created_at.strftime('%Y-%m-%d %H:%M:%S') if noticia.created_at else None,
                'updated_at': noticia.updated_at.strftime('%Y-%m-%d %H:%M:%S') if noticia.updated_at else None
            })
        
        return jsonify({
            'success': True,
            'noticias': resultado
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error en listar_noticias: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Obtener una noticia por ID
@app.route("/api/noticias/<int:noticia_id>", methods=["GET"])
def obtener_noticia(noticia_id):
    try:
        noticia = Noticia.query.get(noticia_id)
        
        if not noticia:
            return jsonify({
                'success': False,
                'error': 'Noticia no encontrada'
            }), 404
        
        autor = Usuario.query.get(noticia.autor_id) if noticia.autor_id else None
        
        return jsonify({
            'success': True,
            'noticia': {
                'id': noticia.id,
                'titulo': noticia.titulo,
                'contenido': noticia.contenido,
                'resumen': noticia.resumen or '',
                'autor_id': noticia.autor_id,
                'autor_nombre': f"{autor.nombre} {autor.apellido}".strip() if autor else 'Administrador',
                'estado': noticia.estado,
                'imagen_url': noticia.imagen_noticia if noticia.imagen_noticia else '',  # Solo el nombre del archivo (filename)
                'imagen_filename': noticia.imagen_noticia if noticia.imagen_noticia else '',  # Solo el nombre del archivo (filename)
                'fecha_publicacion': noticia.fecha_publicacion.strftime('%Y-%m-%d %H:%M:%S') if noticia.fecha_publicacion else None,
                'created_at': noticia.created_at.strftime('%Y-%m-%d %H:%M:%S') if noticia.created_at else None,
                'updated_at': noticia.updated_at.strftime('%Y-%m-%d %H:%M:%S') if noticia.updated_at else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Subir imagen de noticia
@app.route("/api/noticias/upload-imagen", methods=["POST"])
def subir_imagen_noticia():
    try:
        # Verificar que se envió un archivo
        if 'imagen' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No se proporcionó ningún archivo'
            }), 400
        
        file = request.files['imagen']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No se seleccionó ningún archivo'
            }), 400
        
        # Validar tipo de archivo (solo imágenes)
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({
                'success': False,
                'error': f'Tipo de archivo no permitido. Formatos permitidos: {", ".join(allowed_extensions)}'
            }), 400
        
        # Validar tamaño (máximo 5MB para imágenes)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        max_size = 5 * 1024 * 1024  # 5MB
        if file_size > max_size:
            return jsonify({
                'success': False,
                'error': 'El archivo es demasiado grande. Tamaño máximo: 5MB'
            }), 400
        
        # Crear directorio de imágenes de noticias si no existe
        imagenes_dir = os.path.join(os.getcwd(), 'imagenes_noticias')
        if not os.path.exists(imagenes_dir):
            os.makedirs(imagenes_dir)
        
        # Generar nombre único para el archivo
        from werkzeug.utils import secure_filename
        filename = f"noticia_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(4).hex()}{file_ext}"
        filename = secure_filename(filename)
        filepath = os.path.join(imagenes_dir, filename)
        
        # Guardar el archivo
        file.save(filepath)
        
        # Retornar solo el filename para almacenar en la base de datos
        # La ruta siempre será imagenes_noticias/ pero solo guardamos el filename
        
        return jsonify({
            'success': True,
            'message': 'Imagen subida exitosamente',
            'filename': filename,  # Solo el nombre del archivo
            'ruta': f"imagenes_noticias/{filename}"  # Ruta completa solo para referencia
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error al subir imagen de noticia: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para servir imágenes de noticias
@app.route("/api/noticias/imagen/<path:filename>", methods=["GET"])
def obtener_imagen_noticia(filename):
    try:
        filepath = os.path.join(os.getcwd(), 'imagenes_noticias', filename)
        if os.path.exists(filepath):
            return send_file(filepath, as_attachment=False)
        else:
            return jsonify({
                'success': False,
                'error': 'Imagen no encontrada'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Crear una nueva noticia
@app.route("/api/noticias", methods=["POST"])
def crear_noticia():
    try:
        data = request.get_json()
        
        titulo = data.get('titulo')
        contenido = data.get('contenido')
        resumen = data.get('resumen', '')
        autor_id = data.get('autor_id')
        estado = data.get('estado', 'activa')
        # El campo imagen_url viene como el filename del archivo subido (NO es una URL)
        imagen_filename = data.get('imagen_url', '').strip() if data.get('imagen_url') else None
        fecha_publicacion_str = data.get('fecha_publicacion')
        
        if not titulo or not contenido:
            return jsonify({
                'success': False,
                'error': 'Título y contenido son requeridos'
            }), 400
        
        # Si viene con ruta, extraer solo el filename (por compatibilidad)
        if imagen_filename:
            if '/' in imagen_filename:
                imagen_filename = imagen_filename.split('/')[-1]
            elif '\\' in imagen_filename:
                imagen_filename = imagen_filename.split('\\')[-1]
        
        fecha_publicacion = None
        if fecha_publicacion_str:
            try:
                fecha_publicacion = datetime.strptime(fecha_publicacion_str, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                try:
                    fecha_publicacion = datetime.strptime(fecha_publicacion_str, '%Y-%m-%d')
                except ValueError:
                    pass
        
        nueva_noticia = Noticia(
            titulo=titulo.strip(),
            contenido=contenido.strip(),
            resumen=resumen.strip() if resumen else None,
            autor_id=int(autor_id) if autor_id else None,
            estado=estado,
            imagen_noticia=imagen_filename,  # Guardar solo el filename
            fecha_publicacion=fecha_publicacion or datetime.now(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.session.add(nueva_noticia)
        db.session.commit()
        
        autor = Usuario.query.get(nueva_noticia.autor_id) if nueva_noticia.autor_id else None
        
        return jsonify({
            'success': True,
            'message': 'Noticia creada exitosamente',
            'noticia': {
                'id': nueva_noticia.id,
                'titulo': nueva_noticia.titulo,
                'contenido': nueva_noticia.contenido,
                'resumen': nueva_noticia.resumen or '',
                'autor_id': nueva_noticia.autor_id,
                'autor_nombre': f"{autor.nombre} {autor.apellido}".strip() if autor else 'Administrador',
                'estado': nueva_noticia.estado,
                'imagen_url': nueva_noticia.imagen_noticia if nueva_noticia.imagen_noticia else '',  # Solo el filename del archivo
                'imagen_filename': nueva_noticia.imagen_noticia if nueva_noticia.imagen_noticia else '',  # Solo el filename del archivo
                'fecha_publicacion': nueva_noticia.fecha_publicacion.strftime('%Y-%m-%d %H:%M:%S') if nueva_noticia.fecha_publicacion else None,
                'created_at': nueva_noticia.created_at.strftime('%Y-%m-%d %H:%M:%S') if nueva_noticia.created_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error en crear_noticia: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Actualizar una noticia
@app.route("/api/noticias/<int:noticia_id>", methods=["PUT"])
def actualizar_noticia(noticia_id):
    try:
        print(f"DEBUG: Iniciando actualización de noticia ID: {noticia_id}")
        noticia = Noticia.query.get(noticia_id)
        
        if not noticia:
            print(f"DEBUG: Noticia {noticia_id} no encontrada")
            return jsonify({
                'success': False,
                'error': 'Noticia no encontrada'
            }), 404
        
        data = request.get_json()
        print(f"DEBUG: Datos recibidos: {data}")
        
        # Actualizar campos permitidos
        if 'titulo' in data:
            noticia.titulo = data['titulo'].strip() if data['titulo'] else noticia.titulo
        if 'contenido' in data:
            noticia.contenido = data['contenido'].strip() if data['contenido'] else noticia.contenido
        if 'resumen' in data:
            noticia.resumen = data['resumen'].strip() if data['resumen'] else None
        if 'estado' in data:
            noticia.estado = data['estado']
        if 'imagen_url' in data:
            # imagen_url es el filename del archivo, NO una URL externa
            imagen_filename = data['imagen_url']
            print(f"DEBUG: Recibido filename de imagen: '{imagen_filename}' (tipo: {type(imagen_filename)})")
            
            # Si es string vacío, eliminar la imagen
            if imagen_filename == '':
                print("DEBUG: Eliminando imagen (string vacío)")
                # Eliminar el archivo físico si existe
                if noticia.imagen_noticia:
                    try:
                        import os
                        filepath = os.path.join(os.getcwd(), 'imagenes_noticias', noticia.imagen_noticia)
                        if os.path.exists(filepath):
                            os.remove(filepath)
                            print(f"DEBUG: Archivo eliminado: {filepath}")
                    except Exception as e:
                        print(f"Error al eliminar archivo de imagen: {str(e)}")
                noticia.imagen_noticia = None
            elif imagen_filename:
                # Limpiar el filename - extraer solo el nombre si viene con ruta
                filename_clean = imagen_filename.strip()
                if '/' in filename_clean:
                    filename_clean = filename_clean.split('/')[-1]
                elif '\\' in filename_clean:
                    filename_clean = filename_clean.split('\\')[-1]
                
                if filename_clean:
                    noticia.imagen_noticia = filename_clean
                    print(f"DEBUG: Filename guardado: '{filename_clean}'")
                else:
                    print("DEBUG: Filename vacío después de limpiar")
                    noticia.imagen_noticia = None
            else:
                print("DEBUG: imagen_filename es None o falsy")
                noticia.imagen_noticia = None
        else:
            print("DEBUG: imagen_url no está en data, manteniendo valor existente")
        
        print(f"DEBUG: noticia.imagen_noticia después de procesar: '{noticia.imagen_noticia}'")
        if 'fecha_publicacion' in data:
            if data['fecha_publicacion']:
                try:
                    noticia.fecha_publicacion = datetime.strptime(data['fecha_publicacion'], '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    try:
                        noticia.fecha_publicacion = datetime.strptime(data['fecha_publicacion'], '%Y-%m-%d')
                    except ValueError:
                        pass
            else:
                noticia.fecha_publicacion = None
        
        noticia.updated_at = datetime.now()
        
        print(f"DEBUG: Antes del commit - imagen_noticia: '{noticia.imagen_noticia}'")
        try:
            db.session.commit()
            print("DEBUG: Commit exitoso")
        except Exception as commit_error:
            print(f"DEBUG: Error en commit: {str(commit_error)}")
            import traceback
            print(traceback.format_exc())
            db.session.rollback()
            raise commit_error
        
        autor = Usuario.query.get(noticia.autor_id) if noticia.autor_id else None
        
        return jsonify({
            'success': True,
            'message': 'Noticia actualizada exitosamente',
            'noticia': {
                'id': noticia.id,
                'titulo': noticia.titulo,
                'contenido': noticia.contenido,
                'resumen': noticia.resumen or '',
                'autor_id': noticia.autor_id,
                'autor_nombre': f"{autor.nombre} {autor.apellido}".strip() if autor else 'Administrador',
                'estado': noticia.estado,
                'imagen_url': noticia.imagen_noticia if noticia.imagen_noticia else '',  # Solo el nombre del archivo (filename)
                'imagen_filename': noticia.imagen_noticia if noticia.imagen_noticia else '',  # Solo el nombre del archivo (filename)
                'fecha_publicacion': noticia.fecha_publicacion.strftime('%Y-%m-%d %H:%M:%S') if noticia.fecha_publicacion else None,
                'created_at': noticia.created_at.strftime('%Y-%m-%d %H:%M:%S') if noticia.created_at else None,
                'updated_at': noticia.updated_at.strftime('%Y-%m-%d %H:%M:%S') if noticia.updated_at else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error en actualizar_noticia: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Eliminar una noticia
@app.route("/api/noticias/<int:noticia_id>", methods=["DELETE"])
def eliminar_noticia(noticia_id):
    try:
        noticia = Noticia.query.get(noticia_id)
        
        if not noticia:
            return jsonify({
                'success': False,
                'error': 'Noticia no encontrada'
            }), 404
        
        db.session.delete(noticia)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Noticia eliminada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error en eliminar_noticia: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Eliminar una oportunidad (voluntariado)
@app.route("/api/oportunidades/<int:oportunidad_id>", methods=["DELETE"])
def eliminar_oportunidad(oportunidad_id):
    try:
        data = request.json or {}
        organizacion_id = data.get('organizacion_id')
        es_admin = data.get('es_admin', False)  # Permitir que admin elimine sin verificación
        
        # Buscar la oportunidad
        oportunidad = Oportunidad.query.get(oportunidad_id)
        
        if not oportunidad:
            return jsonify({
                'success': False,
                'error': 'Oportunidad no encontrada'
            }), 404
        
        # Si es admin, permitir eliminar sin verificación de organizacion_id
        # Si no es admin, verificar organizacion_id
        if not es_admin:
            # Verificar que se proporcionó el organizacion_id
            if not organizacion_id:
                return jsonify({
                'success': False,
                'error': 'ID de organización es requerido para eliminar la oportunidad'
            }), 400
        
        # Verificar que la organización es la propietaria de la oportunidad
        if oportunidad.organizacion_id != organizacion_id:
            return jsonify({
                'success': False,
                'error': 'No tienes permisos para eliminar esta oportunidad'
            }), 403
        
        # Obtener todas las postulaciones asociadas
        postulaciones = Postulacion.query.filter_by(oportunidad_id=oportunidad_id).all()
        num_postulaciones = len(postulaciones)
        
        # Eliminar todas las postulaciones asociadas
        for postulacion in postulaciones:
            db.session.delete(postulacion)
        
        # Eliminar la oportunidad
        db.session.delete(oportunidad)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Oportunidad eliminada exitosamente. Se eliminaron {num_postulaciones} postulación(es) asociada(s).',
            'oportunidad_eliminada': {
                'id': oportunidad_id,
                'titulo': oportunidad.titulo,
                'postulaciones_eliminadas': num_postulaciones
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error al eliminar oportunidad: {error_trace}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================
# FUNCIONES DE EMAIL
# ============================================

def enviar_email_cambio_estado(postulacion, nuevo_estado, motivo_no_seleccion=None, motivo_no_seleccion_otro=None):
    """
    Envía un email al usuario cuando cambia el estado de su postulación.
    """
    try:
        # Obtener información del usuario y la oportunidad
        usuario = Usuario.query.get(postulacion.usuario_id)
        oportunidad = Oportunidad.query.get(postulacion.oportunidad_id)
        
        if not usuario or not oportunidad:
            print(f"No se pudo obtener información del usuario u oportunidad para la postulación {postulacion.id}")
            return
        
        # Obtener información de la organización
        organizacion = Organizacion.query.get(oportunidad.organizacion_id)
        organizacion_nombre = organizacion.nombre if organizacion else 'la organización'
        
        # Verificar que el usuario tenga email
        if not usuario.email:
            print(f"Usuario {usuario.id} no tiene email configurado")
            return
        
        # Determinar el asunto y el color del header según el estado
        estado_info = {
            'Seleccionado': {
                'asunto': '🎉 ¡Felicidades! Has sido seleccionado',
                'color': '#10b981',  # Verde
                'icono': '🎉',
                'mensaje_principal': '¡Felicidades! Has sido seleccionado para participar en esta oportunidad de voluntariado.'
            },
            'No seleccionado': {
                'asunto': 'Actualización de tu postulación',
                'color': '#ef4444',  # Rojo
                'icono': 'ℹ️',
                'mensaje_principal': 'Lamentamos informarte que no fuiste seleccionado para esta oportunidad.'
            },
            'Pre-seleccionado': {
                'asunto': '¡Buenas noticias! Has sido pre-seleccionado',
                'color': '#3b82f6',  # Azul
                'icono': '✨',
                'mensaje_principal': '¡Buenas noticias! Has sido pre-seleccionado para esta oportunidad.'
            },
            'Etapa de entrevista': {
                'asunto': 'Siguiente paso: Etapa de entrevista',
                'color': '#8b5cf6',  # Morado
                'icono': '💼',
                'mensaje_principal': 'Has avanzado a la etapa de entrevista. La organización se pondrá en contacto contigo pronto.'
            },
            'En lista de espera': {
                'asunto': 'Actualización: Estás en lista de espera',
                'color': '#f59e0b',  # Naranja
                'icono': '⏳',
                'mensaje_principal': 'Tu postulación está en lista de espera. Te notificaremos si hay disponibilidad.'
            },
            'Pendiente de revisión': {
                'asunto': 'Actualización de tu postulación',
                'color': '#eab308',  # Amarillo
                'icono': '📋',
                'mensaje_principal': 'El estado de tu postulación ha sido actualizado a: Pendiente de revisión.'
            }
        }
        
        info = estado_info.get(nuevo_estado, {
            'asunto': 'Actualización de tu postulación',
            'color': '#6b7280',
            'icono': 'ℹ️',
            'mensaje_principal': f'El estado de tu postulación ha sido actualizado a: {nuevo_estado}.'
        })
        
        # Construir mensaje adicional según el estado
        mensaje_adicional = ''
        if nuevo_estado == 'No seleccionado' and motivo_no_seleccion:
            mensaje_adicional = f'<p><strong>Motivo:</strong> {motivo_no_seleccion}</p>'
            if motivo_no_seleccion_otro:
                mensaje_adicional += f'<p><strong>Detalle:</strong> {motivo_no_seleccion_otro}</p>'
        elif nuevo_estado == 'Seleccionado':
            # Generar enlace de confirmación
            from flask import request
            base_url = request.host_url.rstrip('/') if hasattr(request, 'host_url') else 'http://127.0.0.1:5000'
            confirmacion_url = f"{base_url}/api/postulaciones/{postulacion.id}/confirmar"
            mensaje_adicional = f'''
                <p>La organización se pondrá en contacto contigo próximamente con más detalles sobre tu participación.</p>
                <p><strong>Por favor, confirma tu participación haciendo clic en el siguiente enlace:</strong></p>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="{confirmacion_url}" class="button" style="background-color: {info['color']}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Confirmar Participación
                    </a>
                </p>
                <p><small>O copia y pega este enlace en tu navegador: {confirmacion_url}</small></p>
            '''
        elif nuevo_estado == 'Etapa de entrevista':
            mensaje_adicional = '<p>Prepárate para la entrevista y mantén tu información de contacto actualizada.</p>'
        
        # Crear el mensaje
        msg = Message(
            subject=info['asunto'],
            recipients=[usuario.email],
            html=f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }}
                    .header {{
                        background-color: {info['color']};
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }}
                    .content {{
                        background-color: white;
                        padding: 30px;
                        border-radius: 0 0 5px 5px;
                    }}
                    .button {{
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: {info['color']};
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 20px;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 20px;
                        color: #666;
                        font-size: 12px;
                    }}
                    .estado-badge {{
                        display: inline-block;
                        padding: 8px 16px;
                        background-color: {info['color']}20;
                        color: {info['color']};
                        border-radius: 20px;
                        font-weight: 600;
                        margin: 10px 0;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>{info['icono']} {info['asunto'].replace('🎉 ', '').replace('✨ ', '').replace('💼 ', '').replace('⏳ ', '').replace('📋 ', '').replace('ℹ️ ', '')}</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>{usuario.nombre or 'Usuario'}</strong>,</p>
                        
                        <p>{info['mensaje_principal']}</p>
                        
                        <div class="estado-badge">
                            Estado: {nuevo_estado}
                        </div>
                        
                        <h3>Detalles de tu postulación:</h3>
                        <ul>
                            <li><strong>Oportunidad:</strong> {oportunidad.titulo}</li>
                            <li><strong>Organización:</strong> {organizacion_nombre}</li>
                            <li><strong>Nuevo estado:</strong> {nuevo_estado}</li>
                        </ul>
                        
                        {mensaje_adicional}
                        
                        <p>Puedes revisar el estado de todas tus postulaciones en tu perfil de usuario.</p>
                        
                        <p>Saludos cordiales,<br>
                        <strong>Equipo INJUV</strong></p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        )
        
        # Enviar el email
        mail.send(msg)
        print(f"Email de cambio de estado enviado a {usuario.email} (Estado: {nuevo_estado})")
        
    except Exception as e:
        print(f"Error al enviar email de cambio de estado: {str(e)}")
        raise

def enviar_email_confirmacion_postulacion(usuario, oportunidad):
    """
    Envía un email de confirmación al usuario cuando realiza una postulación exitosa.
    """
    try:
        # Obtener información de la organización
        organizacion = Organizacion.query.get(oportunidad.organizacion_id)
        organizacion_nombre = organizacion.nombre if organizacion else 'la organización'
        
        # Verificar que el usuario tenga email
        if not usuario.email:
            print(f"Usuario {usuario.id} no tiene email configurado")
            return
        
        # Crear el mensaje
        msg = Message(
            subject='✅ Postulación Exitosa - INJUV',
            recipients=[usuario.email],
            html=f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }}
                    .header {{
                        background-color: #0052CC;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }}
                    .content {{
                        background-color: white;
                        padding: 30px;
                        border-radius: 0 0 5px 5px;
                    }}
                    .button {{
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #0052CC;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 20px;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 20px;
                        color: #666;
                        font-size: 12px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 ¡Postulación Exitosa!</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>{usuario.nombre or 'Usuario'}</strong>,</p>
                        
                        <p>Te confirmamos que tu postulación ha sido recibida exitosamente.</p>
                        
                        <h3>Detalles de tu postulación:</h3>
                        <ul>
                            <li><strong>Oportunidad:</strong> {oportunidad.titulo}</li>
                            <li><strong>Organización:</strong> {organizacion_nombre}</li>
                            <li><strong>Estado:</strong> Pendiente de revisión</li>
                        </ul>
                        
                        <p>La organización revisará tu postulación y te notificará sobre el estado de tu aplicación.</p>
                        
                        <p>Puedes revisar el estado de tus postulaciones en tu perfil de usuario.</p>
                        
                        <p>¡Gracias por tu interés en participar como voluntario!</p>
                        
                        <p>Saludos cordiales,<br>
                        <strong>Equipo INJUV</strong></p>
                    </div>
                    <div class="footer">
                        <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        )
        
        # Enviar el email
        mail.send(msg)
        print(f"Email de confirmación enviado a {usuario.email}")
        
    except Exception as e:
        print(f"Error al enviar email de confirmación: {str(e)}")
        raise

# ============================================
# ENDPOINTS PARA POSTULACIONES
# ============================================

# Crear una nueva postulación
@app.route("/api/postulaciones", methods=["POST"])
def crear_postulacion():
    try:
        data = request.json
        print(f"📥 Datos recibidos para postulación: {data}")
        
        usuario_id = data.get('usuario_id')
        oportunidad_id = data.get('oportunidad_id')
        
        print(f"🔍 usuario_id: {usuario_id} (tipo: {type(usuario_id)})")
        print(f"🔍 oportunidad_id: {oportunidad_id} (tipo: {type(oportunidad_id)})")
        
        if not usuario_id or not oportunidad_id:
            error_msg = f'Usuario y oportunidad son requeridos. Recibido: usuario_id={usuario_id}, oportunidad_id={oportunidad_id}'
            print(f"❌ {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        # Verificar que el usuario existe
        usuario = Usuario.query.get(usuario_id)
        print(f"👤 Usuario encontrado: {usuario is not None}")
        if not usuario:
            error_msg = f'Usuario no encontrado (ID: {usuario_id})'
            print(f"❌ {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg
            }), 404
        
        # Verificar que la oportunidad existe y está activa
        oportunidad = Oportunidad.query.get(oportunidad_id)
        print(f"🎯 Oportunidad encontrada: {oportunidad is not None}")
        if not oportunidad:
            error_msg = f'Oportunidad no encontrada (ID: {oportunidad_id})'
            print(f"❌ {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg
            }), 404
        
        print(f"📊 Estado de la oportunidad: '{oportunidad.estado}'")
        # Verificar que la oportunidad esté disponible (activa o abierta)
        if oportunidad.estado not in ['activa', 'abierta']:
            error_msg = f'La oportunidad no está disponible para postulaciones (estado: {oportunidad.estado})'
            print(f"❌ {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        # Verificar fecha límite
        fecha_limite = oportunidad.fecha_limite_postulacion
        fecha_actual = datetime.now().date()
        print(f"📅 Fecha límite: {fecha_limite}, Fecha actual: {fecha_actual}")
        if fecha_limite and fecha_limite < fecha_actual:
            error_msg = f'La fecha límite de postulación ha expirado (fecha límite: {fecha_limite})'
            print(f"❌ {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        # Verificar si ya postuló
        postulacion_existente = Postulacion.query.filter_by(
            usuario_id=usuario_id,
            oportunidad_id=oportunidad_id
        ).first()
        print(f"🔍 Postulación existente: {postulacion_existente is not None}")
        if postulacion_existente:
            error_msg = 'Ya has postulado a esta oportunidad'
            print(f"❌ {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        # Verificar si se alcanzó la meta de postulantes
        num_postulaciones = Postulacion.query.filter_by(oportunidad_id=oportunidad_id).count()
        meta_postulantes = oportunidad.meta_postulantes
        print(f"📈 Postulaciones actuales: {num_postulaciones}, Meta: {meta_postulantes}")
        if meta_postulantes and num_postulaciones >= meta_postulantes:
            # Cerrar automáticamente la oportunidad
            oportunidad.estado = 'cerrada'
            db.session.commit()
            error_msg = f'Se alcanzó el límite de postulaciones para esta oportunidad ({num_postulaciones}/{meta_postulantes})'
            print(f"❌ {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        print("✅ Todas las validaciones pasaron, creando postulación...")
        
        # Crear postulación
        nueva_postulacion = Postulacion(
            usuario_id=usuario_id,
            oportunidad_id=oportunidad_id,
            estado='Pendiente de revisión',
            estado_confirmacion='Pendiente',
            asistencia_capacitacion='No aplica',
            asistencia_actividad='No aplica',
            tiene_certificado=False,
            resena_org_publica=False,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.session.add(nueva_postulacion)
        db.session.commit()
        
        # Enviar email de confirmación al usuario
        try:
            enviar_email_confirmacion_postulacion(usuario, oportunidad)
        except Exception as email_error:
            # No fallar la postulación si el email falla, solo loguear el error
            print(f"Error al enviar email de confirmación: {str(email_error)}")
        
        return jsonify({
            'success': True,
            'message': 'Postulación realizada exitosamente',
            'postulacion': {
                'id': nueva_postulacion.id,
                'estado': nueva_postulacion.estado,
                'oportunidad_titulo': oportunidad.titulo
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Listar postulaciones de un usuario
@app.route("/api/usuarios/<int:usuario_id>/postulaciones", methods=["GET"])
def listar_postulaciones_usuario(usuario_id):
    try:
        postulaciones = Postulacion.query.filter_by(usuario_id=usuario_id).all()
        
        resultado = []
        for post in postulaciones:
            oportunidad = Oportunidad.query.get(post.oportunidad_id)
            
            # Solo incluir postulaciones cuya oportunidad aún existe
            # Si la oportunidad fue eliminada, no se muestra en el perfil del usuario
            if not oportunidad:
                continue
            
            organizacion = Organizacion.query.get(oportunidad.organizacion_id) if oportunidad else None
            
            # Verificar si la oportunidad está cerrada
            oportunidad_cerrada = oportunidad and oportunidad.estado == 'cerrada'
            
            resultado.append({
                'id': post.id,
                'oportunidad_id': post.oportunidad_id,
                'oportunidad_titulo': oportunidad.titulo if oportunidad else '',
                'oportunidad_estado': oportunidad.estado if oportunidad else None,
                'oportunidad_cerrada': oportunidad_cerrada,
                'organizacion_id': oportunidad.organizacion_id if oportunidad else None,
                'organizacion_nombre': organizacion.nombre if organizacion else '',
                'estado': post.estado,
                'estado_confirmacion': post.estado_confirmacion,
                'motivo_no_seleccion': post.motivo_no_seleccion,
                'tiene_certificado': post.tiene_certificado,
                'ruta_certificado_pdf': post.ruta_certificado_pdf,
                'resena_org_sobre_voluntario': post.resena_org_sobre_voluntario,
                'resena_org_publica': post.resena_org_publica,
                'calificacion_org': float(getattr(post, 'calificacion_org', None)) if getattr(post, 'calificacion_org', None) is not None else None,
                'created_at': post.created_at.strftime('%Y-%m-%d %H:%M:%S') if post.created_at else None
            })
        
        return jsonify({
            'success': True,
            'postulaciones': resultado
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error en listar_postulaciones_usuario: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Listar postulaciones de una oportunidad (para la organización)
@app.route("/api/oportunidades/<int:oportunidad_id>/postulaciones", methods=["GET"])
def listar_postulaciones_oportunidad(oportunidad_id):
    try:
        estado = request.args.get('estado')  # Filtro opcional por estado
        solo_seleccionados = request.args.get('solo_seleccionados', 'false').lower() == 'true'
        
        query = Postulacion.query.filter_by(oportunidad_id=oportunidad_id)
        
        if estado:
            query = query.filter_by(estado=estado)
        
        if solo_seleccionados:
            query = query.filter_by(estado='Seleccionado')
        
        postulaciones = query.all()
        
        resultado = []
        for post in postulaciones:
            usuario = Usuario.query.get(post.usuario_id)
            
            # Calcular edad si hay fecha de nacimiento
            edad = None
            if usuario and usuario.fecha_nacimiento:
                hoy = datetime.now().date()
                edad = hoy.year - usuario.fecha_nacimiento.year
                if (hoy.month, hoy.day) < (usuario.fecha_nacimiento.month, usuario.fecha_nacimiento.day):
                    edad -= 1
            
            # Obtener horas de voluntariado del usuario
            horas_voluntariado_usuario = usuario.hora_voluntariado if usuario and usuario.hora_voluntariado else 0
            
            resultado.append({
                'id': post.id,
                'usuario_id': post.usuario_id,
                'usuario_nombre': usuario.nombre if usuario else '',
                'usuario_apellido': usuario.apellido if usuario else '',
                'usuario_nombre_completo': f"{usuario.nombre or ''} {usuario.apellido or ''}".strip() if usuario else '',
                'usuario_email': usuario.email if usuario else '',
                'usuario_telefono': usuario.telefono if usuario else '',
                'usuario_region': usuario.region if usuario else '',
                'usuario_comuna': usuario.comuna if usuario else '',
                'usuario_sexo': usuario.sexo if usuario else '',
                'usuario_rut': usuario.rut if usuario else '',
                'usuario_edad': edad,
                'estado': post.estado,
                'estado_confirmacion': post.estado_confirmacion,
                'asistencia_capacitacion': post.asistencia_capacitacion,
                'asistencia_actividad': post.asistencia_actividad,
                'tiene_certificado': post.tiene_certificado,
                'ruta_certificado_pdf': post.ruta_certificado_pdf if hasattr(post, 'ruta_certificado_pdf') else None,
                'horas_voluntariado': horas_voluntariado_usuario,  # Horas totales del usuario (se puede mejorar para horas por postulación)
                'motivo_no_seleccion': post.motivo_no_seleccion,
                'motivo_no_seleccion_otro': post.motivo_no_seleccion_otro,
                'resena_org_sobre_voluntario': post.resena_org_sobre_voluntario,
                'resena_org_publica': post.resena_org_publica,
                'calificacion_org': float(getattr(post, 'calificacion_org', None)) if getattr(post, 'calificacion_org', None) is not None else None,
                'created_at': post.created_at.strftime('%Y-%m-%d %H:%M:%S') if post.created_at else None
            })
        
        return jsonify({
            'success': True,
            'postulaciones': resultado,
            'total': len(resultado)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Actualizar estado de una postulación
@app.route("/api/postulaciones/<int:postulacion_id>/estado", methods=["PUT"])
def actualizar_estado_postulacion(postulacion_id):
    try:
        data = request.json
        
        nuevo_estado = data.get('estado')
        motivo_no_seleccion = data.get('motivo_no_seleccion')
        motivo_no_seleccion_otro = data.get('motivo_no_seleccion_otro')
        
        if not nuevo_estado:
            return jsonify({
                'success': False,
                'error': 'El nuevo estado es requerido'
            }), 400
        
        estados_validos = [
            'Pendiente de revisión',
            'No seleccionado',
            'Pre-seleccionado',
            'Etapa de entrevista',
            'En lista de espera',
            'Seleccionado'
        ]
        
        if nuevo_estado not in estados_validos:
            return jsonify({
                'success': False,
                'error': f'Estado inválido. Debe ser uno de: {", ".join(estados_validos)}'
            }), 400
        
        postulacion = Postulacion.query.get(postulacion_id)
        if not postulacion:
            return jsonify({
                'success': False,
                'error': 'Postulación no encontrada'
            }), 404
        
        postulacion.estado = nuevo_estado
        postulacion.updated_at = datetime.now()
        
        if nuevo_estado == 'No seleccionado' and motivo_no_seleccion:
            postulacion.motivo_no_seleccion = motivo_no_seleccion
            if motivo_no_seleccion_otro:
                postulacion.motivo_no_seleccion_otro = motivo_no_seleccion_otro
        
        db.session.commit()
        
        # Enviar email de notificación al usuario
        try:
            enviar_email_cambio_estado(postulacion, nuevo_estado, motivo_no_seleccion, motivo_no_seleccion_otro)
        except Exception as email_error:
            # No fallar la actualización si el email falla, solo loguear el error
            print(f"Error al enviar email de cambio de estado: {str(email_error)}")
        
        return jsonify({
            'success': True,
            'message': 'Estado actualizado exitosamente',
            'postulacion': {
                'id': postulacion.id,
                'estado': postulacion.estado
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Declinar postulación (desde el usuario)
@app.route("/api/postulaciones/<int:postulacion_id>/declinar", methods=["PUT"])
def declinar_postulacion(postulacion_id):
    try:
        postulacion = Postulacion.query.get(postulacion_id)
        
        if not postulacion:
            return jsonify({
                'success': False,
                'error': 'Postulación no encontrada'
            }), 404
        
        postulacion.estado = 'Declinada por usuario'
        postulacion.updated_at = datetime.now()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Postulación declinada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Actualizar confirmación de asistencia
@app.route("/api/postulaciones/<int:postulacion_id>/confirmacion", methods=["PUT"])
def actualizar_confirmacion(postulacion_id):
    try:
        data = request.json
        estado_confirmacion = data.get('estado_confirmacion')  # Pendiente, Confirmado, No confirmado
        
        if estado_confirmacion not in ['Pendiente', 'Confirmado', 'No confirmado']:
            return jsonify({
                'success': False,
                'error': 'Estado de confirmación inválido'
            }), 400
        
        postulacion = Postulacion.query.get(postulacion_id)
        if not postulacion:
            return jsonify({
                'success': False,
                'error': 'Postulación no encontrada'
            }), 404
        
        postulacion.estado_confirmacion = estado_confirmacion
        postulacion.updated_at = datetime.now()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Confirmación actualizada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Confirmar postulación desde enlace de correo (GET para que funcione desde el enlace del email)
@app.route("/api/postulaciones/<int:postulacion_id>/confirmar", methods=["GET", "POST"])
def confirmar_postulacion(postulacion_id):
    try:
        postulacion = Postulacion.query.get(postulacion_id)
        if not postulacion:
            # Si es GET, retornar HTML de error
            if request.method == 'GET':
                return '''
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Error - Postulación no encontrada</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #ef4444; }
                    </style>
                </head>
                <body>
                    <h1 class="error">Error</h1>
                    <p>No se encontró la postulación.</p>
                </body>
                </html>
                ''', 404
            
            return jsonify({
                'success': False,
                'error': 'Postulación no encontrada'
            }), 404
        
        # Si es GET, mostrar página de confirmación
        if request.method == 'GET':
            usuario = Usuario.query.get(postulacion.usuario_id)
            oportunidad = Oportunidad.query.get(postulacion.oportunidad_id)
            
            return f'''
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Confirmar Participación</title>
                <style>
                    body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f3f4f6; }}
                    .container {{ max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                    h1 {{ color: #10b981; }}
                    .button {{ display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }}
                    .button:hover {{ background: #059669; }}
                    .button-danger {{ background: #ef4444; }}
                    .button-danger:hover {{ background: #dc2626; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Confirmar Participación</h1>
                    <p>Hola <strong>{usuario.nombre if usuario else 'Usuario'}</strong>,</p>
                    <p>¿Deseas confirmar tu participación en la oportunidad:</p>
                    <p><strong>{oportunidad.titulo if oportunidad else 'N/A'}</strong>?</p>
                    <div>
                        <a href="/api/postulaciones/{postulacion_id}/confirmar?accion=confirmar" class="button">✓ Confirmar</a>
                        <a href="/api/postulaciones/{postulacion_id}/confirmar?accion=rechazar" class="button button-danger">✗ No Confirmar</a>
                    </div>
                </div>
            </body>
            </html>
            '''
        
        # Si es POST o tiene parámetro accion, actualizar confirmación
        accion = request.args.get('accion') or (request.json.get('accion') if request.is_json else None)
        
        if accion == 'confirmar':
            postulacion.estado_confirmacion = 'Confirmado'
            mensaje = '¡Tu participación ha sido confirmada exitosamente!'
            color = '#10b981'
        elif accion == 'rechazar':
            postulacion.estado_confirmacion = 'No confirmado'
            mensaje = 'Has rechazado la participación en esta oportunidad.'
            color = '#ef4444'
        else:
            return jsonify({
                'success': False,
                'error': 'Acción inválida. Use "confirmar" o "rechazar"'
            }), 400
        
        postulacion.updated_at = datetime.now()
        db.session.commit()
        
        # Retornar HTML de confirmación
        return f'''
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Confirmación Realizada</title>
            <style>
                body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f3f4f6; }}
                .container {{ max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                h1 {{ color: {color}; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>{mensaje}</h1>
                <p>Puedes cerrar esta ventana.</p>
            </div>
        </body>
        </html>
        ''', 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Actualizar asistencia (capacitación o actividad)
@app.route("/api/postulaciones/<int:postulacion_id>/asistencia", methods=["PUT"])
def actualizar_asistencia(postulacion_id):
    try:
        data = request.json or {}
        
        # Soporte para ambos formatos:
        # Formato nuevo: asistencia_capacitacion y asistencia_actividad directamente
        # Formato antiguo: tipo y asistencia
        asistencia_capacitacion = data.get('asistencia_capacitacion')
        asistencia_actividad = data.get('asistencia_actividad')
        tipo = data.get('tipo')  # 'capacitacion' o 'actividad' (formato antiguo)
        asistencia = data.get('asistencia')  # 'SI', 'No', 'No aplica' (formato antiguo)
        
        postulacion = Postulacion.query.get(postulacion_id)
        if not postulacion:
            return jsonify({
                'success': False,
                'error': 'Postulación no encontrada'
            }), 404
        
        # Validar valores válidos
        valores_validos = ['SI', 'No', 'No aplica', 'Sí', 'sí', 'si', 'no', 'NO', 'N/A', None]
        
        # Si se enviaron los campos directamente (formato nuevo)
        if asistencia_capacitacion is not None or asistencia_actividad is not None:
            if asistencia_capacitacion is not None:
                # Normalizar valores
                asistencia_cap = str(asistencia_capacitacion).strip()
                if asistencia_cap.upper() in ['SI', 'SÍ', 'YES', 'TRUE', '1']:
                    asistencia_cap = 'SI'
                elif asistencia_cap.upper() in ['NO', 'NOT', 'FALSE', '0']:
                    asistencia_cap = 'No'
                elif asistencia_cap.upper() in ['NO APLICA', 'N/A', 'NA', 'NONE']:
                    asistencia_cap = 'No aplica'
                
                if asistencia_cap not in ['SI', 'No', 'No aplica']:
                    return jsonify({
                        'success': False,
                        'error': f'Valor inválido para asistencia_capacitacion: {asistencia_capacitacion}. Debe ser "SI", "No" o "No aplica"'
                    }), 400
                
                postulacion.asistencia_capacitacion = asistencia_cap
            
            if asistencia_actividad is not None:
                # Normalizar valores
                asistencia_act = str(asistencia_actividad).strip()
                if asistencia_act.upper() in ['SI', 'SÍ', 'YES', 'TRUE', '1']:
                    asistencia_act = 'SI'
                elif asistencia_act.upper() in ['NO', 'NOT', 'FALSE', '0']:
                    asistencia_act = 'No'
                elif asistencia_act.upper() in ['NO APLICA', 'N/A', 'NA', 'NONE']:
                    asistencia_act = 'No aplica'
                
                if asistencia_act not in ['SI', 'No', 'No aplica']:
                    return jsonify({
                        'success': False,
                        'error': f'Valor inválido para asistencia_actividad: {asistencia_actividad}. Debe ser "SI", "No" o "No aplica"'
                    }), 400
                
                postulacion.asistencia_actividad = asistencia_act
        
        # Formato antiguo (compatibilidad hacia atrás)
        elif tipo and asistencia:
            if tipo not in ['capacitacion', 'actividad']:
                return jsonify({
                    'success': False,
                    'error': 'Tipo inválido. Debe ser "capacitacion" o "actividad"'
                }), 400
            
            # Normalizar asistencia
            asistencia_norm = str(asistencia).strip()
            if asistencia_norm.upper() in ['SI', 'SÍ', 'YES', 'TRUE', '1']:
                asistencia_norm = 'SI'
            elif asistencia_norm.upper() in ['NO', 'NOT', 'FALSE', '0']:
                asistencia_norm = 'No'
            elif asistencia_norm.upper() in ['NO APLICA', 'N/A', 'NA', 'NONE']:
                asistencia_norm = 'No aplica'
            
            if asistencia_norm not in ['SI', 'No', 'No aplica']:
                return jsonify({
                    'success': False,
                    'error': f'Valor de asistencia inválido: {asistencia}'
                }), 400
            
            if tipo == 'capacitacion':
                postulacion.asistencia_capacitacion = asistencia_norm
            else:
                postulacion.asistencia_actividad = asistencia_norm
        else:
            return jsonify({
                'success': False,
                'error': 'Se requiere enviar asistencia_capacitacion y/o asistencia_actividad, o tipo y asistencia'
            }), 400
        
        postulacion.updated_at = datetime.now()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Asistencia actualizada exitosamente',
            'asistencia_capacitacion': postulacion.asistencia_capacitacion,
            'asistencia_actividad': postulacion.asistencia_actividad
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error en actualizar_asistencia: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Generar certificado
@app.route("/api/postulaciones/<int:postulacion_id>/certificado", methods=["PUT"])
def generar_certificado(postulacion_id):
    try:
        data = request.json
        generar = data.get('generar', False)  # True para generar, False para no
        
        postulacion = Postulacion.query.get(postulacion_id)
        if not postulacion:
            return jsonify({
                'success': False,
                'error': 'Postulación no encontrada'
            }), 404
        
        if generar:
            # TODO: Generar PDF del certificado
            # ruta_certificado = generar_certificado_pdf(postulacion)
            # Por ahora, solo marcamos que tiene certificado
            postulacion.tiene_certificado = True
            postulacion.ruta_certificado_pdf = f'/certificados/certificado_{postulacion_id}.pdf'  # Placeholder
        else:
            postulacion.tiene_certificado = False
            postulacion.ruta_certificado_pdf = None
        
        postulacion.updated_at = datetime.now()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Certificado actualizado exitosamente',
            'tiene_certificado': postulacion.tiene_certificado,
            'ruta_certificado': postulacion.ruta_certificado_pdf
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Agregar reseña de organización sobre voluntario
@app.route("/api/postulaciones/<int:postulacion_id>/resena", methods=["PUT"])
def agregar_resena(postulacion_id):
    try:
        data = request.json
        resena = data.get('resena') or data.get('resena_org_sobre_voluntario')  # Aceptar ambos nombres
        es_publica = data.get('es_publica', False)
        calificacion = data.get('calificacion') or data.get('calificacion_org')  # Aceptar ambos nombres
        
        # Reseña ya no es requerida (puede ser opcional)
        
        # Validar calificación si se proporciona
        if calificacion is not None:
            try:
                calificacion_float = float(calificacion)
                if calificacion_float < 0 or calificacion_float > 5:
                    return jsonify({
                        'success': False,
                        'error': 'La calificación debe estar entre 0 y 5'
                    }), 400
            except (ValueError, TypeError):
                return jsonify({
                    'success': False,
                    'error': 'La calificación debe ser un número válido'
                }), 400
        
        postulacion = Postulacion.query.get(postulacion_id)
        if not postulacion:
            return jsonify({
                'success': False,
                'error': 'Postulación no encontrada'
            }), 404
        
        if resena is not None:
            postulacion.resena_org_sobre_voluntario = resena
        if es_publica is not None:
            postulacion.resena_org_publica = es_publica
        # Solo actualizar calificacion_org si el atributo existe en el modelo
        if hasattr(postulacion, 'calificacion_org') and calificacion is not None:
            postulacion.calificacion_org = float(calificacion) if calificacion else None
        postulacion.updated_at = datetime.now()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Reseña agregada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para enviar correo masivo a postulantes
@app.route("/api/oportunidades/<int:oportunidad_id>/correo-masivo", methods=["POST"])
def enviar_correo_masivo(oportunidad_id):
    try:
        data = request.json
        asunto = data.get('asunto')
        mensaje = data.get('mensaje')
        filtro_estado = data.get('filtro_estado', 'todos')  # 'todos' o un estado específico
        
        if not asunto or not mensaje:
            return jsonify({
                'success': False,
                'error': 'El asunto y el mensaje son requeridos'
            }), 400
        
        # Obtener la oportunidad
        oportunidad = Oportunidad.query.get(oportunidad_id)
        if not oportunidad:
            return jsonify({
                'success': False,
                'error': 'Oportunidad no encontrada'
            }), 404
        
        # Obtener postulaciones según el filtro
        query = Postulacion.query.filter_by(oportunidad_id=oportunidad_id)
        if filtro_estado != 'todos':
            query = query.filter_by(estado=filtro_estado)
        
        postulaciones = query.all()
        
        if not postulaciones:
            return jsonify({
                'success': False,
                'error': 'No hay postulantes para enviar el correo'
            }), 400
        
        # Obtener información de la organización
        organizacion = Organizacion.query.get(oportunidad.organizacion_id)
        organizacion_nombre = organizacion.nombre if organizacion else 'la organización'
        
        # Enviar correo a cada postulante
        emails_enviados = 0
        emails_fallidos = []
        
        for postulacion in postulaciones:
            usuario = Usuario.query.get(postulacion.usuario_id)
            if not usuario or not usuario.email:
                emails_fallidos.append(f"Usuario {usuario.id if usuario else postulacion.usuario_id} sin email")
                continue
            
            try:
                msg = Message(
                    subject=asunto,
                    recipients=[usuario.email],
                    html=f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }}
                            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                            .content {{ background: white; padding: 20px; border-radius: 0 0 8px 8px; }}
                            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>INJUV - Comunicación de Organización</h1>
                            </div>
                            <div class="content">
                                <p>Hola <strong>{usuario.nombre or 'Usuario'}</strong>,</p>
                                
                                <p>{mensaje.replace(chr(10), '<br>')}</p>
                                
                                <h3>Detalles:</h3>
                                <ul>
                                    <li><strong>Oportunidad:</strong> {oportunidad.titulo}</li>
                                    <li><strong>Organización:</strong> {organizacion_nombre}</li>
                                </ul>
                                
                                <p>Saludos cordiales,<br>
                                <strong>{organizacion_nombre}</strong><br>
                                <small>Equipo INJUV</small></p>
                            </div>
                            <div class="footer">
                                <p>Este es un email automático enviado por {organizacion_nombre} a través de la plataforma INJUV.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                )
                mail.send(msg)
                emails_enviados += 1
            except Exception as e:
                print(f"Error enviando email a {usuario.email}: {str(e)}")
                emails_fallidos.append(usuario.email)
        
        return jsonify({
            'success': True,
            'message': f'Correos enviados exitosamente',
            'emails_enviados': emails_enviados,
            'emails_fallidos': emails_fallidos,
            'total': len(postulaciones)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para actualizar horas de voluntariado de un usuario
@app.route("/api/usuarios/<int:usuario_id>/horas-voluntariado", methods=["PUT"])
def actualizar_horas_voluntariado(usuario_id):
    try:
        data = request.json
        horas = data.get('hora_voluntariado') or data.get('horas_voluntariado')
        
        if horas is None:
            return jsonify({
                'success': False,
                'error': 'Las horas de voluntariado son requeridas'
            }), 400
        
        try:
            horas_int = int(horas)
            if horas_int < 0:
                return jsonify({
                    'success': False,
                    'error': 'Las horas no pueden ser negativas'
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'Las horas deben ser un número entero válido'
            }), 400
        
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404
        
        usuario.hora_voluntariado = horas_int
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Horas de voluntariado actualizadas exitosamente',
            'hora_voluntariado': usuario.hora_voluntariado
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Subir certificado de voluntario
@app.route("/api/postulaciones/<int:postulacion_id>/certificado", methods=["POST"])
def subir_certificado_voluntario(postulacion_id):
    try:
        postulacion = Postulacion.query.get(postulacion_id)
        if not postulacion:
            return jsonify({
                'success': False,
                'error': 'Postulación no encontrada'
            }), 404
        
        if 'certificado' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No se proporcionó ningún archivo'
            }), 400
        
        file = request.files['certificado']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No se seleccionó ningún archivo'
            }), 400
        
        # Validar que sea PDF
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({
                'success': False,
                'error': 'El archivo debe ser un PDF'
            }), 400
        
        # Crear directorio de certificados si no existe
        import os
        certificados_dir = os.path.join(os.getcwd(), 'certificados_voluntarios')
        if not os.path.exists(certificados_dir):
            os.makedirs(certificados_dir)
        
        # Generar nombre único para el archivo
        from werkzeug.utils import secure_filename
        filename = f"certificado_{postulacion_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filename = secure_filename(filename)
        filepath = os.path.join(certificados_dir, filename)
        
        # Guardar el archivo
        file.save(filepath)
        
        # Guardar la ruta en la base de datos
        postulacion.ruta_certificado_pdf = filepath
        postulacion.tiene_certificado = True
        postulacion.updated_at = datetime.now()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Certificado subido exitosamente',
            'ruta': filepath
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error al subir certificado: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Enviar certificado por correo
@app.route("/api/postulaciones/<int:postulacion_id>/enviar-certificado", methods=["POST"])
def enviar_certificado_por_correo(postulacion_id):
    try:
        data = request.json
        email_destino = data.get('email')
        
        if not email_destino:
            return jsonify({
                'success': False,
                'error': 'El correo electrónico es requerido'
            }), 400
        
        postulacion = Postulacion.query.get(postulacion_id)
        if not postulacion:
            return jsonify({
                'success': False,
                'error': 'Postulación no encontrada'
            }), 404
        
        if not postulacion.ruta_certificado_pdf:
            return jsonify({
                'success': False,
                'error': 'No hay certificado subido para esta postulación'
            }), 400
        
        # Obtener información del usuario y la oportunidad
        usuario = Usuario.query.get(postulacion.usuario_id)
        oportunidad = Oportunidad.query.get(postulacion.oportunidad_id)
        organizacion = Organizacion.query.get(oportunidad.organizacion_id) if oportunidad else None
        
        # Leer el archivo PDF
        import os
        if not os.path.exists(postulacion.ruta_certificado_pdf):
            return jsonify({
                'success': False,
                'error': 'El archivo del certificado no existe'
            }), 404
        
        with open(postulacion.ruta_certificado_pdf, 'rb') as f:
            certificado_data = f.read()
        
        # Enviar correo con el certificado adjunto usando Flask-Mail
        try:
            msg = Message(
                subject=f'Certificado de Voluntariado - {oportunidad.titulo if oportunidad else "Voluntariado"}',
                recipients=[email_destino],
                html=f"""
                <html>
                <body>
                    <h2>Certificado de Voluntariado</h2>
                    <p>Estimado/a {usuario.nombre if usuario else 'Voluntario'},</p>
                    <p>Te enviamos adjunto tu certificado de participación en el voluntariado:</p>
                    <p><strong>{oportunidad.titulo if oportunidad else 'Voluntariado'}</strong></p>
                    <p>Organización: <strong>{organizacion.nombre if organizacion else 'Organización'}</strong></p>
                    <p>Gracias por tu participación y compromiso con el voluntariado.</p>
                    <p>Saludos cordiales,<br>Equipo INJUV</p>
                </body>
                </html>
                """
            )
            
            # Adjuntar el certificado PDF
            import os
            if os.path.exists(postulacion.ruta_certificado_pdf):
                with open(postulacion.ruta_certificado_pdf, 'rb') as f:
                    msg.attach(
                        'certificado_voluntariado.pdf',
                        'application/pdf',
                        f.read()
                    )
            
            mail.send(msg)
            
            return jsonify({
                'success': True,
                'message': f'Certificado enviado exitosamente a {email_destino}'
            }), 200
            
        except Exception as email_error:
            # Si Flask-Mail no está configurado o hay un error, retornar un mensaje informativo
            print(f"Error al enviar correo: {str(email_error)}")
            return jsonify({
                'success': False,
                'error': f'Error al enviar el correo: {str(email_error)}. Verifica la configuración de correo en el servidor.'
            }), 500
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error al enviar certificado: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Descargar certificado de voluntario
@app.route("/api/postulaciones/<int:postulacion_id>/certificado/descargar", methods=["GET"])
def descargar_certificado_voluntario(postulacion_id):
    try:
        postulacion = Postulacion.query.get(postulacion_id)
        if not postulacion:
            return jsonify({
                'success': False,
                'error': 'Postulación no encontrada'
            }), 404
        
        if not postulacion.ruta_certificado_pdf:
            return jsonify({
                'success': False,
                'error': 'No hay certificado disponible para esta postulación'
            }), 404
        
        import os
        if not os.path.exists(postulacion.ruta_certificado_pdf):
            return jsonify({
                'success': False,
                'error': 'El archivo del certificado no existe'
            }), 404
        
        from flask import send_file
        return send_file(
            postulacion.ruta_certificado_pdf,
            as_attachment=True,
            download_name=f'certificado_voluntariado_{postulacion_id}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        import traceback
        print(f"Error al descargar certificado: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== ENDPOINTS DE ADMINISTRACIÓN ====================

# Endpoint para obtener todos los usuarios con sus roles
@app.route("/api/admin/usuarios", methods=["GET"])
def obtener_usuarios_admin():
    try:
        usuarios = Usuario.query.all()
        
        usuarios_data = []
        for usuario in usuarios:
            # Obtener organización si es admin u organizacion
            organizacion = None
            if usuario.rol in ['admin', 'organizacion']:
                organizacion = Organizacion.query.filter_by(id_usuario_org=usuario.id).first()
            
            usuarios_data.append({
                'id': usuario.id,
                'nombre': usuario.nombre or '',
                'apellido': usuario.apellido or '',
                'email': usuario.email or '',
                'rut': usuario.rut or '',
                'rol': usuario.rol or 'user',
                'telefono': usuario.telefono or '',
                'region': usuario.region or '',
                'comuna': usuario.comuna or '',
                'organizacion': organizacion.nombre if organizacion else None,
                'organizacion_id': organizacion.id if organizacion else None,
                'created_at': usuario.created_at.isoformat() if usuario.created_at else None
            })
        
        return jsonify({
            'success': True,
            'usuarios': usuarios_data,
            'total': len(usuarios_data)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para generar reporte Excel de usuarios
@app.route("/api/admin/usuarios/generar-reporte", methods=["POST"])
def generar_reporte_usuarios():
    try:
        if not OPENPYXL_AVAILABLE:
            return jsonify({
                'success': False,
                'error': 'openpyxl no está instalado. Instala con: pip install openpyxl'
            }), 500
        
        data = request.json or {}
        rol_filter = data.get('rol')
        region_filter = data.get('region')
        
        # Obtener todos los usuarios
        query = Usuario.query
        if rol_filter:
            query = query.filter(Usuario.rol == rol_filter)
        if region_filter:
            query = query.filter(Usuario.region == region_filter)
        
        usuarios = query.all()
        
        # Crear workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Reporte Usuarios"
        
        # Estilos
        header_fill = PatternFill(start_color="1976D2", end_color="1976D2", fill_type="solid")
        header_font = Font(bold=True, color="FFFFFF", size=12)
        title_font = Font(bold=True, size=16)
        border_style = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )
        
        # Título
        ws['A1'] = "REPORTE DE USUARIOS REGISTRADOS"
        ws['A1'].font = title_font
        ws.merge_cells('A1:O1')
        ws['A1'].alignment = Alignment(horizontal='center', vertical='center')
        
        # Información del reporte
        row = 3
        ws[f'A{row}'] = f"Fecha de generación: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}"
        ws[f'A{row}'].font = Font(size=10, italic=True)
        row += 1
        if rol_filter:
            ws[f'A{row}'] = f"Rol filtrado: {rol_filter}"
            ws[f'A{row}'].font = Font(size=10, italic=True)
            row += 1
        if region_filter:
            ws[f'A{row}'] = f"Región filtrada: {region_filter}"
            ws[f'A{row}'].font = Font(size=10, italic=True)
            row += 1
        ws[f'A{row}'] = f"Total de usuarios: {len(usuarios)}"
        ws[f'A{row}'].font = Font(bold=True, size=11)
        row += 2
        
        # Encabezados
        headers = [
            'ID', 'Nombre', 'Apellido', 'RUT', 'Email',
            'Teléfono', 'Rol', 'Región', 'Ciudad', 'Comuna',
            'Sexo', 'Fecha Nacimiento', 'Horas Voluntariado',
            'Organización', 'Fecha Registro'
        ]
        
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=row, column=col)
            cell.value = header
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
            cell.border = border_style
        
        row += 1
        
        # Datos de usuarios
        for usuario in usuarios:
            try:
                # Obtener organización si es admin u organizacion
                organizacion_nombre = None
                if usuario.rol in ['admin', 'organizacion']:
                    org = Organizacion.query.filter_by(id_usuario_org=usuario.id).first()
                    organizacion_nombre = org.nombre if org else None
                
                # Formatear fecha de nacimiento
                fecha_nacimiento = ''
                if usuario.fecha_nacimiento:
                    fecha_nacimiento = usuario.fecha_nacimiento.strftime('%d/%m/%Y')
                
                # Formatear fecha de registro
                fecha_registro = ''
                if usuario.created_at:
                    fecha_registro = usuario.created_at.strftime('%d/%m/%Y')
                
                # Obtener horas de voluntariado
                horas_voluntariado = usuario.hora_voluntariado if usuario.hora_voluntariado else 0
                
                # Escribir datos
                datos = [
                    usuario.id,
                    usuario.nombre or '',
                    usuario.apellido or '',
                    usuario.rut or '',
                    usuario.email or '',
                    usuario.telefono or '',
                    usuario.rol or 'user',
                    usuario.region or '',
                    usuario.ciudad or '',
                    usuario.comuna or '',
                    usuario.sexo or '',
                    fecha_nacimiento,
                    horas_voluntariado,
                    organizacion_nombre or '',
                    fecha_registro
                ]
                
                for col, valor in enumerate(datos, 1):
                    cell = ws.cell(row=row, column=col)
                    cell.value = valor
                    cell.border = border_style
                    cell.alignment = Alignment(
                        horizontal='left' if col in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] else 'left',
                        vertical='center',
                        wrap_text=True
                    )
                
                row += 1
            except Exception as user_error:
                print(f"Error al procesar usuario ID {usuario.id}: {user_error}")
                import traceback
                print(traceback.format_exc())
                continue
        
        # Ajustar ancho de columnas
        ws.column_dimensions['A'].width = 8   # ID
        ws.column_dimensions['B'].width = 20  # Nombre
        ws.column_dimensions['C'].width = 20  # Apellido
        ws.column_dimensions['D'].width = 15  # RUT
        ws.column_dimensions['E'].width = 30  # Email
        ws.column_dimensions['F'].width = 15  # Teléfono
        ws.column_dimensions['G'].width = 15  # Rol
        ws.column_dimensions['H'].width = 25  # Región
        ws.column_dimensions['I'].width = 20  # Ciudad
        ws.column_dimensions['J'].width = 20  # Comuna
        ws.column_dimensions['K'].width = 12  # Sexo
        ws.column_dimensions['L'].width = 15  # Fecha Nacimiento
        ws.column_dimensions['M'].width = 18  # Horas Voluntariado
        ws.column_dimensions['N'].width = 30  # Organización
        ws.column_dimensions['O'].width = 15  # Fecha Registro
        
        # Congelar primera fila de encabezados
        if row > len(usuarios) + 6:
            ws.freeze_panes = f'A{row - len(usuarios)}'
        
        # Guardar en memoria
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        rol_suffix = f"_{rol_filter}" if rol_filter else ""
        region_suffix = f"_{region_filter.replace(' ', '_')}" if region_filter else ""
        filename = f'reporte_usuarios{rol_suffix}{region_suffix}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error al generar reporte de usuarios: {str(e)}")
        print(error_trace)
        
        return jsonify({
            'success': False,
            'error': f"Error al generar el reporte: {str(e)}"
        }), 500

# Endpoint para obtener todas las organizaciones con sus administradores
@app.route("/api/admin/organizaciones", methods=["GET"])
def obtener_organizaciones_admin():
    try:
        organizaciones = Organizacion.query.all()
        
        organizaciones_data = []
        for org in organizaciones:
            try:
                # Obtener usuario administrador
                usuario_org = Usuario.query.get(org.id_usuario_org) if org.id_usuario_org else None
                
                # Contar oportunidades de esta organización
                num_oportunidades = Oportunidad.query.filter_by(organizacion_id=org.id).count()
                
                # Obtener ciudad de forma segura usando getattr
                ciudad_val = getattr(org, 'ciudad', None) or ''
                
                organizaciones_data.append({
                    'id': org.id,
                    'nombre': org.nombre or '',
                    'rut': org.rut or '',
                    'email_contacto': org.email_contacto or '',
                    'telefono_contacto': org.telefono_contacto or '',
                    'region': org.region or '',
                    'ciudad': ciudad_val,
                    'comuna': org.comuna or '',
                    'descripcion': org.descripcion or '',
                    'area_trabajo': org.area_trabajo or '',
                    'fecha_creacion': org.fecha_creacion.isoformat() if org.fecha_creacion else None,
                    'usuario_org_id': org.id_usuario_org,
                    'admin_nombre': f"{usuario_org.nombre} {usuario_org.apellido}".strip() if usuario_org else None,
                    'admin_email': usuario_org.email if usuario_org else None,
                    'admin_rol': usuario_org.rol if usuario_org else None,
                    'num_oportunidades': num_oportunidades,
                    'created_at': org.created_at.isoformat() if org.created_at else None
                })
            except Exception as org_error:
                print(f"Error al procesar organización ID {org.id}: {org_error}")
                import traceback
                print(traceback.format_exc())
                # Continuar con la siguiente organización
                continue
        
        return jsonify({
            'success': True,
            'organizaciones': organizaciones_data,
            'total': len(organizaciones_data)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para generar reporte de impacto de una organización (formato INJUV)
@app.route("/api/organizaciones/<int:organizacion_id>/reporte-impacto", methods=["GET"])
def generar_reporte_impacto_organizacion(organizacion_id):
    try:
        if not OPENPYXL_AVAILABLE:
            return jsonify({
                'success': False,
                'error': 'openpyxl no está instalado. Instala con: pip install openpyxl'
            }), 500
        
        # Obtener parámetros de filtro
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        oportunidad_id = request.args.get('oportunidad_id')
        
        # Obtener la organización
        organizacion = Organizacion.query.get(organizacion_id)
        if not organizacion:
            return jsonify({
                'success': False,
                'error': 'Organización no encontrada'
            }), 404
        
        # Obtener oportunidades de la organización
        query = Oportunidad.query.filter_by(organizacion_id=organizacion_id)
        if oportunidad_id:
            query = query.filter(Oportunidad.id == oportunidad_id)
        
        oportunidades = query.all()
        
        # Crear workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Reporte Impacto"
        
        # Estilos
        header_fill = PatternFill(start_color="1976D2", end_color="1976D2", fill_type="solid")
        header_font = Font(bold=True, color="FFFFFF", size=12)
        title_font = Font(bold=True, size=16)
        border_style = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )
        
        # Título
        ws['A1'] = f"REPORTE DE IMPACTO - {organizacion.nombre.upper()}"
        ws['A1'].font = title_font
        ws.merge_cells('A1:H1')
        ws['A1'].alignment = Alignment(horizontal='center', vertical='center')
        
        # Información del reporte
        row = 3
        ws[f'A{row}'] = f"Fecha de generación: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}"
        ws[f'A{row}'].font = Font(size=10, italic=True)
        row += 1
        if fecha_inicio:
            ws[f'A{row}'] = f"Período desde: {fecha_inicio}"
            ws[f'A{row}'].font = Font(size=10, italic=True)
            row += 1
        if fecha_fin:
            ws[f'A{row}'] = f"Período hasta: {fecha_fin}"
            ws[f'A{row}'].font = Font(size=10, italic=True)
            row += 1
        row += 1
        
        # Encabezados
        headers = ['Oportunidad', 'Voluntario', 'Estado', 'Asistencia Capacitación', 
                   'Asistencia Actividad', 'Calificación', 'Certificado', 'Fecha Postulación']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=row, column=col)
            cell.value = header
            cell.fill = header_fill
            cell.font = header_font
            cell.border = border_style
            cell.alignment = Alignment(horizontal='center', vertical='center')
        
        row += 1
        
        # Datos de postulaciones
        total_voluntarios = 0
        total_horas = 0
        total_actividades = 0
        total_certificados = 0
        
        for oportunidad in oportunidades:
            # Filtrar por fecha si se especifica
            postulaciones = Postulacion.query.filter_by(oportunidad_id=oportunidad.id).all()
            
            for post in postulaciones:
                # Filtrar por fecha si se especifica
                if fecha_inicio or fecha_fin:
                    post_date = post.created_at.date() if post.created_at else None
                    if fecha_inicio and post_date and post_date < datetime.strptime(fecha_inicio, '%Y-%m-%d').date():
                        continue
                    if fecha_fin and post_date and post_date > datetime.strptime(fecha_fin, '%Y-%m-%d').date():
                        continue
                
                usuario = Usuario.query.get(post.usuario_id)
                if not usuario:
                    continue
                
                # Solo incluir seleccionados para el reporte de impacto
                if post.estado != 'Seleccionado':
                    continue
                
                total_voluntarios += 1
                if post.asistencia_actividad:
                    total_actividades += 1
                    total_horas += 8  # Estimación: 8 horas por actividad
                if post.tiene_certificado:
                    total_certificados += 1
                
                # Escribir datos
                data_row = [
                    oportunidad.titulo,
                    f"{usuario.nombre} {usuario.apellido}".strip(),
                    post.estado,
                    'Sí' if post.asistencia_capacitacion else 'No',
                    'Sí' if post.asistencia_actividad else 'No',
                    post.calificacion_org if post.calificacion_org else 'Sin calificar',
                    'Sí' if post.tiene_certificado else 'No',
                    post.created_at.strftime('%d/%m/%Y') if post.created_at else 'N/A'
                ]
                
                for col, value in enumerate(data_row, 1):
                    cell = ws.cell(row=row, column=col)
                    cell.value = value
                    cell.border = border_style
                
                row += 1
        
        # Resumen
        row += 1
        ws[f'A{row}'] = "RESUMEN DE IMPACTO"
        ws[f'A{row}'].font = Font(bold=True, size=14)
        ws.merge_cells(f'A{row}:H{row}')
        row += 1
        
        resumen_data = [
            ['Total de Voluntarios', total_voluntarios],
            ['Total de Horas de Voluntariado', total_horas],
            ['Total de Actividades Completadas', total_actividades],
            ['Total de Certificados Emitidos', total_certificados]
        ]
        
        for item in resumen_data:
            ws[f'A{row}'] = item[0]
            ws[f'A{row}'].font = Font(bold=True)
            ws[f'B{row}'] = item[1]
            row += 1
        
        # Ajustar ancho de columnas
        column_widths = [30, 25, 15, 20, 20, 15, 15, 18]
        for col, width in enumerate(column_widths, 1):
            ws.column_dimensions[chr(64 + col)].width = width
        
        # Guardar en memoria
        from io import BytesIO
        output = BytesIO()
        wb.save(output)
        output.seek(0)
        
        filename = f'reporte_impacto_{organizacion.nombre.replace(" ", "_")}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error al generar reporte de impacto: {str(e)}")
        print(error_trace)
        
        return jsonify({
            'success': False,
            'error': f"Error al generar el reporte: {str(e)}"
        }), 500

# Endpoint para generar reporte Excel de organizaciones
@app.route("/api/admin/organizaciones/generar-reporte", methods=["POST"])
def generar_reporte_organizaciones():
    try:
        if not OPENPYXL_AVAILABLE:
            return jsonify({
                'success': False,
                'error': 'openpyxl no está instalado. Instala con: pip install openpyxl'
            }), 500
        
        data = request.json or {}
        region_filter = data.get('region')
        
        # Obtener todas las organizaciones
        query = Organizacion.query
        if region_filter:
            query = query.filter(Organizacion.region == region_filter)
        
        organizaciones = query.all()
        
        # Crear workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Reporte Organizaciones"
        
        # Estilos
        header_fill = PatternFill(start_color="1976D2", end_color="1976D2", fill_type="solid")
        header_font = Font(bold=True, color="FFFFFF", size=12)
        title_font = Font(bold=True, size=16)
        border_style = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )
        
        # Título
        ws['A1'] = "REPORTE DE ORGANIZACIONES REGISTRADAS"
        ws['A1'].font = title_font
        ws.merge_cells('A1:J1')
        ws['A1'].alignment = Alignment(horizontal='center', vertical='center')
        
        # Información del reporte
        row = 3
        ws[f'A{row}'] = f"Fecha de generación: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}"
        ws[f'A{row}'].font = Font(size=10, italic=True)
        row += 1
        if region_filter:
            ws[f'A{row}'] = f"Región filtrada: {region_filter}"
            ws[f'A{row}'].font = Font(size=10, italic=True)
            row += 1
        ws[f'A{row}'] = f"Total de organizaciones: {len(organizaciones)}"
        ws[f'A{row}'].font = Font(bold=True, size=11)
        row += 2
        
        # Encabezados
        headers = [
            'ID', 'Nombre', 'RUT', 'Email Contacto', 'Teléfono',
            'Región', 'Ciudad', 'Comuna', 'Área de Trabajo',
            'Administrador', 'Email Admin', 'Oportunidades Creadas',
            'Fecha Creación', 'Descripción'
        ]
        
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=row, column=col)
            cell.value = header
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
            cell.border = border_style
        
        row += 1
        
        # Datos de organizaciones
        for org in organizaciones:
            try:
                # Obtener usuario administrador
                usuario_org = Usuario.query.get(org.id_usuario_org) if org.id_usuario_org else None
                admin_nombre = f"{usuario_org.nombre} {usuario_org.apellido}".strip() if usuario_org else 'Sin administrador'
                admin_email = usuario_org.email if usuario_org else ''
                
                # Contar oportunidades
                num_oportunidades = Oportunidad.query.filter_by(organizacion_id=org.id).count()
                
                # Obtener ciudad
                ciudad_val = getattr(org, 'ciudad', None) or ''
                
                # Formatear fecha
                fecha_creacion = ''
                if org.fecha_creacion:
                    fecha_creacion = org.fecha_creacion.strftime('%d/%m/%Y')
                elif org.created_at:
                    fecha_creacion = org.created_at.strftime('%d/%m/%Y')
                
                # Descripción truncada
                descripcion = (org.descripcion or '')[:100] + ('...' if org.descripcion and len(org.descripcion) > 100 else '')
                
                # Escribir datos
                datos = [
                    org.id,
                    org.nombre or '',
                    org.rut or '',
                    org.email_contacto or '',
                    org.telefono_contacto or '',
                    org.region or '',
                    ciudad_val,
                    org.comuna or '',
                    org.area_trabajo or '',
                    admin_nombre,
                    admin_email,
                    num_oportunidades,
                    fecha_creacion,
                    descripcion
                ]
                
                for col, valor in enumerate(datos, 1):
                    cell = ws.cell(row=row, column=col)
                    cell.value = valor
                    cell.border = border_style
                    cell.alignment = Alignment(
                        horizontal='left' if col in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] else 'left',
                        vertical='center',
                        wrap_text=True
                    )
                
                row += 1
            except Exception as org_error:
                print(f"Error al procesar organización ID {org.id}: {org_error}")
                continue
        
        # Ajustar ancho de columnas
        ws.column_dimensions['A'].width = 8   # ID
        ws.column_dimensions['B'].width = 30  # Nombre
        ws.column_dimensions['C'].width = 15  # RUT
        ws.column_dimensions['D'].width = 30  # Email Contacto
        ws.column_dimensions['E'].width = 15  # Teléfono
        ws.column_dimensions['F'].width = 25  # Región
        ws.column_dimensions['G'].width = 20  # Ciudad
        ws.column_dimensions['H'].width = 20  # Comuna
        ws.column_dimensions['I'].width = 25  # Área de Trabajo
        ws.column_dimensions['J'].width = 25  # Administrador
        ws.column_dimensions['K'].width = 30  # Email Admin
        ws.column_dimensions['L'].width = 18  # Oportunidades
        ws.column_dimensions['M'].width = 15  # Fecha Creación
        ws.column_dimensions['N'].width = 50  # Descripción
        
        # Congelar primera fila de encabezados
        ws.freeze_panes = f'A{row - len(organizaciones)}'
        
        # Guardar en memoria
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        region_suffix = f"_{region_filter.replace(' ', '_')}" if region_filter else ""
        filename = f'reporte_organizaciones{region_suffix}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error al generar reporte de organizaciones: {str(e)}")
        print(error_trace)
        
        return jsonify({
            'success': False,
            'error': f"Error al generar el reporte: {str(e)}"
        }), 500

# Endpoint para actualizar el rol de un usuario y asignar organización
@app.route("/api/admin/usuarios/<int:user_id>/rol", methods=["PUT"])
def actualizar_rol_usuario(user_id):
    try:
        data = request.json
        nuevo_rol = data.get('rol')
        organizacion_id = data.get('organizacion_id')  # Nueva: ID de organización a asignar
        
        if not nuevo_rol:
            return jsonify({
                'success': False,
                'error': 'El rol es requerido'
            }), 400
        
        usuario = Usuario.query.get(user_id)
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404
        
        # Si se está asignando rol "organizacion"
        if nuevo_rol == 'organizacion':
            if organizacion_id:
                # Verificar que la organización existe
                organizacion = Organizacion.query.get(organizacion_id)
                if not organizacion:
                    return jsonify({
                        'success': False,
                        'error': 'La organización especificada no existe'
                    }), 404
                
                # Si la organización ya tiene otro usuario asignado, desasignarla primero
                if organizacion.id_usuario_org and organizacion.id_usuario_org != user_id:
                    usuario_anterior_id = organizacion.id_usuario_org
                    usuario_anterior = Usuario.query.get(usuario_anterior_id)
                    
                    # Si el usuario anterior solo tiene rol "organizacion" (sin otras organizaciones), cambiar su rol a "user"
                    if usuario_anterior and usuario_anterior.rol == 'organizacion':
                        # Verificar si tiene otras organizaciones
                        otras_orgs = Organizacion.query.filter_by(id_usuario_org=usuario_anterior_id).filter(Organizacion.id != organizacion_id).first()
                        if not otras_orgs:
                            # No tiene otras organizaciones, cambiar su rol a "user"
                            usuario_anterior.rol = 'user'
                            print(f"Rol del usuario anterior {usuario_anterior.email} cambiado a 'user' porque ya no tiene organizaciones asignadas")
                
                # Asignar la organización al nuevo usuario
                organizacion.id_usuario_org = user_id
            else:
                # Si organizacion_id es None/null (opción "Ninguna organización"), desasignar cualquier organización actual
                organizacion_existente = Organizacion.query.filter_by(id_usuario_org=user_id).first()
                if organizacion_existente:
                    organizacion_existente.id_usuario_org = None
                    print(f"Organización '{organizacion_existente.nombre}' desasignada del usuario {user_id}")
        
        # Si se está cambiando de admin/organizacion a otro rol, verificar si tiene organización
        if usuario.rol in ['admin', 'organizacion'] and nuevo_rol not in ['admin', 'organizacion']:
            organizacion_existente = Organizacion.query.filter_by(id_usuario_org=user_id).first()
            if organizacion_existente:
                # Desasignar la organización (pero no eliminarla)
                organizacion_existente.id_usuario_org = None
        
        # Si se está cambiando de "organizacion" a otro rol sin organización asignada, está bien
        usuario.rol = nuevo_rol
        db.session.commit()
        
        # Obtener información de la organización asignada si existe
        organizacion_asignada = None
        if nuevo_rol == 'organizacion':
            org = Organizacion.query.filter_by(id_usuario_org=user_id).first()
            if org:
                organizacion_asignada = {
                    'id': org.id,
                    'nombre': org.nombre
                }
        
        return jsonify({
            'success': True,
            'message': 'Rol actualizado exitosamente',
            'usuario': {
                'id': usuario.id,
                'email': usuario.email,
                'nombre': usuario.nombre,
                'apellido': usuario.apellido,
                'rol': usuario.rol,
                'organizacion': organizacion_asignada
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error al actualizar rol de usuario: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para eliminar el rol de un usuario (poner en 'user' por defecto)
@app.route("/api/admin/usuarios/<int:user_id>/rol", methods=["DELETE"])
def eliminar_rol_usuario(user_id):
    try:
        usuario = Usuario.query.get(user_id)
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404
        
        # Verificar si es admin de una organización
        if usuario.rol in ['admin', 'organizacion']:
            organizacion = Organizacion.query.filter_by(id_usuario_org=user_id).first()
            if organizacion:
                return jsonify({
                    'success': False,
                    'error': 'No se puede eliminar el rol de un administrador de organización. Primero debe asignar otro administrador a la organización.'
                }), 400
        
        # Establecer rol por defecto
        usuario.rol = 'user'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Rol eliminado exitosamente (establecido como usuario por defecto)',
            'usuario': {
                'id': usuario.id,
                'email': usuario.email,
                'nombre': usuario.nombre,
                'apellido': usuario.apellido,
                'rol': usuario.rol
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para que el administrador elimine usuarios
@app.route("/api/admin/usuarios/<int:user_id>", methods=["DELETE"])
def admin_eliminar_usuario(user_id):
    try:
        # Buscar el usuario
        usuario = Usuario.query.get(user_id)
        
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404
        
        # Obtener todas las postulaciones del usuario
        postulaciones = Postulacion.query.filter_by(usuario_id=user_id).all()
        
        # Verificar si el usuario es administrador de una organización
        organizacion = Organizacion.query.filter_by(id_usuario_org=user_id).first()
        
        if organizacion:
            # Si tiene una organización, eliminar también las oportunidades y postulaciones asociadas
            oportunidades = Oportunidad.query.filter_by(organizacion_id=organizacion.id).all()
            
            for oportunidad in oportunidades:
                # Eliminar postulaciones de cada oportunidad
                postulaciones_oportunidad = Postulacion.query.filter_by(oportunidad_id=oportunidad.id).all()
                for post in postulaciones_oportunidad:
                    db.session.delete(post)
                # Eliminar la oportunidad
                db.session.delete(oportunidad)
            
            # Eliminar la organización
            db.session.delete(organizacion)
        
        # Eliminar todas las postulaciones del usuario
        for postulacion in postulaciones:
            db.session.delete(postulacion)
        
        # Eliminar el usuario
        db.session.delete(usuario)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Usuario eliminado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error al eliminar usuario: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para permitir NULL en id_usuario_org
@app.route("/api/admin/migrate/allow-null-usuario-org", methods=["POST"])
def allow_null_usuario_org():
    try:
        with app.app_context():
            # Ejecutar ALTER TABLE para permitir NULL
            alter_query = text("ALTER TABLE organizaciones ALTER COLUMN id_usuario_org DROP NOT NULL")
            db.session.execute(alter_query)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Columna id_usuario_org ahora permite valores NULL'
            }), 200
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        # Si el error es que ya no tiene NOT NULL, considerarlo como éxito
        if 'does not have a NOT NULL constraint' in error_msg or 'does not exist' in error_msg.lower():
            return jsonify({
                'success': True,
                'message': 'La columna ya permite valores NULL o no existe la restricción'
            }), 200
        
        return jsonify({
            'success': False,
            'error': f'Error al ejecutar migración: {error_msg}'
        }), 500

# Endpoint para obtener estadísticas del dashboard
@app.route("/api/admin/estadisticas", methods=["GET"])
def obtener_estadisticas():
    try:
        # Contar usuarios registrados
        total_usuarios = Usuario.query.count()
        
        # Contar oportunidades (voluntariados creados)
        total_oportunidades = Oportunidad.query.count()
        
        # Contar organizaciones creadas
        total_organizaciones = Organizacion.query.count()
        
        # Contar postulaciones
        total_postulaciones = Postulacion.query.count()
        
        # Contar voluntariados por estado
        voluntariados_cerrados = Oportunidad.query.filter_by(estado='cerrada').count()
        voluntariados_activos = Oportunidad.query.filter_by(estado='activa').count()
        voluntariados_abiertos = Oportunidad.query.filter_by(estado='abierta').count()
        voluntariados_en_proceso = voluntariados_activos + voluntariados_abiertos
        
        # Contar noticias activas (verificar si existe la tabla)
        total_noticias = 0
        try:
            from sqlalchemy import text
            # Intentar contar noticias si la tabla existe
            result = db.session.execute(text("""
                SELECT COUNT(*) FROM information_schema.tables 
                WHERE table_name = 'noticias'
            """)).fetchone()
            if result and result[0] > 0:
                # La tabla existe, contar noticias activas
                noticias_result = db.session.execute(text("""
                    SELECT COUNT(*) FROM noticias 
                    WHERE estado = 'activa' OR estado = 'publicada' OR estado IS NULL
                """)).fetchone()
                total_noticias = noticias_result[0] if noticias_result else 0
        except:
            # Si no existe la tabla o hay error, devolver 0
            total_noticias = 0
        
        return jsonify({
            'success': True,
            'usuarios_registrados': total_usuarios,
            'voluntariados_creados': total_oportunidades,
            'voluntariados_cerrados': voluntariados_cerrados,
            'voluntariados_en_proceso': voluntariados_en_proceso,
            'organizaciones_creadas': total_organizaciones,
            'noticias_activas': total_noticias,
            'postulaciones': total_postulaciones,
            'estadisticas': {
                'usuarios_registrados': total_usuarios,
                'voluntariados_creados': total_oportunidades,
                'voluntariados_cerrados': voluntariados_cerrados,
                'voluntariados_en_proceso': voluntariados_en_proceso,
                'organizaciones_creadas': total_organizaciones,
                'noticias_activas': total_noticias,
                'postulaciones': total_postulaciones
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para obtener estadísticas de voluntarios
@app.route("/api/admin/estadisticas/voluntarios", methods=["GET"])
def obtener_estadisticas_voluntarios():
    try:
        from sqlalchemy import extract, func
        from datetime import datetime
        
        mes_filtro = request.args.get('mes')
        año_filtro = request.args.get('año')
        
        query = db.session.query(
            extract('year', Usuario.created_at).label('año'),
            extract('month', Usuario.created_at).label('mes'),
            func.count(Usuario.id).label('cantidad')
        ).filter(Usuario.created_at.isnot(None))
        
        if año_filtro:
            query = query.filter(extract('year', Usuario.created_at) == int(año_filtro))
        if mes_filtro:
            query = query.filter(extract('month', Usuario.created_at) == int(mes_filtro))
        
        query = query.group_by(
            extract('year', Usuario.created_at),
            extract('month', Usuario.created_at)
        ).order_by(
            extract('year', Usuario.created_at).desc(),
            extract('month', Usuario.created_at).asc()
        )
        
        resultados = query.all()
        
        meses_nombres = {
            1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
            5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
            9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
        }
        
        datos = []
        for r in resultados:
            año = int(r.año) if r.año else None
            mes = int(r.mes) if r.mes else None
            if año and mes:
                datos.append({
                    'label': f"{meses_nombres.get(mes, f'Mes {mes}')} {año}",
                    'mes': meses_nombres.get(mes, f'Mes {mes}'),
                    'año': año,
                    'cantidad': int(r.cantidad) if r.cantidad else 0
                })
        
        return jsonify({
            'success': True,
            'datos': datos,
            'tipo': 'line'
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error en obtener_estadisticas_voluntarios: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para obtener estadísticas de organizaciones
@app.route("/api/admin/estadisticas/organizaciones", methods=["GET"])
def obtener_estadisticas_organizaciones():
    try:
        from sqlalchemy import func
        
        tipo = request.args.get('tipo', 'area_trabajo')  # 'area_trabajo' o 'voluntariados_por_org'
        
        if tipo == 'area_trabajo':
            # Estadísticas por área de trabajo
            query = db.session.query(
                Organizacion.area_trabajo.label('area'),
                func.count(Organizacion.id).label('cantidad')
            ).filter(Organizacion.area_trabajo.isnot(None)).filter(Organizacion.area_trabajo != '')
            
            query = query.group_by(Organizacion.area_trabajo).order_by(func.count(Organizacion.id).desc())
            
            resultados = query.all()
            
            datos = []
            for r in resultados:
                datos.append({
                    'label': r.area or 'Sin área',
                    'cantidad': int(r.cantidad) if r.cantidad else 0
                })
            
            return jsonify({
                'success': True,
                'datos': datos,
                'tipo': 'pie'
            }), 200
            
        elif tipo == 'voluntariados_por_org':
            # Voluntariados creados por organización
            query = db.session.query(
                Organizacion.nombre.label('organizacion'),
                func.count(Oportunidad.id).label('cantidad')
            ).join(Oportunidad, Organizacion.id == Oportunidad.organizacion_id)
            
            query = query.group_by(Organizacion.nombre).order_by(func.count(Oportunidad.id).desc()).limit(10)
            
            resultados = query.all()
            
            datos = []
            for r in resultados:
                datos.append({
                    'label': r.organizacion or 'Sin nombre',
                    'cantidad': int(r.cantidad) if r.cantidad else 0
                })
            
            return jsonify({
                'success': True,
                'datos': datos,
                'tipo': 'bar'
            }), 200
        
        else:
            return jsonify({
                'success': False,
                'error': 'Tipo no válido'
            }), 400
        
    except Exception as e:
        import traceback
        print(f"Error en obtener_estadisticas_organizaciones: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para obtener estadísticas de voluntariados
@app.route("/api/admin/estadisticas/voluntariados", methods=["GET"])
def obtener_estadisticas_voluntariados():
    try:
        from sqlalchemy import func
        
        tipo = request.args.get('tipo', 'estado')  # 'estado' o 'mensual'
        
        if tipo == 'estado':
            # Estadísticas por estado (creados, cerrados, en proceso)
            estados = {
                'cerrada': Oportunidad.query.filter_by(estado='cerrada').count(),
                'activa': Oportunidad.query.filter_by(estado='activa').count(),
                'abierta': Oportunidad.query.filter_by(estado='abierta').count()
            }
            
            datos = [
                {'label': 'Cerrados', 'cantidad': estados['cerrada']},
                {'label': 'En Proceso', 'cantidad': estados['activa'] + estados['abierta']},
                {'label': 'Total Creados', 'cantidad': Oportunidad.query.count()}
            ]
            
            return jsonify({
                'success': True,
                'datos': datos,
                'tipo': 'pie'
            }), 200
            
        elif tipo == 'mensual':
            # Voluntariados creados por mes
            from sqlalchemy import extract
            
            mes_filtro = request.args.get('mes')
            año_filtro = request.args.get('año')
            
            query = db.session.query(
                extract('year', Oportunidad.created_at).label('año'),
                extract('month', Oportunidad.created_at).label('mes'),
                func.count(Oportunidad.id).label('cantidad')
            ).filter(Oportunidad.created_at.isnot(None))
            
            if año_filtro:
                query = query.filter(extract('year', Oportunidad.created_at) == int(año_filtro))
            if mes_filtro:
                query = query.filter(extract('month', Oportunidad.created_at) == int(mes_filtro))
            
            query = query.group_by(
                extract('year', Oportunidad.created_at),
                extract('month', Oportunidad.created_at)
            ).order_by(
                extract('year', Oportunidad.created_at).desc(),
                extract('month', Oportunidad.created_at).asc()
            )
            
            resultados = query.all()
            
            meses_nombres = {
                1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
                5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
                9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
            }
            
            datos = []
            for r in resultados:
                año = int(r.año) if r.año else None
                mes = int(r.mes) if r.mes else None
                if año and mes:
                    datos.append({
                        'label': f"{meses_nombres.get(mes, f'Mes {mes}')} {año}",
                        'mes': meses_nombres.get(mes, f'Mes {mes}'),
                        'año': año,
                        'cantidad': int(r.cantidad) if r.cantidad else 0
                    })
            
            return jsonify({
                'success': True,
                'datos': datos,
                'tipo': 'line'
            }), 200
        
        else:
            return jsonify({
                'success': False,
                'error': 'Tipo no válido'
            }), 400
        
    except Exception as e:
        import traceback
        print(f"Error en obtener_estadisticas_voluntariados: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para obtener estadísticas mensuales
@app.route("/api/admin/estadisticas/mensuales", methods=["GET"])
def obtener_estadisticas_mensuales():
    try:
        from sqlalchemy import extract, func
        from datetime import datetime
        
        # Obtener parámetros de filtro
        mes_filtro = request.args.get('mes')
        año_filtro = request.args.get('año')
        
        # Obtener todos los años disponibles
        años_usuarios = db.session.query(extract('year', Usuario.created_at).label('año')).distinct().all()
        años_oportunidades = db.session.query(extract('year', Oportunidad.created_at).label('año')).distinct().all()
        años_disponibles = sorted(set([int(a[0]) for a in años_usuarios + años_oportunidades if a[0] is not None]), reverse=True)
        
        # Construir query base para usuarios
        query_usuarios = db.session.query(
            extract('year', Usuario.created_at).label('año'),
            extract('month', Usuario.created_at).label('mes'),
            func.count(Usuario.id).label('cantidad')
        ).filter(Usuario.created_at.isnot(None))
        
        # Construir query base para oportunidades
        query_oportunidades = db.session.query(
            extract('year', Oportunidad.created_at).label('año'),
            extract('month', Oportunidad.created_at).label('mes'),
            func.count(Oportunidad.id).label('cantidad')
        ).filter(Oportunidad.created_at.isnot(None))
        
        # Aplicar filtros si existen
        if año_filtro:
            año_int = int(año_filtro)
            query_usuarios = query_usuarios.filter(extract('year', Usuario.created_at) == año_int)
            query_oportunidades = query_oportunidades.filter(extract('year', Oportunidad.created_at) == año_int)
        
        if mes_filtro:
            mes_int = int(mes_filtro)
            query_usuarios = query_usuarios.filter(extract('month', Usuario.created_at) == mes_int)
            query_oportunidades = query_oportunidades.filter(extract('month', Oportunidad.created_at) == mes_int)
        
        # Agrupar por año y mes
        query_usuarios = query_usuarios.group_by(
            extract('year', Usuario.created_at),
            extract('month', Usuario.created_at)
        )
        
        query_oportunidades = query_oportunidades.group_by(
            extract('year', Oportunidad.created_at),
            extract('month', Oportunidad.created_at)
        )
        
        # Ejecutar queries
        usuarios_stats = query_usuarios.all()
        oportunidades_stats = query_oportunidades.all()
        
        # Obtener voluntarios activos (usuarios con postulaciones) por mes
        query_activos = db.session.query(
            extract('year', Postulacion.created_at).label('año'),
            extract('month', Postulacion.created_at).label('mes'),
            func.count(func.distinct(Postulacion.usuario_id)).label('activos')
        ).filter(Postulacion.created_at.isnot(None))
        
        if año_filtro:
            año_int = int(año_filtro)
            query_activos = query_activos.filter(extract('year', Postulacion.created_at) == año_int)
        
        if mes_filtro:
            mes_int = int(mes_filtro)
            query_activos = query_activos.filter(extract('month', Postulacion.created_at) == mes_int)
        
        query_activos = query_activos.group_by(
            extract('year', Postulacion.created_at),
            extract('month', Postulacion.created_at)
        )
        
        activos_stats = query_activos.all()
        
        # Mapear nombres de meses
        meses_nombres = {
            1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
            5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
            9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
        }
        
        # Procesar datos de usuarios
        voluntarios_data = []
        for stat in usuarios_stats:
            año = int(stat.año) if stat.año else None
            mes = int(stat.mes) if stat.mes else None
            if año and mes:
                voluntarios_data.append({
                    'mes': meses_nombres.get(mes, f'Mes {mes}'),
                    'año': año,
                    'cantidad': int(stat.cantidad) if stat.cantidad else 0
                })
        
        # Procesar datos de oportunidades
        voluntariados_data = []
        for stat in oportunidades_stats:
            año = int(stat.año) if stat.año else None
            mes = int(stat.mes) if stat.mes else None
            if año and mes:
                voluntariados_data.append({
                    'mes': meses_nombres.get(mes, f'Mes {mes}'),
                    'año': año,
                    'cantidad': int(stat.cantidad) if stat.cantidad else 0
                })
        
        # Procesar datos de activos
        activos_map = {}
        for stat in activos_stats:
            año = int(stat.año) if stat.año else None
            mes = int(stat.mes) if stat.mes else None
            if año and mes:
                key = f"{meses_nombres.get(mes, f'Mes {mes}')}-{año}"
                activos_map[key] = int(stat.activos) if stat.activos else 0
        
        # Combinar datos
        combined_data = []
        all_keys = set()
        
        for item in voluntarios_data:
            key = f"{item['mes']}-{item['año']}"
            all_keys.add(key)
        
        for item in voluntariados_data:
            key = f"{item['mes']}-{item['año']}"
            all_keys.add(key)
        
        for key in all_keys:
            mes, año = key.rsplit('-', 1)
            año_int = int(año)
            
            voluntarios_item = next((x for x in voluntarios_data if x['mes'] == mes and x['año'] == año_int), None)
            voluntariados_item = next((x for x in voluntariados_data if x['mes'] == mes and x['año'] == año_int), None)
            
            combined_data.append({
                'mes': mes,
                'año': año_int,
                'voluntariados': voluntariados_item['cantidad'] if voluntariados_item else 0,
                'voluntarios': voluntarios_item['cantidad'] if voluntarios_item else 0,
                'activos': activos_map.get(key, 0)
            })
        
        # Ordenar por año y mes
        meses_orden = list(meses_nombres.values())
        combined_data.sort(key=lambda x: (x['año'], meses_orden.index(x['mes']) if x['mes'] in meses_orden else 999), reverse=True)
        
        return jsonify({
            'success': True,
            'estadisticas': combined_data,
            'años_disponibles': años_disponibles
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error en obtener_estadisticas_mensuales: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint temporal para actualizar la tabla oportunidades
@app.route("/api/admin/update-oportunidades-table", methods=["POST"])
def update_oportunidades_table():
    """Endpoint temporal para agregar columnas faltantes a la tabla oportunidades"""
    try:
        from sqlalchemy import text
        
        messages = []
        
        # Verificar y agregar organizacion_id si no existe
        check_query = text("""
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'oportunidades' AND column_name = 'organizacion_id'
        """)
        result = db.session.execute(check_query).fetchone()
        
        if not result:
            # Agregar la columna
            alter_query = text("ALTER TABLE oportunidades ADD COLUMN organizacion_id INTEGER")
            db.session.execute(alter_query)
            messages.append('Columna organizacion_id agregada')
            
            # Verificar y agregar foreign key
            fk_check = text("""
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_oportunidades_organizacion' 
                AND table_name = 'oportunidades'
            """)
            fk_exists = db.session.execute(fk_check).fetchone()
            
            if not fk_exists:
                fk_query = text("""
                    ALTER TABLE oportunidades 
                    ADD CONSTRAINT fk_oportunidades_organizacion 
                    FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id)
                """)
                db.session.execute(fk_query)
                messages.append('Foreign key agregada')
        else:
            messages.append('Columna organizacion_id ya existe')
        
        # Verificar y agregar area_voluntariado si no existe
        check_area = text("""
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'oportunidades' AND column_name = 'area_voluntariado'
        """)
        result_area = db.session.execute(check_area).fetchone()
        
        if not result_area:
            # Agregar la columna
            alter_area = text("ALTER TABLE oportunidades ADD COLUMN area_voluntariado VARCHAR(100)")
            db.session.execute(alter_area)
            messages.append('Columna area_voluntariado agregada')
        else:
            messages.append('Columna area_voluntariado ya existe')
        
        db.session.commit()
        return jsonify({
            'success': True,
            'message': '; '.join(messages)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint temporal para corregir el tipo de fecha_creacion
@app.route("/api/admin/fix-fecha-creacion-type", methods=["POST"])
def fix_fecha_creacion_type():
    """Endpoint temporal para corregir el tipo de la columna fecha_creacion de INTEGER a DATE"""
    try:
        from sqlalchemy import text
        
        # Verificar el tipo actual de la columna
        check_query = text("""
            SELECT data_type FROM information_schema.columns 
            WHERE table_name = 'organizaciones' AND column_name = 'fecha_creacion'
        """)
        result = db.session.execute(check_query).fetchone()
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'La columna fecha_creacion no existe en la tabla organizaciones'
            }), 404
        
        if result[0] == 'date':
            return jsonify({
                'success': True,
                'message': 'La columna fecha_creacion ya es de tipo DATE'
            }), 200
        
        # Cambiar el tipo de INTEGER a DATE
        alter_query = text("""
            ALTER TABLE organizaciones 
            ALTER COLUMN fecha_creacion TYPE DATE USING 
                CASE 
                    WHEN fecha_creacion IS NULL THEN NULL
                    WHEN fecha_creacion::text ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN fecha_creacion::text::DATE
                    ELSE NULL
                END
        """)
        db.session.execute(alter_query)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Tipo de columna fecha_creacion corregido de INTEGER a DATE'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint temporal para actualizar la tabla organizaciones
@app.route("/api/admin/update-organizaciones-table", methods=["POST"])
def update_organizaciones_table():
    """Endpoint temporal para agregar columnas faltantes a la tabla organizaciones"""
    try:
        from sqlalchemy import text
        
        columns_to_add = [
            ('id_usuario_org', 'INTEGER'),
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
        
        added_columns = []
        existing_columns = []
        
        for column_name, column_def in columns_to_add:
            # Verificar si la columna existe
            check_query = text("""
                SELECT 1, data_type FROM information_schema.columns 
                WHERE table_name = 'organizaciones' AND column_name = :col_name
            """)
            result = db.session.execute(check_query, {'col_name': column_name}).fetchone()
            
            if not result:
                # Agregar la columna
                alter_query = text(f"ALTER TABLE organizaciones ADD COLUMN {column_name} {column_def}")
                db.session.execute(alter_query)
                added_columns.append(column_name)
            else:
                # Si la columna existe pero tiene el tipo incorrecto, corregirlo
                if column_name == 'fecha_creacion' and result[1] != 'date':
                    # Cambiar el tipo de INTEGER a DATE
                    alter_type_query = text("""
                        ALTER TABLE organizaciones 
                        ALTER COLUMN fecha_creacion TYPE DATE USING 
                            CASE 
                                WHEN fecha_creacion IS NULL THEN NULL
                                WHEN fecha_creacion::text ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN fecha_creacion::text::DATE
                                ELSE NULL
                            END
                    """)
                    db.session.execute(alter_type_query)
                    added_columns.append(f'{column_name} (tipo corregido)')
                else:
                    existing_columns.append(column_name)
        
        # Agregar foreign key si no existe
        fk_check = text("""
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_organizaciones_usuario_org' 
            AND table_name = 'organizaciones'
        """)
        fk_exists = db.session.execute(fk_check).fetchone()
        
        if not fk_exists:
            col_check = text("""
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'organizaciones' AND column_name = 'id_usuario_org'
            """)
            if db.session.execute(col_check).fetchone():
                fk_query = text("""
                    ALTER TABLE organizaciones 
                    ADD CONSTRAINT fk_organizaciones_usuario_org 
                    FOREIGN KEY (id_usuario_org) REFERENCES usuarios(id)
                """)
                db.session.execute(fk_query)
        
        # Corregir el tipo de fecha_creacion si es necesario
        fecha_check = text("""
            SELECT data_type FROM information_schema.columns 
            WHERE table_name = 'organizaciones' AND column_name = 'fecha_creacion'
        """)
        fecha_result = db.session.execute(fecha_check).fetchone()
        
        if fecha_result and fecha_result[0] != 'date':
            # Cambiar el tipo de INTEGER a DATE
            alter_fecha_query = text("""
                ALTER TABLE organizaciones 
                ALTER COLUMN fecha_creacion TYPE DATE USING 
                    CASE 
                        WHEN fecha_creacion IS NULL THEN NULL
                        WHEN fecha_creacion::text ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN fecha_creacion::text::DATE
                        ELSE NULL
                    END
            """)
            db.session.execute(alter_fecha_query)
            print("✅ Tipo de columna 'fecha_creacion' corregido de INTEGER a DATE")
        
        # Verificar y agregar organizacion_id a oportunidades si no existe
        check_oportunidades = text("""
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'oportunidades' AND column_name = 'organizacion_id'
        """)
        result_oportunidades = db.session.execute(check_oportunidades).fetchone()
        
        if not result_oportunidades:
            alter_oportunidades = text("ALTER TABLE oportunidades ADD COLUMN organizacion_id INTEGER")
            db.session.execute(alter_oportunidades)
            added_columns.append('oportunidades.organizacion_id')
            
            # Agregar foreign key si no existe
            fk_check_oportunidades = text("""
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_oportunidades_organizacion' 
                AND table_name = 'oportunidades'
            """)
            fk_exists_oportunidades = db.session.execute(fk_check_oportunidades).fetchone()
            
            if not fk_exists_oportunidades:
                fk_query_oportunidades = text("""
                    ALTER TABLE oportunidades 
                    ADD CONSTRAINT fk_oportunidades_organizacion 
                    FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id)
                """)
                db.session.execute(fk_query_oportunidades)
        else:
            existing_columns.append('oportunidades.organizacion_id')
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Tablas actualizadas exitosamente',
            'added_columns': added_columns,
            'existing_columns': existing_columns
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Endpoint para generar reporte Excel de estadísticas
@app.route("/api/admin/estadisticas/generar-reporte", methods=["POST"])
def generar_reporte_excel():
    try:
        # Intentar importar openpyxl dinámicamente (por si se instaló después de iniciar el servidor)
        try:
            from openpyxl import Workbook
            from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
            openpyxl_available = True
            import_error_msg = None
        except ImportError as e:
            openpyxl_available = False
            import_error_msg = str(e)
            import sys
            print(f"❌ Error al importar openpyxl: {import_error_msg}")
            print(f"❌ Python ejecutándose: {sys.executable}")
            print(f"❌ Asegúrate de que el servidor Flask esté corriendo con el entorno virtual activado")
        
        if not openpyxl_available:
            error_message = f'openpyxl no está instalado. Instala con: pip install openpyxl'
            if import_error_msg:
                error_message += f'\nError detallado: {import_error_msg}'
            return jsonify({
                'success': False,
                'error': error_message
            }), 500
        
        data = request.json
        categoria = data.get('categoria', 'voluntarios')
        titulo = data.get('titulo', 'Estadísticas')
        datos_grafico = data.get('datos', [])
        tipo_grafico = data.get('tipo_grafico', 'bar')
        labels = data.get('labels', [])
        values = data.get('values', [])
        imagen_grafico = data.get('imagen_grafico', '')
        filtros = data.get('filtros', {})
        
        # Crear workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Reporte Estadísticas"
        
        # Estilos
        header_fill = PatternFill(start_color="1976D2", end_color="1976D2", fill_type="solid")
        header_font = Font(bold=True, color="FFFFFF", size=14)
        title_font = Font(bold=True, size=16)
        subtitle_font = Font(size=12)
        border_style = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )
        
        # Título
        ws['A1'] = f"Reporte de Estadísticas - {titulo}"
        ws['A1'].font = title_font
        ws.merge_cells('A1:D1')
        
        # Información del reporte
        row = 3
        ws[f'A{row}'] = f"Categoría: {categoria.capitalize()}"
        ws[f'A{row}'].font = subtitle_font
        row += 1
        
        fecha_reporte = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
        ws[f'A{row}'] = f"Fecha de generación: {fecha_reporte}"
        ws[f'A{row}'].font = Font(size=10, italic=True)
        row += 2
        
        # Filtros aplicados
        if filtros:
            ws[f'A{row}'] = "Filtros aplicados:"
            ws[f'A{row}'].font = Font(bold=True, size=11)
            row += 1
            if filtros.get('mes'):
                meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
                ws[f'A{row}'] = f"Mes: {meses[int(filtros['mes'])]}"
                row += 1
            if filtros.get('año'):
                ws[f'A{row}'] = f"Año: {filtros['año']}"
                row += 1
            if filtros.get('tipo'):
                ws[f'A{row}'] = f"Tipo: {filtros['tipo']}"
                row += 1
            row += 1
        
        # Tabla de datos
        ws[f'A{row}'] = "Datos del Gráfico"
        ws[f'A{row}'].font = Font(bold=True, size=12)
        row += 1
        
        # Encabezados de la tabla
        headers = ['Categoría', 'Cantidad']
        if tipo_grafico == 'pie':
            headers.append('Porcentaje')
        
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=row, column=col)
            cell.value = header
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.border = border_style
        
        row += 1
        
        # Datos de la tabla
        total = sum(values) if values else 0
        for i, label in enumerate(labels):
            ws.cell(row=row, column=1, value=label)
            ws.cell(row=row, column=2, value=values[i] if i < len(values) else 0)
            
            if tipo_grafico == 'pie' and total > 0:
                porcentaje = (values[i] / total * 100) if i < len(values) else 0
                ws.cell(row=row, column=3, value=f"{porcentaje:.2f}%")
            
            # Aplicar bordes
            for col in range(1, len(headers) + 1):
                ws.cell(row=row, column=col).border = border_style
                ws.cell(row=row, column=col).alignment = Alignment(horizontal='left' if col == 1 else 'center', vertical='center')
            
            row += 1
        
        # Fila de total
        row += 1
        ws.cell(row=row, column=1, value="TOTAL")
        ws.cell(row=row, column=1).font = Font(bold=True)
        ws.cell(row=row, column=2, value=total)
        ws.cell(row=row, column=2).font = Font(bold=True)
        for col in range(1, 3):
            ws.cell(row=row, column=col).border = border_style
            ws.cell(row=row, column=col).fill = PatternFill(start_color="E3F2FD", end_color="E3F2FD", fill_type="solid")
        
        row += 3
        
        # Imagen del gráfico (si está disponible)
        if imagen_grafico:
            try:
                # Intentar importar Image de openpyxl.drawing
                # Nota: openpyxl.drawing.image requiere Pillow para funcionar
                try:
                    from openpyxl.drawing.image import Image
                    # Verificar si Pillow está disponible
                    try:
                        import PIL
                    except ImportError:
                        raise ImportError("Pillow no está instalado. La imagen no se puede insertar sin Pillow. Instala con: pip install Pillow")
                    
                    # Decodificar imagen base64
                    imagen_data = base64.b64decode(imagen_grafico.split(',')[1])
                    img = Image(io.BytesIO(imagen_data))
                    
                    # Ajustar tamaño de la imagen
                    img.width = 600
                    img.height = 400
                    
                    # Insertar imagen
                    ws.add_image(img, f'A{row}')
                    row += 25  # Espacio después de la imagen
                except ImportError as import_err:
                    # Si no se puede importar Image, simplemente omitir la imagen
                    print(f"Advertencia: No se pudo importar Image de openpyxl.drawing: {import_err}")
                    print("El reporte se generará sin la imagen del gráfico.")
                    ws[f'A{row}'] = "Nota: La imagen del gráfico no está disponible (Pillow no está instalado)"
                    ws[f'A{row}'].font = Font(italic=True, size=10, color="666666")
                    row += 2
            except Exception as img_error:
                print(f"Error al insertar imagen: {img_error}")
                print(f"Tipo de error: {type(img_error).__name__}")
                import traceback
                print(traceback.format_exc())
                # Continuar sin la imagen en lugar de fallar
                ws[f'A{row}'] = f"Nota: No se pudo incluir la imagen del gráfico"
                ws[f'A{row}'].font = Font(italic=True, size=10, color="666666")
                row += 2
        
        # Conclusión
        row += 1
        ws[f'A{row}'] = "CONCLUSIÓN"
        ws[f'A{row}'].font = Font(bold=True, size=14)
        ws.merge_cells(f'A{row}:D{row}')
        row += 1
        
        # Generar conclusión basada en los datos
        conclusion = generar_conclusion(categoria, datos_grafico, labels, values, tipo_grafico, total)
        ws[f'A{row}'] = conclusion
        ws.merge_cells(f'A{row}:D{row}')
        ws[f'A{row}'].alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)
        ws.row_dimensions[row].height = 100
        
        # Ajustar ancho de columnas
        ws.column_dimensions['A'].width = 30
        ws.column_dimensions['B'].width = 15
        if tipo_grafico == 'pie':
            ws.column_dimensions['C'].width = 15
        ws.column_dimensions['D'].width = 50
        
        # Guardar en memoria
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'reporte_estadisticas_{categoria}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        )
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error al generar reporte Excel: {str(e)}")
        print(error_trace)
        
        # Proporcionar un mensaje de error más útil
        error_message = f"Error al generar el reporte: {str(e)}"
        if "openpyxl" in str(e).lower() or "ImportError" in str(type(e).__name__):
            error_message += "\n\nAsegúrate de que openpyxl esté instalado y reinicia el servidor Flask."
            error_message += "\nInstala con: pip install openpyxl"
        
        return jsonify({
            'success': False,
            'error': error_message
        }), 500

# Función para generar conclusión basada en los datos
def generar_conclusion(categoria, datos, labels, values, tipo_grafico, total):
    conclusion = ""
    
    if categoria == 'voluntarios':
        conclusion += "ANÁLISIS DE VOLUNTARIOS REGISTRADOS\n\n"
        if total > 0:
            max_value = max(values) if values else 0
            max_index = values.index(max_value) if values else 0
            max_label = labels[max_index] if max_index < len(labels) else ""
            
            conclusion += f"El análisis muestra un total de {total:,} voluntarios registrados. "
            if tipo_grafico == 'line':
                conclusion += f"La tendencia indica que {max_label} presenta el mayor número de registros con {max_value:,} voluntarios. "
                conclusion += "Esto sugiere un crecimiento constante en la participación de voluntarios en la plataforma. "
            else:
                conclusion += f"El período con mayor registro es {max_label} con {max_value:,} voluntarios ({max_value/total*100:.1f}% del total). "
                conclusion += "Se observa una distribución variada en los registros a lo largo del tiempo. "
            
            conclusion += "\n\nRECOMENDACIONES:\n"
            conclusion += "- Continuar promoviendo la participación en períodos de menor registro.\n"
            conclusion += "- Analizar las estrategias exitosas en períodos de mayor registro.\n"
            conclusion += "- Implementar campañas dirigidas para mantener el crecimiento."
    
    elif categoria == 'organizaciones':
        conclusion += "ANÁLISIS DE ORGANIZACIONES\n\n"
        if total > 0:
            max_value = max(values) if values else 0
            max_index = values.index(max_value) if values else 0
            max_label = labels[max_index] if max_index < len(labels) else ""
            
            conclusion += f"El análisis muestra un total de {total:,} organizaciones. "
            conclusion += f"El área de trabajo más representativa es '{max_label}' con {max_value:,} organizaciones ({max_value/total*100:.1f}% del total). "
            conclusion += "Esto refleja la diversidad de áreas de trabajo en la plataforma. "
            
            conclusion += "\n\nRECOMENDACIONES:\n"
            conclusion += "- Fomentar la participación de organizaciones en áreas menos representadas.\n"
            conclusion += "- Fortalecer las áreas con mayor presencia para maximizar su impacto.\n"
            conclusion += "- Desarrollar estrategias específicas por área de trabajo."
    
    elif categoria == 'voluntariados':
        conclusion += "ANÁLISIS DE VOLUNTARIADOS\n\n"
        if total > 0:
            max_value = max(values) if values else 0
            max_index = values.index(max_value) if values else 0
            max_label = labels[max_index] if max_index < len(labels) else ""
            
            conclusion += f"El análisis muestra un total de {total:,} voluntariados. "
            if 'estado' in str(labels[0] if labels else '').lower():
                conclusion += f"El estado más común es '{max_label}' con {max_value:,} voluntariados ({max_value/total*100:.1f}% del total). "
                conclusion += "Esto indica el estado general de las oportunidades de voluntariado en la plataforma. "
            else:
                conclusion += f"El período con mayor actividad es {max_label} con {max_value:,} voluntariados ({max_value/total*100:.1f}% del total). "
                conclusion += "Se observa una distribución temporal de las oportunidades creadas. "
            
            conclusion += "\n\nRECOMENDACIONES:\n"
            conclusion += "- Mantener un equilibrio entre voluntariados activos y cerrados.\n"
            conclusion += "- Promover la creación de nuevas oportunidades en períodos de menor actividad.\n"
            conclusion += "- Analizar las causas de cierre para mejorar la gestión."
    
    else:
        conclusion += "ANÁLISIS DE ESTADÍSTICAS\n\n"
        conclusion += f"El análisis muestra un total de {total:,} registros. "
        conclusion += "Los datos presentados reflejan la actividad general de la plataforma. "
        conclusion += "\n\nSe recomienda revisar periódicamente estas estadísticas para identificar tendencias y oportunidades de mejora."
    
    return conclusion

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
