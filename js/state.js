// Estado global compartido - sin dependencias
export const E = {
  pedidos: {},
  lunes:   {},
  jueves:  {},
  cobros:  {},
  viajes:  { lunes: 0, jueves: 0 },
  costos:  { ingredientes: 0, gas: 0, desechables: 0, otros: 0 }
};

export function semKey() {
  const n = new Date(), s = new Date(n.getFullYear(), 0, 1);
  const w = Math.ceil(((n - s) / 86400000 + s.getDay() + 1) / 7);
  return 'semana-' + w + '-' + n.getFullYear();
}
//window.E = E;
export function numSem() {
  const n = new Date(), s = new Date(n.getFullYear(), 0, 1);
  return Math.ceil(((n - s) / 86400000 + s.getDay() + 1) / 7);
}

export function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}