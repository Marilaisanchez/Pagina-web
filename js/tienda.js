const contenedorProductos = document.getElementById("lista-productos");

const botonesCategorias = document.querySelectorAll(
    ".categorias-tienda button"
);

const selectOrdenar = document.getElementById("ordenarProductos");
const contadorCarrito = document.getElementById("contadorCarrito");
const inputBuscar =
    document.getElementById("buscarProducto");

const btnBuscar =
    document.getElementById("btnBuscar");

let productos = [];
let categoriaActual = "Todos";
let ordenActual = "recientes";
let busquedaActual = "";

function formatearPrecio(precio) {
    return `₡ ${precio.toLocaleString("es-CR")}`;
}

function crearTarjeta(producto) {
    let imagenProducto;

    if (producto.imagen) {
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
                href="pantalla_producto.html?id=${producto.id}"
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
                    </div>
                </div>
            </a>

            <button
                class="btn-carrito"
                type="button"
                data-id="${producto.id}"
                aria-label="Agregar ${producto.nombre} al carrito">
                🛒
            </button>

        </article>
    `;
}

function mostrarProductos(lista) {
    if (lista.length === 0) {
        contenedorProductos.innerHTML = `
            <p class="sin-productos">
                No hay productos disponibles.
            </p>
        `;
        return;
    }

    contenedorProductos.innerHTML = lista
        .map(crearTarjeta)
        .join("");
}

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function actualizarProductos() {
    let lista = [...productos];

    // Filtrar por categoría
    if (categoriaActual !== "Todos") {
        lista = lista.filter(
            producto => producto.categoria === categoriaActual
        );
    }

        if (busquedaActual !== "") {
        const textoBuscado =
            normalizarTexto(busquedaActual);

        lista = lista.filter(producto => {
            const nombre =
                normalizarTexto(producto.nombre || "");

            const modelo =
                normalizarTexto(producto.modelo || "");

            const categoria =
                normalizarTexto(producto.categoria || "");

            const descripcion =
                normalizarTexto(producto.descripcion || "");

            return (
                nombre.includes(textoBuscado) ||
                modelo.includes(textoBuscado) ||
                categoria.includes(textoBuscado) ||
                descripcion.includes(textoBuscado)
            );
        });
    }

    // Ordenar los productos
    switch (ordenActual) {
        case "az":
            lista.sort((a, b) =>
                a.nombre.localeCompare(b.nombre)
            );
            break;

        case "za":
            lista.sort((a, b) =>
                b.nombre.localeCompare(a.nombre)
            );
            break;

        case "precioAsc":
            lista.sort((a, b) =>
                a.precio - b.precio
            );
            break;

        case "precioDesc":
            lista.sort((a, b) =>
                b.precio - a.precio
            );
            break;

        case "recientes":
        default:
            // Mantiene el orden original del JSON
            break;
    }

    mostrarProductos(lista);
}

function activarFiltros() {
    botonesCategorias.forEach(boton => {
        boton.addEventListener("click", () => {
            botonesCategorias.forEach(otroBoton => {
                otroBoton.classList.remove("categoria-activa");
            });

            boton.classList.add("categoria-activa");

            categoriaActual = boton.dataset.categoria;

            actualizarProductos();
        });
    });
}

function activarOrdenamiento() {
    if (!selectOrdenar) {
        console.error(
            'No se encontró el select con id="ordenarProductos"'
        );
        return;
    }

    selectOrdenar.addEventListener("change", () => {
        ordenActual = selectOrdenar.value;
        actualizarProductos();
    });
}

function activarBuscador() {
    function realizarBusqueda() {
        busquedaActual = inputBuscar.value;

        actualizarProductos();
    }

    btnBuscar.addEventListener("click", () => {
        realizarBusqueda();
    });

    inputBuscar.addEventListener("keydown", evento => {
        if (evento.key === "Enter") {
            realizarBusqueda();
        }
    });

    inputBuscar.addEventListener("input", () => {
        if (inputBuscar.value.trim() === "") {
            busquedaActual = "";
            actualizarProductos();
        }
    });
}

async function cargarProductos() {
    try {
        const respuesta = await fetch(
            "data/info_productos.json"
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar info_productos.json"
            );
        }

        productos = await respuesta.json();

        actualizarProductos();
        activarFiltros();
        activarOrdenamiento();
        activarBuscador();
        actualizarContadorCarrito();

    } catch (error) {
        console.error(error);

        contenedorProductos.innerHTML = `
            <p>No se pudieron cargar los productos.</p>
        `;
    }
}

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
        producto => producto.id === idProducto
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

    alert("Producto agregado al carrito");
}

function actualizarContadorCarrito() {
    if (!contadorCarrito) {
        return;
    }

    const carrito = obtenerCarrito();

    const cantidadTotal = carrito.reduce(
        (total, producto) =>
            total + producto.cantidad,
        0
    );

    contadorCarrito.textContent = cantidadTotal;
}

contenedorProductos.addEventListener(
    "click",
    evento => {
        const botonCarrito =
            evento.target.closest(".btn-carrito");

        if (!botonCarrito) {
            return;
        }

        agregarAlCarrito(
            botonCarrito.dataset.id
        );
    }
);

cargarProductos();