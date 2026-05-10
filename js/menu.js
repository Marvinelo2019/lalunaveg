import { db } from './firebase-config.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { numSem } from './state.js';

// PLANTILLAS DE LOS 5 MENUS
export const PLANTILLAS = {
  1: {
    lunes:     'Ciabatta con champiñones salteados, espinaca y aguacate + crema de arvejas',
    martes:    'Taco Bowl de lechuga romana, frijoles, elote, pico de gallo, zanahoria rallada, chips de tortilla y salsa taquera verde',
    miercoles: 'Estofado de lentejas con champiñones y vegetales + arroz integral',
    jueves:    'Hamburguesa con tortita de lentejas, cebolla caramelizada, tomate, BBQ y aguacate + papitas baby con brócoli y ajo',
    viernes:   'Pepian con vegetales y garbanzo con arroz integral'
  },
  2: {
    lunes:     'Wrap César (lechuga, aguacate, garbanzos horneados, pepino, cebolla y aderezo) + plátanos horneados',
    martes:    'Tacos al pastor, pico de gallo y salsa de aguacate + sopa de lentejas y berros',
    miercoles: 'Jocón de vegetales con garbanzos + arroz integral',
    jueves:    'Bowl de falafel, arroz integral, pepino, tomate, aguacate, aderezo griego + sopa de puerro',
    viernes:   'Lo mein de vegetales, sopa de lentejas y acelga'
  },
  3: {
    lunes:     'Ciabatta al pesto con espinaca, queso y tomate + bastones con hummus',
    martes:    'Bowl Italiano (fusilli, lentejas ahumadas, lechuga, tomate, brócoli, aceitunas, pepino y aderezo balsámico) + crema de vegetales',
    miercoles: 'Curry de lentejas con vegetales + arroz blanco',
    jueves:    'Hamburguesa oriental (falafel, pepino, zanahoria, lechuga, cebolla frita, salsa teriyaki) + ensalada repollo morado',
    viernes:   'Estofado de frijoles rojos con chicharrón y arroz primavera'
  },
  4: {
    lunes:     'Ciabatta con berenjena a la mostaza, espinaca y tomate + sopa de lentejas con acelga',
    martes:    'Tacos de carnita de soya con chimichurri, pico de gallo y salsa de aguacate + crema de frijoles',
    miercoles: 'Bowl de tortitas de lentejas, pasta con salsa italiana, brócoli al vapor + ensalada de arúgula, zanahoria, cebolla morada y elote',
    jueves:    'Burrito Tex Mex (frijoles, arroz sazonado, lechuga, guacamole) + plátanos en mole',
    viernes:   'Chilibeans con nachos y queso cheddar vegano'
  },
  5: {
    lunes:     'Ciabatta con vegetales al limón, aguacate y espinaca + sopa de lentejas con berro',
    martes:    'Pasta cremosa con champiñones y brócoli + garbanzos ahumados con ejotes y zanahoria',
    miercoles: 'Crepa con pesto, espinaca y tomate + ensalada con pepitoria',
    jueves:    'Estofado de garbanzos con champiñones y vegetales + arroz',
    viernes:   'Pasta con carnita de lentejas en salsa pomodoro + vegetales salteados'
  }
};

// Estado del menu de la semana actual
export const menuSemana = {
  lunes: '', martes: '', miercoles: '', jueves: '', viernes: ''
};

export function setMenuSemana(m) {
  Object.assign(menuSemana, m);
}

// Cargar menu desde Firebase
export async function cargarMenu() {
  try {
    const sem  = numSem();
    const ano  = new Date().getFullYear();
    const snap = await getDoc(doc(db, 'menus', 'menu-' + sem + '-' + ano));
    if (snap.exists()) {
      // Modificar el objeto existente, no reemplazarlo
      menuSemana.lunes     = data.lunes     || '';
      menuSemana.martes    = data.martes    || '';
      menuSemana.miercoles = data.miercoles || '';
      menuSemana.jueves    = data.jueves    || '';
      menuSemana.viernes   = data.viernes   || '';
      return true;
    }
  } catch(e) {
    console.log('Sin menu guardado');
  }
  return false;
}

// Guardar menu en Firebase
export async function guardarMenu() {
  const sem = numSem();
  const ano = new Date().getFullYear();
  try {
    await setDoc(doc(db, 'menus', 'menu-' + sem + '-' + ano), {
      ...menuSemana,
      semana: sem,
      ano,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch(e) {
    return false;
  }
}

export function getMenuDia(dia) {
  return menuSemana[dia] || '';
}