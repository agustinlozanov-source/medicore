'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useDatos } from '@/lib/datos';
import { corta, dinero, hoy, sumarDias } from '@/lib/fechas';
import { nombre, ultimaVisita } from '@/lib/util';
import { Boton, Cargando, Encabezado, Etiqueta, Pildora, Tarjeta } from '@/components/ui';

const LINEAS = [
  { sede: 'ms', linea: 'consulta', texto: 'Consulta y estudios · Monte Sinaí' },
  { sede: 'ms', linea: 'cirugia', texto: 'Cirugía · Monte Sinaí' },
  { sede: 'shalom', linea: 'optica', texto: 'Óptica Shalom' },
  { sede: 'shalom', linea: 'consulta', texto: 'Exámenes y estudios · Shalom' },
] as const;

export default function Direccion() {
  const { datos, modo } = useDatos();
  const [avisados, setAvisados] = useState<string[]>([]);
  if (modo === 'cargando') return <Cargando />;

  const desde = sumarDias(hoy(), -29);
  const ventas = datos.ventas.filter((v) => v.fecha.slice(0, 10) >= desde);
  const total = ventas.reduce((s, v) => s + v.total, 0);
  const costo = ventas.reduce((s, v) => s + v.partidas.reduce((a, p) => a + p.costo * p.cantidad, 0), 0);
  const cirugias = ventas.filter((v) => v.linea === 'cirugia').length;
  const atenciones = ventas.filter((v) => v.linea === 'consulta').length;

  // Pacientes de glaucoma cuyo último control fue hace más de cuatro meses.
  const vencidos = datos.pacientes
    .filter((p) => p.diagnosticos.some((d) => d.startsWith('H40')))
    .map((p) => ({ p, u: ultimaVisita(datos, p.id) }))
    .filter(({ u }) => !u || u.fecha < sumarDias(hoy(), -120));

  const dias = Array.from({ length: 30 }, (_, i) => sumarDias(desde, i));
  const porDia = dias.map((d) => ({
    d,
    ms: ventas.filter((v) => v.sede === 'ms' && v.fecha.startsWith(d)).reduce((s, v) => s + v.total, 0),
    sh: ventas.filter((v) => v.sede === 'shalom' && v.fecha.startsWith(d)).reduce((s, v) => s + v.total, 0),
  }));
  const max = Math.max(...porDia.map((x) => x.ms + x.sh), 1);
  const bajos = datos.productos.filter((p) => p.existencia !== null && p.existencia <= 2);

  return (
    <>
      <Encabezado icono="barras" color="#3533cd" titulo="Dirección" sub="Monte Sinaí y Óptica Shalom · últimos 30 días">
        <Pildora>Del {corta(desde)} a hoy</Pildora>
      </Encabezado>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { v: dinero(total), t: 'vendido entre las dos sedes' },
          { v: `${total ? Math.round(((total - costo) / total) * 100) : 0} %`, t: `margen bruto · ${dinero(total - costo)}` },
          { v: String(atenciones), t: 'consultas y estudios cobrados' },
          { v: String(cirugias), t: 'cirugías' },
        ].map((k) => (
          <Tarjeta key={k.t} className="p-4">
            <div className="font-display text-2xl font-extrabold tracking-tight">{k.v}</div>
            <div className="mt-1 text-xs text-g4">{k.t}</div>
          </Tarjeta>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Tarjeta className="overflow-x-auto p-5">
            <Etiqueta>Ventas, costo y margen por línea</Etiqueta>
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-[11px] uppercase tracking-wider text-g4"><th className="pb-2">Línea</th><th className="pb-2 text-right">Ventas</th><th className="pb-2 text-right">Costo</th><th className="pb-2 text-right">Margen</th></tr></thead>
              <tbody>
                {LINEAS.map((l) => {
                  const vs = ventas.filter((v) => v.sede === l.sede && v.linea === l.linea);
                  const t = vs.reduce((s, v) => s + v.total, 0);
                  const c = vs.reduce((s, v) => s + v.partidas.reduce((a, p) => a + p.costo * p.cantidad, 0), 0);
                  return (
                    <tr key={l.texto} className="border-t border-g2">
                      <td className="py-2">{l.texto}<span className="block text-xs text-g4">{vs.length} ventas</span></td>
                      <td className="py-2 text-right tabular-nums">{dinero(t)}</td>
                      <td className="py-2 text-right tabular-nums text-g4">{dinero(c)}</td>
                      <td className="py-2 text-right font-semibold tabular-nums">{t ? Math.round(((t - c) / t) * 100) : 0} %</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-g4">Cada servicio y producto lleva su costo. Estos mismos datos alimentan después la contabilidad o un ERP.</p>
          </Tarjeta>

          <Tarjeta className="p-5">
            <Etiqueta>Ventas por día</Etiqueta>
            <div className="flex h-44 items-end gap-[3px]">
              {porDia.map((x) => (
                <div key={x.d} className="flex flex-1 flex-col justify-end" title={`${corta(x.d)} · ${dinero(x.ms + x.sh)}`}>
                  <div className="rounded-t-[3px] bg-indigo" style={{ height: `${(x.sh / max) * 160}px` }} />
                  <div className="bg-verde" style={{ height: `${(x.ms / max) * 160}px` }} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-g4"><span>{corta(desde)}</span><span>hoy</span></div>
            <div className="mt-2 flex gap-4 text-[11px] text-g4">
              <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px] bg-verde" />Monte Sinaí</span>
              <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px] bg-indigo" />Óptica Shalom</span>
            </div>
          </Tarjeta>
        </div>

        <div className="space-y-5">
          <Tarjeta className="p-5">
            <Etiqueta>Glaucoma con control vencido</Etiqueta>
            <p className="mb-3 text-xs text-g4">Pacientes de glaucoma que no han vuelto en más de cuatro meses. Flow Hub CRM les manda el recordatorio.</p>
            {vencidos.map(({ p, u }) => (
              <div key={p.id} className="flex items-center justify-between gap-2 border-t border-g2 py-2 text-sm">
                <Link href={`/expediente/?id=${p.id}`} className="hover:underline">{nombre(p)}<span className="block text-xs text-g4">Último control: {u ? corta(u.fecha) : 'nunca'}</span></Link>
                {avisados.includes(p.id) ? <Pildora tono="ok">Recordatorio enviado</Pildora>
                  : <Boton variante="borde" className="!px-3 !py-1 !text-xs" onClick={() => setAvisados([...avisados, p.id])}>Recordar por WhatsApp</Boton>}
              </div>
            ))}
            {!vencidos.length && <p className="text-sm text-g4">Todos al día.</p>}
          </Tarjeta>

          <Tarjeta className="p-5">
            <Etiqueta>Inventario por surtir</Etiqueta>
            {bajos.map((p) => (
              <div key={p.id} className="flex justify-between border-t border-g2 py-2 text-sm first:border-0">
                <span>{p.nombre}</span>{p.existencia === 0 ? <Pildora tono="alerta">Agotado</Pildora> : <Pildora tono="ambar">{p.existencia} pzas</Pildora>}
              </div>
            ))}
          </Tarjeta>
        </div>
      </div>
    </>
  );
}
