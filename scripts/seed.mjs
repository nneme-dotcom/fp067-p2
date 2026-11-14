// Loads the drills from src/app/data/drills.seed.json into Firestore.
// Usage: npm run seed   (first fill in src/app/firebase.config.json)
// Each drill is saved with its id, so running the command again does not create duplicates.
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
// Firestore leaves the connection open; we exit by hand
process.exit(0);
