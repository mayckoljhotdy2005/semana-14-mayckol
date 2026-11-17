import { sql } from "./neon-config.js";
import { exigirSesion, cerrarSesion } from "./auth.js";

/* =========================================================
   SESIÓN Y PERMISOS
========================================================= */

const usuario = exigirSesion();

if (!usuario) {
    throw new Error("No hay una sesión activa.");
}

if (
    usuario.rol !== "administrador" &&
    usuario.rol !== "empleado"
) {
    alert("No tienes permisos para acceder al panel.");
    window.location.href = "cotizacion.html";
    throw new Error("Usuario sin permisos.");
}


/* =========================================================
   ELEMENTOS DEL HTML
========================================================= */

const nombreUsuario = document.getElementById("nombre-usuario");
const rolUsuario = document.getElementById("rol-usuario");

const tablaCotizaciones =
    document.getElementById("tabla-cotizaciones");

const mensajePanel =
    document.getElementById("mensaje-panel");

const totalCotizaciones =
    document.getElementById("total-cotizaciones");

const totalRegistradas =
    document.getElementById("total-registradas");

const totalProceso =
    document.getElementById("total-proceso");

const totalFinalizadas =
    document.getElementById("total-finalizadas");

const buscarCotizacion =
    document.getElementById("buscar-cotizacion");

const filtroEstado =
    document.getElementById("filtro-estado");

const btnRecargar =
    document.getElementById("btn-recargar");

const btnCerrarSesion =
    document.getElementById("btn-cerrar-sesion");

const btnNuevaCotizacion =
    document.getElementById("btn-nueva-cotizacion");

const modal =
    document.getElementById("modal-cotizacion");

const btnCerrarModal =
    document.getElementById("btn-cerrar-modal");

const btnCancelarModal =
    document.getElementById("btn-cancelar-modal");

const formulario =
    document.getElementById("form-cotizacion");

const tituloModal =
    document.getElementById("titulo-modal");

const mensajeFormulario =
    document.getElementById("mensaje-formulario");

const btnGuardar =
    document.getElementById("btn-guardar");


/* =========================================================
   CAMPOS DEL FORMULARIO
========================================================= */

const campoId =
    document.getElementById("cotizacion-id");

const campoCodigo =
    document.getElementById("codigo");

const campoNombre =
    document.getElementById("nombre");

const campoTelefono =
    document.getElementById("telefono");

const campoCorreo =
    document.getElementById("correo");

const campoDireccion =
    document.getElementById("direccion");

const campoCantidad =
    document.getElementById("cantidad-estimada");

const campoEntrega =
    document.getElementById("entrega");

const campoEstado =
    document.getElementById("estado");

const campoMateriales =
    document.getElementById("materiales");

const campoObservaciones =
    document.getElementById("observaciones");


/* =========================================================
   VARIABLES
========================================================= */

let cotizaciones = [];


/* =========================================================
   MOSTRAR USUARIO
========================================================= */

function mostrarUsuario() {

    if (nombreUsuario) {
        nombreUsuario.textContent =
            usuario.nombre || "Usuario";
    }

    if (rolUsuario) {

        if (usuario.rol === "administrador") {
            rolUsuario.textContent = "Administrador";
        } else {
            rolUsuario.textContent = "Empleado";
        }

    }
}


/* =========================================================
   MENSAJES
========================================================= */

function mostrarMensaje(texto, tipo = "") {

    if (!mensajePanel) return;

    mensajePanel.textContent = texto;
    mensajePanel.className = `mensaje ${tipo}`;

    if (texto) {

        setTimeout(function () {

            if (mensajePanel.textContent === texto) {
                mensajePanel.textContent = "";
                mensajePanel.className = "mensaje";
            }

        }, 4000);

    }
}


function mostrarMensajeFormulario(texto, tipo = "") {

    if (!mensajeFormulario) return;

    mensajeFormulario.textContent = texto;
    mensajeFormulario.className =
        `mensaje ${tipo}`;
}


/* =========================================================
   FORMATO DE FECHA
========================================================= */

