import { sql } from "./neon-config.js";
import { exigirSesion } from "./auth.js";


/* =====================================================
   OBTENER USUARIO
===================================================== */

const usuario = exigirSesion();

if (!usuario) {
    throw new Error("No hay una sesión activa.");
}


/* =====================================================
   OBTENER ID DE LA COTIZACIÓN DESDE LA URL
===================================================== */

const parametros =
    new URLSearchParams(window.location.search);

const idCotizacion =
    parametros.get("id");


/* =====================================================
   ELEMENTOS DEL HTML
===================================================== */

const codigo =
    document.getElementById("codigo");

const nombre =
    document.getElementById("nombre");

const telefono =
    document.getElementById("telefono");

const correo =
    document.getElementById("correo");

const direccion =
    document.getElementById("direccion");

const cantidadEstimada =
    document.getElementById("cantidad-estimada");

const entrega =
    document.getElementById("entrega");

const observaciones =
    document.getElementById("observaciones");

const estado =
    document.getElementById("estado");

const mensaje =
    document.getElementById("mensaje-actualizar");

const botonGuardar =
    document.getElementById("btn-guardar");


/* =====================================================
   MOSTRAR MENSAJE
===================================================== */

function mostrarMensaje(texto, tipo) {

    if (!mensaje) {
        return;
    }

    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;

}


/* =====================================================
   CARGAR COTIZACIÓN
===================================================== */

async function cargarCotizacion() {

    if (!idCotizacion) {

        mostrarMensaje(
            "No se encontró el ID de la cotización.",
            "error"
        );

        if (botonGuardar) {
            botonGuardar.disabled = true;
        }

        return;
    }


    try {

        mostrarMensaje(
            "Cargando cotización...",
            ""
        );


        /*
         * IMPORTANTE:
         * Se busca por ID Y por id_usuario.
         * De esta manera el cliente solamente puede
         * acceder a sus propias cotizaciones.
         */

        const resultado = await sql`

            SELECT
                id,
                codigo_seguimiento,
                nombre_cliente,
                telefono,
                correo,
                direccion,
                cantidad_estimada,
                materiales,
                entrega,
                observaciones,
                estado,
                fecha_registro,
                id_usuario

            FROM cotizaciones_obra

            WHERE id = ${idCotizacion}
            AND id_usuario = ${usuario.id}

            LIMIT 1;

        `;


        if (resultado.length === 0) {

            mostrarMensaje(
                "No puedes acceder a esta cotización.",
                "error"
            );

            if (botonGuardar) {
                botonGuardar.disabled = true;
            }

            return;
        }


        const cotizacion =
            resultado[0];


        /*
         * Solo se permite actualizar cuando
         * el estado es registrado.
         */

        if (
            String(cotizacion.estado)
                .toLowerCase()
                .trim() !== "registrado"
        ) {

            mostrarMensaje(
                "Esta cotización ya no puede ser modificada porque su estado no es registrado.",
                "error"
            );

            if (botonGuardar) {
                botonGuardar.disabled = true;
            }

        }


        /* =============================================
           MOSTRAR DATOS
        ============================================= */

        if (codigo) {
            codigo.value =
                cotizacion.codigo_seguimiento || "";
        }


        if (nombre) {
            nombre.value =
                cotizacion.nombre_cliente || "";
        }


        if (telefono) {
            telefono.value =
                cotizacion.telefono || "";
        }


        if (correo) {
            correo.value =
                cotizacion.correo || "";
        }


        if (direccion) {
            direccion.value =
                cotizacion.direccion || "";
        }


        if (cantidadEstimada) {
            cantidadEstimada.value =
                cotizacion.cantidad_estimada || "";
        }


        if (entrega) {
            entrega.value =
                cotizacion.entrega || "";
        }


        if (observaciones) {
            observaciones.value =
                cotizacion.observaciones || "";
        }


        if (estado) {
            estado.value =
                cotizacion.estado || "";
        }


        /*
         * Si llegó correctamente y está registrada,
         * limpiamos el mensaje.
         */

        if (
            String(cotizacion.estado)
                .toLowerCase()
                .trim() === "registrado"
        ) {

            mostrarMensaje(
                "Puedes modificar los datos de esta cotización.",
                "correcto"
            );

        }


    } catch (error) {

        console.error(
            "Error al cargar la cotización:",
            error
        );


        mostrarMensaje(
            "No se pudo cargar la cotización.",
            "error"
        );

    }

}


