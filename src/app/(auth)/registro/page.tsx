'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { NivelEducativo, RolUsuario } from '@/lib/types'
import { PasswordInput } from '@/components/ui/password-input'

const NIVELES: NivelEducativo[] = [
  'Inicial', 'Primario', 'Secundario Orientado', 'Secundario Técnico',
  'Educación Especial', 'CENS', 'CEBJA', 'Otro'
]

const ROLES: { value: RolUsuario; label: string; descripcion: string }[] = [
  { value: 'directivo', label: 'Directivo/a', descripcion: 'Director/a, Vicedirector/a o Secretario/a de una escuela' },
  { value: 'supervisor', label: 'Supervisor/a', descripcion: 'Inspector/a Seccional o Regional que atiende varias escuelas' },
]

const INPUT_CLASS = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"

export default function RegistroPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Step 1: Rol
  const [rol, setRol] = useState<RolUsuario>('directivo')

  // Step 2: Datos del espacio de trabajo (adapta segun rol)
  const [nombreTenant, setNombreTenant] = useState('')
  const [cue, setCue] = useState('')
  const [nivel, setNivel] = useState<NivelEducativo>('Primario')
  const [departamento, setDepartamento] = useState('')
  const [localidad, setLocalidad] = useState('')

  // Step 3: Datos del usuario
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')

  const esDirectivo = rol === 'directivo'

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          nombre_completo: nombreCompleto,
          rol,
          tenant: {
            nombre: nombreTenant,
            cue: cue || null,
            nivel,
            departamento: departamento || null,
            localidad: localidad || null,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrarse')
        setLoading(false)
        return
      }

      router.push('/login?mensaje=registro-exitoso')
    } catch {
      setError('Error de conexion. Intente nuevamente.')
      setLoading(false)
    }
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Registro</h1>
            <p className="text-gray-500 mt-2">
              {step === 1 && 'Selecciona tu rol'}
              {step === 2 && (esDirectivo ? 'Datos de la escuela' : 'Datos de la seccion')}
              {step === 3 && 'Tus datos personales'}
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`h-1.5 w-12 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            </div>
          </div>

          <form onSubmit={step === 3 ? handleRegistro : handleNext} className="space-y-4">

            {/* STEP 1: Elegir rol */}
            {step === 1 && (
              <div className="space-y-3">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      rol === r.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rol"
                      value={r.value}
                      checked={rol === r.value}
                      onChange={() => setRol(r.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{r.label}</p>
                      <p className="text-sm text-gray-500">{r.descripcion}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* STEP 2: Datos del espacio de trabajo */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {esDirectivo ? 'Nombre de la escuela *' : 'Nombre de la seccion/zona *'}
                  </label>
                  <input
                    type="text"
                    value={nombreTenant}
                    onChange={(e) => setNombreTenant(e.target.value)}
                    required
                    className={INPUT_CLASS}
                    placeholder={esDirectivo
                      ? 'Ej: Escuela N° 1-001 Patricias Mendocinas'
                      : 'Ej: Seccion 3 - Capital, Zona de Supervision Norte'
                    }
                  />
                </div>

                {esDirectivo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CUE (opcional)
                    </label>
                    <input
                      type="text"
                      value={cue}
                      onChange={(e) => setCue(e.target.value)}
                      className={INPUT_CLASS}
                      placeholder="Codigo Unico de Establecimiento"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {esDirectivo ? 'Nivel de la escuela *' : 'Nivel que supervisa *'}
                  </label>
                  <select
                    value={nivel}
                    onChange={(e) => setNivel(e.target.value as NivelEducativo)}
                    className={INPUT_CLASS}
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
                      className={INPUT_CLASS}
                      placeholder="Ej: Capital"
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
                      className={INPUT_CLASS}
                      placeholder="Ej: Mendoza"
                    />
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: Datos personales */}
            {step === 3 && (
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
                    className={INPUT_CLASS}
                    placeholder="Ej: Maria Lopez"
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
                    className={INPUT_CLASS}
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    required
                    minLength={6}
                    placeholder="Minimo 6 caracteres"
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
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3)}
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
                {step < 3 ? 'Siguiente' : loading ? 'Registrando...' : 'Registrarse'}
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
