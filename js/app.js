import { db, auth } from './firebase-config.js';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { CL_FIJOS, CL_NUEVOS, setCLNuevos, todos } from './clientes.js';
import { E, semKey, numSem, toast } from './state.js';
import { renderPedidos } from './pedidos.js';
import { renderEntregas } from './entregas.js';
import { renderCobros } from './cobros.js';
import { renderReporte } from './reporte.js';
import { renderClientes } from './clientes-ui.js';
// Al inicio de app.js agregar
import { renderMenu, } from './menu-ui.js';
import { cargarMenu, menuSemana } from './menu.js';
import { renderReporteMensual } from './reporte-mensual-ui.js';
import { renderDashboard } from './dashboard-ui.js';

const provider = new GoogleAuthProvider();

export function render() {
  renderPedidos();
  renderEntregas('lunes');
  renderEntregas('jueves');
  renderCobros();
  renderReporte();
}

// AUTH
// ══════════════════════════════════════
// MODO LOCAL — comentar antes de subir a Vercel
// ══════════════════════════════════════
const ES_LOCAL = window.location.hostname === '127.0.0.1' ||
                 window.location.hostname === 'localhost';

if (ES_LOCAL) {
  document.getElementById('loading').style.opacity = '0';
  setTimeout(() => {
    document.getElementById('loading').style.display = 'none';
    document.querySelector('.shell').style.display = 'flex';
    document.querySelector('.bnav').style.display  = 'flex';
    document.getElementById('sb-uname').textContent = 'Modo desarrollo';
    document.getElementById('login-screen').style.display = 'none';
  }, 400);
  iniciarApp();
} else {

// ══════════════════════════════════════
// PRODUCCION — Vercel
// ══════════════════════════════════════
  onAuthStateChanged(auth, async user => {
    const loading     = document.getElementById('loading');
    const loginScreen = document.getElementById('login-screen');
    const shell       = document.querySelector('.shell');
    const bnav        = document.querySelector('.bnav');

    if (user) {
      document.getElementById('sb-uname').textContent = user.displayName || user.email;
      const av = document.getElementById('sb-avatar');
      if (user.photoURL) av.src = user.photoURL;
      else av.style.display = 'none';
      loginScreen.style.display = 'none';
      shell.style.display = 'flex';
      bnav.style.display  = 'flex';
      loading.style.opacity = '0';
      setTimeout(() => loading.style.display = 'none', 400);
      await iniciarApp();
    } else {
      shell.style.display = 'none';
      bnav.style.display  = 'none';
      loading.style.opacity = '0';
      setTimeout(() => {
        loading.style.display = 'none';
        loginScreen.style.display = 'flex';
      }, 400);
    }
  });

} // fin else produccion



async function iniciarApp() {
  const sem   = numSem();
  const fecha = new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });
  document.getElementById('sb-sem').textContent  = 'Semana ' + sem;
  document.getElementById('sb-fecha').textContent = fecha;
  document.getElementById('tb-sem').textContent   = 'Sem. ' + sem;
  document.getElementById('rep-sub').textContent  = 'Semana ' + sem + ' - ' + new Date().getFullYear();

  try {
    const snap = await getDoc(doc(db, 'semanas', semKey()));
    if (snap.exists()) {
      const d = snap.data();
      if (d.pedidos) Object.assign(E.pedidos, d.pedidos);
      if (d.lunes)   Object.assign(E.lunes,   d.lunes);
      if (d.jueves)  Object.assign(E.jueves,  d.jueves);
      if (d.cobros)  Object.assign(E.cobros,  d.cobros);
      if (d.viajes)  Object.assign(E.viajes,  d.viajes);
      if (d.costos)  Object.assign(E.costos,  d.costos);
    }
    const clSnap = await getDocs(collection(db, 'clientes-nuevos'));
    const nuevos = [];
    clSnap.forEach(d => nuevos.push({ ...d.data(), fid: d.id, fijo: false }));
    setCLNuevos(nuevos);

    const editsSnap = await getDocs(collection(db, 'clientes-edits'));
    editsSnap.forEach(d => {
      const data = d.data();
      const cl = CL_FIJOS.find(c => c.id === data.id);
      if (cl) {
        if (data.tipo)   cl.tipo   = data.tipo;
        if (data.metodo) cl.metodo = data.metodo;
      }
    });
  } catch(e) {
    console.log('Sin datos previos');
  }

  document.getElementById('costo-ingredientes').value = E.costos.ingredientes || '';
  document.getElementById('costo-gas').value          = E.costos.gas          || '';
  document.getElementById('costo-desechables').value  = E.costos.desechables  || '';
  document.getElementById('costo-otros').value        = E.costos.otros        || '';

 
  // Cargar menu semanal
    await cargarMenu();
     render();
        renderMenu();
        document.getElementById('menu-sub').textContent = 'Semana ' + sem + ' - ' + new Date().getFullYear();
        document.getElementById('menu-semana-num').textContent = 'Sem. ' + sem;
    renderClientes();
    renderDashboard();
}

window.guardar = async () => {
  E.costos.ingredientes = parseFloat(document.getElementById('costo-ingredientes').value) || 0;
  E.costos.gas          = parseFloat(document.getElementById('costo-gas').value)          || 0;
  E.costos.desechables  = parseFloat(document.getElementById('costo-desechables').value)  || 0;
  E.costos.otros        = parseFloat(document.getElementById('costo-otros').value)        || 0;
  try {
    await setDoc(doc(db, 'semanas', semKey()), {
      semana: numSem(), ano: new Date().getFullYear(),
      pedidos: E.pedidos, lunes: E.lunes, jueves: E.jueves,
      cobros: E.cobros, viajes: E.viajes, costos: E.costos,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    toast('Guardado en la nube');
  } catch(e) { toast('Error al guardar'); }
};

window.loginGoogle = async () => {
  try { await signInWithPopup(auth, provider); }
  catch(e) { toast('Error al iniciar sesion'); }
};
window.logout = async () => { await signOut(auth); };

window.irA = (p, btn) => {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.nav-item,.bi').forEach(x => x.classList.remove('active'));
  document.getElementById('page-' + p).classList.add('active');
  document.querySelectorAll(`[onclick*="irA('${p}"]`).forEach(x => x.classList.add('active'));
  if (p === 'reporte-mensual') renderReporteMensual();
  if (p === 'dashboard') renderDashboard();
  window.scrollTo(0, 0);
  cerrarSidebar();
};
window.toggleSidebar = () => {
  const s = document.getElementById('sidebar');
  s.classList.toggle('open');
  document.getElementById('overlay').style.display = s.classList.contains('open') ? 'block' : 'none';
};
window.cerrarSidebar = () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').style.display = 'none';
};
window.actualizarCostos = async () => {
  const cosIng = parseFloat(document.getElementById('costo-ingredientes').value) || 0;
  const cosGas = parseFloat(document.getElementById('costo-gas').value)          || 0;
  const cosDes = parseFloat(document.getElementById('costo-desechables').value)  || 0;
  const cosOtr = parseFloat(document.getElementById('costo-otros').value)        || 0;
  const total  = cosIng + cosGas + cosDes + cosOtr;

  E.costos.ingredientes = cosIng;
  E.costos.gas          = cosGas;
  E.costos.desechables  = cosDes;
  E.costos.otros        = cosOtr;

  const display = document.getElementById('total-costos-display');
  if (display) display.textContent = 'Q' + total;
  await renderReporte();
  
};