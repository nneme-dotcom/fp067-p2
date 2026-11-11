// Carga los drills de src/app/data/drills.seed.json en Firestore.
// Uso: npm run seed   (antes hay que rellenar src/app/firebase.config.json)
// Cada drill se guarda con su id, así que repetir el comando no crea duplicados.
import { readFile } from 'node:fs/promises';
import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf-8'));

const config = await read('../src/app/firebase.config.json');
const drills = await read('../src/app/data/drills.seed.json');

if (config.projectId.startsWith('YOUR_')) {
  console.error('Primero pon los datos de tu proyecto en src/app/firebase.config.json');
  process.exit(1);
}

const db = getFirestore(initializeApp(config));

for (const { id, ...data } of drills) {
  await setDoc(doc(db, 'drills', id), data);
  console.log(`✓ ${id}`);
}

console.log(`${drills.length} drills guardados.`);
// Firestore deja la conexión abierta; salimos a mano
process.exit(0);
