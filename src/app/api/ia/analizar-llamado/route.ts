import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analizarLlamado } from '@/lib/openai/client'
import type { DatosLlamadoForm } from '@/lib/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const datos: DatosLlamadoForm = await request.json()

  try {
    const resultado = await analizarLlamado(datos)
    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Error al analizar llamado:', error)
    return NextResponse.json(
      { error: 'Error al procesar el analisis' },
      { status: 500 }
    )
  }
}
