/* =====================================================
   CONSTRUMAX PERÚ - CARRITO
===================================================== */

const CLAVE_CARRITO = "construmax_carrito";


/* =====================================================
   CARGAR CARRITO
   También elimina datos antiguos incorrectos
===================================================== */

let carrito = JSON.parse(
    localStorage.getItem(CLAVE_CARRITO)
) || [];


/* Eliminar productos dañados de versiones anteriores */

carrito = carrito.filter(producto => {

    return (
        producto &&
        producto.nombre &&
        producto.codigo &&
        Number.isFinite(Number(producto.precio)) &&
        Number(producto.cantidad) > 0
    );

});


/* Convertir cantidades y precios a números */

carrito = carrito.map(producto => {

    return {

        nombre: producto.nombre,

        codigo: producto.codigo,

        precio: Number(producto.precio),

        imagen: producto.imagen || "",

        cantidad: Number(producto.cantidad)

    };

});


guardarCarrito();



/* =====================================================
   GUARDAR CARRITO
===================================================== */

function guardarCarrito() {

    localStorage.setItem(
        CLAVE_CARRITO,
        JSON.stringify(carrito)
    );

}



/* =====================================================
   FORMATO DE PRECIO
===================================================== */

function formatoPrecio(valor) {

    return `S/ ${Number(valor).toFixed(2)}`;

}



/* =====================================================
   ACTUALIZAR CARRITO
===================================================== */

function actualizarCarrito() {

    const lista =
        document.getElementById("lista-carrito");

    const contador =
        document.getElementById("contador-carrito");

    const totalElemento =
        document.getElementById("total-carrito");


    if (!lista || !contador || !totalElemento) {
        return;
    }



    /* ================================================
       CANTIDAD TOTAL DE PRODUCTOS
    ================================================ */

    const cantidadTotal = carrito.reduce(
        (total, producto) => {

            return total +
                Number(producto.cantidad);

        },
        0
    );



    /* ================================================
       TOTAL DE DINERO
    ================================================ */

    const total = carrito.reduce(
        (suma, producto) => {

            return suma +
                Number(producto.precio) *
                Number(producto.cantidad);

        },
        0
    );



    contador.textContent =
        cantidadTotal;


    totalElemento.textContent =
        formatoPrecio(total);



    /* ================================================
       CARRITO VACÍO
    ================================================ */

    if (carrito.length === 0) {

        lista.innerHTML = `

            <div class="carrito-vacio">

                <div class="icono-vacio">
                    🛒
                </div>

                <h3>
                    Tu carrito está vacío
                </h3>

                <p>
                    Agrega productos desde el catálogo.
                </p>

            </div>

        `;

        return;

    }



    /* ================================================
       MOSTRAR PRODUCTOS
       
       IMPORTANTE:
       NO ponemos imagen aquí.
    ================================================ */

    lista.innerHTML = carrito.map(
        (producto, indice) => {

            const subtotal =
                Number(producto.precio) *
                Number(producto.cantidad);


            return `

                <div class="item-carrito">


                    <div class="info-carrito">

                        <h4>
                            ${producto.nombre}
                        </h4>


                        <p>
                            Código:
                            ${producto.codigo}
                        </p>


                        <p>
                            ${formatoPrecio(producto.precio)}
                            c/u
                        </p>



                        <div class="control-cantidad">

                            <button
                                type="button"
                                onclick="cambiarCantidad(${indice}, -1)"
                            >
                                −
                            </button>


                            <span>
                                ${producto.cantidad}
                            </span>


                            <button
                                type="button"
                                onclick="cambiarCantidad(${indice}, 1)"
                            >
                                +
                            </button>

                        </div>



                        <strong>

                            ${formatoPrecio(subtotal)}

                        </strong>

                    </div>



                    <button
                        type="button"
                        class="eliminar-producto"
                        onclick="eliminarProducto(${indice})"
                    >
                        🗑
                    </button>


                </div>

            `;

        }

    ).join("");

}



/* =====================================================
   AGREGAR PRODUCTO
===================================================== */

