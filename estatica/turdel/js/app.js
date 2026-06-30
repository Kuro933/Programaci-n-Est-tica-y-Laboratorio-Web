// ========== Utilidades generales ==========

function esEmailValido(email) {
    const patron = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return patron.test(email.trim());
}

function mostrarAlerta(elemento, mensaje, tipo) {
    if (!elemento) {
        return;
    }
    elemento.textContent = mensaje;
    elemento.className = "alert alert--" + tipo;
    elemento.hidden = false;
}

function ocultarAlerta(elemento) {
    if (elemento) {
        elemento.hidden = true;
    }
}

function sincronizarSesion() {
    const sesion = obtenerSesion();
    if (!sesion) {
        return null;
    }

    const usuario = obtenerUsuarioPorId(sesion.id);
    if (!usuario) {
        return sesion;
    }

    const sesionActualizada = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        tipo: usuario.tipo || "jugador"
    };

    guardarSesion(sesionActualizada);
    return sesionActualizada;
}

function requerirSesion() {
    sincronizarSesion();
    const sesion = obtenerSesion();
    if (!sesion) {
        alert("Debés iniciar sesión para acceder a esta sección.");
        window.location.href = "login.html";
        return null;
    }
    return sesion;
}

function esSesionClub(sesion) {
    if (!sesion) {
        return false;
    }
    if (sesion.tipo === "club") {
        return true;
    }
    const usuario = obtenerUsuarioPorId(sesion.id);
    return usuario && usuario.tipo === "club";
}

function requerirSesionClub() {
    const sesion = requerirSesion();
    if (!sesion) {
        return null;
    }
    if (!esSesionClub(sesion)) {
        alert("Esta sección es solo para clubes registrados.");
        window.location.href = "index.html";
        return null;
    }
    return sesion;
}

function redirigirClubSiCorresponde() {
    sincronizarSesion();
    const sesion = obtenerSesion();
    if (esSesionClub(sesion)) {
        window.location.href = "panel-club.html";
        return true;
    }
    return false;
}

function actualizarNavegacion() {
    sincronizarSesion();
    const sesion = obtenerSesion();
    const nav = document.querySelector(".nav");
    if (!nav) {
        return;
    }

    const linkLogin = nav.querySelector(".nav__login");
    const linkRegistro = nav.querySelector(".nav__registro");
    const linkPanelClub = nav.querySelector(".nav__club");
    const linkReservar = nav.querySelector(".nav__jugador.nav__reservar");
    const linksJugador = document.querySelectorAll(".nav__jugador, .enlace-jugador");
    const enlacesReservar = document.querySelectorAll('a[href="reservar.html"], a[href^="reservar.html?"]');
    const esClub = esSesionClub(sesion);
    let i;

    for (i = 0; i < linksJugador.length; i++) {
        linksJugador[i].hidden = esClub;
        linksJugador[i].classList.toggle("nav--oculto", esClub);
    }

    for (i = 0; i < enlacesReservar.length; i++) {
        enlacesReservar[i].hidden = esClub;
        enlacesReservar[i].classList.toggle("nav--oculto", esClub);
    }

    if (linkPanelClub) {
        linkPanelClub.hidden = !esClub;
        linkPanelClub.classList.toggle("nav--oculto", !esClub);
    }

    if (sesion) {    
        if (linkLogin) {
            linkLogin.textContent = sesion.nombre + " (Salir)";
            linkLogin.href = "#";
            linkLogin.onclick = function (event) {
                event.preventDefault();
                guardarSesion(null);
                window.location.href = "index.html";
            };
        }

        if (linkRegistro) {
            if (esClub) {
                linkRegistro.hidden = true;
                linkRegistro.classList.add("nav--oculto");
            } else {
                linkRegistro.hidden = false;
                linkRegistro.classList.remove("nav--oculto");
                linkRegistro.textContent = "Mi cuenta";
                linkRegistro.href = "mis-reservas.html";
                linkRegistro.classList.remove("nav__cta");
                linkRegistro.classList.add("nav_link");
            }
        }
    } else {
        if (linkLogin) {
            linkLogin.textContent = "Ingresar";
            linkLogin.href = "login.html";
            linkLogin.onclick = null;
        }

        if (linkRegistro) {
            linkRegistro.hidden = false;
            linkRegistro.classList.remove("nav--oculto");
            linkRegistro.textContent = "Registrarse";
            linkRegistro.href = "registro.html";
            linkRegistro.classList.add("nav__cta");
            linkRegistro.classList.remove("nav_link");
        }
    }
}

function poblarSelectCanchas(select, valorSeleccionado) {
    if (!select) {
        return;
    }

    const canchas = obtenerCanchas();
    const valorActual = valorSeleccionado || select.value;
    let i;

    select.innerHTML = "";

    for (i = 0; i < canchas.length; i++) {
        const opcion = document.createElement("option");
        const cancha = canchas[i];
        const tipoLabel = cancha.tipo === "techada" ? "Techada" : "Abierta";
        opcion.value = cancha.id;
        opcion.textContent = cancha.nombre + " (" + tipoLabel + ")";
        select.appendChild(opcion);
    }

    if (valorActual) {
        select.value = valorActual;
    }
}

// ========== Validación de formularios ==========

function limpiarValidacionGrupo(grupo) {
    grupo.classList.remove("form-group--error");
    grupo.classList.remove("form-group--valid");
}

function marcarGrupoError(grupo) {
    grupo.classList.add("form-group--error");
    grupo.classList.remove("form-group--valid");
}

function marcarGrupoValido(grupo) {
    grupo.classList.add("form-group--valid");
    grupo.classList.remove("form-group--error");
}

function validarCampoObligatorio(valor, mensaje, grupo, errores, funcionValidacion) {
    if (valor.trim() === "") {
        errores.push(mensaje);
        marcarGrupoError(grupo);
    } else if (funcionValidacion && !funcionValidacion(valor)) {
        errores.push(mensaje);
        marcarGrupoError(grupo);
    } else {
        marcarGrupoValido(grupo);
    }
}

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

        if (contraseña.value.length < 6) {
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

// ========== Canchas y filtros ==========

function crearTarjetaCancha(cancha, fecha, reservas) {
    const libres = contarTurnosLibres(fecha, cancha.id, reservas);
    const proximo = obtenerProximoTurnoLibre(fecha, cancha.id, reservas);
    const tarjeta = document.createElement("article");
    tarjeta.className = "cancha-card";
    tarjeta.dataset.ubicacion = cancha.ubicacion;
    tarjeta.dataset.tipo = cancha.tipo;
    tarjeta.dataset.disponibilidad = libres > 0 ? "disponible" : "ocupada";

    const tagTipo = cancha.tipo === "techada" ? "Techada" : "Abierta";
    const tagTipoClass = cancha.tipo === "techada" ? "tag--techada" : "tag--abierta";
    const tagDisp = libres > 0 ? "Disponible" : "Completa";
    const tagDispClass = libres > 0 ? "tag--disponible" : "tag--ocupada";
    const proximoTexto = proximo ? proximo + " hs" : "Sin turnos";
    const sesion = obtenerSesion();
    const mostrarReservar = !esSesionClub(sesion);
    let pieTarjeta = "";

    if (mostrarReservar) {
        pieTarjeta =
            '<div class="cancha-card__footer">' +
            '<a class="btn btn--verde btn--chico enlace-jugador" href="reservar.html?cancha=' + cancha.id + "&fecha=" + fecha + '">Reservar</a>' +
            "</div>";
    }

    tarjeta.innerHTML =
        '<img class="cancha-card__img" src="' + cancha.imagen + '" alt="' + cancha.nombre + '">' +
        '<div class="cancha-card__body">' +
        '<div class="cancha-card__tags">' +
        '<span class="tag ' + tagTipoClass + '">' + tagTipo + '</span>' +
        '<span class="tag ' + tagDispClass + '">' + tagDisp + '</span>' +
        "</div>" +
        "<h3>" + cancha.nombre + "</h3>" +
        "<p>" + cancha.descripcion + "</p>" +
        "<p><strong>Próximo turno libre:</strong> " + proximoTexto + "</p>" +
        pieTarjeta +
        "</div>";

    return tarjeta;
}

function aplicarFiltrosCanchas() {
    const ubicacion = document.getElementById("filtro-ubicacion").value;
    const tipo = document.getElementById("filtro-tipo").value;
    const disponibilidad = document.getElementById("filtro-disponibilidad").value;
    const fecha = document.getElementById("filtro-fecha").value;
    const contenedor = document.getElementById("canchas-grid");
    const reservas = obtenerReservas();
    let i;

    contenedor.innerHTML = "";

    for (i = 0; i < obtenerCanchas().length; i++) {
        const cancha = obtenerCanchas()[i];
        const libres = contarTurnosLibres(fecha, cancha.id, reservas);
        const dispCancha = libres > 0 ? "disponible" : "ocupada";

        if (ubicacion !== "" && cancha.ubicacion !== ubicacion) {
            continue;
        }
        if (tipo !== "" && cancha.tipo !== tipo) {
            continue;
        }
        if (disponibilidad === "disponible" && dispCancha !== "disponible") {
            continue;
        }
        if (disponibilidad === "ocupada" && dispCancha !== "ocupada") {
            continue;
        }

        contenedor.appendChild(crearTarjetaCancha(cancha, fecha, reservas));
    }

    if (contenedor.children.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--texto-suave);">No hay canchas que coincidan con los filtros seleccionados.</p>';
    }
}

