from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import Paciente, Documento_Escaneado as Documento, Usuario, NotaMedica, SignosVitales, SolicitudEliminacion
import boto3
import os
import uuid
import mimetypes

load_dotenv()

app = Flask(__name__)
CORS(app) # Permite que React (puerto 5173) se comunique con Flask (puerto 5000)

# Configuración de Base de Datos (SQL Server)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'mssql+pyodbc://@MONIT-02/General?driver=SQL+Server+Native+Client+11.0&trusted_connection=yes'
)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        print(f"Aviso al inicializar tablas: {e}")

# Configuración de MinIO
s3_client = boto3.client('s3',
    endpoint_url=os.getenv('MINIO_ENDPOINT', 'http://localhost:9000'),
    aws_access_key_id=os.getenv('MINIO_ACCESS_KEY', 'minioadmin'),
    aws_secret_access_key=os.getenv('MINIO_SECRET_KEY', 'minioadmin')
)
BUCKET_NAME = 'historias-clinicas'

def asegurar_bucket():
    try:
        buckets = [b['Name'] for b in s3_client.list_buckets().get('Buckets', [])]
        if BUCKET_NAME not in buckets:
            s3_client.create_bucket(Bucket=BUCKET_NAME)
    except Exception as e:
        print(f"Aviso MinIO: {e}")

# Crear tablas si no existen e inicializar usuario admin
with app.app_context():
    db.create_all()
    asegurar_bucket()
    try:
        if Usuario.query.count() == 0:
            admin_inicial = Usuario(
                username='admin',
                password_hash=generate_password_hash('admin123'),
                rol='Administrador'
            )
            db.session.add(admin_inicial)
            db.session.commit()
            print("Usuario admin inicial creado exitosamente (admin / admin123)")
    except Exception as e:
        db.session.rollback()
        print(f"Aviso al inicializar usuario admin: {e}")

# ==========================================
# RUTAS DE DIAGNÓSTICO
# ==========================================
@app.route('/', methods=['GET'])
def inicio():
    return jsonify({
        "estado": "activo",
        "mensaje": "Servidor Backend Medix (CRUD) funcionando correctamente",
        "endpoints": {
            "Pacientes": {
                "GET /api/pacientes": "Listar todos los pacientes",
                "POST /api/pacientes": "Crear nuevo paciente (json: {dni})",
                "GET /api/pacientes/<id>": "Detalle de paciente y sus documentos",
                "PUT /api/pacientes/<id>": "Actualizar paciente (json: {dni})",
                "DELETE /api/pacientes/<id>": "Eliminar paciente y sus archivos"
            },
            "Documentos": {
                "GET /api/documentos": "Listar todos los documentos escaneados",
                "POST /api/documentos": "Subir archivo asociado a un DNI (form-data)",
                "GET /api/documentos/<id>/archivo": "Descargar o visualizar archivo (?view=1)",
                "DELETE /api/documentos/<id>": "Eliminar documento de BD y MinIO"
            }
        }
    })

# ==========================================
# RUTAS DE AUTENTICACIÓN
# ==========================================
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({"mensaje": "Por favor ingresa usuario y contraseña"}), 400

    usuario = Usuario.query.filter_by(username=username).first()

    # Si la tabla quedó vacía por algún motivo, crear el admin al vuelo
    if not usuario and Usuario.query.count() == 0 and username == 'admin' and password == 'admin123':
        usuario = Usuario(
            username='admin',
            password_hash=generate_password_hash('admin123'),
            rol='Administrador'
        )
        db.session.add(usuario)
        db.session.commit()

    if not usuario or not check_password_hash(usuario.password_hash, password):
        return jsonify({"mensaje": "Usuario o contraseña incorrectos"}), 401

    return jsonify({
        "mensaje": f"Bienvenido al sistema, {usuario.username}",
        "usuario": {
            "id": usuario.id,
            "username": usuario.username,
            "rol": usuario.rol
        }
    }), 200

@app.route('/api/auth/me', methods=['GET'])
def usuario_actual():
    return jsonify({
        "sistema": "Medix - Hospital San Juan de Dios de Pisco",
        "estado": "autenticado"
    }), 200

# ==========================================
# GESTIÓN DE USUARIOS
# ==========================================
@app.route('/api/usuarios', methods=['GET'])
def listar_usuarios():
    usuarios = Usuario.query.order_by(Usuario.id.asc()).all()
    return jsonify([u.to_dict() for u in usuarios]), 200

@app.route('/api/usuarios', methods=['POST'])
def crear_usuario():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    rol = data.get('rol', 'Personal').strip()

    if not username or not password:
        return jsonify({"mensaje": "El nombre de usuario y la contraseña son obligatorios"}), 400

    if Usuario.query.filter_by(username=username).first():
        return jsonify({"mensaje": f"El usuario '{username}' ya existe"}), 409

    nuevo_usuario = Usuario(
        username=username,
        password_hash=generate_password_hash(password),
        rol=rol
    )
    db.session.add(nuevo_usuario)
    db.session.commit()
    return jsonify({
        "mensaje": f"Usuario '{username}' creado exitosamente",
        "usuario": nuevo_usuario.to_dict()
    }), 201

