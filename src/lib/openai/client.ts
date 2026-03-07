import OpenAI from 'openai'
import { SYSTEM_PROMPT } from './prompts'
import { ANALISIS_LLAMADO_SCHEMA } from './schemas'
import type { DatosLlamadoForm, AnalisisIA, ResultadoAnalisis } from '../types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function analizarLlamado(datos: DatosLlamadoForm): Promise<ResultadoAnalisis> {
  const userMessage = `Un directivo esta confeccionando el siguiente llamado a suplencia. Valida que este correctamente planteado segun la Resolucion 456/2026 y completa toda la informacion normativa necesaria:

DATOS DEL LLAMADO:
- Tipo de cargo: ${datos.tipo_cargo}
- Cargo: ${datos.cargo_nombre}
- Causa de la suplencia: ${datos.causa_suplencia}
- Instancia de llamado: ${datos.instancia_llamado}° llamado
- Nivel educativo: ${datos.nivel}
- Modalidad: ${datos.modalidad}
${datos.turno ? `- Turno: ${datos.turno}` : ''}
${datos.horas_catedra ? `- Horas catedra: ${datos.horas_catedra}` : ''}
${datos.materia ? `- Materia: ${datos.materia}` : ''}
${datos.curso ? `- Curso: ${datos.curso}` : ''}
${datos.articulo ? `- Articulo: ${datos.articulo}` : ''}
${datos.duracion_estimada ? `- Duracion estimada: ${datos.duracion_estimada}` : ''}
${datos.contexto_adicional ? `- Contexto adicional: ${datos.contexto_adicional}` : ''}

Tu tarea:
1. VALIDAR si el llamado esta correctamente planteado segun la normativa
2. Si hay problemas, indicar cuales son y como corregirlos
3. Determinar que ANEXO se aplica
4. Establecer el ORDEN EXACTO DE PRIORIDADES para esta instancia y tipo de cargo
5. Listar los REQUISITOS OBLIGATORIOS de los aspirantes
6. Listar la DOCUMENTACION que se debe exigir a los postulantes
7. Indicar CONDICIONES ESPECIALES (plazos de 24hs para publicar, 48hs para toma de posesion, etc.)
8. Establecer los CRITERIOS DE DESEMPATE en orden
9. Listar CAUSALES DE FINALIZACION de la suplencia
10. Incluir ADVERTENCIAS sobre inhabilitaciones y plazos criticos`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    max_tokens: 4000,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: ANALISIS_LLAMADO_SCHEMA
    }
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('La IA no genero respuesta')

  return {
    analisis: JSON.parse(content) as AnalisisIA,
    usage: response.usage ? {
      prompt_tokens: response.usage.prompt_tokens,
      completion_tokens: response.usage.completion_tokens,
      total_tokens: response.usage.total_tokens
    } : undefined,
    model: response.model
  }
}
