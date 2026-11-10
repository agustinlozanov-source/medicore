const dos = (n: number) => String(n).padStart(2, '0');

export function aTexto(d: Date): string {
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

export function hoy(): string {
  return aTexto(new Date());
}

export function sumarDias(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split('-').map(Number);
  return aTexto(new Date(a, m - 1, d + dias));
}

export function edad(nacimiento: string): number {
  const [a, m, d] = nacimiento.split('-').map(Number);
  const h = new Date();
  let e = h.getFullYear() - a;
  if (h.getMonth() + 1 < m || (h.getMonth() + 1 === m && h.getDate() < d)) e--;
  return e;
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function corta(fecha: string): string {
  const [a, m, d] = fecha.split('-').map(Number);
  const actual = new Date().getFullYear();
  return `${d} ${MESES[m - 1]}${a !== actual ? ' ' + a : ''}`;
}

export function larga(fecha: string): string {
  const [a, m, d] = fecha.split('-').map(Number);
  const f = new Date(a, m - 1, d);
  const mes = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][m - 1];
  return `${DIAS[f.getDay()]} ${d} de ${mes}`;
}

export function minutosDesde(ms: number): number {
  return Math.max(0, Math.floor((Date.now() - ms) / 60000));
}

export function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function dinero(n: number): string {
  return '$' + n.toLocaleString('es-MX', { maximumFractionDigits: 0 });
}
