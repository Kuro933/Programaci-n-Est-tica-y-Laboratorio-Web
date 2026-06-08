// Ejercicio 2 - versión con archivo externo
console.log("Hola Mundo");

// Ejercicio 3
// let nombre = "María";
// let edad = 15;
//
// console.log(nombre);
// console.log(edad);
// if (edad >= 18) {
//     console.log("Puede ingresar");
//     console.log("Es mayor de edad");
// }
// Con edad = 15 no entra al if porque 15 < 18, por eso no se muestran esos mensajes.

// Ejercicio 4
const nombre = "María";
const apellido = "Pérez";
let edad = 20;
console.log(nombre);
console.log(apellido);
console.log(edad);
edad = edad + 1;
console.log(edad);

const materia = "";
let puntos = 0;
puntos += 10;
console.log(puntos);

// Ejercicio 5
let nombreEj5 = "María";
let saldo = 250000;
let permitido = true;
let dias = ["Lunes", "Martes", "Miércoles"];
let alumno = { nombre: "María", edad: 20 };
console.log(nombreEj5);
console.log(saldo);
console.log(permitido);
console.log(dias);
console.log(alumno);

let materias = ["Matematicas", "lengua", "ingles"];
let carne = { nombre: "vacio", precio: 20000 };
console.log("El corte: ", carne.nombre, " cuesta : $", carne.precio);

// Ejercicio 6
// No es posible cambiar todo a const porque edad y puntos deben modificarse.
// Lo recomendable es usar const para valores fijos y let para los que cambian.

// Ejercicio 7
console.log(2 + 3);
console.log("hola " + "mundo");
console.log("2" + 3);
console.log(2 + "3");
console.log("El resultado es: " + (2 + 3));
console.log("74" + 15, "Concatenacion de cadena");
console.log(58 + "5", "suma");
// Suma numérica: console.log(2 + 3) y console.log("El resultado es: " + (2 + 3))
// Concatenación: console.log("2" + 3), console.log(2 + "3"), console.log("74" + 15)

// Ejercicio 8
let x = 10;
let y = 3;
console.log(x + y);
console.log(x - y);
console.log(x * y);
console.log(x / y);
console.log(x % y);
x += 5;
console.log(x);

const numero = 10;
let menos = 15;
let multi = 12;
let division = 25;
let porcentaje = 45;
menos -= numero;
console.log(menos);
multi *= numero;
console.log(multi);
division /= numero;
console.log(division);
porcentaje %= numero;
console.log(porcentaje);

let cantidad = 0;
cantidad++;
cantidad++;
cantidad++;
cantidad++;
cantidad++;
console.log(cantidad);

let intentos = 10;
intentos--;
intentos--;
intentos--;
intentos--;
intentos--;
intentos--;
console.log(intentos);

// Ejercicio 9
const edadEj9 = 20;
console.log(edadEj9 > 18);
console.log(edadEj9 >= 21);
console.log(edadEj9 == "20");
console.log(edadEj9 === "20");
console.log(edadEj9 !== "20");
// == compara valores convirtiendo tipos; === compara valor y tipo sin convertir.

// Ejercicio 10
let edadEj10 = 20;
let tieneDocumento = true;
let puedeIngresar = edadEj10 >= 18 && tieneDocumento;
console.log(puedeIngresar);
let esInvitado = false;
console.log(puedeIngresar || esInvitado);
console.log(!tieneDocumento);

let inscripta = true;
let suspendida = false;
let puedeRendir = inscripta && !suspendida;
console.log(puedeRendir);

// Ejercicio 11
let mensajeGlobal = "Estoy fuera del bloque";
if (true) {
 let mensajeLocal = "Estoy dentro del bloque";
 console.log(mensajeGlobal);
 console.log(mensajeLocal);
}
console.log(mensajeGlobal);
// console.log(mensajeLocal); // Descomentar y observar el error
// mensajeLocal no está disponible fuera del bloque porque fue declarada con let dentro del if.

// Ejercicio 12
{
 // Constantes: datos del alumno que no cambian durante la ejecución
 const nombre = "María";
 const apellido = "Pérez";
 const materia = "Programación Estática y Laboratorio Web";

 // Variables modificables: las notas pueden actualizarse
 let nota1 = 7;
 let nota2 = 8;
 let nota3 = 7;

 // Cálculo del promedio de las tres notas
 const promedio = (nota1 + nota2 + nota3) / 3;
 const nombreCompleto = nombre + " " + apellido;

 console.log("Alumno: " + nombreCompleto);
 console.log("Materia: " + materia);
 console.log("Promedio: " + promedio.toFixed(2));

 // Variable booleana: true si el promedio es mayor o igual a 6
 const aprobado = promedio >= 6;
 console.log("Aprobado: " + aprobado);
}
