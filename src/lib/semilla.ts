/* Los datos de ejemplo del demo: Monte Sinaí, Óptica Shalom y sus pacientes.
   Todo es ficticio. Las fechas se calculan a partir del día en que se siembra,
   así la agenda de "hoy" siempre tiene citas. */
import type { Cita, Datos, Estudio, Ojo, Orden, Paciente, Personal, Producto, Receta, Venta, Visita, TipoCita, Etapa } from './tipos';
import { sumarDias } from './fechas';

const ojoVacio = (): Ojo => ({ avsc: '', avcc: '', esf: '', cil: '', eje: '', add: '', k1: '', k2: '', pio: '', cristalino: '', cd: '', sa: '', fo: '' });
export const OJO_VACIO = ojoVacio;

const ojo = (o: Partial<Ojo>): Ojo => ({ ...ojoVacio(), ...o });

// Pseudoaleatorio con semilla fija: el demo siempre se ve igual.
function generador(semilla: number) {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const PERSONAL: Personal[] = [
  { id: 'med-mendez', nombre: 'Dr. Edgar Méndez Dávila', corto: 'Dr. Méndez', puesto: 'medico', sede: 'ms' },
  { id: 'opt-laura', nombre: 'Opt. Laura Gómez', corto: 'Optometría', puesto: 'optometria', sede: 'ms' },
  { id: 'est-ms', nombre: 'Sala de estudios', corto: 'Estudios', puesto: 'estudios', sede: 'ms' },
  { id: 'rec-karla', nombre: 'Karla Reyes', corto: 'Recepción', puesto: 'recepcion', sede: 'ms' },
  { id: 'opt-daniel', nombre: 'Opt. Daniel Ortiz', corto: 'Optometría', puesto: 'optometria', sede: 'shalom' },
  { id: 'est-shalom', nombre: 'Sala de estudios Shalom', corto: 'Estudios', puesto: 'estudios', sede: 'shalom' },
  { id: 'opc-ricardo', nombre: 'Ricardo Luna', corto: 'Óptica', puesto: 'optica', sede: 'shalom' },
];

export const COLUMNAS: Record<'ms' | 'shalom', string[]> = {
  ms: ['med-mendez', 'opt-laura', 'est-ms'],
  shalom: ['opt-daniel', 'est-shalom', 'opc-ricardo'],
};

const P = (id: string, sede: 'ms' | 'shalom', codigo: string, nombre: string, categoria: Producto['categoria'], precio: number, costo: number, existencia: number | null = null): Producto =>
  ({ id, sede, codigo, nombre, categoria, precio, costo, existencia });

export const PRODUCTOS: Producto[] = [
  P('ms-c1', 'ms', 'C-01', 'Consulta de primera vez', 'consulta', 1200, 180),
  P('ms-c2', 'ms', 'C-02', 'Consulta subsecuente', 'consulta', 900, 140),
  P('ms-c3', 'ms', 'C-03', 'Revisión postoperatoria', 'consulta', 0, 60),
  P('ms-e1', 'ms', 'E-01', 'OCT macular', 'estudio', 1400, 260),
  P('ms-e2', 'ms', 'E-02', 'OCT de nervio óptico', 'estudio', 1400, 260),
  P('ms-e3', 'ms', 'E-03', 'Campo visual 24-2', 'estudio', 1100, 180),
  P('ms-e4', 'ms', 'E-04', 'Retinografía', 'estudio', 900, 120),
  P('ms-e5', 'ms', 'E-05', 'Biometría', 'estudio', 1300, 220),
  P('ms-q1', 'ms', 'Q-01', 'Facoemulsificación + LIO monofocal', 'cirugia', 28500, 12000),
  P('ms-q2', 'ms', 'Q-02', 'Trabeculectomía', 'cirugia', 32000, 11000),
  P('ms-q3', 'ms', 'Q-03', 'Resección de pterigión con injerto', 'cirugia', 14500, 4800),
  P('ms-m1', 'ms', 'M-01', 'Latanoprost 0.005 % gotas', 'medicamento', 480, 260, 34),
  P('ms-m2', 'ms', 'M-02', 'Lágrimas artificiales', 'medicamento', 220, 110, 58),
  P('sh-e1', 'shalom', 'E-11', 'Campo visual 24-2', 'estudio', 1100, 180),
  P('sh-e2', 'shalom', 'E-12', 'Topografía corneal', 'estudio', 1100, 180),
  P('sh-c1', 'shalom', 'C-11', 'Examen de la vista', 'consulta', 450, 70),
  P('sh-a1', 'shalom', 'A-01', 'Armazón acetato carey 52-18', 'armazon', 2400, 950, 3),
  P('sh-a2', 'shalom', 'A-02', 'Armazón metal dorado 54-17', 'armazon', 2900, 1150, 5),
  P('sh-a3', 'shalom', 'A-03', 'Armazón TR90 negro 50-19', 'armazon', 1800, 640, 9),
  P('sh-a4', 'shalom', 'A-04', 'Armazón titanio gris 53-18', 'armazon', 4200, 1700, 2),
  P('sh-a5', 'shalom', 'A-05', 'Armazón infantil azul 46-16', 'armazon', 1500, 520, 6),
  P('sh-a6', 'shalom', 'A-06', 'Armazón acetato cristal 51-19', 'armazon', 2600, 1000, 0),
  P('sh-l1', 'shalom', 'L-01', 'Micas monofocales 1.56', 'mica', 900, 300),
  P('sh-l2', 'shalom', 'L-02', 'Micas monofocales 1.67', 'mica', 1800, 650),
  P('sh-l3', 'shalom', 'L-03', 'Micas progresivas 1.60', 'mica', 3800, 1500),
  P('sh-l4', 'shalom', 'L-04', 'Micas progresivas 1.67', 'mica', 4900, 2000),
  P('sh-l5', 'shalom', 'L-05', 'Micas bifocales flat-top', 'mica', 1600, 550),
  P('sh-t1', 'shalom', 'T-01', 'Antirreflejante', 'tratamiento', 900, 200),
  P('sh-t2', 'shalom', 'T-02', 'Antirreflejante + filtro azul', 'tratamiento', 1400, 320),
  P('sh-t3', 'shalom', 'T-03', 'Fotocromático', 'tratamiento', 1600, 600),
  P('sh-lc', 'shalom', 'LC-1', 'Lentes de contacto mensuales (caja)', 'contacto', 900, 450, 22),
];

const pac = (id: string, exp: string, nombre: string, apellidos: string, nacimiento: string, sexo: 'F' | 'M', telefono: string, extra: Partial<Paciente> = {}): Paciente =>
  ({ id, exp, nombre, apellidos, nacimiento, sexo, telefono, alergias: [], antecedentes: [], diagnosticos: [], creado: '2024-03-12', ...extra });

export const PACIENTES: Paciente[] = [
  pac('p01', '08412', 'María Elena', 'Ruiz Ortega', '1959-04-17', 'F', '81 1234 5678', {
    alergias: ['Sulfas'],
    diagnosticos: ['H40.1', 'H25.1'],
    antecedentes: [
      { categoria: 'Patológicos', texto: 'Hipertensión arterial controlada desde 2015' },
      { categoria: 'Heredofamiliares', texto: 'Madre con glaucoma' },
      { categoria: 'Medicamentos', texto: 'Latanoprost 0.005 % OI cada noche; losartán 50 mg' },
    ],
  }),
  pac('p02', '09107', 'Jorge', 'Salinas Medina', '1971-09-02', 'M', '81 2345 6789', {
    diagnosticos: ['E11.3'],
    antecedentes: [{ categoria: 'Patológicos', texto: 'Diabetes tipo 2 desde hace 9 años' }],
  }),
  pac('p03', '08766', 'Rosa', 'Medina Treviño', '1952-01-23', 'F', '81 3456 7890', {
    diagnosticos: ['Z96.1', 'H25.1'],
    antecedentes: [{ categoria: 'Quirúrgicos', texto: 'Facoemulsificación OD, ayer' }],
  }),
  pac('p04', '08931', 'Arturo', 'Peña Garza', '1956-06-30', 'M', '81 4567 8901', { diagnosticos: ['H25.1'] }),
  pac('p05', '07720', 'Lucía', 'Torres Cantú', '1968-11-11', 'F', '81 5678 9012', {
    diagnosticos: ['E11.3', 'H36.0'],
    antecedentes: [{ categoria: 'Patológicos', texto: 'Diabetes tipo 2, insulina desde 2021' }],
  }),
  pac('p06', '09215', 'Ana', 'Ríos Villarreal', '1994-02-08', 'F', '81 6789 0123', { diagnosticos: ['H52.1'] }),
  pac('p07', '08550', 'Diego', 'Mora Elizondo', '1981-07-19', 'M', '81 7890 1234', { diagnosticos: ['H52.2', 'H52.4'] }),
  pac('p08', '09233', 'Sofía', 'Lara Benavides', '2019-05-04', 'F', '81 8901 2345', { diagnosticos: ['H52.0'] }),
  pac('p09', '08104', 'Carmen', 'Vidal Quiroga', '1950-12-01', 'F', '81 9012 3456', { diagnosticos: ['H25.1'], alergias: ['Penicilina'] }),
  pac('p10', '06988', 'Héctor', 'Gil Montemayor', '1961-03-14', 'M', '81 0123 4567', { diagnosticos: ['H40.1'] }),
  pac('p11', '09012', 'Javier', 'Ortiz Leal', '1979-08-25', 'M', '81 1122 3344', { diagnosticos: ['H52.1', 'H52.2'] }),
  pac('p12', '08877', 'Patricia', 'Garza Salazar', '1985-10-09', 'F', '81 2233 4455', { diagnosticos: ['H04.1'] }),
  pac('p13', '07431', 'Roberto', 'Cavazos Treviño', '1949-02-27', 'M', '81 3344 5566', { diagnosticos: ['H35.3'] }),
  pac('p14', '09180', 'Fernanda', 'Lozano Ibarra', '2001-06-13', 'F', '81 4455 6677', { diagnosticos: ['H18.6'] }),
  pac('p15', '08640', 'Miguel Ángel', 'Saldaña Rocha', '1974-04-02', 'M', '81 5566 7788', { diagnosticos: ['H11.0'] }),
  pac('p16', '06512', 'Teresa', 'Hinojosa Garza', '1946-09-21', 'F', '81 6677 8899', { diagnosticos: ['H40.1'] }),
  pac('p17', '09240', 'Luis Fernando', 'Castillo Pérez', '1990-01-30', 'M', '81 7788 9900', { diagnosticos: ['H10.9'] }),
  pac('p18', '09001', 'Gabriela', 'Montes de Oca', '1982-03-18', 'F', '81 8899 0011', { diagnosticos: ['H52.1'] }),
  pac('p19', '07102', 'Ernesto', 'Villarreal Sada', '1955-08-08', 'M', '81 9900 1122', { diagnosticos: ['H40.0'] }),
  pac('p20', '07855', 'Silvia', 'Treviño Garza', '1958-05-15', 'F', '81 1010 2020', { diagnosticos: ['H40.1'] }),
];

export function sembrar(dia: string, ahora: number): Datos {
  const r = generador(20260512);
  const entre = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));
  const min = (m: number) => ahora - m * 60000;

  // ── Agenda de hoy ────────────────────────────────────────────────
  const citas: Cita[] = [];
  let n = 0;
  const cita = (sede: 'ms' | 'shalom', columna: string, pacienteId: string, hora: string, duracion: number, tipo: TipoCita, motivo: string, confirmada = true) =>
    citas.push({ id: `c${String(++n).padStart(3, '0')}`, sede, columna, pacienteId, fecha: dia, hora, duracion, tipo, motivo, confirmada });

  cita('ms', 'med-mendez', 'p03', '08:00', 15, 'postop', 'Postoperatorio día 1 · faco OD');
  cita('ms', 'med-mendez', 'p02', '08:30', 45, 'primera', 'Primera vez · revisión por diabetes');
  cita('ms', 'med-mendez', 'p01', '09:30', 30, 'sub', 'Control de glaucoma');
  cita('ms', 'med-mendez', 'p04', '10:00', 45, 'cirugia', 'Valoración prequirúrgica · catarata OI');
  cita('ms', 'med-mendez', 'p05', '11:00', 30, 'sub', 'Control de retinopatía');
  cita('ms', 'med-mendez', 'p13', '11:30', 30, 'sub', 'Control de DMRE', false);
  cita('ms', 'med-mendez', 'p15', '12:30', 30, 'sub', 'Pterigión OD');
  cita('ms', 'med-mendez', 'p10', '13:00', 30, 'sub', 'Control de glaucoma', false);
  cita('ms', 'opt-laura', 'p02', '08:00', 30, 'opto', 'AV, refracción y PIO');
  cita('ms', 'opt-laura', 'p06', '08:30', 30, 'opto', 'Adaptación de lentes de contacto');
  cita('ms', 'opt-laura', 'p01', '09:00', 30, 'opto', 'AV y PIO');
  cita('ms', 'opt-laura', 'p08', '10:30', 45, 'primera', 'Primera vez · niña de 7 años');
  cita('ms', 'opt-laura', 'p09', '12:00', 30, 'opto', 'Refracción previa a valoración');
  cita('ms', 'est-ms', 'p01', '08:30', 30, 'estudio', 'OCT macular + campo visual');
  cita('ms', 'est-ms', 'p04', '09:30', 30, 'estudio', 'Biometría');
  cita('ms', 'est-ms', 'p05', '10:30', 45, 'estudio', 'Retinografía + OCT macular');
  cita('ms', 'est-ms', 'p13', '11:00', 30, 'estudio', 'OCT macular');
  cita('shalom', 'opt-daniel', 'p18', '09:00', 30, 'opto', 'Examen de la vista');
  cita('shalom', 'opt-daniel', 'p12', '10:00', 30, 'opto', 'Ojo seco · revisión');
  cita('shalom', 'opt-daniel', 'p17', '11:00', 30, 'opto', 'Ojo rojo');
  cita('shalom', 'opt-daniel', 'p14', '12:00', 45, 'opto', 'Lentes de contacto · queratocono');
  cita('shalom', 'est-shalom', 'p14', '09:30', 30, 'estudio', 'Topografía corneal');
  cita('shalom', 'est-shalom', 'p10', '11:30', 30, 'estudio', 'Campo visual 24-2');
  cita('shalom', 'opc-ricardo', 'p07', '10:00', 30, 'optica', 'Entrega de anteojos');
  cita('shalom', 'opc-ricardo', 'p11', '12:30', 30, 'optica', 'Toma de medidas');

  const citaDe = (p: string, col: string) => citas.find((c) => c.pacienteId === p && c.columna === col)?.id ?? null;

  // ── Visitas: el historial y las de hoy ──────────────────────────
  const visitas: Visita[] = [];
  let v = 0;
  const visita = (pacienteId: string, fecha: string, extra: Partial<Visita>): Visita => {
    const x: Visita = {
      id: `v${String(++v).padStart(3, '0')}`, pacienteId, citaId: null, sede: 'ms', fecha, medico: 'med-mendez',
      motivo: '', etapa: 'salio', etapaDesde: ahora, od: ojoVacio(), oi: ojoVacio(), diagnosticos: [], plan: '',
      servicios: [], cobrada: true, ...extra,
    };
    visitas.push(x);
    return x;
  };

  // María Elena: la presión del ojo izquierdo viene subiendo.
  const pioOI = ['19', '20', '20', '21', '22', '23'];
  const pioOD = ['16', '17', '16', '17', '16', '17'];
  [-540, -450, -360, -270, -180, -90].forEach((d, i) =>
    visita('p01', sumarDias(dia, d), {
      motivo: 'Control de glaucoma',
      od: ojo({ avsc: '20/60', avcc: '20/30', esf: '-1.00', cil: '-0.50', eje: '90', add: '+2.50', pio: pioOD[i], cristalino: 'NO2 NC2', cd: '0.4', sa: 'Sin alteraciones', fo: 'Papila de bordes nítidos, C/D 0.4' }),
      oi: ojo({ avsc: '20/40', avcc: '20/25', esf: '-0.75', cil: '-0.75', eje: '85', add: '+2.50', pio: pioOI[i], cristalino: 'NO1 NC1', cd: i < 3 ? '0.6' : '0.7', sa: 'Sin alteraciones', fo: 'Excavación aumentada, adelgazamiento inferior' }),
      diagnosticos: [{ cie: 'H40.1', desc: 'Glaucoma primario de ángulo abierto', ojo: 'OI' }],
      plan: 'Latanoprost OI cada noche. Control de PIO en 3 meses.',
      servicios: ['ms-c2'],
    }),
  );

  // Historial breve del resto.
  const conHistorial = ['p02', 'p04', 'p05', 'p06', 'p07', 'p09', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p18', 'p19', 'p20'];
  for (const p of conHistorial) {
    const veces = p === 'p02' ? 0 : entre(1, 3);
    for (let i = 0; i < veces; i++) {
      const pio = () => String(entre(13, 19));
      const glaucoma = ['p10', 'p16', 'p19', 'p20'].includes(p);
      visita(p, sumarDias(dia, -entre(30, 420)), {
        motivo: glaucoma ? 'Control de glaucoma' : 'Revisión',
        od: ojo({ avsc: `20/${[20, 25, 30, 40, 50, 70][entre(0, 5)]}`, avcc: '20/25', esf: (-r() * 3).toFixed(2), cil: (-r() * 1.5).toFixed(2), eje: String(entre(5, 180)), pio: glaucoma ? String(entre(18, 24)) : pio(), cd: glaucoma ? '0.6' : '0.3' }),
        oi: ojo({ avsc: `20/${[20, 25, 30, 40, 50, 70][entre(0, 5)]}`, avcc: '20/25', esf: (-r() * 3).toFixed(2), cil: (-r() * 1.5).toFixed(2), eje: String(entre(5, 180)), pio: glaucoma ? String(entre(18, 24)) : pio(), cd: glaucoma ? '0.6' : '0.3' }),
        servicios: ['ms-c2'],
      });
    }
  }
  // Teresa y Silvia: pacientes de glaucoma que no han vuelto.
  for (const vv of visitas) if (vv.pacienteId === 'p16' || vv.pacienteId === 'p20') vv.fecha = sumarDias(dia, -entre(130, 300));

  // Hoy: quién está dónde.
  const hoyV = (pacienteId: string, etapa: Etapa, haceMin: number, extra: Partial<Visita>) =>
    visita(pacienteId, dia, { etapa, etapaDesde: min(haceMin), cobrada: false, ...extra });

  hoyV('p03', 'salio', 50, {
    citaId: citaDe('p03', 'med-mendez'), motivo: 'Postoperatorio día 1 · faco OD', servicios: ['ms-c3'], cobrada: true,
    od: ojo({ avsc: '20/40', pio: '18', sa: 'Edema corneal leve, cámara formada, LIO centrada' }),
    oi: ojo({ avsc: '20/50', pio: '15' }),
    diagnosticos: [{ cie: 'Z96.1', desc: 'Presencia de lente intraocular', ojo: 'OD' }],
    plan: 'Prednisolona y moxifloxacino OD cada 4 h. Revisión en una semana.',
  });
  hoyV('p02', 'dilatacion', 18, {
    citaId: citaDe('p02', 'med-mendez'), motivo: 'Primera vez · revisión por diabetes', servicios: ['ms-c1', 'ms-e4'],
    od: ojo({ avsc: '20/30', avcc: '20/20', esf: '-0.50', cil: '-0.25', eje: '170', pio: '15' }),
    oi: ojo({ avsc: '20/30', avcc: '20/20', esf: '-0.75', cil: '-0.25', eje: '10', pio: '16' }),
  });
  hoyV('p01', 'medico', 4, {
    citaId: citaDe('p01', 'med-mendez'), motivo: 'Control de glaucoma', servicios: ['ms-c2', 'ms-e1', 'ms-e3'],
    od: ojo({ avsc: '20/80', avcc: '20/40', esf: '-1.25', cil: '-0.50', eje: '90', add: '+2.50', k1: '43.25', k2: '44.00', pio: '17', cristalino: 'NO3 NC3', cd: '0.4' }),
    oi: ojo({ avsc: '20/40', avcc: '20/25', esf: '-0.75', cil: '-0.75', eje: '85', add: '+2.50', k1: '43.50', k2: '44.25', pio: '24', cristalino: 'NO1 NC1', cd: '0.7' }),
  });
  hoyV('p06', 'optometria', 12, { citaId: citaDe('p06', 'opt-laura'), motivo: 'Adaptación de lentes de contacto', medico: 'opt-laura', servicios: ['ms-c2'] });
  hoyV('p04', 'estudios', 9, { citaId: citaDe('p04', 'est-ms'), motivo: 'Valoración prequirúrgica · catarata OI', servicios: ['ms-c2', 'ms-e5'],
    od: ojo({ avsc: '20/40', avcc: '20/25', pio: '15' }), oi: ojo({ avsc: '20/200', avcc: '20/100', pio: '16', cristalino: 'NO4 NC4' }) });
  hoyV('p18', 'optometria', 7, { citaId: citaDe('p18', 'opt-daniel'), sede: 'shalom', medico: 'opt-daniel', motivo: 'Examen de la vista', servicios: ['sh-c1'] });
  hoyV('p07', 'optica', 6, { citaId: citaDe('p07', 'opc-ricardo'), sede: 'shalom', medico: 'opc-ricardo', motivo: 'Entrega de anteojos', servicios: [] });
  hoyV('p05', 'recepcion', 3, { citaId: citaDe('p05', 'med-mendez'), motivo: 'Control de retinopatía', servicios: ['ms-c2', 'ms-e1', 'ms-e4'] });

  // ── Estudios ──────────────────────────────────────────────────────
  const estudios: Estudio[] = [
    { id: 'e01', pacienteId: 'p01', tipo: 'OCT macular', ojo: 'OI', fecha: sumarDias(dia, -540), imagen: '/estudios/oct-mapa.svg', valores: { 'Grosor central': '248 µm', 'Promedio': '296 µm' }, nota: '' },
    { id: 'e02', pacienteId: 'p01', tipo: 'OCT macular', ojo: 'OI', fecha: dia, imagen: '/estudios/oct-mapa-fino.svg', valores: { 'Grosor central': '246 µm', 'Promedio': '284 µm' }, nota: 'Adelgazamiento superior respecto a 2025' },
    { id: 'e03', pacienteId: 'p01', tipo: 'Campo visual 24-2', ojo: 'OI', fecha: sumarDias(dia, -90), imagen: '/estudios/campo-1.svg', valores: { 'DM': '−5.12 dB', 'DSM': '4.30 dB', 'VFI': '88 %' }, nota: '' },
    { id: 'e04', pacienteId: 'p01', tipo: 'Campo visual 24-2', ojo: 'OI', fecha: dia, imagen: '/estudios/campo-2.svg', valores: { 'DM': '−6.42 dB', 'DSM': '5.10 dB', 'VFI': '84 %' }, nota: 'Progresión del escotoma arqueado superior' },
    { id: 'e05', pacienteId: 'p01', tipo: 'Retinografía', ojo: 'OI', fecha: dia, imagen: '/estudios/retina.svg', valores: {}, nota: '' },
    { id: 'e06', pacienteId: 'p01', tipo: 'OCT nervio óptico', ojo: 'OI', fecha: sumarDias(dia, -180), imagen: '/estudios/oct-corte.svg', valores: { 'CFNR promedio': '78 µm' }, nota: '' },
    { id: 'e07', pacienteId: 'p05', tipo: 'Retinografía', ojo: 'OD', fecha: sumarDias(dia, -200), imagen: '/estudios/retina.svg', valores: {}, nota: 'Microaneurismas y exudados duros' },
    { id: 'e08', pacienteId: 'p04', tipo: 'Biometría', ojo: 'OI', fecha: sumarDias(dia, -20), imagen: '/estudios/biometria.svg', valores: { 'Longitud axial': '23.41 mm', 'K1': '43.25 D', 'K2': '44.00 D', 'LIO calculada': '+21.5 D' }, nota: '' },
    { id: 'e09', pacienteId: 'p14', tipo: 'Topografía', ojo: 'AO', fecha: sumarDias(dia, -120), imagen: '/estudios/topografia.svg', valores: { 'Kmax OD': '51.2 D', 'Kmax OI': '48.7 D' }, nota: '' },
  ];

  // ── Recetas y órdenes de óptica ──────────────────────────────────
  const lente = (esf: string, cil: string, eje: string, add = '') => ({ esf, cil, eje, add });
  const recetas: Receta[] = [
    { id: 'r01', visitaId: visitas.find((x) => x.pacienteId === 'p07')!.id, pacienteId: 'p07', fecha: sumarDias(dia, -8), od: lente('-1.50', '-0.75', '180', '+1.75'), oi: lente('-1.25', '-1.00', '175', '+1.75'), dip: '64', tipoLente: 'Progresivo', tratamiento: 'Antirreflejante', medicamentos: [], indicaciones: 'Uso permanente.', enviadaOptica: true },
    { id: 'r02', visitaId: visitas.find((x) => x.pacienteId === 'p11')!.id, pacienteId: 'p11', fecha: sumarDias(dia, -3), od: lente('-3.25', '-0.50', '10'), oi: lente('-3.00', '-0.75', '170'), dip: '63', tipoLente: 'Monofocal', tratamiento: 'Antirreflejante + filtro azul', medicamentos: [], indicaciones: 'Uso permanente.', enviadaOptica: true },
    { id: 'r03', visitaId: visitas.find((x) => x.pacienteId === 'p18')!.id, pacienteId: 'p18', fecha: sumarDias(dia, -1), od: lente('-2.00', '', ''), oi: lente('-2.25', '-0.25', '90'), dip: '61', tipoLente: 'Monofocal', tratamiento: 'Antirreflejante', medicamentos: [], indicaciones: '', enviadaOptica: true },
  ];
  const ordenes: Orden[] = [
    { id: 'o01', folio: '2026-1179', recetaId: 'r01', pacienteId: 'p07', fecha: sumarDias(dia, -8), estado: 'lista', armazonId: 'sh-a2', micasId: 'sh-l3', tratamientoId: 'sh-t1', total: 7600, anticipo: 4000, promesa: dia, cobrada: false },
    { id: 'o02', folio: '2026-1183', recetaId: 'r02', pacienteId: 'p11', fecha: sumarDias(dia, -3), estado: 'laboratorio', armazonId: 'sh-a3', micasId: 'sh-l2', tratamientoId: 'sh-t2', total: 5000, anticipo: 2500, promesa: sumarDias(dia, 4), cobrada: false },
    { id: 'o03', folio: '2026-1186', recetaId: 'r03', pacienteId: 'p18', fecha: sumarDias(dia, -1), estado: 'venta', armazonId: 'sh-a1', micasId: 'sh-l1', tratamientoId: 'sh-t1', total: 4200, anticipo: 2000, promesa: sumarDias(dia, 6), cobrada: false },
  ];

  // ── Ventas del mes: lo que alimenta el tablero de dirección ──────
  const ventas: Venta[] = [];
  let w = 0;
  const prod = (id: string) => PRODUCTOS.find((p) => p.id === id)!;
  const venta = (sede: 'ms' | 'shalom', fecha: string, ids: string[], linea: Venta['linea'], pacienteId: string) => {
    const partidas = ids.map((id) => ({ productoId: id, nombre: prod(id).nombre, cantidad: 1, precio: prod(id).precio, costo: prod(id).costo }));
    const metodos: Venta['metodo'][] = ['Tarjeta', 'Tarjeta', 'Efectivo', 'Transferencia'];
    ventas.push({
      id: `s${String(++w).padStart(4, '0')}`, sede, pacienteId, visitaId: null, ordenId: null,
      fecha: `${fecha}T${String(entre(8, 18)).padStart(2, '0')}:${String(entre(0, 59)).padStart(2, '0')}:00`,
      partidas, total: partidas.reduce((s, p) => s + p.precio, 0), metodo: metodos[entre(0, 3)], linea,
    });
  };
  const todos = PACIENTES.map((p) => p.id);
  for (let d = -29; d <= -1; d++) {
    const f = sumarDias(dia, d);
    const dow = new Date(f + 'T12:00:00').getDay();
    if (dow === 0) continue;
    const pid = () => todos[entre(0, todos.length - 1)];
    for (let i = 0; i < entre(5, 8); i++) {
      const ids = [r() < 0.35 ? 'ms-c1' : 'ms-c2'];
      if (r() < 0.5) ids.push(['ms-e1', 'ms-e2', 'ms-e3', 'ms-e4'][entre(0, 3)]);
      venta('ms', f, ids, 'consulta', pid());
    }
    if (r() < 0.35) venta('ms', f, [['ms-q1', 'ms-q1', 'ms-q2', 'ms-q3'][entre(0, 3)]], 'cirugia', pid());
    for (let i = 0; i < entre(2, 4); i++) {
      venta('shalom', f, [`sh-a${entre(1, 5)}`, `sh-l${entre(1, 5)}`, `sh-t${entre(1, 3)}`], 'optica', pid());
    }
    if (r() < 0.5) venta('shalom', f, ['sh-c1'], 'consulta', pid());
  }
  // Lo de hoy que ya se cobró: el postoperatorio de Rosa.
  venta('ms', dia, ['ms-c3'], 'consulta', 'p03');

  return {
    personal: PERSONAL,
    pacientes: PACIENTES,
    citas,
    visitas,
    estudios,
    recetas,
    ordenes,
    productos: PRODUCTOS,
    ventas,
  };
}
