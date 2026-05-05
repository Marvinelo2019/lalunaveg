import { E, toast } from './state.js';
import { todos, SUE } from './clientes.js';
import { renderReporte } from './reporte.js';
import { precioConExtras } from './pedidos.js';

export function renderCobros() {
  const cont = document.getElementById('lista-cobros');
  cont.innerHTML = '';
  let cob = 0, pen = 0, pag = 0, deb = 0;

  todos().forEach(cl => {
    const p = E.pedidos[cl.id];
    if (!p || !p.confirmado) return;

    const co = E.cobros[cl.id] || { pagado: false };
    E.cobros[cl.id] = co;

    const pt         = precioConExtras(cl, p);
    const extra      = p.extra || {};
    const tieneExtra = (extra.cantidad || 0) > 0 || (extra.cobro || 0) > 0;

    if (co.pagado) { cob += pt; pag++; } else { pen += pt; deb++; }

    const d = document.createElement('div');
    d.innerHTML =
      '<div class="prow">' +
        '<div class="av av-' + cl.tipo + '">' + cl.ini + '</div>' +
        '<div>' +
          '<div class="pname">' + cl.nombre + '</div>' +
          '<div class="psub">' + cl.metodo + ' - ' +
            (p.planTipo === 'semanal' ? 'plan semanal' : 'almuerzo suelto') +
          '</div>' +
          (tieneExtra ? '<div class="pnota">+ extras: Q' + ((extra.cantidad || 0) * SUE[cl.tipo] + (parseFloat(extra.cobro) || 0)) + '</div>' : '') +
        '</div>' +
        '<div><div class="pmonto">Q' + pt + '</div></div>' +
        '<div class="pstado">' +
          '<button class="estbtn ' + (co.pagado ? 'est-ok' : 'est-no') + '" onclick="TC(\'' + cl.id + '\')">' +
            (co.pagado ? 'Pagado' : 'Pendiente') +
          '</button>' +
        '</div>' +
      '</div>';
    cont.appendChild(d);
  });

  document.getElementById('c-cob').textContent  = 'Q' + cob;
  document.getElementById('c-pen').textContent  = 'Q' + pen;
  document.getElementById('c-pag').textContent  = pag;
  document.getElementById('c-deb').textContent  = deb;
  document.getElementById('ft-cob').textContent = 'Q' + (cob + pen);
  document.getElementById('nb-c').textContent   = deb;
}

// ACCIONES
window.TC = id => {
  if (!E.cobros[id]) E.cobros[id] = { pagado: false };
  E.cobros[id].pagado = !E.cobros[id].pagado;
  renderCobros();
  renderReporte();
};

window.recordatorio = () => {
  const ls = ['Luna Veg - Recordatorio de pago\n'];
  let hayPendientes = false;

  todos().forEach(cl => {
    const p  = E.pedidos[cl.id];
    const co = E.cobros[cl.id];
    if (!p || !p.confirmado || (co && co.pagado)) return;
    ls.push('- ' + cl.nombre + ': Q' + precioConExtras(cl, p) + ' pendiente');
    hayPendientes = true;
  });

  if (!hayPendientes) { toast('No hay cobros pendientes'); return; }
  ls.push('\nGracias por su preferencia!');

  const texto = ls.join('\n');
  const url   = 'https://wa.me/?text=' + encodeURIComponent(texto);
  window.open(url, '_blank');
  toast('Abriendo WhatsApp...');
};