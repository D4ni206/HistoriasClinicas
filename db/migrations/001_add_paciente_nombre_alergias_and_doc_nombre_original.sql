-- Migración 001: Agregar nombre y alergias a paciente, y nombre_original a documento_escaneado
-- Sistema: Medix - Hospital San Juan de Dios de Pisco
-- Motor: Microsoft SQL Server

-- 1. Agregar columnas a tabla paciente si no existen
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'paciente') AND name = 'nombre'
)
BEGIN
    ALTER TABLE paciente ADD nombre VARCHAR(150) NULL;
    PRINT 'Columna "nombre" agregada exitosamente a la tabla paciente.';
END
ELSE
BEGIN
    PRINT 'Columna "nombre" ya existe en la tabla paciente.';
END;

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'paciente') AND name = 'alergias'
)
BEGIN
    ALTER TABLE paciente ADD alergias VARCHAR(255) NULL;
    PRINT 'Columna "alergias" agregada exitosamente a la tabla paciente.';
END
ELSE
BEGIN
    PRINT 'Columna "alergias" ya existe en la tabla paciente.';
END;

-- 2. Agregar columna nombre_original a tabla documento_escaneado si no existe
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'documento_escaneado') AND name = 'nombre_original'
)
BEGIN
    ALTER TABLE documento_escaneado ADD nombre_original VARCHAR(255) NULL;
    PRINT 'Columna "nombre_original" agregada exitosamente a la tabla documento_escaneado.';
END
ELSE
BEGIN
    PRINT 'Columna "nombre_original" ya existe en la tabla documento_escaneado.';
END;
