import { sql } from "./neon-config.js";


/* =====================================================
   REGISTRAR USUARIO
===================================================== */

export async function registrarUsuario(
    nombre,
    correo,
    contrasena
) {

    const resultado = await sql`

        INSERT INTO usuarios
        (
            nombre,
            correo,
            contrasena,
            rol
        )

        VALUES
        (
            ${nombre},
            ${correo},
            ${contrasena},
            'cliente'
        )

        RETURNING id, nombre, correo, rol;

    `;

    return resultado[0];
}


/* =====================================================
   INICIAR SESIÓN
===================================================== */

export async function iniciarSesion(
    correo,
    contrasena
) {

    const filas = await sql`

        SELECT
            id,
            nombre,
            correo,
            rol

        FROM usuarios

        WHERE correo = ${correo}
        AND contrasena = ${contrasena};

    `;


    if (filas.length === 0) {

        return null;

    }


    const usuario = filas[0];


    sessionStorage.setItem(
        "usuario",
        JSON.stringify(usuario)
    );


    return usuario;
}


/* =====================================================
   CERRAR SESIÓN
===================================================== */

export function cerrarSesion() {

    sessionStorage.removeItem(
        "usuario"
    );

}


/* =====================================================
   OBTENER USUARIO
===================================================== */

export function obtenerUsuario() {

    const usuario =
        sessionStorage.getItem(
            "usuario"
        );


    if (!usuario) {

        return null;

    }


    return JSON.parse(usuario);

}


/* =====================================================
   EXIGIR SESIÓN
===================================================== */

export function exigirSesion() {

    const usuario = obtenerUsuario();


    if (!usuario) {

        window.location.href = "login.html";

        return null;

    }


    return usuario;

}