from flask import Flask, request, jsonify, Response, g
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from extensions import db
from models import Paciente, Documento_Escaneado as Documento, Usuario, NotaMedica, SignosVitales, SolicitudEliminacion
from migrations import ejecutar_migraciones
import boto3
from botocore.config import Config
import os
import uuid
import mimetypes
import random
import re
import jwt
from datetime import datetime, timedelta, timezone

load_dotenv()

app = Flask(__name__)
CORS(app)  # Permite que React se comunique con Flask

# Configuración de Base de Datos (SQL Server)
DEFAULT_DB_URI = (
    'mssql+pyodbc://@localhost\\SQLEXPRESS/General?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes'
)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', DEFAULT_DB_URI)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Directorio de respaldo local si MinIO no está corriendo
LOCAL_STORAGE_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)

# Configuración de Seguridad y JWT
JWT_SECRET = os.getenv('JWT_SECRET', 'medix-jwt-secret-hospital-san-juan-de-dios-pisco-2026')
JWT_ALGORITHM = 'HS256'
JWT_EXP_HOURS = 24

DEFAULT_ADMIN_USER = os.getenv('DEFAULT_ADMIN_USER', 'admin')
DEFAULT_ADMIN_PASS = os.getenv('DEFAULT_ADMIN_PASS', 'admin123')

# Configuración de MinIO S3 con timeout rápido para evitar demoras si no está activo
s3_config = Config(
    connect_timeout=1,
    read_timeout=2,
    retries={'max_attempts': 1}
)
s3_client = boto3.client('s3',
    endpoint_url=os.getenv('MINIO_ENDPOINT', 'http://localhost:9000'),
    aws_access_key_id=os.getenv('MINIO_ACCESS_KEY', 'minioadmin'),
    aws_secret_access_key=os.getenv('MINIO_SECRET_KEY', 'minioadmin'),
    config=s3_config
)
BUCKET_NAME = 'historias-clinicas'

def asegurar_bucket():
    try:
        buckets = [b['Name'] for b in s3_client.list_buckets().get('Buckets', [])]
        if BUCKET_NAME not in buckets:
            s3_client.create_bucket(Bucket=BUCKET_NAME)
    except Exception as e:
        print(f"Aviso MinIO: {e}")

# ==========================================
# INICIALIZACIÓN Y AUTO-MIGRACIÓN
# ==========================================
with app.app_context():
    try:
        db.create_all()
        ejecutar_migraciones(db)
    except Exception as e:
        print(f"Aviso al inicializar tablas / migraciones: {e}")

    asegurar_bucket()

    try:
        if Usuario.query.count() == 0:
            admin_inicial = Usuario(
                username=DEFAULT_ADMIN_USER,
                password_hash=generate_password_hash(DEFAULT_ADMIN_PASS),
                rol='Administrador',
                nombres_completos='Administrador Principal del Sistema',
                correo='admin@medix.pisco.gob.pe'
            )
            db.session.add(admin_inicial)
            db.session.commit()
            print(f"Usuario admin inicial creado exitosamente ({DEFAULT_ADMIN_USER} / {DEFAULT_ADMIN_PASS})")
    except Exception as e:
        db.session.rollback()
        print(f"Aviso al inicializar usuario admin: {e}")

