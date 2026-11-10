/* Los diagnósticos de oftalmología que más se usan. El catálogo completo está en
   la colección `cie10` del Firestore de la app anterior; entra en el proyecto. */
export const CIE10: { cie: string; desc: string }[] = [
  { cie: 'H40.1', desc: 'Glaucoma primario de ángulo abierto' },
  { cie: 'H40.0', desc: 'Sospecha de glaucoma' },
  { cie: 'H40.2', desc: 'Glaucoma primario de ángulo cerrado' },
  { cie: 'H25.1', desc: 'Catarata senil nuclear' },
  { cie: 'H25.0', desc: 'Catarata senil incipiente' },
  { cie: 'H26.4', desc: 'Opacidad de cápsula posterior' },
  { cie: 'Z96.1', desc: 'Presencia de lente intraocular' },
  { cie: 'E11.3', desc: 'Diabetes tipo 2 con complicaciones oftálmicas' },
  { cie: 'H36.0', desc: 'Retinopatía diabética' },
  { cie: 'H35.3', desc: 'Degeneración macular relacionada con la edad' },
  { cie: 'H35.0', desc: 'Retinopatía hipertensiva' },
  { cie: 'H33.0', desc: 'Desprendimiento de retina' },
  { cie: 'H43.1', desc: 'Hemorragia vítrea' },
  { cie: 'H52.0', desc: 'Hipermetropía' },
  { cie: 'H52.1', desc: 'Miopía' },
  { cie: 'H52.2', desc: 'Astigmatismo' },
  { cie: 'H52.4', desc: 'Presbicia' },
  { cie: 'H53.0', desc: 'Ambliopía' },
  { cie: 'H50.0', desc: 'Estrabismo convergente' },
  { cie: 'H18.6', desc: 'Queratocono' },
  { cie: 'H16.0', desc: 'Úlcera corneal' },
  { cie: 'H11.0', desc: 'Pterigión' },
  { cie: 'H10.9', desc: 'Conjuntivitis' },
  { cie: 'H04.1', desc: 'Síndrome de ojo seco' },
  { cie: 'H00.0', desc: 'Orzuelo' },
  { cie: 'H01.0', desc: 'Blefaritis' },
  { cie: 'H02.4', desc: 'Ptosis palpebral' },
  { cie: 'H20.0', desc: 'Uveítis anterior' },
  { cie: 'H47.2', desc: 'Atrofia óptica' },
  { cie: 'H54.4', desc: 'Ceguera de un ojo' },
];

export function buscarCie(q: string) {
  const t = q.trim().toLowerCase();
  if (!t) return CIE10.slice(0, 8);
  return CIE10.filter((c) => c.cie.toLowerCase().startsWith(t) || c.desc.toLowerCase().includes(t)).slice(0, 8);
}

export function descCie(cie: string) {
  return CIE10.find((c) => c.cie === cie)?.desc ?? cie;
}
