const parametros = new URLSearchParams(window.location.search);
const idProducto = parametros.get("id");

fetch("data/info_productos.json")
    .then(respuesta => respuesta.json())
    .then(productos => {

        const producto = productos.find(p => p.id === idProducto);

        if(!producto){
            document.body.innerHTML="<h1>Producto no encontrado</h1>";
            return;
        }

        mostrarProducto(producto);

    });

function mostrarProducto(producto){

    document.getElementById("imagenProducto").src=producto.imagen;

    document.getElementById("imagenProducto").alt=producto.nombre;

    document.getElementById("categoriaProducto").textContent=producto.categoria;

    document.getElementById("nombreProducto").textContent=producto.nombre;

    document.getElementById("modeloProducto").textContent=producto.modelo;

    document.getElementById("precioProducto").textContent=
        "₡ "+producto.precio.toLocaleString("es-CR");

    document.getElementById("descripcionProducto").textContent=
        producto.descripcion;

    const lista=document.getElementById("listaDetalles");

    producto.detalles.forEach(detalle=>{

        const li=document.createElement("li");

        li.textContent=detalle;

        lista.appendChild(li);

    });

}