function agregarAlCarrito(tarjeta) {


    const nombre =
        tarjeta.dataset.producto;


    const codigo =
        tarjeta.dataset.codigo;


    const precio =
        Number(tarjeta.dataset.precio);


    const input =
        tarjeta.querySelector(
            'input[type="number"]'
        );


    let cantidad =
        Number(input?.value) || 1;


    cantidad =
        Math.max(
            1,
            Math.floor(cantidad)
        );



    /* ================================================
       COMPROBAR DATOS
    ================================================ */

    if (
        !nombre ||
        !codigo ||
        !Number.isFinite(precio)
    ) {

        alert(
            "No se pudieron obtener los datos del producto."
        );

        console.error(
            "Datos incorrectos:",
            {
                nombre,
                codigo,
                precio
            }
        );

        return;

    }



    /* ================================================
       BUSCAR SI YA EXISTE
    ================================================ */

    const productoExistente =
        carrito.find(
            producto =>
                producto.codigo === codigo
        );



    /* ================================================
       SI YA EXISTE, SUMAR
    ================================================ */

    if (productoExistente) {

        productoExistente.cantidad += cantidad;

    }


    /* ================================================
       SI NO EXISTE, AGREGAR
    ================================================ */

    else {

        carrito.push({

            nombre:
                nombre,

            codigo:
                codigo,

            precio:
                precio,

            cantidad:
                cantidad

        });

    }



    /* ================================================
       GUARDAR Y ACTUALIZAR
    ================================================ */

    guardarCarrito();

    actualizarCarrito();

    abrirCarrito();

}



/* =====================================================
   SUMAR / RESTAR CANTIDAD
===================================================== */

function cambiarCantidad(
    indice,
    cambio
) {


    if (!carrito[indice]) {
        return;
    }



    carrito[indice].cantidad =
        Number(carrito[indice].cantidad) +
        Number(cambio);



    /* ================================================
       SI LLEGA A 0, ELIMINAR
    ================================================ */

    if (
        carrito[indice].cantidad <= 0
    ) {

        carrito.splice(
            indice,
            1
        );

    }



    guardarCarrito();

    actualizarCarrito();

}



/* =====================================================
   ELIMINAR PRODUCTO
===================================================== */

function eliminarProducto(indice) {


    carrito.splice(
        indice,
        1
    );


    guardarCarrito();

    actualizarCarrito();

}



/* =====================================================
   VACIAR CARRITO
===================================================== */

function vaciarCarrito() {


    if (carrito.length === 0) {
        return;
    }



    const confirmar =
        confirm(
            "¿Seguro que deseas vaciar el carrito?"
        );



    if (confirmar) {

        carrito = [];

        guardarCarrito();

        actualizarCarrito();

    }

}



/* =====================================================
   ABRIR CARRITO
===================================================== */

function abrirCarrito() {


    const carritoPanel =
        document.getElementById(
            "contenido-carrito"
        );


    if (carritoPanel) {

        carritoPanel.classList.add(
            "mostrar"
        );

    }

}



/* =====================================================
   CERRAR CARRITO
===================================================== */

function cerrarCarrito() {


    const carritoPanel =
        document.getElementById(
            "contenido-carrito"
        );


    if (carritoPanel) {

        carritoPanel.classList.remove(
            "mostrar"
        );

    }

}



/* =====================================================
   INICIO
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ============================================
           BOTONES DE PRODUCTOS
        ============================================ */

        document
            .querySelectorAll(".tarjeta")
            .forEach(
                function (tarjeta) {


                    const boton =
                        tarjeta.querySelector(
                            ".tarjeta > button"
                        );


                    if (boton) {

                        boton.addEventListener(
                            "click",
                            function () {

                                agregarAlCarrito(
                                    tarjeta
                                );

                            }
                        );

                    }

                }
            );



        /* ============================================
           BOTÓN CARRITO
        ============================================ */

        const botonCarrito =
            document.getElementById(
                "boton-carrito"
            );


        if (botonCarrito) {

            botonCarrito.addEventListener(
                "click",
                abrirCarrito
            );

        }



        /* ============================================
           CERRAR CARRITO
        ============================================ */

        const botonCerrar =
            document.getElementById(
                "cerrar-carrito"
            );


        if (botonCerrar) {

            botonCerrar.addEventListener(
                "click",
                cerrarCarrito
            );

        }



        /* ============================================
           VACIAR CARRITO
        ============================================ */

        const botonVaciar =
            document.getElementById(
                "vaciar-carrito"
            );


        if (botonVaciar) {

            botonVaciar.addEventListener(
                "click",
                vaciarCarrito
            );

        }



        /* ============================================
           IR A COTIZACIÓN
        ============================================ */

        const botonCotizacion =
            document.getElementById(
                "ir-cotizacion"
            );


        if (botonCotizacion) {

            botonCotizacion.addEventListener(
                "click",
                function () {


                    if (
                        carrito.length === 0
                    ) {

                        alert(
                            "Agrega al menos un producto al carrito."
                        );

                        return;

                    }


                    window.location.href =
                        "cotizacion.html";

                }
            );

        }



        /* ============================================
           MOSTRAR CARRITO
        ============================================ */

        actualizarCarrito();

    }
);



/* =====================================================
   FUNCIONES GLOBALES
===================================================== */

window.cambiarCantidad =
    cambiarCantidad;


window.eliminarProducto =
    eliminarProducto;