function initCanchas() {
    const formulario = document.getElementById("form-filtros");
    const fechaInput = document.getElementById("filtro-fecha");

    if (!formulario) {
        return;
    }

    if (!fechaInput.value) {
        fechaInput.value = new Date().toISOString().split("T")[0];
    }

    aplicarFiltrosCanchas();

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();
        aplicarFiltrosCanchas();
    });

    document.getElementById("filtro-ubicacion").addEventListener("change", aplicarFiltrosCanchas);
    document.getElementById("filtro-tipo").addEventListener("change", aplicarFiltrosCanchas);
    document.getElementById("filtro-disponibilidad").addEventListener("change", aplicarFiltrosCanchas);
    document.getElementById("filtro-fecha").addEventListener("change", aplicarFiltrosCanchas);
}

// ========== Reservar turno ==========

let horarioSeleccionado = "";
let reservaEditandoId = null;

function crearBotonHorario(horario, estado, seleccionado) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = horario;
    boton.className = "horario";

    if (estado === "cerrado") {
        boton.classList.add("horario--ocupado");
        boton.disabled = true;
        boton.title = "Horario no habilitado por el club";
    } else if (estado === "ocupado") {
        boton.classList.add("horario--ocupado");
        boton.disabled = true;
    } else if (seleccionado) {
        boton.classList.add("horario--seleccionado");
    } else {
        boton.classList.add("horario--disponible");
        boton.addEventListener("click", function () {
            seleccionarHorario(horario);
        });
    }

    return boton;
}

function obtenerEstadoHorario(horario, fecha, canchaId, reservas) {
    if (!horarioEstaDisponibleEnCancha(canchaId, horario)) {
        return "cerrado";
    }
    if (turnoEstaOcupado(fecha, canchaId, horario, reservas, reservaEditandoId)) {
        return "ocupado";
    }
    return "disponible";
}

function crearGrillaHorarios(contenedorId, titulo, horarios, fecha, canchaId, reservas) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";
    const tituloElemento = document.createElement("h3");
    if (titulo === "Tarde") {
        tituloElemento.style.marginTop = "1.25rem";
    }
    if (titulo === "Noche") {
        tituloElemento.style.marginTop = "1.25rem";
    }
    tituloElemento.textContent = titulo;
    contenedor.parentElement.insertBefore(tituloElemento, contenedor);

    const grilla = contenedor;
    let i;

    for (i = 0; i < horarios.length; i++) {
        const horario = horarios[i];
        const estado = obtenerEstadoHorario(horario, fecha, canchaId, reservas);
        const seleccionado = horario === horarioSeleccionado;
        grilla.appendChild(crearBotonHorario(horario, estado, seleccionado));
    }
}

function seleccionarHorario(horario) {
    horarioSeleccionado = horario;
    const inputHorario = document.getElementById("horario-seleccionado");
    if (inputHorario) {
        inputHorario.value = horario;
    }
    renderizarHorarios();
}

function renderizarHorarios() {
    const fecha = document.getElementById("fecha-reserva").value;
    const canchaId = document.getElementById("cancha-reserva").value;
    const cancha = obtenerCanchaPorId(canchaId);
    const reservas = obtenerReservas();
    const tituloHorarios = document.getElementById("titulo-horarios");
    const subtituloFecha = document.getElementById("subtitulo-fecha");
    const seccionHorarios = document.getElementById("seccion-horarios");

    if (!seccionHorarios) {
        return;
    }

    if (tituloHorarios && cancha) {
        tituloHorarios.textContent = "Horarios — " + cancha.nombre;
    }
    if (subtituloFecha) {
        subtituloFecha.textContent = formatearFechaLarga(fecha);
    }

    seccionHorarios.querySelectorAll("h3").forEach(function (elemento) {
        elemento.remove();
    });

    crearGrillaHorarios("horarios-manana", "Mañana", HORARIOS_MANANA, fecha, canchaId, reservas);
    crearGrillaHorarios("horarios-tarde", "Tarde", HORARIOS_TARDE, fecha, canchaId, reservas);
    crearGrillaHorarios("horarios-noche", "Noche", HORARIOS_NOCHE, fecha, canchaId, reservas);
}

