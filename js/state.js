// Estado global compartido - sin dependencias
export const E = {
  pedidos: {},
  lunes:   {},
  jueves:  {},
  cobros:  {},
  viajes:  { lunes: 0, jueves: 0 },
  costos:  { ingredientes: 0, gas: 0, desechables: 0, otros: 0 }
};

function getNumSemana(fecha) {
  const inicioAnio = new Date(fecha.getFullYear(), 0, 1);
  const diaSemana = inicioAnio.getDay();
  const diff = fecha - inicioAnio;
  const diasTranscurridos = Math.floor(diff / 86400000);
  return Math.ceil((diasTranscurridos + diaSemana + 1) / 7);
}

export function semKey() {
  const n = new Date();
  const w = getNumSemana(n);
  return 'semana-' + w + '-' + n.getFullYear();
}

export function numSem() {
  const n = new Date();
  return getNumSemana(n);
}

export function toast(m) {
  const t = document.getElementById('toast');
  t.textContent = m;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}