# ==========================================
# HELPERS DE AUTENTICACIÓN Y ROLES
# ==========================================
def generar_token(usuario):
    payload = {
        'sub': str(usuario.id),
        'username': usuario.username,
        'rol': usuario.rol,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def token_required(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1].strip()
        elif request.args.get('token'):
            token = request.args.get('token').strip()

        if not token:
            return jsonify({'mensaje': 'Autenticación requerida. Token no proporcionado.'}), 401

        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            usuario_id = int(data['sub'])
            usuario = Usuario.query.get(usuario_id)
            if not usuario:
                return jsonify({'mensaje': 'Usuario no válido o ya no existe.'}), 401
            g.current_user = usuario
        except jwt.ExpiredSignatureError:
            return jsonify({'mensaje': 'La sesión ha expirado. Por favor inicie sesión nuevamente.'}), 401
        except Exception:
            return jsonify({'mensaje': 'Token de autenticación inválido o alterado.'}), 401

        return f(*args, **kwargs)
    return decorador

def roles_required(*roles_permitidos):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not hasattr(g, 'current_user') or not g.current_user:
                return jsonify({'mensaje': 'Acceso no autorizado'}), 401

            rol_actual = (g.current_user.rol or '').lower()
            permitidos = [r.lower() for r in roles_permitidos]

            # Administrador tiene acceso total a cualquier operación
            if 'admin' in rol_actual:
                return f(*args, **kwargs)

            coincide = any(p in rol_actual for p in permitidos)
            if not coincide:
                return jsonify({
                    'mensaje': f'Permiso denegado. Se requiere uno de los siguientes roles: {", ".join(roles_permitidos)}'
                }), 403

            return f(*args, **kwargs)
        return wrapper
    return decorator

# ==========================================
# RUTAS DE DIAGNÓSTICO
# ==========================================
@app.route('/', methods=['GET'])
def inicio():
    return jsonify({
        "estado": "activo",
        "mensaje": "Servidor Backend Medix funcionando correctamente",
        "seguridad": "JWT + RBAC activo",
        "hospital": "Hospital San Juan de Dios de Pisco"
    })

# ==========================================
# RUTAS DE AUTENTICACIÓN
# ==========================================
@app.route('/api/auth/login', methods=['POST'])
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identificador = (data.get('username') or data.get('email') or data.get('correo') or data.get('identificador') or '').strip()
    password = data.get('password', '').strip()

    if not identificador or not password:
        return jsonify({"mensaje": "Por favor ingresa usuario o correo y contraseña"}), 400

    # Permitir inicio de sesión flexible por nombre de usuario, correo electrónico o teléfono (insensible a mayúsculas)
    identificador_limpio = identificador.strip().lower()
    usuario = Usuario.query.filter(
        db.or_(
            db.func.lower(Usuario.username) == identificador_limpio,
            db.func.lower(Usuario.correo) == identificador_limpio,
            Usuario.telefono == identificador.strip()
        )
    ).first()

    # Si la tabla quedó vacía por algún motivo, crear el admin al vuelo
    if not usuario and Usuario.query.count() == 0 and identificador == DEFAULT_ADMIN_USER and password == DEFAULT_ADMIN_PASS:
        usuario = Usuario(
            username=DEFAULT_ADMIN_USER,
            password_hash=generate_password_hash(DEFAULT_ADMIN_PASS),
            rol='Administrador',
            nombres_completos='Administrador Principal',
            correo='admin@medix.pisco.gob.pe'
        )
        db.session.add(usuario)
        db.session.commit()

    if not usuario or not check_password_hash(usuario.password_hash, password):
        return jsonify({"mensaje": "Usuario o contraseña incorrectos"}), 401

    # Detección de uso de credenciales por defecto (admin / admin123)
    es_clave_defecto = (usuario.username.lower() == 'admin' and check_password_hash(usuario.password_hash, 'admin123'))

    token = generar_token(usuario)

    return jsonify({
        "mensaje": f"Bienvenido al sistema, {usuario.username}",
        "token": token,
        "debe_cambiar_password": es_clave_defecto,
        "usuario": usuario.to_dict()
    }), 200

@app.route('/api/auth/me', methods=['GET'])
@token_required
def usuario_actual():
    es_clave_defecto = (g.current_user.username.lower() == 'admin' and check_password_hash(g.current_user.password_hash, 'admin123'))
    return jsonify({
        "sistema": "Medix - Hospital San Juan de Dios de Pisco",
        "estado": "autenticado",
        "usuario": g.current_user.to_dict(),
        "debe_cambiar_password": es_clave_defecto
    }), 200

@app.route('/api/auth/cambiar-password', methods=['POST'])
@token_required
def cambiar_password():
    data = request.get_json() or {}
    password_actual = data.get('password_actual', '').strip()
    nueva_password = data.get('nueva_password', '').strip()

    if not nueva_password or len(nueva_password) < 6:
        return jsonify({"mensaje": "La nueva contraseña debe tener al menos 6 caracteres"}), 400

    usuario = g.current_user
    es_admin_defecto = (usuario.username.lower() == 'admin' and check_password_hash(usuario.password_hash, 'admin123'))

    # Si no es clave por defecto obligatoria, exigir y verificar la contraseña actual
    if not (es_admin_defecto and not password_actual):
        if not check_password_hash(usuario.password_hash, password_actual):
            return jsonify({"mensaje": "La contraseña actual no es correcta"}), 400

    usuario.password_hash = generate_password_hash(nueva_password)
    db.session.commit()

    nuevo_token = generar_token(usuario)

    return jsonify({
        "mensaje": "¡Contraseña actualizada exitosamente! Las credenciales por defecto han sido cambiadas.",
        "token": nuevo_token,
        "usuario": usuario.to_dict(),
        "debe_cambiar_password": False
    }), 200

# Almacenamiento temporal para códigos SMS de recuperación (user_id -> info)
recuperacion_codigos = {}

@app.route('/api/auth/registro', methods=['POST'])
def registrar_usuario():
    data = request.get_json() or {}
    nombres = data.get('nombres_completos', '').strip()
    correo = data.get('correo', '').strip()
    telefono = data.get('telefono', '').strip()
    rol = data.get('rol', 'Médico General').strip()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not nombres or not correo or not telefono:
        return jsonify({"mensaje": "Nombres completos, correo y teléfono son obligatorios"}), 400

    if not username:
        base_user = correo.split('@')[0].lower() if '@' in correo else nombres.split(' ')[0].lower()
        base_user = re.sub(r'[^a-zA-Z0-9_]', '', base_user)
        if not base_user:
            base_user = 'user'
        username = base_user
        idx = 1
        while Usuario.query.filter_by(username=username).first():
            username = f"{base_user}{idx}"
            idx += 1

    if not password:
        password = f"Medix{random.randint(100, 999)}*"

    if Usuario.query.filter_by(username=username).first():
        return jsonify({"mensaje": f"El nombre de usuario '{username}' ya está registrado. Por favor elija otro."}), 409

    nuevo_usuario = Usuario(
        username=username,
        password_hash=generate_password_hash(password),
        rol=rol,
        telefono=telefono,
        correo=correo,
        nombres_completos=nombres
    )
    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify({
        "mensaje": f"Cuenta creada exitosamente para {nombres}",
        "usuario": nuevo_usuario.to_dict(),
        "credenciales": {
            "username": username,
            "password": password
        }
    }), 201

@app.route('/api/auth/recuperar-sms/solicitar', methods=['POST'])
def solicitar_recuperar_sms():
    data = request.get_json() or {}
    identificador = data.get('identificador', '').strip()
    if not identificador:
        return jsonify({"mensaje": "Por favor ingrese su usuario, teléfono o correo"}), 400

    identificador_limpio = identificador.strip().lower()
    usuario = Usuario.query.filter(
        db.or_(
            db.func.lower(Usuario.username) == identificador_limpio,
            db.func.lower(Usuario.correo) == identificador_limpio,
            Usuario.telefono == identificador.strip()
        )
    ).first()

    if not usuario:
        return jsonify({"mensaje": "No se encontró ningún usuario registrado con esos datos"}), 404

    if not usuario.telefono:
        return jsonify({
            "mensaje": f"El usuario '{usuario.username}' no tiene un número telefónico asociado. Comuníquese con Soporte TI para actualizar sus datos."
        }), 400

    codigo = f"{random.randint(100000, 999999)}"
    recuperacion_codigos[usuario.id] = {
        "codigo": codigo,
        "exp": datetime.now() + timedelta(minutes=15)
    }

    tel = usuario.telefono.strip()
    tel_ofuscado = (tel[:3] + "****" + tel[-3:]) if len(tel) >= 7 else "****"

    return jsonify({
        "mensaje": f"Código de verificación SMS enviado exitosamente al número {tel_ofuscado}",
        "usuario_id": usuario.id,
        "username": usuario.username,
        "telefono_ofuscado": tel_ofuscado,
        "codigo_simulado": codigo
    }), 200

@app.route('/api/auth/recuperar-sms/confirmar', methods=['POST'])
def confirmar_recuperar_sms():
    data = request.get_json() or {}
    usuario_id = data.get('usuario_id')
    username = data.get('username', '').strip()
    codigo = data.get('codigo', '').strip()
    nueva_password = data.get('nueva_password', '').strip()

    if not codigo or not nueva_password:
        return jsonify({"mensaje": "El código SMS y la nueva contraseña son obligatorios"}), 400

    usuario = None
    if usuario_id:
        usuario = Usuario.query.get(usuario_id)
    elif username:
        usuario = Usuario.query.filter_by(username=username).first()

    if not usuario:
        return jsonify({"mensaje": "Usuario no encontrado"}), 404

    info_codigo = recuperacion_codigos.get(usuario.id)
    if not info_codigo:
        return jsonify({"mensaje": "No hay una solicitud de código SMS activa o ha expirado"}), 400

    if datetime.now() > info_codigo['exp']:
        recuperacion_codigos.pop(usuario.id, None)
        return jsonify({"mensaje": "El código SMS ha expirado. Por favor solicite uno nuevo."}), 400

    if info_codigo['codigo'] != codigo:
        return jsonify({"mensaje": "El código SMS ingresado no es válido"}), 400

    usuario.password_hash = generate_password_hash(nueva_password)
    db.session.commit()
    recuperacion_codigos.pop(usuario.id, None)

    return jsonify({
        "mensaje": f"¡Contraseña actualizada exitosamente para '{usuario.username}'! Ya puede iniciar sesión con su nueva clave."
    }), 200

# ==========================================
# GESTIÓN DE USUARIOS (ROL: ADMINISTRADOR)
# ==========================================
@app.route('/api/usuarios', methods=['GET'])
@token_required
@roles_required('Administrador')
def listar_usuarios():
    usuarios = Usuario.query.order_by(Usuario.id.asc()).all()
    return jsonify([u.to_dict() for u in usuarios]), 200

@app.route('/api/usuarios', methods=['POST'])
@token_required
@roles_required('Administrador')
def crear_usuario():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    rol = data.get('rol', 'Médico').strip()
    telefono = data.get('telefono', '').strip()
    correo = data.get('correo', '').strip()
    nombres_completos = data.get('nombres_completos', '').strip()

    if not username or not password:
        return jsonify({"mensaje": "El nombre de usuario y la contraseña son obligatorios"}), 400

    if Usuario.query.filter_by(username=username).first():
        return jsonify({"mensaje": f"El usuario '{username}' ya existe"}), 409

    nuevo_usuario = Usuario(
        username=username,
        password_hash=generate_password_hash(password),
        rol=rol,
        telefono=telefono if telefono else None,
        correo=correo if correo else None,
        nombres_completos=nombres_completos if nombres_completos else None
    )
    db.session.add(nuevo_usuario)
    db.session.commit()
    return jsonify({
        "mensaje": f"Usuario '{username}' creado exitosamente",
        "usuario": nuevo_usuario.to_dict()
    }), 201

@app.route('/api/usuarios/<int:id>', methods=['DELETE'])
@token_required
@roles_required('Administrador')
def eliminar_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    if usuario.username.lower() == 'admin':
        return jsonify({"mensaje": "No se puede eliminar la cuenta del Administrador principal"}), 403

    db.session.delete(usuario)
    db.session.commit()
    return jsonify({"mensaje": f"Usuario '{usuario.username}' eliminado exitosamente"}), 200

# ==========================================
# ESTADO DEL SISTEMA (CONFIGURACIÓN)
# ==========================================
@app.route('/api/sistema/estado', methods=['GET'])
def estado_sistema():
    bd_ok = False
    total_pacientes = 0
    total_docs = 0
    try:
        total_pacientes = Paciente.query.count()
        total_docs = Documento.query.count()
        bd_ok = True
    except Exception as e:
        print(f"Error comprobando BD: {e}")

    minio_ok = False
    bucket_existe = False
    try:
        buckets = [b['Name'] for b in s3_client.list_buckets().get('Buckets', [])]
        minio_ok = True
        bucket_existe = BUCKET_NAME in buckets
    except Exception as e:
        print(f"Error comprobando MinIO: {e}")

    return jsonify({
        "institucion": "Hospital San Juan de Dios de Pisco",
        "unidad_ejecutora": "UE-404",
        "sistema": "Medix - Banco de Historias Clínicas",
        "base_datos": {
            "estado": "conectado" if bd_ok else "error",
            "motor": "Microsoft SQL Server",
            "total_pacientes": total_pacientes,
            "total_documentos": total_docs
        },
        "almacenamiento": {
            "estado": "conectado" if minio_ok else "error",
            "tipo": "MinIO Object Storage (S3 API)",
            "bucket": BUCKET_NAME,
            "bucket_disponible": bucket_existe
        }
    }), 200

# ==========================================
# CRUD PACIENTES (PAGINACIÓN Y BÚSQUEDA)
# ==========================================
@app.route('/api/pacientes', methods=['GET'])
@token_required
def listar_pacientes():
    q = request.args.get('q', '').strip()
    page = request.args.get('page', type=int)
    per_page = request.args.get('per_page', 12, type=int)

    query = Paciente.query
    if q:
        patron = f"%{q}%"
        query = query.filter(
            db.or_(
                Paciente.dni.ilike(patron),
                Paciente.nombre.ilike(patron),
                Paciente.alergias.ilike(patron)
            )
        )

    query = query.order_by(Paciente.id.desc())

    # Si se solicita paginación explícita
    if page:
        paginacion = query.paginate(page=page, per_page=per_page, error_out=False)
        return jsonify({
            'items': [p.to_dict(include_documentos=True) for p in paginacion.items],
            'total': paginacion.total,
            'page': paginacion.page,
            'per_page': paginacion.per_page,
            'total_paginas': paginacion.pages
        }), 200

    # Modo estándar compatible hacia atrás
    pacientes = query.all()
    return jsonify([p.to_dict(include_documentos=True) for p in pacientes]), 200

@app.route('/api/pacientes/<int:id>', methods=['GET'])
@token_required
def obtener_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    return jsonify(paciente.to_dict(include_documentos=True)), 200

@app.route('/api/pacientes', methods=['POST'])
@token_required
@roles_required('Administrador', 'Médico')
def crear_paciente():
    data = request.get_json() or {}
    dni = data.get('dni', '').strip()
    nombre = data.get('nombre', '').strip()
    alergias = data.get('alergias', '').strip()

    if not dni:
        return jsonify({"mensaje": "El DNI es obligatorio"}), 400

    if Paciente.query.filter_by(dni=dni).first():
        return jsonify({"mensaje": f"El paciente con DNI {dni} ya existe"}), 409

    nuevo_paciente = Paciente(
        dni=dni,
        nombre=nombre if nombre else None,
        alergias=alergias if alergias else None
    )
    db.session.add(nuevo_paciente)
    db.session.commit()
    return jsonify({
        "mensaje": "Paciente creado exitosamente",
        "paciente": nuevo_paciente.to_dict()
    }), 201

@app.route('/api/pacientes/<int:id>', methods=['PUT'])
@token_required
@roles_required('Administrador', 'Médico')
def actualizar_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    data = request.get_json() or {}
    nuevo_dni = data.get('dni', '').strip()
    nuevo_nombre = data.get('nombre')
    nuevas_alergias = data.get('alergias')

    if nuevo_dni:
        existente = Paciente.query.filter_by(dni=nuevo_dni).first()
        if existente and existente.id != id:
            return jsonify({"mensaje": f"Ya existe otro paciente con el DNI {nuevo_dni}"}), 409
        paciente.dni = nuevo_dni

    if nuevo_nombre is not None:
        paciente.nombre = nuevo_nombre.strip() if nuevo_nombre.strip() else None

    if nuevas_alergias is not None:
        paciente.alergias = nuevas_alergias.strip() if nuevas_alergias.strip() else None

    db.session.commit()
    return jsonify({
        "mensaje": "Paciente actualizado exitosamente",
        "paciente": paciente.to_dict()
    }), 200

@app.route('/api/pacientes/<int:id>', methods=['DELETE'])
@token_required
@roles_required('Administrador')
def eliminar_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    try:
        # Borrar archivos de MinIO asociados
        for doc in paciente.documentos:
            try:
                s3_client.delete_object(Bucket=BUCKET_NAME, Key=doc.ruta_minio)
            except Exception as e:
                print(f"Aviso al borrar de MinIO ({doc.ruta_minio}): {e}")

        db.session.delete(paciente)
        db.session.commit()
        return jsonify({"mensaje": "Paciente y sus documentos eliminados exitosamente", "id": id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"mensaje": f"Error al eliminar paciente: {str(e)}"}), 500

# ==========================================
# CRUD DOCUMENTOS (CON NOMBRE ORIGINAL)
# ==========================================
@app.route('/api/documentos', methods=['GET'])
@token_required
def listar_documentos():
    documentos = Documento.query.order_by(Documento.fecha_subida.desc()).all()
    return jsonify([d.to_dict() for d in documentos]), 200

@app.route('/api/documentos', methods=['POST'])
@token_required
@roles_required('Administrador', 'Médico')
def subir_documento():
    dni_paciente = request.form.get('dni', '').strip()
    nombre_paciente = request.form.get('nombre', '').strip()
    alergias_paciente = request.form.get('alergias', '').strip()
    archivo = request.files.get('archivo')

    if not dni_paciente or not archivo or archivo.filename == '':
        return jsonify({"mensaje": "Faltan datos obligatorios (DNI o archivo)"}), 400

    # 1. Buscar o registrar paciente
    paciente = Paciente.query.filter_by(dni=dni_paciente).first()
    if not paciente:
        paciente = Paciente(
            dni=dni_paciente,
            nombre=nombre_paciente if nombre_paciente else None,
            alergias=alergias_paciente if alergias_paciente else None
        )
        db.session.add(paciente)
        db.session.commit()
    else:
        # Actualizar datos si no estaban presentes y se proporcionan
        actualizado = False
        if nombre_paciente and (not paciente.nombre or paciente.nombre != nombre_paciente):
            paciente.nombre = nombre_paciente
            actualizado = True
        if alergias_paciente and (not paciente.alergias or paciente.alergias != alergias_paciente):
            paciente.alergias = alergias_paciente
            actualizado = True
        if actualizado:
            db.session.commit()

    # 2. Generar nombre único y subir a MinIO o almacenamiento local
    nombre_original = archivo.filename
    extension = nombre_original.rsplit('.', 1)[-1].lower() if '.' in nombre_original else 'bin'
    nombre_archivo_s3 = f"{dni_paciente}/{uuid.uuid4().hex}.{extension}"

    subido_s3 = False
    try:
        asegurar_bucket()
        content_type = archivo.content_type or mimetypes.guess_type(nombre_original)[0] or 'application/octet-stream'
        s3_client.upload_fileobj(
            archivo,
            BUCKET_NAME,
            nombre_archivo_s3,
            ExtraArgs={'ContentType': content_type}
        )
        subido_s3 = True
    except Exception as e:
        print(f"Aviso MinIO: {e}. Guardando copia en almacenamiento local.")

    if not subido_s3:
        try:
            ruta_local = os.path.join(LOCAL_STORAGE_DIR, nombre_archivo_s3.replace('/', os.sep))
            os.makedirs(os.path.dirname(ruta_local), exist_ok=True)
            archivo.seek(0)
            archivo.save(ruta_local)
        except Exception as e:
            return jsonify({"mensaje": f"Error al guardar archivo en el servidor: {str(e)}"}), 500

    # 3. Guardar registro en la base de datos conservando nombre original
    nuevo_doc = Documento(
        paciente_id=paciente.id,
        ruta_minio=nombre_archivo_s3,
        nombre_original=nombre_original
    )
    db.session.add(nuevo_doc)
    db.session.commit()

    return jsonify({
        "mensaje": "Documento subido y registrado exitosamente",
        "documento": nuevo_doc.to_dict()
    }), 201

@app.route('/api/documentos/<int:id>/archivo', methods=['GET'])
def descargar_documento(id):
    # Soporta token por header o por query param ?token= para visualización fluida en <iframe>
    token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1].strip()
    elif request.args.get('token'):
        token = request.args.get('token').strip()

    if token:
        try:
            jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except Exception:
            return jsonify({"mensaje": "Token inválido o expirado"}), 401

    doc = Documento.query.get_or_404(id)
    cuerpo_bytes = None
    content_type = None

    try:
        s3_obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=doc.ruta_minio)
        cuerpo_bytes = s3_obj['Body'].read()
        content_type = s3_obj.get('ContentType')
    except Exception as e:
        # Fallback a almacenamiento local si no está en MinIO
        ruta_local = os.path.join(LOCAL_STORAGE_DIR, doc.ruta_minio.replace('/', os.sep))
        if os.path.exists(ruta_local):
            with open(ruta_local, 'rb') as f:
                cuerpo_bytes = f.read()

    if cuerpo_bytes is None:
        return jsonify({"mensaje": "El archivo físico no se encuentra disponible en el servidor de almacenamiento."}), 404

    extension = doc.ruta_minio.rsplit('.', 1)[-1].lower() if '.' in doc.ruta_minio else ''
    mime_map = {
        'pdf': 'application/pdf',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'txt': 'text/plain; charset=utf-8'
    }
    if not content_type:
        content_type = mime_map.get(extension) or mimetypes.guess_type(doc.ruta_minio)[0] or 'application/octet-stream'

    is_view = request.args.get('view') == '1'
    nombre_descarga = doc.nombre_original if doc.nombre_original else doc.ruta_minio.split('/')[-1]

    headers = {
        "Content-Type": content_type,
        "X-Content-Type-Options": "nosniff"
    }
    if is_view:
        headers["Content-Disposition"] = f'inline; filename="{nombre_descarga}"'
    else:
        headers["Content-Disposition"] = f'attachment; filename="{nombre_descarga}"'

    return Response(
        cuerpo_bytes,
        mimetype=content_type,
        headers=headers
    )

