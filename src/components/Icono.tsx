/* Los mismos íconos planos de la propuesta: una sola silueta. */
const RUTAS: Record<string, { d: string; hueco?: boolean }> = {
  agenda: { d: 'M7 2h2v2h6V2h2v2h2.5A1.5 1.5 0 0 1 21 5.5v15a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20.5v-15A1.5 1.5 0 0 1 4.5 4H7zM5 9v11h14V9zm2 2h3v3H7zm5 0h3v3h-3zm-5 4h3v3H7z', hueco: true },
  flujo: { d: 'M2.8 2.8h8.1v8.1H2.8zM13.1 2.8h8.1v8.1h-8.1zM2.8 13.1h8.1v8.1H2.8zM13.1 13.1h8.1v8.1h-8.1z' },
  persona: { d: 'M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5z' },
  expediente: { d: 'M9 2h6a1 1 0 0 1 1 1v1h2.5A1.5 1.5 0 0 1 20 5.5v15a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20.5v-15A1.5 1.5 0 0 1 5.5 4H8V3a1 1 0 0 1 1-1zm-1 9v2h8v-2zm0 4v2h5v-2z', hueco: true },
  lentes: { d: 'M6 8.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm12 0a5 5 0 1 1 0 10 5 5 0 0 1 0-10zM6 11a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm12 0a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM11 12h2v2h-2z', hueco: true },
  caja: { d: 'M3.5 5h17A1.5 1.5 0 0 1 22 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17.5v-11A1.5 1.5 0 0 1 3.5 5zM2 8.5V11h20V8.5zM5 14v2h5v-2z', hueco: true },
  barras: { d: 'M2.8 14.6h4.3v6.9H2.8zM9.9 9.4h4.3v12.1H9.9zM16.9 3.3h4.3v18.2h-4.3z' },
  imagen: { d: 'M3 4h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v10.5l4.5-5 3.5 3.8 2.5-2.6L20 17V6zm12 1.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z', hueco: true },
  receta: { d: 'M6.5 2H14l5 5v13.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.5v-17A1.5 1.5 0 0 1 6.5 2zM8 12v2h8v-2zm0 4v2h6v-2z', hueco: true },
  ojo: { d: 'M12 5C6.5 5 2.7 9.3 1.5 12c1.2 2.7 5 7 10.5 7s9.3-4.3 10.5-7C21.3 9.3 17.5 5 12 5zm0 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', hueco: true },
  nube: { d: 'M7 19a5 5 0 0 1-.6-9.96A6.5 6.5 0 0 1 18.8 10.2 4.5 4.5 0 0 1 18 19z' },
  mas: { d: 'M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5z' },
  lupa: { d: 'M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z', hueco: true },
  flecha: { d: 'M4 11h12.2l-4.6-4.6L13 5l7 7-7 7-1.4-1.4 4.6-4.6H4z' },
  atras: { d: 'M20 11H7.8l4.6-4.6L11 5l-7 7 7 7 1.4-1.4L7.8 13H20z' },
  reloj: { d: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1 4v7l5.5 3.3 1-1.7-4.5-2.7V6z', hueco: true },
  check: { d: 'M9.5 16.2l-4.2-4.2-1.4 1.4 5.6 5.6 11-11-1.4-1.4z' },
  reiniciar: { d: 'M12 4a8 8 0 0 1 7.4 5H17v2h6V5h-2v2.4A10 10 0 1 0 22 13h-2a8 8 0 1 1-8-9z' },
};

export function Icono({ n, className = 'size-5' }: { n: keyof typeof RUTAS | string; className?: string }) {
  const r = RUTAS[n] ?? RUTAS.flujo;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={r.d} fillRule={r.hueco ? 'evenodd' : undefined} />
    </svg>
  );
}

export function Ficha({ n, color, tam = 'size-9' }: { n: string; color: string; tam?: string }) {
  return (
    <span className={`${tam} inline-flex shrink-0 items-center justify-center rounded-[10px] text-white`} style={{ background: color }}>
      <Icono n={n} className="size-[55%]" />
    </span>
  );
}
