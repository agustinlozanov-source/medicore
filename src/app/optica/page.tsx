'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useDatos } from '@/lib/datos';
import type { EstadoOrden, Orden } from '@/lib/tipos';
import { corta, dinero, hoy } from '@/lib/fechas';
import { nombre, nombreCorto, paciente, producto } from '@/lib/util';
import { Boton, Cargando, Encabezado, Etiqueta, Pildora, Tarjeta } from '@/components/ui';

export default function Pagina() {
  return <Suspense fallback={<Cargando />}><Optica /></Suspense>;
}

const ESTADOS: { id: EstadoOrden; texto: string }[] = [
  { id: 'venta', texto: 'Venta' },
  { id: 'laboratorio', texto: 'En laboratorio' },
  { id: 'llego', texto: 'Llegó' },
  { id: 'lista', texto: 'Lista para entrega' },
  { id: 'entregada', texto: 'Entregada' },
];

function Optica() {
  const { datos, modo } = useDatos();
  const inicial = useSearchParams().get('orden');
  const [sel, setSel] = useState<string | null>(inicial);
  if (modo === 'cargando') return <Cargando />;

  const ordenes = [...datos.ordenes].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const actual = ordenes.find((o) => o.id === (sel ?? ordenes.find((x) => x.estado !== 'entregada')?.id));
  const recetas = datos.recetas.filter((r) => r.enviadaOptica);
  const surtidas = recetas.filter((r) => datos.ordenes.some((o) => o.recetaId === r.id)).length;
  const armazones = datos.productos.filter((p) => p.categoria === 'armazon');
  const atrasadas = ordenes.filter((o) => o.estado === 'laboratorio' && o.promesa < hoy()).length;

  return (
    <>
      <Encabezado icono="lentes" color="#0b5cf5" titulo="Óptica Shalom" sub="La receta llega del consultorio; aquí se vende, se manda al laboratorio y se entrega">
        <Pildora tono="azul">{ordenes.filter((o) => o.estado !== 'entregada').length} órdenes abiertas</Pildora>
        <Pildora tono={atrasadas ? 'alerta' : 'ok'}>{atrasadas} atrasadas en laboratorio</Pildora>
        <Pildora>{recetas.length ? Math.round((surtidas / recetas.length) * 100) : 0} % de recetas surtidas aquí</Pildora>
      </Encabezado>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="space-y-4">
          {ESTADOS.map((e) => {
            const aqui = ordenes.filter((o) => o.estado === e.id);
            if (!aqui.length) return null;
            return (
              <div key={e.id}>
                <Etiqueta>{e.texto} · {aqui.length}</Etiqueta>
                <div className="space-y-2">
                  {aqui.map((o) => (
                    <button key={o.id} onClick={() => setSel(o.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${actual?.id === o.id ? 'border-tinta bg-g1' : 'border-g2 hover:border-g4'}`}>
                      <span><b>{nombreCorto(paciente(datos, o.pacienteId))}</b><span className="block text-xs text-g4">Orden {o.folio} · promesa {corta(o.promesa)}</span></span>
                      <span className="text-right text-xs">{o.total ? dinero(o.total) : 'Sin armar'}{o.cobrada && <span className="block text-ok">Pagada</span>}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <Tarjeta className="overflow-x-auto p-5">
            <Etiqueta>Inventario de armazones</Etiqueta>
            <table className="w-full text-sm">
              <tbody>
                {armazones.map((a) => (
                  <tr key={a.id} className="border-t border-g2 first:border-0">
                    <td className="py-1.5 pr-2">{a.nombre.replace('Armazón ', '')}</td>
                    <td className="py-1.5 pr-2 text-right tabular-nums">{dinero(a.precio)}</td>
                    <td className="py-1.5 text-right">{a.existencia === 0 ? <Pildora tono="alerta">Agotado</Pildora> : a.existencia! <= 2 ? <Pildora tono="ambar">{a.existencia} pzas</Pildora> : <span className="text-g4">{a.existencia} pzas</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Tarjeta>
        </div>

        {actual ? <DetalleOrden key={actual.id} orden={actual} /> : <Tarjeta className="p-8 text-sm text-g4">No hay órdenes. Se crean desde la receta del consultorio.</Tarjeta>}
      </div>
    </>
  );
}

function DetalleOrden({ orden }: { orden: Orden }) {
  const { datos, guardar } = useDatos();
  const [aviso, setAviso] = useState(false);
  const p = paciente(datos, orden.pacienteId);
  const receta = datos.recetas.find((r) => r.id === orden.recetaId);
  const de = (cat: string) => datos.productos.filter((x) => x.categoria === cat);
  const precio = (id: string | null) => (id ? producto(datos, id)?.precio ?? 0 : 0);

  const cambiar = (n: Partial<Orden>) => {
    const o = { ...orden, ...n };
    o.total = precio(o.armazonId) + precio(o.micasId) + precio(o.tratamientoId);
    guardar('ordenes', o);
  };
  const i = ESTADOS.findIndex((e) => e.id === orden.estado);

  return (
    <Tarjeta className="p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-display text-lg font-extrabold">Orden {orden.folio}</div>
          <Link href={`/expediente/?id=${orden.pacienteId}`} className="text-sm text-g4 hover:underline">{nombre(p)} · Exp. {p?.exp} · paciente de Monte Sinaí</Link>
        </div>
        {orden.cobrada ? <Pildora tono="ok">Pagada</Pildora> : orden.anticipo > 0 ? <Pildora tono="ambar">Anticipo {dinero(orden.anticipo)}</Pildora> : null}
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {ESTADOS.map((e, j) => (
          <button key={e.id} onClick={() => cambiar({ estado: e.id })}
            className={`rounded-full border px-3 py-1 text-xs ${j === i ? 'border-tinta bg-tinta font-semibold text-white' : j < i ? 'border-g2 text-tinta' : 'border-g2 text-g4'}`}>
            {j < i ? '✓ ' : ''}{e.texto}
          </button>
        ))}
      </div>

      {receta && (
        <>
          <Etiqueta>Graduación · desde la consulta del Dr. Méndez, {corta(receta.fecha)}</Etiqueta>
          <table className="mb-5 w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wider text-g4"><th className="text-left" /><th>Esf.</th><th>Cil.</th><th>Eje</th><th>Add.</th></tr></thead>
            <tbody>
              {(['od', 'oi'] as const).map((l) => (
                <tr key={l} className="border-t border-g2 text-center tabular-nums">
                  <td className="py-1.5 text-left font-bold">{l.toUpperCase()}</td><td>{receta[l].esf || '—'}</td><td>{receta[l].cil || '—'}</td><td>{receta[l].eje ? `${receta[l].eje}°` : '—'}</td><td>{receta[l].add || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="-mt-3 mb-5 text-xs text-g4">DIP {receta.dip} mm · {receta.tipoLente} · {receta.tratamiento}</p>
        </>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {([['armazonId', 'armazon', 'Armazón'], ['micasId', 'mica', 'Micas'], ['tratamientoId', 'tratamiento', 'Tratamiento']] as const).map(([k, cat, t]) => (
          <label key={k} className="text-xs font-semibold">{t}
            <select className="campo mt-1" value={orden[k] ?? ''} onChange={(e) => cambiar({ [k]: e.target.value || null })}>
              <option value="">Elegir…</option>
              {de(cat).map((x) => (
                <option key={x.id} value={x.id} disabled={x.existencia === 0}>{x.nombre.replace(/^(Armazón|Micas) /, '')} · {dinero(x.precio)}{x.existencia === 0 ? ' · agotado' : ''}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="mt-5 grid gap-3 border-t border-g2 pt-4 text-sm md:grid-cols-3">
        <div><div className="text-xs text-g4">Total</div><div className="font-display text-2xl font-extrabold">{dinero(orden.total)}</div></div>
        <label className="text-xs font-semibold">Anticipo
          <input type="number" className="campo mt-1" value={orden.anticipo || ''} onChange={(e) => cambiar({ anticipo: Number(e.target.value) || 0 })} />
        </label>
        <label className="text-xs font-semibold">Promesa de entrega
          <input type="date" className="campo mt-1" value={orden.promesa} onChange={(e) => cambiar({ promesa: e.target.value })} />
        </label>
      </div>
      <p className="mt-2 text-sm text-g4">Saldo: <b className="text-tinta">{dinero(Math.max(0, orden.total - orden.anticipo))}</b></p>

      <div className="mt-5 flex flex-wrap gap-2">
        {!orden.cobrada && orden.total > 0 && <Link href={`/caja/?orden=${orden.id}`}><Boton>Cobrar en caja</Boton></Link>}
        {orden.estado === 'lista' && <Boton variante="borde" onClick={() => setAviso(true)}>Avisar por WhatsApp que está lista</Boton>}
      </div>
      {aviso && (
        <div className="mt-4 max-w-sm rounded-2xl bg-[#d9fdd3] p-3 text-sm text-[#111b21] shadow-sm">
          Hola {p?.nombre.split(' ')[0]}, sus anteojos ya están listos en Óptica Shalom. Lo esperamos de 9 a 19 h. Saldo pendiente: {dinero(Math.max(0, orden.total - orden.anticipo))}.
          <div className="mt-1 text-right text-[10px] text-g4">Enviado · demo</div>
        </div>
      )}
    </Tarjeta>
  );
}
