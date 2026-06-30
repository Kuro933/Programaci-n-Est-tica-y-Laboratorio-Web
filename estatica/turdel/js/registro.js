// ========== Registro ==========

function actualizarFormularioRegistro() {
    const tipoCuenta = document.getElementById("tipo-cuenta");
    const grupoApellido = document.getElementById("grupo-apellido");
    const apellido = document.getElementById("apellido");
    const labelNombre = document.getElementById("label-nombre");
    const nombre = document.getElementById("nombre");

    if (!tipoCuenta || !grupoApellido) {
        return;
    }

    const esClub = tipoCuenta.value === "club";

    grupoApellido.hidden = esClub;
    grupoApellido.classList.toggle("form-group--oculto", esClub);
    apellido.required = !esClub;
    apellido.disabled = esClub;
    if (esClub) {
        apellido.value = "";
    }

    if (labelNombre) {
        labelNombre.textContent = esClub ? "Nombre del club" : "Nombre";
    }
    if (nombre) {
        nombre.placeholder = esClub ? "Ej: Club Norte" : "Tu nombre";
    }
}

function initRegistro() {
    const formulario = document.getElementById("form-registro");
    const alerta = document.getElementById("alert-registro");
    const tipoCuenta = document.getElementById("tipo-cuenta");

    if (!formulario) {
        return;
    }

    actualizarFormularioRegistro();

    if (tipoCuenta) {
        tipoCuenta.addEventListener("change", actualizarFormularioRegistro);
        tipoCuenta.addEventListener("input", actualizarFormularioRegistro);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("tipo") === "club" && tipoCuenta) {
        tipoCuenta.value = "club";
        actualizarFormularioRegistro();
    }

    formulario.addEventListener("reset", function () {
        setTimeout(actualizarFormularioRegistro, 0);
    });

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();
        ocultarAlerta(alerta);

        const nombre = document.getElementById("nombre");
        const apellido = document.getElementById("apellido");
        const email = document.getElementById("email");
        const telefono = document.getElementById("telefono");
        const contraseña = document.getElementById("contraseña");
        const confirmarContraseña = document.getElementById("confirmar-contraseña");
        const ciudad = document.getElementById("ciudad");
        const tipoCuenta = document.getElementById("tipo-cuenta");
        const grupos = [
            nombre.parentElement,
            apellido.parentElement,
            email.parentElement,
            telefono.parentElement,
            contraseña.parentElement,
            confirmarContraseña.parentElement,
            ciudad.parentElement
        ];
        const errores = [];
        let i;

        for (i = 0; i < grupos.length; i++) {
            limpiarValidacionGrupo(grupos[i]);
        }

        const tipo = tipoCuenta ? tipoCuenta.value : "jugador";

        validarCampoObligatorio(nombre.value, "El nombre es obligatorio.", nombre.parentElement, errores);

        if (tipo !== "club") {
            validarCampoObligatorio(apellido.value, "El apellido es obligatorio.", apellido.parentElement, errores);
        } else {
            limpiarValidacionGrupo(apellido.parentElement);
        }

        validarCampoObligatorio(email.value, "El email es obligatorio.", email.parentElement, errores);
        validarCampoObligatorio(email.value, "Ingresá un email válido.", email.parentElement, errores, esEmailValido);
        
        if (telefono.value.trim() !== "" && telefono.value.trim().length < 6) {
            errores.push("Formato de teléfono inválido.");
            marcarGrupoError(telefono.parentElement);
        } else if (telefono.value.trim() !== "") {
            marcarGrupoValido(telefono.parentElement);
        }

        if (contraseña.value.length < 6) {
            errores.push("La contraseña debe tener al menos 6 caracteres.");
            marcarGrupoError(contraseña.parentElement);
        } else {
            marcarGrupoValido(contraseña.parentElement);
        }

        if (confirmarContraseña.value !== contraseña.value) {
            errores.push("Las contraseñas no coinciden.");
            marcarGrupoError(confirmarContraseña.parentElement);
        } else if (contraseña.value.length >= 6) {
            marcarGrupoValido(confirmarContraseña.parentElement);
        }

        if (ciudad.value === "") {
            errores.push("Seleccioná una ciudad.");
            marcarGrupoError(ciudad.parentElement);
        } else {
            marcarGrupoValido(ciudad.parentElement);
        }

        if (tipo === "club" && nombre.value.trim().length < 3) {
            errores.push("El nombre del club debe tener al menos 3 caracteres.");
            marcarGrupoError(nombre.parentElement);
        }

        const usuarios = obtenerUsuarios();
        for (i = 0; i < usuarios.length; i++) {
            if (usuarios[i].email.toLowerCase() === email.value.trim().toLowerCase()) {
                errores.push("Ya existe una cuenta con ese email.");
                marcarGrupoError(email.parentElement);
                break;
            }
        }

        if (errores.length > 0) {
            mostrarAlerta(alerta, errores.join(" "), "aviso");
            return;
        }

        const nuevoUsuario = {
            id: generarId(),
            nombre: nombre.value.trim(),
            email: email.value.trim().toLowerCase(),
            telefono: telefono.value.trim(),
            contraseña: contraseña.value,
            ciudad: ciudad.value,
            tipo: tipo
        };

        if (tipo !== "club") {
            nuevoUsuario.apellido = apellido.value.trim();
        }

        usuarios.push(nuevoUsuario);
        guardarUsuarios(usuarios);
        guardarSesion({
            id: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            tipo: nuevoUsuario.tipo
        });

        mostrarAlerta(alerta, "Cuenta creada con éxito. Redirigiendo...", "exito");
        setTimeout(function () {
            if (tipo === "club") {
                window.location.href = "panel-club.html";
            } else {
                window.location.href = "reservar.html";
            }
        }, 1200);
    });
}
