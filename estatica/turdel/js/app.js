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

function requerirSesion() {
    const sesion = obtenerSesion();
    if (!sesion) {
        alert("Debés iniciar sesión para acceder a esta sección.");
        window.location.href = "login.html";
        return null;
    }
    return sesion;
}

function actualizarNavegacion() {
    const sesion = obtenerSesion();
    const nav = document.querySelector(".nav");
    if (!nav) {
        return;
    }

    const linkLogin = nav.querySelector('a[href="login.html"]');
    const linkRegistro = nav.querySelector('a[href="registro.html"]');

    if (sesion && linkLogin && linkRegistro) {
        linkLogin.textContent = sesion.nombre + " (Salir)";
        linkLogin.href = "#";
        linkLogin.addEventListener("click", function (event) {
            event.preventDefault();
            guardarSesion(null);
            window.location.href = "index.html";
        });
        linkRegistro.textContent = "Mi cuenta";
        linkRegistro.href = "mis-reservas.html";
        linkRegistro.classList.remove("nav__cta");
        linkRegistro.classList.add("nav__link");
    }
}

// ========== Validación de formularios (estilo TP 12 / TP 14) ==========

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

function validarCampoObligatorio(valor, mensaje, grupo, errores) {
    if (valor.trim() === "") {
        errores.push(mensaje);
        marcarGrupoError(grupo);
        return false;
    }
    marcarGrupoValido(grupo);
    return true;
}

// ========== Registro ==========

