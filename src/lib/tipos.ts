/* El modelo del demo. Es el mismo del plan (PLAN-DEMO.md, sección 4) para que
   pasar a Supabase sea cambiar dónde se guarda, no qué se guarda. */

export type SedeId = 'ms' | 'shalom';

export type Puesto = 'medico' | 'optometria' | 'recepcion' | 'optica' | 'caja' | 'estudios';

export interface Personal {
  id: string;
  nombre: string;
  corto: string;
  puesto: Puesto;
  sede: SedeId;
}

export interface Antecedente {
  categoria: 'Alergias' | 'Patológicos' | 'No patológicos' | 'Heredofamiliares' | 'Quirúrgicos' | 'Medicamentos';
  texto: string;
}

export interface Paciente {
  id: string;
  exp: string;
  nombre: string;
  apellidos: string;
  nacimiento: string; // AAAA-MM-DD
  sexo: 'F' | 'M';
  telefono: string;
  alergias: string[];
  antecedentes: Antecedente[];
  diagnosticos: string[]; // claves CIE-10 activas
  creado: string;
}

export type TipoCita = 'primera' | 'sub' | 'estudio' | 'cirugia' | 'postop' | 'opto' | 'optica';

export interface Cita {
  id: string;
  sede: SedeId;
  columna: string; // id de personal, o la sala
  pacienteId: string;
  fecha: string; // AAAA-MM-DD
  hora: string; // HH:MM
  duracion: number; // minutos
  tipo: TipoCita;
  motivo: string;
  confirmada: boolean;
}

export type Etapa = 'recepcion' | 'optometria' | 'dilatacion' | 'estudios' | 'medico' | 'optica' | 'caja' | 'salio';

export interface Ojo {
  avsc: string;
  avcc: string;
  esf: string;
  cil: string;
  eje: string;
  add: string;
  k1: string;
  k2: string;
  pio: string;
  cristalino: string;
  cd: string;
  sa: string; // segmento anterior
  fo: string; // fondo de ojo
}

export interface Diagnostico {
  cie: string;
  desc: string;
  ojo: 'OD' | 'OI' | 'AO';
}

export interface Visita {
  id: string;
  pacienteId: string;
  citaId: string | null;
  sede: SedeId;
  fecha: string; // AAAA-MM-DD
  medico: string;
  motivo: string;
  etapa: Etapa;
  etapaDesde: number; // ms
  od: Ojo;
  oi: Ojo;
  diagnosticos: Diagnostico[];
  plan: string;
  servicios: string[]; // ids de producto que se cobran
  cobrada: boolean;
}

export type TipoEstudio = 'OCT macular' | 'OCT nervio óptico' | 'Campo visual 24-2' | 'Retinografía' | 'Biometría' | 'Topografía';

export interface Estudio {
  id: string;
  pacienteId: string;
  tipo: TipoEstudio;
  ojo: 'OD' | 'OI' | 'AO';
  fecha: string;
  imagen: string; // ruta pública o data URL
  valores: Record<string, string>;
  nota: string;
}

export interface Lente {
  esf: string;
  cil: string;
  eje: string;
  add: string;
}

export interface Medicamento {
  nombre: string;
  indicacion: string;
}

export interface Receta {
  id: string;
  visitaId: string;
  pacienteId: string;
  fecha: string;
  od: Lente;
  oi: Lente;
  dip: string;
  tipoLente: string;
  tratamiento: string;
  medicamentos: Medicamento[];
  indicaciones: string;
  enviadaOptica: boolean;
}

export type EstadoOrden = 'venta' | 'laboratorio' | 'llego' | 'lista' | 'entregada';

export interface Orden {
  id: string;
  folio: string;
  recetaId: string | null;
  pacienteId: string;
  fecha: string;
  estado: EstadoOrden;
  armazonId: string | null;
  micasId: string | null;
  tratamientoId: string | null;
  total: number;
  anticipo: number;
  promesa: string;
  cobrada: boolean;
}

export type Categoria = 'consulta' | 'estudio' | 'cirugia' | 'armazon' | 'mica' | 'tratamiento' | 'medicamento' | 'contacto';

export interface Producto {
  id: string;
  sede: SedeId;
  codigo: string;
  nombre: string;
  categoria: Categoria;
  precio: number;
  costo: number;
  existencia: number | null; // null: servicio, no se inventaría
}

export type Linea = 'consulta' | 'cirugia' | 'optica';

export interface Partida {
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;
  costo: number;
}

export interface Venta {
  id: string;
  sede: SedeId;
  pacienteId: string;
  visitaId: string | null;
  ordenId: string | null;
  fecha: string; // ISO
  partidas: Partida[];
  total: number;
  metodo: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  linea: Linea;
}

export interface Datos {
  personal: Personal[];
  pacientes: Paciente[];
  citas: Cita[];
  visitas: Visita[];
  estudios: Estudio[];
  recetas: Receta[];
  ordenes: Orden[];
  productos: Producto[];
  ventas: Venta[];
}

export type Coleccion = keyof Datos;
export const COLECCIONES: Coleccion[] = ['personal', 'pacientes', 'citas', 'visitas', 'estudios', 'recetas', 'ordenes', 'productos', 'ventas'];
