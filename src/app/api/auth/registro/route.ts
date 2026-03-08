import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password, nombre_completo, rol, tenant } = body

  if (!email || !password || !nombre_completo || !rol || !tenant?.nombre || !tenant?.nivel) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  // Usar service role para crear tenant y usuario (bypass RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Crear tenant
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      nombre: tenant.nombre,
      cue: tenant.cue || null,
      nivel: tenant.nivel,
      departamento: tenant.departamento || null,
      localidad: tenant.localidad || null,
    })
    .select('id')
    .single()

  if (tenantError) {
    console.error('Error creating tenant:', tenantError)
    return NextResponse.json({ error: 'Error al crear el espacio de trabajo' }, { status: 500 })
  }

  // 2. Crear usuario con metadata (el trigger creara el profile)
  const { error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nombre_completo,
      tenant_id: tenantData.id,
      rol,
    },
  })

  if (signUpError) {
    // Rollback: borrar tenant si falla el usuario
    await supabase.from('tenants').delete().eq('id', tenantData.id)
    console.error('Error creating user:', signUpError)
    return NextResponse.json({ error: signUpError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
