import { PLANTILLAS, menuSemana, cargarMenu, guardarMenu } from './menu.js';
import { numSem, toast } from './state.js';

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const DIAS_LABEL = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes'
};

export function renderMenu() {
  const cont = document.getElementById('lista-menu');
  if (!cont) return;

  cont.innerHTML = DIAS.map(dia => `
    <div class="menu-item-row">
      <div class="menu-dia-lbl">${DIAS_LABEL[dia]}</div>
      <div class="menu-dia-input-wrap">
        <textarea
          class="menu-dia-input"
          id="menu-${dia}"
          rows="2"
          placeholder="Platillo del ${DIAS_LABEL[dia]}..."
          onchange="setMenuDia('${dia}', this.value)"
        >${menuSemana[dia] || ''}</textarea>
      </div>
    </div>
  `).join('');
}

// Cargar plantilla
window.cargarPlantilla = (num) => {
  const plantilla = PLANTILLAS[num];
  if (!plantilla) return;
  DIAS.forEach(dia => {
    menuSemana[dia] = plantilla[dia] || '';
    const input = document.getElementById('menu-' + dia);
    if (input) input.value = menuSemana[dia];
  });
  toast('Semana ' + num + ' cargada');
};

window.setMenuDia = (dia, valor) => {
  menuSemana[dia] = valor;
};

window.guardarMenuSemana = async () => {
  const ok = await guardarMenu();
  if (ok) toast('Menu guardado en la nube');
  else toast('Error al guardar el menu');
};