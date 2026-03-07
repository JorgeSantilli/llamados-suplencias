export type TipoCargo =
  | 'cargo_inicial'
  | 'materias_especiales'
  | 'maestro_secretario'
  | 'vicedirector'
  | 'director_libre'
  | 'director_maestro'
  | 'inspector_seccional'
  | 'inspector_regional'

export type CausaSuplencia =
  | 'licencia'
  | 'vacante'
  | 'cambio_funciones'
  | 'traslado'
  | 'otra'

export type Modalidad = 'virtual' | 'presencial'

export type EstadoLlamado = 'borrador' | 'validado' | 'publicado' | 'cancelado'

export type Turno = 'Mañana' | 'Tarde' | 'Vespertino'

export type NivelEducativo =
  | 'Inicial'
  | 'Primario'
  | 'Secundario Orientado'
  | 'Secundario Técnico'
  | 'Educación Especial'
  | 'CENS'
  | 'CEBJA'
  | 'Otro'

export type RolUsuario = 'directivo' | 'supervisor' | 'secretario' | 'admin'

export interface Tenant {
  id: string
  nombre: string
  cue?: string
  nivel: NivelEducativo
  departamento?: string
  localidad?: string
  domicilio?: string
  zona_porcentaje?: string
  created_at: string
}

export interface Profile {
  id: string
  tenant_id: string
  email: string
  nombre_completo?: string
  rol: RolUsuario
  created_at: string
  updated_at: string
}

export interface Llamado {
  id: string
  tenant_id: string
  created_by: string
  tipo_cargo: TipoCargo
  cargo_nombre: string
  causa_suplencia: CausaSuplencia
  instancia_llamado: number
  modalidad: Modalidad
  fecha_llamado?: string
  hora_llamado?: string
  turno?: Turno
  horas_catedra?: number
  materia?: string
  curso?: string
  articulo?: string
  duracion_estimada?: string
  ia_prioridades?: AnalisisIA['orden_prioridades']
  ia_requisitos?: AnalisisIA['requisitos_aspirantes']
  ia_condiciones?: AnalisisIA['condiciones_especiales']
  ia_documentacion?: AnalisisIA['documentacion_requerida']
  ia_observaciones?: string
  ia_anexo_aplicable?: string
  ia_raw_response?: AnalisisIA
  estado: EstadoLlamado
  created_at: string
  updated_at: string
}

export interface DatosLlamadoForm {
  tipo_cargo: TipoCargo
  cargo_nombre: string
  causa_suplencia: CausaSuplencia
  instancia_llamado: number
  nivel: NivelEducativo
  modalidad: Modalidad
  turno?: Turno
  horas_catedra?: number
  materia?: string
  curso?: string
  articulo?: string
  duracion_estimada?: string
  contexto_adicional?: string
}

export interface ProblemaDetectado {
  problema: string
  sugerencia: string
  cita: string
}

export interface Prioridad {
  orden: number
  instancia: string
  descripcion: string
  cita: string
}

export interface Requisito {
  requisito: string
  obligatorio: boolean
  cita: string
}

export interface Documento {
  documento: string
  detalle: string
  cita: string
}

export interface Condicion {
  condicion: string
  cita: string
}

export interface CriterioDesempate {
  orden: number
  criterio: string
  cita: string
}

export interface CausalFinalizacion {
  causal: string
  cita: string
}

export interface AnalisisIA {
  llamado_valido: boolean
  problemas_detectados: ProblemaDetectado[]
  anexo_aplicable: string
  orden_prioridades: Prioridad[]
  requisitos_aspirantes: Requisito[]
  documentacion_requerida: Documento[]
  condiciones_especiales: Condicion[]
  criterios_desempate: CriterioDesempate[]
  causales_finalizacion: CausalFinalizacion[]
  advertencias: string[]
  aspectos_no_cubiertos: string[]
}

export interface ResultadoAnalisis {
  analisis: AnalisisIA
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model?: string
}
