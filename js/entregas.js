import { E, toast } from './state.js';
import { todos, SUE } from './clientes.js';
import { renderReporte } from './reporte.js';
import { precioConExtras, getDias } from './pedidos.js';
import { getMenuDia, cargarMenu } from './menu.js';

const DIAS_LABEL = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes'
};

export function renderEntregas(dia) {
   cargarMenu();
  const cont = document.getElementById('lista-' + dia);
  if (!cont) return;
  cont.innerHTML = '';
  let tot = 0;
  const vj = E.viajes[dia] || 0;

  todos().forEach(cl => {
    const p = E.pedidos[cl.id];
    if (!p || !p.confirmado) return;

    // Solo mostrar si tiene almuerzos este dia
    const dias    = getDias(p);
    const cantDia = dias[dia] || 0;
    if (cantDia === 0) return;

    const e = E[dia][cl.id] || { entregado: false };
    E[dia][cl.id] = e;

    const pt = precioConExtras(cl, p);
    if (e.entregado) tot += pt;

    const extra      = p.extra || {};
    const tieneExtra = (extra.cantidad || 0) > 0 || (extra.cobro || 0) > 0;
    const extraTexto = tieneExtra ? ([]
      .concat((extra.cantidad || 0) > 0 ? [extra.cantidad + ' alm. extra Q' + (extra.cantidad * SUE[cl.tipo])] : [])
      .concat((extra.cobro    || 0) > 0 ? ['cobro extra Q' + extra.cobro] : [])
      .join(' + ')
    ) : '';

    const d = document.createElement('div');
    d.innerHTML =
      '<div class="prow">' +
        '<div class="av av-' + cl.tipo + '">' + cl.ini + '</div>' +
        '<div>' +
          '<div class="pname">' + cl.nombre + '</div>' +
          '<div class="psub">' +
                cantDia + ' almuerzo' + (cantDia > 1 ? 's' : '') +
                ' · ' + DIAS_LABEL[dia] +
                ' · ' + cl.metodo +
                '</div>' +
               '<div class="pnota" style="color:var(--verde);font-style:normal;font-weight:500;">' +
                    (getMenuDia(dia) || 'Sin platillo registrado') +
                    '</div>' +
          (p.nota && p.nota.trim() !== '' ? '<div class="pnota">Nota: ' + p.nota + '</div>' : '') +
          (tieneExtra ? '<div class="pnota">Extra: ' + extraTexto + (extra.nota ? ' (' + extra.nota + ')' : '') + '</div>' : '') +
        '</div>' +
        '<div>' +
          '<div class="pmonto">Q' + pt + '</div>' +
          (tieneExtra ? '<div class="pextra">+extras</div>' : '') +
        '</div>' +
        '<div class="pstado">' +
          '<button class="estbtn ' + (e.entregado ? 'est-ok' : 'est-no') + '" onclick="TE(\'' + dia + '\',\'' + cl.id + '\')">' +
            (e.entregado ? 'Entregado' : 'Pendiente') +
          '</button>' +
        '</div>' +
      '</div>';
    cont.appendChild(d);
  });

  // Si no hay nadie para este dia
  if (cont.innerHTML === '') {
    cont.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text3);font-size:13px;">No hay almuerzos registrados para este dia.</div>';
  }

  document.getElementById('v-' + dia).textContent  = vj;
  document.getElementById('cv-' + dia).textContent = 'Q' + (vj * 25) + ' descontado en envios';
  document.getElementById(dia === 'lunes' ? 'ft-lun' : 'ft-jue').textContent = 'Q' + tot;
}


// ACCIONES
window.TE = (dia, id) => {
  if (!E[dia][id]) E[dia][id] = { entregado: false };
  E[dia][id].entregado = !E[dia][id].entregado;
  renderEntregas(dia);
  renderReporte();
};

window.vj = (dia, d) => {
  E.viajes[dia] = Math.max(0, (E.viajes[dia] || 0) + d);
  renderEntregas(dia);
  renderReporte();
};

window.copiar = dia => {
  const ls = ['Luna Veg - Entrega ' + DIAS_LABEL[dia] + '\n'];
  todos().forEach(cl => {
    const p = E.pedidos[cl.id];
    if (!p || !p.confirmado) return;
    const dias    = getDias(p);
    const cantDia = dias[dia] || 0;
    if (cantDia === 0) return;
    const e  = E[dia][cl.id];
    const pt = precioConExtras(cl, p);
    let linea = (e && e.entregado ? 'Entregado' : 'Pendiente') + ' - ' + cl.nombre;
    linea += ' (' + cantDia + ' almuerzo' + (cantDia > 1 ? 's' : '') + ')';
    linea += ' - Q' + pt;
    if (p.nota && p.nota.trim() !== '') linea += ' · ' + p.nota;
    const extra = p.extra || {};
    if ((extra.cantidad || 0) > 0 || (extra.cobro || 0) > 0) {
      linea += ' [+extras' + (extra.nota ? ': ' + extra.nota : '') + ']';
    }
    ls.push(linea);
  });
  const v = E.viajes[dia] || 0;
  if (v) ls.push('\nEnvios (' + v + ' viaje' + (v > 1 ? 's' : '') + '): -Q' + (v * 25));
  const texto = ls.join('\n');
  const url   = 'https://wa.me/?text=' + encodeURIComponent(texto);
  window.open(url, '_blank');
  toast('Abriendo WhatsApp...');
};