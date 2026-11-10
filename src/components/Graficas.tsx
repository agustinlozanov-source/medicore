'use client';
import type { Ojo, Visita } from '@/lib/tipos';
import { corta } from '@/lib/fechas';

const OD = '#0066ff', OI = '#e8743b';

// La presión por visita: lo que hoy se pierde en papel.
export function GraficaPIO({ visitas }: { visitas: Pick<Visita, 'fecha' | 'od' | 'oi'>[] }) {
  const pts = visitas.filter((v) => v.od.pio || v.oi.pio).sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(-8);
  if (pts.length < 2) return <p className="text-xs text-g4">Hace falta más de una visita con presión para graficar.</p>;
  const W = 320, H = 150, iz = 26, de = 10, ar = 10, ab = 22, min = 10, max = 30;
  const x = (i: number) => iz + (i * (W - iz - de)) / (pts.length - 1);
  const y = (v: number) => ar + ((max - Math.min(max, Math.max(min, v))) * (H - ar - ab)) / (max - min);
  const linea = (o: 'od' | 'oi') => pts.map((p, i) => (p[o].pio ? `${x(i)},${y(Number(p[o].pio))}` : null)).filter(Boolean).join(' ');
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Presión intraocular por visita">
        {[10, 15, 21, 25, 30].map((v) => (
          <g key={v}>
            <line x1={iz} x2={W - de} y1={y(v)} y2={y(v)} stroke={v === 21 ? '#d32f2b' : '#e8e8ed'} strokeDasharray={v === 21 ? '4 3' : undefined} />
            <text x={iz - 5} y={y(v) + 3} fontSize="9" textAnchor="end" fill="#8e8e93">{v}</text>
          </g>
        ))}
        <polyline fill="none" stroke={OD} strokeWidth="2" points={linea('od')} />
        <polyline fill="none" stroke={OI} strokeWidth="2" points={linea('oi')} />
        {pts.map((p, i) => (
          <g key={i}>
            {p.od.pio && <circle cx={x(i)} cy={y(Number(p.od.pio))} r="2.8" fill={OD} />}
            {p.oi.pio && <circle cx={x(i)} cy={y(Number(p.oi.pio))} r="2.8" fill={OI} />}
            {(i === 0 || i === pts.length - 1 || pts.length <= 5) && (
              <text x={x(i)} y={H - 6} fontSize="9" textAnchor="middle" fill="#8e8e93">{corta(p.fecha)}</text>
            )}
          </g>
        ))}
      </svg>
      <div className="mt-1 flex gap-4 text-[11px] text-g4">
        <span className="inline-flex items-center gap-1.5"><i className="h-[3px] w-3 rounded" style={{ background: OD }} />OD</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-[3px] w-3 rounded" style={{ background: OI }} />OI</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-[2px] w-3 border-t border-dashed border-alerta" />21 mmHg</span>
      </div>
    </div>
  );
}

// Esquema por ojo: el cristalino se nubla con la catarata y la papila muestra su excavación.
export function Esquema({ ojo, lado }: { ojo: Ojo; lado: 'OD' | 'OI' }) {
  const opaco = /NO[34]|NC[34]/.test(ojo.cristalino);
  const cd = Math.min(0.95, Math.max(0.1, Number(ojo.cd) || 0.3));
  const alto = cd >= 0.6;
  return (
    <div className="grid grid-cols-2 gap-2 text-center text-[11px] text-g4">
      <div>
        <svg viewBox="0 0 100 100" className="mx-auto w-full max-w-[110px]">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#c7c7cc" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="26" fill="#6b8f9e" opacity=".6" />
          <circle cx="50" cy="50" r="11" fill="#070708" />
          {opaco && <circle cx="50" cy="50" r="9" fill="#d8c48a" opacity=".85" />}
        </svg>
        {lado} · {opaco ? 'catarata' : 'cristalino'}
      </div>
      <div>
        <svg viewBox="0 0 100 100" className="mx-auto w-full max-w-[110px]">
          <circle cx="50" cy="50" r="44" fill="#d0582b" opacity=".85" />
          <circle cx="50" cy="50" r="22" fill="#f2c27a" />
          <circle cx="50" cy="50" r={22 * cd} fill="#fff6dc" stroke={alto ? '#e8743b' : 'none'} strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="50" y="53.5" fontSize="10" textAnchor="middle" fill={alto ? '#b86a00' : '#3a3a3c'} fontWeight="700">{ojo.cd || '—'}</text>
        </svg>
        {lado} · papila C/D
      </div>
    </div>
  );
}
