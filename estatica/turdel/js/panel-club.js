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
