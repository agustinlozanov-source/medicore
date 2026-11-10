'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useDatos, nuevoId } from '@/lib/datos';
import type { Antecedente, Estudio, Ojo, Receta, TipoEstudio, Visita } from '@/lib/tipos';
import { corta, edad, hoy } from '@/lib/fechas';
import { buscarCie, descCie } from '@/lib/cie10';
import { ETAPAS, nombre, nuevaVisita, paciente, producto, visitaDeHoy } from '@/lib/util';
import { Avatar, Boton, Cargando, Etiqueta, Pildora, Tarjeta } from '@/components/ui';
import { Esquema, GraficaPIO } from '@/components/Graficas';

export default function Pagina() {
  return <Suspense fallback={<Cargando />}><Expediente /></Suspense>;
}

type Pestana = 'consulta' | 'historial' | 'estudios' | 'antecedentes';

function Expediente() {
  const id = useSearchParams().get('id') ?? '';
  const { datos, modo, sede, guardar } = useDatos();
  const [pestana, setPestana] = useState<Pestana>('consulta');
  if (modo === 'cargando') return <Cargando />;
  const p = paciente(datos, id);
  if (!p) return <p className="text-sm text-g4">No se encontró el paciente. <Link className="underline" href="/pacientes/">Volver a pacientes</Link></p>;
  const vHoy = visitaDeHoy(datos, p.id);
  const estudios = datos.estudios.filter((e) => e.pacienteId === p.id);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <Avatar nombre={p.nombre} apellidos={p.apellidos} tam="size-12" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">{nombre(p)}</h1>
          <p className="text-sm text-g4">{edad(p.nacimiento)} años · Exp. {p.exp} · {p.telefono}{vHoy ? ` · Hoy: ${ETAPAS.find((e) => e.id === vHoy.etapa)?.texto}` : ''}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {p.diagnosticos.map((d) => <Pildora key={d}>{d} {descCie(d)}</Pildora>)}
          {p.alergias.map((a) => <Pildora key={a} tono="alerta">Alergia: {a}</Pildora>)}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {([['consulta', 'Consulta de hoy'], ['historial', 'Historial'], ['estudios', `Estudios (${estudios.length})`], ['antecedentes', 'Antecedentes']] as const).map(([k, t]) => (
          <button key={k} onClick={() => setPestana(k)}
            className={`rounded-full border px-3.5 py-1.5 text-sm ${pestana === k ? 'border-tinta bg-tinta font-semibold text-white' : 'border-g2 text-g5 hover:border-tinta'}`}>{t}</button>
        ))}
      </div>

      {pestana === 'consulta' && (vHoy
        ? <Consulta key={vHoy.id} visita={vHoy} />
        : (
          <Tarjeta className="p-8 text-center">
            <p className="mb-4 text-sm text-g4">{nombre(p)} no tiene consulta abierta hoy.</p>
            <Boton onClick={() => guardar('visitas', { ...nuevaVisita(datos, p.id, sede, null, 'Consulta'), etapa: 'medico' })}>Iniciar consulta</Boton>
          </Tarjeta>
        ))}
      {pestana === 'historial' && <Historial pacienteId={p.id} />}
      {pestana === 'estudios' && <Estudios pacienteId={p.id} />}
      {pestana === 'antecedentes' && <Antecedentes pacienteId={p.id} />}
    </>
  );
}

const FILAS: { k: keyof Ojo; t: string }[] = [
  { k: 'avsc', t: 'AV sin corrección' }, { k: 'avcc', t: 'AV con corrección' },
  { k: 'esf', t: 'Esfera' }, { k: 'cil', t: 'Cilindro' }, { k: 'eje', t: 'Eje' }, { k: 'add', t: 'Adición' },
  { k: 'k1', t: 'K1' }, { k: 'k2', t: 'K2' }, { k: 'pio', t: 'PIO (mmHg)' }, { k: 'cristalino', t: 'Cristalino (LOCS)' }, { k: 'cd', t: 'Excavación C/D' },
];

