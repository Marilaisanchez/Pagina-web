const contenedorCarrito =
    document.getElementById("productosCarrito");

const totalCarrito =
    document.getElementById("totalCarrito");

function obtenerCarrito() {
    return JSON.parse(
        localStorage.getItem("carrito")
    ) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );
}

function formatearPrecio(precio) {
    return `₡ ${precio.toLocaleString("es-CR")}`;
}

async function cargarCarrito() {
    try {
        const respuesta = await fetch(
            "data/info_productos.json"
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar info_productos.json"
            );
        }

        const productos = await respuesta.json();
        const carrito = obtenerCarrito();

        mostrarCarrito(carrito, productos);

    } catch (error) {
        console.error(error);

        contenedorCarrito.innerHTML = `
            <p>No se pudo cargar el carrito.</p>
        `;
    }
}

function mostrarCarrito(carrito, productos) {
    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = `
            <p class="carrito-vacio">
                Tu carrito está vacío.
            </p>

            <a href="tienda.html" class="btn-volver-tienda">
                Ir a la tienda
            </a>
        `;

        totalCarrito.textContent = "₡ 0";
        return;
    }

    let total = 0;

    const tarjetas = carrito.map(itemCarrito => {
        const producto = productos.find(
            producto => producto.id === itemCarrito.id
        );

        if (!producto) {
            return "";
        }

        const subtotal =
            producto.precio * itemCarrito.cantidad;

        total += subtotal;

        return `
            <article class="producto-carrito">

                <div class="producto-carrito-imagen">
                    <img
                        src="${producto.imagen}"
                        alt="${producto.nombre}"
                    >
                </div>

                <div class="producto-carrito-info">
                    <h2>${producto.nombre}</h2>

                    <p>${producto.modelo}</p>

                    <p class="precio-unitario">
                        ${formatearPrecio(producto.precio)}
                    </p>
                </div>

                <div class="cantidad-carrito">

                    <button
                        type="button"
                        class="btn-cantidad"
                        data-accion="disminuir"
                        data-id="${producto.id}"
                    >
                        −
                    </button>

                    <span>${itemCarrito.cantidad}</span>

                    <button
                        type="button"
                        class="btn-cantidad"
                        data-accion="aumentar"
                        data-id="${producto.id}"
                    >
                        +
                    </button>

                </div>

                <div class="subtotal-carrito">
                    <strong>
                        ${formatearPrecio(subtotal)}
                    </strong>
                </div>

                <button
                    type="button"
                    class="btn-eliminar"
                    data-accion="eliminar"
                    data-id="${producto.id}"
                >
                    Eliminar
                </button>

            </article>
        `;
    });

    contenedorCarrito.innerHTML = tarjetas.join("");

    totalCarrito.textContent = formatearPrecio(total);
}

contenedorCarrito.addEventListener("click", evento => {
    const boton = evento.target.closest("[data-accion]");

    if (!boton) {
        return;
    }

    const idProducto = boton.dataset.id;
    const accion = boton.dataset.accion;

    let carrito = obtenerCarrito();

    const productoCarrito = carrito.find(
        producto => producto.id === idProducto
    );

    if (!productoCarrito) {
        return;
    }

    if (accion === "aumentar") {
        productoCarrito.cantidad++;
    }

    if (accion === "disminuir") {
        productoCarrito.cantidad--;

        if (productoCarrito.cantidad <= 0) {
            carrito = carrito.filter(
                producto => producto.id !== idProducto
            );
        }
    }

    if (accion === "eliminar") {
        carrito = carrito.filter(
            producto => producto.id !== idProducto
        );
    }

    guardarCarrito(carrito);
    cargarCarrito();
});

cargarCarrito();