function initReservar() {
    if (redirigirClubSiCorresponde()) {
        return;
    }

    requerirSesion();

    const formulario = document.getElementById("form-reserva");
    const alerta = document.getElementById("alert-reserva");
    const fechaInput = document.getElementById("fecha-reserva");
    const canchaSelect = document.getElementById("cancha-reserva");
    const params = new URLSearchParams(window.location.search);

    if (!formulario) {
        return;
    }

    ocultarAlerta(alerta);
    poblarSelectCanchas(canchaSelect);

    if (params.get("editar")) {
        reservaEditandoId = params.get("editar");
    }

    if (params.get("fecha")) {
        fechaInput.value = params.get("fecha");
    } else if (!fechaInput.value) {
        fechaInput.value = new Date().toISOString().split("T")[0];
    }

    if (params.get("cancha")) {
        canchaSelect.value = params.get("cancha");
    }

    if (reservaEditandoId) {
        const reservas = obtenerReservas();
        let i;
        for (i = 0; i < reservas.length; i++) {
            if (reservas[i].id === reservaEditandoId) {
                fechaInput.value = reservas[i].fecha;
                canchaSelect.value = reservas[i].canchaId;
                horarioSeleccionado = reservas[i].horario;
                document.getElementById("horario-seleccionado").value = reservas[i].horario;
                document.getElementById("jugadores").value = String(reservas[i].jugadores);
                document.getElementById("notas").value = reservas[i].notas || "";
                break;
            }
        }
    }

    renderizarHorarios();

    fechaInput.addEventListener("change", function () {
        horarioSeleccionado = "";
        document.getElementById("horario-seleccionado").value = "";
        renderizarHorarios();
    });

    canchaSelect.addEventListener("change", function () {
        horarioSeleccionado = "";
        document.getElementById("horario-seleccionado").value = "";
        renderizarHorarios();
    });

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const sesion = requerirSesion();
        if (!sesion) {
            return;
        }

        const fecha = fechaInput.value;
        const canchaId = canchaSelect.value;
        const horario = horarioSeleccionado;
        const jugadores = document.getElementById("jugadores").value;
        const notas = document.getElementById("notas").value;
        const reservas = obtenerReservas();

        if (!horario) {
            mostrarAlerta(alerta, "Seleccioná un horario disponible.", "aviso");
            return;
        }

        if (!horarioEstaDisponibleEnCancha(canchaId, horario)) {
            mostrarAlerta(alerta, "Ese horario no está habilitado para esta cancha.", "aviso");
            renderizarHorarios();
            return;
        }

        if (turnoEstaOcupado(fecha, canchaId, horario, reservas, reservaEditandoId)) {
            mostrarAlerta(alerta, "Ese turno ya está ocupado. Elegí otro horario.", "aviso");
            renderizarHorarios();
            return;
        }

        if (reservaEditandoId) {
            let i;
            for (i = 0; i < reservas.length; i++) {
                if (reservas[i].id === reservaEditandoId) {
                    reservas[i].fecha = fecha;
                    reservas[i].canchaId = canchaId;
                    reservas[i].horario = horario;
                    reservas[i].jugadores = Number(jugadores);
                    reservas[i].notas = notas;
                    reservas[i].estado = "confirmada";
                    break;
                }
            }
            guardarReservas(reservas);
            mostrarAlerta(alerta, "Reserva modificada con éxito.", "exito");
            setTimeout(function () {
                window.location.href = "mis-reservas.html";
            }, 1200);
        } else {
            const nuevaReserva = {
                id: generarId(),
                usuarioId: sesion.id,
                fecha: fecha,
                horario: horario,
                canchaId: canchaId,
                jugadores: Number(jugadores),
                notas: notas,
                estado: "confirmada"
            };
            reservas.push(nuevaReserva);
            guardarReservas(reservas);
            mostrarAlerta(alerta, "Turno reservado con éxito.", "exito");
            horarioSeleccionado = "";
            document.getElementById("horario-seleccionado").value = "";
            renderizarHorarios();
        }
    });

    formulario.addEventListener("reset", function () {
        horarioSeleccionado = "";
        setTimeout(renderizarHorarios, 0);
    });
}

// ========== Mis reservas ==========

let reservaModificandoId = null;

function crearFilaReserva(reserva, sesion) {
    const cancha = obtenerCanchaPorId(reserva.canchaId);
    const fila = document.createElement("tr");
    const fin = calcularHorarioFin(reserva.horario);
    let claseEstado = "estado--confirmada";
    let textoEstado = "Confirmada";

    if (reserva.estado === "pendiente") {
        claseEstado = "estado--pendiente";
        textoEstado = "Pendiente";
    } else if (reserva.estado === "cancelada") {
        claseEstado = "estado--cancelada";
        textoEstado = "Cancelada";
    }

    fila.innerHTML =
        "<td>" + formatearFecha(reserva.fecha) + "</td>" +
        "<td>" + reserva.horario + " — " + fin + "</td>" +
        "<td>" + (cancha ? cancha.nombre : reserva.canchaId) + "</td>" +
        "<td>" + (cancha ? cancha.ubicacionLabel : "") + "</td>" +
        '<td><span class="estado ' + claseEstado + '">' + textoEstado + "</span></td>" +
        "<td><div class=\"tabla__acciones\"></div></td>";

    const acciones = fila.querySelector(".tabla__acciones");

    if (reserva.estado !== "cancelada") {
        const btnModificar = document.createElement("button");
        btnModificar.type = "button";
        btnModificar.className = "btn btn--outline btn--chico";
        btnModificar.textContent = "Modificar";
        btnModificar.addEventListener("click", function () {
            mostrarFormularioModificar(reserva);
        });
        acciones.appendChild(btnModificar);

        const btnCancelar = document.createElement("button");
        btnCancelar.type = "button";
        btnCancelar.className = "btn btn--peligro btn--chico";
        btnCancelar.textContent = "Cancelar";
        btnCancelar.addEventListener("click", function () {
            cancelarReserva(reserva.id);
        });
        acciones.appendChild(btnCancelar);
    } else {
        const btnReservar = document.createElement("a");
        btnReservar.className = "btn btn--verde btn--chico";
        btnReservar.href = "reservar.html?cancha=" + reserva.canchaId;
        btnReservar.textContent = "Volver a reservar";
        acciones.appendChild(btnReservar);
    }

    return fila;
}

function cargarTablaReservas() {
    const sesion = requerirSesion();
    if (!sesion) {
        return;
    }

    const tbody = document.getElementById("reservas-tbody");
    const reservas = obtenerReservas();
    const reservasUsuario = [];
    let i;

    tbody.innerHTML = "";

    for (i = 0; i < reservas.length; i++) {
        if (reservas[i].usuarioId === sesion.id) {
            reservasUsuario.push(reservas[i]);
        }
    }

    if (reservasUsuario.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No tenés reservas. <a href="reservar.html">Creá una nueva</a>.</td></tr>';
        return;
    }

    for (i = 0; i < reservasUsuario.length; i++) {
        tbody.appendChild(crearFilaReserva(reservasUsuario[i], sesion));
    }
}

function cancelarReserva(id) {
    if (!confirm("¿Confirmás la cancelación de esta reserva?")) {
        return;
    }

    const reservas = obtenerReservas();
    let i;

    for (i = 0; i < reservas.length; i++) {
        if (reservas[i].id === id) {
            reservas[i].estado = "cancelada";
            break;
        }
    }

    guardarReservas(reservas);
    cargarTablaReservas();
    alert("Reserva cancelada.");
}

function mostrarFormularioModificar(reserva) {
    reservaModificandoId = reserva.id;
    const seccion = document.getElementById("modificar-section");
    seccion.hidden = false;

    document.getElementById("mod-fecha").value = reserva.fecha;
    document.getElementById("mod-cancha").value = reserva.canchaId;
    actualizarHorariosModificar(reserva.horario);
    seccion.scrollIntoView({ behavior: "smooth" });
}

function actualizarHorariosModificar(horarioSeleccionadoMod) {
    const select = document.getElementById("mod-horario");
    const fecha = document.getElementById("mod-fecha").value;
    const canchaId = document.getElementById("mod-cancha").value;
    const reservas = obtenerReservas();
    let i;

    select.innerHTML = "";

    for (i = 0; i < HORARIOS_TODOS.length; i++) {
        const horario = HORARIOS_TODOS[i];
        const ocupado = turnoEstaOcupado(fecha, canchaId, horario, reservas, reservaModificandoId);
        if (!ocupado || horario === horarioSeleccionadoMod) {
            const opcion = document.createElement("option");
            opcion.value = horario;
            opcion.textContent = horario;
            if (horario === horarioSeleccionadoMod) {
                opcion.selected = true;
            }
            select.appendChild(opcion);
        }
    }
}

function initMisReservas() {
    if (redirigirClubSiCorresponde()) {
        return;
    }

    const formModificar = document.getElementById("form-modificar");
    const btnDescartar = document.getElementById("btn-descartar-mod");
    const selectModificar = document.getElementById("mod-cancha");

    if (!document.getElementById("reservas-tbody")) {
        return;
    }

    poblarSelectCanchas(selectModificar);
    cargarTablaReservas();

    if (formModificar) {
        document.getElementById("mod-fecha").addEventListener("change", function () {
            actualizarHorariosModificar(document.getElementById("mod-horario").value);
        });
        document.getElementById("mod-cancha").addEventListener("change", function () {
            actualizarHorariosModificar(document.getElementById("mod-horario").value);
        });

        formModificar.addEventListener("submit", function (event) {
            event.preventDefault();
            const reservas = obtenerReservas();
            const fecha = document.getElementById("mod-fecha").value;
            const canchaId = document.getElementById("mod-cancha").value;
            const horario = document.getElementById("mod-horario").value;
            let i;

            for (i = 0; i < reservas.length; i++) {
                if (reservas[i].id === reservaModificandoId) {
                    reservas[i].fecha = fecha;
                    reservas[i].canchaId = canchaId;
                    reservas[i].horario = horario;
                    reservas[i].estado = "confirmada";
                    break;
                }
            }

            guardarReservas(reservas);
            document.getElementById("modificar-section").hidden = true;
            cargarTablaReservas();
            alert("Reserva modificada con éxito.");
        });
    }

    if (btnDescartar) {
        btnDescartar.addEventListener("click", function () {
            document.getElementById("modificar-section").hidden = true;
            reservaModificandoId = null;
        });
    }
}

