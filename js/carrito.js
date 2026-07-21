const contenedorCarrito =
    document.getElementById("productosCarrito");

const totalCarrito =
    document.getElementById("totalCarrito");

const subtotalCarrito =
    document.getElementById("subtotalCarrito");

const resumenCarrito =
    document.getElementById("resumenCarrito");

const contadorCarrito =
    document.getElementById("contadorCarrito");

const cantidadProductosCarrito =
    document.getElementById("cantidadProductosCarrito");

const btnFinalizarCompra =
    document.getElementById("btnFinalizarCompra");


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


function obtenerCantidadTotal(carrito) {
    return carrito.reduce(
        (total, item) =>
            total + item.cantidad,
        0
    );
}


function actualizarContadores(carrito) {
    const cantidadTotal =
        obtenerCantidadTotal(carrito);

    if (contadorCarrito) {
        contadorCarrito.textContent =
            cantidadTotal;
    }

    if (cantidadProductosCarrito) {
        cantidadProductosCarrito.textContent =
            cantidadTotal === 1
                ? "1 producto"
                : `${cantidadTotal} productos`;
    }
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

        const productos =
            await respuesta.json();

        const carrito =
            obtenerCarrito();

        mostrarCarrito(
            carrito,
            productos
        );

    } catch (error) {
        console.error(error);

        contenedorCarrito.innerHTML = `
            <div class="carrito-error">

                <h2>
                    No pudimos cargar tu carrito
                </h2>

                <p>
                    Actualizá la página e intentá nuevamente.
                </p>

            </div>
        `;
    }
}


function mostrarCarrito(carrito, productos) {
    actualizarContadores(carrito);

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = `
            <div class="carrito-vacio">

                <div class="carrito-vacio-icono">
                    🛒
                </div>

                <span>
                    Tu carrito está esperando
                </span>

                <h2>
                    Todavía no agregaste productos
                </h2>

                <p>
                    Explorá nuestra tienda y encontrá el equipo
                    ideal para tu próxima salida de pesca.
                </p>

                <a
                    href="tienda.html"
                    class="btn-carrito-vacio"
                >
                    Explorar productos
                </a>

            </div>
        `;

        subtotalCarrito.textContent =
            "₡ 0";

        totalCarrito.textContent =
            "₡ 0";

        resumenCarrito.classList.add(
            "resumen-oculto"
        );

        return;
    }

    resumenCarrito.classList.remove(
        "resumen-oculto"
    );

    let total = 0;

    const tarjetas = carrito.map(
        itemCarrito => {
            const producto = productos.find(
                producto =>
                    producto.id === itemCarrito.id
            );

            if (!producto) {
                return "";
            }

            const subtotal =
                producto.precio *
                itemCarrito.cantidad;

            total += subtotal;

            let imagenProducto;

            if (producto.imagen) {
                imagenProducto = `
                    <img
                        src="${producto.imagen}"
                        alt="${producto.nombre}"
                    >
                `;
            } else {
                imagenProducto = `
                    <div class="imagen-carrito-vacia">
                        Sin imagen
                    </div>
                `;
            }

            return `
                <article class="producto-carrito">

                    <a
                        href="pantalla_producto.html?id=${producto.id}"
                        class="producto-carrito-imagen"
                    >
                        ${imagenProducto}
                    </a>

                    <div class="producto-carrito-info">

                        <span class="producto-carrito-categoria">
                            ${producto.categoria}
                        </span>

                        <h2>
                            ${producto.nombre}
                        </h2>

                        <p>
                            ${producto.modelo}
                        </p>

                        <strong class="precio-unitario">
                            ${formatearPrecio(producto.precio)}
                        </strong>

                    </div>

                    <div class="producto-carrito-controles">

                        <span class="cantidad-titulo">
                            Cantidad
                        </span>

                        <div class="cantidad-carrito">

                            <button
                                type="button"
                                class="btn-cantidad"
                                data-accion="disminuir"
                                data-id="${producto.id}"
                                aria-label="Disminuir cantidad"
                            >
                                −
                            </button>

                            <span>
                                ${itemCarrito.cantidad}
                            </span>

                            <button
                                type="button"
                                class="btn-cantidad"
                                data-accion="aumentar"
                                data-id="${producto.id}"
                                aria-label="Aumentar cantidad"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    <div class="producto-carrito-precio">

                        <span>
                            Subtotal
                        </span>

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
        }
    );

    contenedorCarrito.innerHTML =
        tarjetas.join("");

    subtotalCarrito.textContent =
        formatearPrecio(total);

    totalCarrito.textContent =
        formatearPrecio(total);
}


contenedorCarrito.addEventListener(
    "click",
    evento => {
        const boton =
            evento.target.closest(
                "[data-accion]"
            );

        if (!boton) {
            return;
        }

        const idProducto =
            boton.dataset.id;

        const accion =
            boton.dataset.accion;

        let carrito =
            obtenerCarrito();

        const productoCarrito =
            carrito.find(
                item =>
                    item.id === idProducto
            );

        if (!productoCarrito) {
            return;
        }

        if (accion === "aumentar") {
            productoCarrito.cantidad++;
        }

        if (accion === "disminuir") {
            productoCarrito.cantidad--;

            if (
                productoCarrito.cantidad <= 0
            ) {
                carrito = carrito.filter(
                    item =>
                        item.id !== idProducto
                );
            }
        }

        if (accion === "eliminar") {
            carrito = carrito.filter(
                item =>
                    item.id !== idProducto
            );
        }

        guardarCarrito(carrito);
        cargarCarrito();
    }
);


btnFinalizarCompra.addEventListener(
    "click",
    () => {
        const carrito =
            obtenerCarrito();

        if (carrito.length === 0) {
            return;
        }

        window.location.href =
            "pantalla_finalizar_compra.html";
    }
);


cargarCarrito();