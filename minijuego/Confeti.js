// Confetis

//
// 1. Configuración Inicial
window.oncontextmenu = function () {
  return false;
};

const canvasConfeti = document.getElementById("canvas1"); //Lienzo
const ctxConfeti = canvasConfeti.getContext("2d"); // Funciones

let ancho = (canvasConfeti.width = window.innerWidth);
let alto = (canvasConfeti.height = window.innerHeight);

let confetis = [];

const coloresConfeti = [ 
  "rgba(249, 161, 188, 1)", // Rosa suave 
  "rgba(255, 217, 125, 1)", // Amarillo cálido 
  "rgba(205, 180, 219, 1)", // Lavanda clara 
  "rgba(255, 179, 71, 1)",  // Detalle sol/dorado 
  "rgba(246, 121, 139, 1)", // Rosa más intenso
  "rgba(224, 130, 144, 1)", // Rosa medio 
  "rgba(255, 243, 247, 1)", // Rosa muy claro
];

// 2. Crear Confeti
export function crearConfeti(cantidad) {
  for (let i = 0; i < cantidad; i++) {
    confetis.push({
      x: Math.random() * ancho, // Posición Horizontal Aleatoria
      y: Math.random() * -alto, // Posición Vertical Aleatoria (Desde arriba por el negativo)
      r: Math.random() * 5 + 2, // Radio Aleatorio (2 y 7 Pixeles)
      color: coloresConfeti[Math.floor(Math.random() * coloresConfeti.length)],
      velocidadY: Math.random() * 2 + 1, // Velocidad Aleatoria (1 y 3 Pixeles/Frame)
    });
  }
}

// 3. Dibujar y Mover Confeti
export function animarConfeti() {

  ctxConfeti.clearRect(0, 0, ancho, alto); // Limpiar Lienzo

  for (let i = 0; i < confetis.length; i++) {
    let confetiActual = confetis[i];

    ctxConfeti.beginPath(); // Empezamos Una Nueva Figura
    ctxConfeti.arc(
      confetiActual.x,
      confetiActual.y,
      confetiActual.r,
      0,
      Math.PI * 2
    ); // Dibujamos Un Círculo
    ctxConfeti.fillStyle = confetiActual.color; // Color
    ctxConfeti.fill(); // Rellenamos El Círculo

    // Movimiento (Caída Libre)
    confetiActual.y += confetiActual.velocidadY;

    // Si Termina De Caer, Aparece Arriba Nuevamente
    if (confetiActual.y > alto) {
      confetiActual.y = -10;
      confetiActual.x = Math.random() * ancho;
    }
  }

  // Animación Continua (Llama de nuevo a la función)
  requestAnimationFrame(animarConfeti);
}