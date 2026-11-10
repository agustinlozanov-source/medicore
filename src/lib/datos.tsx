'use client';
/* La única puerta a los datos. Las pantallas piden y guardan aquí, y no saben
   si detrás está Firebase o el navegador.

   Firebase guarda todo bajo demo/monte-sinai. Si sus reglas no dejan pasar, o
   si no hay internet la primera vez, el demo sigue con los datos en el
   navegador: lo que importa mañana es que la pantalla nunca se quede en blanco. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Coleccion, Datos, SedeId } from './tipos';
import { COLECCIONES } from './tipos';
import { sembrar } from './semilla';
import { hoy } from './fechas';

const VERSION = 4;
const LLAVE_LOCAL = 'mh-demo';
const RAIZ = ['demo', 'monte-sinai'] as const;

type Modo = 'cargando' | 'firebase' | 'local';

interface Contexto {
  datos: Datos;
  modo: Modo;
  enLinea: boolean;
  pendientes: number;
  sede: SedeId;
  setSede: (s: SedeId) => void;
  guardar: <C extends Coleccion>(col: C, doc: Datos[C][number]) => void;
  reiniciar: () => Promise<void>;
}

const vacio: Datos = { personal: [], pacientes: [], citas: [], visitas: [], estudios: [], recetas: [], ordenes: [], productos: [], ventas: [] };

const Ctx = createContext<Contexto | null>(null);

function leerLocal(): Datos | null {
  try {
    const g = JSON.parse(localStorage.getItem(LLAVE_LOCAL) || 'null');
    if (g && g.fecha === hoy() && g.version === VERSION) return g.datos as Datos;
  } catch {}
  return null;
}
function escribirLocal(d: Datos) {
  try { localStorage.setItem(LLAVE_LOCAL, JSON.stringify({ fecha: hoy(), version: VERSION, datos: d })); } catch {}
}

export function ProveedorDatos({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<Datos>(vacio);
  const [modo, setModo] = useState<Modo>('cargando');
  const [enLinea, setEnLinea] = useState(true);
  const [pend, setPend] = useState<Record<string, number>>({});
  const [sede, setSedeEstado] = useState<SedeId>('ms');
  const fs = useRef<typeof import('firebase/firestore') | null>(null);
  const db = useRef<import('firebase/firestore').Firestore | null>(null);
  const bajas = useRef<(() => void)[]>([]);
  const modoRef = useRef<Modo>('cargando');

  const pasarALocal = useCallback(() => {
    if (modoRef.current === 'local') return;
    modoRef.current = 'local';
    bajas.current.forEach((b) => b());
    bajas.current = [];
    const d = leerLocal() ?? sembrar(hoy(), Date.now());
    escribirLocal(d);
    setDatos(d);
    setPend({});
    setModo('local');
  }, []);

  // Escribe la semilla en Firebase y borra lo que se haya agregado durante el demo.
  const sembrarFirebase = useCallback(async () => {
    const f = fs.current!, base = db.current!;
    const semilla = sembrar(hoy(), Date.now());
    const ops: ((b: import('firebase/firestore').WriteBatch) => void)[] = [];
    for (const col of COLECCIONES) {
      const ref = f.collection(base, ...RAIZ, col);
      const ids = new Set(semilla[col].map((x) => x.id));
      const existentes = await f.getDocs(ref);
      existentes.forEach((d) => { if (!ids.has(d.id)) ops.push((b) => b.delete(d.ref)); });
      for (const x of semilla[col]) ops.push((b) => b.set(f.doc(ref, x.id), x));
    }
    ops.push((b) => b.set(f.doc(base, ...RAIZ), { fecha: hoy(), version: VERSION }));
    for (let i = 0; i < ops.length; i += 400) {
      const b = f.writeBatch(base);
      ops.slice(i, i + 400).forEach((op) => op(b));
      await b.commit();
    }
  }, []);

  const escuchar = useCallback(() => {
    const f = fs.current!, base = db.current!;
    for (const col of COLECCIONES) {
      const baja = f.onSnapshot(
        f.collection(base, ...RAIZ, col),
        { includeMetadataChanges: true },
        (snap) => {
          const docs = snap.docs.map((d) => d.data());
          setDatos((prev) => ({ ...prev, [col]: docs }));
          setPend((prev) => ({ ...prev, [col]: snap.docs.filter((d) => d.metadata.hasPendingWrites).length }));
        },
        () => pasarALocal(),
      );
      bajas.current.push(baja);
    }
  }, [pasarALocal]);

  useEffect(() => {
    try { const s = localStorage.getItem('mh-sede'); if (s === 'ms' || s === 'shalom') setSedeEstado(s); } catch {}
    setEnLinea(navigator.onLine);
    const on = () => setEnLinea(true), off = () => setEnLinea(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);

    let cancelado = false;
    (async () => {
      try {
        const [f, { baseDeDatos }] = await Promise.all([import('firebase/firestore'), import('./firebase')]);
        fs.current = f;
        db.current = baseDeDatos();
        const meta = await Promise.race([
          f.getDoc(f.doc(db.current, ...RAIZ)),
          new Promise<never>((_, no) => setTimeout(() => no(new Error('tiempo')), 6000)),
        ]);
        if (cancelado) return;
        const m = meta.data();
        if (!m || m.fecha !== hoy() || m.version !== VERSION) await sembrarFirebase();
        if (cancelado) return;
        modoRef.current = 'firebase';
        setModo('firebase');
        escuchar();
      } catch {
        if (!cancelado) pasarALocal();
      }
    })();

    return () => {
      cancelado = true;
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      bajas.current.forEach((b) => b());
      bajas.current = [];
    };
  }, [escuchar, pasarALocal, sembrarFirebase]);

  const guardar = useCallback(<C extends Coleccion>(col: C, doc: Datos[C][number]) => {
    if (modoRef.current === 'firebase' && fs.current && db.current) {
      const f = fs.current;
      // Sin await: con la caché local el cambio se ve al instante, y si no hay
      // internet queda en fila hasta que vuelva.
      f.setDoc(f.doc(db.current, ...RAIZ, col, doc.id), JSON.parse(JSON.stringify(doc))).catch(() => pasarALocal());
      return;
    }
    setDatos((prev) => {
      const lista = prev[col] as { id: string }[];
      const i = lista.findIndex((x) => x.id === doc.id);
      const nueva = i >= 0 ? lista.map((x) => (x.id === doc.id ? doc : x)) : [...lista, doc];
      const d = { ...prev, [col]: nueva } as Datos;
      escribirLocal(d);
      return d;
    });
  }, [pasarALocal]);

  const reiniciar = useCallback(async () => {
    if (modoRef.current === 'firebase') {
      await sembrarFirebase();
      return;
    }
    const d = sembrar(hoy(), Date.now());
    escribirLocal(d);
    setDatos(d);
  }, [sembrarFirebase]);

  const setSede = useCallback((s: SedeId) => {
    setSedeEstado(s);
    try { localStorage.setItem('mh-sede', s); } catch {}
  }, []);

  const pendientes = Object.values(pend).reduce((a, b) => a + b, 0);

  const valor = useMemo(() => ({ datos, modo, enLinea, pendientes, sede, setSede, guardar, reiniciar }),
    [datos, modo, enLinea, pendientes, sede, setSede, guardar, reiniciar]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useDatos() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useDatos fuera de ProveedorDatos');
  return c;
}

export function nuevoId(prefijo: string) {
  return `${prefijo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
