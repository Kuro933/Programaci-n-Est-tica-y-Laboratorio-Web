// ========== Ejercicio 1: Validación de CUIT ==========
function validarCUIT(cuit) {
 if (typeof cuit !== "string" || !/^\d{11}$/.test(cuit)) {
  return false;
 }

 const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
 let suma = 0;

 for (let i = 0; i < 10; i++) {
  suma += Number(cuit.charAt(i)) * pesos[i];
 }

 const resto = suma % 11;
 let verificador = 11 - resto;

 if (verificador === 11) {
  verificador = 0;
 } else if (verificador === 10) {
  verificador = 9;
 }

 return verificador === Number(cuit.charAt(10));
}

// ========== Ejercicio 3: Palíndromo ==========
function esPalindromo(texto) {
 const normalizado = texto
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]/g, "");

 if (normalizado.length === 0) {
  return false;
 }

 const invertido = normalizado.split("").reverse().join("");
 return normalizado === invertido;
}

// ========== Ejercicio 4: Número primo ==========
function EsPrimo(numero) {
 if (!Number.isInteger(numero) || numero < 2) {
  return false;
 }

 if (numero === 2) {
  return true;
 }

 if (numero % 2 === 0) {
  return false;
 }

 for (let i = 3; i <= Math.sqrt(numero); i += 2) {
  if (numero % i === 0) {
   return false;
  }
 }

 return true;
}

// ========== Ejercicio 7: Recorrido del árbol ==========
function obtenerContenidoNodo(nodo) {
 if (nodo.nodeType === Node.TEXT_NODE) {
  return nodo.nodeValue.trim();
 }

 if (nodo.nodeType === Node.ELEMENT_NODE) {
  let texto = "";
  for (let i = 0; i < nodo.childNodes.length; i++) {
   if (nodo.childNodes[i].nodeType === Node.TEXT_NODE) {
    texto += nodo.childNodes[i].nodeValue;
   }
  }
  return texto.trim();
 }

 return "";
}

function recorrerArbol(nodo) {
 for (let i = 0; i < nodo.childNodes.length; i++) {
  const hijo = nodo.childNodes[i];
  const contenido = obtenerContenidoNodo(hijo);

  if (contenido !== "") {
   alert(contenido);
  }

  if (hijo.nodeType === Node.ELEMENT_NODE) {
   hijo.style.color = "gray";
  }

  recorrerArbol(hijo);
 }
}

// ========== Ejercicio 8: Agenda ==========
var a = Array();
a[0] = ["Juan Pérez", "Av. Argentina 3000", "Neuquén Capital", "154888888"];
a[1] = ["Tito Sánchez", "Av. Del Trabajador 300", "Neuquén Capital", "154555555"];
a[2] = ["Cecilia Carrizo", "Sierra Grande 900", "Neuquén Capital", "4485895"];
a[3] = ["Pedro González", "Amaranto Usares 1254", "Neuquén Capital", "4420444"];
a[4] = ["Verónica Lozano", "Saturnino Torres 100", "Neuquén Capital", "5425842"];

function crearFilaAgenda(datos) {
 const fila = document.createElement("tr");

 for (let i = 0; i < datos.length; i++) {
  const celda = document.createElement("td");
  celda.textContent = datos[i];
  fila.appendChild(celda);
 }

 const celdaAcciones = document.createElement("td");
 const enlaceBorrar = document.createElement("a");
 enlaceBorrar.href = "#";
 enlaceBorrar.className = "borrar";
 enlaceBorrar.textContent = "borrar";
 enlaceBorrar.addEventListener("click", function (event) {
  event.preventDefault();
  fila.remove();
 });
 celdaAcciones.appendChild(enlaceBorrar);
 fila.appendChild(celdaAcciones);

 return fila;
}

function cargarAgenda() {
 const cuerpoAgenda = document.getElementById("cuerpoAgenda");
 cuerpoAgenda.innerHTML = "";

 for (let i = 0; i < a.length; i++) {
  cuerpoAgenda.appendChild(crearFilaAgenda(a[i]));
 }
}

// ========== Ejercicio 9: Registro de notas ==========
function calcularPromedioNotas() {
 const tbody = document.querySelector("#tablaNotas tbody");
 const filas = tbody.rows;
 let suma = 0;
 let aprobados = 0;
 let desaprobados = 0;

 if (filas.length === 0) {
  document.getElementById("promedio").textContent = "Promedio: -";
  return;
 }

 for (let i = 0; i < filas.length; i++) {
  const nota = Number(filas[i].cells[3].textContent);
  suma += nota;

  if (nota >= 6) {
   aprobados++;
  } else {
   desaprobados++;
  }
 }

 const promedio = (suma / filas.length).toFixed(1);
 document.getElementById("promedio").textContent =
  "Promedio: " + promedio + " | Aprobados: " + aprobados + " | Desaprobados: " + desaprobados;
}

