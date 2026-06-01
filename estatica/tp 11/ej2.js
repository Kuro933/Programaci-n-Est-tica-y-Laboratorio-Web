// console.log("Hola Mundo");

// let nombre = "María";
// let edad = 15;

// console.log(nombre);
// console.log(edad);
// if (edad >= 18) {
//     console.log("Puede ingresar");
//     console.log("Es mayor de edad");
// }


let x = 10;
let y = 3;
console.log(x + y);
console.log(x - y);
console.log(x * y);
console.log(x / y);
console.log(x % y);
x += 5;
console.log(x);


let mensajeGlobal = "Estoy fuera del bloque";
if (true) {
 let mensajeLocal = "Estoy dentro del bloque";
 console.log(mensajeGlobal);
 console.log(mensajeLocal);
}
console.log(mensajeGlobal);
// console.log(mensajeLocal); // Descomentar y observar el error