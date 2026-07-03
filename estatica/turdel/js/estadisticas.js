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

async function eliminarEstadistica(id) {
    const confirmado = await confirmarAccion("¿Eliminar este resultado del historial?", {
        titulo: "Eliminar resultado",
        textoConfirmar: "Sí, eliminar",
        peligro: true
    });

    if (!confirmado) {
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
        "<td>" + (stat.notas ? stat.notas : "-") + "</td>" +
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
