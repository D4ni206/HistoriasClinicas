from datetime import datetime
from extensions import db

class Paciente(db.Model):
    __tablename__ = 'paciente'
    id = db.Column(db.Integer, primary_key=True)
    dni = db.Column(db.String(20), unique=True, nullable=False)
    documentos = db.relationship('Documento_Escaneado', backref='paciente', cascade='all, delete-orphan', lazy=True)
    notas_medicas = db.relationship('NotaMedica', backref='paciente', cascade='all, delete-orphan', lazy=True, order_by='desc(NotaMedica.fecha)')
    signos_vitales = db.relationship('SignosVitales', backref='paciente', cascade='all, delete-orphan', lazy=True, order_by='desc(SignosVitales.fecha)')

    def to_dict(self, include_documentos=False, include_detalles=True):
        data = {
            'id': self.id,
            'dni': self.dni,
            'total_documentos': len(self.documentos) if self.documentos else 0,
            'total_notas': len(self.notas_medicas) if self.notas_medicas else 0,
            'total_signos': len(self.signos_vitales) if self.signos_vitales else 0
        }
        if include_documentos:
            data['documentos'] = [d.to_dict() for d in self.documentos]
        if include_detalles:
            data['notas_medicas'] = [n.to_dict() for n in self.notas_medicas] if self.notas_medicas else []
            data['signos_vitales'] = [s.to_dict() for s in self.signos_vitales] if self.signos_vitales else []
        return data

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

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'rol': self.rol
        }

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

    def to_dict(self):
        return {
            'id': self.id,
            'ruta_minio': self.ruta_minio,
            'nombre_archivo': self.ruta_minio.split('/')[-1] if '/' in self.ruta_minio else self.ruta_minio,
            'fecha_subida': self.fecha_subida.strftime('%Y-%m-%d %H:%M:%S') if self.fecha_subida else None,
            'paciente_id': self.paciente_id,
            'paciente_dni': self.paciente.dni if self.paciente else None,
            'medico_id': self.medico_id,
            'especialidad_id': self.especialidad_id,
            'enfermedad_id': self.enfermedad_id
        }

class Auditoria(db.Model):
    __tablename__ = 'auditoria'
    id = db.Column(db.Integer, primary_key=True)
    accion = db.Column(db.String(255), nullable=False) # Ej: 'Subida de documento', 'Lectura de PDF'
    fecha_hora = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Llaves foráneas para saber quién hizo qué
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    documento_id = db.Column(db.Integer, db.ForeignKey('documento_escaneado.id'), nullable=True)

class NotaMedica(db.Model):
    __tablename__ = 'nota_medica'
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('paciente.id'), nullable=False)
    medico_nombre = db.Column(db.String(100), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'paciente_id': self.paciente_id,
            'paciente_dni': self.paciente.dni if self.paciente else None,
            'medico_nombre': self.medico_nombre,
            'contenido': self.contenido,
            'fecha': self.fecha.strftime('%Y-%m-%d %H:%M:%S') if self.fecha else None
        }

class SignosVitales(db.Model):
    __tablename__ = 'signos_vitales'
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('paciente.id'), nullable=False)
    enfermera_nombre = db.Column(db.String(100), nullable=False)
    presion_arterial = db.Column(db.String(50), nullable=True)     # Ej: '120/80 mmHg'
    peso = db.Column(db.String(50), nullable=True)                 # Ej: '70.5 kg'
    talla = db.Column(db.String(50), nullable=True)                # Ej: '165 cm'
    temperatura = db.Column(db.String(50), nullable=True)          # Ej: '36.8 °C'
    frecuencia_cardiaca = db.Column(db.String(50), nullable=True)  # Ej: '72 lpm'
    saturacion_oxigeno = db.Column(db.String(50), nullable=True)   # Ej: '98 %'
    observaciones = db.Column(db.Text, nullable=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'paciente_id': self.paciente_id,
            'paciente_dni': self.paciente.dni if self.paciente else None,
            'enfermera_nombre': self.enfermera_nombre,
            'presion_arterial': self.presion_arterial,
            'peso': self.peso,
            'talla': self.talla,
            'temperatura': self.temperatura,
            'frecuencia_cardiaca': self.frecuencia_cardiaca,
            'saturacion_oxigeno': self.saturacion_oxigeno,
            'observaciones': self.observaciones,
            'fecha': self.fecha.strftime('%Y-%m-%d %H:%M:%S') if self.fecha else None
        }