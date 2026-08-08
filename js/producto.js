const parametros = new URLSearchParams(window.location.search);
const idProducto = parametros.get("id");

const btnAgregarCarrito =
    document.getElementById("btnAgregarCarrito");

const contadorCarrito =
    document.getElementById("contadorCarrito");

let productoActual = null;

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


function agregarAlCarrito(idProducto) {
    const carrito = obtenerCarrito();

    const productoExistente = carrito.find(
        item => item.id === idProducto
    );

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            id: idProducto,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    actualizarContadorCarrito();

    btnAgregarCarrito.textContent = "¡Agregado!";

    setTimeout(() => {
        btnAgregarCarrito.textContent =
            "Agregar al carrito";
    }, 1200);
}

function mostrarProducto(producto) {
    document.getElementById("imagenProducto").src =
        producto.imagen;

    document.getElementById("imagenProducto").alt =
        producto.nombre;

    document.getElementById("categoriaProducto").textContent =
        producto.categoria;

    document.getElementById("nombreProducto").textContent =
        producto.nombre;

    document.getElementById("modeloProducto").textContent =
        producto.modelo;

    document.getElementById("precioProducto").textContent =
        `₡ ${producto.precio.toLocaleString("es-CR")}`;

    document.getElementById("descripcionProducto").textContent =
        producto.descripcion;

    const lista =
        document.getElementById("listaDetalles");

    lista.innerHTML = "";

    producto.detalles.forEach(detalle => {
        const li = document.createElement("li");
        li.textContent = detalle;
        lista.appendChild(li);
    });

    if (producto.stock <= 0) {
    btnAgregarCarrito.disabled = true;
    btnAgregarCarrito.textContent = "Agotado";
    }
}

async function cargarProducto() {
    try {
        const respuesta = await fetch(
            "data/info_productos.json"
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar el archivo de productos"
            );
        }

        const productos = await respuesta.json();

        productoActual = productos.find(
            producto => producto.id === idProducto
        );

        if (!productoActual) {
            document.querySelector(
                ".detalle-producto"
            ).innerHTML = `
                <h1>Producto no encontrado</h1>
                <a href="tienda.html">
                    Volver a la tienda
                </a>
            `;
            return;
        }

        mostrarProducto(productoActual);
        actualizarContadorCarrito();

    } catch (error) {
        console.error(error);
    }
}

btnAgregarCarrito.addEventListener("click", () => {
    if (!productoActual || productoActual.stock <= 0) {
        return;
    }

    agregarAlCarrito(productoActual.id);
});

cargarProducto();