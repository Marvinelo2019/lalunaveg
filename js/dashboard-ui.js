import { cargarDashboard } from './dashboard.js';
import { toast } from './state.js';

const CATEGORIA_NOMBRE = {
  '90': 'Familiar', '45': 'Normal',
  '35': 'Amigos', '25e': 'Enfermedad', '25f': 'Familia'
};
const CATEGORIA_COLOR = {
  '90': 'var(--amber-dark)', '45': 'var(--verde)',
  '35': 'var(--teal)', '25e': 'var(--rojo)', '25f': 'var(--morado)'
};
const CATEGORIA_PALE = {
  '90': 'var(--amber-pale)', '45': 'var(--verde-pale)',
  '35': 'var(--teal-pale)', '25e': 'var(--rojo-pale)', '25f': 'var(--morado-pale)'
};

export async function renderDashboard() {
  const cont = document.getElementById('dashboard-cont');
  if (!cont) return;

  cont.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text3);">Cargando dashboard...</div>';

  const d = await cargarDashboard();
  renderDatos(d);
}

function renderDatos(d) {
  const cont = document.getElementById('dashboard-cont');
  if (!cont) return;

  // Saludo segun hora
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  // Grafica de barras por dia
  const maxDia = Math.max(...Object.values(d.porDia), 1);
  const barrasDia = ['lunes','martes','miercoles','jueves','viernes'].map(dia => {
    const val = d.porDia[dia] || 0;
    const pct = Math.round((val / maxDia) * 100);
    const esEntregaL = ['lunes','martes','miercoles'].includes(dia);
    const color = val > 0 ? (esEntregaL ? 'var(--verde)' : 'var(--teal)') : 'var(--border)';
    const label = { lunes:'Lun', martes:'Mar', miercoles:'Mié', jueves:'Jue', viernes:'Vie' }[dia];
    return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;">' +
      '<div style="font-size:12px;font-weight:700;color:' + (val > 0 ? color : 'var(--text3)') + ';">' + (val > 0 ? val : '') + '</div>' +
      '<div style="width:100%;height:100px;display:flex;align-items:flex-end;">' +
        '<div style="width:100%;height:' + pct + '%;background:' + color + ';border-radius:6px 6px 0 0;min-height:' + (val > 0 ? '4px' : '0') + ';transition:height .4s;"></div>' +
      '</div>' +
      '<div style="font-size:11px;font-weight:600;color:var(--text2);">' + label + '</div>' +
    '</div>';
  }).join('');

  // Grafica dona por categoria
  const totalCats = Object.values(d.porCategoria).reduce((s,v)=>s+v,0) || 1;
  let offsetDona = 0;
  const segmentosDona = Object.entries(d.porCategoria)
    .filter(([,v]) => v > 0)
    .map(([cat, val]) => {
      const pct = (val / totalCats) * 100;
      const seg = '<circle cx="20" cy="20" r="15.915" fill="transparent" stroke="' + CATEGORIA_COLOR[cat] + '" stroke-width="8" stroke-dasharray="' + pct + ' ' + (100 - pct) + '" stroke-dashoffset="' + (100 - offsetDona) + '"/>';
      offsetDona += pct;
      return seg;
    }).join('');

  const leyendaDona = Object.entries(d.porCategoria)
    .filter(([,v]) => v > 0)
    .map(([cat, val]) =>
      '<div style="display:flex;align-items:center;gap:6px;font-size:12px;">' +
        '<div style="width:10px;height:10px;border-radius:50%;background:' + CATEGORIA_COLOR[cat] + ';flex-shrink:0;"></div>' +
        '<span style="color:var(--text2);">' + CATEGORIA_NOMBRE[cat] + '</span>' +
        '<span style="font-weight:600;margin-left:auto;">' + Math.round((val/totalCats)*100) + '%</span>' +
      '</div>'
    ).join('');

  // Lista de clientes confirmados
  const listaClientes = d.clientesConf.slice(0, 6).map(cl =>
    '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">' +
      '<div style="width:32px;height:32px;border-radius:50%;background:' + CATEGORIA_PALE[cl.tipo] + ';color:' + CATEGORIA_COLOR[cl.tipo] + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">' + cl.ini + '</div>' +
      '<div style="flex:1;font-size:13px;font-weight:500;color:var(--text);">' + cl.nombre + '</div>' +
      '<span style="font-size:10px;font-weight:600;background:' + CATEGORIA_PALE[cl.tipo] + ';color:' + CATEGORIA_COLOR[cl.tipo] + ';padding:2px 8px;border-radius:20px;">' + CATEGORIA_NOMBRE[cl.tipo] + '</span>' +
      '<div style="font-size:13px;font-weight:600;color:var(--verde);">Q' + cl.precio + '</div>' +
    '</div>'
  ).join('');

  // Progreso entregas
  const progL = d.confirmados > 0 ? Math.round((d.entregadosL / d.confirmados) * 100) : 0;
  const progJ = d.confirmados > 0 ? Math.round((d.entregadosJ / d.confirmados) * 100) : 0;

  cont.innerHTML =

    // SALUDO
    '<div style="margin-bottom:20px;">' +
      '<div style="font-size:13px;color:var(--text3);">' + saludo + ' · ' + d.fecha + '</div>' +
      '<div style="font-size:22px;font-weight:600;color:var(--text);margin-top:4px;">Semana ' + d.semana + ' · Resumen</div>' +
    '</div>' +

    // TARJETAS KPI
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">' +
      kpiCard('Ingresos semana', 'Q' + d.facturado, 'var(--verde)',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>') +
      kpiCard('Total almuerzos', d.almuerzos + ' alm.', 'var(--teal)',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2"/><path d="M18 15c0 2.2-1.8 4-4 4s-4-1.8-4-4"/></svg>') +
      kpiCard('Clientes activos', d.confirmados + ' clientes', 'var(--morado)',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>') +
      kpiCard('Cobrado', 'Q' + d.cobrado, 'var(--amber-dark)',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>') +
    '</div>' +

    // GRAFICAS
    '<div style="display:grid;grid-template-columns:1fr 320px;gap:16px;margin-bottom:20px;">' +

      // Barras
      '<div style="background:var(--card);border-radius:var(--r);border:1px solid var(--border);padding:20px;">' +
        '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">Almuerzos por dia</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-bottom:16px;"><span style="display:inline-block;width:10px;height:10px;background:var(--verde);border-radius:2px;margin-right:4px;"></span>Entrega lunes <span style="display:inline-block;width:10px;height:10px;background:var(--teal);border-radius:2px;margin-left:10px;margin-right:4px;"></span>Entrega jueves</div>' +
        '<div style="display:flex;gap:8px;align-items:flex-end;height:130px;">' + barrasDia + '</div>' +
      '</div>' +

      // Dona + clientes
      '<div style="background:var(--card);border-radius:var(--r);border:1px solid var(--border);padding:20px;">' +
        '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;">Por categoria</div>' +
        '<div style="display:flex;align-items:center;gap:16px;">' +
          '<svg viewBox="0 0 40 40" style="width:90px;height:90px;flex-shrink:0;transform:rotate(-90deg);">' +
            '<circle cx="20" cy="20" r="15.915" fill="transparent" stroke="var(--border)" stroke-width="8"/>' +
            segmentosDona +
          '</svg>' +
          '<div style="flex:1;display:flex;flex-direction:column;gap:6px;">' + leyendaDona + '</div>' +
        '</div>' +
      '</div>' +

    '</div>' +

    // CLIENTES + ENTREGAS
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +

      // Lista clientes
      '<div style="background:var(--card);border-radius:var(--r);border:1px solid var(--border);padding:20px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">' +
          '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;">Clientes confirmados</div>' +
          '<button onclick="irA(\'pedidos\',this)" style="font-size:11px;color:var(--verde);background:none;border:none;cursor:pointer;font-weight:600;">Ver todos</button>' +
        '</div>' +
        (listaClientes || '<div style="color:var(--text3);font-size:13px;text-align:center;padding:20px;">Sin pedidos esta semana</div>') +
      '</div>' +

      // Estado entregas
      '<div style="background:var(--card);border-radius:var(--r);border:1px solid var(--border);padding:20px;">' +
        '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;">Estado de entregas</div>' +

        entregaCard('Entrega lunes', 'Lun + Mar + Mié', d.totalEntregaLunes, d.entregadosL, d.confirmados, progL, 'var(--verde)') +
        '<div style="height:12px;"></div>' +
        entregaCard('Entrega jueves', 'Jue + Vie', d.totalEntregaJueves, d.entregadosJ, d.confirmados, progJ, 'var(--teal)') +

        '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">' +
          '<div style="display:flex;justify-content:space-between;font-size:13px;">' +
            '<span style="color:var(--text2);">Pendiente de cobro</span>' +
            '<span style="font-weight:600;color:var(--amber-dark);">Q' + d.pendiente + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

    '</div>';
}

function kpiCard(lbl, val, color, iconSvg) {
  return '<div style="background:var(--card);border-radius:var(--r);border:1px solid var(--border);padding:16px 20px;display:flex;align-items:center;gap:14px;">' +
    '<div style="width:42px;height:42px;border-radius:12px;background:' + color + '20;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
      '<svg style="width:20px;height:20px;color:' + color + ';stroke:' + color + ';" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round">' + iconSvg.replace(/<svg[^>]*>|<\/svg>/g,'') + '</svg>' +
    '</div>' +
    '<div>' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:4px;">' + lbl + '</div>' +
      '<div style="font-size:20px;font-weight:700;color:' + color + ';line-height:1;">' + val + '</div>' +
    '</div>' +
  '</div>';
}

function entregaCard(titulo, dias, totalAlm, entregados, confirmados, pct, color) {
  return '<div style="background:var(--bg);border-radius:10px;padding:14px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">' +
      '<div>' +
        '<div style="font-size:13px;font-weight:600;color:var(--text);">' + titulo + '</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-top:2px;">' + dias + ' · ' + totalAlm + ' almuerzos</div>' +
      '</div>' +
      '<div style="font-size:20px;font-weight:700;color:' + color + ';">' + pct + '%</div>' +
    '</div>' +
    '<div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">' +
      '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px;transition:width .4s;"></div>' +
    '</div>' +
    '<div style="font-size:11px;color:var(--text3);margin-top:6px;">' + entregados + ' de ' + confirmados + ' entregados</div>' +
  '</div>';
}

window.actualizarDashboard = renderDashboard;