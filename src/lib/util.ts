import type { Datos, Etapa, Paciente, Producto, TipoCita, Visita } from './tipos';
import { hoy } from './fechas';
import { OJO_VACIO } from './semilla';
import { nuevoId } from './datos';

export const TIPOS: Record<TipoCita, { texto: string; color: string }> = {
  primera: { texto: 'Primera vez', color: '#0066ff' },
  sub: { texto: 'Subsecuente', color: '#8e8e93' },
  opto: { texto: 'Optometría', color: '#e8743b' },
  estudio: { texto: 'Estudio', color: '#1aab99' },
  cirugia: { texto: 'Cirugía', color: '#3533cd' },
  postop: { texto: 'Postoperatorio', color: '#00a651' },
  optica: { texto: 'Óptica', color: '#c026d3' },
};

export const ETAPAS: { id: Etapa; texto: string }[] = [
  { id: 'recepcion', texto: 'Recepción' },
  { id: 'optometria', texto: 'Optometría' },
  { id: 'dilatacion', texto: 'Dilatando' },
  { id: 'estudios', texto: 'Estudios' },
  { id: 'medico', texto: 'Con el médico' },
  { id: 'optica', texto: 'Óptica' },
  { id: 'caja', texto: 'Caja' },
  { id: 'salio', texto: 'Salió' },
];

export const nombre = (p?: Paciente) => (p ? `${p.nombre} ${p.apellidos}` : '—');
export const nombreCorto = (p?: Paciente) => (p ? `${p.nombre.split(' ')[0]} ${p.apellidos.split(' ')[0]}` : '—');

export function paciente(d: Datos, id: string) {
  return d.pacientes.find((p) => p.id === id);
}

export function producto(d: Datos, id: string): Producto | undefined {
  return d.productos.find((p) => p.id === id);
}

export function visitaDeHoy(d: Datos, pacienteId: string) {
  return d.visitas.find((v) => v.pacienteId === pacienteId && v.fecha === hoy());
}

// Lo que se cobra por omisión según el tipo de cita.
const SERVICIOS: Record<TipoCita, string[]> = {
  primera: ['ms-c1'], sub: ['ms-c2'], opto: ['ms-c2'], estudio: [], cirugia: ['ms-c2'], postop: ['ms-c3'], optica: [],
};

export function nuevaVisita(d: Datos, pacienteId: string, sede: Visita['sede'], citaId: string | null, motivo: string, tipo?: TipoCita): Visita {
  const cita = citaId ? d.citas.find((c) => c.id === citaId) : undefined;
  const servicios = sede === 'shalom' ? (tipo === 'optica' ? [] : ['sh-c1']) : SERVICIOS[tipo ?? 'sub'];
  return {
    id: nuevoId('v'), pacienteId, citaId, sede, fecha: hoy(),
    medico: sede === 'ms' ? 'med-mendez' : cita?.columna ?? 'opt-daniel',
    motivo, etapa: 'recepcion', etapaDesde: Date.now(), od: OJO_VACIO(), oi: OJO_VACIO(),
    diagnosticos: [], plan: '', servicios, cobrada: false,
  };
}

export function ultimaVisita(d: Datos, pacienteId: string) {
  return d.visitas.filter((v) => v.pacienteId === pacienteId).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
}
