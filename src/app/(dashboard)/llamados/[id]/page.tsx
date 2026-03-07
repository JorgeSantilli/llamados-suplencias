import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ResultadoIA } from '@/components/ia/resultado-ia'
import { CambiarEstado } from '@/components/ui/cambiar-estado'
import type { Llamado, AnalisisIA } from '@/lib/types'

const TIPO_CARGO_LABEL: Record<string, string> = {
  cargo_inicial: 'Cargo Inicial del Escalafon',
  materias_especiales: 'Profesor/a de Materias Especiales',
  maestro_secretario: 'Maestro/a Secretario/a',
  vicedirector: 'Vicedirector/a',
  director_libre: 'Director/a Libre',
  director_maestro: 'Director/a Maestro',
  inspector_seccional: 'Inspector/a Seccional',
  inspector_regional: 'Inspector/a Regional',
}

const CAUSA_LABEL: Record<string, string> = {
  licencia: 'Licencia',
  vacante: 'Vacante',
  cambio_funciones: 'Cambio de funciones',
  traslado: 'Traslado',
  otra: 'Otra',
}

const ESTADO_BADGE: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-700',
  validado: 'bg-green-100 text-green-700',
  publicado: 'bg-blue-100 text-blue-700',
  cancelado: 'bg-red-100 text-red-700',
}

export default async function DetalleLlamadoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: llamado } = await supabase
    .from('llamados')
    .select('*')
    .eq('id', id)
    .single() as { data: Llamado | null }

  if (!llamado) notFound()

  const tieneAnalisis = llamado.ia_raw_response !== null

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/llamados" className="text-gray-400 hover:text-gray-600">
          &larr; Volver
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{llamado.cargo_nombre}</h1>
          <p className="text-gray-500 mt-1">
            {TIPO_CARGO_LABEL[llamado.tipo_cargo]} &middot; {llamado.instancia_llamado}° llamado
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${ESTADO_BADGE[llamado.estado]}`}>
          {llamado.estado}
        </span>
      </div>

      {/* Datos del llamado */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Datos del llamado</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Tipo de cargo</span>
            <p className="font-medium">{TIPO_CARGO_LABEL[llamado.tipo_cargo]}</p>
          </div>
          <div>
            <span className="text-gray-500">Causa</span>
            <p className="font-medium">{CAUSA_LABEL[llamado.causa_suplencia]}</p>
          </div>
          <div>
            <span className="text-gray-500">Modalidad</span>
            <p className="font-medium capitalize">{llamado.modalidad}</p>
          </div>
          {llamado.turno && (
            <div>
              <span className="text-gray-500">Turno</span>
              <p className="font-medium">{llamado.turno}</p>
            </div>
          )}
          {llamado.articulo && (
            <div>
              <span className="text-gray-500">Articulo</span>
              <p className="font-medium">{llamado.articulo}</p>
            </div>
          )}
          {llamado.materia && (
            <div>
              <span className="text-gray-500">Materia</span>
              <p className="font-medium">{llamado.materia}</p>
            </div>
          )}
          {llamado.horas_catedra && (
            <div>
              <span className="text-gray-500">Horas catedra</span>
              <p className="font-medium">{llamado.horas_catedra}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500">Creado</span>
            <p className="font-medium">
              {new Date(llamado.created_at).toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Cambiar estado */}
      <CambiarEstado llamadoId={llamado.id} estadoActual={llamado.estado} />

      {/* Resultado IA */}
      {tieneAnalisis && (
        <div className="mt-6">
          <h2 className="font-semibold text-gray-900 mb-4">Analisis de la IA</h2>
          <ResultadoIA
            resultado={{
              analisis: llamado.ia_raw_response as AnalisisIA,
              model: 'gpt-4o-mini',
            }}
          />
        </div>
      )}
    </div>
  )
}
