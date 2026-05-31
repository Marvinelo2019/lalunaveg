import { db } from './firebase-config.js';
import { getDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { todos, PLAN, SUE } from './clientes.js';
import { precioConExtras, getDias } from './pedidos.js';
import { E, semKey, numSem } from './state.js';

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const DIAS_LABEL = { lunes:'Lun', martes:'Mar', miercoles:'Mié', jueves:'Jue', viernes:'Vie' };

export async function cargarDashboard() {
  // Datos de la semana actual desde el estado en memoria
  let facturado    = 0;
  let almuerzos    = 0;
  let confirmados  = 0;
  let cobrado      = 0;
  let entregadosL  = 0;
  let entregadosJ  = 0;
  const porDia     = { lunes:0, martes:0, miercoles:0, jueves:0, viernes:0 };
  const porCategoria = { '45':0, '35':0, '25e':0, '25f':0, '90':0 };
  const clientesConf = [];

  todos().forEach(cl => {
    const p = E.pedidos[cl.id];
    if (!p || !p.confirmado) return;

    const pt   = precioConExtras(cl, p);
    const dias = getDias(p);

    facturado += pt;
    confirmados++;
    clientesConf.push({ ...cl, precio: pt, planTipo: p.planTipo });

    // Almuerzos por dia
    DIAS.forEach(d => {
      porDia[d] += (dias[d] || 0);
    });

    almuerzos += DIAS.reduce((sum, d) => sum + (dias[d] || 0), 0);

    // Por categoria
    if (porCategoria[cl.tipo] !== undefined) porCategoria[cl.tipo]++;

    // Cobrado
    const co = E.cobros[cl.id];
    if (co && co.pagado) cobrado += pt;

    // Entregados
    if (E.lunes[cl.id]  && E.lunes[cl.id].entregado)  entregadosL++;
    if (E.jueves[cl.id] && E.jueves[cl.id].entregado) entregadosJ++;
  });

  // Total entrega lunes y jueves
  const totalEntregaLunes  = porDia.lunes + porDia.martes + porDia.miercoles;
  const totalEntregaJueves = porDia.jueves + porDia.viernes;

  return {
    facturado,
    almuerzos,
    confirmados,
    cobrado,
    pendiente: facturado - cobrado,
    porDia,
    porCategoria,
    clientesConf,
    entregadosL,
    entregadosJ,
    totalEntregaLunes,
    totalEntregaJueves,
    semana: numSem(),
    fecha: new Date().toLocaleDateString('es-GT', { weekday:'long', day:'numeric', month:'long' })
  };
}