(function () {
    var guardado = localStorage.getItem("turdel_tema");
    var tema;

    if (guardado === "oscuro" || guardado === "claro") {
        tema = guardado;
    } else if (window.matchMedia("(prefers-color-scheme: oscuro)").matches) {
        tema = "oscuro";
    } else {
        tema = "claro";
    }

    document.documentElement.setAttribute("data-theme", tema);
})();
