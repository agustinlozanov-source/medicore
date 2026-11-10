# Plan: demo de Medical Hub OS

El demo es la propuesta funcionando. El Dr. Edgar Méndez Dávila abre un enlace y ve su
clínica en pantalla: Monte Sinaí y Óptica Shalom, sus consultorios, su agenda y el
recorrido de un paciente de principio a fin. No es el sistema final: es el sistema final
en pequeño, construido ya sobre el stack nuevo para que nada se tire después.

Propuesta publicada: https://landing.flowhubcrm.app/medical-hub-os

---

## 1. Qué se rescata de la app actual

La app vieja es un solo `index.html` de 6,400 líneas en JavaScript suelto, con Firebase.
**El código no se migra: se reescribe.** Lo que se rescata es lo que ya se pensó: los
modelos de datos, los flujos y algunas piezas de interfaz que costaron trabajo.

| Módulo actual | Qué se rescata | Cómo entra al stack nuevo |
|---|---|---|
| Agenda operativa (`renderizarAgendaSemanal`, horarios de atención) | Slots de 15 min, vista día / semana / mes, horarios por médico, bloqueo de horas cerradas, mini calendario | Se rehace en React. Las reglas de horarios pasan casi tal cual |
| Pacientes (búsqueda fuzzy, alta, importación CSV con plantilla) | La búsqueda tolerante y la importación por CSV | La importación CSV es la base de la **migración** desde la app actual |
| Antecedentes (6 categorías) | Alergias, patológicos, no patológicos, heredofamiliares, psiquiátricos, vacunas | Tabla propia, igual que hoy |
| Signos vitales con gráfica | La idea de graficar por visita | Se vuelve la **gráfica de PIO por ojo** |
| Nueva consulta con pestañas | Motivo, notas, examen, diagnóstico CIE-10, plan, cargos | Se vuelve la consulta oftalmológica (OD / OI) |
| Exploración topográfica (SVG con zonas clicables) | El mecanismo de marcar zonas sobre un SVG | Se vuelve el **esquema ocular**: segmento anterior y fondo de ojo |
| Autocompletado CIE-10 | La búsqueda por clave y descripción | Necesita el catálogo: **exportar la colección `cie10` de Firestore** |
| Recetas (medicamentos, vista previa, PDF) | Estructura de medicamento: nombre, dosis, presentación, frecuencia, días | Se suma la **receta de anteojos**; el PDF pasa a `@react-pdf/renderer` |
| Productos / servicios y cobros | Catálogo con código, categoría y precio; cobro ligado a paciente | Se le agrega **costo** a cada servicio: es la base del ERP |
| Mi cuenta (perfil del médico) | Cédula, especialidad, horarios, permisos | Perfil del personal, por sede |

### Lo que se tira

- **El login con rol elegido en un desplegable.** Cualquiera entraba como médico o admin.
- **El odontograma.** No aplica a oftalmología.
- **La "firma digital SAT" y la "validación de cédula".** No firmaban ni validaban nada (el
  hash era un `Math.random()`). Si la firma hace falta, se hace bien y aparte.
- `cloud-functions-examples.js`, las dos versiones de reglas de Firestore y la
  documentación de HIPAA, que no correspondía a lo que hacía el código.

### Antes de apagar Firebase

- [ ] Revisar en la consola de `medicore-879e2` si hay datos reales de pacientes. Si los hay,
      exportarlos antes de tocar nada.
- [ ] Exportar la colección `cie10`: es el catálogo de diagnósticos y vale la pena conservarlo.
- [ ] Quitar la configuración de Firebase escrita en el código.

---

## 2. El stack

| Pieza | Elección | Por qué |
|---|---|---|
| Aplicación | **Next.js** (App Router) + TypeScript | Lo que ya se usa en los demás proyectos; un solo repositorio para el demo y el sistema |
| Interfaz | Tailwind + shadcn/ui | Rápido de construir y fácil de vestir con la marca de la clínica |
| Base de datos | **Supabase (Postgres)** | Agenda, pacientes, ventas, inventario y costos son datos relacionales: un punto de venta y un ERP se hacen mucho mejor en SQL que en Firestore |
| Archivos | Supabase Storage | Los estudios de imagen y los PDF de reportes |
| Gráficas | Recharts | Reemplaza a Chart.js |
| PDF | @react-pdf/renderer | Recetas y órdenes de óptica con la marca de cada sede |
| Despliegue del demo | Vercel | Un enlace para mandarle al doctor |

### Firebase o Supabase: la decisión que importa es el modo sin internet

Firestore guarda una copia en cada navegador y sincroniza al volver la conexión; eso viene
de fábrica. Supabase no. Aun así conviene Supabase: el punto de venta, el inventario y los
márgenes viven mejor en Postgres, y el modo sin internet se resuelve con una capa de
sincronización:

- **PowerSync** (opción recomendada): cada equipo trabaja sobre una base SQLite local y
  sincroniza con Supabase. Se integra con Supabase de forma oficial. Hay que probar si su
  servicio puede correr en el servidor de cada sede, como promete la propuesta.
- **Alternativa:** un Postgres en el servidor de cada sede, replicado a Supabase.

Esto no entra en el demo, pero sí debe probarse en la primera semana del proyecto: es la
parte con más riesgo de los 30 días.

---

## 3. Qué muestra el demo

Todo con datos sembrados de ejemplo: Monte Sinaí, Óptica Shalom, el Dr. Méndez, una
optometrista, recepción y unos 30 pacientes ficticios. **Sin login**, y ningún dato real.

### Lo indispensable (el recorrido de un paciente)

