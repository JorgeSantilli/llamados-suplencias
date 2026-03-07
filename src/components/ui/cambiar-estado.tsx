'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { EstadoLlamado } from '@/lib/types'

const TRANSITIONS: Record<EstadoLlamado, EstadoLlamado[]> = {
  borrador: ['validado'],
  validado: ['publicado', 'cancelado'],
  publicado: ['cancelado'],
  cancelado: [],
}

const BUTTON_STYLES: Record<EstadoLlamado, string> = {
  borrador: 'bg-gray-600 hover:bg-gray-700',
  validado: 'bg-green-600 hover:bg-green-700',
  publicado: 'bg-blue-600 hover:bg-blue-700',
  cancelado: 'bg-red-600 hover:bg-red-700',
}

export function CambiarEstado({ llamadoId, estadoActual }: { llamadoId: string; estadoActual: EstadoLlamado }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const nextStates = TRANSITIONS[estadoActual]

  async function cambiar(nuevoEstado: EstadoLlamado) {
    setLoading(true)
    await supabase
      .from('llamados')
      .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
      .eq('id', llamadoId)

    router.refresh()
    setLoading(false)
  }

  if (nextStates.length === 0) return null

  return (
    <div className="flex gap-2">
      {nextStates.map((estado) => (
        <button
          key={estado}
          onClick={() => cambiar(estado)}
          disabled={loading}
          className={`text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${BUTTON_STYLES[estado]}`}
        >
          Marcar como {estado}
        </button>
      ))}
    </div>
  )
}
