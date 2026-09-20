import { db } from './firebase-config.js';
import { getDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getOrgId } from './state.js';
import { todos, SUE } from './clientes.js';
import { precioConExtras, getDias } from './pedidos.js';

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// Obtener semanas del mes actual
export function semanasDelMes(anio, mes) {
  const semanas = [];
  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0);
  const start = new Date(anio, 0, 1);

  for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 7)) {
    const diff = (d - start) / 86400000;
    const numSem = Math.ceil((diff + start.getDay() + 1) / 7);
    if (!semanas.includes(numSem)) semanas.push(numSem);
  }
  return semanas;
}

// Procesar datos de una semana
function procesarSemana(data, numSem) {
  let fac = 0, alm = 0, cob = 0, pen = 0, costos = 0, env = 0;

  if (data.pedidos) {
    todos().forEach(cl => {
      const p = data.pedidos[cl.id];
      if (!p || !p.confirmado) return;
      const pt   = precioConExtras(cl, p);
      const dias = getDias(p);
      fac += pt;
      alm += DIAS.reduce((sum, d) => sum + (dias[d] || 0), 0);
      const co = data.cobros && data.cobros[cl.id];
      if (co && co.pagado) cob += pt; else pen += pt;
    });
  }

  if (data.costos) {
    costos = (parseFloat(data.costos.ingredientes) || 0) +
             (parseFloat(data.costos.gas)           || 0) +
             (parseFloat(data.costos.desechables)   || 0) +
             (parseFloat(data.costos.otros)         || 0);
  }

  if (data.viajes) {
    env = ((data.viajes.lunes || 0) + (data.viajes.jueves || 0)) * 25;
  }

  const uti = Math.round((fac - env - costos) * 100) / 100;

  return {
    semana: numSem,
    facturado: fac,
    almuerzos: alm,
    cobrado: cob,
    pendiente: pen,
    costos,
    envios: env,
    utilidad: uti,
    diezmo: Math.round(uti * 0.10),
    ofrenda: Math.round(uti * 0.05)
  };
}

// Cargar reporte mensual completo
export async function cargarReporteMensual(anio, mes) {
  const semanas = semanasDelMes(anio, mes);
  const resultados = [];

  for (const numSem of semanas) {
    const key  = 'semana-' + numSem + '-' + anio;
    try {
      const snap = await getDoc(doc(db, 'organizaciones', getOrgId(), 'semanas', key));
      if (snap.exists()) {
        const datos = procesarSemana(snap.data(), numSem);
        resultados.push(datos);
      } else {
        resultados.push({
          semana: numSem, facturado: 0, almuerzos: 0,
          cobrado: 0, pendiente: 0, costos: 0,
          envios: 0, utilidad: 0, diezmo: 0, ofrenda: 0
        });
      }
    } catch(e) {
      console.log('Error cargando semana', numSem);
    }
  }

  // Consolidar totales
  const total = resultados.reduce((acc, s) => ({
    facturado: acc.facturado + s.facturado,
    almuerzos: acc.almuerzos + s.almuerzos,
    cobrado:   acc.cobrado   + s.cobrado,
    pendiente: acc.pendiente + s.pendiente,
    costos:    acc.costos    + s.costos,
    envios:    acc.envios    + s.envios,
    utilidad:  Math.round((acc.utilidad + s.utilidad) * 100) / 100,
    diezmo:    acc.diezmo    + s.diezmo,
    ofrenda:   acc.ofrenda   + s.ofrenda,
  }), { facturado:0, almuerzos:0, cobrado:0, pendiente:0, costos:0, envios:0, utilidad:0, diezmo:0, ofrenda:0 });

  return { semanas: resultados, total, mes: MESES[mes], anio };
}

export { MESES };