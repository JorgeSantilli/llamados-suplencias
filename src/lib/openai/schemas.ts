export const ANALISIS_LLAMADO_SCHEMA = {
  name: "analisis_llamado",
  strict: true,
  schema: {
    type: "object" as const,
    properties: {
      llamado_valido: {
        type: "boolean" as const,
        description: "Si el llamado, tal como esta planteado, cumple con la normativa"
      },
      problemas_detectados: {
        type: "array" as const,
        description: "Problemas o inconsistencias detectadas en el llamado respecto a la normativa.",
        items: {
          type: "object" as const,
          properties: {
            problema: { type: "string" as const },
            sugerencia: { type: "string" as const },
            cita: { type: "string" as const }
          },
          required: ["problema", "sugerencia", "cita"],
          additionalProperties: false
        }
      },
      anexo_aplicable: {
        type: "string" as const,
        description: "Que anexo de la Resolucion 456/2026 se aplica a este tipo de llamado"
      },
      orden_prioridades: {
        type: "array" as const,
        description: "Orden de prioridad para el otorgamiento, de mayor a menor",
        items: {
          type: "object" as const,
          properties: {
            orden: { type: "integer" as const },
            instancia: { type: "string" as const },
            descripcion: { type: "string" as const },
            cita: { type: "string" as const }
          },
          required: ["orden", "instancia", "descripcion", "cita"],
          additionalProperties: false
        }
      },
      requisitos_aspirantes: {
        type: "array" as const,
        description: "Requisitos que deben cumplir los aspirantes",
        items: {
          type: "object" as const,
          properties: {
            requisito: { type: "string" as const },
            obligatorio: { type: "boolean" as const },
            cita: { type: "string" as const }
          },
          required: ["requisito", "obligatorio", "cita"],
          additionalProperties: false
        }
      },
      documentacion_requerida: {
        type: "array" as const,
        description: "Documentacion que debe presentar el postulante",
        items: {
          type: "object" as const,
          properties: {
            documento: { type: "string" as const },
            detalle: { type: "string" as const },
            cita: { type: "string" as const }
          },
          required: ["documento", "detalle", "cita"],
          additionalProperties: false
        }
      },
      condiciones_especiales: {
        type: "array" as const,
        description: "Condiciones o reglas especiales aplicables a este tipo de llamado",
        items: {
          type: "object" as const,
          properties: {
            condicion: { type: "string" as const },
            cita: { type: "string" as const }
          },
          required: ["condicion", "cita"],
          additionalProperties: false
        }
      },
      criterios_desempate: {
        type: "array" as const,
        description: "Criterios de desempate en orden",
        items: {
          type: "object" as const,
          properties: {
            orden: { type: "integer" as const },
            criterio: { type: "string" as const },
            cita: { type: "string" as const }
          },
          required: ["orden", "criterio", "cita"],
          additionalProperties: false
        }
      },
      causales_finalizacion: {
        type: "array" as const,
        description: "Causas de finalizacion de la suplencia",
        items: {
          type: "object" as const,
          properties: {
            causal: { type: "string" as const },
            cita: { type: "string" as const }
          },
          required: ["causal", "cita"],
          additionalProperties: false
        }
      },
      advertencias: {
        type: "array" as const,
        description: "Advertencias importantes, inhabilitaciones, plazos criticos",
        items: { type: "string" as const }
      },
      aspectos_no_cubiertos: {
        type: "array" as const,
        description: "Aspectos consultados que NO estan en la resolucion",
        items: { type: "string" as const }
      }
    },
    required: [
      "llamado_valido",
      "problemas_detectados",
      "anexo_aplicable",
      "orden_prioridades",
      "requisitos_aspirantes",
      "documentacion_requerida",
      "condiciones_especiales",
      "criterios_desempate",
      "causales_finalizacion",
      "advertencias",
      "aspectos_no_cubiertos"
    ],
    additionalProperties: false
  }
}
