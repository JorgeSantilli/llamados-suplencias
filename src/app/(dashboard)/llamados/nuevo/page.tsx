'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LlamadoForm } from '@/components/forms/llamado-form'
import type { DatosLlamadoForm, ResultadoAnalisis } from '@/lib/types'

export default function NuevoLlamadoPage() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSave(datos: DatosLlamadoForm, resultado: ResultadoAnalisis) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile) throw new Error('Perfil no encontrado')

    const { error } = await supabase.from('llamados').insert({
      tenant_id: profile.tenant_id,
      created_by: user.id,
      tipo_cargo: datos.tipo_cargo,
      cargo_nombre: datos.cargo_nombre,
      causa_suplencia: datos.causa_suplencia,
      instancia_llamado: datos.instancia_llamado,
      modalidad: datos.modalidad,
      turno: datos.turno || null,
      horas_catedra: datos.horas_catedra || null,
      materia: datos.materia || null,
      curso: datos.curso || null,
      articulo: datos.articulo || null,
      duracion_estimada: datos.duracion_estimada || null,
      ia_prioridades: resultado.analisis.orden_prioridades,
      ia_requisitos: resultado.analisis.requisitos_aspirantes,
      ia_condiciones: resultado.analisis.condiciones_especiales,
      ia_documentacion: resultado.analisis.documentacion_requerida,
      ia_observaciones: resultado.analisis.advertencias.join('\n'),
      ia_anexo_aplicable: resultado.analisis.anexo_aplicable,
      ia_raw_response: resultado.analisis,
      estado: resultado.analisis.llamado_valido ? 'validado' : 'borrador',
    })

    if (error) throw error

    router.push('/llamados')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Llamado</h1>
        <p className="text-gray-500 mt-1">
          Completa los datos y la IA validara el llamado segun la Res. 456/2026
        </p>
      </div>
      <LlamadoForm onSave={handleSave} />
    </div>
  )
}
