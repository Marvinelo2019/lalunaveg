import { E } from './state.js';
import { todos, SUE } from './clientes.js';
import { db } from './firebase-config.js';
import { getDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { precioConExtras, getDias } from './pedidos.js';

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

export function renderReporte() {
  let fac = 0, alm = 0, cob = 0, pen = 0, tL = 0, tJ = 0, totalExtras = 0;
  const cli = [];

  todos().forEach(cl => {
    const p = E.pedidos[cl.id];
    if (!p || !p.confirmado) return;

    const pt         = precioConExtras(cl, p);
    const extra      = p.extra || {};
    const extraMonto = (extra.cantidad || 0) * SUE[cl.tipo] + (parseFloat(extra.cobro) || 0);
    const dias       = getDias(p);
    const almTotal   = p.planTipo === 'semanal'
      ? (p.cantidad || 1)
      : DIAS.reduce((sum, d) => sum + (dias[d] || 0), 0);

    fac += pt;
    alm += almTotal;
    totalExtras += extraMonto;
    cli.push({ n: cl.nombre, m: pt, ext: extraMonto });

    const co = E.cobros[cl.id];
    if (co && co.pagado) cob += pt; else pen += pt;

    if (E.lunes[cl.id]  && E.lunes[cl.id].entregado)  tL += pt;
    if (E.jueves[cl.id] && E.jueves[cl.id].entregado) tJ += pt;
  });

  // Costos
  const cosIng = parseFloat(E.costos.ingredientes) || 0;
  const cosGas = parseFloat(E.costos.gas)          || 0;
  const cosDes = parseFloat(E.costos.desechables)  || 0;
  const cosOtr = parseFloat(E.costos.otros)        || 0;
  const totalCostos = cosIng + cosGas + cosDes + cosOtr;

  const env = ((E.viajes.lunes || 0) + (E.viajes.jueves || 0)) * 25;
  const uti = fac - env - totalCostos;
  const die = Math.round(uti * 0.10);
  const ofr = Math.round(uti * 0.05);

  // Actualizar DOM
  document.getElementById('r-alm').textContent = alm;
  document.getElementById('r-fac').textContent = 'Q' + fac;
  document.getElementById('r-env').textContent = '-Q' + env;
  document.getElementById('r-cos').textContent = '-Q' + totalCostos;
  document.getElementById('r-uti').textContent = 'Q' + uti;
  document.getElementById('r-die').textContent = 'Q' + die;
  document.getElementById('r-ofr').textContent = 'Q' + ofr;
  document.getElementById('r-lun').textContent = 'Q' + tL;
  document.getElementById('r-jue').textContent = 'Q' + tJ;
  document.getElementById('r-ext').textContent = 'Q' + totalExtras;
  document.getElementById('r-cob').textContent = 'Q' + cob;
  document.getElementById('r-pen').textContent = 'Q' + pen;

  const tcDisplay = document.getElementById('total-costos-display');
  if (tcDisplay) tcDisplay.textContent = 'Q' + totalCostos;

  document.getElementById('r-cli').innerHTML = cli.map(x =>
    '<div class="rrow">' +
      '<span class="rlbl">' + x.n + '</span>' +
      '<span class="rval">Q' + x.m +
        (x.ext > 0 ? ' <span style="font-size:11px;color:var(--amber-dark);">+Q' + x.ext + ' extra</span>' : '') +
      '</span>' +
    '</div>'
  ).join('');

  // Comparativo semana anterior
  cargarComparativo(fac, uti, alm, totalCostos);
}

async function cargarComparativo(facActual, utiActual, almActual, costosActual) {
  const cont = document.getElementById('r-comparativo');
  if (!cont) return;

  try {
    const n   = new Date();
    const s   = new Date(n.getFullYear(), 0, 1);
    const sem = Math.ceil(((n - s) / 86400000 + s.getDay() + 1) / 7);
    const ano = n.getFullYear();
    const semAnt = sem - 1;
    const keyAnt = semAnt > 0
      ? 'semana-' + semAnt + '-' + ano
      : 'semana-52-' + (ano - 1);

    const snap = await getDoc(doc(db, 'semanas', keyAnt));

    if (!snap.exists()) {
      cont.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:13px;padding:16px;">Sin datos de la semana anterior aun.</div>';
      return;
    }

    const d = snap.data();
    let facAnt = 0, utiAnt = 0, almAnt = 0, costosAnt = 0;

    if (d.pedidos) {
      todos().forEach(cl => {
        const p = d.pedidos[cl.id];
        if (!p || !p.confirmado) return;
        const pt   = precioConExtras(cl, p);
        const dias = getDias(p);
        facAnt += pt;
        almAnt += DIAS.reduce((sum, dia) => sum + (dias[dia] || 0), 0);
      });
    }

    if (d.costos) {
      costosAnt = (parseFloat(d.costos.ingredientes) || 0) +
                 (parseFloat(d.costos.gas)           || 0) +
                 (parseFloat(d.costos.desechables)   || 0) +
                 (parseFloat(d.costos.otros)         || 0);
    }

    const envAnt = (((d.viajes || {}).lunes || 0) + ((d.viajes || {}).jueves || 0)) * 25;
    utiAnt = facAnt - envAnt - costosAnt;

    const fila = (lbl, actual, anterior) => {
      const diff   = actual - anterior;
      const pct    = anterior > 0 ? Math.round((diff / anterior) * 100) : 0;
      const color  = diff >= 0 ? 'var(--verde)' : 'var(--amber-dark)';
      const flecha = diff >= 0 ? '↑' : '↓';
      const signo  = diff >= 0 ? '+' : '';
      const esQ    = !lbl.includes('lmuerzos');
      return '<div class="rrow">' +
        '<span class="rlbl">' + lbl + '</span>' +
        '<span style="font-size:12px;color:var(--text3);">' + (esQ ? 'Q' : '') + anterior + '</span>' +
        '<span style="font-size:13px;font-weight:600;">' + (esQ ? 'Q' : '') + actual + '</span>' +
        '<span style="font-size:12px;font-weight:600;color:' + color + ';">' +
          signo + (esQ ? 'Q' : '') + diff + ' ' + flecha + (anterior > 0 ? ' ' + pct + '%' : '') +
        '</span>' +
      '</div>';
    };

    cont.innerHTML =
      '<div class="rrow" style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;">' +
        '<span class="rlbl"></span>' +
        '<span>Sem. anterior</span>' +
        '<span>Esta sem.</span>' +
        '<span>Diferencia</span>' +
      '</div>' +
      fila('Facturado',    facActual,    facAnt) +
      fila('Utilidad neta', utiActual,  utiAnt) +
      fila('Almuerzos',    almActual,    almAnt) +
      fila('Costos',       costosActual, costosAnt);

  } catch(e) {
    cont.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:13px;padding:16px;">No se pudo cargar el comparativo.</div>';
  }
}