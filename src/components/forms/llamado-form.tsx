'use client'

import { useState } from 'react'
import type { DatosLlamadoForm, TipoCargo, CausaSuplencia, NivelEducativo, Modalidad, Turno, ResultadoAnalisis } from '@/lib/types'
import { ResultadoIA } from '@/components/ia/resultado-ia'

const TIPOS_CARGO: { value: TipoCargo; label: string; anexo: string }[] = [
  { value: 'cargo_inicial', label: 'Cargo Inicial del Escalafon', anexo: 'Anexo II' },
  { value: 'materias_especiales', label: 'Profesor/a de Materias Especiales', anexo: 'Anexo III' },
  { value: 'maestro_secretario', label: 'Maestro/a Secretario/a', anexo: 'Anexo IV' },
  { value: 'vicedirector', label: 'Vicedirector/a', anexo: 'Anexo V' },
  { value: 'director_libre', label: 'Director/a Libre', anexo: 'Anexo V' },
  { value: 'director_maestro', label: 'Director/a Maestro', anexo: 'Anexo V' },
  { value: 'inspector_seccional', label: 'Inspector/a Seccional', anexo: 'Anexo V' },
  { value: 'inspector_regional', label: 'Inspector/a Regional', anexo: 'Anexo V' },
]

const CAUSAS: { value: CausaSuplencia; label: string }[] = [
  { value: 'licencia', label: 'Licencia' },
  { value: 'vacante', label: 'Vacante' },
  { value: 'cambio_funciones', label: 'Cambio de funciones' },
  { value: 'traslado', label: 'Traslado' },
  { value: 'otra', label: 'Otra' },
]

const NIVELES: NivelEducativo[] = [
  'Inicial', 'Primario', 'Educación Especial',
  'Secundario Orientado', 'Secundario Técnico', 'CENS', 'CEBJA', 'Otro',
]

const TURNOS: Turno[] = ['Mañana', 'Tarde', 'Vespertino']

interface LlamadoFormProps {
  tenantNivel?: string
  onSave?: (datos: DatosLlamadoForm, analisis: ResultadoAnalisis) => Promise<void>
}

export function LlamadoForm({ tenantNivel, onSave }: LlamadoFormProps) {
  const [datos, setDatos] = useState<DatosLlamadoForm>({
    tipo_cargo: 'cargo_inicial',
    cargo_nombre: '',
    causa_suplencia: 'licencia',
    instancia_llamado: 1,
    nivel: (tenantNivel as NivelEducativo) || 'Primario',
    modalidad: 'presencial',
  })

  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null)
  const [analizando, setAnalizando] = useState(false)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  function updateField<K extends keyof DatosLlamadoForm>(field: K, value: DatosLlamadoForm[K]) {
    setDatos((prev) => ({ ...prev, [field]: value }))
    setResultado(null) // Resetear resultado si cambian datos
  }

  async function handleAnalizar(e: React.FormEvent) {
    e.preventDefault()
    setAnalizando(true)
    setError('')
    setResultado(null)

    try {
      const res = await fetch('/api/ia/analizar-llamado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al analizar')
      }

      const data: ResultadoAnalisis = await res.json()
      setResultado(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setAnalizando(false)
    }
  }

  async function handleGuardar() {
    if (!resultado || !onSave) return
    setGuardando(true)
    try {
      await onSave(datos, resultado)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const needsMateria = datos.tipo_cargo === 'materias_especiales'
  const needsHoras = datos.tipo_cargo === 'materias_especiales'

  return (
    <div className="space-y-8">
      <form onSubmit={handleAnalizar} className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Datos del llamado</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de cargo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de cargo *
            </label>
            <select
              value={datos.tipo_cargo}
              onChange={(e) => updateField('tipo_cargo', e.target.value as TipoCargo)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {TIPOS_CARGO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} ({t.anexo})
                </option>
              ))}
            </select>
          </div>

          {/* Cargo nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del cargo *
            </label>
            <input
              type="text"
              value={datos.cargo_nombre}
              onChange={(e) => updateField('cargo_nombre', e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ej: Maestro de Grado, Preceptor, etc."
            />
          </div>

          {/* Causa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Causa de la suplencia *
            </label>
            <select
              value={datos.causa_suplencia}
              onChange={(e) => updateField('causa_suplencia', e.target.value as CausaSuplencia)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {CAUSAS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Instancia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instancia de llamado *
            </label>
            <select
              value={datos.instancia_llamado}
              onChange={(e) => updateField('instancia_llamado', parseInt(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value={1}>1° Llamado</option>
              <option value={2}>2° Llamado</option>
              <option value={3}>3° Llamado</option>
              <option value={4}>4° Llamado o posterior</option>
            </select>
          </div>

          {/* Nivel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel educativo *
            </label>
            <select
              value={datos.nivel}
              onChange={(e) => updateField('nivel', e.target.value as NivelEducativo)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {NIVELES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Modalidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modalidad *
            </label>
            <select
              value={datos.modalidad}
              onChange={(e) => updateField('modalidad', e.target.value as Modalidad)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>

          {/* Turno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turno
            </label>
            <select
              value={datos.turno || ''}
              onChange={(e) => updateField('turno', (e.target.value || undefined) as Turno | undefined)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Seleccionar...</option>
              {TURNOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Articulo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Articulo (causa de licencia)
            </label>
            <input
              type="text"
              value={datos.articulo || ''}
              onChange={(e) => updateField('articulo', e.target.value || undefined)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ej: 40-0, 50-7, Cargo vacante"
            />
          </div>

          {/* Materia (condicional) */}
          {needsMateria && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materia *
              </label>
              <input
                type="text"
                value={datos.materia || ''}
                onChange={(e) => updateField('materia', e.target.value)}
                required={needsMateria}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ej: Educacion Fisica, Musica, Plastica"
              />
            </div>
          )}

          {/* Horas catedra (condicional) */}
          {needsHoras && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas catedra
              </label>
              <input
                type="number"
                value={datos.horas_catedra || ''}
                onChange={(e) => updateField('horas_catedra', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                min={1}
              />
            </div>
          )}
        </div>

        {/* Contexto adicional */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contexto adicional (opcional)
          </label>
          <textarea
            value={datos.contexto_adicional || ''}
            onChange={(e) => updateField('contexto_adicional', e.target.value || undefined)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            rows={2}
            placeholder="Informacion adicional relevante para el analisis..."
          />
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={analizando || !datos.cargo_nombre}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {analizando ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Analizando con IA...
              </>
            ) : (
              'Validar con IA'
            )}
          </button>

          {resultado && resultado.analisis.llamado_valido && onSave && (
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {guardando ? 'Guardando...' : 'Guardar llamado'}
            </button>
          )}
        </div>
      </form>

      {resultado && <ResultadoIA resultado={resultado} />}
    </div>
  )
}
