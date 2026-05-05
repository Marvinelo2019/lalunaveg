import { db } from './firebase-config.js';
import { doc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { CL_FIJOS, CL_NUEVOS, setCLNuevos, TAG, TNOMBRE } from './clientes.js';
import { toast } from './state.js';
import { render } from './app.js';

export function renderClientes() {
  // CLIENTES FIJOS
  const cf = document.getElementById('lista-cl-fijos');
  cf.innerHTML = '';
  CL_FIJOS.forEach(cl => {
    const d = document.createElement('div');
    d.innerHTML =
      '<div class="cl-row">' +
        '<div class="av av-' + cl.tipo + '">' + cl.ini + '</div>' +
        '<div class="cl-info">' +
          '<div class="cl-name">' + cl.nombre + '</div>' +
          '<div class="cl-meta">' + TNOMBRE[cl.tipo] + ' - ' + cl.metodo + '</div>' +
        '</div>' +
        '<span class="ctag tag-' + cl.tipo + '" style="margin-right:8px;">' + TAG[cl.tipo] + '</span>' +
        '<button class="btn-del" style="color:#40916C" onclick="abrirModalEditar(\'' + cl.id + '\')" title="Editar">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>' +
            '<path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>' +
          '</svg>' +
        '</button>' +
      '</div>';
    cf.appendChild(d);
  });

  // CLIENTES NUEVOS
  const cn = document.getElementById('lista-cl-nuevos');
  cn.innerHTML = '';
  if (CL_NUEVOS.length === 0) {
    cn.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text3);font-size:13px;">Aun no hay clientes agregados.</div>';
  } else {
    CL_NUEVOS.forEach(cl => {
      const d = document.createElement('div');
      d.innerHTML =
        '<div class="cl-row">' +
          '<div class="av av-' + cl.tipo + '">' + cl.ini + '</div>' +
          '<div class="cl-info">' +
            '<div class="cl-name">' + cl.nombre + '</div>' +
            '<div class="cl-meta">' + TNOMBRE[cl.tipo] + ' - ' + cl.metodo + '</div>' +
          '</div>' +
          '<span class="ctag tag-' + cl.tipo + '" style="margin-right:8px;">' + TAG[cl.tipo] + '</span>' +
          '<button class="btn-del" onclick="eliminarCliente(\'' + cl.fid + '\')" title="Eliminar">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
              '<polyline points="3 6 5 6 21 6"/>' +
              '<path d="M19 6l-1 14H6L5 6"/>' +
              '<path d="M10 11v6M14 11v6"/>' +
              '<path d="M9 6V4h6v2"/>' +
            '</svg>' +
          '</button>' +
        '</div>';
      cn.appendChild(d);
    });
  }
}

// AGREGAR CLIENTE
window.abrirModal = () => {
  document.getElementById('modal-cliente').classList.add('open');
  document.getElementById('nuevo-nombre').focus();
};
window.cerrarModal = () => {
  document.getElementById('modal-cliente').classList.remove('open');
  document.getElementById('nuevo-nombre').value = '';
};

window.agregarCliente = async () => {
  const nombre = document.getElementById('nuevo-nombre').value.trim();
  const tipo   = document.getElementById('nuevo-tipo').value;
  const metodo = document.getElementById('nuevo-metodo').value;
  if (!nombre) { toast('Escribe el nombre del cliente'); return; }

  const ini  = nombre.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const id   = 'cl-' + Date.now();
  const base = tipo === '90' ? 2 : 1;

  try {
    await setDoc(doc(db, 'clientes-nuevos', id), { id, nombre, ini, tipo, metodo, base });
    CL_NUEVOS.push({ id, nombre, ini, tipo, metodo, base, fid: id, fijo: false });
    cerrarModal();
    render();
    renderClientes();
    toast(nombre + ' agregado');
  } catch(e) {
    toast('Error al agregar cliente');
  }
};

window.eliminarCliente = async fid => {
  if (!confirm('Eliminar este cliente?')) return;
  try {
    await deleteDoc(doc(db, 'clientes-nuevos', fid));
    setCLNuevos(CL_NUEVOS.filter(c => c.fid !== fid));
    render();
    renderClientes();
    toast('Cliente eliminado');
  } catch(e) {
    toast('Error al eliminar');
  }
};

// EDITAR CLIENTE FIJO
window.abrirModalEditar = id => {
  const cl = CL_FIJOS.find(c => c.id === id);
  if (!cl) return;
  document.getElementById('edit-nombre-display').textContent = cl.nombre;
  document.getElementById('edit-tipo').value   = cl.tipo;
  document.getElementById('edit-metodo').value = cl.metodo;
  document.getElementById('modal-editar').dataset.editId = id;
  document.getElementById('modal-editar').classList.add('open');
};
window.cerrarModalEditar = () => {
  document.getElementById('modal-editar').classList.remove('open');
};

window.guardarEdicion = async () => {
  const id  = document.getElementById('modal-editar').dataset.editId;
  const cl  = CL_FIJOS.find(c => c.id === id);
  if (!cl) return;

  const nuevoTipo   = document.getElementById('edit-tipo').value;
  const nuevoMetodo = document.getElementById('edit-metodo').value;
  cl.tipo   = nuevoTipo;
  cl.metodo = nuevoMetodo;

  try {
    await setDoc(doc(db, 'clientes-edits', id), {
      id, tipo: nuevoTipo, metodo: nuevoMetodo,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    toast('Cliente actualizado');
  } catch(e) {
    toast('Cambio guardado localmente');
  }
  cerrarModalEditar();
  render();
  renderClientes();
};