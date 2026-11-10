'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDatos, nuevoId } from '@/lib/datos';
import { COLUMNAS } from '@/lib/semilla';
import type { Cita, TipoCita } from '@/lib/tipos';
import { aMinutos, hoy, larga, sumarDias } from '@/lib/fechas';
import { ETAPAS, TIPOS, nombre, nombreCorto, nuevaVisita, paciente } from '@/lib/util';
import { Boton, Cargando, Encabezado, Modal, Pildora } from '@/components/ui';
import { FormPaciente } from '@/components/NuevoPaciente';

const INICIO = 8 * 60, FIN = 15 * 60, PASO = 15, ALTO = 22;
const filas = (FIN - INICIO) / PASO;

export default function Agenda() {
  const { datos, modo, sede, guardar } = useDatos();
  const [fecha, setFecha] = useState(hoy());
  const [abierta, setAbierta] = useState<Cita | null>(null);
  const [nueva, setNueva] = useState<{ columna: string; hora: string } | null>(null);
  const [ahora, setAhora] = useState(0);
  useEffect(() => {
    const t = () => { const d = new Date(); setAhora(d.getHours() * 60 + d.getMinutes()); };
    t();
    const i = setInterval(t, 30000);
    return () => clearInterval(i);
  }, []);

  const columnas = COLUMNAS[sede].map((id) => datos.personal.find((p) => p.id === id)).filter(Boolean);
  const citas = useMemo(() => datos.citas.filter((c) => c.fecha === fecha && c.sede === sede), [datos.citas, fecha, sede]);
  const llegaron = citas.filter((c) => datos.visitas.some((v) => v.pacienteId === c.pacienteId && v.fecha === fecha)).length;

  if (modo === 'cargando') return <Cargando />;

  return (
    <>
      <Encabezado icono="agenda" color="#1aab99" titulo="Agenda" sub={<span className="first-letter:uppercase inline-block">{larga(fecha)}{fecha === hoy() ? ' · hoy' : ''}</span>}>
        <Pildora>{citas.length} citas</Pildora>
        <Pildora tono="ok">{citas.filter((c) => c.confirmada).length} confirmadas por WhatsApp</Pildora>
        <Pildora tono="azul">{llegaron} llegaron</Pildora>
        <div className="ml-2 flex items-center gap-1">
          <Boton variante="borde" onClick={() => setFecha(sumarDias(fecha, -1))}>‹</Boton>
          <Boton variante="borde" onClick={() => setFecha(hoy())}>Hoy</Boton>
          <Boton variante="borde" onClick={() => setFecha(sumarDias(fecha, 1))}>›</Boton>
        </div>
      </Encabezado>

      <div className="overflow-x-auto rounded-2xl border border-g2">
        <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `56px repeat(${columnas.length}, minmax(0,1fr))` }}>
          <div className="sticky top-0 z-10 border-b border-g2 bg-white" />
          {columnas.map((c) => (
            <div key={c!.id} className="border-b border-l border-g2 bg-white px-3 py-2.5">
              <div className="text-sm font-semibold">{c!.corto === 'Dr. Méndez' ? c!.nombre : c!.corto}</div>
              <div className="text-[11px] text-g4">{c!.puesto === 'medico' ? 'Consultorio 1' : c!.nombre}</div>
            </div>
          ))}

          <div className="relative" style={{ height: filas * ALTO }}>
            {Array.from({ length: filas / 2 }, (_, i) => (
              <div key={i} className="absolute right-2 text-[10.5px] tabular-nums text-g4" style={{ top: i * 2 * ALTO - 6 }}>
                {i ? `${8 + Math.floor(i / 2)}:${i % 2 ? '30' : '00'}` : ''}
              </div>
            ))}
          </div>

          {columnas.map((col) => (
            <div key={col!.id} className="relative border-l border-g2" style={{ height: filas * ALTO }}>
              {Array.from({ length: filas }, (_, i) => {
                const m = INICIO + i * PASO;
                const hora = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
                return (
                  <button key={i} onClick={() => setNueva({ columna: col!.id, hora })}
                    className={`absolute inset-x-0 hover:bg-g1 ${i % 4 === 0 ? 'border-t border-g2' : i % 2 === 0 ? 'border-t border-dashed border-g2/70' : ''}`}
                    style={{ top: i * ALTO, height: ALTO }} aria-label={`Nueva cita a las ${hora}`} />
                );
              })}
              {fecha === hoy() && ahora > INICIO && ahora < FIN && (
                <div className="pointer-events-none absolute inset-x-0 z-20 h-0.5 bg-alerta" style={{ top: ((ahora - INICIO) / PASO) * ALTO }} />
              )}
              {citas.filter((c) => c.columna === col!.id).map((c) => {
                const p = paciente(datos, c.pacienteId);
                const v = datos.visitas.find((x) => x.pacienteId === c.pacienteId && x.fecha === c.fecha);
                const t = TIPOS[c.tipo];
                return (
                  <button key={c.id} onClick={() => setAbierta(c)}
                    className="absolute inset-x-1 z-10 overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left text-xs leading-tight transition hover:shadow-md"
                    style={{ top: ((aMinutos(c.hora) - INICIO) / PASO) * ALTO + 1, height: (c.duracion / PASO) * ALTO - 3, borderColor: t.color, background: `color-mix(in srgb, ${t.color} 11%, white)` }}>
                    <b className="block truncate font-semibold">{nombreCorto(p)}</b>
                    <span className="block truncate text-[11px] text-g5">{c.motivo}</span>
                    {c.duracion >= 30 && (
                      <span className="block truncate text-[10.5px] text-g4">
                        {v ? `● ${ETAPAS.find((e) => e.id === v.etapa)?.texto}` : c.confirmada ? '✓ Confirmó por WhatsApp' : 'Sin confirmar'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-g4">
        {Object.values(TIPOS).map((t) => (
          <span key={t.texto} className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px]" style={{ background: t.color }} />{t.texto}</span>
        ))}
      </div>

      <DetalleCita cita={abierta} cerrar={() => setAbierta(null)} />
      <NuevaCita datosCita={nueva} fecha={fecha} cerrar={() => setNueva(null)} guardar={(c) => { guardar('citas', c); setNueva(null); }} />
    </>
  );
}

function DetalleCita({ cita, cerrar }: { cita: Cita | null; cerrar: () => void }) {
  const { datos, guardar } = useDatos();
  if (!cita) return null;
  const p = paciente(datos, cita.pacienteId);
  const v = datos.visitas.find((x) => x.pacienteId === cita.pacienteId && x.fecha === cita.fecha);
  return (
    <Modal abierto titulo={nombre(p)} cerrar={cerrar}>
      <div className="space-y-1 text-sm">
        <p><span className="text-g4">Hora:</span> {cita.hora} · {cita.duracion} min</p>
        <p><span className="text-g4">Motivo:</span> {cita.motivo}</p>
        <p><span className="text-g4">Tipo:</span> {TIPOS[cita.tipo].texto}</p>
        <p><span className="text-g4">Teléfono:</span> {p?.telefono}</p>
        {p?.alergias.length ? <p className="font-semibold text-alerta">Alergias: {p.alergias.join(', ')}</p> : null}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {!v && cita.fecha === hoy() && (
          <Boton onClick={() => { guardar('visitas', nuevaVisita(datos, cita.pacienteId, cita.sede, cita.id, cita.motivo, cita.tipo)); cerrar(); }}>
            Registrar llegada
          </Boton>
        )}
        {v && <Pildora tono="azul">En la clínica · {ETAPAS.find((e) => e.id === v.etapa)?.texto}</Pildora>}
        <Link href={`/expediente/?id=${cita.pacienteId}`}><Boton variante="borde">Abrir expediente</Boton></Link>
        <Boton variante="suave" onClick={() => { guardar('citas', { ...cita, confirmada: !cita.confirmada }); cerrar(); }}>
          {cita.confirmada ? 'Marcar sin confirmar' : 'Marcar confirmada'}
        </Boton>
      </div>
    </Modal>
  );
}

function NuevaCita({ datosCita, fecha, cerrar, guardar }: { datosCita: { columna: string; hora: string } | null; fecha: string; cerrar: () => void; guardar: (c: Cita) => void }) {
  const { datos, sede } = useDatos();
  const [q, setQ] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [alta, setAlta] = useState(false);
  const [tipo, setTipo] = useState<TipoCita>('sub');
  const [duracion, setDuracion] = useState(30);
  const [motivo, setMotivo] = useState('');
  if (!datosCita) return null;
  const col = datos.personal.find((p) => p.id === datosCita.columna);
  const t = q.toLowerCase();
  const resultados = t ? datos.pacientes.filter((p) => `${p.nombre} ${p.apellidos} ${p.exp}`.toLowerCase().includes(t)).slice(0, 6) : [];
  const elegido = paciente(datos, pacienteId);

  return (
    <Modal abierto titulo={`Nueva cita · ${datosCita.hora}`} cerrar={() => { setQ(''); setPacienteId(''); setAlta(false); cerrar(); }}>
      <p className="mb-4 text-sm text-g4">{col?.nombre} · {larga(fecha)}</p>
      {alta ? (
        <FormPaciente listo={(p) => { setPacienteId(p.id); setAlta(false); }} />
      ) : (
        <div className="space-y-3">
          {elegido ? (
            <div className="flex items-center justify-between rounded-xl bg-g1 px-3 py-2 text-sm">
              <span><b>{nombre(elegido)}</b> · Exp. {elegido.exp}</span>
              <button className="text-xs text-g4 underline" onClick={() => setPacienteId('')}>Cambiar</button>
            </div>
          ) : (
            <div>
              <input autoFocus className="campo" placeholder="Buscar paciente por nombre o expediente" value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="mt-1">
                {resultados.map((p) => (
                  <button key={p.id} onClick={() => setPacienteId(p.id)} className="block w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-g1">
                    {nombre(p)} <span className="text-g4">· Exp. {p.exp}</span>
                  </button>
                ))}
                <button onClick={() => setAlta(true)} className="mt-1 text-sm font-semibold text-azul">+ Paciente nuevo</button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold">Tipo
              <select className="campo mt-1" value={tipo} onChange={(e) => setTipo(e.target.value as TipoCita)}>
                {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v.texto}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold">Duración
              <select className="campo mt-1" value={duracion} onChange={(e) => setDuracion(Number(e.target.value))}>
                {[15, 30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </label>
          </div>
          <label className="block text-xs font-semibold">Motivo<input className="campo mt-1" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. control de glaucoma" /></label>
          <Boton disabled={!pacienteId} onClick={() => {
            guardar({ id: nuevoId('c'), sede, columna: datosCita.columna, pacienteId, fecha, hora: datosCita.hora, duracion, tipo, motivo: motivo || TIPOS[tipo].texto, confirmada: false });
            setQ(''); setPacienteId(''); setMotivo('');
          }}>Agendar</Boton>
        </div>
      )}
    </Modal>
  );
}
