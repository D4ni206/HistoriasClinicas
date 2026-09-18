import DocxViewer from './DocxViewer'
import TextViewer from './TextViewer'
import { esPdf, esDocx, esImagen, esTexto, obtenerIconoArchivo } from '../utils/fileHelpers'
import { API_BASE } from '../api/config'

export default function VisorLateral({ documentoEnVista, onCerrar }) {
  if (!documentoEnVista) return null

  return (
    <aside style={{
      width: '50%',
      minWidth: '460px',
      maxWidth: '780px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderLeft: '2px solid #7FD6FF',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-6px 0 25px rgba(43, 74, 102, 0.18)',
      zIndex: 30,
      boxSizing: 'border-box'
    }}>
      {/* Cabecera del Panel Derecho */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '2px solid #7FD6FF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF6FB',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {obtenerIconoArchivo(documentoEnVista.nombre_archivo)}
            <h3 style={{
              margin: 0,
              fontSize: '15px',
              color: '#2B4A66',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '320px'
            }} title={documentoEnVista.nombre_archivo}>
              {documentoEnVista.nombre_archivo}
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            Carpeta DNI: <strong style={{ color: '#0a5438', backgroundColor: '#6FE3B4', padding: '1px 7px', borderRadius: '4px', border: '1px solid #4cc799' }}>{documentoEnVista.paciente_dni || 'Sin DNI'}</strong> | {documentoEnVista.fecha_subida || '—'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a
            href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
            style={{
              padding: '6px 12px',
              backgroundColor: '#7FD6FF',
              color: '#104060',
              border: '1px solid #54bde8',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: '700'
            }}
            title="Descargar archivo físico"
          >
            Descargar
          </a>
          <button
            onClick={onCerrar}
            style={{
              padding: '6px 12px',
              backgroundColor: '#FFD6E8',
              color: '#802048',
              border: '1px solid #f4a7c7',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Cerrar panel visor"
          >
            Cerrar ✕
          </button>
        </div>
      </div>

      {/* Contenedor del Visor */}
      <div style={{
        flex: 1,
        backgroundColor: '#1e293b',
        padding: '12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        {esPdf(documentoEnVista.nombre_archivo) ? (
          <iframe
            src={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`}
            title={`Visor PDF - ${documentoEnVista.nombre_archivo}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#ffffff'
            }}
          />
        ) : esDocx(documentoEnVista.nombre_archivo) ? (
          <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <DocxViewer url={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`} />
          </div>
        ) : esImagen(documentoEnVista.nombre_archivo) ? (
          <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
            <img
              src={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`}
              alt="Vista previa de documento"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '6px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}
            />
          </div>
        ) : esTexto(documentoEnVista.nombre_archivo) ? (
          <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <TextViewer url={`${API_BASE}/documentos/${documentoEnVista.id}/archivo?view=1`} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#f3f4f6', padding: '30px' }}>
            <p style={{ fontSize: '15px', marginBottom: '12px' }}>
              Este tipo de archivo no admite previsualización directa en el navegador.
            </p>
            <a
              href={`${API_BASE}/documentos/${documentoEnVista.id}/archivo`}
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#7FD6FF',
                color: '#104060',
                border: '1px solid #54bde8',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '13px'
              }}
            >
              Descargar archivo
            </a>
          </div>
        )}
      </div>
    </aside>
  )
}