// ========== Partidos ==========

function obtenerNombreMostrarUsuario(usuarioId) {
    const usuarios = obtenerUsuarios();
    let i;

    for (i = 0; i < usuarios.length; i++) {
        if (usuarios[i].id === usuarioId) {
            return usuarios[i].nombre + " " + usuarios[i].apellido.charAt(0) + ".";
        }
    }

    return "";
}

function esCreadorDePartido(partido, sesion) {
    return sesion !== null && partido.creadorId === sesion.id;
}

function usuarioEstaInscriptoEnPartido(partido, sesion) {
    let i;
    
    if (!sesion) {
        return false;
    }

    const nombreUsuario = obtenerNombreMostrarUsuario(sesion.id);

    for (i = 0; i < partido.jugadores.length; i++) {
        if (partido.jugadores[i] === nombreUsuario) {
            return true;
        }
    }

    return false;
}

function jugadorYaEnPartido(partido, nombreJugador) {
    const nombreNormalizado = nombreJugador.trim().toLowerCase();
    let i;

    for (i = 0; i < partido.jugadores.length; i++) {
        if (partido.jugadores[i].trim().toLowerCase() === nombreNormalizado) {
            return true;
        }
    }

    return false;
}

function agregarJugadorManualAPartido(partidoId, nombreJugador) {
    const sesion = requerirSesion();
    const alerta = document.getElementById("alert-partidos");
    const nombre = nombreJugador.trim();

    if (!sesion) {
        return false;
    }

    if (nombre.length < 2) {
        mostrarAlerta(alerta, "Ingresá un nombre válido para el jugador.", "aviso");
        return false;
    }

    const partidos = obtenerPartidos();
    let partidoEncontrado = null;
    let i;

    for (i = 0; i < partidos.length; i++) {
        if (partidos[i].id === partidoId) {
            partidoEncontrado = partidos[i];
            break;
        }
    }

    if (!partidoEncontrado) {
        mostrarAlerta(alerta, "No se encontró el partido.", "aviso");
        return false;
    }

    if (!esCreadorDePartido(partidoEncontrado, sesion)) {
        mostrarAlerta(alerta, "Solo el organizador puede completar los huecos libres.", "aviso");
        return false;
    }

    if (partidoEncontrado.jugadores.length >= 4) {
        mostrarAlerta(alerta, "El partido ya está completo.", "aviso");
        return false;
    }

    if (jugadorYaEnPartido(partidoEncontrado, nombre)) {
        mostrarAlerta(alerta, "Ese jugador ya figura inscripto en el partido.", "aviso");
        return false;
    }

    partidoEncontrado.jugadores.push(nombre);
    guardarPartidos(partidos);
    cargarPartidos();
    mostrarAlerta(alerta, nombre + " fue agregado al partido.", "exito");
    return true;
}

function crearTarjetaPartido(partido, sesion) {
    console.log(partido, sesion);
    
    const cancha = obtenerCanchaPorId(partido.canchaId);
    const tarjeta = document.createElement("article");
    const tituloNivel = partido.nivel.charAt(0).toUpperCase() + partido.nivel.slice(1);
    const inscriptos = partido.jugadores.length;
    const libres = 4 - inscriptos;
    const esPropio = esCreadorDePartido(partido, sesion);
    const yaInscripto = usuarioEstaInscriptoEnPartido(partido, sesion);
    const estaCompleto = inscriptos >= 4;
    const creadorNombre = partido.creadorNombre || "Organizador";

    tarjeta.className = "partido-card";
    if (esPropio) {
        tarjeta.classList.add("partido-card--propio");
    }

    const header = document.createElement("div");
    header.className = "partido-card__header";

    const titulo = document.createElement("h3");
    titulo.textContent = "Partido " + tituloNivel;
    header.appendChild(titulo);

    const badges = document.createElement("div");
    badges.className = "partido-card__badges";

    if (esPropio) {
        const badgePropio = document.createElement("span");
        badgePropio.className = "partido-badge partido-badge--propio";
        badgePropio.textContent = "Tu partido";
        badges.appendChild(badgePropio);
    }

    if (yaInscripto && !esPropio) {
        const badgeInscripto = document.createElement("span");
        badgeInscripto.className = "partido-badge partido-badge--inscripto";
        badgeInscripto.textContent = "Inscripto";
        badges.appendChild(badgeInscripto);
    }

    if (estaCompleto) {
        const badgeCompleto = document.createElement("span");
        badgeCompleto.className = "partido-badge partido-badge--completo";
        badgeCompleto.textContent = "Completo";
        badges.appendChild(badgeCompleto);
    }

    if (badges.children.length > 0) {
        header.appendChild(badges);
    }

    tarjeta.appendChild(header);

    const meta = document.createElement("p");
    meta.className = "partido-card__meta";
    meta.innerHTML =
        formatearFecha(partido.fecha) + " · " + partido.horario + " hs<br>" +
        (cancha ? cancha.nombre + " · " + cancha.ubicacionLabel : "");
    tarjeta.appendChild(meta);

    const inscripcion = document.createElement("p");
    inscripcion.className = "partido-card__inscripcion";
    inscripcion.innerHTML =
        "<strong>" + inscriptos + " de 4</strong> jugadores inscriptos" +
        (libres > 0 ? " · <span>" + libres + " hueco" + (libres === 1 ? "" : "s") + " libre" + (libres === 1 ? "" : "s") + "</span>" : "");
    tarjeta.appendChild(inscripcion);

    const organizador = document.createElement("p");
    organizador.className = "partido-card__organizador";
    organizador.textContent = "Organizado por: " + creadorNombre + (esPropio ? " (vos)" : "");
    tarjeta.appendChild(organizador);

    if (partido.descripcion && partido.descripcion.trim() !== "") {
        const descripcion = document.createElement("p");
        descripcion.className = "partido-card__descripcion";
        descripcion.textContent = partido.descripcion;
        tarjeta.appendChild(descripcion);
    }

    const labelJugadores = document.createElement("p");
    labelJugadores.className = "partido-card__jugadores-label";
    labelJugadores.textContent = inscriptos > 0 ? "Jugadores inscriptos:" : "Todavía no hay jugadores inscriptos";
    tarjeta.appendChild(labelJugadores);

    const contenedorJugadores = document.createElement("div");
    contenedorJugadores.className = "partido-card__jugadores";
    let i;

    for (i = 0; i < partido.jugadores.length; i++) {
        const badge = document.createElement("span");
        badge.className = "jugador-badge";
        if (partido.jugadores[i] === creadorNombre) {
            badge.classList.add("jugador-badge--creador");
        }
        badge.textContent = partido.jugadores[i];
        contenedorJugadores.appendChild(badge);
    }

    for (i = 0; i < libres; i++) {
        const badgeLibre = document.createElement("span");
        badgeLibre.className = "jugador-badge jugador-badge--libre";
        badgeLibre.textContent = "Hueco libre";
        contenedorJugadores.appendChild(badgeLibre);
    }

    tarjeta.appendChild(contenedorJugadores);

    const acciones = document.createElement("div");
    acciones.className = "partido-card__acciones";

    if (!estaCompleto && !yaInscripto && !esPropio) {
        const btnUnirse = document.createElement("button");
        btnUnirse.type = "button";
        btnUnirse.className = "btn btn--verde btn--chico";
        btnUnirse.textContent = "Unirme al partido";
        btnUnirse.addEventListener("click", function () {
            unirseAPartido(partido.id);
        });
        acciones.appendChild(btnUnirse);
    } else if (yaInscripto && !esPropio) {
        const textoInscripto = document.createElement("span");
        textoInscripto.className = "partido-badge partido-badge--inscripto";
        textoInscripto.textContent = "Ya estás inscripto";
        acciones.appendChild(textoInscripto);
    } else if (esPropio && !estaCompleto) {
        const textoOrganizador = document.createElement("span");
        textoOrganizador.style.fontSize = "0.85rem";
        textoOrganizador.style.color = "var(--texto-suave)";
        textoOrganizador.textContent = "Sos el organizador — podés completar los huecos abajo.";
        acciones.appendChild(textoOrganizador);
    }

    if (acciones.children.length > 0) {
        tarjeta.appendChild(acciones);
    }

    if (esPropio && !estaCompleto) {
        const seccionLlenar = document.createElement("div");
        seccionLlenar.className = "partido-card__llenar";

        const tituloLlenar = document.createElement("p");
        tituloLlenar.textContent = "Completar huecos libres";
        seccionLlenar.appendChild(tituloLlenar);

        const formLlenar = document.createElement("div");
        formLlenar.className = "partido-card__llenar-form";

        const inputNombre = document.createElement("input");
        inputNombre.type = "text";
        inputNombre.placeholder = "Nombre del jugador (ej: Juan P.)";
        inputNombre.setAttribute("aria-label", "Nombre del jugador a agregar");

        const btnAgregar = document.createElement("button");
        btnAgregar.type = "button";
        btnAgregar.className = "btn btn--verde btn--chico";
        btnAgregar.textContent = "Agregar jugador";

        btnAgregar.addEventListener("click", function () {
            if (agregarJugadorManualAPartido(partido.id, inputNombre.value)) {
                inputNombre.value = "";
            }
        });

        inputNombre.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                btnAgregar.click();
            }
        });

        formLlenar.appendChild(inputNombre);
        formLlenar.appendChild(btnAgregar);
        seccionLlenar.appendChild(formLlenar);

        const ayuda = document.createElement("p");
        ayuda.className = "partido-card__llenar-ayuda";
        ayuda.textContent = "Agregá a las personas que ya conseguiste para completar el cuarto.";
        seccionLlenar.appendChild(ayuda);

        tarjeta.appendChild(seccionLlenar);
    }

    return tarjeta;
}

