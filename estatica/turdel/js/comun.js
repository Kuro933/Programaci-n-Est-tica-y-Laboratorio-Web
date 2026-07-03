// ========== Utilidades generales ==========

const TEMA_STORAGE_KEY = "turdel_tema";

function obtenerTemaPreferido() {
    const guardado = localStorage.getItem(TEMA_STORAGE_KEY);
    if (guardado === "dark" || guardado === "light") {
        return guardado;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}

function aplicarTema(tema) {
    document.documentElement.setAttribute("data-theme", tema);
}

function actualizarBotonTema() {
    const boton = document.querySelector(".theme-toggle");
    if (!boton) {
        return;
    }

    const esOscuro = document.documentElement.getAttribute("data-theme") === "dark";
    boton.textContent = esOscuro ? "☀" : "☾";
    boton.setAttribute("aria-label", esOscuro ? "Activar modo claro" : "Activar modo oscuro");
    boton.setAttribute("title", esOscuro ? "Modo claro" : "Modo oscuro");
}

function alternarTema() {
    const esOscuro = document.documentElement.getAttribute("data-theme") === "dark";
    const nuevoTema = esOscuro ? "light" : "dark";
    localStorage.setItem(TEMA_STORAGE_KEY, nuevoTema);
    aplicarTema(nuevoTema);
    actualizarBotonTema();
}

function inicializarTema() {
    aplicarTema(obtenerTemaPreferido());

    const nav = document.querySelector(".nav");
    if (!nav) {
        return;
    }

    if (!nav.querySelector(".theme-toggle")) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "theme-toggle";
        boton.addEventListener("click", alternarTema);
        nav.appendChild(boton);
    }

    actualizarBotonTema();
}

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

const MODAL_ICONOS = {
    exito: "✓",
    info: "ℹ",
    aviso: "!",
    peligro: "?"
};

const MODAL_TITULOS = {
    exito: "¡Listo!",
    info: "Información",
    aviso: "Atención",
    peligro: "¿Estás seguro?"
};

let modalResolver = null;

function asegurarModal() {
    if (document.getElementById("turdel-modal")) {
        return;
    }

    const overlay = document.createElement("div");
    overlay.id = "turdel-modal";
    overlay.className = "modal-overlay";
    overlay.innerHTML =
        '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">' +
            '<div class="modal__icon" id="modal-icon" aria-hidden="true"></div>' +
            '<h2 class="modal__titulo" id="modal-titulo"></h2>' +
            '<p class="modal__mensaje" id="modal-mensaje"></p>' +
            '<div class="modal__acciones" id="modal-acciones"></div>' +
        "</div>";

    overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
            cerrarModal(false);
        }
    });

    document.body.appendChild(overlay);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && overlay.classList.contains("is-open")) {
            cerrarModal(false);
        }
    });
}

function cerrarModal(resultado) {
    const overlay = document.getElementById("turdel-modal");
    if (!overlay || !overlay.classList.contains("is-open")) {
        return;
    }

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");

    if (modalResolver) {
        const resolver = modalResolver;
        modalResolver = null;
        resolver(resultado);
    }
}

function configurarModal(mensaje, opciones) {
    asegurarModal();

    const overlay = document.getElementById("turdel-modal");
    const icono = document.getElementById("modal-icon");
    const titulo = document.getElementById("modal-titulo");
    const cuerpo = document.getElementById("modal-mensaje");
    const acciones = document.getElementById("modal-acciones");
    const tipo = opciones.tipo || "info";

    icono.className = "modal__icon modal__icon--" + tipo;
    icono.textContent = MODAL_ICONOS[tipo] || MODAL_ICONOS.info;
    titulo.textContent = opciones.titulo || MODAL_TITULOS[tipo] || MODAL_TITULOS.info;
    cuerpo.textContent = mensaje;
    acciones.innerHTML = "";

    return {
        overlay: overlay,
        acciones: acciones
    };
}

function mostrarAviso(mensaje, opciones) {
    opciones = opciones || {};

    return new Promise(function (resolver) {
        const modal = configurarModal(mensaje, opciones);
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "btn btn--verde";
        boton.textContent = opciones.textoBoton || "Aceptar";
        boton.addEventListener("click", function () {
            cerrarModal(true);
        });

        modal.acciones.appendChild(boton);
        modalResolver = function (confirmado) {
            if (opciones.onCerrar) {
                opciones.onCerrar();
            }
            resolver(confirmado);
        };

        modal.overlay.classList.add("is-open");
        modal.overlay.setAttribute("aria-hidden", "false");
        boton.focus();
    });
}

function confirmarAccion(mensaje, opciones) {
    opciones = opciones || {};

    return new Promise(function (resolver) {
        const modal = configurarModal(mensaje, {
            tipo: opciones.peligro ? "peligro" : "aviso",
            titulo: opciones.titulo || (opciones.peligro ? "¿Estás seguro?" : "Confirmar")
        });

        const btnCancelar = document.createElement("button");
        btnCancelar.type = "button";
        btnCancelar.className = "btn btn--outline";
        btnCancelar.textContent = opciones.textoCancelar || "Cancelar";
        btnCancelar.addEventListener("click", function () {
            cerrarModal(false);
        });

        const btnConfirmar = document.createElement("button");
        btnConfirmar.type = "button";
        btnConfirmar.className = opciones.peligro ? "btn btn--peligro" : "btn btn--verde";
        btnConfirmar.textContent = opciones.textoConfirmar || "Confirmar";
        btnConfirmar.addEventListener("click", function () {
            cerrarModal(true);
        });

        modal.acciones.appendChild(btnCancelar);
        modal.acciones.appendChild(btnConfirmar);

        modalResolver = resolver;
        modal.overlay.classList.add("is-open");
        modal.overlay.setAttribute("aria-hidden", "false");
        btnConfirmar.focus();
    });
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
        mostrarAviso("Debés iniciar sesión para acceder a esta sección.", {
            tipo: "aviso",
            onCerrar: function () {
                window.location.href = "login.html";
            }
        });
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
        mostrarAviso("Esta sección es solo para clubes registrados.", {
            tipo: "aviso",
            onCerrar: function () {
                window.location.href = "index.html";
            }
        });
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
                linkRegistro.hidden = true;
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