1. **Agenda** — Monte Sinaí y Óptica Shalom en pestañas; columnas por médico, optometría y
   estudios; tipos de cita con su color y su duración; crear una cita.
2. **Flujo de hoy** — el tablero de recepción → optometría → dilatación (con reloj) →
   estudios → médico → óptica / caja. Mover a un paciente de etapa.
3. **Expediente oftalmológico** — captura por ojo: agudeza, refracción, queratometría, PIO,
   cristalino, excavación; diagnóstico CIE-10; antecedentes y alergias; gráfica de PIO entre
   visitas.
4. **Estudios** — subir una imagen o un PDF al expediente y comparar dos fechas lado a lado.
5. **Receta** — receta de anteojos y de medicamentos generada desde la refracción, en PDF con
   la marca de Monte Sinaí.
6. **Óptica Shalom** — la receta llega sola; se arma la orden (armazón, micas, anticipo) y se
   mueve por sus estados.
7. **Punto de venta** — cobrar lo que se hizo en la consulta, ligado al paciente.
8. **Tablero de dirección** — ventas, costo y margen por línea, y las dos sedes juntas.

### Si da tiempo

- Indicador de conexión con una **simulación** del modo sin internet (cola de cambios por
  enviar), marcada como simulación en el demo.
- Lectura asistida de un PDF de campo visual o biometría.
- Programa quirúrgico con las citas de postoperatorio creadas solas.

### Fuera del demo

Conexión real con los equipos, el modo sin internet real, el login y los permisos, la
migración desde la app actual, la conexión con Flow Hub CRM y la facturación. Son parte de
los 30 días, no del demo.

---

## 4. El modelo de datos (primer corte)

```
sedes            id, nombre (Monte Sinaí | Óptica Shalom), tipo, dirección
personal         id, sede_id, nombre, puesto (médico | optometría | recepción | óptica | caja), cédula
pacientes        id, expediente, nombre, apellidos, fecha_nacimiento, sexo, curp, teléfono, correo
antecedentes     id, paciente_id, categoría, descripción
citas            id, sede_id, personal_id, paciente_id, inicio, duración, tipo, estado
visitas          id, cita_id, paciente_id, personal_id, motivo, notas, plan, etapa_flujo
exploraciones    id, visita_id, ojo (OD | OI), av_sc, av_cc, estenopeico, esfera, cilindro, eje,
                 adición, k1, k2, pio, método_pio, cristalino, excavación, segmento_anterior,
                 fondo_de_ojo, esquema (json)
diagnósticos     id, visita_id, cie10, descripción, ojo
estudios         id, paciente_id, visita_id, tipo (OCT | campo visual | biometría | ...), ojo,
                 fecha, archivo, valores (json)
recetas          id, visita_id, tipo (anteojos | contacto | medicamentos), contenido (json)
productos        id, sede_id, código, nombre, categoría, precio, costo, existencia
órdenes_óptica   id, receta_id, paciente_id, estado, promesa_entrega, laboratorio
ventas           id, sede_id, paciente_id, visita_id, total, estado
venta_partidas   id, venta_id, producto_id, cantidad, precio, costo
pagos            id, venta_id, método, monto, fecha
```

`costo` en productos y en cada partida es lo que permite el tablero de márgenes y, después,
el ERP.

---

## 5. Orden de construcción

Estimado de trabajo, no fechas comprometidas:

| Día | Qué |
|---|---|
| 1 | Proyecto Next.js en este repo (la app vieja pasa a `legacy/`), Supabase, esquema y datos sembrados |
| 2 | Estructura de la app con el menú por sede; pacientes y expediente básico |
| 3 | Consulta oftalmológica OD / OI, CIE-10 y gráfica de PIO |
| 4 | Agenda y flujo de hoy |
| 5 | Estudios (subir y comparar) y recetas en PDF |
| 6 | Óptica Shalom y punto de venta |
| 7 | Tablero de dirección, pulido y despliegue en Vercel |

---

### Versión de un día (el demo es mañana)

Los siete días de arriba son para el demo sobre la base real. Si el demo se presenta
mañana, se recorta así:

- **Sin Supabase todavía.** Los datos sembrados viven en archivos del proyecto y los cambios
  en el navegador (se pierden al recargar o se guardan en `localStorage`). La interfaz y el
  modelo de datos son los mismos, así que conectar Supabase después no obliga a rehacer
  pantallas.
- **Next.js desplegado en Vercel**, con la marca de Monte Sinaí y Óptica Shalom.
- **Pantallas, en este orden de prioridad:**
  1. Agenda del día con las dos sedes y el flujo de hoy (mover pacientes de etapa).
  2. Expediente oftalmológico OD / OI con la gráfica de PIO y los estudios lado a lado.
  3. Receta de anteojos y medicamentos generada desde la refracción, lista para imprimir.
  4. Orden de Óptica Shalom y cobro en el punto de venta.
  5. Tablero de dirección.
- **Lo primero que se corta si no alcanza:** el tablero de dirección y la subida de archivos
  reales (los estudios se muestran con imágenes de ejemplo).

---

## 6. Preguntas abiertas

- **¿El demo se presenta antes o después del pago?** Si es para cerrar la venta, conviene
  priorizar el recorrido del paciente (puntos 1 a 5) y dejar óptica y dirección más
  simples.
- **¿Hay datos reales en Firebase?** Define si la migración empieza desde Firebase además de
  la app de agenda actual.
- **¿Qué equipos tiene la clínica?** Marca y modelo del OCT, el campímetro y el biómetro. No
  hace falta para el demo, pero sí para cumplir los 30 días.
- **Sin login, el demo es público para quien tenga el enlace.** Solo datos ficticios, y una
  dirección que no se adivine.
