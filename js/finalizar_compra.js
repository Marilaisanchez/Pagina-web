const formularioCompra =
    document.getElementById("formularioCompra");

const productosResumenCompra =
    document.getElementById("productosResumenCompra");

const subtotalFinalizar =
    document.getElementById("subtotalFinalizar");

const costoEnvioFinalizar =
    document.getElementById("costoEnvioFinalizar");

const totalFinalizar =
    document.getElementById("totalFinalizar");

const contadorCarrito =
    document.getElementById("contadorCarrito");

const camposDireccion =
    document.getElementById("camposDireccion");

const mensajeFormulario =
    document.getElementById("mensajeFormulario");

const selectProvincia =
    document.getElementById("provinciaCliente");


let productosDisponibles = [];
let subtotalPedido = 0;
let costoEnvio = 0;


/* =========================
   CARRITO
========================= */

function obtenerCarrito() {
    return JSON.parse(
        localStorage.getItem("carrito")
    ) || [];
}


function formatearPrecio(precio) {
    return `₡ ${precio.toLocaleString("es-CR")}`;
}


function actualizarContador() {
    const carrito = obtenerCarrito();

    const cantidadTotal = carrito.reduce(
        (total, item) =>
            total + item.cantidad,
        0
    );

    if (contadorCarrito) {
        contadorCarrito.textContent =
            cantidadTotal;
    }
}


/* =========================
   CARGAR PRODUCTOS
========================= */

async function cargarResumenCompra() {
    try {
        const respuesta = await fetch(
            "data/info_productos.json"
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar los productos"
            );
        }

        productosDisponibles =
            await respuesta.json();

        mostrarResumenCompra();

    } catch (error) {
        console.error(error);

        productosResumenCompra.innerHTML = `
            <p class="error-resumen">
                No se pudo cargar el resumen del pedido.
            </p>
        `;
    }
}


/* =========================
   COSTO DE ENVÍO
========================= */

function calcularCostoEnvio() {
    const opcionEntrega =
        document.querySelector(
            'input[name="tipoEntrega"]:checked'
        );

    if (!opcionEntrega) {
        costoEnvio = 0;
        return;
    }

    const tipoEntrega =
        opcionEntrega.value;

    if (tipoEntrega === "Retiro en tienda") {
        costoEnvio = 0;
        return;
    }

    const provincia =
        selectProvincia.value;

    const provinciasGAM = [
        "San José",
        "Heredia",
        "Cartago",
        "Alajuela"
    ];

    if (provincia === "") {
        costoEnvio = 0;
    } else if (
        provinciasGAM.includes(provincia)
    ) {
        costoEnvio = 2980;
    } else {
        costoEnvio = 3820;
    }
}


function actualizarTotales() {
    calcularCostoEnvio();

    const totalPedido =
        subtotalPedido + costoEnvio;

    subtotalFinalizar.textContent =
        formatearPrecio(subtotalPedido);

    costoEnvioFinalizar.textContent =
        formatearPrecio(costoEnvio);

    totalFinalizar.textContent =
        formatearPrecio(totalPedido);
}


/* =========================
   MOSTRAR RESUMEN
========================= */