@app.route('/api/documentos/<int:id>', methods=['DELETE'])
@token_required
@roles_required('Administrador')
def eliminar_documento(id):
    doc = Documento.query.get_or_404(id)
    try:
        try:
            s3_client.delete_object(Bucket=BUCKET_NAME, Key=doc.ruta_minio)
        except Exception as e:
            pass
        try:
            ruta_local = os.path.join(LOCAL_STORAGE_DIR, doc.ruta_minio.replace('/', os.sep))
            if os.path.exists(ruta_local):
                os.remove(ruta_local)
        except Exception:
            pass

        db.session.delete(doc)
        db.session.commit()
        return jsonify({"mensaje": "Documento eliminado exitosamente", "id": id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"mensaje": f"Error al eliminar documento: {str(e)}"}), 500

# ==========================================
# NOTAS MÉDICAS (ROL: MÉDICO / ADMIN)
# ==========================================
@app.route('/api/pacientes/<int:id>/notas', methods=['GET'])
@token_required
def listar_notas_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    notas = NotaMedica.query.filter_by(paciente_id=id).order_by(NotaMedica.fecha.desc()).all()
    return jsonify([n.to_dict() for n in notas]), 200

@app.route('/api/pacientes/<int:id>/notas', methods=['POST'])
@token_required
@roles_required('Administrador', 'Médico')
def agregar_nota_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    data = request.get_json() or {}
    contenido = data.get('contenido', '').strip()
    medico_nombre = data.get('medico_nombre', data.get('medico', g.current_user.nombres_completos or g.current_user.username)).strip()

    if not contenido:
        return jsonify({"mensaje": "El contenido de la nota médica no puede estar vacío"}), 400

    nueva_nota = NotaMedica(
        paciente_id=id,
        medico_nombre=medico_nombre,
        contenido=contenido
    )
    db.session.add(nueva_nota)
    db.session.commit()
    return jsonify({
        "mensaje": "Nota médica registrada exitosamente",
        "nota": nueva_nota.to_dict()
    }), 201

