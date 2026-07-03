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

async function cancelarReserva(id) {
    const confirmado = await confirmarAccion("¿Confirmás la cancelación de esta reserva?", {
        titulo: "Cancelar reserva",
        textoConfirmar: "Sí, cancelar",
        peligro: true
    });

    if (!confirmado) {
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
    mostrarAviso("Reserva cancelada.", { tipo: "exito" });
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
            mostrarAviso("Reserva modificada con éxito.", { tipo: "exito" });
        });
    }

    if (btnDescartar) {
        btnDescartar.addEventListener("click", function () {
            document.getElementById("modificar-section").hidden = true;
            reservaModificandoId = null;
        });
    }
}
