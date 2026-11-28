// Comportamiento de la interfaz del inventario de equipos tecnológicos.
import {
  UMBRAL_INICIAL_INTERFAZ,
  construirRutaConsulta,
  describirError,
  prepararCuerpoProducto
} from './inventario-ui.js';

const formulario = document.getElementById('form-crear');
const campoNombre = document.getElementById('nombre');
const campoStock = document.getElementById('stock');
const casillaStockBajo = document.getElementById('solo-stock-bajo');
const campoUmbral = document.getElementById('umbral');
const botonConsultar = document.getElementById('consultar');
const mensaje = document.getElementById('mensaje');
const cuerpoTabla = document.getElementById('cuerpo-tabla');
const resumen = document.getElementById('resumen');

campoUmbral.value = UMBRAL_INICIAL_INTERFAZ;

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
}

function pintarTabla(productos) {
  cuerpoTabla.replaceChildren();
  for (const producto of productos) {
    const fila = document.createElement('tr');
    for (const valor of [producto.id, producto.nombre, producto.stock]) {
      const celda = document.createElement('td');
      celda.textContent = String(valor); // textContent: evita inyección de HTML
      fila.append(celda);
    }
    cuerpoTabla.append(fila);
  }
  const filtro = casillaStockBajo.checked ? ` con stock ≤ ${campoUmbral.value}` : '';
  resumen.textContent = `${productos.length} equipo(s)${filtro}.`;
}

async function consultar() {
  const ruta = construirRutaConsulta(casillaStockBajo.checked, campoUmbral.value);
  const respuesta = await fetch(ruta);
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    mostrarMensaje(describirError(datos, respuesta.status), 'error');
    return;
  }
  pintarTabla(datos);
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const cuerpo = prepararCuerpoProducto(campoNombre.value, campoStock.value);
  const respuesta = await fetch('/productos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo)
  });
  const datos = await respuesta.json();
  if (respuesta.status === 201) {
    mostrarMensaje(`Equipo creado: #${datos.id} ${datos.nombre} (stock ${datos.stock}).`, 'exito');
    formulario.reset();
  } else {
    mostrarMensaje(describirError(datos, respuesta.status), 'error');
  }
  await consultar();
});

botonConsultar.addEventListener('click', () => {
  consultar().catch(() => mostrarMensaje('No se pudo contactar con la API.', 'error'));
});

consultar().catch(() => mostrarMensaje('No se pudo contactar con la API.', 'error'));