@app.route('/api/notas/<int:id>', methods=['DELETE'])
@token_required
@roles_required('Administrador', 'Médico')
def eliminar_nota(id):
    nota = NotaMedica.query.get_or_404(id)
    db.session.delete(nota)
    db.session.commit()
    return jsonify({"mensaje": "Nota médica eliminada exitosamente"}), 200

# ==========================================
# SIGNOS VITALES / TRIAJE (ROL: ENFERMERA / ADMIN)
# ==========================================
@app.route('/api/pacientes/<int:id>/signos-vitales', methods=['GET'])
@token_required
def listar_signos_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    signos = SignosVitales.query.filter_by(paciente_id=id).order_by(SignosVitales.fecha.desc()).all()
    return jsonify([s.to_dict() for s in signos]), 200

@app.route('/api/pacientes/<int:id>/signos-vitales', methods=['POST'])
@token_required
@roles_required('Administrador', 'Enfermera')
def agregar_signos_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    data = request.get_json() or {}

    enfermera_nombre = data.get('enfermera_nombre', data.get('enfermera', g.current_user.nombres_completos or g.current_user.username)).strip()
    presion = data.get('presion_arterial', '').strip()
    peso = data.get('peso', '').strip()
    talla = data.get('talla', '').strip()
    temperatura = data.get('temperatura', '').strip()
    frecuencia = data.get('frecuencia_cardiaca', '').strip()
    saturacion = data.get('saturacion_oxigeno', '').strip()
    observaciones = data.get('observaciones', '').strip()

    if not any([presion, peso, talla, temperatura, frecuencia, saturacion, observaciones]):
        return jsonify({"mensaje": "Debe registrar al menos un dato de signo vital o triaje"}), 400

    nuevos_signos = SignosVitales(
        paciente_id=id,
        enfermera_nombre=enfermera_nombre,
        presion_arterial=presion if presion else None,
        peso=peso if peso else None,
        talla=talla if talla else None,
        temperatura=temperatura if temperatura else None,
        frecuencia_cardiaca=frecuencia if frecuencia else None,
        saturacion_oxigeno=saturacion if saturacion else None,
        observaciones=observaciones if observaciones else None
    )
    db.session.add(nuevos_signos)
    db.session.commit()
    return jsonify({
        "mensaje": "Signos vitales registrados exitosamente",
        "signos_vitales": nuevos_signos.to_dict()
    }), 201

