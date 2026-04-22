// src/game/AudioManager.js
// Procedural sound effects via Web Audio API — no external files needed

let _ctx = null;

function getCtx() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    return _ctx;
}

function playTone({ freq = 440, type = 'square', duration = 0.1, vol = 0.3, freqEnd = null, delay = 0 }) {
    try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        if (freqEnd !== null) {
            osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + delay + duration);
        }
        gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
    } catch (e) { /* silently ignore if audio not available */ }
}

export const AudioManager = {
    // Collecte d'oignon — petit "ding" montant joyeux
    onion() {
        playTone({ freq: 520, freqEnd: 880, type: 'triangle', duration: 0.12, vol: 0.25 });
        playTone({ freq: 880, type: 'sine', duration: 0.08, vol: 0.15, delay: 0.1 });
    },

    // Saut — whoosh court
    jump() {
        playTone({ freq: 200, freqEnd: 420, type: 'sine', duration: 0.15, vol: 0.2 });
    },

    // Hit (touché par Farquaad) — choc grave
    hit() {
        playTone({ freq: 180, freqEnd: 60, type: 'sawtooth', duration: 0.25, vol: 0.4 });
        playTone({ freq: 80, type: 'square', duration: 0.15, vol: 0.3, delay: 0.05 });
    },

    // Victoire — fanfare courte
    win() {
        [0, 0.12, 0.24, 0.36].forEach((delay, i) => {
            playTone({ freq: [523, 659, 784, 1047][i], type: 'triangle', duration: 0.18, vol: 0.28, delay });
        });
    },

    // Game over — descente grave
    gameOver() {
        playTone({ freq: 440, freqEnd: 110, type: 'sawtooth', duration: 0.6, vol: 0.4 });
        playTone({ freq: 220, freqEnd: 55, type: 'square', duration: 0.5, vol: 0.3, delay: 0.1 });
    },
};
