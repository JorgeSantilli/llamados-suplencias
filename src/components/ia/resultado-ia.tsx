'use client'

import { useState } from 'react'
import type { ResultadoAnalisis } from '@/lib/types'

interface ResultadoIAProps {
  resultado: ResultadoAnalisis
}

export function ResultadoIA({ resultado }: ResultadoIAProps) {
  const { analisis } = resultado
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['prioridades', 'requisitos', 'documentacion', 'condiciones'])
  )

  function toggleSection(section: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Banner de validacion */}
      {analisis.llamado_valido ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-green-600 text-xl mt-0.5">&#10003;</span>
          <div>
            <h3 className="font-semibold text-green-800">Llamado valido</h3>
            <p className="text-green-700 text-sm mt-1">
              El llamado cumple con la normativa de la Res. 456/2026. {analisis.anexo_aplicable && `Se aplica: ${analisis.anexo_aplicable}`}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-xl mt-0.5">&#10007;</span>
            <div>
              <h3 className="font-semibold text-red-800">Problemas detectados</h3>
              <p className="text-red-700 text-sm mt-1">
                El llamado tiene inconsistencias con la normativa. Revisa los problemas y corrige antes de continuar.
              </p>
            </div>
          </div>
          {analisis.problemas_detectados.length > 0 && (
            <div className="mt-3 space-y-2 ml-8">
              {analisis.problemas_detectados.map((p, i) => (
                <div key={i} className="bg-white border border-red-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-800">{p.problema}</p>
                  <p className="text-sm text-red-600 mt-1">Sugerencia: {p.sugerencia}</p>
                  <p className="text-xs text-red-400 mt-1 italic">Cita: {p.cita}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Anexo aplicable */}
      {analisis.anexo_aplicable && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800">Anexo aplicable</h3>
          <p className="text-blue-700 text-sm mt-1">{analisis.anexo_aplicable}</p>
        </div>
      )}

      {/* Orden de prioridades */}
      <Section
        title="Orden de prioridades"
        id="prioridades"
        expanded={expandedSections.has('prioridades')}
        onToggle={() => toggleSection('prioridades')}
        count={analisis.orden_prioridades.length}
      >
        <div className="space-y-2">
          {analisis.orden_prioridades.map((p) => (
            <div key={p.orden} className="flex gap-3 items-start">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">
                {p.orden}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">{p.instancia}</p>
                <p className="text-sm text-gray-600">{p.descripcion}</p>
                <p className="text-xs text-gray-400 mt-0.5 italic">{p.cita}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Requisitos */}
      <Section
        title="Requisitos de los aspirantes"
        id="requisitos"
        expanded={expandedSections.has('requisitos')}
        onToggle={() => toggleSection('requisitos')}
        count={analisis.requisitos_aspirantes.length}
      >
        <div className="space-y-2">
          {analisis.requisitos_aspirantes.map((r, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${r.obligatorio ? 'bg-red-500' : 'bg-gray-400'}`} />
              <div>
                <p className="text-sm text-gray-900">
                  {r.requisito}
                  {r.obligatorio && <span className="ml-1 text-red-500 text-xs font-medium">(obligatorio)</span>}
                </p>
                <p className="text-xs text-gray-400 italic">{r.cita}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Documentacion */}
      <Section
        title="Documentacion requerida"
        id="documentacion"
        expanded={expandedSections.has('documentacion')}
        onToggle={() => toggleSection('documentacion')}
        count={analisis.documentacion_requerida.length}
      >
        <div className="space-y-2">
          {analisis.documentacion_requerida.map((d, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">{d.documento}</p>
              <p className="text-sm text-gray-600">{d.detalle}</p>
              <p className="text-xs text-gray-400 mt-1 italic">{d.cita}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Condiciones especiales */}
      <Section
        title="Condiciones especiales"
        id="condiciones"
        expanded={expandedSections.has('condiciones')}
        onToggle={() => toggleSection('condiciones')}
        count={analisis.condiciones_especiales.length}
      >
        <div className="space-y-2">
          {analisis.condiciones_especiales.map((c, i) => (
            <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-sm text-amber-900">{c.condicion}</p>
              <p className="text-xs text-amber-500 mt-1 italic">{c.cita}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Criterios de desempate */}
      <Section
        title="Criterios de desempate"
        id="desempate"
        expanded={expandedSections.has('desempate')}
        onToggle={() => toggleSection('desempate')}
        count={analisis.criterios_desempate.length}
      >
        <ol className="space-y-1">
          {analisis.criterios_desempate.map((c) => (
            <li key={c.orden} className="flex gap-2 text-sm">
              <span className="text-gray-400 shrink-0">{c.orden}.</span>
              <div>
                <span className="text-gray-900">{c.criterio}</span>
                <span className="text-xs text-gray-400 ml-2 italic">{c.cita}</span>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Causales de finalizacion */}
      <Section
        title="Causales de finalizacion"
        id="finalizacion"
        expanded={expandedSections.has('finalizacion')}
        onToggle={() => toggleSection('finalizacion')}
        count={analisis.causales_finalizacion.length}
      >
        <div className="space-y-1">
          {analisis.causales_finalizacion.map((c, i) => (
            <div key={i} className="text-sm">
              <span className="text-gray-900">{c.causal}</span>
              <span className="text-xs text-gray-400 ml-2 italic">{c.cita}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Advertencias */}
      {analisis.advertencias.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-2">Advertencias</h3>
          <ul className="space-y-1">
            {analisis.advertencias.map((a, i) => (
              <li key={i} className="text-sm text-red-700 flex gap-2">
                <span className="shrink-0">!</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Aspectos no cubiertos */}
      {analisis.aspectos_no_cubiertos.length > 0 && (
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Aspectos no cubiertos por la resolucion</h3>
          <ul className="space-y-1">
            {analisis.aspectos_no_cubiertos.map((a, i) => (
              <li key={i} className="text-sm text-gray-600">{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Metadata */}
      {resultado.usage && (
        <p className="text-xs text-gray-400 text-right">
          Modelo: {resultado.model} | Tokens: {resultado.usage.total_tokens}
        </p>
      )}
    </div>
  )
}

function Section({
  title,
  id,
  expanded,
  onToggle,
  count,
  children,
}: {
  title: string
  id: string
  expanded: boolean
  onToggle: () => void
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-semibold text-gray-900 text-sm">
          {title} <span className="text-gray-400 font-normal">({count})</span>
        </h3>
        <span className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          &#9660;
        </span>
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}
