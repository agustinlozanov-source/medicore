'use client';
import { useState } from 'react';
import { useDatos, nuevoId } from '@/lib/datos';
import type { Paciente } from '@/lib/tipos';
import { hoy } from '@/lib/fechas';
import { Boton } from './ui';

// Alta rápida: lo mínimo para agendar. El resto se llena en el expediente.
export function FormPaciente({ listo }: { listo: (p: Paciente) => void }) {
  const { datos, guardar } = useDatos();
  const [f, setF] = useState({ nombre: '', apellidos: '', nacimiento: '', sexo: 'F' as 'F' | 'M', telefono: '' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <form
      className="grid grid-cols-2 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const max = Math.max(...datos.pacientes.map((p) => Number(p.exp) || 0), 9240);
        const p: Paciente = {
          id: nuevoId('p'), exp: String(max + 1).padStart(5, '0'), nombre: f.nombre.trim(), apellidos: f.apellidos.trim(),
          nacimiento: f.nacimiento || '1980-01-01', sexo: f.sexo, telefono: f.telefono, alergias: [], antecedentes: [], diagnosticos: [], creado: hoy(),
        };
        guardar('pacientes', p);
        listo(p);
      }}>
      <label className="text-xs font-semibold">Nombre<input required className="campo mt-1" value={f.nombre} onChange={set('nombre')} /></label>
      <label className="text-xs font-semibold">Apellidos<input required className="campo mt-1" value={f.apellidos} onChange={set('apellidos')} /></label>
      <label className="text-xs font-semibold">Nacimiento<input type="date" className="campo mt-1" value={f.nacimiento} onChange={set('nacimiento')} /></label>
      <label className="text-xs font-semibold">Sexo
        <select className="campo mt-1" value={f.sexo} onChange={set('sexo')}><option value="F">Femenino</option><option value="M">Masculino</option></select>
      </label>
      <label className="col-span-2 text-xs font-semibold">Teléfono (WhatsApp)<input className="campo mt-1" value={f.telefono} onChange={set('telefono')} /></label>
      <div className="col-span-2"><Boton type="submit">Guardar paciente</Boton></div>
    </form>
  );
}
