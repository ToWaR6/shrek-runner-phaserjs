import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class ScoreSummary extends Scene
{
    constructor () { super('ScoreSummary'); }

    init (data)
    {
        this.won          = data.won          ?? false;
        this.onionCount   = data.onionCount   ?? 0;
        this.totalOnions  = data.totalOnions  ?? 20;
        this.lives        = data.lives        ?? 0;
        this.timeMs       = data.timeMs       ?? 0;
    }

    create ()
    {
        const cx = this.scale.width  / 2;  // 512
        const cy = this.scale.height / 2;  // 384

        // Background
        const bgColor = this.won ? 0x1a4a10 : 0x3a1010;
        this.add.rectangle(cx, cy, this.scale.width, this.scale.height, bgColor);

        // Decorative swamp trees (same as MainMenu)
        for (let x = 60; x < this.scale.width; x += 160) {
            const h = 80 + Math.floor((x * 37) % 120);
            this.add.rectangle(x, cy + 180 - h / 2, 50, h, 0x0d2a08).setAlpha(0.5);
        }

        // ── Title ──
        const titleText = this.won ? '🏆 VICTOIRE !' : '💀 GAME OVER';
        const titleColor = this.won ? '#6ecf3a' : '#ff4444';
        this.add.text(cx, cy - 216, titleText, {
            fontFamily: 'Uncial Antiqua',
            fontSize: 64,
            color: titleColor,
            stroke: '#000000',
            strokeThickness: 10,
            align: 'center',
        }).setOrigin(0.5);

        // ── Stats panel ──
        this.add.rectangle(cx, cy + 4, 560, 260, 0x000000, 0.65).setOrigin(0.5);

        // Time
        const totalSec = Math.floor(this.timeMs / 1000);
        const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const ss = String(totalSec % 60).padStart(2, '0');
        this.add.text(cx - 200, cy - 106, '⏱ Temps', { fontFamily: 'Uncial Antiqua', fontSize: 20, color: '#aaddff' }).setOrigin(0, 0.5);
        this.add.text(cx + 200, cy - 106, `${mm}:${ss}`, { fontFamily: 'Uncial Antiqua', fontSize: 28, color: '#ffffff' }).setOrigin(1, 0.5);

        // Onions
        this.add.text(cx - 200, cy - 46, '🧅 Oignons', { fontFamily: 'Uncial Antiqua', fontSize: 20, color: '#f5d020' }).setOrigin(0, 0.5);
        const onionColor = this.onionCount >= 10 ? '#6ecf3a' : '#ff8800';
        this.add.text(cx + 200, cy - 46, `${this.onionCount} / ${this.totalOnions}`, { fontFamily: 'Uncial Antiqua', fontSize: 28, color: onionColor }).setOrigin(1, 0.5);

        // Onion progress bar
        this.add.rectangle(cx, cy - 21, 400, 8, 0x333333).setOrigin(0.5);
        const barFill = Math.max(1, Math.floor(400 * this.onionCount / this.totalOnions));
        this.add.rectangle(cx - 200, cy - 21, barFill, 8, 0xf5d020).setOrigin(0, 0.5);

        // Lives remaining
        this.add.text(cx - 200, cy + 24, '❤ Vies', { fontFamily: 'Uncial Antiqua', fontSize: 20, color: '#ff4444' }).setOrigin(0, 0.5);
        const heartsStr = '❤'.repeat(Math.max(0, this.lives)) + '🖤'.repeat(Math.max(0, 3 - this.lives));
        this.add.text(cx + 200, cy + 24, heartsStr, { fontFamily: 'Fondamento', fontSize: 24 }).setOrigin(1, 0.5);

        // ── Grade ──
        const grade = this._calcGrade();
        const gradeColor = { S: '#ffd700', A: '#6ecf3a', B: '#4499ff', C: '#ff8800', D: '#ff4444' }[grade];
        this.add.text(cx - 200, cy + 84, '⭐ Note', { fontFamily: 'Uncial Antiqua', fontSize: 20, color: '#cccccc' }).setOrigin(0, 0.5);
        this.add.text(cx + 200, cy + 84, grade, { fontFamily: 'Uncial Antiqua', fontSize: 52, color: gradeColor, stroke: '#000000', strokeThickness: 6 }).setOrigin(1, 0.5);

        // ── Separator ──
        this.add.rectangle(cx, cy + 134, 520, 2, 0xffffff, 0.15);

        // ── Prompt ──
        const prompt = this.add.text(cx, cy + 194, 'ESPACE — Retour au menu', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 22,
            color: '#f5d020',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.tweens.add({ targets: prompt, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

        // ── Sub-prompt ──
        this.add.text(cx, cy + 239, 'ENTRÉE — Rejouer', {
            fontFamily: 'Fondamento',
            fontSize: 16,
            color: '#aaffaa',
        }).setOrigin(0.5).setAlpha(0.8);

        // ── Input ──
        this.time.delayedCall(500, () => {
            this.input.keyboard.once('keydown-SPACE', () => this.scene.start('MainMenu'));
            this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Game', { lives: 3 }));
        });

        EventBus.emit('current-scene-ready', this);
    }

    _calcGrade ()
    {
        if (!this.won) return this.onionCount >= 10 ? 'C' : 'D';
        const totalSec = this.timeMs / 1000;
        if (this.lives >= 3 && this.onionCount >= 18 && totalSec < 90) return 'S';
        if (this.lives >= 2 && this.onionCount >= 14) return 'A';
        if (this.won) return 'B';
        return 'C';
    }
}
