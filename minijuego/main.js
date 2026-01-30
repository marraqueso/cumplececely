// Variables de elementos HTML
let pantallainicial = document.querySelector(".pantallaini");
let globo = document.getElementById("globo");
let juego = document.getElementById("juego"); 
let mensaje = document.getElementById("mensaje");
let juegoIniciado = false; // bandera para evitar reinicios

// Variables del juego
let size = 100; // tamaño inicial 
let maxSize = 300; // tamaño máximo antes de explotar 
let tiempoLimite = 10000; // 10 segundos
let tiempoRestante = tiempoLimite; 
let intervaloTiempo;

// Evento para ocultar la pantalla inicial al hacer clic 
pantallainicial.addEventListener("click", () => {
    pantallainicial.classList.add("ocultarinicio");
});

// inflar el globo al hacer clic en él
function inflarGlobo() { 
    size += 20; 
    globo.style.width = size + "px"; 
    globo.style.height = size + "px";
    console.log("Globo inflado a tamaño: " + size);
    if (size >= maxSize) { 
         explotar();
    }  
}

// Función para explotar el globo 
function explotar() { 
    clearInterval(intervaloTiempo); 
    mensaje.textContent = "¡El globo explotó!"; 
    globo.removeEventListener("click", inflarGlobo);
    mensaje.style.display = "block";
} 

// Función para terminar el juego por tiempo 
function terminarJuego() { 
    mensaje.textContent = "⏰ Se acabó el tiempo"; 
    globo.removeEventListener("click", inflarGlobo);
    mensaje.style.display = "block";
}

// Lógica del juego
function iniciarJuego() { 

    if (juegoIniciado) return; // evita reinicio 
    juegoIniciado = true;

    console.log("Juego iniciado"); 
    let startTime = Date.now(); 
    
    // activar clic en el globo 
    globo.addEventListener("click", inflarGlobo); 
    
    // iniciar cronómetro 
    intervaloTiempo = setInterval(() => { 
        tiempoRestante = tiempoLimite - (Date.now() - startTime); 
        console.log("Tiempo restante: " + tiempoRestante + " ms"); 
        
        // actualizar en pantalla si tienes un span con id="tiempo" 
        let tiempoSpan = document.getElementById("tiempo"); 
        
        if (tiempoSpan) { 
            tiempoSpan.textContent = Math.ceil(tiempoRestante / 1000); 
        }

        if (tiempoRestante <= 0) { 
            clearInterval(intervaloTiempo); 
            terminarJuego();
        } 
    },100); 
}

// Iniciar el juego después de ocultar la pantalla inicial
juego.addEventListener("click", () => { 
    iniciarJuego(); 
});
