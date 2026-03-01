/* escritura.js */
(() => {
  'use strict';

  // ===== Configuración =====
  const CONFIG = {
    selectorCard: '.carta',
    selectorContainer: '#contenido',
    lineSelector: '.tw-line',
    signatureSelector: '.firma',

    initialDelay: 1500,  // ⏸️ pausa antes de empezar (ms)
    speed: 30,          // ms por carácter
    lineDelay: 320,     // ms entre líneas
    startThreshold: 0.35,

    sound: true,        // activar sonido
    soundVolume: 0.15,  // 0.0 - 1.0
    soundPerSpace: false,
    extraPauseAfter: /[,.!?:;…]/,
    extraPauseMs: 150
  };

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Audio (Web Audio API) =====
  class TypeClick {
    constructor(volume = 0.35) {
      this.ctx = null;
      this.gain = null;
      this.volume = volume;
      this.enabled = true;
      this.ready = false;

      // Desbloqueo de audio en iOS/Safari
      document.addEventListener('pointerdown', this._unlock, { once: true, passive: true });
      document.addEventListener('keydown', this._unlock, { once: true, passive: true });
    }

    _unlock = () => {
      try {
        if (!this.ctx) {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
          this.gain = this.ctx.createGain();
          this.gain.gain.value = this.volume;
          this.gain.connect(this.ctx.destination);
          this.ready = true;
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      } catch (e) {
        this.enabled = false;
      }
    };

    setVolume(v) {
      this.volume = v;
      if (this.gain) this.gain.gain.value = v;
    }
    play() {
        if (!this.enabled || prefersReduce) return;
        if (!this.ctx || !this.ready) return;

        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Ganancia master (ya tienes this.gain a destino)
        // Creamos un gancho local por disparo para moldear las capas juntas si queremos
        const master = ctx.createGain();
        master.gain.value = 1.0; // puedes bajar/ajustar aquí el volumen global del disparo
        master.connect(this.gain);

        // --- 1) CLICK AGUDO (martillo) ---
        // oscilador rápido + filtro bandpass en ~2.2–3.5 kHz
        const clickOsc = ctx.createOscillator();
        clickOsc.type = 'triangle'; // suena más “madera/metal” que square en este caso
        clickOsc.frequency.value = 2200 + Math.random() * 1400;

        const clickFilter = ctx.createBiquadFilter();
        clickFilter.type = 'bandpass';
        clickFilter.frequency.value = 2400 + Math.random() * 800;
        clickFilter.Q.value = 1.6;

        const clickEnv = ctx.createGain();
        clickEnv.gain.setValueAtTime(0.0001, now);
        // ataque ultra corto, decay rápido (8–18 ms)
        const clickDur = 0.010 + Math.random() * 0.010; // 10–20ms
        clickEnv.gain.exponentialRampToValueAtTime(1.0, now + 0.002);
        clickEnv.gain.exponentialRampToValueAtTime(0.0001, now + clickDur);

        clickOsc.connect(clickFilter).connect(clickEnv).connect(master);
        clickOsc.start(now);
        clickOsc.stop(now + clickDur + 0.01);

        // --- 2) THUNK MECÁNICO (grave + ruido) ---
        // a) Oscilador grave con decay mediano
        const thunkOsc = ctx.createOscillator();
        thunkOsc.type = 'sine';
        thunkOsc.frequency.value = 140 + Math.random() * 80; // 140–220 Hz

        const thunkEnv = ctx.createGain();
        thunkEnv.gain.setValueAtTime(0.0001, now);
        // decay un poco más largo que el click (60–110 ms)
        const thunkDur = 0.06 + Math.random() * 0.05;
        thunkEnv.gain.exponentialRampToValueAtTime(0.7, now + 0.008);
        thunkEnv.gain.exponentialRampToValueAtTime(0.0001, now + thunkDur);

        // Filtro suave para no invadir demasiado
        const lowFilter = ctx.createBiquadFilter();
        lowFilter.type = 'lowpass';
        lowFilter.frequency.value = 600;
        lowFilter.Q.value = 0.7;

        thunkOsc.connect(lowFilter).connect(thunkEnv).connect(master);
        thunkOsc.start(now);
        thunkOsc.stop(now + thunkDur + 0.02);

        // b) Ruido blanco corto, filtrado para sensación mecánica
        const noiseDur = 0.04 + Math.random() * 0.04; // 40–80 ms
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * (noiseDur + 0.02), ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.6; // white noise
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        // Filtro bandpass en zona media-baja para “mecánico”
        const noiseBP = ctx.createBiquadFilter();
        noiseBP.type = 'bandpass';
        noiseBP.frequency.value = 400 + Math.random() * 250; // 400–650 Hz
        noiseBP.Q.value = 0.8;

        const noiseEnv = ctx.createGain();
        noiseEnv.gain.setValueAtTime(0.0001, now);
        noiseEnv.gain.exponentialRampToValueAtTime(0.5, now + 0.004);
        noiseEnv.gain.exponentialRampToValueAtTime(0.0001, now + noiseDur);

        noise.connect(noiseBP).connect(noiseEnv).connect(master);
        noise.start(now);
        noise.stop(now + noiseDur + 0.02);

        // --- Micro-variación de paneo (opcional) ---
        // Le da una sensación más viva en estéreo
        try {
            const panner = new StereoPannerNode(ctx, { pan: (Math.random() - 0.5) * 0.3 }); // -0.15 a 0.15
            master.disconnect();
            master.connect(panner).connect(this.gain);
        } catch (e) {
            // Safari antiguo puede no soportar StereoPannerNode
            // En ese caso queda conectado a this.gain directamente
        }
    }
  }

  const clicker = new TypeClick(CONFIG.soundVolume);

  // ===== Utilidades =====
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function typeWriter(el, text, options) {
    const {
      speed,
      sound,
      soundPerSpace,
      extraPauseAfter,
      extraPauseMs
    } = options;

    // Asegura que sólo esta línea muestre el cursor
    document.querySelectorAll('.tw-line.is-typing').forEach(n => n.classList.remove('is-typing'));
    el.classList.add('is-typing');

    el.textContent = '';

    for (let i = 0; i < text.length; i++) {
      const ch = text.charAt(i);
      el.textContent += ch;

      if (sound && (soundPerSpace || ch !== ' ')) {
        clicker.play();
      }

      if (!prefersReduce) await sleep(speed);
      if (!prefersReduce && extraPauseAfter.test(ch)) {
        await sleep(extraPauseMs);
      }
    }

    // Línea terminada: quita cursor en este párrafo
    el.classList.remove('is-typing');
    el.classList.add('tw-done'); // por si quieres estilos de "terminado"
  }

  async function revealSignature(sigEl, options) {
    if (!sigEl) return;

    const effect = (sigEl.dataset.effect || 'fade').toLowerCase();

    if (effect === 'typing') {
      // Escritura de la firma (re-usa typeWriter)
      const text = sigEl.dataset.text || sigEl.textContent.trim();
      sigEl.textContent = '';
      // Reutilizamos clases de typing para que tenga cursor sólo al escribir
      sigEl.classList.add('tw-line');
      await typeWriter(sigEl, text, options);
      // Al terminar, no dejamos cursor
      sigEl.classList.remove('is-typing');
      sigEl.classList.add('tw-done');
    } else {
      // Fade-in sutil
      sigEl.classList.add('show');
    }
  }

  async function playSequence(container, sigEl, options = {}) {
    const {
      initialDelay = CONFIG.initialDelay,
      speed = CONFIG.speed,
      lineDelay = CONFIG.lineDelay,
      sound = CONFIG.sound,
      soundPerSpace = CONFIG.soundPerSpace,
      extraPauseAfter = CONFIG.extraPauseAfter,
      extraPauseMs = CONFIG.extraPauseMs,
      onStart = null,
      onEnd = null
    } = options;

    const lines = Array.from(container.querySelectorAll(CONFIG.lineSelector));

    if (!prefersReduce && initialDelay > 0) {
      await sleep(initialDelay);
    }

    if (typeof onStart === 'function') onStart();

    for (const line of lines) {
      const text = line.dataset.text || '';
      await typeWriter(line, text, {
        speed, sound, soundPerSpace, extraPauseAfter, extraPauseMs
      });
      if (!prefersReduce) await sleep(lineDelay);
    }

    // Al terminar todo el contenido: mostramos/escribimos la firma
    await revealSignature(sigEl, {
      speed, sound, soundPerSpace, extraPauseAfter, extraPauseMs
    });

    if (typeof onEnd === 'function') onEnd();
  }

  function init() {
    const card = document.querySelector(CONFIG.selectorCard);
    const contenido = document.querySelector(CONFIG.selectorContainer);
    const firma = document.querySelector(CONFIG.signatureSelector);
    if (!card || !contenido) return;

    // Si el usuario prefiere menos movimiento: pintamos todo de una
    if (prefersReduce) {
      Array.from(contenido.querySelectorAll(CONFIG.lineSelector)).forEach(l => {
        l.textContent = l.dataset.text || '';
      });
      if (firma) {
        // Mostramos firma sin animación
        if (firma.dataset.effect === 'typing' && firma.dataset.text) {
          firma.textContent = firma.dataset.text;
        }
        firma.classList.add('show');
      }
      return;
    }

    // Inicia cuando la carta entra al viewport
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !card.dataset.twPlayed) {
          card.dataset.twPlayed = '1';
          playSequence(contenido, firma, {
            initialDelay: CONFIG.initialDelay,
            speed: CONFIG.speed,
            lineDelay: CONFIG.lineDelay,
            sound: CONFIG.sound
          });
        }
      });
    }, { threshold: CONFIG.startThreshold });

    obs.observe(card);

    // Fallback por si no hay IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      setTimeout(() => {
        if (!card.dataset.twPlayed) {
          card.dataset.twPlayed = '1';
          playSequence(contenido, firma, {
            initialDelay: CONFIG.initialDelay,
            speed: CONFIG.speed,
            lineDelay: CONFIG.lineDelay,
            sound: CONFIG.sound
          });
        }
      }, 400);
    }

    // API pública simple
    window.escritura = {
      replay() {
        Array.from(contenido.querySelectorAll(CONFIG.lineSelector)).forEach(l => {
          l.textContent = '';
          l.classList.remove('is-typing', 'tw-done');
        });
        if (firma) {
          // Reset de firma
          if (firma.dataset.effect === 'typing') {
            firma.textContent = '';
            firma.classList.remove('is-typing', 'tw-done', 'show');
          } else {
            firma.classList.remove('show');
          }
        }
        playSequence(contenido, firma, {
          initialDelay: CONFIG.initialDelay,
          speed: CONFIG.speed,
          lineDelay: CONFIG.lineDelay,
          sound: CONFIG.sound
        });
      },
      setVolume(v) { clicker.setVolume(Math.max(0, Math.min(1, v))); },
      mute() { clicker.enabled = false; },
      unmute() { clicker.enabled = true; clicker._unlock(); }
    };
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();