function cargarPartidos() {
    const contenedor = document.getElementById("partidos-grid");
    const partidos = obtenerPartidos();
    const sesion = obtenerSesion();
    let i;

    contenedor.innerHTML = "";

    if (partidos.length === 0) {
        contenedor.innerHTML = '<p>No hay partidos abiertos por ahora.</p>';
        return;
    }

    for (i = 0; i < partidos.length; i++) {
        contenedor.appendChild(crearTarjetaPartido(partidos[i], sesion));
    }
}

function unirseAPartido(id) {
    const sesion = requerirSesion();
    const alerta = document.getElementById("alert-partidos");

    if (!sesion) {
        return;
    }

    const nombreCompleto = obtenerNombreMostrarUsuario(sesion.id);
    const partidos = obtenerPartidos();
    let i;

    for (i = 0; i < partidos.length; i++) {
        if (partidos[i].id === id) {
            if (esCreadorDePartido(partidos[i], sesion)) {
                mostrarAlerta(alerta, "Ya sos el organizador de este partido.", "info");
                return;
            }

            if (usuarioEstaInscriptoEnPartido(partidos[i], sesion)) {
                mostrarAlerta(alerta, "Ya estás inscripto en este partido.", "info");
                return;
            }

            if (partidos[i].jugadores.length >= 4) {
                mostrarAlerta(alerta, "El partido ya está completo.", "aviso");
                return;
            }

            partidos[i].jugadores.push(nombreCompleto);
            break;
        }
    }

    guardarPartidos(partidos);
    cargarPartidos();
    mostrarAlerta(alerta, "Te uniste al partido con éxito.", "info");
}

function initPartidos() {
    if (redirigirClubSiCorresponde()) {
        return;
    }

    const formulario = document.getElementById("form-partido");
    const alerta = document.getElementById("alert-partidos");
    const selectCancha = document.getElementById("partido-cancha");

    if (!formulario) {
        return;
    }

    poblarSelectCanchas(selectCancha);
    ocultarAlerta(alerta);
    cargarPartidos();

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const sesion = requerirSesion();
        if (!sesion) {
            return;
        }

        const usuarios = obtenerUsuarios();
        let apellido = "";
        let i;

        for (i = 0; i < usuarios.length; i++) {
            if (usuarios[i].id === sesion.id) {
                apellido = usuarios[i].apellido;
                break;
            }
        }

        const partidos = obtenerPartidos();
        const nuevoPartido = {
            id: generarId(),
            creadorId: sesion.id,
            creadorNombre: sesion.nombre + " " + apellido.charAt(0) + ".",
            fecha: document.getElementById("partido-fecha").value,
            horario: document.getElementById("partido-horario").value,
            canchaId: document.getElementById("partido-cancha").value,
            nivel: document.getElementById("partido-nivel").value,
            descripcion: document.getElementById("partido-descripcion").value,
            jugadores: [sesion.nombre + " " + apellido.charAt(0) + "."]
        };

        partidos.push(nuevoPartido);
        guardarPartidos(partidos);
        formulario.reset();
        document.getElementById("partido-fecha").value = new Date().toISOString().split("T")[0];
        cargarPartidos();
        mostrarAlerta(alerta, "Partido publicado con éxito.", "exito");
    });
}

// ========== Estadísticas ==========

let statEditandoId = null;

function esNumeroSetValido(valor) {
    if (!/^\d+$/.test(valor)) {
        return false;
    }

    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0 && numero < 8;
}

function esSetValido(textoSet) {
    const partes = textoSet.trim().split("-");

    if (partes.length !== 2) {
        return false;
    }

    return esNumeroSetValido(partes[0]) && esNumeroSetValido(partes[1]);
}

function validarCampoSet(input, etiqueta, esObligatorio, errores) {    
    const grupo = input.parentElement;
    const valor = input.value.trim();

    limpiarValidacionGrupo(grupo);

    if (valor === "") {
        if (esObligatorio) {
            errores.push(etiqueta + " es obligatorio.");
            marcarGrupoError(grupo);
            return false;
        }
        return true;
    }

    if (!esSetValido(valor)) {
        errores.push(etiqueta + " debe tener formato numero-numero (enteros positivos menores a 15).");
        marcarGrupoError(grupo);
        return false;
    }

    marcarGrupoValido(grupo);
    return true;
}

function obtenerDatosFormularioEstadisticas() {
    return {
        fecha: document.getElementById("stats-fecha").value,
        canchaId: document.getElementById("stats-cancha").value,
        rival: document.getElementById("stats-rival").value.trim(),
        resultado: document.getElementById("stats-resultado").value,
        set1: document.getElementById("stats-set1").value.trim(),
        set2: document.getElementById("stats-set2").value.trim(),
        set3: document.getElementById("stats-set3").value.trim(),
        notas: document.getElementById("stats-notas").value.trim()
    };
}

