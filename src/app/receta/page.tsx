'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useDatos, nuevoId } from '@/lib/datos';
import type { Lente, Orden, Receta } from '@/lib/tipos';
import { edad, larga, sumarDias, hoy } from '@/lib/fechas';
import { nombre, paciente } from '@/lib/util';
import { Boton, Cargando, Pildora } from '@/components/ui';

export default function Pagina() {
  return <Suspense fallback={<Cargando />}><VistaReceta /></Suspense>;
}

function VistaReceta() {
  const id = useSearchParams().get('id') ?? '';
  const { datos, modo } = useDatos();
  if (modo === 'cargando') return <Cargando />;
  const r = datos.recetas.find((x) => x.id === id);
  if (!r) return <p className="text-sm text-g4">No se encontró la receta.</p>;
  return <Hoja key={r.id} receta={r} />;
}

function Hoja({ receta }: { receta: Receta }) {
  const { datos, guardar } = useDatos();
  const router = useRouter();
  const [r, setR] = useState(receta);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cambiar = (n: Receta) => { setR(n); if (t.current) clearTimeout(t.current); t.current = setTimeout(() => guardar('recetas', n), 400); };
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  const p = paciente(datos, r.pacienteId);
  const orden = datos.ordenes.find((o) => o.recetaId === r.id);
  const setLente = (lado: 'od' | 'oi', k: keyof Lente, v: string) => cambiar({ ...r, [lado]: { ...r[lado], [k]: v } });

  const aOptica = () => {
    if (orden) return router.push(`/optica/?orden=${orden.id}`);
    const folios = datos.ordenes.map((o) => Number(o.folio.split('-')[1]) || 0);
    const o: Orden = {
      id: nuevoId('o'), folio: `${new Date().getFullYear()}-${Math.max(1186, ...folios) + 1}`, recetaId: r.id, pacienteId: r.pacienteId,
      fecha: hoy(), estado: 'venta', armazonId: null, micasId: null, tratamientoId: null, total: 0, anticipo: 0, promesa: sumarDias(hoy(), 7), cobrada: false,
    };
    guardar('ordenes', o);
    guardar('recetas', { ...r, enviadaOptica: true });
    router.push(`/optica/?orden=${o.id}`);
  };

  const celda = 'w-full rounded-md border border-transparent px-1 py-0.5 text-center tabular-nums hover:border-g2 focus:border-tinta focus:outline-none print:border-0';

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-imprimir mb-5 flex flex-wrap items-center gap-2">
        <Link href={`/expediente/?id=${r.pacienteId}`} className="mr-auto text-sm text-g4 hover:text-tinta">← Volver al expediente</Link>
        {r.enviadaOptica && <Pildora tono="ok">En Óptica Shalom</Pildora>}
        <Boton variante="borde" onClick={() => window.print()}>Imprimir o guardar PDF</Boton>
        <Boton onClick={aOptica}>{orden ? 'Ver orden en Óptica Shalom' : 'Enviar a Óptica Shalom'}</Boton>
      </div>

      <div className="rounded-2xl border border-g2 bg-white p-8 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-start justify-between border-b-2 border-tinta pb-4">
          <div>
            <div className="font-display text-xl font-extrabold tracking-tight">Clínica de Visión Monte Sinaí</div>
            <div className="mt-1 text-sm">Dr. Edgar Méndez Dávila · Oftalmología</div>
            <div className="text-xs text-g4">Cédula profesional · Cédula de especialidad</div>
          </div>
          <div className="text-right text-xs text-g4">
            <div className="first-letter:uppercase">{larga(r.fecha)}</div>
            <div>Folio {r.id.slice(-6).toUpperCase()}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div className="col-span-2"><span className="text-g4">Paciente:</span> <b>{nombre(p)}</b></div>
          <div className="text-right"><span className="text-g4">Edad:</span> {p ? edad(p.nacimiento) : ''} años</div>
        </div>

        <h2 className="mt-6 font-display text-sm font-extrabold uppercase tracking-wider">Receta de anteojos</h2>
        <table className="mt-2 w-full text-sm">
          <thead><tr className="text-[11px] uppercase tracking-wider text-g4"><th className="w-16 text-left" /><th>Esfera</th><th>Cilindro</th><th>Eje</th><th>Adición</th></tr></thead>
          <tbody>
            {(['od', 'oi'] as const).map((lado) => (
              <tr key={lado} className="border-t border-g2">
                <td className="py-2 font-bold">{lado.toUpperCase()}</td>
                {(['esf', 'cil', 'eje', 'add'] as const).map((k) => (
                  <td key={k} className="py-1"><input className={celda} value={r[lado][k]} onChange={(e) => setLente(lado, k, e.target.value)} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
          <label><span className="text-xs text-g4">DIP (mm)</span><input className="campo mt-0.5 print:border-0 print:p-0" value={r.dip} onChange={(e) => cambiar({ ...r, dip: e.target.value })} /></label>
          <label><span className="text-xs text-g4">Tipo de lente</span>
            <select className="campo mt-0.5 print:appearance-none print:border-0 print:p-0" value={r.tipoLente} onChange={(e) => cambiar({ ...r, tipoLente: e.target.value })}>
              <option>Monofocal</option><option>Progresivo</option><option>Bifocal</option><option>Ocupacional</option>
            </select></label>
          <label><span className="text-xs text-g4">Tratamiento</span><input className="campo mt-0.5 print:border-0 print:p-0" value={r.tratamiento} onChange={(e) => cambiar({ ...r, tratamiento: e.target.value })} /></label>
        </div>

        <h2 className="mt-7 font-display text-sm font-extrabold uppercase tracking-wider">Medicamentos</h2>
        <div className="mt-2 space-y-2">
          {r.medicamentos.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input className="campo flex-1 font-semibold print:border-0 print:p-0" value={m.nombre} placeholder="Medicamento"
                onChange={(e) => cambiar({ ...r, medicamentos: r.medicamentos.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)) })} />
              <input className="campo flex-1 print:border-0 print:p-0" value={m.indicacion} placeholder="Indicación"
                onChange={(e) => cambiar({ ...r, medicamentos: r.medicamentos.map((x, j) => (j === i ? { ...x, indicacion: e.target.value } : x)) })} />
              <button className="no-imprimir px-2 text-g4 hover:text-alerta" onClick={() => cambiar({ ...r, medicamentos: r.medicamentos.filter((_, j) => j !== i) })}>×</button>
            </div>
          ))}
          <button className="no-imprimir text-sm font-semibold text-azul" onClick={() => cambiar({ ...r, medicamentos: [...r.medicamentos, { nombre: '', indicacion: '' }] })}>+ Agregar medicamento</button>
        </div>

        <h2 className="mt-7 font-display text-sm font-extrabold uppercase tracking-wider">Indicaciones</h2>
        <textarea className="campo mt-2 print:border-0 print:p-0" rows={3} value={r.indicaciones} onChange={(e) => cambiar({ ...r, indicaciones: e.target.value })} />

        <div className="mt-12 flex items-end justify-between">
          <div className="flex items-center gap-3 text-[10.5px] text-g4">
            <svg viewBox="0 0 7 7" className="size-14" shapeRendering="crispEdges" aria-label="Código de verificación">
              <path fill="#070708" d="M0 0h3v3H0zM4 0h3v3H4zM0 4h3v3H0zM4 4h1v1H4zM6 4h1v2H6zM4 6h2v1H4zM5 5h1v1H5z" />
              <path fill="#fff" d="M1 1h1v1H1zM5 1h1v1H5zM1 5h1v1H1z" />
            </svg>
            <span>Escanee para verificar<br />que esta receta es auténtica.</span>
          </div>
          <div className="w-56 border-t border-tinta pt-1 text-center text-xs">Dr. Edgar Méndez Dávila</div>
        </div>
      </div>
    </div>
  );
}
