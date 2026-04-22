// src/game/effects/CastleVFX.js
// Castle-themed visual effects for Level 2

export class CastleVFX {
    constructor(scene) {
        this.scene = scene;
    }

    // ─── Screen shake (responsive feedback) ─────────────────────────────────

    screenShake(amplitude = 3, duration = 150) {
        const camera = this.scene.cameras.main;
        const originalX = camera.scrollX;
        const originalY = camera.scrollY;
        let shakeTime = 0;

        const shakeTimer = this.scene.time.addTimer({
            delay: 5,
            repeat: Math.ceil(duration / 5),
            callback: () => {
                shakeTime += 5;
                const progress = shakeTime / duration;
                if (progress >= 1) {
                    camera.setScroll(originalX, originalY);
                    return;
                }

                const decay = 1 - progress;
                const offsetX = (Math.random() - 0.5) * 2 * amplitude * decay;
                const offsetY = (Math.random() - 0.5) * 2 * amplitude * decay;
                camera.setScroll(originalX + offsetX, originalY + offsetY);
            }
        });

        this.scene.time.delayedCall(duration, () => {
            camera.setScroll(originalX, originalY);
        });
    }

    // ─── Spike hit particles (sharp, angular effect) ───────────────────────

    spikesParticles(x, y) {
        // Create spike-shaped particles
        const particles = this.scene.add.particles(0xff4444);
        particles.createEmitter({
            speed: { min: -200, max: 200 },
            angle: { min: 240, max: 300 },
            scale: { start: 1, end: 0 },
            lifespan: 500,
            gravityY: 800,
            x: x,
            y: y,
            emitZone: { type: 'rectangle', source: new Phaser.Geom.Rectangle(-10, -10, 20, 20) }
        });

        // Emit 30 particles
        particles.emitParticleAt(x, y, 30);

        // Auto-cleanup
        this.scene.time.delayedCall(800, () => particles.destroy());
    }

    // ─── Oignon collection shimmer effect ────────────────────────────────

    onionCollectParticles(x, y) {
        const particles = this.scene.add.particles(0xf0c000);
        const emitter = particles.createEmitter({
            speed: { min: -150, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.8, end: 0 },
            lifespan: 600,
            gravityY: -200,
            x: x,
            y: y,
            emitZone: { type: 'circle', source: new Phaser.Geom.Circle(0, 0, 5) }
        });

        // Emit 40 particles
        emitter.explode(40, x, y);

        // Auto-cleanup
        this.scene.time.delayedCall(800, () => particles.destroy());
    }

    // ─── Guard collision particles (red, angry effect) ────────────────────

    guardHitParticles(x, y) {
        const particles = this.scene.add.particles(0xcc0000);
        const emitter = particles.createEmitter({
            speed: { min: -250, max: 250 },
            angle: { min: 200, max: 340 },
            scale: { start: 1.2, end: 0 },
            lifespan: 600,
            gravityY: 600,
            x: x,
            y: y,
            emitZone: { type: 'circle', source: new Phaser.Geom.Circle(0, 0, 8) }
        });

        // Emit 35 particles
        emitter.explode(35, x, y);

        // Auto-cleanup
        this.scene.time.delayedCall(800, () => particles.destroy());
    }

    // ─── Boss defeat explosion (large burst with scale-up) ────────────────

    victoryExplosion(x, y) {
        // Large gold/white burst
        const particles = this.scene.add.particles(0xd4a020);
        const emitter = particles.createEmitter({
            speed: { min: -300, max: 300 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.5, end: 0 },
            lifespan: 1000,
            gravityY: -400,
            x: x,
            y: y,
            emitZone: { type: 'circle', source: new Phaser.Geom.Circle(0, 0, 15) }
        });

        emitter.explode(50, x, y);

        // Secondary white flash
        const whiteParticles = this.scene.add.particles(0xffffff);
        const whiteEmitter = whiteParticles.createEmitter({
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            lifespan: 800,
            gravityY: -300,
            alpha: { start: 0.8, end: 0 },
            x: x,
            y: y,
            emitZone: { type: 'circle', source: new Phaser.Geom.Circle(0, 0, 12) }
        });

        whiteEmitter.explode(40, x, y);

        // Scale-up animation on screen
        const scaleGroup = this.scene.add.graphics();
        scaleGroup.fillStyle(0xd4a020, 0.5);
        scaleGroup.fillCircle(0, 0, 20);
        scaleGroup.setPosition(x, y);
        scaleGroup.setDepth(15);

        this.scene.tweens.add({
            targets: scaleGroup,
            scale: 3,
            alpha: 0,
            duration: 600,
            ease: 'Quad.easeOut',
            onComplete: () => scaleGroup.destroy()
        });

        // Auto-cleanup particles
        this.scene.time.delayedCall(1200, () => {
            particles.destroy();
            whiteParticles.destroy();
        });
    }

