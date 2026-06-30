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