function agregarNota() {
 const nombre = document.getElementById("nombre").value.trim();
 const apellido = document.getElementById("apellido").value.trim();
 const nota = document.getElementById("nota").value.trim();

 if (nombre === "" || apellido === "" || nota === "") {
  return;
 }

 const tbody = document.querySelector("#tablaNotas tbody");
 const fila = tbody.insertRow();
 const numeroFila = tbody.rows.length;

 fila.insertCell().textContent = numeroFila;
 fila.insertCell().textContent = nombre;
 fila.insertCell().textContent = apellido;
 fila.insertCell().textContent = nota;

 const condicion = Number(nota) >= 6 ? "Aprobado" : "Desaprobado";
 fila.insertCell().textContent = condicion;

 const celdaAcciones = fila.insertCell();
 const btnEliminar = document.createElement("button");
 btnEliminar.type = "button";
 btnEliminar.className = "btn-eliminar";
 btnEliminar.textContent = "Eliminar";
 btnEliminar.addEventListener("click", function () {
  fila.remove();
  renumerarFilasNotas();
  calcularPromedioNotas();
 });
 celdaAcciones.appendChild(btnEliminar);

 document.getElementById("nombre").value = "";
 document.getElementById("apellido").value = "";
 document.getElementById("nota").value = "";

 calcularPromedioNotas();
}

function renumerarFilasNotas() {
 const filas = document.querySelector("#tablaNotas tbody").rows;
 for (let i = 0; i < filas.length; i++) {
  filas[i].cells[0].textContent = i + 1;
 }
}

// ========== Inicialización DOM ==========
document.addEventListener("DOMContentLoaded", function () {
 // Ejercicio 2: modo día / nocturno
 const btnTema = document.getElementById("btnTema");
 const temaGuardado = localStorage.getItem("tema");

 if (temaGuardado === "nocturno") {
  document.body.classList.add("modo-nocturno");
  btnTema.textContent = "Modo día";
 }

 btnTema.addEventListener("click", function () {
  document.body.classList.toggle("modo-nocturno");
  const esNocturno = document.body.classList.contains("modo-nocturno");
  btnTema.textContent = esNocturno ? "Modo día" : "Modo nocturno";
  localStorage.setItem("tema", esNocturno ? "nocturno" : "dia");
 });

 // Ejercicio 1
 document.getElementById("btnValidarCuit").addEventListener("click", function () {
  const cuit = document.getElementById("inputCuit").value.trim();
  const resultado = document.getElementById("resultadoCuit");
  const esValido = validarCUIT(cuit);
  resultado.textContent = esValido ? "CUIT correcto (VERDADERO)" : "CUIT incorrecto (FALSO)";
 });

 // Ejercicio 3
 document.getElementById("btnPalindromo").addEventListener("click", function () {
  const texto = document.getElementById("inputPalindromo").value;
  const resultado = document.getElementById("resultadoPalindromo");
  resultado.textContent = esPalindromo(texto)
   ? "Es palíndromo"
   : "No es palíndromo";
 });

 // Ejercicio 4
 document.getElementById("btnPrimo").addEventListener("click", function () {
  const valor = Number(document.getElementById("inputPrimo").value);
  const resultado = document.getElementById("resultadoPrimo");
  resultado.textContent = EsPrimo(valor)
   ? valor + " es primo"
   : valor + " no es primo";
 });

 // Ejercicio 6
 const posicionMouse = document.getElementById("posicionMouse");
 document.addEventListener("mousemove", function (event) {
  posicionMouse.textContent =
   "Navegador: (" + event.clientX + ", " + event.clientY + ") | " +
   "Página: (" + event.pageX + ", " + event.pageY + ")";
 });

 // Ejercicio 7
 document.getElementById("btnListar").addEventListener("click", function () {
  recorrerArbol(document.getElementById("algo"));
 });

 // Ejercicio 8
 cargarAgenda();
 document.getElementById("btnNuevoRegistro").addEventListener("click", function () {
  const nombre = document.getElementById("agendaNombre").value.trim();
  const direccion = document.getElementById("agendaDireccion").value.trim();
  const ciudad = document.getElementById("agendaCiudad").value.trim();
  const telefono = document.getElementById("agendaTelefono").value.trim();

  if (nombre === "" || direccion === "" || ciudad === "" || telefono === "") {
   return;
  }

  const cuerpoAgenda = document.getElementById("cuerpoAgenda");
  cuerpoAgenda.appendChild(crearFilaAgenda([nombre, direccion, ciudad, telefono]));

  document.getElementById("agendaNombre").value = "";
  document.getElementById("agendaDireccion").value = "";
  document.getElementById("agendaCiudad").value = "";
  document.getElementById("agendaTelefono").value = "";
 });

 // Ejercicio 9
 document.getElementById("btnAgregar").addEventListener("click", agregarNota);
});
