// ========== Ejercicio 1: Validación de formulario ==========

function esEmailValido(email) {
    const patron = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return patron.test(email.trim());
}

function marcarErrores(campo) {
    campo.style.backgroundColor = "#ffe6e6";
    campo.style.border = "2px solid red";
}

function limpiarEstilos(campo) {
    campo.style.border = "1px solid #cccccc";
    campo.style.backgroundColor = "";
}

function validarFormulario(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre");
    const apellido = document.getElementById("apellido");
    const direccion = document.getElementById("direccion");
    const email = document.getElementById("email");
    const comentarios = document.getElementById("comentarios");
    const errores = document.getElementById("errores");
    const campos = [nombre, apellido, direccion, email, comentarios];
    const mensajes = [];
    const datos = [];
    let hayErrores = false;
    let i;

    errores.innerHTML = "";
    errores.style.color = "";

    for (i = 0; i < campos.length; i++) {
        limpiarEstilos(campos[i]);
    }

    if (nombre.value.trim() === "") {
        mensajes.push("Es necesario que se ingrese un nombre");
        marcarErrores(nombre);
        hayErrores = true;
    } else {
        datos.push("Nombre: " + nombre.value.trim());
    }

    if (apellido.value.trim() === "") {
        mensajes.push("Es necesario que se ingrese un apellido");
        marcarErrores(apellido);
        hayErrores = true;
    } else {
        datos.push("Apellido: " + apellido.value.trim());
    }

    if (direccion.value.trim() === "") {
        mensajes.push("Es necesario que se ingrese una direccion");
        marcarErrores(direccion);
        hayErrores = true;
    } else {
        datos.push("Dirección: " + direccion.value.trim());
    }

    if (email.value.trim() === "") {
        mensajes.push("Es necesario que se ingrese un email");
        marcarErrores(email);
        hayErrores = true;
    } else if (!esEmailValido(email.value.trim())) {
        mensajes.push("Es necesario que se ingrese un email valido");
        marcarErrores(email);
        hayErrores = true;
    } else {
        datos.push("Email: " + email.value.trim());
    }

    if (comentarios.value.trim() === "") {
        mensajes.push("Es necesario ingresar comentarios");
        marcarErrores(comentarios);
        hayErrores = true;
    } else {
        datos.push("Comentarios: " + comentarios.value.trim());
    }

    if (hayErrores) {
        errores.innerHTML = mensajes.join("<br>");
        errores.style.color = "red";
    } else {
        errores.innerHTML = datos.join("<br>");
        errores.style.color = "green";
    }
}

// ========== Ejercicio 2: Copa América ==========

function oponentes(P) {
    const paises1 = ["Argentina", "Bolivia", "Brasil", "Venezuela"];
    const paises2 = ["Colombia", "CostaRica", "Paraguay", "Ecuador"];
    let i;

    for (i = 0; i < paises1.length; i++) {
        if (paises1[i] === P) {
            return paises2[i];
        }
    }

    return "";
}

function buscarOponentes() {
    const pais = document.getElementById("pais").value;
    const oponente = oponentes(pais);
    const mensaje = document.getElementById("mensaje");

    mensaje.style.backgroundColor = "red";
    mensaje.innerHTML =
        "El oponente a " + pais +
        " en la segunda fecha de la Copa América es: " + oponente;
}

// ========== Ejercicio 3: Mover caja roja ==========

function moverCaja(event) {
    if (event) {
        event.preventDefault();
    }

    const topInput = document.getElementById("Top");
    const leftInput = document.getElementById("Left");
    const caja = document.getElementById("cajaRoja");
    const topVal = parseInt(topInput.value, 10);
    const leftVal = parseInt(leftInput.value, 10);

    if (
        isNaN(topVal) || isNaN(leftVal) ||
        topVal < 0 || topVal > 100 ||
        leftVal < 0 || leftVal > 400
    ) {
        caja.innerHTML = "Indices fuera de rango";
        return;
    }

    caja.style.top = topVal + "px";
    caja.style.left = leftVal + "px";
    caja.innerHTML = "Posición del div - Top: " + topVal + " / Left: " + leftVal;
}

// ========== Ejercicio 4: Pintar filas ==========

function pintarFilas(event) {
    if (event) {
        event.preventDefault();
    }

    const numeroInput = document.getElementById("Numero");
    const colorInput = document.getElementById("color");
    const numeroTexto = numeroInput.value.trim();
    const numero = parseInt(numeroTexto, 10);
    const filas = document.querySelectorAll("#tablaDatos tbody tr");
    let i;

    if (
        numeroTexto === "" ||
        isNaN(numeroTexto) ||
        numero !== parseFloat(numeroTexto) ||
        numero <= 0
    ) {
        alert("El número debe ser entero y mayor a cero.");
        return;
    }

    for (i = 0; i < filas.length; i++) {
        filas[i].style.backgroundColor = "";

        if ((i + 1) % numero === 0) {
            filas[i].style.backgroundColor = colorInput.value;
        }
    }
}

// ========== Inicialización DOM ==========

document.addEventListener("DOMContentLoaded", function () {
    const formDatosPersonales = document.getElementById("datosPersonales");
    const btnBuscarOponentes = document.getElementById("btnBuscarOponentes");
    const formMover = document.getElementById("formMover");
    const btnMover = document.getElementById("btnMover");
    const formPintar = document.getElementById("formPintar");
    const btnPintar = document.getElementById("btnPintar");

    if (formDatosPersonales) {
        formDatosPersonales.addEventListener("submit", validarFormulario);
    }

    if (btnBuscarOponentes) {
        btnBuscarOponentes.addEventListener("click", buscarOponentes);
    }

    if (formMover) {
        formMover.addEventListener("submit", moverCaja);
    }

    if (btnMover) {
        btnMover.addEventListener("click", moverCaja);
    }

    if (formPintar) {
        formPintar.addEventListener("submit", pintarFilas);
    }

    if (btnPintar) {
        btnPintar.addEventListener("click", pintarFilas);
    }
});
