import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        // Swamp green background
        this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x2d5a1e);

        // Decorative swamp trees
        for (let x = 60; x < this.scale.width; x += 160) {
            const h = 80 + Math.random() * 120;
            this.add.rectangle(x, cy + 180 - h / 2, 50 + Math.random() * 40, h, 0x1a3d10).setAlpha(0.7);
        }

        // Title
        this.add.text(cx, cy - 160, 'SHREK RUN', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 72,
            color: '#6ecf3a',
            stroke: '#1a3d10',
            strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(cx, cy - 80, "It's all ogre now !", {
            fontFamily: 'Uncial Antiqua',
            fontSize: 24,
            color: '#c8e86a',
            stroke: '#1a3d10',
            strokeThickness: 5,
        }).setOrigin(0.5);

        // Blinking prompt
        const prompt = this.add.text(cx, cy + 60, 'Appuie sur ESPACE pour jouer', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 26,
            color: '#f5d020',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: prompt,
            alpha: 0,
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        this.add.text(cx, cy + 130, 'ZQSD ou Flèches pour bouger  •  Z / Espace pour sauter', {
            fontFamily: 'Fondamento',
            fontSize: 16,
            color: '#aaffaa',
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game', { lives: 3 }));
        this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Game', { lives: 3 }));

        // Double-ESC → replay intro (secret shortcut)
        let escCount = 0;
        this.input.keyboard.on('keydown-ESC', () => {
            escCount++;
            if (escCount === 1) {
                this.time.delayedCall(500, () => { escCount = 0; });
            } else {
                this.scene.start('Intro');
            }
        });

        EventBus.emit('current-scene-ready', this);
    }
}
