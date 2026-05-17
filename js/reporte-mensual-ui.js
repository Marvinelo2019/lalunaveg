import { cargarReporteMensual, MESES } from './reporte-mensual.js';
import { toast } from './state.js';

let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();

export function renderReporteMensual() {
  const cont = document.getElementById('reporte-mensual-cont');
  if (!cont) return;

  cont.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3);">Cargando reporte...</div>';

  cargarReporteMensual(anioActual, mesActual).then(data => {
    renderDatos(data);
  }).catch(e => {
    cont.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3);">Error al cargar el reporte.</div>';
  });
}

function renderDatos(data) {
  const cont = document.getElementById('reporte-mensual-cont');
  if (!cont) return;

  const { semanas, total, mes, anio } = data;

  // Actualizar titulo
  document.getElementById('rm-titulo').textContent = mes + ' ' + anio;

  // Grafica de barras SVG
  const maxFac = Math.max(...semanas.map(s => s.facturado), 1);
  const barras = semanas.map((s, i) => {
    const pct    = s.facturado > 0 ? Math.round((s.facturado / maxFac) * 100) : 0;
    const color  = s.facturado > 0 ? 'var(--verde)' : 'var(--border)';
    return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;">' +
      '<div style="font-size:12px;font-weight:600;color:var(--verde);">' + (s.facturado > 0 ? 'Q'+s.facturado : '') + '</div>' +
      '<div style="width:100%;height:120px;background:var(--bg);border-radius:8px;display:flex;align-items:flex-end;overflow:hidden;">' +
        '<div style="width:100%;height:' + pct + '%;background:' + color + ';border-radius:6px;transition:height .3s;"></div>' +
      '</div>' +
      '<div style="font-size:11px;font-weight:600;color:var(--text2);">Sem ' + s.semana + '</div>' +
      '<div style="font-size:10px;color:var(--text3);">' + s.almuerzos + ' alm.</div>' +
    '</div>';
  }).join('');

  const margen     = total.facturado > 0 ? Math.round((total.utilidad / total.facturado) * 100) : 0;
  const ticketProm = semanas.filter(s => s.facturado > 0).length > 0
    ? Math.round(total.facturado / semanas.filter(s => s.facturado > 0).length)
    : 0;
  const tasaCobro  = total.facturado > 0 ? Math.round((total.cobrado / total.facturado) * 100) : 0;
  const costoAlm   = total.almuerzos > 0 ? Math.round((total.costos / total.almuerzos) * 100) / 100 : 0;
  const puntoEq = Math.round((total.costos + total.envios) * 100) / 100;
  const superoPE   = total.facturado >= puntoEq;
  const kpiColor   = (val, bueno) => val >= bueno ? 'var(--verde)' : 'var(--amber-dark)';
  const kpisHtml   =
    '<div style="background:var(--card);border-radius:var(--r);border:1px solid var(--border);padding:20px;margin-bottom:16px;">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;">Indicadores del mes</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">' +
        kpi('Margen de utilidad', margen + '%', kpiColor(margen, 30), margen >= 30 ? 'Saludable' : 'Mejorable') +
        kpi('Ticket promedio', 'Q' + ticketProm, 'var(--text)', 'por semana activa') +
        kpi('Tasa de cobro', tasaCobro + '%', kpiColor(tasaCobro, 90), tasaCobro >= 90 ? 'Excelente' : 'Hay pendientes') +
        kpi('Costo por almuerzo', 'Q' + costoAlm, 'var(--text)', 'costo unitario produccion') +
        kpi('Punto de equilibrio', 'Q' + puntoEq, superoPE ? 'var(--verde)' : 'var(--amber-dark)', superoPE ? '✓ Superado este mes' : '✗ No alcanzado') +
        kpi('Semanas activas', semanas.filter(s => s.facturado > 0).length + ' de ' + semanas.length, 'var(--text)', 'semanas con ventas') +
      '</div>' +
    '</div>';

  cont.innerHTML =

    // GRAFICA
    '<div style="background:var(--card);border-radius:var(--r);border:1px solid var(--border);padding:20px;margin-bottom:16px;">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;">Facturado por semana</div>' +
      '<div style="display:flex;gap:12px;align-items:flex-end;">' + barras + '</div>' +
    '</div>' +

    // TOTALES DEL MES
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
      tarjeta('Total facturado', 'Q' + total.facturado, 'var(--verde)') +
      tarjeta('Total almuerzos', total.almuerzos + ' alm.', 'var(--text)') +
      tarjeta('Cobrado', 'Q' + total.cobrado, 'var(--verde)') +
      tarjeta('Pendiente', 'Q' + total.pendiente, 'var(--amber-dark)') +
      tarjeta('Costos produccion', 'Q' + total.costos, 'var(--amber-dark)') +
      tarjeta('Envios', 'Q' + total.envios, 'var(--amber-dark)') +
    '</div>' +

    // UTILIDAD NETA
    '<div style="background:var(--verde-pale);border:1.5px solid var(--verde);border-radius:var(--r);padding:20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
      '<div><div style="font-size:13px;font-weight:600;color:var(--verde);">Utilidad neta del mes</div>' +
      '<div style="font-size:11px;color:var(--verde-light,#40916C);margin-top:2px;">Total facturado - envios - costos</div></div>' +
      '<div style="font-family:\'DM Serif Display\';font-size:36px;color:var(--verde);">Q' + total.utilidad + '</div>' +
    '</div>' +

    // DIEZMO Y OFRENDA
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">' +
      '<div style="background:var(--morado-pale);border:1px solid #D1C4E9;border-radius:var(--r);padding:18px 20px;display:flex;justify-content:space-between;align-items:center;">' +
        '<div><div style="font-size:13px;font-weight:600;color:var(--morado);">Diezmo del mes</div>' +
        '<div style="font-size:11px;color:#9575CD;margin-top:2px;">10% utilidad neta</div></div>' +
        '<div style="font-family:\'DM Serif Display\';font-size:30px;color:var(--morado);">Q' + total.diezmo + '</div>' +
      '</div>' +
      '<div style="background:var(--verde-pale);border:1px solid #A5D6A7;border-radius:var(--r);padding:18px 20px;display:flex;justify-content:space-between;align-items:center;">' +
        '<div><div style="font-size:13px;font-weight:600;color:var(--verde);">Ofrenda del mes</div>' +
        '<div style="font-size:11px;color:var(--verde-light,#40916C);margin-top:2px;">5% utilidad neta</div></div>' +
        '<div style="font-family:\'DM Serif Display\';font-size:30px;color:var(--verde);">Q' + total.ofrenda + '</div>' +
      '</div>' +
    '</div>' +

    // KPIs
    kpisHtml +

    // DESGLOSE POR SEMANA
    '<div style="background:var(--card);border-radius:var(--r);border:1px solid var(--border);overflow:hidden;margin-bottom:16px;">' +
      '<div style="padding:14px 20px;border-bottom:1px solid var(--border);">' +
        '<span style="font-size:12px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;">Desglose por semana</span>' +
      '</div>' +
      '<div style="padding:14px 20px;display:grid;grid-template-columns:80px 1fr 1fr 1fr 1fr;gap:8px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--border);">' +
        '<span>Semana</span><span>Facturado</span><span>Cobrado</span><span>Costos</span><span>Utilidad</span>' +
      '</div>' +
      semanas.map(s =>
        '<div style="padding:12px 20px;display:grid;grid-template-columns:80px 1fr 1fr 1fr 1fr;gap:8px;font-size:13px;border-bottom:1px solid var(--border);">' +
          '<span style="font-weight:600;color:var(--text2);">Sem ' + s.semana + '</span>' +
          '<span style="font-weight:500;">Q' + s.facturado + '</span>' +
          '<span style="color:var(--verde);font-weight:500;">Q' + s.cobrado + '</span>' +
          '<span style="color:var(--amber-dark);font-weight:500;">Q' + s.costos + '</span>' +
          '<span style="font-weight:600;">Q' + s.utilidad + '</span>' +
        '</div>'
      ).join('') +
    '</div>' +

    // TOP CLIENTES
    '<div style="background:var(--card);border-radius:var(--r);border:1px solid var(--border);overflow:hidden;margin-bottom:16px;">' +
      '<div style="padding:14px 20px;border-bottom:1px solid var(--border);">' +
        '<span style="font-size:12px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;">Top clientes del mes</span>' +
      '</div>' +
      '<div id="rm-top-clientes" style="padding:14px 20px;color:var(--text3);font-size:13px;">Calculando...</div>' +
    '</div>';

  // Calcular top clientes
  calcularTopClientes(semanas);
}
function kpi(lbl, val, color, detalle) {
  return '<div style="background:var(--bg);border-radius:var(--r-sm);padding:14px;text-align:center;">' +
    '<div style="font-size:11px;color:var(--text3);margin-bottom:6px;">' + lbl + '</div>' +
    '<div style="font-size:22px;font-weight:700;color:' + color + ';line-height:1;">' + val + '</div>' +
    '<div style="font-size:10px;color:var(--text3);margin-top:4px;">' + detalle + '</div>' +
  '</div>';
}
function tarjeta(lbl, val, color) {
  return '<div style="background:var(--card);border-radius:var(--r);border:1px solid var(--border);padding:16px 20px;">' +
    '<div style="font-size:12px;color:var(--text3);margin-bottom:6px;">' + lbl + '</div>' +
    '<div style="font-size:22px;font-weight:600;color:' + color + ';">' + val + '</div>' +
  '</div>';
}