function formatoFecha(fecha) {

    if (!fecha) return "-";

    const fechaObjeto = new Date(fecha);

    if (Number.isNaN(fechaObjeto.getTime())) {
        return fecha;
    }

    return fechaObjeto.toLocaleDateString(
        "es-PE",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


/* =========================================================
   CLASE DEL ESTADO
========================================================= */

function claseEstado(estado) {

    const estadoNormalizado =
        String(estado || "")
            .toLowerCase()
            .trim();

    if (estadoNormalizado === "registrado") {
        return "estado-registrado";
    }

    if (estadoNormalizado === "en proceso") {
        return "estado-proceso";
    }

    if (estadoNormalizado === "finalizado") {
        return "estado-finalizado";
    }

    if (estadoNormalizado === "cancelado") {
        return "estado-cancelado";
    }

    return "";
}


/* =========================================================
   CARGAR COTIZACIONES
========================================================= */

async function cargarCotizaciones() {

    if (!tablaCotizaciones) return;

    tablaCotizaciones.innerHTML = `
        <tr>
            <td colspan="11" class="cargando">
                Cargando cotizaciones...
            </td>
        </tr>
    `;

    try {

        const resultado = await sql`
            SELECT
                id,
                codigo_seguimiento,
                nombre_cliente,
                telefono,
                correo,
                direccion,
                materiales,
                cantidad_estimada,
                entrega,
                observaciones,
                estado,
                fecha_registro,
                id_usuario
            FROM cotizaciones_obra
            ORDER BY fecha_registro DESC;
        `;

        cotizaciones = resultado;

        actualizarEstadisticas();

        mostrarCotizaciones();

    } catch (error) {

        console.error(
            "Error al cargar cotizaciones:",
            error
        );

        tablaCotizaciones.innerHTML = `
            <tr>
                <td colspan="11" class="error-tabla">
                    No se pudieron cargar las cotizaciones.
                </td>
            </tr>
        `;

        mostrarMensaje(
            "No se pudieron cargar las cotizaciones.",
            "error"
        );
    }
}


/* =========================================================
   MOSTRAR COTIZACIONES
========================================================= */

function mostrarCotizaciones() {

    if (!tablaCotizaciones) return;

    const textoBusqueda =
        (buscarCotizacion?.value || "")
            .toLowerCase()
            .trim();

    const estadoSeleccionado =
        (filtroEstado?.value || "")
            .toLowerCase()
            .trim();


    const filtradas =
        cotizaciones.filter(function (cotizacion) {

            const codigo =
                String(
                    cotizacion.codigo_seguimiento || ""
                ).toLowerCase();

            const nombre =
                String(
                    cotizacion.nombre_cliente || ""
                ).toLowerCase();

            const correo =
                String(
                    cotizacion.correo || ""
                ).toLowerCase();

            const estado =
                String(
                    cotizacion.estado || ""
                ).toLowerCase().trim();


            const coincideBusqueda =
                !textoBusqueda ||
                codigo.includes(textoBusqueda) ||
                nombre.includes(textoBusqueda) ||
                correo.includes(textoBusqueda);

            const coincideEstado =
                !estadoSeleccionado ||
                estado === estadoSeleccionado;

            return (
                coincideBusqueda &&
                coincideEstado
            );

        });


    if (filtradas.length === 0) {

        tablaCotizaciones.innerHTML = `
            <tr>
                <td colspan="11" class="sin-resultados">
                    No se encontraron cotizaciones.
                </td>
            </tr>
        `;

        return;
    }


    tablaCotizaciones.innerHTML =
        filtradas.map(function (cotizacion) {

            const estado =
                cotizacion.estado || "registrado";

            const entrega =
                cotizacion.entrega || "-";

            return `
                <tr>

                    <td>
                        ${cotizacion.id}
                    </td>

                    <td>
                        <strong>
                            ${escaparHTML(
                                cotizacion.codigo_seguimiento
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escaparHTML(
                            cotizacion.nombre_cliente
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            cotizacion.telefono || "-"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            cotizacion.correo || "-"
                        )}
                    </td>

                    <td class="celda-materiales">
                        ${escaparHTML(
                            cotizacion.materiales || "-"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            cotizacion.cantidad_estimada || "-"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(entrega)}
                    </td>

                    <td>
                        <span class="estado ${claseEstado(estado)}">
                            ${escaparHTML(estado)}
                        </span>
                    </td>

                    <td>
                        ${formatoFecha(
                            cotizacion.fecha_registro
                        )}
                    </td>

                    <td>

                        <div class="acciones-tabla">

                            <button
                                class="btn-editar"
                                data-id="${cotizacion.id}">
                                Editar
                            </button>

                            <button
                                class="btn-eliminar"
                                data-id="${cotizacion.id}">
                                Eliminar
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");


    agregarEventosAcciones();

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   ESTADÍSTICAS
========================================================= */

function actualizarEstadisticas() {

    if (totalCotizaciones) {
        totalCotizaciones.textContent =
            cotizaciones.length;
    }


    const registradas =
        cotizaciones.filter(function (cotizacion) {

            return String(cotizacion.estado || "")
                .toLowerCase()
                .trim() === "registrado";

        }).length;


    const proceso =
        cotizaciones.filter(function (cotizacion) {

            return String(cotizacion.estado || "")
                .toLowerCase()
                .trim() === "en proceso";

        }).length;


    const finalizadas =
        cotizaciones.filter(function (cotizacion) {

            return String(cotizacion.estado || "")
                .toLowerCase()
                .trim() === "finalizado";

        }).length;


    if (totalRegistradas) {
        totalRegistradas.textContent =
            registradas;
    }

    if (totalProceso) {
        totalProceso.textContent =
            proceso;
    }

    if (totalFinalizadas) {
        totalFinalizadas.textContent =
            finalizadas;
    }
}


/* =========================================================
   EVENTOS DE EDITAR Y ELIMINAR
========================================================= */

function agregarEventosAcciones() {

    const botonesEditar =
        document.querySelectorAll(".btn-editar");

    const botonesEliminar =
        document.querySelectorAll(".btn-eliminar");


    botonesEditar.forEach(function (boton) {

        boton.addEventListener(
            "click",
            function () {

                const id =
                    Number(boton.dataset.id);

                abrirModalEditar(id);

            }
        );

    });


    botonesEliminar.forEach(function (boton) {

        boton.addEventListener(
            "click",
            function () {

                const id =
                    Number(boton.dataset.id);

                eliminarCotizacion(id);

            }
        );

    });
}


/* =========================================================
   ABRIR MODAL NUEVO
========================================================= */

function abrirModalNuevo() {

    if (!modal) return;

    formulario?.reset();

    campoId.value = "";

    tituloModal.textContent =
        "Nueva cotización";

    btnGuardar.textContent =
        "Guardar cotización";

    campoEstado.value =
        "registrado";

    mostrarMensajeFormulario("");

    modal.classList.remove("oculto");
}


/* =========================================================
   ABRIR MODAL EDITAR
========================================================= */

function abrirModalEditar(id) {

    const cotizacion =
        cotizaciones.find(function (item) {

            return Number(item.id) === Number(id);

        });


    if (!cotizacion) {

        mostrarMensaje(
            "No se encontró la cotización.",
            "error"
        );

        return;
    }


    campoId.value =
        cotizacion.id;

    campoCodigo.value =
        cotizacion.codigo_seguimiento || "";

    campoNombre.value =
        cotizacion.nombre_cliente || "";

    campoTelefono.value =
        cotizacion.telefono || "";

    campoCorreo.value =
        cotizacion.correo || "";

    campoDireccion.value =
        cotizacion.direccion || "";

    campoCantidad.value =
        cotizacion.cantidad_estimada || "";

    campoEntrega.value =
        cotizacion.entrega || "";

    campoEstado.value =
        cotizacion.estado || "registrado";

    campoMateriales.value =
        cotizacion.materiales || "";

    campoObservaciones.value =
        cotizacion.observaciones || "";


    tituloModal.textContent =
        "Editar cotización";

    btnGuardar.textContent =
        "Guardar cambios";

    mostrarMensajeFormulario("");

    modal.classList.remove("oculto");
}


/* =========================================================
   CERRAR MODAL
========================================================= */

function cerrarModal() {

    if (!modal) return;

    modal.classList.add("oculto");

    formulario?.reset();

    campoId.value = "";

    mostrarMensajeFormulario("");
}


/* =========================================================
   VALIDAR FORMULARIO
========================================================= */

function validarFormulario() {

    if (!campoCodigo.value.trim()) {

        mostrarMensajeFormulario(
            "Ingresa el código de seguimiento.",
            "error"
        );

        campoCodigo.focus();

        return false;
    }


    if (!campoNombre.value.trim()) {

        mostrarMensajeFormulario(
            "Ingresa el nombre del cliente.",
            "error"
        );

        campoNombre.focus();

        return false;
    }


    if (!campoTelefono.value.trim()) {

        mostrarMensajeFormulario(
            "Ingresa el teléfono.",
            "error"
        );

        campoTelefono.focus();

        return false;
    }


    if (!campoCorreo.value.trim()) {

        mostrarMensajeFormulario(
            "Ingresa el correo.",
            "error"
        );

        campoCorreo.focus();

        return false;
    }


    if (!campoMateriales.value.trim()) {

        mostrarMensajeFormulario(
            "Ingresa los materiales.",
            "error"
        );

        campoMateriales.focus();

        return false;
    }


    if (!campoCantidad.value.trim()) {

        mostrarMensajeFormulario(
            "Ingresa la cantidad estimada.",
            "error"
        );

        campoCantidad.focus();

        return false;
    }


    if (!campoEntrega.value) {

        mostrarMensajeFormulario(
            "Selecciona el tipo de entrega.",
            "error"
        );

        campoEntrega.focus();

        return false;
    }


    if (!campoEstado.value) {

        mostrarMensajeFormulario(
            "Selecciona el estado.",
            "error"
        );

        campoEstado.focus();

        return false;
    }


    return true;
}


/* =========================================================
   GUARDAR COTIZACIÓN
========================================================= */

async function guardarCotizacion() {

    if (!validarFormulario()) {
        return;
    }


    const id =
        campoId.value.trim();


    btnGuardar.disabled = true;

    btnGuardar.textContent =
        id
            ? "Guardando cambios..."
            : "Guardando...";


    try {

        let resultado;


        /* ============================
           EDITAR
        ============================ */

        if (id) {

            resultado = await sql`
                UPDATE cotizaciones_obra

                SET
                    codigo_seguimiento =
                        ${campoCodigo.value.trim()},

                    nombre_cliente =
                        ${campoNombre.value.trim()},

                    telefono =
                        ${campoTelefono.value.trim()},

                    correo =
                        ${campoCorreo.value.trim().toLowerCase()},

                    direccion =
                        ${campoDireccion.value.trim()},

                    materiales =
                        ${campoMateriales.value.trim()},

                    cantidad_estimada =
                        ${campoCantidad.value.trim()},

                    entrega =
                        ${campoEntrega.value},

                    observaciones =
                        ${campoObservaciones.value.trim()},

                    estado =
                        ${campoEstado.value}

                WHERE id = ${id}

                RETURNING *;
            `;


            if (resultado.length === 0) {

                throw new Error(
                    "No se encontró la cotización."
                );
            }


            mostrarMensaje(
                "Cotización actualizada correctamente.",
                "correcto"
            );

        }


        /* ============================
           CREAR
        ============================ */

        else {

            resultado = await sql`
                INSERT INTO cotizaciones_obra
                (
                    codigo_seguimiento,
                    nombre_cliente,
                    telefono,
                    correo,
                    direccion,
                    materiales,
                    cantidad_estimada,
                    entrega,
                    observaciones,
                    estado,
                    id_usuario
                )

                VALUES
                (
                    ${campoCodigo.value.trim()},
                    ${campoNombre.value.trim()},
                    ${campoTelefono.value.trim()},
                    ${campoCorreo.value.trim().toLowerCase()},
                    ${campoDireccion.value.trim()},
                    ${campoMateriales.value.trim()},
                    ${campoCantidad.value.trim()},
                    ${campoEntrega.value},
                    ${campoObservaciones.value.trim()},
                    ${campoEstado.value},
                    ${usuario.id}
                )

                RETURNING *;
            `;


            if (resultado.length === 0) {

                throw new Error(
                    "No se pudo crear la cotización."
                );
            }


            mostrarMensaje(
                "Cotización creada correctamente.",
                "correcto"
            );
        }


        cerrarModal();

        await cargarCotizaciones();


    } catch (error) {

        console.error(
            "Error al guardar:",
            error
        );

        mostrarMensajeFormulario(
            "No se pudo guardar la cotización. Verifica la conexión con Neon.",
            "error"
        );

    } finally {

        btnGuardar.disabled = false;

        btnGuardar.textContent =
            campoId.value
                ? "Guardar cambios"
                : "Guardar cotización";
    }
}


/* =========================================================
   ELIMINAR COTIZACIÓN
========================================================= */

async function eliminarCotizacion(id) {

    const cotizacion =
        cotizaciones.find(function (item) {

            return Number(item.id) === Number(id);

        });


    if (!cotizacion) {

        mostrarMensaje(
            "No se encontró la cotización.",
            "error"
        );

        return;
    }


    const confirmar =
        confirm(
            "¿Estás seguro de eliminar esta cotización?\n\n" +
            "Código: " +
            cotizacion.codigo_seguimiento +
            "\n" +
            "Cliente: " +
            cotizacion.nombre_cliente +
            "\n\n" +
            "Esta acción no se puede deshacer."
        );


    if (!confirmar) {
        return;
    }


    try {

        const resultado = await sql`
            DELETE FROM cotizaciones_obra

            WHERE id = ${id}

            RETURNING id;
        `;


        if (resultado.length === 0) {

            throw new Error(
                "No se pudo eliminar la cotización."
            );
        }


        mostrarMensaje(
            "Cotización eliminada correctamente.",
            "correcto"
        );


        await cargarCotizaciones();


    } catch (error) {

        console.error(
            "Error al eliminar:",
            error
        );

        mostrarMensaje(
            "No se pudo eliminar la cotización.",
            "error"
        );
    }
}


/* =========================================================
   CERRAR SESIÓN
========================================================= */

if (btnCerrarSesion) {

    btnCerrarSesion.addEventListener(
        "click",
        function () {

            const confirmar =
                confirm(
                    "¿Deseas cerrar sesión?"
                );

            if (!confirmar) return;

            cerrarSesion();

            window.location.href =
                "login.html";
        }
    );
}


/* =========================================================
   BOTÓN NUEVA COTIZACIÓN
========================================================= */

if (btnNuevaCotizacion) {

    btnNuevaCotizacion.addEventListener(
        "click",
        abrirModalNuevo
    );
}


/* =========================================================
   BOTONES DEL MODAL
========================================================= */

if (btnCerrarModal) {

    btnCerrarModal.addEventListener(
        "click",
        cerrarModal
    );
}


if (btnCancelarModal) {

    btnCancelarModal.addEventListener(
        "click",
        cerrarModal
    );
}


/* =========================================================
   CERRAR MODAL AL HACER CLICK AFUERA
========================================================= */

if (modal) {

    modal.addEventListener(
        "click",
        function (evento) {

            if (evento.target === modal) {
                cerrarModal();
            }

        }
    );
}


/* =========================================================
   FORMULARIO
========================================================= */

if (formulario) {

    formulario.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();

            guardarCotizacion();

        }
    );
}


/* =========================================================
   BUSCADOR
========================================================= */

if (buscarCotizacion) {

    buscarCotizacion.addEventListener(
        "input",
        mostrarCotizaciones
    );
}


/* =========================================================
   FILTRO DE ESTADO
========================================================= */

if (filtroEstado) {

    filtroEstado.addEventListener(
        "change",
        mostrarCotizaciones
    );
}


/* =========================================================
   RECARGAR
========================================================= */

if (btnRecargar) {

    btnRecargar.addEventListener(
        "click",
        cargarCotizaciones
    );
}


/* =========================================================
   INICIAR PANEL
========================================================= */

mostrarUsuario();

cargarCotizaciones();