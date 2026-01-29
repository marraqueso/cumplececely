// Variables de elementos HTML
let pantallainicial = document.querySelector(".pantallaini");
let globo = document.getElementById("globo"); 
let mensaje = document.getElementById("mensaje");

// Variables del juego
let size = 100; // tamaño inicial 
let maxSize = 300; // tamaño máximo antes de explotar 
let tiempoLimite = 10000; // 10 segundos
let startTime = Date.now(); // tiempo de inicio del juego

// Evento para ocultar la pantalla inicial al hacer clic 
pantallainicial.addEventListener("click", () => {
    pantallainicial.classList.add("ocultarinicio");
});


document.body.onkeydown = function(e) { 
    console.log(startTime);
    if (e.code === "Space") {
        let tiempoTranscurrido = Date.now() - startTime;
        console.log(tiempoTranscurrido);
        if (tiempoTranscurrido < tiempoLimite) { 
            size += 20; 
            globo.style.width = size + "px"; 
            globo.style.height = size + "px"; 
            if (size >= maxSize) { 
                explotar(); 
            } 
        } 
        else { 
            console.log("Tiempo límite alcanzado"); 
        } 
    } 
}; 

function explotar() { 
    globo.style.display = "none"; 
    mensaje.style.display = "block";

    // redirigir después de 2 segundos 
    setTimeout(() => { window.location.href = "../index.html"; 

    }, 2000);
 }

