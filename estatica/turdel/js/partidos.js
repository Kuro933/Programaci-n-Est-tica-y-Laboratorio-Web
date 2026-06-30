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
