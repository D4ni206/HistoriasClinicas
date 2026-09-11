from datetime import datetime
from extensions import db

class Paciente(db.Model):
    __tablename__ = 'paciente'
    id = db.Column(db.Integer, primary_key=True)
    dni = db.Column(db.String(20), unique=True, nullable=False)

class Medico(db.Model):
    __tablename__ = 'medico'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)

class Estado_Paciente(db.Model):
    __tablename__ = 'estado_paciente'
    id = db.Column(db.Integer, primary_key=True)
    nombre_estado = db.Column(db.String(50), unique=True, nullable=False) # Ej: 'Activo', 'Fallecido', 'Inactivo'

class Especialidad(db.Model):
    __tablename__ = 'especialidad'
    id = db.Column(db.Integer, primary_key=True)
    nombre_especialidad = db.Column(db.String(100), unique=True, nullable=False)

class Enfermedad_CIE(db.Model):
    __tablename__ = 'enfermedad_cie'
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False) # Ej: 'E11' para Diabetes
    descripcion = db.Column(db.String(255), nullable=False)

class Usuario(db.Model):
    __tablename__ = 'usuario'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(50), nullable=False) # Ej: 'Administrador', 'Recepcion'

class Documento_Escaneado(db.Model):
    __tablename__ = 'documento_escaneado'
    id = db.Column(db.Integer, primary_key=True)
    ruta_minio = db.Column(db.String(255), nullable=False)
    fecha_subida = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Llaves foráneas que conectan este documento con el resto del sistema
    paciente_id = db.Column(db.Integer, db.ForeignKey('paciente.id'), nullable=False)
    medico_id = db.Column(db.Integer, db.ForeignKey('medico.id'), nullable=True)
    especialidad_id = db.Column(db.Integer, db.ForeignKey('especialidad.id'), nullable=True)
    enfermedad_id = db.Column(db.Integer, db.ForeignKey('enfermedad_cie.id'), nullable=True)

class Auditoria(db.Model):
    __tablename__ = 'auditoria'
    id = db.Column(db.Integer, primary_key=True)
    accion = db.Column(db.String(255), nullable=False) # Ej: 'Subida de documento', 'Lectura de PDF'
    fecha_hora = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Llaves foráneas para saber quién hizo qué
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    documento_id = db.Column(db.Integer, db.ForeignKey('documento_escaneado.id'), nullable=True)