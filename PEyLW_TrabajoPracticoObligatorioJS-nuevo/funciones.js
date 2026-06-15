function marcarError(campo) {
    campo.style.border = "2px solid red";
    campo.style.backgroundColor = "#ffe6e6";
}

function limpiarEstilos(campo) {
    campo.style.border = "1px solid #cccccc";
    campo.style.backgroundColor = "";
}

function esEnteroPositivo(valor) {
    var texto = valor.trim();

    if (texto === "") {
        return false;
    }

    if (!/^\d+$/.test(texto)) {
        return false;
    }

    return parseInt(texto) > 0;
}

function esBisiesto(anio) {
    return (anio % 4 === 0 && anio % 100 !== 0) || (anio % 400 === 0);
}

function esFechaValida(dia, mes, anio) {
    dia = parseInt(dia);
    mes = parseInt(mes);
    anio = parseInt(anio);

    if (mes < 1 || mes > 12) {
        return false;
    }

    var diasEnMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (esBisiesto(anio)) {
        diasEnMes[1] = 29;
    }

    return dia >= 1 && dia <= diasEnMes[mes - 1];
}

function esEmailValido(email) {
    var patron = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return patron.test(email.trim());
}

function validar() {
    var nombre = document.getElementById("nombre");
    var apellido = document.getElementById("apellido");
    var email = document.getElementById("email");
    var obraSocial = document.getElementById("obras_sociales");
    var dia = document.getElementById("dia");
    var mes = document.getElementById("mes");
    var anio = document.getElementById("anio");
    var divMensajes = document.getElementById("divUsoOpcional");

    var campos = [nombre, apellido, email, obraSocial, dia, mes, anio];
    var i;

    for (i = 0; i < campos.length; i++) {
        limpiarEstilos(campos[i]);
    }

    divMensajes.innerHTML = "";
    divMensajes.style.color = "";

    var hayErrores = false;
    var mensajes = [];

    if (nombre.value.trim() === "") {
        marcarError(nombre);
        hayErrores = true;
        mensajes.push("El nombre es obligatorio.");
    }

    if (apellido.value.trim() === "") {
        marcarError(apellido);
        hayErrores = true;
        mensajes.push("El apellido es obligatorio.");
    }

    if (email.value.trim() === "") {
        marcarError(email);
        hayErrores = true;
        mensajes.push("El email es obligatorio.");
    } else if (!esEmailValido(email.value)) {
        marcarError(email);
        hayErrores = true;
        mensajes.push("El email no tiene un formato válido.");
    }

    if (obraSocial.value === "") {
        marcarError(obraSocial);
        hayErrores = true;
        mensajes.push("Debe seleccionar una obra social.");
    }

    var diaValido = esEnteroPositivo(dia.value);
    var mesValido = esEnteroPositivo(mes.value);
    var anioValido = esEnteroPositivo(anio.value);

    if (dia.value.trim() === "") {
        marcarError(dia);
        hayErrores = true;
        mensajes.push("El día es obligatorio.");
    } else if (!diaValido) {
        marcarError(dia);
        hayErrores = true;
        mensajes.push("El día debe ser un número entero positivo.");
    }

    if (mes.value.trim() === "") {
        marcarError(mes);
        hayErrores = true;
        mensajes.push("El mes es obligatorio.");
    } else if (!mesValido) {
        marcarError(mes);
        hayErrores = true;
        mensajes.push("El mes debe ser un número entero positivo.");
    }

    if (anio.value.trim() === "") {
        marcarError(anio);
        hayErrores = true;
        mensajes.push("El año es obligatorio.");
    } else if (!anioValido) {
        marcarError(anio);
        hayErrores = true;
        mensajes.push("El año debe ser un número entero positivo.");
    }

    if (diaValido && mesValido && anioValido && !esFechaValida(dia.value, mes.value, anio.value)) {
        marcarError(dia);
        marcarError(mes);
        marcarError(anio);
        hayErrores = true;
        mensajes.push("La fecha de nacimiento no es válida.");
    }

    if (hayErrores) {
        divMensajes.innerHTML = mensajes.join("<br>");
        divMensajes.style.color = "red";
        return false;
    }

    alert("Todos los datos son correctos.");
    return false;
}
