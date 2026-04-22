// src/game/audio/CastleAudio.js
// Castle-themed audio system for Level 2
// Generates procedural castle dungeon music and sound effects via Web Audio API

import { EventBus } from '../EventBus.js';

let _ctx = null;
let _musicGain = null;
let _sfxGain = null;
let _masterGain = null;

function getCtx() {
    if (!_ctx) {
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return _ctx;
}

function ensureGains() {
    if (!_ctx) getCtx();
    if (!_masterGain) {
        _masterGain = _ctx.createGain();
        _masterGain.connect(_ctx.destination);
        _masterGain.gain.setValueAtTime(1.0, _ctx.currentTime);
    }
    if (!_musicGain) {
        _musicGain = _ctx.createGain();
        _musicGain.connect(_masterGain);
        _musicGain.gain.setValueAtTime(0.6, _ctx.currentTime);
    }
    if (!_sfxGain) {
        _sfxGain = _ctx.createGain();
        _sfxGain.connect(_masterGain);
        _sfxGain.gain.setValueAtTime(0.8, _ctx.currentTime);
    }
}

function playTone({ freq = 440, type = 'sine', duration = 0.1, vol = 0.3, freqEnd = null, delay = 0, gainNode = null }) {
    try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        const target = gainNode || ctx.destination;
        gain.connect(target);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        if (freqEnd !== null) {
            osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + delay + duration);
        }
        gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
    } catch (e) {}
}

function playNoise({ duration = 0.1, vol = 0.3, delay = 0, gainNode = null, filterFreq = null }) {
    try {
        const ctx = getCtx();
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        
        source.connect(gain);
        
        if (filterFreq) {
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(filterFreq, ctx.currentTime + delay);
            gain.connect(filter);
            filter.connect(gainNode || ctx.destination);
        } else {
            gain.connect(gainNode || ctx.destination);
        }
        
        source.start(ctx.currentTime + delay);
        source.stop(ctx.currentTime + delay + duration);
    } catch (e) {}
}

// ─── Background Music ──────────────────────────────────────────────────
let _musicRunning = false;
let _musicPlayRate = 1.0;
let _musicLoopId = null;

function stopBackgroundMusic() {
    _musicRunning = false;
    if (_musicLoopId) {
        clearTimeout(_musicLoopId);
        _musicLoopId = null;
    }
}

function playBackgroundMusic() {
    ensureGains();
    if (_musicRunning) return;
    _musicRunning = true;

    const ctx = getCtx();
    
    // Castle dungeon theme: A minor orchestral pattern (loop ~3.2 seconds)
    // Pattern: Am-F-C-G progression with arpeggio bass
    const pattern = [
        { freq: 110, dur: 0.4, type: 'sine' },    // A2 bass
        { freq: 110, dur: 0.2, type: 'sine' },
        { freq: 165, dur: 0.4, type: 'sine' },    // E3
        { freq: 165, dur: 0.2, type: 'sine' },
        { freq: 220, dur: 0.6, type: 'triangle' }, // A3 (Am chord root)
        { freq: 220, dur: 0.4, type: 'triangle' },
        { freq: 174, dur: 0.4, type: 'sine' },    // F3
        { freq: 174, dur: 0.6, type: 'sine' },
        { freq: 262, dur: 0.8, type: 'triangle' }, // C4
        { freq: 262, dur: 0.4, type: 'triangle' },
        { freq: 196, dur: 0.4, type: 'sine' },    // G3
        { freq: 196, dur: 0.6, type: 'sine' },
    ];

    const playOnce = () => {
        if (!_musicRunning) return;
        
        let totalTime = 0;
        pattern.forEach(note => {
            const noteGain = (_musicGain.gain.value || 0.6) * 0.15;
            playTone({
                freq: note.freq,
                type: note.type,
                duration: note.dur / _musicPlayRate,
                vol: noteGain,
                delay: totalTime,
                gainNode: _musicGain
            });
            totalTime += note.dur / _musicPlayRate;
        });

        // Schedule next loop (approx 3.2 seconds adjusted for play rate)
        const loopTime = (totalTime + 0.2) * 1000 / _musicPlayRate;
        _musicLoopId = setTimeout(playOnce, loopTime);
    };

    playOnce();
}

