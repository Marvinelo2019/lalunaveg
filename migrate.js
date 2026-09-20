import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD5gShTcwGzSwqe0aEYt_wJxbcxB_Do_b4",
  authDomain: "luna-vegetariana.firebaseapp.com",
  projectId: "luna-vegetariana",
  storageBucket: "luna-vegetariana.firebasestorage.app",
  messagingSenderId: "444275004744",
  appId: "1:444275004744:web:cb8acbd69ebb5c63730f7d"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const ORG_ID = 'luna-veg';

async function migrarColeccion(nombreColeccion) {
  console.log(`Migrando ${nombreColeccion}...`);
  const snap = await getDocs(collection(db, nombreColeccion));
  let count = 0;
  for (const documento of snap.docs) {
    const destino = doc(db, 'organizaciones', ORG_ID, nombreColeccion, documento.id);
    await setDoc(destino, documento.data());
    console.log(`  ✓ ${documento.id}`);
    count++;
  }
  console.log(`  Total: ${count} documentos migrados\n`);
}

async function main() {
  console.log('Iniciando migracion a organizaciones/luna-veg/\n');
  await migrarColeccion('semanas');
  await migrarColeccion('menus');
  await migrarColeccion('clientes-nuevos');
  await migrarColeccion('clientes-edits');
  console.log('Migracion completa.');
}

main().catch(console.error);
