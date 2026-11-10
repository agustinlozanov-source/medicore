'use client';
import type { ReactNode } from 'react';
import { Ficha } from './Icono';

export function Encabezado({ icono, color, titulo, sub, children }: { icono: string; color: string; titulo: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Ficha n={icono} color={color} tam="size-10" />
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">{titulo}</h1>
          {sub && <p className="text-sm text-g4">{sub}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Boton({ children, onClick, variante = 'negro', className = '', type = 'button', disabled }: {
  children: ReactNode; onClick?: () => void; variante?: 'negro' | 'borde' | 'suave'; className?: string; type?: 'button' | 'submit'; disabled?: boolean;
}) {
  const estilos = {
    negro: 'bg-tinta text-white hover:opacity-85',
    borde: 'border border-g2 bg-white hover:border-tinta',
    suave: 'bg-g1 hover:bg-g2',
  }[variante];
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 font-display text-sm font-bold transition disabled:opacity-40 ${estilos} ${className}`}>
      {children}
    </button>
  );
}

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-g2 bg-white ${className}`}>{children}</div>;
}

export function Pildora({ children, tono = 'gris' }: { children: ReactNode; tono?: 'gris' | 'alerta' | 'ok' | 'ambar' | 'azul' }) {
  const t = {
    gris: 'border border-g2 text-tinta',
    alerta: 'bg-red-50 text-alerta',
    ok: 'bg-emerald-50 text-ok',
    ambar: 'bg-amber-50 text-ambar',
    azul: 'bg-blue-50 text-azul',
  }[tono];
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${t}`}>{children}</span>;
}

export function Etiqueta({ children }: { children: ReactNode }) {
  return <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-g4">{children}</div>;
}

export function Modal({ abierto, cerrar, titulo, children, ancho = 'max-w-lg' }: { abierto: boolean; cerrar: () => void; titulo: string; children: ReactNode; ancho?: string }) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-[8vh]" onClick={cerrar}>
      <div className={`w-full ${ancho} rounded-2xl bg-white p-6 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold">{titulo}</h2>
          <button onClick={cerrar} className="rounded-full px-2 text-2xl leading-none text-g4 hover:text-tinta" aria-label="Cerrar">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Cargando() {
  return <div className="flex h-[60vh] items-center justify-center text-sm text-g4">Cargando la clínica…</div>;
}

export function Avatar({ nombre, apellidos, tam = 'size-10' }: { nombre: string; apellidos: string; tam?: string }) {
  return (
    <span className={`${tam} inline-flex shrink-0 items-center justify-center rounded-full bg-tinta text-sm font-bold text-white`}>
      {nombre[0]}{apellidos[0]}
    </span>
  );
}
