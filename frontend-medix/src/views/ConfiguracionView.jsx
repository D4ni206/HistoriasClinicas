export default function ConfiguracionView({
  diagnostico,
  cargandoDiagnostico,
  cargarDiagnostico,
  pacientes,
  totalArchivosSistema,
  usuario
}) {
  return (
    <div style={{ maxWidth: '960px', width: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#2B4A66', margin: '0 0 6px 0' }}>
            Configuración y Diagnóstico del Sistema
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Monitoreo de estado de servicios, base de datos SQL Server y almacenamiento S3 MinIO.
          </p>
        </div>

        <button
          onClick={cargarDiagnostico}
          disabled={cargandoDiagnostico}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6FE3B4',
            color: '#0a5438',
            border: '1px solid #4cc799',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: cargandoDiagnostico ? 'not-allowed' : 'pointer'
          }}
        >
          {cargandoDiagnostico ? 'Verificando...' : 'Recomprobar Conexiones'}
        </button>
      </div>

      {/* Cuadrícula de Diagnósticos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Tarjeta 1: Base de Datos SQL Server */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #7FD6FF',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(127, 214, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#104060', margin: 0 }}>
              Base de Datos SQL Server
            </h3>
            <span style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor: diagnostico?.base_datos?.estado === 'conectado' ? '#6FE3B4' : '#FFD6E8',
              color: diagnostico?.base_datos?.estado === 'conectado' ? '#0a5438' : '#802048',
              border: `1px solid ${diagnostico?.base_datos?.estado === 'conectado' ? '#4cc799' : '#f4a7c7'}`
            }}>
              {diagnostico?.base_datos?.estado === 'conectado' ? 'Operativo' : 'Verificar'}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><strong>Motor:</strong> Microsoft SQL Server</div>
            <div><strong>Carpetas registradas:</strong> {diagnostico?.base_datos?.total_pacientes ?? pacientes.length}</div>
            <div><strong>Documentos indexados:</strong> {diagnostico?.base_datos?.total_documentos ?? totalArchivosSistema}</div>
            <div><strong>Tablas principales:</strong> Paciente, Documento_Escaneado, Usuario</div>
          </div>
        </div>

        {/* Tarjeta 2: Almacenamiento MinIO S3 */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #6FE3B4',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(111, 227, 180, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0a5438', margin: 0 }}>
              Almacenamiento S3 MinIO
            </h3>
            <span style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor: diagnostico?.almacenamiento?.estado === 'conectado' ? '#6FE3B4' : '#FFD6E8',
              color: diagnostico?.almacenamiento?.estado === 'conectado' ? '#0a5438' : '#802048',
              border: `1px solid ${diagnostico?.almacenamiento?.estado === 'conectado' ? '#4cc799' : '#f4a7c7'}`
            }}>
              {diagnostico?.almacenamiento?.estado === 'conectado' ? 'Operativo' : 'Verificar'}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><strong>Tipo:</strong> MinIO Object Storage (API S3)</div>
            <div><strong>Bucket activo:</strong> <code style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>historias-clinicas</code></div>
            <div><strong>Disponibilidad de Bucket:</strong> {diagnostico?.almacenamiento?.bucket_disponible ? 'Confirmado' : 'Conectado'}</div>
            <div><strong>Puerto del servicio:</strong> 9000 (Consola: 9001)</div>
          </div>
        </div>

        {/* Tarjeta 3: Parámetros del Hospital */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #7FD6FF',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(127, 214, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#2B4A66', margin: 0 }}>
              Entidad Hospitalaria
            </h3>
            <span style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor: '#FFF6FB',
              color: '#2B4A66',
              border: '1px solid #e2c5d5'
            }}>
              Pisco, Ica
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><strong>Hospital:</strong> Hospital San Juan de Dios de Pisco</div>
            <div><strong>Unidad Ejecutora:</strong> UE-404 Salud Pisco</div>
            <div><strong>Módulo:</strong> Banco de Historias Clínicas</div>
            <div><strong>Modo de Pantalla:</strong> Fija (100vw x 100vh)</div>
          </div>
        </div>

        {/* Tarjeta 4: Seguridad y Soporte TI */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #f4a7c7',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 3px 10px rgba(244, 167, 199, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#802048', margin: 0 }}>
              Seguridad y Soporte
            </h3>
            <span style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor: '#FFD6E8',
              color: '#802048',
              border: '1px solid #f4a7c7'
            }}>
              Activo
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><strong>Sesión en uso:</strong> {usuario?.username || 'admin'} ({usuario?.rol || 'Personal'})</div>
            <div><strong>Cifrado:</strong> Contraseñas con hash seguro Werkzeug</div>
            <div><strong>Anexo Soporte TI:</strong> 404</div>
            <div><strong>Contacto:</strong> soporte@hospitalsanjuandediospisco.gob.pe</div>
          </div>
        </div>
      </div>
    </div>
  )
}
