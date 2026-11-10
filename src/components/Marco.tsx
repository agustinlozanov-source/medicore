'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useDatos } from '@/lib/datos';
import { Icono } from './Icono';

const MENU = [
  { href: '/', texto: 'Agenda', icono: 'agenda', color: '#1aab99' },
  { href: '/flujo/', texto: 'Flujo de hoy', icono: 'flujo', color: '#108fc2' },
  { href: '/pacientes/', texto: 'Pacientes', icono: 'persona', color: '#0574eb' },
  { href: '/optica/', texto: 'Óptica', icono: 'lentes', color: '#0b5cf5' },
  { href: '/caja/', texto: 'Punto de venta', icono: 'caja', color: '#2047e1' },
  { href: '/direccion/', texto: 'Dirección', icono: 'barras', color: '#3533cd' },
];

export const SEDES = { ms: 'Monte Sinaí', shalom: 'Óptica Shalom' } as const;

function Estado() {
  const { modo, enLinea, pendientes } = useDatos();
  if (modo === 'cargando') return <span className="text-xs text-g4">Conectando…</span>;
  if (modo === 'local') return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ambar"><i className="size-1.5 rounded-full bg-current" />Guardando en este equipo</span>;
  if (!enLinea || pendientes > 0)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ambar">
        <i className="size-1.5 rounded-full bg-current" />
        {enLinea ? `Enviando ${pendientes}…` : `Sin internet${pendientes ? ` · ${pendientes} por enviar` : ''}`}
      </span>
    );
  return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ok"><i className="size-1.5 rounded-full bg-current" />Sincronizado</span>;
}

export function Marco({ children }: { children: ReactNode }) {
  const ruta = usePathname();
  const { sede, setSede, reiniciar } = useDatos();
  const [reiniciando, setReiniciando] = useState(false);
  const activo = (href: string) => (href === '/' ? ruta === '/' : ruta.startsWith(href.replace(/\/$/, '')));

  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_1fr]">
      <aside className="no-imprimir border-b border-g2 bg-white md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 pb-3 pt-5 md:block">
          <div>
            <div className="font-display text-[17px] font-extrabold tracking-tight">Medical Hub <span className="marca-texto">OS</span></div>
            <div className="text-xs text-g4">Clínica de Visión Monte Sinaí</div>
          </div>
        </div>

        <div className="mx-4 mb-3 grid grid-cols-2 rounded-full bg-g1 p-1 text-xs font-semibold">
          {(['ms', 'shalom'] as const).map((s) => (
            <button key={s} onClick={() => setSede(s)}
              className={`rounded-full px-2 py-1.5 transition ${sede === s ? 'bg-white shadow-sm' : 'text-g4 hover:text-tinta'}`}>
              {s === 'ms' ? 'Monte Sinaí' : 'Shalom'}
            </button>
          ))}
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href}
              className={`flex shrink-0 items-center gap-3 rounded-full px-3 py-2 text-sm transition ${activo(m.href) ? 'bg-g1 font-semibold' : 'text-g5 hover:bg-g1'}`}>
              <span className="inline-flex size-7 items-center justify-center rounded-[8px] text-white" style={{ background: m.color }}>
                <Icono n={m.icono} className="size-4" />
              </span>
              {m.texto}
            </Link>
          ))}
        </nav>

        <div className="hidden border-t border-g2 px-5 py-4 md:mt-auto md:block">
          <Estado />
          <button
            className="mt-3 flex items-center gap-1.5 text-xs text-g4 hover:text-tinta disabled:opacity-50"
            disabled={reiniciando}
            onClick={async () => {
              if (!confirm('¿Reiniciar el demo? Se borra lo capturado y vuelven los datos de ejemplo.')) return;
              setReiniciando(true);
              try { await reiniciar(); } finally { setReiniciando(false); }
            }}>
            <Icono n="reiniciar" className="size-3.5" />{reiniciando ? 'Reiniciando…' : 'Reiniciar demo'}
          </button>
          <p className="mt-3 text-[10.5px] leading-snug text-g4">Demo con datos ficticios · Flow Hub</p>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
