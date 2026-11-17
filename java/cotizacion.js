import { sql } from "./neon-config.js";
import { obtenerUsuario, exigirSesion } from "./auth.js";


/* =====================================================
   CONFIGURACIÓN
===================================================== */

const CLAVE_CARRITO = "construmax_carrito";


/* =====================================================
   EXIGIR SESIÓN
===================================================== */

const usuario = exigirSesion();

if (!usuario) {
    throw new Error("No hay una sesión activa.");
}


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

function mostrarProductosCotizacion() {

    const lista =
        document.getElementById(
            "lista-productos-cotizacion"
        );

    const totalElemento =
        document.getElementById(
            "total-cotizacion"
        );


    if (!lista || !totalElemento) {
        return;
    }


    let carrito = obtenerCarrito();


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


    if (carrito.length === 0) {

        lista.innerHTML = `

            <div class="mensaje-carrito-vacio">

                <h3>
                    No hay productos seleccionados
                </h3>

                <p>
                    Regresa al catálogo y agrega
                    los productos que deseas cotizar.
                </p>

                <a href="catalogo.html">
                    Ir al catálogo
                </a>

            </div>

        `;

        totalElemento.textContent = "S/ 0.00";

        return;
    }


    let total = 0;


    lista.innerHTML = carrito.map(producto => {

        const precio =
            Number(producto.precio);

        const cantidad =
            Number(producto.cantidad);

        const subtotal =
            precio * cantidad;


        total += subtotal;


        return `

            <div class="producto-cotizacion">

                <div class="datos-producto-cotizacion">

                    <h4>
                        ${producto.nombre}
                    </h4>

                    <p>
                        Código:
                        ${producto.codigo}
                    </p>

                    <p>
                        Precio unitario:
                        ${formatoPrecio(precio)}
                    </p>

                    <p>
                        Cantidad:
                        <strong>
                            ${cantidad}
                        </strong>
                    </p>

                </div>


                <div class="subtotal-producto">

                    <span>
                        Subtotal
                    </span>

                    <strong>
                        ${formatoPrecio(subtotal)}
                    </strong>

                </div>

            </div>

        `;

    }).join("");


    totalElemento.textContent =
        formatoPrecio(total);
}


/* =====================================================
   VALIDAR PRODUCTOS
===================================================== */

function validarProductos() {

    const carrito =
        obtenerCarrito();


    if (carrito.length === 0) {

        alert(
            "No tienes productos seleccionados. " +
            "Regresa al catálogo y agrega al menos un producto."
        );

        return false;
    }


    return true;
}


/* =====================================================
   VALIDAR FORMULARIO
===================================================== */

function validarFormulario() {

    const nombre =
        document.getElementById("nombre");

    const telefono =
        document.getElementById("telefono");

    const correo =
        document.getElementById("correo");

    const direccion =
        document.getElementById("direccion");

    const cantidadEstimada =
        document.getElementById(
            "cantidad-estimada"
        );

    const entrega =
        document.getElementById("entrega");


    if (
        !nombre ||
        !nombre.value.trim()
    ) {

        alert(
            "Por favor, ingresa tu nombre completo."
        );

        nombre?.focus();

        return false;
    }


    if (
        !telefono ||
        !telefono.value.trim()
    ) {

        alert(
            "Por favor, ingresa tu teléfono."
        );

        telefono?.focus();

        return false;
    }


    if (
        !correo ||
        !correo.value.trim()
    ) {

        alert(
            "Por favor, ingresa tu correo electrónico."
        );

        correo?.focus();

        return false;
    }


    if (
        !direccion ||
        !direccion.value.trim()
    ) {

        alert(
            "Por favor, ingresa tu dirección."
        );

        direccion?.focus();

        return false;
    }


    if (
        !cantidadEstimada ||
        !cantidadEstimada.value.trim()
    ) {

        alert(
            "Por favor, ingresa la cantidad estimada."
        );

        cantidadEstimada?.focus();

        return false;
    }


    if (
        !entrega ||
        !entrega.value
    ) {

        alert(
            "Por favor, selecciona el tipo de entrega."
        );

        entrega?.focus();

        return false;
    }


    return true;
}


/* =====================================================
   GENERAR CÓDIGO DE SEGUIMIENTO
===================================================== */