function Consulta({ visita }: { visita: Visita }) {
  const { datos, guardar } = useDatos();
  const router = useRouter();
  const [v, setV] = useState(visita);
  const [q, setQ] = useState('');
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Se guarda solo, medio segundo después de dejar de escribir.
  const cambiar = (nueva: Visita) => {
    setV(nueva);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => guardar('visitas', nueva), 500);
  };
  useEffect(() => () => { if (temporizador.current) clearTimeout(temporizador.current); }, []);
  // Si otra pantalla mueve la etapa, se respeta.
  useEffect(() => { setV((x) => ({ ...x, etapa: visita.etapa, etapaDesde: visita.etapaDesde, cobrada: visita.cobrada })); }, [visita.etapa, visita.etapaDesde, visita.cobrada]);

  const setOjo = (lado: 'od' | 'oi', k: keyof Ojo, valor: string) => cambiar({ ...v, [lado]: { ...v[lado], [k]: valor } });
  const historia = [...datos.visitas.filter((x) => x.pacienteId === v.pacienteId && x.id !== v.id), v];
  const anterior = datos.visitas.filter((x) => x.pacienteId === v.pacienteId && x.fecha < v.fecha).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  const estudiosHoy = datos.estudios.filter((e) => e.pacienteId === v.pacienteId).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 3);
  const servicios = datos.productos.filter((x) => x.sede === v.sede && ['consulta', 'estudio', 'medicamento', 'cirugia'].includes(x.categoria));
  const receta = datos.recetas.find((r) => r.visitaId === v.id);

  const generarReceta = () => {
    if (receta) return router.push(`/receta/?id=${receta.id}`);
    const lente = (o: Ojo) => ({ esf: o.esf, cil: o.cil, eje: o.eje, add: o.add });
    const r: Receta = {
      id: nuevoId('r'), visitaId: v.id, pacienteId: v.pacienteId, fecha: hoy(), od: lente(v.od), oi: lente(v.oi), dip: '62',
      tipoLente: v.od.add || v.oi.add ? 'Progresivo' : 'Monofocal', tratamiento: 'Antirreflejante',
      medicamentos: [...v.diagnosticos.map((d) => d.cie), ...(paciente(datos, v.pacienteId)?.diagnosticos ?? [])].some((d) => d.startsWith('H40')) ? [{ nombre: 'Latanoprost 0.005 % solución oftálmica', indicacion: '1 gota en ojo izquierdo cada noche' }] : [],
      indicaciones: v.plan, enviadaOptica: false,
    };
    guardar('recetas', r);
    router.push(`/receta/?id=${r.id}`);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
      <div className="space-y-5">
        <Tarjeta className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <Etiqueta>Agudeza, refracción y presión</Etiqueta>
            {anterior && <span className="text-[11px] text-g4">Gris: visita anterior, {corta(anterior.fecha)}</span>}
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-g4"><th className="pb-2 font-bold" /><th className="pb-2 font-bold">OD</th><th className="pb-2 font-bold">OI</th></tr></thead>
            <tbody>
              {FILAS.map((f) => (
                <tr key={f.k} className="border-t border-g2">
                  <td className="py-1.5 pr-3 text-g5">{f.t}</td>
                  {(['od', 'oi'] as const).map((lado) => {
                    const alto = f.k === 'pio' && Number(v[lado].pio) > 21;
                    return (
                      <td key={lado} className="py-1 pr-2">
                        <input value={v[lado][f.k]} onChange={(e) => setOjo(lado, f.k, e.target.value)}
                          className={`campo !py-1 tabular-nums ${alto ? '!border-alerta font-bold text-alerta' : ''}`}
                          placeholder={anterior?.[lado][f.k] || ''} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>

        <Tarjeta className="grid gap-4 p-5 md:grid-cols-2">
          {(['od', 'oi'] as const).map((lado) => (
            <div key={lado} className="space-y-2">
              <Etiqueta>{lado.toUpperCase()}</Etiqueta>
              <textarea className="campo" rows={2} placeholder="Segmento anterior · lámpara de hendidura" value={v[lado].sa} onChange={(e) => setOjo(lado, 'sa', e.target.value)} />
              <textarea className="campo" rows={2} placeholder="Fondo de ojo" value={v[lado].fo} onChange={(e) => setOjo(lado, 'fo', e.target.value)} />
            </div>
          ))}
        </Tarjeta>

        <Tarjeta className="p-5">
          <Etiqueta>Diagnóstico CIE-10</Etiqueta>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {v.diagnosticos.map((d, i) => (
              <span key={i} className="inline-flex items-center gap-2 rounded-full bg-g1 px-3 py-1 text-sm">
                <b>{d.cie}</b> {d.desc}
                <select className="bg-transparent text-xs" value={d.ojo} onChange={(e) => cambiar({ ...v, diagnosticos: v.diagnosticos.map((x, j) => (j === i ? { ...x, ojo: e.target.value as 'OD' } : x)) })}>
                  <option>OD</option><option>OI</option><option>AO</option>
                </select>
                <button className="text-g4 hover:text-alerta" onClick={() => cambiar({ ...v, diagnosticos: v.diagnosticos.filter((_, j) => j !== i) })}>×</button>
              </span>
            ))}
          </div>
          <input className="campo" placeholder="Buscar por clave o descripción: glaucoma, H25, miopía…" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && (
            <div className="mt-1 rounded-xl border border-g2">
              {buscarCie(q).map((c) => (
                <button key={c.cie} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-g1"
                  onClick={() => {
                    cambiar({ ...v, diagnosticos: [...v.diagnosticos, { ...c, ojo: 'AO' }] });
                    const pac = paciente(datos, v.pacienteId);
                    if (pac && !pac.diagnosticos.includes(c.cie)) guardar('pacientes', { ...pac, diagnosticos: [...pac.diagnosticos, c.cie] });
                    setQ('');
                  }}>
                  <b>{c.cie}</b> · {c.desc}
                </button>
              ))}
            </div>
          )}
          <div className="mt-4"><Etiqueta>Plan</Etiqueta>
            <textarea className="campo" rows={3} value={v.plan} onChange={(e) => cambiar({ ...v, plan: e.target.value })} placeholder="Tratamiento, indicaciones y próxima cita" />
          </div>
        </Tarjeta>

        <Tarjeta className="p-5">
          <Etiqueta>Lo que se cobra de esta consulta</Etiqueta>
          <div className="flex flex-wrap gap-1.5">
            {servicios.map((s) => {
              const on = v.servicios.includes(s.id);
              return (
                <button key={s.id} onClick={() => cambiar({ ...v, servicios: on ? v.servicios.filter((x) => x !== s.id) : [...v.servicios, s.id] })}
                  className={`rounded-full border px-3 py-1 text-xs ${on ? 'border-tinta bg-tinta text-white' : 'border-g2 text-g5 hover:border-tinta'}`}>
                  {s.nombre} · ${s.precio.toLocaleString('es-MX')}
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Boton onClick={generarReceta}>{receta ? 'Ver receta' : 'Generar receta'}</Boton>
            {v.etapa !== 'caja' && v.etapa !== 'salio' && !v.cobrada && (
              <Boton variante="borde" onClick={() => { const n = { ...v, etapa: 'caja' as const, etapaDesde: Date.now() }; setV(n); guardar('visitas', n); }}>Terminar y mandar a caja</Boton>
            )}
            {v.cobrada && <Pildora tono="ok">Cobrada</Pildora>}
          </div>
        </Tarjeta>
      </div>

      <div className="space-y-5">
        <Tarjeta className="p-5"><Etiqueta>Presión intraocular por visita</Etiqueta><GraficaPIO visitas={historia} /></Tarjeta>
        <Tarjeta className="space-y-4 p-5">
          <Etiqueta>Esquema</Etiqueta>
          <Esquema ojo={v.od} lado="OD" />
          <Esquema ojo={v.oi} lado="OI" />
        </Tarjeta>
        {estudiosHoy.length > 0 && (
          <Tarjeta className="p-5">
            <Etiqueta>Estudios recientes</Etiqueta>
            <div className="grid grid-cols-3 gap-2">
              {estudiosHoy.map((e) => (
                <figure key={e.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.imagen} alt={e.tipo} className="aspect-square w-full rounded-lg bg-black object-cover" />
                  <figcaption className="mt-1 text-[10.5px] leading-tight text-g4">{e.tipo} · {e.ojo} · {corta(e.fecha)}</figcaption>
                </figure>
              ))}
            </div>
          </Tarjeta>
        )}
        <p className="text-[11px] text-g4">Los servicios marcados aparecen solos en el punto de venta. {v.servicios.map((s) => producto(datos, s)?.nombre).filter(Boolean).join(', ')}</p>
      </div>
    </div>
  );
}

function Historial({ pacienteId }: { pacienteId: string }) {
  const { datos } = useDatos();
  const vs = datos.visitas.filter((v) => v.pacienteId === pacienteId).sort((a, b) => b.fecha.localeCompare(a.fecha));
  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <Tarjeta className="overflow-x-auto p-5">
        <table className="w-full min-w-[560px] text-sm">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-g4">
            <th className="pb-2">Fecha</th><th className="pb-2">Motivo</th><th className="pb-2">AV cc OD / OI</th><th className="pb-2">PIO OD / OI</th><th className="pb-2">Diagnóstico</th></tr></thead>
          <tbody>
            {vs.map((v) => (
              <tr key={v.id} className="border-t border-g2">
                <td className="py-2 pr-3 whitespace-nowrap">{corta(v.fecha)}</td>
                <td className="py-2 pr-3">{v.motivo}</td>
                <td className="py-2 pr-3 tabular-nums">{v.od.avcc || '—'} / {v.oi.avcc || '—'}</td>
                <td className="py-2 pr-3 tabular-nums">{v.od.pio || '—'} / <span className={Number(v.oi.pio) > 21 ? 'font-bold text-alerta' : ''}>{v.oi.pio || '—'}</span></td>
                <td className="py-2 text-xs text-g5">{v.diagnosticos.map((d) => `${d.cie} ${d.ojo}`).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tarjeta>
      <Tarjeta className="p-5"><Etiqueta>Presión intraocular</Etiqueta><GraficaPIO visitas={vs} /></Tarjeta>
    </div>
  );
}

// Una foto del teléfono o el PDF exportado de un equipo, reducido para que quepa.
function aImagen(archivo: File): Promise<string> {
  return new Promise((ok, mal) => {
    const lector = new FileReader();
    lector.onerror = mal;
    lector.onload = () => {
      const img = new Image();
      img.onerror = mal;
      img.onload = () => {
        const escala = Math.min(1, 1000 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * escala);
        c.height = Math.round(img.height * escala);
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        ok(c.toDataURL('image/jpeg', 0.78));
      };
      img.src = lector.result as string;
    };
    lector.readAsDataURL(archivo);
  });
}

const TIPOS_ESTUDIO: TipoEstudio[] = ['OCT macular', 'OCT nervio óptico', 'Campo visual 24-2', 'Retinografía', 'Biometría', 'Topografía'];

function Estudios({ pacienteId }: { pacienteId: string }) {
  const { datos, guardar } = useDatos();
  const lista = datos.estudios.filter((e) => e.pacienteId === pacienteId).sort((a, b) => b.fecha.localeCompare(a.fecha));
  // Por omisión se comparan los dos más recientes del mismo tipo.
  const parInicial = (() => {
    for (const e of lista) {
      const otro = lista.find((x) => x.tipo === e.tipo && x.ojo === e.ojo && x.id !== e.id);
      if (otro) return [otro.id, e.id];
    }
    return lista.slice(0, 2).map((e) => e.id);
  })();
  const [sel, setSel] = useState<string[]>(parInicial);
  const [tipo, setTipo] = useState<TipoEstudio>('OCT macular');
  const [ojo, setOjo] = useState<'OD' | 'OI' | 'AO'>('OI');
  const [subiendo, setSubiendo] = useState(false);
  const comparados = sel.map((id) => lista.find((e) => e.id === id)).filter(Boolean) as Estudio[];

  return (
    <div className="space-y-5">
      {comparados.length > 0 && (
        <Tarjeta className="p-5">
          <Etiqueta>Comparación lado a lado</Etiqueta>
          <div className="grid gap-4 md:grid-cols-2">
            {comparados.sort((a, b) => a.fecha.localeCompare(b.fecha)).map((e) => (
              <figure key={e.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.imagen} alt={e.tipo} className="mx-auto max-h-[340px] w-full rounded-xl bg-black object-contain" />
                <figcaption className="mt-2 text-sm">
                  <b>{e.tipo} · {e.ojo}</b> <span className="text-g4">· {corta(e.fecha)}</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">{Object.entries(e.valores).map(([k, val]) => <Pildora key={k}>{k}: {val}</Pildora>)}</div>
                  {e.nota && <p className="mt-1 text-xs text-g5">{e.nota}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        </Tarjeta>
      )}

      <Tarjeta className="flex flex-wrap items-end gap-3 p-5">
        <div className="flex-1"><Etiqueta>Agregar un estudio al expediente</Etiqueta>
          <p className="text-xs text-g4">En el sistema final llegan solos desde cada equipo. Aquí se puede subir una imagen o una foto del reporte.</p></div>
        <select className="campo !w-auto" value={tipo} onChange={(e) => setTipo(e.target.value as TipoEstudio)}>{TIPOS_ESTUDIO.map((t) => <option key={t}>{t}</option>)}</select>
        <select className="campo !w-auto" value={ojo} onChange={(e) => setOjo(e.target.value as 'OD')}><option>OD</option><option>OI</option><option>AO</option></select>
        <label className="inline-flex cursor-pointer items-center rounded-full bg-tinta px-4 py-2 font-display text-sm font-bold text-white hover:opacity-85">
          {subiendo ? 'Subiendo…' : 'Subir imagen'}
          <input type="file" accept="image/*" className="hidden" onChange={async (ev) => {
            const f = ev.target.files?.[0];
            if (!f) return;
            setSubiendo(true);
            try {
              const imagen = await aImagen(f);
              const e: Estudio = { id: nuevoId('e'), pacienteId, tipo, ojo, fecha: hoy(), imagen, valores: {}, nota: '' };
              guardar('estudios', e);
              setSel((s) => [s[s.length - 1], e.id].filter(Boolean) as string[]);
            } catch { alert('No se pudo leer la imagen.'); }
            finally { setSubiendo(false); ev.target.value = ''; }
          }} />
        </label>
      </Tarjeta>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        {lista.map((e) => {
          const on = sel.includes(e.id);
          return (
            <button key={e.id} onClick={() => setSel(on ? sel.filter((x) => x !== e.id) : [...sel, e.id].slice(-2))}
              className={`rounded-xl border p-2 text-left transition ${on ? 'border-tinta ring-2 ring-tinta/15' : 'border-g2 hover:border-g4'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.imagen} alt={e.tipo} className="aspect-square w-full rounded-lg bg-black object-cover" />
              <div className="mt-1.5 text-xs font-semibold leading-tight">{e.tipo} · {e.ojo}</div>
              <div className="text-[11px] text-g4">{corta(e.fecha)}</div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-g4">Toca dos estudios para compararlos.</p>
    </div>
  );
}

function Antecedentes({ pacienteId }: { pacienteId: string }) {
  const { datos, guardar } = useDatos();
  const p = paciente(datos, pacienteId)!;
  const [cat, setCat] = useState<Antecedente['categoria']>('Patológicos');
  const [texto, setTexto] = useState('');
  const cats: Antecedente['categoria'][] = ['Alergias', 'Patológicos', 'No patológicos', 'Heredofamiliares', 'Quirúrgicos', 'Medicamentos'];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {cats.map((c) => {
        const items = c === 'Alergias' ? p.alergias.map((a) => ({ categoria: c, texto: a })) : p.antecedentes.filter((a) => a.categoria === c);
        return (
          <Tarjeta key={c} className="p-5">
            <Etiqueta>{c}</Etiqueta>
            {items.length ? <ul className="space-y-1 text-sm">{items.map((a, i) => <li key={i} className={c === 'Alergias' ? 'font-semibold text-alerta' : ''}>{a.texto}</li>)}</ul>
              : <p className="text-sm text-g4">Sin registro.</p>}
          </Tarjeta>
        );
      })}
      <Tarjeta className="flex flex-wrap gap-2 p-5 md:col-span-2">
        <select className="campo !w-auto" value={cat} onChange={(e) => setCat(e.target.value as Antecedente['categoria'])}>{cats.map((c) => <option key={c}>{c}</option>)}</select>
        <input className="campo flex-1" placeholder="Agregar antecedente" value={texto} onChange={(e) => setTexto(e.target.value)} />
        <Boton disabled={!texto.trim()} onClick={() => {
          guardar('pacientes', cat === 'Alergias' ? { ...p, alergias: [...p.alergias, texto.trim()] } : { ...p, antecedentes: [...p.antecedentes, { categoria: cat, texto: texto.trim() }] });
          setTexto('');
        }}>Agregar</Boton>
      </Tarjeta>
    </div>
  );
}