@app.route('/api/usuarios/<int:id>', methods=['DELETE'])
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
# CRUD PACIENTES
# ==========================================
@app.route('/api/pacientes', methods=['GET'])
def listar_pacientes():
    pacientes = Paciente.query.order_by(Paciente.id.desc()).all()
    return jsonify([p.to_dict(include_documentos=True) for p in pacientes]), 200

@app.route('/api/pacientes/<int:id>', methods=['GET'])
def obtener_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    return jsonify(paciente.to_dict(include_documentos=True)), 200

@app.route('/api/pacientes', methods=['POST'])
def crear_paciente():
    data = request.get_json() or {}
    dni = data.get('dni', '').strip()
    if not dni:
        return jsonify({"mensaje": "El DNI es obligatorio"}), 400

    if Paciente.query.filter_by(dni=dni).first():
        return jsonify({"mensaje": f"El paciente con DNI {dni} ya existe"}), 409

    nuevo_paciente = Paciente(dni=dni)
    db.session.add(nuevo_paciente)
    db.session.commit()
    return jsonify({
        "mensaje": "Paciente creado exitosamente",
        "paciente": nuevo_paciente.to_dict()
    }), 201

@app.route('/api/pacientes/<int:id>', methods=['PUT'])
def actualizar_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    data = request.get_json() or {}
    nuevo_dni = data.get('dni', '').strip()

    if not nuevo_dni:
        return jsonify({"mensaje": "El nuevo DNI es obligatorio"}), 400

    existente = Paciente.query.filter_by(dni=nuevo_dni).first()
    if existente and existente.id != id:
        return jsonify({"mensaje": f"Ya existe otro paciente con el DNI {nuevo_dni}"}), 409

    paciente.dni = nuevo_dni
    db.session.commit()
    return jsonify({
        "mensaje": "Paciente actualizado exitosamente",
        "paciente": paciente.to_dict()
    }), 200

@app.route('/api/pacientes/<int:id>', methods=['DELETE'])
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
# CRUD DOCUMENTOS
# ==========================================
@app.route('/api/documentos', methods=['GET'])
def listar_documentos():
    documentos = Documento.query.order_by(Documento.fecha_subida.desc()).all()
    return jsonify([d.to_dict() for d in documentos]), 200

@app.route('/api/documentos', methods=['POST'])
def subir_documento():
    dni_paciente = request.form.get('dni', '').strip()
    archivo = request.files.get('archivo')

    if not dni_paciente or not archivo or archivo.filename == '':
        return jsonify({"mensaje": "Faltan datos obligatorios (DNI o archivo)"}), 400

    # 1. Buscar o registrar paciente
    paciente = Paciente.query.filter_by(dni=dni_paciente).first()
    if not paciente:
        paciente = Paciente(dni=dni_paciente)
        db.session.add(paciente)
        db.session.commit()

    # 2. Generar nombre único y subir a MinIO
    extension = archivo.filename.rsplit('.', 1)[-1].lower() if '.' in archivo.filename else 'bin'
    nombre_archivo_s3 = f"{dni_paciente}/{uuid.uuid4().hex}.{extension}"

    try:
        asegurar_bucket()
        content_type = archivo.content_type or mimetypes.guess_type(archivo.filename)[0] or 'application/octet-stream'
        s3_client.upload_fileobj(
            archivo,
            BUCKET_NAME,
            nombre_archivo_s3,
            ExtraArgs={'ContentType': content_type}
        )
    except Exception as e:
        return jsonify({"mensaje": f"Error al subir a MinIO: {str(e)}"}), 500

    # 3. Guardar registro en la base de datos
    nuevo_doc = Documento(paciente_id=paciente.id, ruta_minio=nombre_archivo_s3)
    db.session.add(nuevo_doc)
    db.session.commit()

    return jsonify({
        "mensaje": "Documento subido y registrado exitosamente",
        "documento": nuevo_doc.to_dict()
    }), 201

@app.route('/api/documentos/<int:id>/archivo', methods=['GET'])
def descargar_documento(id):
    doc = Documento.query.get_or_404(id)
    try:
        s3_obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=doc.ruta_minio)

        # Mapeo preciso de tipo MIME según extensión
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
        content_type = mime_map.get(extension)
        if not content_type:
            content_type = s3_obj.get('ContentType') or mimetypes.guess_type(doc.ruta_minio)[0] or 'application/octet-stream'

        is_view = request.args.get('view') == '1'
        nombre_descarga = doc.ruta_minio.split('/')[-1]

        headers = {
            "Content-Type": content_type,
            "X-Content-Type-Options": "nosniff"
        }
        if is_view:
            headers["Content-Disposition"] = f'inline; filename="{nombre_descarga}"'
        else:
            headers["Content-Disposition"] = f'attachment; filename="{nombre_descarga}"'

        return Response(
            s3_obj['Body'].read(),
            mimetype=content_type,
            headers=headers
        )
    except Exception as e:
        return jsonify({"mensaje": f"Error al recuperar archivo de MinIO: {str(e)}"}), 500

