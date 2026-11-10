'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useDatos, nuevoId } from '@/lib/datos';
import type { Partida, Venta } from '@/lib/tipos';
import { dinero, hoy } from '@/lib/fechas';
import { ETAPAS, nombre, nombreCorto, paciente, producto } from '@/lib/util';
import { Avatar, Boton, Cargando, Encabezado, Etiqueta, Pildora, Tarjeta } from '@/components/ui';

export default function Pagina() {
  return <Suspense fallback={<Cargando />}><Caja /></Suspense>;
}

type Cuenta = { clave: string; tipo: 'visita' | 'orden'; id: string; pacienteId: string; detalle: string };

function Caja() {
  const { datos, modo, sede, setSede, guardar } = useDatos();
  const ordenParam = useSearchParams().get('orden');
  const [sel, setSel] = useState<string | null>(ordenParam ? `orden:${ordenParam}` : null);
  const [extra, setExtra] = useState<Partida[]>([]);
  const [metodo, setMetodo] = useState<Venta['metodo']>('Tarjeta');
  const [factura, setFactura] = useState(true);
  const [q, setQ] = useState('');
  const [hecho, setHecho] = useState<string | null>(null);

  useEffect(() => { if (ordenParam) setSede('shalom'); }, [ordenParam, setSede]);
  if (modo === 'cargando') return <Cargando />;

  const cuentas: Cuenta[] = [
    ...datos.visitas.filter((v) => v.fecha === hoy() && v.sede === sede && !v.cobrada && v.servicios.length)
      .sort((a, b) => (a.etapa === 'caja' ? -1 : 0) - (b.etapa === 'caja' ? -1 : 0))
      .map((v) => ({ clave: `visita:${v.id}`, tipo: 'visita' as const, id: v.id, pacienteId: v.pacienteId, detalle: `${v.motivo} · ${ETAPAS.find((e) => e.id === v.etapa)?.texto}` })),
    ...(sede === 'shalom' ? datos.ordenes.filter((o) => !o.cobrada && o.total > 0)
      .map((o) => ({ clave: `orden:${o.id}`, tipo: 'orden' as const, id: o.id, pacienteId: o.pacienteId, detalle: `Orden de óptica ${o.folio}` })) : []),
  ];
  const actual = cuentas.find((c) => c.clave === sel) ?? null;

  const base: Partida[] = (() => {
    if (!actual) return [];
    const partida = (id: string | null): Partida[] => {
      const p = id ? producto(datos, id) : undefined;
      return p ? [{ productoId: p.id, nombre: p.nombre, cantidad: 1, precio: p.precio, costo: p.costo }] : [];
    };
    if (actual.tipo === 'visita') return datos.visitas.find((v) => v.id === actual.id)!.servicios.flatMap(partida);
    const o = datos.ordenes.find((x) => x.id === actual.id)!;
    return [...partida(o.armazonId), ...partida(o.micasId), ...partida(o.tratamientoId)];
  })();
  const partidas = [...base, ...extra];
  const total = partidas.reduce((s, p) => s + p.precio * p.cantidad, 0);
  const orden = actual?.tipo === 'orden' ? datos.ordenes.find((o) => o.id === actual.id) : undefined;
  const anticipo = orden?.anticipo ?? 0;
  const aCobrar = Math.max(0, total - anticipo);

  const cobrar = () => {
    if (!actual) return;
    const linea: Venta['linea'] = actual.tipo === 'orden' ? 'optica' : partidas.some((p) => producto(datos, p.productoId)?.categoria === 'cirugia') ? 'cirugia' : 'consulta';
    guardar('ventas', {
      id: nuevoId('s'), sede, pacienteId: actual.pacienteId, visitaId: actual.tipo === 'visita' ? actual.id : null, ordenId: orden?.id ?? null,
      fecha: `${hoy()}T${new Date().toTimeString().slice(0, 8)}`, partidas, total, metodo, linea,
    });
    for (const p of partidas) {
      const prod = producto(datos, p.productoId);
      if (prod && prod.existencia !== null) guardar('productos', { ...prod, existencia: Math.max(0, prod.existencia - p.cantidad) });
    }
    if (actual.tipo === 'visita') {
      const v = datos.visitas.find((x) => x.id === actual.id)!;
      guardar('visitas', { ...v, cobrada: true, etapa: v.etapa === 'caja' ? 'salio' : v.etapa, etapaDesde: v.etapa === 'caja' ? Date.now() : v.etapaDesde });
    } else if (orden) {
      guardar('ordenes', { ...orden, cobrada: true, estado: orden.estado === 'lista' ? 'entregada' : orden.estado });
    }
    setHecho(`${nombreCorto(paciente(datos, actual.pacienteId))} · ${dinero(aCobrar)} con ${metodo.toLowerCase()}${factura ? ' · la factura sale sola' : ''}`);
    setSel(null); setExtra([]); setQ('');
  };

  const ventasHoy = datos.ventas.filter((v) => v.sede === sede && v.fecha.startsWith(hoy())).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const corte = (['Efectivo', 'Tarjeta', 'Transferencia'] as const).map((m) => ({ m, t: ventasHoy.filter((v) => v.metodo === m).reduce((s, v) => s + v.total, 0) }));
  const t = q.toLowerCase();
  const catalogo = t ? datos.productos.filter((p) => p.sede === sede && p.nombre.toLowerCase().includes(t)).slice(0, 6) : [];

  return (
    <>
      <Encabezado icono="caja" color="#2047e1" titulo="Punto de venta" sub={`Caja ${sede === 'ms' ? 'Monte Sinaí' : 'Óptica Shalom'} · cada cobro, ligado al paciente`}>
        <Pildora tono="ok">Turno abierto</Pildora>
        <Pildora>{ventasHoy.length} ventas hoy · {dinero(ventasHoy.reduce((s, v) => s + v.total, 0))}</Pildora>
      </Encabezado>

      {hecho && <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-ok">✓ Cobrado: {hecho}</div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <div>
          <Etiqueta>Por cobrar</Etiqueta>
          <div className="space-y-2">
            {cuentas.length === 0 && <p className="text-sm text-g4">No hay cuentas pendientes en esta caja.</p>}
            {cuentas.map((c) => (
              <button key={c.clave} onClick={() => { setSel(c.clave); setExtra([]); setHecho(null); }}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${sel === c.clave ? 'border-tinta bg-g1' : 'border-g2 hover:border-g4'}`}>
                <b>{nombreCorto(paciente(datos, c.pacienteId))}</b>
                <span className="block truncate text-xs text-g4">{c.detalle}</span>
              </button>
            ))}
          </div>
        </div>

        <Tarjeta className="p-5">
          {!actual ? <p className="py-10 text-center text-sm text-g4">Elige una cuenta para cobrar.</p> : (
            <>
              <div className="mb-4 flex items-center gap-3">
                <Avatar nombre={paciente(datos, actual.pacienteId)!.nombre} apellidos={paciente(datos, actual.pacienteId)!.apellidos} />
                <div><div className="font-semibold">{nombre(paciente(datos, actual.pacienteId))}</div><div className="text-xs text-g4">{actual.detalle}</div></div>
              </div>
              {partidas.map((p, i) => (
                <div key={i} className="flex justify-between border-b border-g2 py-2 text-sm">
                  <span>{p.nombre}{i >= base.length && <button className="ml-2 text-g4 hover:text-alerta" onClick={() => setExtra(extra.filter((_, j) => j !== i - base.length))}>×</button>}</span>
                  <b className="tabular-nums">{dinero(p.precio)}</b>
                </div>
              ))}
              <input className="campo mt-3" placeholder="Agregar producto: gotas, lentes de contacto…" value={q} onChange={(e) => setQ(e.target.value)} />
              {catalogo.map((p) => (
                <button key={p.id} className="block w-full px-2 py-1 text-left text-sm hover:bg-g1"
                  onClick={() => { setExtra([...extra, { productoId: p.id, nombre: p.nombre, cantidad: 1, precio: p.precio, costo: p.costo }]); setQ(''); }}>
                  {p.nombre} · {dinero(p.precio)}{p.existencia !== null && <span className="text-g4"> · {p.existencia} en existencia</span>}
                </button>
              ))}
              {anticipo > 0 && <div className="mt-3 flex justify-between text-sm text-g4"><span>Anticipo recibido</span><span>−{dinero(anticipo)}</span></div>}
              <div className="mt-3 flex items-baseline justify-between font-display text-2xl font-extrabold"><span>Total</span><span>{dinero(aCobrar)}</span></div>

              <div className="mt-4 grid grid-cols-3 gap-1.5">
                {(['Efectivo', 'Tarjeta', 'Transferencia'] as const).map((m) => (
                  <button key={m} onClick={() => setMetodo(m)} className={`rounded-full border py-2 text-xs ${metodo === m ? 'border-tinta bg-tinta font-semibold text-white' : 'border-g2 text-g5'}`}>{m}</button>
                ))}
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={factura} onChange={(e) => setFactura(e.target.checked)} />Factura con el RFC guardado</label>
              <Boton className="mt-4 w-full !py-3" onClick={cobrar}>Cobrar {dinero(aCobrar)}</Boton>
              <div className="mt-3 flex flex-wrap gap-1 text-[10.5px]">
                {['Cita', 'Optometría', 'Estudios', 'Consulta', 'Cobro'].map((x) => <span key={x} className="rounded-full border border-g2 bg-g1 px-2 py-0.5">{x}</span>)}
              </div>
            </>
          )}
        </Tarjeta>

        <div>
          <Etiqueta>Corte de hoy</Etiqueta>
          <Tarjeta className="mb-4 p-4 text-sm">
            {corte.map((c) => <div key={c.m} className="flex justify-between py-1"><span className="text-g4">{c.m}</span><b className="tabular-nums">{dinero(c.t)}</b></div>)}
            <div className="mt-1 flex justify-between border-t border-g2 pt-2 font-semibold"><span>Total</span><span>{dinero(corte.reduce((s, c) => s + c.t, 0))}</span></div>
          </Tarjeta>
          <Etiqueta>Ventas de hoy</Etiqueta>
          {ventasHoy.map((v) => (
            <div key={v.id} className="flex justify-between border-b border-g2 py-2 text-sm">
              <span>{nombreCorto(paciente(datos, v.pacienteId))}<span className="block text-xs text-g4">{v.fecha.slice(11, 16)} · {v.metodo}</span></span>
              <b className="tabular-nums">{dinero(v.total)}</b>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
