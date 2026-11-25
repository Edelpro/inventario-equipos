// Almacenamiento volátil en memoria (laboratorio).
// Cada instancia de aplicación crea su propio almacén: el estado no se comparte
// entre procesos y se pierde al reiniciar, desplegar o hacer rollback.

export function crearAlmacen() {
  const productos = [];
  let siguienteId = 1;

  return {
    agregar({ nombre, stock }) {
      const producto = { id: siguienteId, nombre, stock };
      siguienteId += 1;
      productos.push(producto);
      return { ...producto };
    },
    listar() {
      return productos.map((producto) => ({ ...producto }));
    },
    listarStockBajo(umbral) {
      return productos.filter((producto) => producto.stock <= umbral).map((producto) => ({ ...producto }));
    }
  };
}
