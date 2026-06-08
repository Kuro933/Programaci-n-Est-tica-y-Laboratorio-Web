// ========== Ejercicio 1 ==========
function calcularPromedio(nota1, nota2, nota3) {
 return (nota1 + nota2 + nota3) / 3;
}

const promedio = calcularPromedio(7, 8, 6);
console.log(promedio);

function nombreCompleto(nombre, apellido) {
 return nombre + " " + apellido;
}

function estaAprobado(promedioNota) {
 return promedioNota >= 6;
}

console.log(nombreCompleto("María", "Pérez"));
console.log(estaAprobado(promedio));

// ========== Ejercicio 2 ==========
function mostrarResultado(nota) {
 if (nota >= 8) {
  console.log("Promociona");
 } else if (nota >= 6) {
  console.log("Aprueba");
 } else {
  console.log("Desaprueba");
 }
}

mostrarResultado(8);
mostrarResultado(4);
mostrarResultado(7);

// ========== Ejercicio 3 ==========
function mostrarOperacion(opcion) {
 switch (opcion) {
  case 1:
   console.log("Alta");
   break;
  case 2:
   console.log("Modificación");
   break;
  case 3:
   console.log("Baja");
   break;
  default:
   console.log("Opción incorrecta");
   break;
 }
}

// break detiene la ejecución del switch y evita que se ejecuten los demás case.
mostrarOperacion(1);
mostrarOperacion(2);
mostrarOperacion(3);
mostrarOperacion(9);

// ========== Ejercicio 4 ==========
const materias = ["HTML", "CSS", "JavaScript", "Python", "SQL"];

for (let i = 0; i < materias.length; i++) {
 console.log(materias[i]);
}

let contador = 1;
while (contador <= 5) {
 console.log(contador);
 contador++;
}

for (let j = 0; j < 10; j++) {
 if (j === 3) {
  break;
 }
 console.log("Ejemplo break: " + j);
}

// ========== Ejercicio 5 ==========
const numeros = [1, 2, 3, 4];
const dobles = numeros.map(function (numero) {
 return numero * 2;
});
console.log(dobles);

const notas = [6, 7, 8, 5];
const notasIncrementadas = notas.map(function (nota) {
 return nota + 1;
});
console.log(notasIncrementadas);

const nombres = ["María", "Juan", "Ana"];
const saludos = nombres.map(function (nombre) {
 return "Hola " + nombre;
});
console.log(saludos);

const alumnos = [
 { nombre: "María", nota: 8 },
 { nombre: "Juan", nota: 6 },
 { nombre: "Ana", nota: 9 }
];
const soloNombres = alumnos.map(function (alumno) {
 return alumno.nombre;
});
console.log(soloNombres);

// ========== Ejercicio 6 ==========
// Funciona con onclick/oninput, pero no se recomienda para código moderno.
function saludarLegacy() {
 console.log("Hola desde onclick");
}

function escribirLegacy() {
 console.log("Escribiendo en el input legacy");
}

// Forma moderna: addEventListener en script.js (ver ejercicios 7 en adelante).

// ========== Ejercicio 10 ==========
const texto = "Programación Estática";
const materiasEj10 = ["HTML", "CSS", "JavaScript"];
const fecha = new Date();

console.log(texto.length);
console.log(texto.toUpperCase());
console.log(materiasEj10.join(" - "));
console.log(fecha.getFullYear());
console.log(Math.round(4.6));
console.log(texto.indexOf("Estática"));
console.log(texto.replace("Estática", "Web"));
console.log(Math.random());
console.log(Math.sqrt(25));

