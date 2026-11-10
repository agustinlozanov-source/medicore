# Medical Hub OS · demo

Demo para Clínica de Visión Monte Sinaí y Óptica Shalom. Datos ficticios, sin login.
El plan completo está en [PLAN-DEMO.md](PLAN-DEMO.md) y la app anterior en `legacy/`.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # sitio estático en out/
```

Netlify toma la configuración de `netlify.toml`: `npm run build` y publica `out/`.

## Datos

Los datos viven en Firebase (`medicore-879e2`), bajo `demo/monte-sinai`. Para que se
guarden ahí, las reglas de Firestore necesitan, antes del bloque final que niega todo:

```
match /demo/{document=**} {
  allow read, write: if true;
}
```

Sin esa regla, o sin internet la primera vez, el demo guarda en el navegador y lo indica
abajo a la izquierda. Cada día arranca con los datos de ejemplo de ese día, y "Reiniciar
demo" los vuelve a cargar.

Con Firebase, el demo sigue funcionando sin internet: los cambios quedan en fila y suben
solos al volver la conexión.
