import { E, toast } from './state.js';
import { render } from './app.js';
import { todos, SUE, TAG, PLAN } from './clientes.js';



const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const DIAS_LABEL = { lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue', viernes: 'Vie' };


export function getDias(p) {
  if (p.dias) {
    const total = Object.values(p.dias).reduce((s, v) => s + v, 0);
    if (total > 0) return p.dias;
  }
  const cant = p.cantidad || 1;
  return { lunes: cant, martes: 0, miercoles: 0, jueves: cant, viernes: 0 };
}

function totalAlmuerzos(p) {
  if (p.planTipo === 'semanal') return p.cantidad || 1;
  const dias = getDias(p);
  return DIAS.reduce((sum, d) => sum + (dias[d] || 0), 0);
}

export function calcularPrecio(cl, p) {
  if (p.planTipo === 'semanal') {
    const cantPlanes = p.cantidad || 1;
    return PLAN[cl.tipo] * cantPlanes;
  }
  const dias  = getDias(p);
  const total = Object.values(dias).reduce((sum, v) => sum + v, 0);
  return SUE[cl.tipo] * total + 25;
}

export function precioConExtras(cl, p) {
  const base       = calcularPrecio(cl, p);
  const extra      = p.extra || {};
  const extraAlm   = (extra.cantidad || 0) * (SUE[cl.tipo] || 45);
  const extraCobro = parseFloat(extra.cobro) || 0;
  return base + extraAlm + extraCobro;
}
function ck() {
  return '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function lapiz() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
}

export function renderPedidos() {
  const cont = document.getElementById('lista-pedidos');
  cont.innerHTML = '';
  let tot = 0, conf = 0, totalAlm = 0;

  const clientesOrdenados = todos().sort((a, b) => {
    const pA = E.pedidos[a.id];
    const pB = E.pedidos[b.id];
    const confA = pA && pA.confirmado ? 1 : 0;
    const confB = pB && pB.confirmado ? 1 : 0;
    return confB - confA;
  });
  let separadorAgregado = false;
  clientesOrdenados.forEach(cl => {
    const p = E.pedidos[cl.id] || {
      confirmado: false,
      planTipo: 'semanal',
      cantidad: 1,
      dias: { lunes: 0, martes: 0, miercoles: 0, jueves: 0, viernes: 0 },
      nota: '',
      extra: { activo: false, cantidad: 0, cobro: 0, nota: '' }
    };
    if (!p.extra) p.extra = { activo: false, cantidad: 0, cobro: 0, nota: '' };
    if (!p.dias)  p.dias  = getDias(p);
    E.pedidos[cl.id] = p;

    const pt         = precioConExtras(cl, p);
    const almTotal   = totalAlmuerzos(p);
    const tieneExtra = p.extra.activo && ((p.extra.cantidad || 0) > 0 || (p.extra.cobro || 0) > 0);
    const notaVisible = p.nota && p.nota.trim() !== '';
    const notaBadge = notaVisible
      ? '<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;background:var(--amber-pale);color:var(--amber-dark);padding:2px 7px;border-radius:20px;margin-left:6px;">✎ nota</span>'
      : '';
    const diasMarcados = DIAS.filter(d => (p.dias[d] || 0) > 0)
      .map(d => DIAS_LABEL[d] + (p.dias[d] > 1 ? ' x' + p.dias[d] : ''))
      .join(' · ');
    const diasHtml = diasMarcados
      ? '<div style="font-size:11px;color:var(--text3);margin-top:3px;">' + diasMarcados + '</div>'
      : '';

    if (p.confirmado) { tot += pt; conf++; totalAlm += almTotal; }

// Contador de planes (solo en modo semanal)
        const contadorPlanes = p.planTipo === 'semanal' ?
        '<div class="qwrap" style="margin-bottom:6px;">' +
            '<span class="qunit" style="min-width:60px;">Planes:</span>' +
            '<button class="qbtn" onclick="CC(\'' + cl.id + '\',-1)">-</button>' +
            '<div class="qnum">' + (p.cantidad || 1) + '</div>' +
            '<button class="qbtn" onclick="CC(\'' + cl.id + '\',1)">+</button>' +
        '</div>' : '';
    // Contadores por dia
    const contadoresDias = DIAS.map(dia =>
      '<div class="dia-row">' +
        '<span class="dia-lbl">' + DIAS_LABEL[dia] + '</span>' +
        '<button class="qbtn" onclick="setDia(\'' + cl.id + '\',\'' + dia + '\',-1)">-</button>' +
        '<div class="qnum">' + (p.dias[dia] || 0) + '</div>' +
        '<button class="qbtn" onclick="setDia(\'' + cl.id + '\',\'' + dia + '\',1)">+</button>' +
      '</div>'
    ).join('');

    

  const subprecio = p.planTipo === 'semanal'
  ? (p.cantidad > 1 ? 'plan x' + p.cantidad : 'plan semanal')
  : 'suelto · ' + Object.values(getDias(p)).reduce((s,v)=>s+v,0) + ' alm.';

    if (!p.confirmado && !separadorAgregado) {
      separadorAgregado = true;
      const sep = document.createElement('div');
      sep.style.cssText = 'padding:8px 20px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;background:var(--bg);border-bottom:1px solid var(--border);';
      sep.textContent = 'Sin confirmar';
      cont.appendChild(sep);
    }

    const d = document.createElement('div');
    d.innerHTML =
      '<div class="crow">' +
        '<div class="av av-' + cl.tipo + '">' + cl.ini + '</div>' +
        '<div>' +
          '<div class="cname">' + cl.nombre + notaBadge + '</div>' +
          '<span class="ctag tag-' + cl.tipo + '">' + TAG[cl.tipo] + '</span>' +
          diasHtml +
          '<div class="ptoggle">' +
            '<button class="popt ' + (p.planTipo === 'semanal' ? 'active' : '') + '" onclick="SP(\'' + cl.id + '\',\'semanal\')">Plan semanal</button>' +
            '<button class="popt ' + (p.planTipo === 'suelto'  ? 'active' : '') + '" onclick="SP(\'' + cl.id + '\',\'suelto\')">Por almuerzo</button>' +
          '</div>' +
          // Contadores por dia
          contadorPlanes +
          '<div class="dias-grid">' + contadoresDias + '</div>' +
          // Extras
          (p.extra.activo ?
            '<div class="extra-block">' +
              '<div class="extra-title">Extras esta semana</div>' +
              '<div class="extra-row">' +
                '<span class="extra-lbl">Almuerzos extra</span>' +
                '<button class="qbtn" onclick="setExtraCant(\'' + cl.id + '\',-1)">-</button>' +
                '<div class="qnum">' + (p.extra.cantidad || 0) + '</div>' +
                '<button class="qbtn" onclick="setExtraCant(\'' + cl.id + '\',1)">+</button>' +
                '<span class="qunit" style="color:var(--amber-dark);">x Q' + SUE[cl.tipo] + '</span>' +
              '</div>' +
              '<div class="extra-row">' +
                '<span class="extra-lbl">Cobro extra</span>' +
                '<span style="font-size:13px;color:var(--amber-dark);">Q</span>' +
                '<input class="extra-price-input" type="number" min="0" value="' + (p.extra.cobro || 0) + '" placeholder="0" onchange="setExtraCobro(\'' + cl.id + '\',this.value)">' +
              '</div>' +
              '<textarea class="extra-nota" rows="1" placeholder="Que es este extra? ej. hummus, envio adicional..." onchange="setExtraNota(\'' + cl.id + '\',this.value)">' + (p.extra.nota || '') + '</textarea>' +
            '</div>'
          : '<button class="btn-extra" onclick="toggleExtra(\'' + cl.id + '\')">+ Agregar extra</button>') +
          // Nota especial
          '<div class="nota-wrap" id="nota-wrap-' + cl.id + '" style="display:' + (notaVisible ? 'block' : 'none') + ';">' +
            '<textarea class="nota-input" id="nota-txt-' + cl.id + '" rows="1" placeholder="Indicacion especial ej. sin champiñones..." onchange="setNota(\'' + cl.id + '\',this.value)">' + (p.nota || '') + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="price-col">' +
          '<div class="price-main ' + (p.confirmado ? '' : 'muted') + '">Q' + pt + '</div>' +
          '<div class="price-sub">' + subprecio + '</div>' +
          (tieneExtra ? '<div class="price-extra">incl. extras</div>' : '') +
        '</div>' +
        '<button class="btn-nota" onclick="toggleNota(\'' + cl.id + '\')" title="Nota">' + lapiz() + '</button>' +
        '<button class="chk ' + (p.confirmado ? 'on' : '') + '" onclick="TP(\'' + cl.id + '\')">' + (p.confirmado ? ck() : '') + ' </button>' +
      '</div>';
    cont.appendChild(d);
  });

  document.getElementById('s-conf').textContent = conf;
  document.getElementById('s-tot').textContent  = 'Q' + tot;

  document.getElementById('ft-p').textContent   = 'Q' + tot;
  document.getElementById('nb-p').textContent   = conf;

  const totalesDias = { lunes: 0, martes: 0, miercoles: 0, jueves: 0, viernes: 0 };
  const DIAS_TODOS  = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  const DIAS_LBL    = { lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue', viernes: 'Vie' };

  todos().forEach(cl => {
    const p = E.pedidos[cl.id];
    if (!p || !p.confirmado) return;
    const dias = getDias(p);
    DIAS_TODOS.forEach(d => { totalesDias[d] += (dias[d] || 0); });
  });

  const resumen = document.getElementById('resumen-dias');
  if (resumen) {
    resumen.innerHTML = DIAS_TODOS.map(d =>
      '<div class="resumen-dia-card ' + (totalesDias[d] > 0 ? 'activo' : '') + '">' +
        '<div class="resumen-dia-lbl">' + DIAS_LBL[d] + '</div>' +
        '<div class="resumen-dia-num">' + totalesDias[d] + '</div>' +
        '<div class="resumen-dia-txt">almuerzos</div>' +
      '</div>'
    ).join('');
  }

  const totalEntregaLunes  = (totalesDias.lunes || 0) + (totalesDias.martes || 0) + (totalesDias.miercoles || 0);
  const totalEntregaJueves = (totalesDias.jueves || 0) + (totalesDias.viernes || 0);

  const resumenEntregas = document.getElementById('resumen-entregas');
  if (resumenEntregas) {
    resumenEntregas.innerHTML =
      '<div class="entrega-sum">' +
        '<span class="entrega-sum-lbl">Entrega lunes</span>' +
        '<span class="entrega-sum-num">' + totalEntregaLunes + '</span>' +
        '<span class="entrega-sum-txt">almuerzos · Lun + Mar + Mié</span>' +
      '</div>' +
      '<div class="entrega-sum">' +
        '<span class="entrega-sum-lbl">Entrega jueves</span>' +
        '<span class="entrega-sum-num">' + totalEntregaJueves + '</span>' +
        '<span class="entrega-sum-txt">almuerzos · Jue + Vie</span>' +
      '</div>';
  }
}

// ACCIONES
window.TP = id => {
  const p = E.pedidos[id] || { confirmado: false, planTipo: 'semanal', cantidad: 1, dias: { lunes: 0, martes: 0, miercoles: 0, jueves: 0, viernes: 0 }, nota: '', extra: { activo: false, cantidad: 0, cobro: 0, nota: '' } };
  E.pedidos[id] = p;
  p.confirmado = !p.confirmado;
  render();
};
window.SP = (id, t) => {
  const p = E.pedidos[id] || { confirmado: false, planTipo: 'semanal', cantidad: 1, dias: { lunes: 0, martes: 0, miercoles: 0, jueves: 0, viernes: 0 }, nota: '', extra: { activo: false, cantidad: 0, cobro: 0, nota: '' } };
  E.pedidos[id] = p;
  p.planTipo = t;
  render();
};
window.setDia = (id, dia, delta) => {
  const p = E.pedidos[id]; if (!p) return;
  if (!p.dias) p.dias = { lunes: 0, martes: 0, miercoles: 0, jueves: 0, viernes: 0 };
  p.dias[dia] = Math.max(0, (p.dias[dia] || 0) + delta);
  render();
};
window.toggleExtra = id => {
  if (!E.pedidos[id]) E.pedidos[id] = { confirmado: false, planTipo: 'semanal', cantidad: 1, dias: { lunes: 0, martes: 0, miercoles: 0, jueves: 0, viernes: 0 }, nota: '', extra: { activo: false, cantidad: 0, cobro: 0, nota: '' } };
  const p = E.pedidos[id];
  if (!p.extra) p.extra = { activo: false, cantidad: 0, cobro: 0, nota: '' };
  p.extra.activo = true;
  render();
};
window.setExtraCant = (id, d) => {
  const p = E.pedidos[id]; if (!p || !p.extra) return;
  p.extra.cantidad = Math.max(0, (p.extra.cantidad || 0) + d);
  render();
};
window.setExtraCobro = (id, v) => {
  const p = E.pedidos[id]; if (!p || !p.extra) return;
  p.extra.cobro = parseFloat(v) || 0;
  render();
};
window.setExtraNota = (id, v) => {
  const p = E.pedidos[id]; if (!p || !p.extra) return;
  p.extra.nota = v;
};
window.setNota = (id, v) => {
  const p = E.pedidos[id]; if (!p) return;
  p.nota = v;
};
window.CC = (id, delta) => {
  const p = E.pedidos[id]; if (!p) return;
  p.cantidad = Math.max(1, (p.cantidad || 1) + delta);
  render();
};
window.toggleNota = id => {
  const w = document.getElementById('nota-wrap-' + id); if (!w) return;
  const vis = w.style.display === 'block';
  w.style.display = vis ? 'none' : 'block';
  if (!vis) { const t = document.getElementById('nota-txt-' + id); if (t) t.focus(); }
};