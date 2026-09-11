from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
from models import Paciente, Documento_Escaneado as Documento
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

# Crear tablas si no existen
with app.app_context():
    db.create_all()
    asegurar_bucket()

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
        content_type = s3_obj.get('ContentType', 'application/octet-stream')
        if content_type == 'application/octet-stream':
            guess, _ = mimetypes.guess_type(doc.ruta_minio)
            if guess:
                content_type = guess

        disposition = 'inline' if request.args.get('view') == '1' else 'attachment'
        nombre_descarga = doc.ruta_minio.split('/')[-1]

        return Response(
            s3_obj['Body'].read(),
            mimetype=content_type,
            headers={
                "Content-Disposition": f"{disposition}; filename={nombre_descarga}",
                "Content-Type": content_type
            }
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)