// ========== Ejercicios 7 al 14 (DOM) ==========
const boton = document.getElementById("btnSaludar");
const mensaje = document.getElementById("mensaje");
const inputTeclado = document.getElementById("teclado");
const tecla = document.getElementById("tecla");
const formulario = document.getElementById("formulario");
const nombreForm = document.getElementById("nombreForm");
const mensajeForm = document.getElementById("mensajeForm");
const nombreInput = document.getElementById("nombre");
const observaciones = document.getElementById("observaciones");
const acepta = document.getElementById("acepta");
const materia = document.getElementById("materia");
const btnResumen = document.getElementById("btnResumen");
const resumen = document.getElementById("resumen");
const foto = document.getElementById("foto");
const btnCambiarImagen = document.getElementById("btnCambiarImagen");
const caja = document.getElementById("caja");
const btnEstilo = document.getElementById("btnEstilo");
const formAlumno = document.getElementById("formAlumno");
const nombreAlumno = document.getElementById("nombreAlumno");
const apellidoAlumno = document.getElementById("apellidoAlumno");
const edadAlumno = document.getElementById("edadAlumno");
const materiaAlumno = document.getElementById("materiaAlumno");
const aceptaReglamento = document.getElementById("aceptaReglamento");
const observacionesAlumno = document.getElementById("observacionesAlumno");
const resultadoAlumno = document.getElementById("resultadoAlumno");

// Ejercicio 7
function saludar() {
 mensaje.innerHTML = "Hola desde addEventListener";
}

boton.addEventListener("click", saludar);

// Ejercicio 8
function mostrarTecla(event) {
 tecla.textContent = event.key;
}

inputTeclado.addEventListener("keydown", mostrarTecla);

// Ejercicio 9
function validarFormulario(event) {
 event.preventDefault();

 if (nombreForm.value.trim() === "") {
  mensajeForm.textContent = "Debe ingresar un nombre";
 } else {
  mensajeForm.textContent = "Formulario enviado correctamente";
 }
}

formulario.addEventListener("submit", validarFormulario);

// Ejercicio 11
function mostrarResumenFormulario() {
 resumen.innerHTML =
  "Nombre: " + nombreInput.value + "<br>" +
  "Observaciones: " + observaciones.value + "<br>" +
  "Acepta condiciones: " + acepta.checked + "<br>" +
  "Materia: " + materia.value;
}

btnResumen.addEventListener("click", mostrarResumenFormulario);

// Ejercicio 12
function cambiarImagen() {
 foto.src = "imagen2.jpg";
}

btnCambiarImagen.addEventListener("click", cambiarImagen);

// Ejercicio 13
function cambiarEstilo() {
 // style permite acceder y modificar el CSS desde JavaScript.
 caja.style.backgroundColor = "lightblue";
 caja.style.color = "darkblue";
 caja.style.width = "300px";
 caja.style.padding = "20px";
}

btnEstilo.addEventListener("click", cambiarEstilo);

// Ejercicio 14
function agregarErrorSiVacio(valor, mensajeError, errores) {
 if (valor.trim() === "") {
  errores.push(mensajeError);
 }
}

function registrarAlumno(event) {
 event.preventDefault();
 const errores = [];

 agregarErrorSiVacio(nombreAlumno.value, "Debe ingresar el nombre", errores);
 agregarErrorSiVacio(apellidoAlumno.value, "Debe ingresar el apellido", errores);

 if (Number(edadAlumno.value) < 18) {
  errores.push("Debe ser mayor o igual de 18 años");
 }

 if (!aceptaReglamento.checked) {
  errores.push("Debe aceptar el reglamento");
 }

 if (errores.length > 0) {
  resultadoAlumno.innerHTML = errores.join("<br>");
 } else {
  resultadoAlumno.innerHTML =
   "<strong>Alumno registrado</strong><br>" +
   "Nombre: " + nombreAlumno.value + "<br>" +
   "Apellido: " + apellidoAlumno.value + "<br>" +
   "Edad: " + edadAlumno.value + "<br>" +
   "Materia: " + materiaAlumno.value + "<br>" +
   "Acepta reglamento: " + aceptaReglamento.checked + "<br>" +
   "Observaciones: " + observacionesAlumno.value;
 }
}

formAlumno.addEventListener("submit", registrarAlumno);
