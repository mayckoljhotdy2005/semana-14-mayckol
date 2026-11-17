/* =====================================================
   CONSTRUMAX PERÚ - PAGO
   RESUMEN DE PRODUCTOS DEL CARRITO
===================================================== */

const CLAVE_CARRITO = "construmax_carrito";


/* =====================================================
   OBTENER CARRITO
===================================================== */

function obtenerCarrito() {

    try {

        return JSON.parse(
            localStorage.getItem(CLAVE_CARRITO)
        ) || [];

    } catch (error) {

        console.error(
            "Error al leer el carrito:",
            error
        );

        return [];

    }

}


/* =====================================================
   FORMATO DE PRECIO
===================================================== */

function formatoPrecio(valor) {

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {

        return "S/ 0.00";

    }

    return `S/ ${numero.toFixed(2)}`;

}


/* =====================================================
   MOSTRAR PRODUCTOS
===================================================== */

function mostrarProductosPago() {

    const contenedor =
        document.getElementById("productos-pago");

    const subtotalElemento =
        document.getElementById("subtotal-pago");

    const deliveryElemento =
        document.getElementById("delivery-pago");

    const totalElemento =
        document.getElementById("total-pago");


    if (
        !contenedor ||
        !subtotalElemento ||
        !deliveryElemento ||
        !totalElemento
    ) {

        return;

    }


    let carrito = obtenerCarrito();


    /* ---------------------------------------------
       VALIDAR PRODUCTOS
    --------------------------------------------- */

    carrito = carrito.filter(producto => {

        return (
            producto &&
            producto.nombre &&
            producto.codigo &&
            Number.isFinite(
                Number(producto.precio)
            ) &&
            Number(producto.cantidad) > 0
        );

    });


    /* ---------------------------------------------
       SI NO HAY PRODUCTOS
    --------------------------------------------- */

    if (carrito.length === 0) {

        contenedor.innerHTML = `

            <div class="pago-vacio">

                <h4>
                    No hay productos
                </h4>

                <p>
                    No tienes productos seleccionados
                    para realizar el pago.
                </p>

                <a href="catalogo.html">
                    Ir al catálogo
                </a>

            </div>

        `;

        subtotalElemento.textContent =
            "S/ 0.00";

        deliveryElemento.textContent =
            "S/ 0.00";

        totalElemento.textContent =
            "S/ 0.00";

        return;

    }


    /* ---------------------------------------------
       MOSTRAR PRODUCTOS
    --------------------------------------------- */

    let subtotalGeneral = 0;


    contenedor.innerHTML = carrito.map(
        producto => {

            const precio =
                Number(producto.precio);

            const cantidad =
                Number(producto.cantidad);

            const subtotal =
                precio * cantidad;


            subtotalGeneral += subtotal;


            return `

                <div class="producto-pago">

                    <div class="datos-producto-pago">

                        <h4>
                            ${producto.nombre}
                        </h4>

                        <p>
                            Código:
                            ${producto.codigo}
                        </p>

                        <p>
                            Precio:
                            ${formatoPrecio(precio)}
                        </p>

                        <p>
                            Cantidad:
                            <strong>
                                ${cantidad}
                            </strong>
                        </p>

                    </div>


                    <div class="subtotal-producto-pago">

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ${formatoPrecio(subtotal)}
                        </strong>

                    </div>

                </div>

            `;

        }
    ).join("");


    /* ---------------------------------------------
       DELIVERY
    --------------------------------------------- */

    /*
       Por ahora el delivery es S/ 0.00.

       Si posteriormente quieres cobrar delivery,
       podemos establecer un precio dependiendo
       del tipo de entrega.
    */

    const delivery = 0;


    /* ---------------------------------------------
       TOTAL
    --------------------------------------------- */

    const total =
        subtotalGeneral + delivery;


    /* ---------------------------------------------
       MOSTRAR TOTALES
    --------------------------------------------- */

    subtotalElemento.textContent =
        formatoPrecio(subtotalGeneral);


    deliveryElemento.textContent =
        formatoPrecio(delivery);


    totalElemento.textContent =
        formatoPrecio(total);

}


/* =====================================================
   VALIDAR FORMULARIO
===================================================== */

function validarFormularioPago() {

    const nombre =
        document.getElementById("nombre");

    const correo =
        document.getElementById("correo");

    const telefono =
        document.getElementById("telefono");

    const metodo =
        document.getElementById("metodo");

    const referencia =
        document.getElementById("referencia");


    if (!nombre.value.trim()) {

        alert(
            "Por favor, ingresa tu nombre completo."
        );

        nombre.focus();

        return false;

    }


    if (!correo.value.trim()) {

        alert(
            "Por favor, ingresa tu correo electrónico."
        );

        correo.focus();

        return false;

    }


    if (!telefono.value.trim()) {

        alert(
            "Por favor, ingresa tu número de teléfono."
        );

        telefono.focus();

        return false;

    }


    if (!metodo.value) {

        alert(
            "Por favor, selecciona un método de pago."
        );

        metodo.focus();

        return false;

    }


    if (!referencia.value.trim()) {

        alert(
            "Por favor, ingresa el número de operación."
        );

        referencia.focus();

        return false;

    }


    return true;

}


/* =====================================================
   CONFIRMAR PAGO
===================================================== */

function confirmarPago(evento) {

    evento.preventDefault();


    const carrito =
        obtenerCarrito();


    /* ---------------------------------------------
       VERIFICAR CARRITO
    --------------------------------------------- */

    if (carrito.length === 0) {

        alert(
            "No tienes productos seleccionados. Regresa al catálogo."
        );

        window.location.href =
            "catalogo.html";

        return;

    }


    /* ---------------------------------------------
       VALIDAR FORMULARIO
    --------------------------------------------- */

    if (!validarFormularioPago()) {

        return;

    }


    /* ---------------------------------------------
       MENSAJE DE CONFIRMACIÓN
    --------------------------------------------- */

    alert(
        "¡Pago registrado correctamente! Gracias por tu compra en ConstruMax Perú."
    );


    /* ---------------------------------------------
       LIMPIAR CARRITO
    --------------------------------------------- */

    localStorage.removeItem(
        CLAVE_CARRITO
    );


    /* ---------------------------------------------
       REGRESAR AL CATÁLOGO
    --------------------------------------------- */

    window.location.href =
        "catalogo.html";

}


/* =====================================================
   INICIO
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* Mostrar productos */

        mostrarProductosPago();


        /* Formulario */

        const formulario =
            document.getElementById(
                "formulario-pago"
            );


        if (formulario) {

            formulario.addEventListener(
                "submit",
                confirmarPago
            );

        }

    }
);