function mostrarResumenCompra() {
    const carrito = obtenerCarrito();

    actualizarContador();

    if (carrito.length === 0) {
        productosResumenCompra.innerHTML = `
            <div class="finalizar-carrito-vacio">

                <p>
                    Tu carrito está vacío.
                </p>

                <a href="tienda.html">
                    Ir a la tienda
                </a>

            </div>
        `;

        subtotalPedido = 0;
        costoEnvio = 0;

        subtotalFinalizar.textContent =
            "₡ 0";

        costoEnvioFinalizar.textContent =
            "₡ 0";

        totalFinalizar.textContent =
            "₡ 0";

        formularioCompra
            .querySelectorAll(
                "input, select, textarea, button"
            )
            .forEach(elemento => {
                elemento.disabled = true;
            });

        return;
    }

    subtotalPedido = 0;

    const productosHTML = carrito.map(
        item => {
            const producto =
                productosDisponibles.find(
                    producto =>
                        producto.id === item.id
                );

            if (!producto) {
                return "";
            }

            const subtotal =
                producto.precio *
                item.cantidad;

            subtotalPedido += subtotal;

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
                    <div class="imagen-resumen-vacia">
                        Sin imagen
                    </div>
                `;
            }

            return `
                <article class="producto-resumen-finalizar">

                    <div class="producto-resumen-imagen">

                        ${imagenProducto}

                        <span>
                            ${item.cantidad}
                        </span>

                    </div>

                    <div class="producto-resumen-info">

                        <h3>
                            ${producto.nombre}
                        </h3>

                        <p>
                            ${producto.modelo}
                        </p>

                    </div>

                    <strong>
                        ${formatearPrecio(subtotal)}
                    </strong>

                </article>
            `;
        }
    );

    productosResumenCompra.innerHTML =
        productosHTML.join("");

    actualizarTotales();
}


/* =========================
   TIPO DE ENTREGA
========================= */

function actualizarCamposEntrega() {
    const opcionEntrega =
        document.querySelector(
            'input[name="tipoEntrega"]:checked'
        );

    if (!opcionEntrega) {
        return;
    }

    const tipoEntrega =
        opcionEntrega.value;

    const esEnvio =
        tipoEntrega === "Envío";

    camposDireccion.classList.toggle(
        "direccion-oculta",
        !esEnvio
    );

    document.getElementById(
        "provinciaCliente"
    ).required = esEnvio;

    document.getElementById(
        "cantonCliente"
    ).required = esEnvio;

    document.getElementById(
        "direccionCliente"
    ).required = esEnvio;

    actualizarTotales();
}


document
    .querySelectorAll(
        'input[name="tipoEntrega"]'
    )
    .forEach(opcion => {
        opcion.addEventListener(
            "change",
            actualizarCamposEntrega
        );
    });


selectProvincia.addEventListener(
    "change",
    actualizarTotales
);


/* =========================
   DETALLE DEL PEDIDO
========================= */

function crearDetalleProductos() {
    const carrito = obtenerCarrito();

    return carrito
        .map(item => {
            const producto =
                productosDisponibles.find(
                    producto =>
                        producto.id === item.id
                );

            if (!producto) {
                return "";
            }

            const subtotal =
                producto.precio *
                item.cantidad;

            return (
                `• ${producto.nombre}\n` +
                `  Cantidad: ${item.cantidad}\n` +
                `  Precio unitario: ` +
                `${formatearPrecio(producto.precio)}\n` +
                `  Subtotal: ` +
                `${formatearPrecio(subtotal)}`
            );
        })
        .filter(Boolean)
        .join("\n\n");
}


function calcularTotal() {
    return subtotalPedido + costoEnvio;
}


/* =========================
   CONFIRMAR PEDIDO
========================= */

formularioCompra.addEventListener(
    "submit",
    evento => {
        evento.preventDefault();

        const carrito =
            obtenerCarrito();

        mensajeFormulario.textContent = "";

        mensajeFormulario.classList.remove(
            "mensaje-error"
        );

        if (carrito.length === 0) {
            mensajeFormulario.textContent =
                "Tu carrito está vacío.";

            mensajeFormulario.classList.add(
                "mensaje-error"
            );

            return;
        }

        actualizarTotales();

        if (!formularioCompra.checkValidity()) {
            formularioCompra.reportValidity();
            return;
        }

        const datos =
            new FormData(formularioCompra);

        const nombre =
            datos.get("nombreCliente");

        const telefono =
            datos.get("telefonoCliente");

        const correo =
            datos.get("correoCliente");

        const entrega =
            datos.get("tipoEntrega");

        const pago =
            datos.get("metodoPago");

        const provincia =
            datos.get("provinciaCliente");

        const canton =
            datos.get("cantonCliente");

        const direccion =
            datos.get("direccionCliente");

        const notas =
            datos.get("notasCliente") || "";

        const detalleProductos =
            crearDetalleProductos();

        const total =
            calcularTotal();

        let mensaje =
            `Hola, quisiera confirmar este pedido ` +
            `de DMK Fishing Store.\n\n` +

            `DATOS DEL CLIENTE\n` +
            `Nombre: ${nombre}\n` +
            `Teléfono: ${telefono}\n` +
            `Correo: ${correo}\n\n` +

            `ENTREGA Y PAGO\n` +
            `Entrega: ${entrega}\n` +
            `Método de pago: ${pago}\n`;

        if (entrega === "Envío") {
            mensaje +=
                `Provincia: ${provincia}\n` +
                `Cantón: ${canton}\n` +
                `Dirección: ${direccion}\n`;
        }

        mensaje +=
            `\nPRODUCTOS\n` +
            `${detalleProductos}\n\n` +

            `RESUMEN\n` +
            `Subtotal: ` +
            `${formatearPrecio(subtotalPedido)}\n` +
            `Envío: ` +
            `${formatearPrecio(costoEnvio)}\n` +
            `TOTAL: ` +
            `${formatearPrecio(total)}`;

        if (notas.trim() !== "") {
            mensaje +=
                `\n\nNotas: ${notas}`;
        }

        const mensajeCodificado =
            encodeURIComponent(mensaje);

        window.open(
            `https://wa.me/50683458158?text=${mensajeCodificado}`,
            "_blank"
        );
    }
);


/* =========================
   INICIAR PÁGINA
========================= */

async function iniciarPagina() {
    await cargarResumenCompra();
    actualizarCamposEntrega();
}

iniciarPagina();