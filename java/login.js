import {
    registrarUsuario,
    iniciarSesion
} from "./auth.js";


/* =====================================================
   CREAR CUENTA
===================================================== */

const formularioRegistro =
    document.getElementById(
        "form-registro"
    );


if (formularioRegistro) {

    formularioRegistro.addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();


            const nombre =
                document
                    .getElementById(
                        "registro-nombre"
                    )
                    .value
                    .trim();


            const correo =
                document
                    .getElementById(
                        "registro-correo"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            const contrasena =
                document
                    .getElementById(
                        "registro-contrasena"
                    )
                    .value;


            const mensaje =
                document.getElementById(
                    "mensaje-registro"
                );


            if (!nombre) {

                mensaje.textContent =
                    "Ingresa tu nombre completo.";

                mensaje.className =
                    "mensaje error";

                return;

            }


            if (!correo) {

                mensaje.textContent =
                    "Ingresa un correo electrónico.";

                mensaje.className =
                    "mensaje error";

                return;

            }


            if (contrasena.length < 4) {

                mensaje.textContent =
                    "La contraseña debe tener al menos 4 caracteres.";

                mensaje.className =
                    "mensaje error";

                return;

            }


            try {

                await registrarUsuario(
                    nombre,
                    correo,
                    contrasena
                );


                mensaje.textContent =
                    "Cuenta creada correctamente. Ahora puedes iniciar sesión.";

                mensaje.className =
                    "mensaje correcto";


                formularioRegistro.reset();


            } catch (error) {

                console.error(error);


                if (
                    error.message &&
                    error.message
                        .toLowerCase()
                        .includes("duplicate")
                ) {

                    mensaje.textContent =
                        "El correo electrónico ya está registrado.";

                } else {

                    mensaje.textContent =
                        "No se pudo crear la cuenta. Verifica la conexión con Neon.";

                }


                mensaje.className =
                    "mensaje error";

            }

        }
    );

}



/* =====================================================
   INICIAR SESIÓN
===================================================== */

const formularioLogin =
    document.getElementById(
        "form-login"
    );


if (formularioLogin) {

    formularioLogin.addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();


            const correo =
                document
                    .getElementById(
                        "login-correo"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            const contrasena =
                document
                    .getElementById(
                        "login-contrasena"
                    )
                    .value;


            const mensaje =
                document.getElementById(
                    "mensaje-login"
                );


            try {

                const usuario =
                    await iniciarSesion(
                        correo,
                        contrasena
                    );


                if (!usuario) {

                    mensaje.textContent =
                        "Correo o contraseña incorrectos.";

                    mensaje.className =
                        "mensaje error";

                    return;

                }


                mensaje.textContent =
                    `Bienvenido, ${usuario.nombre}.`;

                mensaje.className =
                    "mensaje correcto";


                setTimeout(
                    function () {


                        /* =================================
                           CLIENTE → INICIO
                        ================================= */

                        if (usuario.rol === "cliente") {

                            window.location.href =
                                "../index.html";

                        }


                        /* =================================
                           ADMINISTRADOR → PANEL
                        ================================= */

                        else if (
                            usuario.rol === "administrador"
                        ) {

                            window.location.href =
                                "panel.html";

                        }


                        /* =================================
                           EMPLEADO → PANEL
                        ================================= */

                        else if (
                            usuario.rol === "empleado"
                        ) {

                            window.location.href =
                                "panel.html";

                        }


                    },
                    700
                );


            } catch (error) {

                console.error(error);


                mensaje.textContent =
                    "No se pudo conectar con la base de datos.";

                mensaje.className =
                    "mensaje error";

            }

        }
    );

}