async function calcularTopClientes(semanas) {
  const totalesCl = {};

  semanas.forEach(s => {
    // Los datos ya están procesados, necesitamos recalcular por cliente
  });

  // Cargar semanas de nuevo para calcular por cliente
  const { cargarReporteMensual } = await import('./reporte-mensual.js');
  const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  const { db } = await import('./firebase-config.js');
  const { precioConExtras } = await import('./pedidos.js');
  const { todos } = await import('./clientes.js');

  const anio = anioActual;

  for (const s of semanas) {
    if (s.facturado === 0) continue;
    const key  = 'semana-' + s.semana + '-' + anio;
    const snap = await getDoc(doc(db, 'semanas', key));
    if (!snap.exists()) continue;
    const data = snap.data();
    if (!data.pedidos) continue;

    todos().forEach(cl => {
      const p = data.pedidos[cl.id];
      if (!p || !p.confirmado) return;
      const pt = precioConExtras(cl, p);
      if (!totalesCl[cl.id]) totalesCl[cl.id] = { nombre: cl.nombre, total: 0, semanas: 0 };
      totalesCl[cl.id].total   += pt;
      totalesCl[cl.id].semanas += 1;
    });
  }

  const ranking = Object.values(totalesCl)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const cont = document.getElementById('rm-top-clientes');
  if (!cont) return;

  if (ranking.length === 0) {
    cont.textContent = 'Sin datos suficientes.';
    return;
  }

  cont.innerHTML = ranking.map((cl, i) =>
    '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border);">' +
      '<div style="width:24px;height:24px;border-radius:50%;background:var(--verde-pale);color:var(--verde);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">' + (i+1) + '</div>' +
      '<div style="flex:1;font-size:13px;font-weight:500;">' + cl.nombre + '</div>' +
      '<div style="font-size:11px;color:var(--text3);">' + cl.semanas + ' sem.</div>' +
      '<div style="font-size:14px;font-weight:600;color:var(--verde);">Q' + cl.total + '</div>' +
    '</div>'
  ).join('');
}

// Navegacion de meses
window.mesAnterior = () => {
  mesActual--;
  if (mesActual < 0) { mesActual = 11; anioActual--; }
  renderReporteMensual();
};
window.mesSiguiente = () => {
  mesActual++;
  if (mesActual > 11) { mesActual = 0; anioActual++; }
  renderReporteMensual();
};