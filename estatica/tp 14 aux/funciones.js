function validar() {
    let nombre = document.getElementById("nombre");
    let apellido = document.getElementById("apellido");
    let direccion = document.getElementById("direccion");
    let email = document.getElementById("email");
    let comentarios = document.getElementById("comentarios");
    let errores = document.getElementById("errores");
    let mensajes = [];
    let datos = [];
    let hayErrores = false;
    let exito = false;
    console.log(nombre, apellido, direccion, email, comentarios, errores);
    let campos = [nombre, apellido, direccion, email, comentarios];

    errores.innerHTML = "";
    errores.style.color = "";
    for (let campo of campos){
        limpiarEstilos(campo)
    }

    if(nombre.value.trim() == ""){
        mensajes.push("Es necesario que se ingrese un nombre");
        marcarErrores(nombre);
        hayErrores = true;
    }else{
        datos.push(nombre.value.trim());
    }
    if(apellido.value.trim() == ""){
        mensajes.push("Es necesario que se ingrese un apellido");
        marcarErrores(apellido);
        hayErrores = true;
    }else{
        datos.push(apellido.value.trim());
    }
    if(direccion.value.trim() == ""){
        mensajes.push("Es necesario que se ingrese una direccion");
        marcarErrores(direccion);
        hayErrores = true;
    }else{
        datos.push(direccion.value.trim());
    }
    if(email.value.trim() == ""){
        mensajes.push("Es necesario que se ingrese un email");
        marcarErrores(email);
        hayErrores = true;
    }else if(!esEmailValido(email.value.trim())){
        mensajes.push("Es necesario que se ingrese un email valido")
        marcarErrores(email);
        hayErrores = true;
    }else{
        datos.push("email: " + email.value.trim());
    }
    if(comentarios.value.trim() != ""){
        datos.push("comentarios: " + comentarios.value.trim())
    }else{
        mensajes.push("Es necesario ingresar comentarios")
        marcarErrores(comentarios);
        hayErrores = true;
    }

    if(hayErrores){
        errores.innerHTML = mensajes.join("<br>");
        errores.style.color = "red";
        return false;
    }else{
        errores.innerHTML = datos.join("<br>");
        errores.style.color = "green";
    }
    return false;
}

function esEmailValido(email) {
    var patron = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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