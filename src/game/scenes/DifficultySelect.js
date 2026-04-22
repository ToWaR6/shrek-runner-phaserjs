import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class DifficultySelect extends Scene
{
    constructor ()
    {
        super('DifficultySelect');
    }

    init (data)
    {
        this.targetLevel = data?.level || 1;
    }

    create ()
    {
        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        // Castle stone background
        this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x3a3a3a);

        // Decorative castle towers
        for (let x = 80; x < this.scale.width; x += 180) {
            const h = 100 + Math.floor((x * 23) % 100);
            this.add.rectangle(x, cy + 180 - h / 2, 60, h, 0x1a1a1a).setAlpha(0.6);
        }

        // Title
        const titleText = this.targetLevel === 2 ? '🏰 CHÂTEAU - DIFFICULTÉ' : 'DIFFICULTÉ';
        this.add.text(cx, cy - 140, titleText, {
            fontFamily: 'Uncial Antiqua',
            fontSize: 56,
            color: '#d4a840',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Difficulty options with colors
        const difficulties = [
            { name: 'Facile', color: 0x22cc22, textColor: '#22cc22', desc: 'Ennemi lent, plateforme large' },
            { name: 'Normal', color: 0xffdd00, textColor: '#ffdd00', desc: 'Équilibre parfait' },
            { name: 'Difficile', color: 0xff4444, textColor: '#ff4444', desc: 'Ennemi rapide, plateforme étroite' }
        ];

        let selected = 1; // Default to Normal
        const optionYs = [cy - 60, cy, cy + 60];

        const drawOptions = () => {
            difficulties.forEach((diff, idx) => {
                const isSelected = idx === selected;
                const bgColor = isSelected ? 0xffffff : 0x444444;
                const bgAlpha = isSelected ? 0.3 : 0.1;
                
                this.add.rectangle(cx, optionYs[idx], 380, 60, bgColor, bgAlpha)
                    .setStrokeStyle(isSelected ? 3 : 1, diff.color);

                this.add.text(cx - 150, optionYs[idx], (isSelected ? '▶ ' : '  ') + diff.name, {
                    fontFamily: 'Uncial Antiqua',
                    fontSize: 32,
                    color: diff.textColor,
                    stroke: '#000000',
                    strokeThickness: 5,
                }).setOrigin(0, 0.5);

                this.add.text(cx + 150, optionYs[idx], diff.desc, {
                    fontFamily: 'Fondamento',
                    fontSize: 13,
                    color: '#aaaaaa',
                }).setOrigin(1, 0.5);
            });
        };

        drawOptions();

        // Instructions
        this.add.text(cx, cy + 130, '▲ Z / Haut  •  ▼ S / Bas  •  ESPACE pour confirmer', {
            fontFamily: 'Fondamento',
            fontSize: 14,
            color: '#aaaaaa',
        }).setOrigin(0.5);

        this.add.text(cx, cy + 155, 'ESC — Retour', {
            fontFamily: 'Fondamento',
            fontSize: 13,
            color: '#888888',
        }).setOrigin(0.5);

        // Input handling
        let canSelect = true;
        this.input.keyboard.on('keydown', (event) => {
            if (!canSelect) return;

            if (event.code === 'KeyZ' || event.code === 'ArrowUp') {
                selected = Math.max(0, selected - 1);
                this.scene.restart();
            } else if (event.code === 'KeyS' || event.code === 'ArrowDown') {
                selected = Math.min(2, selected + 1);
                this.scene.restart();
            } else if (event.code === 'Space' || event.code === 'Enter') {
                canSelect = false;
                const difficultyMap = ['easy', 'normal', 'hard'];
                const selectedDifficulty = difficultyMap[selected];
                localStorage.setItem('selectedDifficulty', selectedDifficulty);
                
                if (this.targetLevel === 2) {
                    this.scene.start('Level2');
                } else {
                    this.scene.start('Game');
                }
            } else if (event.code === 'Escape') {
                if (this.targetLevel === 2) {
                    this.scene.start('LevelSelect');
                } else {
                    this.scene.start('MainMenu');
                }
            }
        });

        EventBus.emit('current-scene-ready', this);
    }
}