/* =====================================================
   GUARDAR CAMBIOS
===================================================== */

if (botonGuardar) {

    botonGuardar.addEventListener(
        "click",
        async function () {

            /*
             * Validación básica
             */

            if (!idCotizacion) {

                mostrarMensaje(
                    "No se encontró la cotización.",
                    "error"
                );

                return;
            }


            if (!nombre.value.trim()) {

                mostrarMensaje(
                    "Ingresa el nombre completo.",
                    "error"
                );

                nombre.focus();

                return;
            }


            if (!telefono.value.trim()) {

                mostrarMensaje(
                    "Ingresa el teléfono.",
                    "error"
                );

                telefono.focus();

                return;
            }


            if (!correo.value.trim()) {

                mostrarMensaje(
                    "Ingresa el correo electrónico.",
                    "error"
                );

                correo.focus();

                return;
            }


            if (!cantidadEstimada.value.trim()) {

                mostrarMensaje(
                    "Ingresa la cantidad estimada.",
                    "error"
                );

                cantidadEstimada.focus();

                return;
            }


            if (!entrega.value) {

                mostrarMensaje(
                    "Selecciona el tipo de entrega.",
                    "error"
                );

                entrega.focus();

                return;
            }


            /*
             * Confirmación
             */

            const confirmar =
                confirm(
                    "¿Estás seguro de guardar los cambios de esta cotización?"
                );


            if (!confirmar) {
                return;
            }


            botonGuardar.disabled = true;

            botonGuardar.textContent =
                "Guardando...";


            try {

                /*
                 * UPDATE protegido:
                 *
                 * 1. id de la cotización
                 * 2. id_usuario del usuario conectado
                 * 3. estado = registrado
                 *
                 * Así el cliente no puede modificar
                 * otra cotización ni una cotización
                 * que ya cambió de estado.
                 */

                const resultado = await sql`

                    UPDATE cotizaciones_obra

                    SET
                        nombre_cliente = ${nombre.value.trim()},
                        telefono = ${telefono.value.trim()},
                        correo = ${correo.value.trim()},
                        direccion = ${direccion.value.trim()},
                        cantidad_estimada = ${cantidadEstimada.value.trim()},
                        entrega = ${entrega.value},
                        observaciones = ${observaciones.value.trim()}

                    WHERE id = ${idCotizacion}
                    AND id_usuario = ${usuario.id}
                    AND estado = 'registrado'

                    RETURNING
                        id,
                        codigo_seguimiento,
                        estado;

                `;


                /*
                 * Si no se actualizó ningún registro,
                 * significa que la cotización no pertenece
                 * al usuario o ya no está registrada.
                 */

                if (resultado.length === 0) {

                    mostrarMensaje(
                        "No se pudo actualizar. Verifica que la cotización pertenezca a tu cuenta y que su estado sea registrado.",
                        "error"
                    );

                    return;
                }


                /*
                 * Actualización correcta
                 */

                mostrarMensaje(
                    "¡Cotización actualizada correctamente!",
                    "correcto"
                );


                botonGuardar.textContent =
                    "Guardado correctamente";


                /*
                 * Después de un momento volvemos
                 * a Mis cotizaciones.
                 */

                setTimeout(
                    function () {

                        window.location.href =
                            "consulta.html";

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "Error al actualizar cotización:",
                    error
                );


                mostrarMensaje(
                    "Ocurrió un error al actualizar la cotización.",
                    "error"
                );


                botonGuardar.disabled = false;

                botonGuardar.textContent =
                    "Guardar cambios";

            }

        }
    );

}


/* =====================================================
   INICIAR
===================================================== */

cargarCotizacion();