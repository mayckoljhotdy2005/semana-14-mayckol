import { sql } from "./neon-config.js";
import { exigirSesion } from "./auth.js";


/* =====================================================
   ELEMENTOS DEL HTML
===================================================== */

const listaCotizaciones =
    document.getElementById("lista-cotizaciones");

const mensajeConsulta =
    document.getElementById("mensaje-consulta");

const nombreUsuario =
    document.getElementById("nombre-usuario");

const botonActualizar =
    document.getElementById("btn-actualizar");


/* =====================================================
   OBTENER USUARIO
===================================================== */

const usuario = exigirSesion();


/* =====================================================
   MOSTRAR INFORMACIÓN DEL USUARIO
===================================================== */

function mostrarUsuario() {

    if (!usuario) {
        return;
    }

    if (nombreUsuario) {

        nombreUsuario.textContent =
            `Hola, ${usuario.nombre}. Aquí puedes consultar tus cotizaciones.`;

    }
}


/* =====================================================
   FORMATO DE FECHA
===================================================== */

function formatoFecha(fecha) {

    if (!fecha) {
        return "Sin fecha";
    }

    const fechaConvertida =
        new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
        return "Sin fecha";
    }

    return fechaConvertida.toLocaleString(
        "es-PE",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


/* =====================================================
   MOSTRAR COTIZACIONES
===================================================== */

function mostrarCotizaciones(cotizaciones) {

    if (!listaCotizaciones) {
        return;
    }


    if (cotizaciones.length === 0) {

        listaCotizaciones.innerHTML = `

            <div class="sin-cotizaciones">

                <h3>
                    No tienes cotizaciones registradas
                </h3>

                <p>
                    Cuando registres una cotización,
                    aparecerá aquí.
                </p>

                <a href="catalogo.html">
                    Ir al catálogo
                </a>

            </div>

        `;

        return;
    }


    listaCotizaciones.innerHTML =
        cotizaciones.map(cotizacion => {

            const estado =
                String(cotizacion.estado || "")
                    .toLowerCase()
                    .trim();

            const puedeActualizar =
                estado === "registrado";


            return `

                <article class="tarjeta-cotizacion">

                    <div class="cabecera-cotizacion">

                        <div>

                            <span class="etiqueta-codigo">
                                COTIZACIÓN
                            </span>

                            <h3>
                                ${cotizacion.codigo_seguimiento}
                            </h3>

                        </div>

                        <span class="estado estado-${estado.replace(/\s+/g, "-")}">

                            ${cotizacion.estado || "Sin estado"}

                        </span>

                    </div>


                    <div class="datos-cotizacion">

                        <div>

                            <strong>
                                Cliente
                            </strong>

                            <p>
                                ${cotizacion.nombre_cliente || "-"}
                            </p>

                        </div>


                        <div>

                            <strong>
                                Cantidad estimada
                            </strong>

                            <p>
                                ${cotizacion.cantidad_estimada || "-"}
                            </p>

                        </div>


                        <div>

                            <strong>
                                Fecha de registro
                            </strong>

                            <p>
                                ${formatoFecha(
                                    cotizacion.fecha_registro
                                )}
                            </p>

                        </div>

                    </div>


                    <div class="materiales-cotizacion">

                        <strong>
                            Productos / materiales
                        </strong>

                        <p>
                            ${cotizacion.materiales || "Sin información"}
                        </p>

                    </div>


                    <div class="acciones-cotizacion">

                        <button
                            type="button"
                            class="btn-ver-detalle"
                            data-id="${cotizacion.id}"
                        >
                            Ver detalle
                        </button>


                        ${
                            puedeActualizar
                            ?

                            `
                            <button
                                type="button"
                                class="btn-actualizar-cotizacion"
                                data-id="${cotizacion.id}"
                            >
                                Actualizar
                            </button>
                            `

                            :

                            `
                            <button
                                type="button"
                                class="btn-actualizar-cotizacion"
                                disabled
                            >
                                No editable
                            </button>
                            `
                        }

                    </div>

                </article>

            `;

        }).join("");
}


/* =====================================================
   CARGAR COTIZACIONES DEL USUARIO
===================================================== */

async function cargarCotizaciones() {

    if (!usuario) {
        return;
    }


    if (mensajeConsulta) {

        mensajeConsulta.textContent =
            "Cargando tus cotizaciones...";

        mensajeConsulta.className =
            "mensaje";

    }


    try {

        const cotizaciones = await sql`

            SELECT
                id,
                codigo_seguimiento,
                nombre_cliente,
                materiales,
                cantidad_estimada,
                estado,
                fecha_registro,
                id_usuario

            FROM cotizaciones_obra

            WHERE id_usuario = ${usuario.id}

            ORDER BY fecha_registro DESC;

        `;


        console.log(
            "Cotizaciones del usuario:",
            cotizaciones
        );


        mostrarCotizaciones(cotizaciones);


        if (mensajeConsulta) {

            mensajeConsulta.textContent =
                `${cotizaciones.length} cotización(es) encontrada(s).`;

            mensajeConsulta.className =
                "mensaje correcto";

        }


    } catch (error) {

        console.error(
            "Error al consultar cotizaciones:",
            error
        );


        if (mensajeConsulta) {

            mensajeConsulta.textContent =
                "No se pudieron cargar tus cotizaciones.";

            mensajeConsulta.className =
                "mensaje error";

        }

    }
}


/* =====================================================
   VER DETALLE
===================================================== */

document.addEventListener(
    "click",
    function (evento) {

        const boton =
            evento.target.closest(
                ".btn-ver-detalle"
            );


        if (!boton) {
            return;
        }


        const id =
            boton.dataset.id;


        const tarjeta =
            boton.closest(
                ".tarjeta-cotizacion"
            );


        if (!tarjeta) {
            return;
        }


        alert(
            "Cotización ID: " +
            id +
            "\n\n" +
            "Esta cotización pertenece a tu cuenta."
        );

    }
);


/* =====================================================
   ACTUALIZAR COTIZACIÓN
===================================================== */

document.addEventListener(
    "click",
    function (evento) {

        const boton =
            evento.target.closest(
                ".btn-actualizar-cotizacion"
            );


        if (!boton) {
            return;
        }


        if (boton.disabled) {
            return;
        }


        const id =
            boton.dataset.id;


        if (!id) {
            return;
        }


        window.location.href =
            `actualizar.html?id=${id}`;

    }
);


/* =====================================================
   BOTÓN ACTUALIZAR LISTA
===================================================== */

if (botonActualizar) {

    botonActualizar.addEventListener(
        "click",
        async function () {

            botonActualizar.disabled = true;

            botonActualizar.textContent =
                "Actualizando...";


            await cargarCotizaciones();


            botonActualizar.disabled = false;

            botonActualizar.textContent =
                "Actualizar";

        }
    );

}


/* =====================================================
   INICIAR
===================================================== */

mostrarUsuario();

cargarCotizaciones();