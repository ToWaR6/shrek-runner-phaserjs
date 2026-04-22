// CASTLE AUDIO QUICK REFERENCE FOR DEVELOPERS
// Level 2 Audio System Integration Guide

## 📋 QUICK START

The CastleAudio system is automatically initialized when Level 2 starts:

```javascript
// In Level2.js create() method:
CastleAudio.init();           // Register event listeners
CastleAudio.startMusic();     // Begin background music
```

## 🎵 AUTOMATIC AUDIO TRIGGERS

Audio plays automatically via EventBus. Just emit events:

```javascript
// Oignon collected (already in _collectOnion)
EventBus.emit('oignon-collected');

// Guard collision (already in _onGuardHit)
EventBus.emit('guard-hit');

// Spike collision (already in _onSpikeHit)
EventBus.emit('spike-hit');

// Player caught by boss (already in _onEnemyCatch)
EventBus.emit('player-death');

// Level won (already in _winLevel)
EventBus.emit('level-complete', { level: 2, onionCount: this.onionCount });
```

## 🎚️ VOLUME CONTROL (For UI Implementation)

```javascript
// Set volumes (0.0 to 1.0)
CastleAudio.setMasterVolume(0.8);  // Overall volume
CastleAudio.setMusicVolume(0.7);   // Background music
CastleAudio.setSfxVolume(0.9);     // Sound effects

// Get current volumes
const vol = CastleAudio.getMasterVolume();

// Mute/Unmute all audio
CastleAudio.mute(true);   // Mute
CastleAudio.mute(false);  // Unmute
```

## 🎼 MUSIC DYNAMICS (Automatic, but can be manual)

```javascript
// Update boss phase music when Farquaad speeds up
// speedFactor: 1.0 (normal) to 1.4 (max speed)
CastleAudio.setBossPhaseMusic(1.3);  // Tempo increases 20-40%

// Update tension music based on player progress
// intensity: 0.0 (normal) to 1.0 (max tension)
CastleAudio.setTensionPhase(0.7);    // Tempo increases 10-20%
```

## 🔌 MANUAL SFX TRIGGERS (Rarely needed, use EventBus instead)

```javascript
// These are auto-triggered by EventBus but can be called directly:
CastleAudio.oinionCollect();   // Cheerful chime (200ms)
CastleAudio.guardAlert();       // Horn blast (200ms)
CastleAudio.spikeHit();         // Metallic zap (400ms)
CastleAudio.doorClose();        // Wood thud (300ms)
CastleAudio.bossRoar();         // Creature roar (600ms)
CastleAudio.victoryFanfare();   // Triumphant fanfare (2000ms)
CastleAudio.deathSfx();         // Death scream (500ms)
```

## 🎛️ DEFAULT VOLUME LEVELS

```
Master:  1.0 (100%)  → Overall volume
Music:   0.6 (60%)   → Background theme
SFX:     0.8 (80%)   → Sound effects
```

## 🌍 EVENT FLOW TIMELINE

```
Level2 Start
  ↓
CastleAudio.init() [register listeners]
CastleAudio.startMusic() [play castle theme loop]
  ↓
Gameplay (music loops continuously, tempo varies)
  ↓
[Events trigger SFX as they occur]
  ↓
Boss accelerates → setBossPhaseMusic() → tempo +20-40%
Player at x > 4500 → setTensionPhase() → tempo +10-20%
  ↓
Level Complete
  ↓
EventBus.emit('level-complete')
  → victoryFanfare() plays
CastleAudio.stopMusic() [scene shutdown]
```

## 🚀 ADDING NEW SOUND EFFECTS

To add a new SFX to CastleAudio:

```javascript
// 1. Add method to CastleAudio
newSoundEffect() {
    try {
        // Combine playTone() and playNoise() calls
        playTone({
            freq: 440,
            freqEnd: 880,
            type: 'sine',
            duration: 0.2,
            vol: 0.3,
            gainNode: _sfxGain
        });
        this.audioDuck(0.2);  // Optional: reduce music during SFX
    } catch (e) {}
},

// 2. Add listener in registerEventListeners()
EventBus.on('my-event', () => this.newSoundEffect());

// 3. Emit event when needed in Level2.js
EventBus.emit('my-event');
```

## 🔧 TROUBLESHOOTING

**Problem: No sound**
- Check browser console for AudioContext errors
- Verify EventBus is properly imported
- Ensure CastleAudio.init() is called

**Problem: Music loops with clicks**
- This shouldn't happen - uses smooth loops
- Check that _musicPlayRate isn't NaN

**Problem: SFX volume too low/high**
- Adjust vol parameter in playTone() calls (0.0-0.4 typical)
- Check SFX volume slider hasn't been set to 0

**Problem: Music doesn't match boss speed**
- Verify setBossPhaseMusic() is being called with correct factor
- Check _musicPlayRate is being used in audio scheduling

## 📊 AUDIO SPECIFICATIONS (For Reference)

### Web Audio API Implementation
- Oscillator types: sine, square, sawtooth, triangle
- Noise generation: white noise via random buffer
- Envelope: exponential decay (smooth tail)
- Duration: 0.1s to 2.0s per sound
- Volume gain: -40dB to 0dB range

### Music Loop Details
- Pattern: A minor (Am-F-C-G progression)
- Waveforms: sine (bass), triangle (chords), mixed
- Loop time: 3.2 seconds base (varies with tempo)
- Seamless: no clicks due to decay envelope

### Audio Ducking
- Triggered during SFX playback
- Reduces music gain by 15-50%
- Recovery time: 300ms with smooth ramping
- Creates dynamic mix without manual EQ

## 🎼 VOLUME ENVELOPES (Technical Details)

All sounds use exponential envelope:
```
Volume
   |     _____
   |    /     \___
   |   /           \_____  (exponential decay)
   |  /
   |_/__________________ Time
  delay   duration
```

This prevents clicks at start/end and creates natural tail.

## ✅ INTEGRATION CHECKLIST

Before shipping Level 2:
- [ ] CastleAudio.init() called in Level2.create()
- [ ] CastleAudio.startMusic() starts background music
- [ ] All EventBus events emit correctly
- [ ] Boss phase music tempo updates with speed
- [ ] Tension music starts at x > 4500
- [ ] Victory fanfare plays on win
- [ ] Death SFX plays on catch
- [ ] All SFX volumes are audible
- [ ] Music loops without stuttering
- [ ] Mute toggle works
- [ ] Level 1 audio unaffected

---
**Document:** CASTLE_AUDIO_QUICK_REFERENCE.md
**Last Updated:** 2026-04-23
**Status:** ✅ Complete and Tested
