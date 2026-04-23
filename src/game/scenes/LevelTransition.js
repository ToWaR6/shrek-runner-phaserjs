import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class LevelTransition extends Scene
{
    constructor () { super('LevelTransition'); }

    init (data)
    {
        this.level1Score = data.level1Score ?? 0;
    }

    create ()
    {
        const cx = this.scale.width  / 2;  // 512
        const cy = this.scale.height / 2;  // 384

        // Semi-transparent black background
        this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.8);

        // Castle silhouette
        for (let x = 60; x < this.scale.width; x += 160) {
            const h = 80 + Math.floor((x * 37) % 120);
            this.add.rectangle(x, cy + 180 - h / 2, 50, h, 0x1a2a18).setAlpha(0.6);
        }

        // Title
        this.add.text(cx, 80, '🏰 NIVEAU 2 🏰', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 64,
            color: '#d4a840',
            stroke: '#000000',
            strokeThickness: 10,
            align: 'center',
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(cx, 140, 'LE CHÂTEAU DE FARQUAAD', {
            fontFamily: 'Fondamento',
            fontSize: 20,
            color: '#f5d020',
            align: 'center',
        }).setOrigin(0.5);

        // Description
        this.add.text(cx, 220, [
            'Shrek doit s\'échapper du château',
            'et vaincre Farquaad une dernière fois !',
            '',
            'Collecte les oignons et atteins la sortie.',
        ], {
            fontFamily: 'Fondamento',
            fontSize: 16,
            color: '#aaffaa',
            align: 'center',
            lineSpacing: 6,
        }).setOrigin(0.5);

        // Level 1 score display
        this.add.text(cx, 300, `Score du Niveau 1: ${this.level1Score} 🧅`, {
            fontFamily: 'Uncial Antiqua',
            fontSize: 18,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
        }).setOrigin(0.5);

        // Main button
        const buttonWidth = 300;
        const buttonHeight = 60;
        const buttonY = 380;

        const buttonBg = this.add.rectangle(cx, buttonY, buttonWidth, buttonHeight, 0x6ecf3a, 1);
        buttonBg.setStrokeStyle(3, 0xffffff);

        const buttonText = this.add.text(cx, buttonY, 'COMMENCER', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 32,
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2,
            align: 'center',
        }).setOrigin(0.5);

        // Make button interactive
        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x8eff5a);
            buttonText.setScale(1.1);
        });
        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x6ecf3a);
            buttonText.setScale(1);
        });
        buttonBg.on('pointerdown', () => {
            this._goToLevel2();
        });

        // Pulse animation for button
        this.tweens.add({
            targets: buttonBg,
            scaleY: 1.05,
            duration: 600,
            yoyo: true,
            repeat: -1,
        });

        // Keyboard input — ENTER or SPACE to continue
        this.time.delayedCall(300, () => {
            this.input.keyboard.once('keydown-ENTER', () => this._goToLevel2());
            this.input.keyboard.once('keydown-SPACE', () => this._goToLevel2());
        });

        // Helper text
        this.add.text(cx, 480, 'Appuie sur le bouton ou sur ENTRÉE pour continuer', {
            fontFamily: 'Fondamento',
            fontSize: 14,
            color: '#aaffaa',
            align: 'center',
        }).setOrigin(0.5).setAlpha(0.7);

        EventBus.emit('current-scene-ready', this);
    }

    _goToLevel2 ()
    {
        this.scene.start('Level2', { level1Score: this.level1Score });
    }
}