@app.route('/api/signos-vitales', methods=['GET'])
@token_required
def listar_todos_signos():
    signos = SignosVitales.query.order_by(SignosVitales.fecha.desc()).limit(50).all()
    return jsonify([s.to_dict() for s in signos]), 200

@app.route('/api/signos-vitales/<int:id>', methods=['DELETE'])
@token_required
@roles_required('Administrador')
def eliminar_signos(id):
    registro = SignosVitales.query.get_or_404(id)
    db.session.delete(registro)
    db.session.commit()
    return jsonify({"mensaje": "Registro de signos vitales eliminado exitosamente"}), 200

# ==========================================
# GESTIÓN DE SOLICITUDES DE ELIMINACIÓN
# ==========================================
@app.route('/api/solicitudes-eliminacion', methods=['GET'])
@token_required
def listar_solicitudes_eliminacion():
    estado_filtro = request.args.get('estado')
    query = SolicitudEliminacion.query
    if estado_filtro:
        query = query.filter_by(estado=estado_filtro)
    solicitudes = query.order_by(SolicitudEliminacion.fecha_solicitud.desc()).all()
    return jsonify([s.to_dict() for s in solicitudes]), 200

@app.route('/api/solicitudes-eliminacion', methods=['POST'])
@token_required
@roles_required('Administrador', 'Médico')
def crear_solicitud_eliminacion():
    data = request.get_json() or {}
    paciente_dni = data.get('paciente_dni', '').strip()
    usuario_nombre = data.get('usuario_nombre', g.current_user.username).strip()
    motivo_categoria = data.get('motivo_categoria', '').strip()
    motivo_detalle = data.get('motivo_detalle', '').strip()
    paciente_id = data.get('paciente_id')
    usuario_rol = data.get('usuario_rol', g.current_user.rol).strip()

    if not paciente_dni or not usuario_nombre or not motivo_categoria:
        return jsonify({"mensaje": "Faltan datos obligatorios (DNI, solicitante o motivo)"}), 400

    nueva_solicitud = SolicitudEliminacion(
        paciente_id=paciente_id,
        paciente_dni=paciente_dni,
        usuario_nombre=usuario_nombre,
        usuario_rol=usuario_rol,
        motivo_categoria=motivo_categoria,
        motivo_detalle=motivo_detalle if motivo_detalle else None,
        estado='Pendiente'
    )
    db.session.add(nueva_solicitud)
    db.session.commit()

    return jsonify({
        "mensaje": "Solicitud de eliminación enviada exitosamente al Administrador",
        "solicitud": nueva_solicitud.to_dict()
    }), 201

