let globo = document.getElementById("globo"); 
let mensaje = document.getElementById("mensaje"); 
let size = 100; 

// tamaño inicial 
let maxSize = 300; 
// tamaño máximo antes de explotar 
let tiempoLimite = 10000;
// 10 segundos 
let startTime = Date.now(); 

document.body.onkeydown = function(e) { 
    if (e.code === "Space") {
        let tiempoTranscurrido = Date.now() - startTime;
        if (tiempoTranscurrido < tiempoLimite) { 
            size += 20; globo.style.width = size + "px"; 
            globo.style.height = size + "px"; 
            if (size >= maxSize) { 
                explotar(); 
            } 
        } 
        else { 
            explotar(); 
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