function generarCodigoSeguimiento() {

    const numero =
        Date.now()
        .toString()
        .slice(-8);


    return `COD-${numero}`;
}


/* =====================================================
   CONVERTIR PRODUCTOS A TEXTO
===================================================== */

function obtenerMaterialesTexto(carrito) {

    return carrito
        .map(producto => {

            return (
                `${producto.nombre} ` +
                `(${producto.codigo}) ` +
                `x ${producto.cantidad}`
            );

        })
        .join(", ");
}


/* =====================================================
   GUARDAR COTIZACIÓN EN NEON
===================================================== */

async function guardarCotizacion() {

    const nombre =
        document
            .getElementById("nombre")
            .value
            .trim();


    const telefono =
        document
            .getElementById("telefono")
            .value
            .trim();


    const correo =
        document
            .getElementById("correo")
            .value
            .trim()
            .toLowerCase();


    const direccion =
        document
            .getElementById("direccion")
            .value
            .trim();


    const cantidadEstimada =
        document
            .getElementById("cantidad-estimada")
            .value
            .trim();


    const entrega =
        document
            .getElementById("entrega")
            .value;


    const observaciones =
        document
            .getElementById("observaciones")
            .value
            .trim();


    const carrito =
        obtenerCarrito();


    const materiales =
        obtenerMaterialesTexto(carrito);


    const codigo =
        generarCodigoSeguimiento();


    /* =====================================================
       VERIFICAR USUARIO
    ===================================================== */

    const usuarioActual =
        obtenerUsuario();


    if (!usuarioActual) {

        throw new Error(
            "No hay una sesión iniciada."
        );

    }


    /* =====================================================
       INSERTAR EN NEON
    ===================================================== */

    try {

        const resultado = await sql`

            INSERT INTO cotizaciones_obra
            (
                codigo_seguimiento,
                nombre_cliente,
                materiales,
                cantidad_estimada,
                telefono,
                correo,
                direccion,
                entrega,
                observaciones,
                id_usuario
            )

            VALUES
            (
                ${codigo},
                ${nombre},
                ${materiales},
                ${cantidadEstimada},
                ${telefono},
                ${correo},
                ${direccion},
                ${entrega},
                ${observaciones},
                ${usuarioActual.id}
            )

            RETURNING
                id,
                codigo_seguimiento,
                nombre_cliente,
                materiales,
                cantidad_estimada,
                telefono,
                correo,
                direccion,
                entrega,
                observaciones,
                estado,
                fecha_registro,
                id_usuario;

        `;


        console.log(
            "Cotización guardada:",
            resultado[0]
        );


        return resultado[0];


    } catch (error) {

        console.error(
            "Error al guardar la cotización:",
            error
        );

        throw error;
    }
}


/* =====================================================
   EVENTO PRINCIPAL
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* Mostrar productos */

        mostrarProductosCotizacion();


        /* Botón continuar */

        const botonPago =
            document.querySelector(
                ".btn-principal"
            );


        if (!botonPago) {
            return;
        }


        botonPago.addEventListener(
            "click",
            async function (evento) {

                evento.preventDefault();


                /* Validar productos */

                if (!validarProductos()) {
                    return;
                }


                /* Validar formulario */

                if (!validarFormulario()) {
                    return;
                }


                /* Desactivar botón */

                botonPago.disabled = true;

                botonPago.textContent =
                    "Guardando cotización...";


                try {


                    /* Guardar en Neon */

                    const cotizacion =
                        await guardarCotizacion();


                    /* Guardar código para pago */

                    sessionStorage.setItem(
                        "codigo_cotizacion",
                        cotizacion.codigo_seguimiento
                    );


                    /* Mostrar confirmación */

                    alert(
                        "¡Cotización registrada correctamente!\n\n" +
                        "Código de seguimiento: " +
                        cotizacion.codigo_seguimiento
                    );


                    /* Ir al pago */

                    window.location.href =
                        "pago.html";


                } catch (error) {


                    console.error(error);


                    alert(
                        "No se pudo guardar la cotización.\n\n" +
                        "Verifica la conexión con Neon."
                    );


                    botonPago.disabled = false;

                    botonPago.textContent =
                        "Continuar al pago";

                }

            }
        );

    }
);