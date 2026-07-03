// ========== Login ==========

function initLogin() {
    const formulario = document.getElementById("form-login");
    const alerta = document.getElementById("alert-login");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();
        ocultarAlerta(alerta);

        const email = document.getElementById("login-email");
        const contraseña = document.getElementById("login-contraseña");
        const errores = [];

        limpiarValidacionGrupo(email.parentElement);
        limpiarValidacionGrupo(contraseña.parentElement);

        if (email.value.trim() === "" || !esEmailValido(email.value)) {
            errores.push("Ingresá un email válido.");
            marcarGrupoError(email.parentElement);
        } else {
            marcarGrupoValido(email.parentElement);
        }

        if (contraseña.value.trim().length < 6 && contraseña.value.trim() !== "") {
            errores.push("La contraseña es obligatoria (mínimo 6 caracteres).");
            marcarGrupoError(contraseña.parentElement);
        } else {
            marcarGrupoValido(contraseña.parentElement);
        }

        if (errores.length > 0) {
            mostrarAlerta(alerta, errores.join(" "), "aviso");
            return;
        }

        const usuarios = obtenerUsuarios();
        let usuarioEncontrado = null;
        let i;

        for (i = 0; i < usuarios.length; i++) {
            if (
                usuarios[i].email === email.value.trim().toLowerCase() &&
                usuarios[i].contraseña === contraseña.value
            ) {
                usuarioEncontrado = usuarios[i];
                break;
            }
        }

        if (!usuarioEncontrado) {
            mostrarAlerta(alerta, "Email o contraseña incorrectos.", "aviso");
            marcarGrupoError(email.parentElement);
            marcarGrupoError(contraseña.parentElement);
            return;
        }

        guardarSesion({
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre,
            email: usuarioEncontrado.email,
            tipo: usuarioEncontrado.tipo || "jugador"
        });

        mostrarAlerta(alerta, "Ingreso exitoso. Redirigiendo...", "exito");
        setTimeout(function () {
            if (usuarioEncontrado.tipo === "club") {
                window.location.href = "panel-club.html";
            } else {
                window.location.href = "mis-reservas.html";
            }
        }, 1000);
    });
}