function initRegistro() {
    const formulario = document.getElementById("form-registro");
    const alerta = document.getElementById("alert-registro");

    if (!formulario) {
        return;
    }

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

        validarCampoObligatorio(nombre.value, "El nombre es obligatorio.", nombre.parentElement, errores);
        validarCampoObligatorio(apellido.value, "El apellido es obligatorio.", apellido.parentElement, errores);

        if (email.value.trim() === "") {
            errores.push("El email es obligatorio.");
            marcarGrupoError(email.parentElement);
        } else if (!esEmailValido(email.value)) {
            errores.push("Ingresá un email válido.");
            marcarGrupoError(email.parentElement);
        } else {
            marcarGrupoValido(email.parentElement);
        }

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
            apellido: apellido.value.trim(),
            email: email.value.trim().toLowerCase(),
            telefono: telefono.value.trim(),
            contraseña: contraseña.value,
            ciudad: ciudad.value
        };

        usuarios.push(nuevoUsuario);
        guardarUsuarios(usuarios);
        guardarSesion({
            id: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email
        });

        mostrarAlerta(alerta, "Cuenta creada con éxito. Redirigiendo...", "exito");
        setTimeout(function () {
            window.location.href = "reservar.html";
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
            email: usuarioEncontrado.email
        });

        mostrarAlerta(alerta, "Ingreso exitoso. Redirigiendo...", "exito");
        setTimeout(function () {
            window.location.href = "mis-reservas.html";
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
        '<div class="cancha-card__footer">' +
        '<a class="btn btn--verde btn--chico" href="reservar.html?cancha=' + cancha.id + "&fecha=" + fecha + '">Reservar</a>' +
        "</div></div>";

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

    for (i = 0; i < CANCHAS.length; i++) {
        const cancha = CANCHAS[i];
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

function crearBotonHorario(horario, ocupado, seleccionado) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = horario;
    boton.className = "horario";

    if (ocupado) {
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
        const ocupado = turnoEstaOcupado(fecha, canchaId, horario, reservas, reservaEditandoId);
        const seleccionado = horario === horarioSeleccionado;
        grilla.appendChild(crearBotonHorario(horario, ocupado, seleccionado));
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
    const formulario = document.getElementById("form-reserva");
    const alerta = document.getElementById("alert-reserva");
    const fechaInput = document.getElementById("fecha-reserva");
    const canchaSelect = document.getElementById("cancha-reserva");
    const params = new URLSearchParams(window.location.search);

    if (!formulario) {
        return;
    }

    ocultarAlerta(alerta);

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
    const formModificar = document.getElementById("form-modificar");
    const btnDescartar = document.getElementById("btn-descartar-mod");

    if (!document.getElementById("reservas-tbody")) {
        return;
    }

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

function crearTarjetaPartido(partido, sesion) {
    const cancha = obtenerCanchaPorId(partido.canchaId);
    const tarjeta = document.createElement("article");
    tarjeta.className = "partido-card";

    const tituloNivel = partido.nivel.charAt(0).toUpperCase() + partido.nivel.slice(1);
    let htmlJugadores = "";
    let i;

    for (i = 0; i < partido.jugadores.length; i++) {
        htmlJugadores += '<span class="jugador-badge">' + partido.jugadores[i] + "</span>";
    }

    const libres = 4 - partido.jugadores.length;
    for (i = 0; i < libres; i++) {
        htmlJugadores += '<span class="jugador-badge jugador-badge--libre">+1 libre</span>';
    }

    tarjeta.innerHTML =
        "<h3>Partido " + tituloNivel + "</h3>" +
        '<p class="partido-card__meta">' +
        formatearFecha(partido.fecha) + " · " + partido.horario + " hs<br>" +
        (cancha ? cancha.nombre + " · " + cancha.ubicacionLabel : "") +
        "</p>" +
        '<div class="partido-card__jugadores">' + htmlJugadores + "</div>";

    const btnUnirse = document.createElement("button");
    btnUnirse.type = "button";
    btnUnirse.className = "btn btn--verde btn--chico";
    btnUnirse.textContent = "Unirme al partido";

    const yaUnido = false;
    const nombreCorto = sesion ? sesion.nombre + " " + (sesion.apellido ? sesion.apellido.charAt(0) + "." : "") : "";

    if (sesion) {
        for (i = 0; i < partido.jugadores.length; i++) {
            if (partido.jugadores[i].indexOf(sesion.nombre) === 0) {
                btnUnirse.disabled = true;
                btnUnirse.textContent = "Ya estás inscripto";
            }
        }
    }

    if (partido.jugadores.length >= 4) {
        btnUnirse.disabled = true;
        btnUnirse.textContent = "Partido completo";
    }

    btnUnirse.addEventListener("click", function () {
        unirseAPartido(partido.id, nombreCorto || "Jugador");
    });

    tarjeta.appendChild(btnUnirse);
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

function unirseAPartido(id, nombreJugador) {
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

    const nombreCompleto = sesion.nombre + " " + apellido.charAt(0) + ".";
    const partidos = obtenerPartidos();

    for (i = 0; i < partidos.length; i++) {
        if (partidos[i].id === id) {
            if (partidos[i].jugadores.length >= 4) {
                alert("El partido ya está completo.");
                return;
            }
            partidos[i].jugadores.push(nombreCompleto);
            break;
        }
    }

    guardarPartidos(partidos);
    cargarPartidos();

    const alerta = document.getElementById("alert-partidos");
    mostrarAlerta(alerta, "Te uniste al partido con éxito.", "info");
}

function initPartidos() {
    const formulario = document.getElementById("form-partido");
    const alerta = document.getElementById("alert-partidos");

    if (!formulario) {
        return;
    }

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
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Todavía no cargaste resultados.</td></tr>';
        return;
    }

    for (i = delUsuario.length - 1; i >= 0; i--) {
        const stat = delUsuario[i];
        const cancha = obtenerCanchaPorId(stat.canchaId);
        const fila = document.createElement("tr");
        const claseResultado = stat.resultado === "victoria" ? "estado--confirmada" : "estado--cancelada";
        const textoResultado = stat.resultado === "victoria" ? "Victoria" : "Derrota";

        fila.innerHTML =
            "<td>" + formatearFecha(stat.fecha) + "</td>" +
            "<td>" + (cancha ? cancha.nombre.replace(" — ", " ") : stat.canchaId) + "</td>" +
            "<td>" + stat.rival + "</td>" +
            '<td><span class="estado ' + claseResultado + '">' + textoResultado + "</span></td>" +
            "<td>" + formatearSets(stat) + "</td>";

        tbody.appendChild(fila);
    }
}

function initEstadisticas() {
    const formulario = document.getElementById("form-stats");
    const alerta = document.getElementById("alert-stats");

    if (!formulario) {
        return;
    }

    ocultarAlerta(alerta);
    cargarTablaEstadisticas();

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const sesion = requerirSesion();
        if (!sesion) {
            return;
        }

        const rival = document.getElementById("stats-rival");
        const resultado = document.getElementById("stats-resultado");
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

        if (errores.length > 0) {
            mostrarAlerta(alerta, errores.join(" "), "aviso");
            return;
        }

        const estadisticas = obtenerEstadisticas();
        const nuevoRegistro = {
            id: generarId(),
            usuarioId: sesion.id,
            fecha: document.getElementById("stats-fecha").value,
            canchaId: document.getElementById("stats-cancha").value,
            rival: rival.value.trim(),
            resultado: resultado.value,
            set1: document.getElementById("stats-set1").value.trim(),
            set2: document.getElementById("stats-set2").value.trim(),
            set3: document.getElementById("stats-set3").value.trim(),
            notas: document.getElementById("stats-notas").value.trim()
        };

        estadisticas.push(nuevoRegistro);
        guardarEstadisticas(estadisticas);
        formulario.reset();
        document.getElementById("stats-fecha").value = new Date().toISOString().split("T")[0];
        cargarTablaEstadisticas();
        mostrarAlerta(alerta, "Resultado guardado con éxito.", "exito");
    });
}

// ========== Inicialización ==========

document.addEventListener("DOMContentLoaded", function () {
    inicializarDatosPorDefecto();
    actualizarNavegacion();

    const pagina = obtenerNombrePagina();

    if (pagina === "registro.html") {
        initRegistro();
    } else if (pagina === "login.html") {
        initLogin();
    } else if (pagina === "canchas.html") {
        initCanchas();
    } else if (pagina === "reservar.html") {
        initReservar();
    } else if (pagina === "mis-reservas.html") {
        initMisReservas();
    } else if (pagina === "partidos.html") {
        initPartidos();
    } else if (pagina === "estadisticas.html") {
        initEstadisticas();
    }
});
