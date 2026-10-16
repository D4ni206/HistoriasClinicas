import { useTheme } from '../context/ThemeContext'

export default function ConfiguracionView({
  diagnostico,
  cargandoDiagnostico,
  cargarDiagnostico,
  pacientes,
  totalArchivosSistema,
  usuario
}) {
  const { theme, temaOscuro } = useTheme()

  return (
    <div style={{ maxWidth: '980px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: theme.textMain, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Configuración y Diagnóstico del Sistema
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: theme.textMuted }}>
            Monitoreo en tiempo real de servicios, base de datos SQL Server y repositorio S3 MinIO.
          </p>
        </div>

        <button
          onClick={cargarDiagnostico}
          disabled={cargandoDiagnostico}
          style={{
            padding: '8px 16px',
            backgroundColor: theme.secondaryBtnBg,
            border: theme.secondaryBtnBorder,
            borderRadius: '8px',
            color: theme.secondaryBtnColor,
            fontSize: '12.5px',
            fontWeight: '600',
            cursor: cargandoDiagnostico ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            if (!cargandoDiagnostico) {
              e.currentTarget.style.backgroundColor = temaOscuro ? '#334155' : '#f8fafc'
              e.currentTarget.style.color = theme.textMain
            }
          }}
          onMouseLeave={(e) => {
            if (!cargandoDiagnostico) {
              e.currentTarget.style.backgroundColor = theme.secondaryBtnBg
              e.currentTarget.style.color = theme.secondaryBtnColor
            }
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>{cargandoDiagnostico ? 'Verificando...' : 'Recomprobar Conexiones'}</span>
        </button>
      </div>

      {/* Cuadrícula de Diagnósticos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        {/* Tarjeta 1: Base de Datos SQL Server */}
        <div style={{
          backgroundColor: theme.bgCard,
          border: theme.border,
          borderRadius: '16px',
          padding: '22px',
          boxShadow: theme.shadowCard
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: theme.textMain, margin: 0 }}>
              Base de Datos SQL Server
            </h3>
            <span style={{
              padding: '3px 9px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor: diagnostico?.base_datos?.estado === 'conectado'
                ? (temaOscuro ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4')
                : (temaOscuro ? 'rgba(244, 63, 94, 0.15)' : '#fff1f2'),
              color: diagnostico?.base_datos?.estado === 'conectado'
                ? (temaOscuro ? '#6ee7b7' : '#166534')
                : (temaOscuro ? '#fda4af' : '#9f1239'),
              border: diagnostico?.base_datos?.estado === 'conectado'
                ? (temaOscuro ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0')
                : (temaOscuro ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid #fecdd3')
            }}>
              {diagnostico?.base_datos?.estado === 'conectado' ? 'Operativo' : 'Verificar'}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: theme.textSecondary, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><strong style={{ color: theme.textMain }}>Motor:</strong> Microsoft SQL Server</div>
            <div><strong style={{ color: theme.textMain }}>Carpetas registradas:</strong> {diagnostico?.base_datos?.total_pacientes ?? pacientes.length}</div>
            <div><strong style={{ color: theme.textMain }}>Documentos indexados:</strong> {diagnostico?.base_datos?.total_documentos ?? totalArchivosSistema}</div>
            <div><strong style={{ color: theme.textMain }}>Tablas principales:</strong> Paciente, Documento_Escaneado, Usuario</div>
          </div>
        </div>

        {/* Tarjeta 2: Almacenamiento MinIO S3 */}
        <div style={{
          backgroundColor: theme.bgCard,
          border: theme.border,
          borderRadius: '16px',
          padding: '22px',
          boxShadow: theme.shadowCard
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: theme.textMain, margin: 0 }}>
              Almacenamiento S3 MinIO
            </h3>
            <span style={{
              padding: '3px 9px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor: diagnostico?.almacenamiento?.estado === 'conectado'
                ? (temaOscuro ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4')
                : (temaOscuro ? 'rgba(244, 63, 94, 0.15)' : '#fff1f2'),
              color: diagnostico?.almacenamiento?.estado === 'conectado'
                ? (temaOscuro ? '#6ee7b7' : '#166534')
                : (temaOscuro ? '#fda4af' : '#9f1239'),
              border: diagnostico?.almacenamiento?.estado === 'conectado'
                ? (temaOscuro ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0')
                : (temaOscuro ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid #fecdd3')
            }}>
              {diagnostico?.almacenamiento?.estado === 'conectado' ? 'Operativo' : 'Verificar'}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: theme.textSecondary, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><strong style={{ color: theme.textMain }}>Tipo:</strong> MinIO Object Storage (API S3)</div>
            <div><strong style={{ color: theme.textMain }}>Bucket activo:</strong> <code style={{ backgroundColor: theme.bgSubtle, color: theme.textMain, padding: '2px 6px', borderRadius: '4px', border: theme.border }}>historias-clinicas</code></div>
            <div><strong style={{ color: theme.textMain }}>Disponibilidad de Bucket:</strong> {diagnostico?.almacenamiento?.bucket_disponible ? 'Confirmado' : 'Conectado'}</div>
            <div><strong style={{ color: theme.textMain }}>Puerto del servicio:</strong> 9000 (Consola: 9001)</div>
          </div>
        </div>

        {/* Tarjeta 3: Parámetros del Hospital */}
        <div style={{
          backgroundColor: theme.bgCard,
          border: theme.border,
          borderRadius: '16px',
          padding: '22px',
          boxShadow: theme.shadowCard
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: theme.textMain, margin: 0 }}>
              Entidad Hospitalaria
            </h3>
            <span style={{
              padding: '3px 9px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor: temaOscuro ? 'rgba(56, 189, 248, 0.15)' : '#f0f9ff',
              color: temaOscuro ? '#7dd3fc' : '#0369a1',
              border: temaOscuro ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #bae6fd'
            }}>
              Pisco, Ica
            </span>
          </div>
          <div style={{ fontSize: '13px', color: theme.textSecondary, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><strong style={{ color: theme.textMain }}>Hospital:</strong> Hospital San Juan de Dios de Pisco</div>
            <div><strong style={{ color: theme.textMain }}>Unidad Ejecutora:</strong> UE-404 Salud Pisco</div>
            <div><strong style={{ color: theme.textMain }}>Módulo:</strong> Banco de Historias Clínicas</div>
            <div><strong style={{ color: theme.textMain }}>Modo de Pantalla:</strong> Responsive Adaptativo</div>
          </div>
        </div>

        {/* Tarjeta 4: Seguridad y Soporte TI */}
        <div style={{
          backgroundColor: theme.bgCard,
          border: theme.border,
          borderRadius: '16px',
          padding: '22px',
          boxShadow: theme.shadowCard
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: theme.textMain, margin: 0 }}>
              Seguridad y Soporte
            </h3>
            <span style={{
              padding: '3px 9px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor: temaOscuro ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
              color: temaOscuro ? '#38bdf8' : '#0284c7',
              border: temaOscuro ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #bae6fd'
            }}>
              Activo
            </span>
          </div>
          <div style={{ fontSize: '13px', color: theme.textSecondary, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><strong style={{ color: theme.textMain }}>Sesión en uso:</strong> {usuario?.username || 'admin'} ({usuario?.rol || 'Personal'})</div>
            <div><strong style={{ color: theme.textMain }}>Cifrado:</strong> Contraseñas con hash seguro Werkzeug</div>
            <div><strong style={{ color: theme.textMain }}>Anexo Soporte TI:</strong> 404</div>
            <div><strong style={{ color: theme.textMain }}>Contacto:</strong> soporte@hospitalsanjuandediospisco.gob.pe</div>
          </div>
        </div>
      </div>
    </div>
  )
}

