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
