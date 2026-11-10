'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDatos } from '@/lib/datos';
import { corta, edad, hoy } from '@/lib/fechas';
import { nombre, ultimaVisita } from '@/lib/util';
import { Avatar, Boton, Cargando, Encabezado, Modal, Pildora } from '@/components/ui';
import { FormPaciente } from '@/components/NuevoPaciente';

export default function Pacientes() {
  const { datos, modo } = useDatos();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [alta, setAlta] = useState(false);
  if (modo === 'cargando') return <Cargando />;

  const t = q.toLowerCase();
  const lista = datos.pacientes
    .filter((p) => !t || `${p.nombre} ${p.apellidos} ${p.exp} ${p.diagnosticos.join(' ')}`.toLowerCase().includes(t))
    .sort((a, b) => a.apellidos.localeCompare(b.apellidos));

  return (
    <>
      <Encabezado icono="persona" color="#0574eb" titulo="Pacientes" sub={`${datos.pacientes.length} expedientes`}>
        <Boton onClick={() => setAlta(true)}>+ Paciente nuevo</Boton>
      </Encabezado>
      <input className="campo mb-4 max-w-md" placeholder="Buscar por nombre, expediente o diagnóstico (ej. H40)" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-hidden rounded-2xl border border-g2">
        {lista.map((p) => {
          const u = ultimaVisita(datos, p.id);
          const hoyAqui = u?.fecha === hoy();
          return (
            <Link key={p.id} href={`/expediente/?id=${p.id}`} className="flex items-center gap-3 border-b border-g2 px-4 py-3 last:border-0 hover:bg-g1">
              <Avatar nombre={p.nombre} apellidos={p.apellidos} tam="size-9" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{nombre(p)}</div>
                <div className="text-xs text-g4">Exp. {p.exp} · {edad(p.nacimiento)} años · {p.telefono}</div>
              </div>
              <div className="hidden flex-wrap justify-end gap-1 md:flex">
                {p.alergias.length > 0 && <Pildora tono="alerta">Alergia: {p.alergias[0]}</Pildora>}
                {p.diagnosticos.slice(0, 2).map((d) => <Pildora key={d}>{d}</Pildora>)}
              </div>
              <div className="w-28 text-right text-xs text-g4">{hoyAqui ? <Pildora tono="azul">Hoy</Pildora> : u ? `Última: ${corta(u.fecha)}` : 'Sin visitas'}</div>
            </Link>
          );
        })}
      </div>
      <Modal abierto={alta} cerrar={() => setAlta(false)} titulo="Paciente nuevo">
        <FormPaciente listo={(p) => router.push(`/expediente/?id=${p.id}`)} />
      </Modal>
    </>
  );
}
