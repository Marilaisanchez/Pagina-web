function actualizarContadorCarrito() {

    const contadorCarrito =
        document.getElementById("contadorCarrito");

    if (!contadorCarrito) {
        return;
    }

    const carrito =
        JSON.parse(localStorage.getItem("carrito")) || [];

    const cantidadTotal = carrito.reduce(
        (total, producto) =>
            total + producto.cantidad,
        0
    );

    contadorCarrito.textContent = cantidadTotal;
}

actualizarContadorCarrito();