export const CastleAudio = {
    init() {
        ensureGains();
        this.registerEventListeners();
    },

    registerEventListeners() {
        EventBus.on('oignon-collected', () => this.oinionCollect());
        EventBus.on('guard-hit', () => this.guardAlert());
        EventBus.on('spike-hit', () => this.spikeHit());
        EventBus.on('door-close', () => this.doorClose());
        EventBus.on('boss-roar', () => this.bossRoar());
        EventBus.on('level-complete', () => this.victoryFanfare());
        EventBus.on('player-death', () => this.deathSfx());
        EventBus.on('boss-speed-change', (factor) => this.setBossPhaseMusic(factor));
    },

    // ─── Music control ─────────────────────────────────────────────────
    startMusic() {
        stopBackgroundMusic();
        playBackgroundMusic();
    },

    stopMusic() {
        stopBackgroundMusic();
    },

    // ─── Boss phase music: accelerate when Farquaad speeds up ─────────
    setBossPhaseMusic(speedFactor) {
        // speedFactor range: 1.0 -> 1.4 (boss speeds up by 40%)
        _musicPlayRate = 1.0 + (speedFactor - 1.0) * 0.5; // Tempo +20-40%
    },

    // ─── Tension phase: increase tempo near level end (x > 4500) ──────
    setTensionPhase(intensity) {
        // intensity: 0.0 (normal) to 1.0 (max tension)
        _musicPlayRate = 1.0 + intensity * 0.2; // Tempo +10-20%
    },

    // ─── Audio ducking: reduce music during SFX peaks ─────────────────
    audioDuck(duckAmount) {
        try {
            const ctx = getCtx();
            const currentVol = _musicGain.gain.value;
            _musicGain.gain.setTargetAtTime(currentVol * (1 - duckAmount), ctx.currentTime, 0.05);
            _musicGain.gain.setTargetAtTime(currentVol, ctx.currentTime + 0.3, 0.1);
        } catch (e) {}
    },

    // ─── Volume controls ───────────────────────────────────────────────
    setMasterVolume(vol) {
        ensureGains();
        try {
            _masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), getCtx().currentTime, 0.05);
        } catch (e) {}
    },

    setMusicVolume(vol) {
        ensureGains();
        try {
            _musicGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), getCtx().currentTime, 0.05);
        } catch (e) {}
    },

    setSfxVolume(vol) {
        ensureGains();
        try {
            _sfxGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), getCtx().currentTime, 0.05);
        } catch (e) {}
    },

    getMasterVolume() {
        ensureGains();
        return _masterGain.gain.value;
    },

    getMusicVolume() {
        ensureGains();
        return _musicGain.gain.value;
    },

    getSfxVolume() {
        ensureGains();
        return _sfxGain.gain.value;
    },

    // ─── Mute/unmute ───────────────────────────────────────────────────
    mute(isMuted) {
        ensureGains();
        try {
            if (isMuted) {
                _masterGain.gain.setTargetAtTime(0, getCtx().currentTime, 0.1);
            } else {
                _masterGain.gain.setTargetAtTime(1.0, getCtx().currentTime, 0.1);
            }
        } catch (e) {}
    },

    // ─── Sound Effects ─────────────────────────────────────────────────

    // Oignon collection: cheerful chime/bell (200ms)
    oinionCollect() {
        try {
            // Upward arpeggio
            playTone({
                freq: 523,
                freqEnd: 659,
                type: 'sine',
                duration: 0.08,
                vol: 0.25,
                gainNode: _sfxGain
            });
            playTone({
                freq: 659,
                type: 'triangle',
                duration: 0.06,
                vol: 0.2,
                delay: 0.08,
                gainNode: _sfxGain
            });
            playTone({
                freq: 784,
                type: 'sine',
                duration: 0.08,
                vol: 0.18,
                delay: 0.14,
                gainNode: _sfxGain
            });
            this.audioDuck(0.15);
        } catch (e) {}
    },

    // Guard alert: short horn blast (200ms)
    guardAlert() {
        try {
            // Sharp horn tone
            playTone({
                freq: 440,
                freqEnd: 520,
                type: 'square',
                duration: 0.15,
                vol: 0.4,
                gainNode: _sfxGain
            });
            playTone({
                freq: 330,
                type: 'sawtooth',
                duration: 0.1,
                vol: 0.25,
                delay: 0.1,
                gainNode: _sfxGain
            });
            this.audioDuck(0.2);
        } catch (e) {}
    },

    // Spike hit: metallic impact + electric zap (400ms)
    spikeHit() {
        try {
            // Metallic impact
            playNoise({
                duration: 0.1,
                vol: 0.35,
                gainNode: _sfxGain,
                filterFreq: 4000
            });
            // Electric zap (frequency sweep down)
            playTone({
                freq: 800,
                freqEnd: 200,
                type: 'square',
                duration: 0.25,
                vol: 0.3,
                delay: 0.05,
                gainNode: _sfxGain
            });
            // Final impact thud
            playTone({
                freq: 100,
                type: 'sine',
                duration: 0.08,
                vol: 0.25,
                delay: 0.3,
                gainNode: _sfxGain
            });
            this.audioDuck(0.25);
        } catch (e) {}
    },

    // Door close: heavy wood thud (300ms)
    doorClose() {
        try {
            // Deep thud
            playTone({
                freq: 120,
                freqEnd: 80,
                type: 'sine',
                duration: 0.2,
                vol: 0.35,
                gainNode: _sfxGain
            });
            // Resonance
            playTone({
                freq: 200,
                freqEnd: 150,
                type: 'triangle',
                duration: 0.15,
                vol: 0.2,
                delay: 0.08,
                gainNode: _sfxGain
            });
            this.audioDuck(0.18);
        } catch (e) {}
    },

    // Boss roar: intimidating creature sound (600ms)
    bossRoar() {
        try {
            // Deep growl
            playTone({
                freq: 100,
                freqEnd: 150,
                type: 'sawtooth',
                duration: 0.3,
                vol: 0.4,
                gainNode: _sfxGain
            });
            // Scream layer
            playTone({
                freq: 400,
                freqEnd: 250,
                type: 'square',
                duration: 0.35,
                vol: 0.3,
                delay: 0.1,
                gainNode: _sfxGain
            });
            // Noise burst
            playNoise({
                duration: 0.25,
                vol: 0.2,
                delay: 0.25,
                gainNode: _sfxGain,
                filterFreq: 2000
            });
            this.audioDuck(0.3);
        } catch (e) {}
    },

    // Victory fanfare: triumphant castle bells/horns (2000ms)
    victoryFanfare() {
        try {
            // Triumphant fanfare pattern
            const fanfare = [
                { freq: 523, dur: 0.25, delay: 0 },      // C5
                { freq: 659, dur: 0.25, delay: 0.3 },    // E5
                { freq: 784, dur: 0.25, delay: 0.6 },    // G5
                { freq: 1047, dur: 0.4, delay: 0.9 },    // C6
            ];
            
            fanfare.forEach(note => {
                playTone({
                    freq: note.freq,
                    type: 'triangle',
                    duration: note.dur,
                    vol: 0.35,
                    delay: note.delay,
                    gainNode: _sfxGain
                });
            });
            
            // Bells (sine waves with decay)
            playTone({
                freq: 1047,
                type: 'sine',
                duration: 0.6,
                vol: 0.25,
                delay: 1.4,
                gainNode: _sfxGain
            });
            playTone({
                freq: 784,
                type: 'sine',
                duration: 0.8,
                vol: 0.2,
                delay: 1.5,
                gainNode: _sfxGain
            });

            this.audioDuck(0.5);
        } catch (e) {}
    },

    // Death SFX: scream + impact sound (500ms)
    deathSfx() {
        try {
            // Scream
            playTone({
                freq: 600,
                freqEnd: 300,
                type: 'square',
                duration: 0.25,
                vol: 0.4,
                gainNode: _sfxGain
            });
            // Impact thud
            playTone({
                freq: 150,
                freqEnd: 50,
                type: 'sine',
                duration: 0.2,
                vol: 0.35,
                delay: 0.2,
                gainNode: _sfxGain
            });
            // Crash noise
            playNoise({
                duration: 0.15,
                vol: 0.25,
                delay: 0.25,
                gainNode: _sfxGain,
                filterFreq: 3000
            });
            this.audioDuck(0.4);
        } catch (e) {}
    },
};
