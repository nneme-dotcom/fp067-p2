# VBE Eagles Echternach · Drills (Producto 2)

La biblioteca de ejercicios de voleibol del **VBE Eagles Echternach**. Eliges un ejercicio de la lista y ves su ficha: objetivo, roles, secuencia y rotación, con un enlace a su animación en 3D. También se pueden añadir ejercicios nuevos, editarlos y borrarlos.

Los datos están en Firestore (Firebase) y la web se actualiza sola cuando algo cambia, aunque el cambio se haga desde la consola.

Es el Producto 2 de la asignatura FP.451 *Desarrollo front-end con frameworks avanzados en entornos móviles* (CFGS DAW, UOC). Lo hago yo solo: Nadir Neme Rodriguez.

- La web está en **inglés**, como en el Producto 1. Los textos de cada ejercicio están como los escribe el entrenador, en español.
- Los logos, los colores y las letras son los de la web del club: [volleyball-echternach.lu](https://volleyball-echternach.lu/).

## Qué necesitas

- **Node.js 20.19, 22.12 o más nuevo** (o la versión 24).
- Un proyecto de **Firebase** con Firestore. Vale el plan gratuito (Spark).

## Cómo arrancarlo

```bash
npm install          # descarga lo necesario (solo la primera vez)
npm start            # abre la web en http://localhost:4200
npm run build        # prepara la versión final en la carpeta dist/
```

**En CodeSandbox** el proyecto ya trae la configuración para instalar todo y arrancar la web solo. Solo falta rellenar los datos de Firebase (siguiente apartado).

## Conectar con Firebase

1. En la [consola de Firebase](https://console.firebase.google.com/) crea un proyecto.
2. En **Firestore Database**, crea la base de datos en una región cercana.
3. En la pestaña **Reglas**, pega el contenido de `firestore.rules` y publica.
4. En **Configuración del proyecto → Tus apps**, añade una app web y copia sus datos en `src/app/firebase.config.json`.
5. Carga los ejercicios de ejemplo:

   ```bash
   npm run seed
   ```

   Cada ejercicio se guarda con un nombre fijo, así que se puede repetir sin crear duplicados.

Mientras `firebase.config.json` siga con los valores de ejemplo, la web avisa de que falta configurarlo.

## Qué hace la web

| Lo que pide el producto | Cómo está hecho |
|---|---|
| **La base de datos** | Colección `drills` en Firestore. Cada ejercicio tiene nombre, objetivo, jugadoras, espacio y descripción, y de forma opcional roles, secuencia, rotación, progresiones, enlace a la animación, imagen y vídeo. |
| **La lista** (`DrillsComponent`) | Lee los ejercicios en directo. Cada fila lleva su icono de borrar (pide confirmación) y el botón **New drill** abre el formulario. Tiene buscador y filtro por espacio. |
| **El detalle** (`DetailComponent`) | Muestra todos los datos. El botón **Edit** abre el formulario con los datos puestos. Si el ejercicio tiene vídeo sale el reproductor, y si tiene animación sale un botón para abrirla. |
| **El alta** (`DrillFormComponent`) | Un mismo formulario sirve para crear y para editar. Los campos obligatorios avisan si faltan, y los enlaces se comprueban. Al guardar sale un aviso y se vuelve a la lista para elegir otro ejercicio. |

## Dónde está cada cosa

```
src/app/
├── models/drill.ts                  Qué datos tiene cada ejercicio
├── services/drills.service.ts       Todo lo que se hace con Firestore (leer, añadir, editar, borrar)
├── pipes/drill-filter.pipe.ts       El filtro de la lista
├── firebase.config.json             Los datos del proyecto de Firebase
├── data/drills.seed.json            Los ejercicios de ejemplo
├── components/
│   ├── header/                      La cabecera con el logo y el lema #goeagles
│   ├── drills/                      La lista con el buscador
│   ├── detail/                      La ficha del ejercicio
│   ├── drill-form/                  El formulario de alta y edición
│   └── media/                       El reproductor de vídeo
└── app.ts / app.html / app.scss     La página que lo junta todo
scripts/seed.mjs                     Carga los ejercicios de ejemplo en Firestore
firestore.rules                      Las reglas de la base de datos
```

## Algunas decisiones

- **Angular 21, no 22.** `@angular/fire` todavía no tiene versión estable para Angular 22 (solo una candidata, la `22.0.0-rc.0`), así que uso Angular 21 con la última versión estable de `@angular/fire`.
- **Imagen, vídeo y animación son enlaces.** No se suben ficheros: Cloud Storage obliga a pasar al plan de pago de Firebase. El formulario acepta enlaces con `https://` o rutas dentro de `assets/`.
- **Reglas abiertas.** Cualquiera puede leer y escribir, porque la práctica lo pide así. Antes de publicar la web de verdad habría que pedir un inicio de sesión.
- **Las animaciones tienen su propio estilo.** La web es negra y lima como la del club; las animaciones 3D de cada ejercicio conservan su estética y se abren aparte.

## Hitos

| Etiqueta | Qué incluye |
|---|---|
| `v2.0-setup` | La base del proyecto: Angular 21, Bootstrap, letras y configuración |
| `v2.1-firestore` | El modelo, el servicio de Firestore, el filtro y los datos de ejemplo |
| `v2.2-crud` | La lista, el detalle, el formulario y el reproductor |
