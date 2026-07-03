// ========== Inicialización ==========

document.addEventListener("DOMContentLoaded", function () {
    inicializarDatosPorDefecto();
    inicializarTema();
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
