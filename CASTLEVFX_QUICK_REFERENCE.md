# CastleVFX Quick Reference

## Import & Initialize
```javascript
import { CastleVFX } from '../effects/CastleVFX';

export class MyScene extends Scene {
    create() {
        this.vfx = new CastleVFX(this);
    }
}
```

## Screen Effects

### Screen Shake
```javascript
this.vfx.screenShake(amplitude, duration);
// amplitude: 2-4 (pixels)
// duration: 100-300 (ms)
// Example: this.vfx.screenShake(3, 150);
```

### Camera Zoom
```javascript
this.vfx.cameraZoomOnBoss(targetZoom, duration);
// targetZoom: 1.0-1.5
// duration: 300-500 (ms)
// Example: this.vfx.cameraZoomOnBoss(1.2, 300);

this.vfx.cameraResetZoom(duration);
// Example: this.vfx.cameraResetZoom(400);
```

### Screen Flashes
```javascript
this.vfx.deathFlash();
// Red overlay, 300ms fade

this.vfx.bossAccelerationFlicker();
// Red flicker, 200ms × 3 cycles
```

## Particle Effects

### Spike Hits
```javascript
this.vfx.spikesParticles(x, y);
// Red spike burst, 30 particles
```

### Oignon Collection
```javascript
this.vfx.onionCollectParticles(x, y);
// Gold burst, 40 particles, upward float
```

### Guard Collisions
```javascript
this.vfx.guardHitParticles(x, y);
// Dark red burst, 35 particles
```

### Victory Explosion
```javascript
this.vfx.victoryExplosion(x, y);
// Gold + white burst, 90 total particles
// Includes graphics scale-up animation
```

### Torch Particles
```javascript
const emitter = this.vfx.torchParticles(x, y);
// Orange flicker, continuous
// Returns emitter for manual control
```

## Animation Effects

### Onion Shimmer
```javascript
this.vfx.addOnionShimmer(onionSprite);
// Tint glow + scale pulse
// Loops infinitely (-1 repeat)
```

### Boss Rage Glow
```javascript
this.vfx.bossRageGlow(bossSprite);
// Red tint + scale pulse
// Loops infinitely (-1 repeat)
```

### Difficulty Hint
```javascript
this.vfx.difficultyColorHint(difficulty, x, y);
// difficulty: 'easy', 'normal', 'hard'
// Colors: Green, Yellow, Red
// Displays 2 seconds then fades
```

## Utility

### Cleanup
```javascript
this.vfx.clearAllParticles();
// Destroys all particle systems
```

### Background Effects
```javascript
this.vfx.createBackgroundScroll(layer, scrollFactor);
// scrollFactor: 0.0-1.0 (default 0.2)
```

### Gate Animation
```javascript
this.vfx.openCastleGates(gateGroup);
// Animates gates spreading open
```

## Common Patterns

### On Enemy Hit
```javascript
_onGuardHit(player, guard) {
    this.vfx.guardHitParticles(guard.x, guard.y);
    this.vfx.screenShake(3, 150);
}
```

### On Collection
```javascript
_collectOnion(player, onion) {
    this.vfx.onionCollectParticles(onion.x, onion.y);
    onion.destroy();
}
```

### On Victory
```javascript
_winLevel() {
    this.vfx.victoryExplosion(this.player.x, this.player.y);
    this.vfx.screenShake(2, 300);
    this.vfx.cameraZoomOnBoss(1.3, 400);
}
```

### On Boss Acceleration
```javascript
if (speedIncreased) {
    this.vfx.bossAccelerationFlicker();
    this.vfx.bossRageGlow(this.enemy);
}
```

### Boss Proximity Detection
```javascript
const distance = Math.abs(player.x - boss.x);
if (distance < 200) {
    this.vfx.cameraZoomOnBoss(1.15, 300);
} else {
    this.vfx.cameraResetZoom(300);
}
```

## Performance Tips

1. **Particle Cleanup**: Always destroy particles when done
2. **Auto-cleanup**: Most effects auto-destroy after duration
3. **Particle Limits**: Max 200 particles on screen
4. **Tweens**: Auto-managed by Phaser, no manual cleanup needed
5. **Emitters**: Phaser handles pooling automatically

## Color Reference

- Red (Danger): 0xff4444, 0xcc0000
- Gold (Treasure): 0xd4a020, 0xf0c000
- Orange (Fire): 0xff8800
- White (Flash): 0xffffff
- Green (Easy): 0x6ecf3a
- Yellow (Normal): 0xf5d020
- Red (Hard): 0xff4444

## Timing Guidelines

- Quick feedback: 100-200ms
- Standard: 300-600ms
- Extended: 1000+ ms
- Loops: 300-400ms cycles
