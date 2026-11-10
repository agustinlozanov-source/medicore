'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDatos } from '@/lib/datos';
import type { Etapa, Visita } from '@/lib/tipos';
import { hoy, minutosDesde } from '@/lib/fechas';
import { ETAPAS, nombreCorto, paciente } from '@/lib/util';
import { Cargando, Encabezado, Pildora } from '@/components/ui';

// La dilatación tarda; pasados estos minutos el paciente ya puede pasar.
const DILATACION_LISTA = 20;

export default function Flujo() {
  const { datos, modo, sede, guardar } = useDatos();
  const [, latido] = useState(0);
  useEffect(() => { const i = setInterval(() => latido((x) => x + 1), 20000); return () => clearInterval(i); }, []);
  if (modo === 'cargando') return <Cargando />;

  const visitas = datos.visitas.filter((v) => v.fecha === hoy() && v.sede === sede);
  const activas = visitas.filter((v) => v.etapa !== 'salio');
  const espera = activas.length ? Math.round(activas.reduce((s, v) => s + minutosDesde(v.etapaDesde), 0) / activas.length) : 0;
  const etapas = ETAPAS.filter((e) => e.id !== 'salio' && (sede === 'ms' || !['dilatacion', 'medico'].includes(e.id)));

  const mover = (v: Visita, etapa: Etapa) => guardar('visitas', { ...v, etapa, etapaDesde: Date.now() });

  return (
    <>
      <Encabezado icono="flujo" color="#108fc2" titulo="Flujo de hoy" sub="Dónde está cada paciente ahora mismo">
        <Pildora tono="azul">{activas.length} en la clínica</Pildora>
        <Pildora tono={espera > 25 ? 'ambar' : 'ok'}>Espera promedio {espera} min</Pildora>
        <Pildora>{visitas.filter((v) => v.etapa === 'salio').length} ya salieron</Pildora>
      </Encabezado>

      <div className="grid gap-3 overflow-x-auto pb-2" style={{ gridTemplateColumns: `repeat(${etapas.length}, minmax(170px, 1fr))` }}>
        {etapas.map((e, i) => {
          const aqui = activas.filter((v) => v.etapa === e.id).sort((a, b) => a.etapaDesde - b.etapaDesde);
          return (
            <div key={e.id} className="min-h-[420px] rounded-2xl border border-g2 bg-g1 p-2.5">
              <div className="mb-2.5 flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-g4">
                <span>{e.texto}</span><span>{aqui.length}</span>
              </div>
              {aqui.map((v) => {
                const p = paciente(datos, v.pacienteId);
                const m = minutosDesde(v.etapaDesde);
                const dilatado = e.id === 'dilatacion' && m >= DILATACION_LISTA;
                const siguiente = etapas[i + 1]?.id ?? 'salio';
                return (
                  <div key={v.id} className={`mb-2 rounded-xl border bg-white p-2.5 text-sm shadow-sm ${dilatado ? 'border-ok' : 'border-g2'}`}>
                    <Link href={`/expediente/?id=${v.pacienteId}`} className="block font-semibold leading-tight hover:underline">{nombreCorto(p)}</Link>
                    <div className="mt-0.5 truncate text-[11.5px] text-g4">{v.motivo}</div>
                    <div className={`mt-1.5 text-[11.5px] font-semibold ${dilatado ? 'text-ok' : m > 25 ? 'text-ambar' : 'text-g5'}`}>
                      {e.id === 'dilatacion' ? (dilatado ? `Lista para pasar · ${m} min` : `Dilatando · ${m} de ${DILATACION_LISTA} min`) : `${m} min aquí`}
                    </div>
                    {p?.alergias.length ? <div className="mt-1 text-[11px] font-semibold text-alerta">Alergia: {p.alergias.join(', ')}</div> : null}
                    <div className="mt-2 flex gap-1">
                      {i > 0 && (
                        <button onClick={() => mover(v, etapas[i - 1].id)} className="rounded-full border border-g2 px-2 py-0.5 text-[11px] text-g4 hover:border-tinta hover:text-tinta">←</button>
                      )}
                      <button onClick={() => mover(v, siguiente)} className="flex-1 rounded-full bg-tinta px-2 py-1 text-[11px] font-bold text-white hover:opacity-85">
                        {siguiente === 'salio' ? 'Salió' : `Pasar a ${ETAPAS.find((x) => x.id === siguiente)!.texto.toLowerCase()}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-g4">Recepción, optometría y el médico ven este mismo tablero. La llegada se registra desde la agenda.</p>
    </>
  );
}
