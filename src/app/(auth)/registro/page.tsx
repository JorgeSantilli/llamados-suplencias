'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { NivelEducativo } from '@/lib/types'

const NIVELES: NivelEducativo[] = [
  'Inicial', 'Primario', 'Secundario Orientado', 'Secundario Técnico',
  'Educación Especial', 'CENS', 'CEBJA', 'Otro'
]

export default function RegistroPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Step 1: Datos de la institucion
  const [nombreInstitucion, setNombreInstitucion] = useState('')
  const [cue, setCue] = useState('')
  const [nivel, setNivel] = useState<NivelEducativo>('Primario')
  const [departamento, setDepartamento] = useState('')
  const [localidad, setLocalidad] = useState('')

  // Step 2: Datos del usuario
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Primero crear el tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        nombre: nombreInstitucion,
        cue: cue || null,
        nivel,
        departamento: departamento || null,
        localidad: localidad || null,
      })
      .select('id')
      .single()

    if (tenantError) {
      // Si falla por RLS, usar la funcion de registro
      // El tenant se crea via service role en el signup
      setError('Error al crear la institucion. Contacte al administrador.')
      setLoading(false)
      return
    }

    // Registrar el usuario con metadata del tenant
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: nombreCompleto,
          tenant_id: tenant.id,
          rol: 'directivo',
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    router.push('/login?mensaje=registro-exitoso')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Registro</h1>
            <p className="text-gray-500 mt-2">
              {step === 1 ? 'Datos de la institucion' : 'Datos del usuario'}
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <div className={`h-1.5 w-16 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`h-1.5 w-16 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            </div>
          </div>

          <form onSubmit={step === 2 ? handleRegistro : (e) => { e.preventDefault(); setStep(2) }} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la institucion *
                  </label>
                  <input
                    type="text"
                    value={nombreInstitucion}
                    onChange={(e) => setNombreInstitucion(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Ej: Escuela N° 1-001 Patricias Mendocinas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CUE (opcional)
                  </label>
                  <input
                    type="text"
                    value={cue}
                    onChange={(e) => setCue(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Codigo Unico de Establecimiento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel *
                  </label>
                  <select
                    value={nivel}
                    onChange={(e) => setNivel(e.target.value as NivelEducativo)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {NIVELES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Localidad
                    </label>
                    <input
                      type="text"
                      value={localidad}
                      onChange={(e) => setLocalidad(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Atras
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {step === 1 ? 'Siguiente' : loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tenes cuenta?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Ingresa
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
