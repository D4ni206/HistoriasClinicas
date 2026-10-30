import logging
from sqlalchemy import inspect, text

logger = logging.getLogger('medix.migrations')

def ejecutar_migraciones(db):
    """
    Ejecuta migraciones automáticas e idempotentes para la base de datos SQL Server.
    Verifica las columnas existentes y añade los nuevos campos sin alterar datos existentes.
    """
    try:
        engine = db.engine
        inspector = inspect(engine)
        tablas_existentes = inspector.get_table_names()

        # 1. Migraciones para tabla 'paciente'
        if 'paciente' in tablas_existentes or 'PACIENTE' in tablas_existentes:
            nombre_tabla = 'paciente' if 'paciente' in tablas_existentes else 'PACIENTE'
            columnas_paciente = [c['name'].lower() for c in inspector.get_columns(nombre_tabla)]
            
            with engine.connect() as conn:
                if 'nombre' not in columnas_paciente:
                    logger.info("Agregando columna 'nombre' a la tabla 'paciente'...")
                    conn.execute(text("ALTER TABLE paciente ADD nombre VARCHAR(150) NULL"))
                    conn.commit()
                    print("[MIGRACIÓN] Columna 'nombre' agregada a tabla 'paciente'.")

                if 'alergias' not in columnas_paciente:
                    logger.info("Agregando columna 'alergias' a la tabla 'paciente'...")
                    conn.execute(text("ALTER TABLE paciente ADD alergias VARCHAR(255) NULL"))
                    conn.commit()
                    print("[MIGRACIÓN] Columna 'alergias' agregada a tabla 'paciente'.")

        # 2. Migraciones para tabla 'documento_escaneado'
        if 'documento_escaneado' in tablas_existentes or 'DOCUMENTO_ESCANEADO' in tablas_existentes:
            nombre_tabla = 'documento_escaneado' if 'documento_escaneado' in tablas_existentes else 'DOCUMENTO_ESCANEADO'
            columnas_doc = [c['name'].lower() for c in inspector.get_columns(nombre_tabla)]

            with engine.connect() as conn:
                if 'nombre_original' not in columnas_doc:
                    logger.info("Agregando columna 'nombre_original' a la tabla 'documento_escaneado'...")
                    conn.execute(text("ALTER TABLE documento_escaneado ADD nombre_original VARCHAR(255) NULL"))
                    conn.commit()
                    print("[MIGRACIÓN] Columna 'nombre_original' agregada a tabla 'documento_escaneado'.")

        print("[MIGRACIÓN] Verificación de esquema completada exitosamente.")
    except Exception as e:
        print(f"[MIGRACIÓN AVISO] No se pudo ejecutar la auto-migración: {e}")