    // ─── Death flash effect (red/white overlay) ─────────────────────────

    deathFlash() {
        const overlay = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xff0000
        ).setScrollFactor(0).setDepth(20).setAlpha(0.6);

        this.scene.tweens.add({
            targets: overlay,
            alpha: 0,
            duration: 300,
            ease: 'Quad.easeOut',
            onComplete: () => overlay.destroy()
        });
    }

    // ─── Torch particles (flickering flames at castle entrance/exit) ──────

    torchParticles(x, y) {
        const particles = this.scene.add.particles(0xff8800);
        const emitter = particles.createEmitter({
            speed: { min: -50, max: 50 },
            angle: { min: 250, max: 290 },
            scale: { start: 0.6, end: 0 },
            lifespan: 800,
            gravityY: -150,
            alpha: { start: 0.8, end: 0 },
            x: x,
            y: y,
            emitZone: { type: 'circle', source: new Phaser.Geom.Circle(0, 0, 3) }
        });

        // Continuous emission (does not auto-destroy)
        return emitter;
    }

    // ─── Oignon glow/shimmer animation enhancement ──────────────────────

    addOnionShimmer(onionSprite) {
        // Add a glow effect via tint animation
        this.scene.tweens.add({
            targets: onionSprite,
            tint: 0xffffff,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Optional: Add a subtle scale pulse
        this.scene.tweens.add({
            targets: onionSprite,
            scale: 1.15,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ─── Boss "rage" visual feedback (red glow + pulsing) ──────────────

    bossRageGlow(bossSprite) {
        // Red tint with pulsing intensity
        this.scene.tweens.add({
            targets: bossSprite,
            tint: 0xff6666,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Scale pulse when accelerating
        this.scene.tweens.add({
            targets: bossSprite,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ─── Difficulty color coding visual hints ───────────────────────────

    difficultyColorHint(difficulty, x, y) {
        let color;
        let label;
        switch (difficulty) {
            case 'easy':
                color = 0x6ecf3a; // Green
                label = '★ FACILE ★';
                break;
            case 'hard':
                color = 0xff4444; // Red
                label = '★★★ DIFFICILE ★★★';
                break;
            case 'normal':
            default:
                color = 0xf5d020; // Yellow
                label = '★★ NORMAL ★★';
        }

        // Display text with difficulty color
        const hint = this.scene.add.text(x, y, label, {
            fontFamily: 'Uncial Antiqua',
            fontSize: 14,
            color: `#${color.toString(16).padStart(6, '0')}`,
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(25).setAlpha(0);

        // Fade in and out
        this.scene.tweens.add({
            targets: hint,
            alpha: 1,
            duration: 400,
            ease: 'Quad.easeOut'
        });

        this.scene.time.delayedCall(2000, () => {
            this.scene.tweens.add({
                targets: hint,
                alpha: 0,
                duration: 600,
                ease: 'Quad.easeIn',
                onComplete: () => hint.destroy()
            });
        });
    }

    // ─── Camera zoom on boss proximity ─────────────────────────────────

    cameraZoomOnBoss(targetZoom = 1.2, duration = 300) {
        const camera = this.scene.cameras.main;
        this.scene.tweens.add({
            targets: camera,
            zoom: targetZoom,
            duration: duration,
            ease: 'Quad.easeInOut'
        });
    }

    cameraResetZoom(duration = 400) {
        const camera = this.scene.cameras.main;
        this.scene.tweens.add({
            targets: camera,
            zoom: 1.0,
            duration: duration,
            ease: 'Quad.easeInOut'
        });
    }

    // ─── Background movement effect (parallax enhancement) ──────────────

    createBackgroundScroll(layer, scrollFactor = 0.2) {
        if (!layer) return;
        layer.setScrollFactor(scrollFactor);
    }

    // ─── Castle gate visual opening ────────────────────────────────────

    openCastleGates(gateGroup) {
        if (!gateGroup || gateGroup.length === 0) return;

        gateGroup.forEach((gate, index) => {
            const startX = gate.x;
            const direction = index % 2 === 0 ? -1 : 1;

            this.scene.tweens.add({
                targets: gate,
                x: startX + direction * 80,
                duration: 800,
                ease: 'Back.easeInOut'
            });
        });
    }

    // ─── Boss acceleration indicator (screen flicker) ─────────────────

    bossAccelerationFlicker() {
        const overlay = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xff0000
        ).setScrollFactor(0).setDepth(19).setAlpha(0.15);

        this.scene.tweens.add({
            targets: overlay,
            alpha: 0.05,
            duration: 200,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut',
            onComplete: () => overlay.destroy()
        });
    }

    // ─── Particle system cleanup ────────────────────────────────────

    clearAllParticles() {
        this.scene.children.list.forEach(child => {
            if (child.isParticleEmitter || child.emitters) {
                child.destroy();
            }
        });
    }
}
