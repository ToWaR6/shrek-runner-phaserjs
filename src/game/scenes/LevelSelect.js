import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class LevelSelect extends Scene
{
    constructor ()
    {
        super('LevelSelect');
    }

    create ()
    {
        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        // Castle stone background for Level 2
        this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x4a4a4a);

        // Decorative castle towers
        for (let x = 80; x < this.scale.width; x += 180) {
            const h = 100 + Math.floor((x * 23) % 100);
            this.add.rectangle(x, cy + 180 - h / 2, 60, h, 0x2a2a2a).setAlpha(0.6);
        }

        // Title
        this.add.text(cx, cy - 160, 'CHOIX DU NIVEAU', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 64,
            color: '#d4a840',
            stroke: '#000000',
            strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5);

        // Level 1 - Marais
        const level1Y = cy - 60;
        this.add.rectangle(cx - 140, level1Y, 200, 80, 0x2d5a1e, 0.8).setStrokeStyle(3, 0x6ecf3a);
        this.add.text(cx - 140, level1Y - 15, '🌿 NIVEAU 1', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 24,
            color: '#6ecf3a',
        }).setOrigin(0.5);
        this.add.text(cx - 140, level1Y + 15, 'Le Marais', {
            fontFamily: 'Fondamento',
            fontSize: 16,
            color: '#aaffaa',
        }).setOrigin(0.5);

        // Level 2 - Castle
        const level2Y = cy - 60;
        this.add.rectangle(cx + 140, level2Y, 200, 80, 0x5a5a5a, 0.8).setStrokeStyle(3, 0xd4a840);
        this.add.text(cx + 140, level2Y - 15, '🏰 NIVEAU 2', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 24,
            color: '#d4a840',
        }).setOrigin(0.5);
        this.add.text(cx + 140, level2Y + 15, 'Le Château', {
            fontFamily: 'Fondamento',
            fontSize: 16,
            color: '#d4a840',
        }).setOrigin(0.5);

        // Instructions
        this.add.text(cx, cy + 100, '◀ ZQSD ou Flèches ▶  •  ESPACE pour sélectionner', {
            fontFamily: 'Fondamento',
            fontSize: 14,
            color: '#aaaaaa',
        }).setOrigin(0.5);

        this.add.text(cx, cy + 130, 'ESC — Retour au menu', {
            fontFamily: 'Fondamento',
            fontSize: 14,
            color: '#aaaaaa',
        }).setOrigin(0.5);

        // Selection state
        let selected = 1; // 1 for Level 1, 2 for Level 2

        const updateSelection = () => {
            if (selected === 1) {
                this.add.rectangle(cx - 140, level1Y, 200, 80, 0x6ecf3a, 0.2);
            } else {
                this.add.rectangle(cx + 140, level2Y, 200, 80, 0xd4a840, 0.2);
            }
        };

        updateSelection();

        // Input handling
        const keys = this.input.keyboard.addKeys({
            left:   'Q',
            right:  'D',
            left2:  'LEFT',
            right2: 'RIGHT',
            select: 'SPACE',
            enter:  'ENTER',
            back:   'ESC'
        });

        let canSelect = true;
        this.input.keyboard.on('keydown', (event) => {
            if (!canSelect) return;

            if (event.code === 'KeyQ' || event.code === 'ArrowLeft') {
                if (selected !== 1) {
                    selected = 1;
                    this.scene.restart();
                }
            } else if (event.code === 'KeyD' || event.code === 'ArrowRight') {
                if (selected !== 2) {
                    selected = 2;
                    this.scene.restart();
                }
            } else if (event.code === 'Space' || event.code === 'Enter') {
                canSelect = false;
                if (selected === 1) {
                    this.scene.start('Game');
                } else {
                    this.scene.start('DifficultySelect', { level: 2 });
                }
            } else if (event.code === 'Escape') {
                this.scene.start('MainMenu');
            }
        });

        EventBus.emit('current-scene-ready', this);
    }
}
