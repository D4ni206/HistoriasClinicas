from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import boto3
import os
import uuid

app = Flask(__name__)
CORS(app) # Permite que React (puerto 5173) se comunique con Flask (puerto 5000)

# Configuración de PostgreSQL (Reemplaza 'tu_contraseña' por la de pgAdmin)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/medix_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Configuración de MinIO
s3_client = boto3.client('s3',
    endpoint_url=os.getenv('MINIO_ENDPOINT', 'http://localhost:9000'),
    aws_access_key_id=os.getenv('MINIO_ACCESS_KEY', 'minioadmin'),
    aws_secret_access_key=os.getenv('MINIO_SECRET_KEY', 'minioadmin')
)
BUCKET_NAME = 'historias-clinicas'

# Modelos de Base de Datos
class Paciente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dni = db.Column(db.String(20), unique=True, nullable=False)

class Documento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('paciente.id'), nullable=False)
    ruta_minio = db.Column(db.String(255), nullable=False)

# Crear tablas si no existen (ejecutar esto una vez)
with app.app_context():
    db.create_all()

@app.route('/api/documentos', methods=['POST'])
def subir_documento():
    dni_paciente = request.form.get('dni')
    archivo = request.files.get('archivo')

    if not dni_paciente or not archivo:
        return jsonify({"mensaje": "Faltan datos (DNI o archivo)"}), 400

    # 1. Buscar o crear el paciente en PostgreSQL
    paciente = Paciente.query.filter_by(dni=dni_paciente).first()
    if not paciente:
        paciente = Paciente(dni=dni_paciente)
        db.session.add(paciente)
        db.session.commit()

    # 2. Generar un nombre único y subir a MinIO
    extension = archivo.filename.split('.')[-1]
    nombre_archivo_s3 = f"{dni_paciente}/{uuid.uuid4().hex}.{extension}"
    
    try:
        s3_client.upload_fileobj(archivo, BUCKET_NAME, nombre_archivo_s3)
    except Exception as e:
        return jsonify({"mensaje": "Error al subir a MinIO"}), 500

    # 3. Guardar la ruta del archivo en PostgreSQL
    nuevo_doc = Documento(paciente_id=paciente.id, ruta_minio=nombre_archivo_s3)
    db.session.add(nuevo_doc)
    db.session.commit()

    return jsonify({"mensaje": "Documento subido y registrado exitosamente", "ruta": nombre_archivo_s3}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)