@app.route('/api/documentos/<int:id>', methods=['DELETE'])
def eliminar_documento(id):
    doc = Documento.query.get_or_404(id)
    try:
        # 1. Borrar de MinIO
        try:
            s3_client.delete_object(Bucket=BUCKET_NAME, Key=doc.ruta_minio)
        except Exception as e:
            print(f"Aviso al borrar de MinIO: {e}")

        # 2. Borrar de SQL Server
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
def listar_notas_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    notas = NotaMedica.query.filter_by(paciente_id=id).order_by(NotaMedica.fecha.desc()).all()
    return jsonify([n.to_dict() for n in notas]), 200

@app.route('/api/pacientes/<int:id>/notas', methods=['POST'])
def agregar_nota_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    data = request.get_json() or {}
    contenido = data.get('contenido', '').strip()
    medico_nombre = data.get('medico_nombre', data.get('medico', 'Médico Tratante')).strip()

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
def eliminar_nota(id):
    nota = NotaMedica.query.get_or_404(id)
    db.session.delete(nota)
    db.session.commit()
    return jsonify({"mensaje": "Nota médica eliminada exitosamente"}), 200

# ==========================================
# SIGNOS VITALES / TRIAJE (ROL: ENFERMERA / ADMIN)
# ==========================================
@app.route('/api/pacientes/<int:id>/signos-vitales', methods=['GET'])
def listar_signos_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    signos = SignosVitales.query.filter_by(paciente_id=id).order_by(SignosVitales.fecha.desc()).all()
    return jsonify([s.to_dict() for s in signos]), 200

@app.route('/api/pacientes/<int:id>/signos-vitales', methods=['POST'])
def agregar_signos_paciente(id):
    paciente = Paciente.query.get_or_404(id)
    data = request.get_json() or {}
    
    enfermera_nombre = data.get('enfermera_nombre', data.get('enfermera', 'Personal de Enfermería')).strip()
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
def listar_todos_signos():
    signos = SignosVitales.query.order_by(SignosVitales.fecha.desc()).limit(50).all()
    return jsonify([s.to_dict() for s in signos]), 200

@app.route('/api/signos-vitales/<int:id>', methods=['DELETE'])
def eliminar_signos(id):
    registro = SignosVitales.query.get_or_404(id)
    db.session.delete(registro)
    db.session.commit()
    return jsonify({"mensaje": "Registro de signos vitales eliminado exitosamente"}), 200

# ==========================================
# GESTIÓN DE SOLICITUDES DE ELIMINACIÓN
# ==========================================
@app.route('/api/solicitudes-eliminacion', methods=['GET'])
def listar_solicitudes_eliminacion():
    estado_filtro = request.args.get('estado')
    query = SolicitudEliminacion.query
    if estado_filtro:
        query = query.filter_by(estado=estado_filtro)
    solicitudes = query.order_by(SolicitudEliminacion.fecha_solicitud.desc()).all()
    return jsonify([s.to_dict() for s in solicitudes]), 200

@app.route('/api/solicitudes-eliminacion', methods=['POST'])
def crear_solicitud_eliminacion():
    data = request.get_json() or {}
    paciente_dni = data.get('paciente_dni', '').strip()
    usuario_nombre = data.get('usuario_nombre', '').strip()
    motivo_categoria = data.get('motivo_categoria', '').strip()
    motivo_detalle = data.get('motivo_detalle', '').strip()
    paciente_id = data.get('paciente_id')
    usuario_rol = data.get('usuario_rol', 'Médico').strip()

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
def aprobar_solicitud_eliminacion(id):
    solicitud = SolicitudEliminacion.query.get_or_404(id)
    if solicitud.estado == 'Aprobada':
        return jsonify({"mensaje": "Esta solicitud ya fue aprobada anteriormente"}), 400

    data = request.get_json() or {}
    respuesta_admin = data.get('respuesta_admin', 'Eliminación aprobada por el Administrador').strip()

    # Si el paciente aún existe en el sistema, proceder a su eliminación física y de MinIO
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

    from datetime import datetime
    solicitud.estado = 'Aprobada'
    solicitud.respuesta_admin = respuesta_admin
    solicitud.fecha_resolucion = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "mensaje": f"Solicitud #{id} aprobada. El expediente DNI {solicitud.paciente_dni} ha sido eliminado.",
        "solicitud": solicitud.to_dict()
    }), 200

@app.route('/api/solicitudes-eliminacion/<int:id>/rechazar', methods=['PUT'])
def rechazar_solicitud_eliminacion(id):
    solicitud = SolicitudEliminacion.query.get_or_404(id)
    if solicitud.estado != 'Pendiente':
        return jsonify({"mensaje": f"La solicitud ya se encuentra con estado {solicitud.estado}"}), 400

    data = request.get_json() or {}
    respuesta_admin = data.get('respuesta_admin', 'Solicitud desestimada por el Administrador').strip()

    from datetime import datetime
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