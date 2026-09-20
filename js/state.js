export const E = {
  pedidos: {},
  lunes:   {},
  jueves:  {},
  cobros:  {},
  viajes:  { lunes: 0, jueves: 0 },
  costos:  { ingredientes: 0, gas: 0, desechables: 0, otros: 0 }
};

export let ORG_ID = null;
export const setOrgId  = (id) => { ORG_ID = id; };
export const getOrgId  = ()   => ORG_ID;

export function semKey() {
  const n = new Date(), s = new Date(n.getFullYear(), 0, 1);
  const diaSemana = s.getDay();
  const diasTranscurridos = Math.floor((n - s) / 86400000);
  return 'semana-' + Math.ceil((diasTranscurridos + diaSemana + 1) / 7) + '-' + n.getFullYear();
}

export function numSem() {
  const n = new Date(), s = new Date(n.getFullYear(), 0, 1);
  const diaSemana = s.getDay();
  const diasTranscurridos = Math.floor((n - s) / 86400000);
  return Math.ceil((diasTranscurridos + diaSemana + 1) / 7);
}

export function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

window.E = E;