function validarFormularioEstadisticas() {
    const rival = document.getElementById("stats-rival");
    const resultado = document.getElementById("stats-resultado");
    const set1 = document.getElementById("stats-set1");
    const set2 = document.getElementById("stats-set2");
    const set3 = document.getElementById("stats-set3");
    const errores = [];

    limpiarValidacionGrupo(rival.parentElement);
    limpiarValidacionGrupo(resultado.parentElement);

    validarCampoObligatorio(rival.value, "Ingresá el rival.", rival.parentElement, errores);

    if (resultado.value === "") {
        errores.push("Seleccioná el resultado.");
        marcarGrupoError(resultado.parentElement);
    } else {
        marcarGrupoValido(resultado.parentElement);
    }

    validarCampoSet(set1, "Set 1", true, errores);
    validarCampoSet(set2, "Set 2", true, errores);
    validarCampoSet(set3, "Set 3", false, errores);

    return errores;
}

function resetearFormularioEstadisticas() {
    const formulario = document.getElementById("form-stats");
    formulario.reset();
    document.getElementById("stats-fecha").value = new Date().toISOString().split("T")[0];
    document.getElementById("stats-form-titulo").textContent = "Cargar resultado";
    document.getElementById("btn-guardar-stats").textContent = "Guardar resultado";
    document.getElementById("btn-cancelar-stats").hidden = true;
    statEditandoId = null;

    const campos = formulario.querySelectorAll(".form-group");
    let i;
    for (i = 0; i < campos.length; i++) {
        limpiarValidacionGrupo(campos[i]);
    }
}

function editarEstadistica(id) {
    const sesion = obtenerSesion();
    const estadisticas = obtenerEstadisticas();
    let statEncontrada = null;
    let i;

    for (i = 0; i < estadisticas.length; i++) {
        if (estadisticas[i].id === id && estadisticas[i].usuarioId === sesion.id) {
            statEncontrada = estadisticas[i];
            break;
        }
    }

    if (!statEncontrada) {
        return;
    }

    statEditandoId = id;
    document.getElementById("stats-fecha").value = statEncontrada.fecha;
    document.getElementById("stats-cancha").value = statEncontrada.canchaId;
    document.getElementById("stats-rival").value = statEncontrada.rival;
    document.getElementById("stats-resultado").value = statEncontrada.resultado;
    document.getElementById("stats-set1").value = statEncontrada.set1;
    document.getElementById("stats-set2").value = statEncontrada.set2;
    document.getElementById("stats-set3").value = statEncontrada.set3 || "";
    document.getElementById("stats-notas").value = statEncontrada.notas || "";
    document.getElementById("stats-form-titulo").textContent = "Editar resultado";
    document.getElementById("btn-guardar-stats").textContent = "Guardar cambios";
    document.getElementById("btn-cancelar-stats").hidden = false;

    document.getElementById("form-stats").scrollIntoView({ behavior: "smooth" });
}

function eliminarEstadistica(id) {
    if (!confirm("¿Eliminar este resultado del historial?")) {
        return;
    }

    const sesion = obtenerSesion();
    const estadisticas = obtenerEstadisticas();
    const nuevasEstadisticas = [];
    let i;

    for (i = 0; i < estadisticas.length; i++) {
        if (estadisticas[i].id === id && estadisticas[i].usuarioId === sesion.id) {
            if (statEditandoId === id) {
                resetearFormularioEstadisticas();
            }
            continue;
        }
        nuevasEstadisticas.push(estadisticas[i]);
    }

    guardarEstadisticas(nuevasEstadisticas);
    cargarTablaEstadisticas();

    const alerta = document.getElementById("alert-stats");
    mostrarAlerta(alerta, "Resultado eliminado.", "info");
}

function actualizarResumenEstadisticas(estadisticasUsuario) {
    let victorias = 0;
    let derrotas = 0;
    let i;

    for (i = 0; i < estadisticasUsuario.length; i++) {
        if (estadisticasUsuario[i].resultado === "victoria") {
            victorias++;
        } else {
            derrotas++;
        }
    }

    document.getElementById("stat-jugados").textContent = estadisticasUsuario.length;
    document.getElementById("stat-victorias").textContent = victorias;
    document.getElementById("stat-derrotas").textContent = derrotas;
}

function formatearSets(stat) {
    let sets = stat.set1;
    if (stat.set2) {
        sets += ", " + stat.set2;
    }
    if (stat.set3) {
        sets += ", " + stat.set3;
    }
    return sets || "-";
}

function crearFilaEstadistica(stat) {
    const cancha = obtenerCanchaPorId(stat.canchaId);
    const fila = document.createElement("tr");
    const claseResultado = stat.resultado === "victoria" ? "estado--confirmada" : "estado--cancelada";
    const textoResultado = stat.resultado === "victoria" ? "Victoria" : "Derrota";

    fila.innerHTML =
        "<td>" + formatearFecha(stat.fecha) + "</td>" +
        "<td>" + (cancha ? cancha.nombre.replace(" — ", " ") : stat.canchaId) + "</td>" +
        "<td>" + stat.rival + "</td>" +
        '<td><span class="estado ' + claseResultado + '">' + textoResultado + "</span></td>" +
        "<td>" + formatearSets(stat) + "</td>" +
        '<td><div class="tabla__acciones"></div></td>';

    const acciones = fila.querySelector(".tabla__acciones");

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "btn btn--outline btn--chico";
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", function () {
        editarEstadistica(stat.id);
    });

    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.className = "btn btn--peligro btn--chico";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", function () {
        eliminarEstadistica(stat.id);
    });

    acciones.appendChild(btnEditar);
    acciones.appendChild(btnEliminar);

    return fila;
}

function cargarTablaEstadisticas() {
    const sesion = requerirSesion();
    if (!sesion) {
        return;
    }

    const tbody = document.getElementById("stats-tbody");
    const todas = obtenerEstadisticas();
    const delUsuario = [];
    let i;

    tbody.innerHTML = "";

    for (i = 0; i < todas.length; i++) {
        if (todas[i].usuarioId === sesion.id) {
            delUsuario.push(todas[i]);
        }
    }

    actualizarResumenEstadisticas(delUsuario);

    if (delUsuario.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Todavía no cargaste resultados.</td></tr>';
        return;
    }

    for (i = delUsuario.length - 1; i >= 0; i--) {
        tbody.appendChild(crearFilaEstadistica(delUsuario[i]));
    }
}

function initEstadisticas() {
    if (redirigirClubSiCorresponde()) {
        return;
    }

    const formulario = document.getElementById("form-stats");
    const alerta = document.getElementById("alert-stats");
    const btnCancelar = document.getElementById("btn-cancelar-stats");
    const selectCancha = document.getElementById("stats-cancha");

    if (!formulario) {
        return;
    }

    poblarSelectCanchas(selectCancha);

    ocultarAlerta(alerta);
    cargarTablaEstadisticas();

    if (btnCancelar) {
        btnCancelar.addEventListener("click", function () {
            resetearFormularioEstadisticas();
            ocultarAlerta(alerta);
        });
    }

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const sesion = requerirSesion();
        if (!sesion) {
            return;
        }

        const errores = validarFormularioEstadisticas();

        if (errores.length > 0) {
            mostrarAlerta(alerta, errores.join(" "), "aviso");
            return;
        }

        const datos = obtenerDatosFormularioEstadisticas();
        const estadisticas = obtenerEstadisticas();

        if (statEditandoId) {
            let i;
            for (i = 0; i < estadisticas.length; i++) {
                if (estadisticas[i].id === statEditandoId && estadisticas[i].usuarioId === sesion.id) {
                    estadisticas[i].fecha = datos.fecha;
                    estadisticas[i].canchaId = datos.canchaId;
                    estadisticas[i].rival = datos.rival;
                    estadisticas[i].resultado = datos.resultado;
                    estadisticas[i].set1 = datos.set1;
                    estadisticas[i].set2 = datos.set2;
                    estadisticas[i].set3 = datos.set3;
                    estadisticas[i].notas = datos.notas;
                    break;
                }
            }
            guardarEstadisticas(estadisticas);
            resetearFormularioEstadisticas();
            cargarTablaEstadisticas();
            mostrarAlerta(alerta, "Resultado actualizado con éxito.", "exito");
        } else {
            const nuevoRegistro = {
                id: generarId(),
                usuarioId: sesion.id,
                fecha: datos.fecha,
                canchaId: datos.canchaId,
                rival: datos.rival,
                resultado: datos.resultado,
                set1: datos.set1,
                set2: datos.set2,
                set3: datos.set3,
                notas: datos.notas
            };

            estadisticas.push(nuevoRegistro);
            guardarEstadisticas(estadisticas);
            resetearFormularioEstadisticas();
            cargarTablaEstadisticas();
            mostrarAlerta(alerta, "Resultado guardado con éxito.", "exito");
        }
    });
}

