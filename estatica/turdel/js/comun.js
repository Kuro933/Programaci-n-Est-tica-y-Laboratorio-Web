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
    const linkMisReservas = nav.querySelector(".nav__jugador.nav__mis-reservas");
    const linkPartidos = nav.querySelector(".nav__jugador.nav__partidos");
    const linkEstadisticas = nav.querySelector(".nav__jugador.nav__estadisticas");
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