@app.route('/api/solicitudes-eliminacion/<int:id>/aprobar', methods=['PUT'])
@token_required
@roles_required('Administrador')
def aprobar_solicitud_eliminacion(id):
    solicitud = SolicitudEliminacion.query.get_or_404(id)
    if solicitud.estado == 'Aprobada':
        return jsonify({"mensaje": "Esta solicitud ya fue aprobada anteriormente"}), 400

    data = request.get_json() or {}
    respuesta_admin = data.get('respuesta_admin', 'Eliminación aprobada por el Administrador').strip()

    if solicitud.paciente_id:
        paciente = Paciente.query.get(solicitud.paciente_id)
        if paciente:
            try:
                for doc in paciente.documentos:
                    try:
                        s3_client.delete_object(Bucket=BUCKET_NAME, Key=doc.ruta_minio)
                    except Exception as e:
                        print(f"Aviso MinIO al borrar ({doc.ruta_minio}): {e}")
                db.session.delete(paciente)
            except Exception as e:
                db.session.rollback()
                return jsonify({"mensaje": f"Error al eliminar datos del paciente: {str(e)}"}), 500

    solicitud.estado = 'Aprobada'
    solicitud.respuesta_admin = respuesta_admin
    solicitud.fecha_resolucion = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "mensaje": f"Solicitud #{id} aprobada. El expediente DNI {solicitud.paciente_dni} ha sido eliminado.",
        "solicitud": solicitud.to_dict()
    }), 200

@app.route('/api/solicitudes-eliminacion/<int:id>/rechazar', methods=['PUT'])
@token_required
@roles_required('Administrador')
def rechazar_solicitud_eliminacion(id):
    solicitud = SolicitudEliminacion.query.get_or_404(id)
    if solicitud.estado != 'Pendiente':
        return jsonify({"mensaje": f"La solicitud ya se encuentra con estado {solicitud.estado}"}), 400

    data = request.get_json() or {}
    respuesta_admin = data.get('respuesta_admin', 'Solicitud desestimada por el Administrador').strip()

    solicitud.estado = 'Rechazada'
    solicitud.respuesta_admin = respuesta_admin
    solicitud.fecha_resolucion = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "mensaje": f"Solicitud #{id} rechazada.",
        "solicitud": solicitud.to_dict()
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)