// ========== Panel del club ==========

let canchaClubEditandoId = null;

function obtenerEtiquetaUbicacion(valor) {
    const etiquetas = {
        neuquen: "Neuquén Capital",
        cipolletti: "Cipolletti",
        plottier: "Plottier",
        centenario: "Centenario"
    };
    return etiquetas[valor] || valor;
}

function resetearFormularioCanchaClub() {
    canchaClubEditandoId = null;
    document.getElementById("cancha-editando-id").value = "";
    document.getElementById("form-cancha-club").reset();
    document.getElementById("titulo-form-cancha").textContent = "Agregar cancha";
    document.getElementById("btn-guardar-cancha").textContent = "Guardar cancha";
    document.getElementById("btn-cancelar-cancha").hidden = true;
}

function cargarListaCanchasClub(sesion) {
    const contenedor = document.getElementById("lista-canchas-club");
    const canchasClub = obtenerCanchasDeClub(sesion.id);
    let i;

    contenedor.innerHTML = "";

    if (canchasClub.length === 0) {
        contenedor.innerHTML = '<p style="color: var(--texto-suave); margin: 0;">Todavía no cargaste canchas. Usá el formulario para agregar la primera.</p>';
        return;
    }

    for (i = 0; i < canchasClub.length; i++) {
        const cancha = canchasClub[i];
        const item = document.createElement("article");
        item.className = "cancha-club-item";
        const tipoLabel = cancha.tipo === "techada" ? "Techada" : "Abierta";
        item.innerHTML =
            "<div>" +
            "<h3>" + cancha.nombre + "</h3>" +
            "<p>" + tipoLabel + " · " + cancha.descripcion + "</p>" +
            "<p><strong>Horarios habilitados:</strong> " + cancha.horariosDisponibles.length + "</p>" +
            "</div>" +
            '<div class="cancha-club-item__acciones"></div>';

        const acciones = item.querySelector(".cancha-club-item__acciones");

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "btn btn--outline btn--chico";
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", function () {
            editarCanchaClub(cancha);
        });
        acciones.appendChild(btnEditar);

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "btn btn--peligro btn--chico";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", function () {
            eliminarCanchaClub(cancha.id, sesion);
        });
        acciones.appendChild(btnEliminar);

        contenedor.appendChild(item);
    }
}

function editarCanchaClub(cancha) {
    canchaClubEditandoId = cancha.id;
    document.getElementById("cancha-editando-id").value = cancha.id;
    document.getElementById("cancha-nombre").value = cancha.nombre;
    document.getElementById("cancha-tipo").value = cancha.tipo;
    document.getElementById("cancha-descripcion").value = cancha.descripcion;
    document.getElementById("cancha-imagen").value = cancha.imagen;
    document.getElementById("titulo-form-cancha").textContent = "Editar cancha";
    document.getElementById("btn-guardar-cancha").textContent = "Actualizar cancha";
    document.getElementById("btn-cancelar-cancha").hidden = false;
}

function eliminarCanchaClub(canchaId, sesion) {
    const alerta = document.getElementById("alert-panel-club");
    const reservas = obtenerReservas();
    let i;

    for (i = 0; i < reservas.length; i++) {
        if (reservas[i].canchaId === canchaId && esReservaActiva(reservas[i])) {
            mostrarAlerta(alerta, "No podés eliminar una cancha con reservas activas.", "aviso");
            return;
        }
    }

    if (!confirm("¿Eliminar esta cancha? Esta acción no se puede deshacer.")) {
        return;
    }

    const canchas = obtenerCanchas();
    const nuevasCanchas = [];

    for (i = 0; i < canchas.length; i++) {
        if (canchas[i].id !== canchaId || canchas[i].clubId !== sesion.id) {
            nuevasCanchas.push(canchas[i]);
        }
    }

    guardarCanchasStorage(nuevasCanchas);
    cargarListaCanchasClub(sesion);
    poblarSelectsPanelClub(sesion);
    mostrarAlerta(alerta, "Cancha eliminada.", "exito");
}

function poblarSelectsPanelClub(sesion) {
    const canchasClub = obtenerCanchasDeClub(sesion.id);
    const selectHorarios = document.getElementById("horarios-cancha-select");
    const selectOcupacion = document.getElementById("ocupacion-cancha");
    let i;

    selectHorarios.innerHTML = "";
    selectOcupacion.innerHTML = "";

    for (i = 0; i < canchasClub.length; i++) {
        const opcionHorarios = document.createElement("option");
        opcionHorarios.value = canchasClub[i].id;
        opcionHorarios.textContent = canchasClub[i].nombre;
        selectHorarios.appendChild(opcionHorarios);

        const opcionOcupacion = document.createElement("option");
        opcionOcupacion.value = canchasClub[i].id;
        opcionOcupacion.textContent = canchasClub[i].nombre;
        selectOcupacion.appendChild(opcionOcupacion);
    }
}

function renderizarChecklistHorarios(canchaId) {
    const contenedor = document.getElementById("horarios-checklist");
    const cancha = obtenerCanchaPorId(canchaId);
    const horariosActivos = cancha ? cancha.horariosDisponibles : [];
    let i;

    contenedor.innerHTML = "";

    for (i = 0; i < HORARIOS_TODOS.length; i++) {
        const horario = HORARIOS_TODOS[i];
        const label = document.createElement("label");
        label.className = "horario-check";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = horario;
        input.checked = horariosActivos.indexOf(horario) !== -1;
        label.appendChild(input);
        label.appendChild(document.createTextNode(horario));
        contenedor.appendChild(label);
    }
}

function guardarHorariosCanchaClub(sesion) {
    const alerta = document.getElementById("alert-panel-club");
    const canchaId = document.getElementById("horarios-cancha-select").value;
    const checks = document.querySelectorAll("#horarios-checklist input:checked");
    const horarios = [];
    let i;

    if (!canchaId) {
        mostrarAlerta(alerta, "Seleccioná una cancha.", "aviso");
        return;
    }

    for (i = 0; i < checks.length; i++) {
        horarios.push(checks[i].value);
    }

    if (horarios.length === 0) {
        mostrarAlerta(alerta, "Debés habilitar al menos un horario.", "aviso");
        return;
    }

    const canchas = obtenerCanchas();

    for (i = 0; i < canchas.length; i++) {
        if (canchas[i].id === canchaId && canchas[i].clubId === sesion.id) {
            canchas[i].horariosDisponibles = horarios;
            break;
        }
    }

    guardarCanchasStorage(canchas);
    cargarListaCanchasClub(sesion);
    mostrarAlerta(alerta, "Horarios actualizados correctamente.", "exito");
}

