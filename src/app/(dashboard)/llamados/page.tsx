import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Llamado } from '@/lib/types'

const ESTADO_BADGE: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-700',
  validado: 'bg-green-100 text-green-700',
  publicado: 'bg-blue-100 text-blue-700',
  cancelado: 'bg-red-100 text-red-700',
}

const TIPO_CARGO_LABEL: Record<string, string> = {
  cargo_inicial: 'Cargo Inicial',
  materias_especiales: 'Materias Especiales',
  maestro_secretario: 'Maestro/a Secretario/a',
  vicedirector: 'Vicedirector/a',
  director_libre: 'Director/a Libre',
  director_maestro: 'Director/a Maestro',
  inspector_seccional: 'Inspector/a Seccional',
  inspector_regional: 'Inspector/a Regional',
}

export default async function LlamadosPage() {
  const supabase = await createClient()
  const { data: llamados } = await supabase
    .from('llamados')
    .select('*')
    .order('created_at', { ascending: false }) as { data: Llamado[] | null }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Llamados</h1>
          <p className="text-gray-500 mt-1">Gestion de llamados a suplencias</p>
        </div>
        <Link
          href="/llamados/nuevo"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Nuevo Llamado
        </Link>
      </div>

      {!llamados || llamados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            No hay llamados todavia
          </h2>
          <p className="text-gray-500 mb-6">
            Crea tu primer llamado y la IA te ayudara a confeccionarlo correctamente segun la Res. 456/2026.
          </p>
          <Link
            href="/llamados/nuevo"
            className="inline-flex bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Crear primer llamado
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cargo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Instancia</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {llamados.map((llamado) => (
                <tr key={llamado.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {llamado.cargo_nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {TIPO_CARGO_LABEL[llamado.tipo_cargo] || llamado.tipo_cargo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {llamado.instancia_llamado}° llamado
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[llamado.estado]}`}>
                      {llamado.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(llamado.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/llamados/${llamado.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
