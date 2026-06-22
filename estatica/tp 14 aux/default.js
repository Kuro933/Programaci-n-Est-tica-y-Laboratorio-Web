function oponentes(P) {
    var paises1 = ["Argentina", "Bolivia", "Brasil", "Venezuela"];
    var paises2 = ["Colombia", "CostaRica", "Paraguay", "Ecuador"];
    var i;

    for (i = 0; i < paises1.length; i++) {
        if (paises1[i] === P) {
            return paises2[i];
        }
    }

    return "";
}

function buscarOponentes() {
    var pais = document.getElementById("pais").value;
    var oponente = oponentes(pais);
    var mensaje = document.getElementById("mensaje");

    mensaje.style.backgroundColor = "red";
    mensaje.innerHTML =
        "El oponente a " + pais +
        " en la segunda fecha de la Copa América es: " + oponente;
}

function moverCaja() {
    var topInput = document.getElementById("Top");
    var leftInput = document.getElementById("Left");
    var caja = document.getElementById("cajaRoja");
    var topVal = parseInt(topInput.value, 10);
    var leftVal = parseInt(leftInput.value, 10);

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

function pintarFilas() {
    var numeroInput = document.getElementById("Numero");
    var colorInput = document.getElementById("color");
    var numeroTexto = numeroInput.value.trim();
    var numero = parseInt(numeroTexto, 10);
    var filas = document.querySelectorAll("#tablaDatos tbody tr");
    var i;

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
