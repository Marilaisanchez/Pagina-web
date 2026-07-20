const contenedorProductos = document.getElementById("lista-productos");

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        maximumFractionDigits: 0
    }).format(precio);
}

function crearTarjeta(producto) {
    let imagenProducto;

    if (producto.imagen !== "") {
        imagenProducto = `
            <img
                src="${producto.imagen}"
                alt="${producto.nombre}"
                class="producto-imagen"
            >
        `;
    } else {
        imagenProducto = `
            <div class="imagen-no-disponible">
                Imagen próximamente
            </div>
        `;
    }

    return `
        <article class="producto-card">

            <a
                href="producto.html?id=${producto.id}"
                class="enlace-producto"
            >
                <div class="producto-imagen-contenedor">
                    ${imagenProducto}
                </div>

                <div class="producto-info">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.modelo}</p>

                    <div class="producto-parte-inferior">
                        <span>${formatearPrecio(producto.precio)}</span>

                        <button class="btn-carrito" type="button">
                            🛒
                        </button>
                    </div>
                </div>
            </a>

        </article>
    `;
}

async function cargarProductos() {
    try {
        const respuesta = await fetch("data/info_productos.json");

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el archivo de productos.");
        }

        const productos = await respuesta.json();

        contenedorProductos.innerHTML = productos
            .map(crearTarjeta)
            .join("");
    } catch (error) {
        console.error(error);

        contenedorProductos.innerHTML = `
            <div class="mensaje-error">
                <h2>No pudimos cargar los productos</h2>
                <p>Revisá las rutas del archivo JSON y de las imágenes.</p>
            </div>
        `;
    }
}

cargarProductos();