function renderizarOcupacionClub(sesion) {
    const fecha = document.getElementById("ocupacion-fecha").value;
    const canchaId = document.getElementById("ocupacion-cancha").value;
    const grilla = document.getElementById("ocupacion-grilla");
    const tbody = document.getElementById("ocupacion-tbody");
    const reservas = obtenerReservas();
    const horarios = obtenerHorariosCancha(canchaId);
    let libres = 0;
    let ocupados = 0;
    let i;

    grilla.innerHTML = "";
    tbody.innerHTML = "";

    if (!canchaId) {
        document.getElementById("ocupacion-libres").textContent = "0";
        document.getElementById("ocupacion-ocupados").textContent = "0";
        document.getElementById("ocupacion-porcentaje").textContent = "0%";
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay canchas cargadas.</td></tr>';
        return;
    }

    for (i = 0; i < HORARIOS_TODOS.length; i++) {
        const horario = HORARIOS_TODOS[i];
        const celda = document.createElement("div");
        celda.className = "ocupacion-celda";
        celda.textContent = horario;

        if (horarios.indexOf(horario) === -1) {
            celda.classList.add("ocupacion-celda--cerrado");
            celda.title = "Horario no habilitado";
        } else if (turnoEstaOcupado(fecha, canchaId, horario, reservas, null)) {
            celda.classList.add("ocupacion-celda--ocupado");
            ocupados++;
        } else {
            celda.classList.add("ocupacion-celda--libre");
            libres++;
        }

        grilla.appendChild(celda);
    }

    const totalHabilitados = horarios.length;
    const porcentaje = totalHabilitados > 0 ? Math.round((ocupados / totalHabilitados) * 100) : 0;

    document.getElementById("ocupacion-libres").textContent = String(libres);
    document.getElementById("ocupacion-ocupados").textContent = String(ocupados);
    document.getElementById("ocupacion-porcentaje").textContent = porcentaje + "%";

    const reservasDia = [];

    for (i = 0; i < reservas.length; i++) {
        if (
            reservas[i].canchaId === canchaId &&
            reservas[i].fecha === fecha &&
            esReservaActiva(reservas[i])
        ) {
            reservasDia.push(reservas[i]);
        }
    }

    if (reservasDia.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay reservas para esta fecha.</td></tr>';
        return;
    }

    for (i = 0; i < reservasDia.length; i++) {
        const reserva = reservasDia[i];
        const usuario = obtenerUsuarioPorId(reserva.usuarioId);
        const nombreJugador = usuario
            ? (usuario.apellido ? usuario.nombre + " " + usuario.apellido : usuario.nombre)
            : "Jugador";
        const fila = document.createElement("tr");
        fila.innerHTML =
            "<td>" + reserva.horario + " — " + calcularHorarioFin(reserva.horario) + "</td>" +
            "<td>" + nombreJugador + "</td>" +
            "<td>" + reserva.jugadores + "</td>" +
            '<td><span class="estado estado--confirmada">Confirmada</span></td>';
        tbody.appendChild(fila);
    }
}

function cambiarTabPanel(tabId) {
    const botones = document.querySelectorAll(".panel-tabs__btn");
    const tabs = document.querySelectorAll(".panel-tab");
    let i;

    for (i = 0; i < botones.length; i++) {
        botones[i].classList.toggle("is-active", botones[i].dataset.tab === tabId);
    }

    for (i = 0; i < tabs.length; i++) {
        const activa = tabs[i].id === "tab-" + tabId;
        tabs[i].classList.toggle("is-active", activa);
        tabs[i].hidden = !activa;
    }
}

function initPanelClub() {
    const sesion = requerirSesionClub();
    if (!sesion) {
        return;
    }

    const alerta = document.getElementById("alert-panel-club");
    const formCancha = document.getElementById("form-cancha-club");
    const btnCancelarCancha = document.getElementById("btn-cancelar-cancha");
    const selectHorarios = document.getElementById("horarios-cancha-select");
    const btnGuardarHorarios = document.getElementById("btn-guardar-horarios");
    const fechaOcupacion = document.getElementById("ocupacion-fecha");
    const selectOcupacion = document.getElementById("ocupacion-cancha");
    const usuarioCompleto = obtenerUsuarioPorId(sesion.id);

    ocultarAlerta(alerta);
    resetearFormularioCanchaClub();
    poblarSelectsPanelClub(sesion);
    cargarListaCanchasClub(sesion);

    if (!fechaOcupacion.value) {
        fechaOcupacion.value = new Date().toISOString().split("T")[0];
    }

    if (selectHorarios.value) {
        renderizarChecklistHorarios(selectHorarios.value);
    }

    document.querySelectorAll(".panel-tabs__btn").forEach(function (boton) {
        boton.addEventListener("click", function () {
            cambiarTabPanel(boton.dataset.tab);
        });
    });

    formCancha.addEventListener("submit", function (event) {
        event.preventDefault();

        const nombre = document.getElementById("cancha-nombre").value.trim();
        const tipo = document.getElementById("cancha-tipo").value;
        const descripcion = document.getElementById("cancha-descripcion").value.trim();
        const imagen = document.getElementById("cancha-imagen").value;
        const canchas = obtenerCanchas();
        const ciudad = usuarioCompleto ? usuarioCompleto.ciudad : "neuquen";

        if (nombre.length < 3) {
            mostrarAlerta(alerta, "El nombre de la cancha debe tener al menos 3 caracteres.", "aviso");
            return;
        }

        if (canchaClubEditandoId) {
            let i;
            for (i = 0; i < canchas.length; i++) {
                if (canchas[i].id === canchaClubEditandoId && canchas[i].clubId === sesion.id) {
                    canchas[i].nombre = nombre;
                    canchas[i].tipo = tipo;
                    canchas[i].descripcion = descripcion || "Sin descripción";
                    canchas[i].imagen = imagen;
                    break;
                }
            }
            guardarCanchasStorage(canchas);
            resetearFormularioCanchaClub();
            cargarListaCanchasClub(sesion);
            poblarSelectsPanelClub(sesion);
            mostrarAlerta(alerta, "Cancha actualizada correctamente.", "exito");
        } else {
            const nuevaCancha = {
                id: generarId(),
                clubId: sesion.id,
                nombre: nombre,
                ubicacion: ciudad,
                ubicacionLabel: obtenerEtiquetaUbicacion(ciudad),
                tipo: tipo,
                imagen: imagen,
                descripcion: descripcion || "Sin descripción",
                horariosDisponibles: HORARIOS_TODOS.slice()
            };
            canchas.push(nuevaCancha);
            guardarCanchasStorage(canchas);
            resetearFormularioCanchaClub();
            cargarListaCanchasClub(sesion);
            poblarSelectsPanelClub(sesion);
            mostrarAlerta(alerta, "Cancha agregada correctamente.", "exito");
        }
    });

    btnCancelarCancha.addEventListener("click", resetearFormularioCanchaClub);

    selectHorarios.addEventListener("change", function () {
        renderizarChecklistHorarios(selectHorarios.value);
    });

    btnGuardarHorarios.addEventListener("click", function () {
        guardarHorariosCanchaClub(sesion);
        renderizarChecklistHorarios(selectHorarios.value);
    });

    fechaOcupacion.addEventListener("change", function () {
        renderizarOcupacionClub(sesion);
    });

    selectOcupacion.addEventListener("change", function () {
        renderizarOcupacionClub(sesion);
    });

    renderizarOcupacionClub(sesion);
}

// ========== Inicialización ==========

document.addEventListener("DOMContentLoaded", function () {
    inicializarDatosPorDefecto();
    actualizarNavegacion();

    const pagina = obtenerNombrePagina();

    switch (pagina) {
        case "registro.html":
            initRegistro();
            break;
        case "login.html":
            initLogin();
            break;
        case "canchas.html":
            initCanchas();
            break;
        case "reservar.html":
            initReservar();
            break;
        case "mis-reservas.html":
            initMisReservas();
            break;
        case "partidos.html":
            initPartidos();
            break;
        case "estadisticas.html":
            initEstadisticas();
            break;
        case "panel-club.html":
            initPanelClub();
            break;
    }
});
