import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

// Sprite dimensions (match Game.js)
const W = 44;  // Shrek width
const H = 60;  // Shrek height
const EW = 50; // Farquaad width
const EH = 72; // Farquaad height

// Shrek palette
const SK  = 0x4aaa3a;
const SKS = 0x3a8a2a;
const VS  = 0x7a5030;
const VD  = 0x5a3820;
const GL  = 0xd4a840;
const EWC = 0xf0e8d0;
const PU  = 0x2a1808;
const PT  = 0x5a3820;

export class Intro extends Scene
{
    constructor ()
    {
        super('Intro');
    }

    create ()
    {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;
        const groundY = 680; // ground surface Y

        this._skipped = false;

        // ── Background ───────────────────────────────────────────────────────
        this.add.rectangle(cx, cy, width, height, 0x5a9e6a);

        // Distant hills
        for (let x = 0; x < width; x += 280) {
            const h = 90 + (x % 200) / 2;
            this.add.rectangle(x + 140, groundY - h / 2, 260, h, 0x3a7040).setAlpha(0.5);
        }

        // Swamp trees — same style as Game scene
        for (let x = 80; x < width; x += 180 + (x % 90)) {
            const trunkH = 65 + (x % 65);
            const trunkW = 16 + (x % 10);
            const topY   = groundY - trunkH;
            const cSize  = 48 + (x % 42);

            const g = this.add.graphics().setAlpha(0.72);

            // Trunk
            g.fillStyle(0x3a2008);
            g.fillRect(x - trunkW / 2, topY, trunkW, trunkH);
            g.fillRect(x - trunkW / 2 - 4, topY + trunkH - 14, trunkW + 8, 14);

            // Canopy
            g.fillStyle(0x1b4710);
            g.fillCircle(x, topY, cSize);
            g.fillStyle(0x245a18);
            g.fillCircle(x - cSize * 0.52, topY + cSize * 0.18, cSize * 0.68);
            g.fillCircle(x + cSize * 0.52, topY + cSize * 0.18, cSize * 0.62);
            g.fillStyle(0x1b4710);
            g.fillCircle(x, topY - cSize * 0.38, cSize * 0.72);

            // Hanging vines
            g.fillStyle(0x2a5c12);
            [-18, -4, 10, 24].forEach((ox, i) => {
                const vLen = 14 + ((x + i * 7) % 18);
                g.fillRect(x + ox, topY + cSize * 0.55, 3, vLen);
            });
        }

        // Ground
        this.add.rectangle(cx, groundY + 40, width, 80, 0x3d2b1f);
        this.add.rectangle(cx, groundY + 4, width, 8, 0x3d6a28);

        // ── Textures ─────────────────────────────────────────────────────────
        this._makeTextures();

        // ── Sprites ──────────────────────────────────────────────────────────
        // Farquaad starts off-screen right
        this.farquaad = this.add.image(width + EW, groundY - EH / 2, 'intro-farquaad');

        // Shrek starts off-screen left, holding onion basket
        this.shrek = this.add.image(-W, groundY - H / 2, 'intro-shrek');

        // Onion basket (small yellow circle near Shrek)
        this.basket = this.add.graphics();
        this._drawBasket(this.basket, 0, 0);
        this.basket.x = -W;
        this.basket.y = groundY - H / 2 + 16;

        // ── Narrative text ────────────────────────────────────────────────────
        const textStyle = {
            fontFamily: 'Uncial Antiqua',
            fontSize: 36,
            color: '#f5f0c0',
            stroke: '#000000',
            strokeThickness: 7,
            align: 'center',
            wordWrap: { width: width - 80 }
        };

        this.titleText = this.add.text(cx, cy - 200, 'Il était une fois...', {
            ...textStyle,
            fontSize: 48,
            color: '#f5d020',
        }).setOrigin(0.5).setAlpha(0);

        this.narText = this.add.text(cx, 80, '', {
            ...textStyle,
            fontSize: 32,
        }).setOrigin(0.5).setAlpha(0);

        this.runText = this.add.text(cx, cy - 60, 'Cours, Shrek, cours !', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 64,
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 10,
            align: 'center',
        }).setOrigin(0.5).setAlpha(0);

        // Skip hint
        this.add.text(cx, height - 28, 'ESPACE ou ENTRÉE pour passer', {
            fontFamily: 'Fondamento',
            fontSize: 16,
            color: '#ccffcc',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setAlpha(0.7);

        // Fade-to-black overlay (on top of everything)
        this.fadeRect = this.add.rectangle(cx, cy, width, height, 0x000000).setAlpha(0).setDepth(100);

        // ── Skip input ────────────────────────────────────────────────────────
        const skip = () => {
            if (this._skipped) return;
            this._skipped = true;
            this.tweens.killAll();
            this.tweens.add({
                targets: this.fadeRect,
                alpha: 1,
                duration: 300,
                onComplete: () => this.scene.start('MainMenu')
            });
        };
        this.input.keyboard.on('keydown-SPACE', skip);
        this.input.keyboard.on('keydown-ENTER', skip);
        this.input.keyboard.on('keydown-ESC', skip);

        // ── Animation sequence ────────────────────────────────────────────────
        this._playSequence(cx, cy, width, groundY);

        EventBus.emit('current-scene-ready', this);
    }

    _playSequence (cx, cy, width, groundY)
    {
        const farquaadRestX = width * 0.62;
        const shrekRestX    = width * 0.28;
        const shrekBaseY    = groundY - H / 2;
        const basketBaseY   = groundY - H / 2 + 16;

        // Farquaad enters facing left (toward Shrek)
        this.farquaad.setFlipX(true);

        const go = (delay, fn) => this.time.delayedCall(delay, () => { if (!this._skipped) fn(); });

        // [0s] Title fade in
        this.tweens.add({ targets: this.titleText, alpha: 1, duration: 700 });

        // [0.8s] Farquaad rides in from right
        go(800, () => {
            this.tweens.add({ targets: this.farquaad, x: farquaadRestX, duration: 900, ease: 'Quad.easeOut' });
        });

        // [1.7s] Shrek walks in from left
        go(1700, () => {
            this.tweens.add({ targets: this.shrek,  x: shrekRestX,      duration: 900, ease: 'Quad.easeOut' });
            this.tweens.add({ targets: this.basket, x: shrekRestX + 18, duration: 900, ease: 'Quad.easeOut' });
        });

        // [2.8s] Narration text
        go(2800, () => {
            this.tweens.add({ targets: this.titleText, alpha: 0, duration: 400 });
            this.narText.setText('Farquaad veut les oignons de Shrek !');
            this.tweens.add({ targets: this.narText, alpha: 1, duration: 500 });
        });

        // [4.0s] Shrek runs right, fade narration
        go(4000, () => {
            this.tweens.add({ targets: this.narText, alpha: 0, duration: 300 });
            this.tweens.add({ targets: this.shrek,  x: width + W + 20, duration: 1800, ease: 'Quad.easeIn' });
            this.tweens.add({ targets: this.basket, x: width + W + 38, duration: 1800, ease: 'Quad.easeIn' });
        });

        // [4.4s] Jump arc (rise)
        go(4400, () => {
            this.tweens.add({ targets: this.shrek,  y: shrekBaseY  - 140, duration: 460, ease: 'Quad.easeOut' });
            this.tweens.add({ targets: this.basket, y: basketBaseY - 140, duration: 460, ease: 'Quad.easeOut' });
        });

        // [4.86s] Jump arc (fall)
        go(4860, () => {
            this.tweens.add({ targets: this.shrek,  y: shrekBaseY,  duration: 460, ease: 'Quad.easeIn' });
            this.tweens.add({ targets: this.basket, y: basketBaseY, duration: 460, ease: 'Quad.easeIn' });
        });

        // [5.3s] "PLUS JAMAIS !!" pop above Farquaad
        go(5300, () => {
            const onoText = this.add.text(
                farquaadRestX, groundY - EH - 55, '#@!!* GRRR !!',
                { fontFamily: 'Uncial Antiqua', fontSize: 30, color: '#ff2222', stroke: '#000000', strokeThickness: 7 }
            ).setOrigin(0.5).setAlpha(0).setScale(0.2);
            this.tweens.add({
                targets: onoText, alpha: 1, scale: 1.15, duration: 180, ease: 'Back.easeOut',
                onComplete: () => this.tweens.add({ targets: onoText, scale: 1, duration: 100 })
            });
            go(900, () => this.tweens.add({ targets: onoText, alpha: 0, duration: 250 }));
        });

        // [5.7s] Farquaad turns and chases right
        go(5700, () => {
            this.farquaad.setFlipX(false);
            this.tweens.add({ targets: this.farquaad, x: width + EW + 20, duration: 1300, ease: 'Quad.easeIn' });
        });

        // [7.1s] "Cours, Shrek, cours!"
        go(7100, () => {
            this.tweens.add({ targets: this.runText, alpha: 1, duration: 400 });
        });

        // [8.1s] Fade to black → MainMenu
        go(8100, () => {
            this.tweens.add({
                targets: this.fadeRect, alpha: 1, duration: 700,
                onComplete: () => { if (!this._skipped) this.scene.start('MainMenu'); }
            });
        });
    }

    _drawBasket (g, ox, oy)
    {
        // Small onion pile: a couple layered ellipses
        g.fillStyle(0xf0c000);
        g.fillEllipse(ox + 10, oy, 20, 14);
        g.fillStyle(0xd4a000);
        g.fillEllipse(ox, oy + 2, 16, 12);
        g.fillStyle(0x7ab020);
        g.fillRect(ox + 8, oy - 9, 3, 7);
        g.fillRect(ox - 1, oy - 7, 3, 6);
    }

    _makeTextures ()
    {
        const make = (key, w, h, drawFn) => {
            if (this.textures.exists(key)) return;
            const g = this.add.graphics().setVisible(false);
            drawFn(g);
            g.generateTexture(key, w, h);
            g.destroy();
        };

        // ── Shrek (walking pose) ──────────────────────────────────────────────
        make('intro-shrek', W, H, g => {
            // Head
            g.fillStyle(SK);  g.fillRect(0, 0, W, 27);
            g.fillStyle(SK);  g.fillEllipse(22, 14, 40, 27);
            g.fillStyle(SKS); g.fillEllipse(2,  11, 10, 14);
            g.fillStyle(SKS); g.fillEllipse(42, 11, 10, 14);
            g.fillStyle(SKS); g.fillRect(10, 6, 10, 5);
            g.fillStyle(SKS); g.fillRect(24, 6, 10, 5);
            g.fillStyle(EWC); g.fillEllipse(15, 12, 9, 7);
            g.fillStyle(EWC); g.fillEllipse(29, 12, 9, 7);
            g.fillStyle(PU);  g.fillRect(13, 9, 4, 5);
            g.fillStyle(PU);  g.fillRect(27, 9, 4, 5);
            g.fillStyle(SKS); g.fillRect(19, 17, 6, 5);
            g.fillStyle(VD);  g.fillRect(19, 19, 2, 2);
            g.fillStyle(VD);  g.fillRect(23, 19, 2, 2);
            g.fillStyle(VD);  g.fillRect(16, 23, 12, 3);
            // Body / vest
            g.fillStyle(SK);  g.fillRect(0,  27, W, 17);
            g.fillStyle(VS);  g.fillRect(7,  27, 12, 17);
            g.fillStyle(VS);  g.fillRect(25, 27, 12, 17);
            g.fillStyle(VD);  g.fillRect(7,  40, 30,  5);
            g.fillStyle(GL);  g.fillRect(19, 40,  6,  5);
            // Legs (walk pose)
            g.fillStyle(PT);
            g.fillRect(5,  44, 12, 13);
            g.fillRect(27, 46, 12, 10);
            g.fillStyle(VD);
            g.fillRect(4,  57, 14, 4);
            g.fillRect(26, 56, 14, 4);
        });

        // ── Farquaad on horse ─────────────────────────────────────────────────
        make('intro-farquaad', EW, EH, g => {
            // Horse body
            g.fillStyle(0x8b5e2a);
            g.fillRect(0, 46, 50, 22);
            // Horse legs
            g.fillStyle(0x5a3c18);
            g.fillRect(5,  62, 7, 10);
            g.fillRect(15, 62, 7, 10);
            g.fillRect(28, 62, 7, 10);
            g.fillRect(38, 62, 7, 10);
            // Horse head
            g.fillStyle(0x8b5e2a);
            g.fillRect(0, 40, 16, 18);
            g.fillStyle(0x5a3c18);
            g.fillRect(0, 52, 10, 4);
            // Mane
            g.fillStyle(0x3d2000);
            g.fillRect(0, 36, 8, 16);
            // Armor body
            g.fillStyle(0x8b1a1a);
            g.fillRect(15, 20, 20, 28);
            // Shoulder pads
            g.fillStyle(0xc0c0c0);
            g.fillRect(11, 22, 8, 8);
            g.fillRect(31, 22, 8, 8);
            // Gold stripe
            g.fillStyle(0xd4a020);
            g.fillRect(22, 20, 6, 28);
            // Head
            g.fillStyle(0xf0c090);
            g.fillRect(17, 4, 16, 18);
            // Hair
            g.fillStyle(0x1a0a00);
            g.fillRect(17, 4, 16, 6);
            // Eyes
            g.fillStyle(0xffffff);
            g.fillRect(19, 12, 4, 4);
            g.fillRect(27, 12, 4, 4);
            g.fillStyle(0x000000);
            g.fillRect(20, 13, 2, 2);
            g.fillRect(28, 13, 2, 2);
            // Crown
            g.fillStyle(0xd4a020);
            g.fillRect(16, 0, 4, 6);
            g.fillRect(23, 0, 4, 7);
            g.fillRect(30, 0, 4, 6);
            g.fillRect(16, 4, 18, 4);
            // Right arm / reins
            g.fillStyle(0x8b1a1a);
            g.fillRect(35, 26, 12, 6);
            g.fillStyle(0xf0c090);
            g.fillRect(45, 26, 5, 6);
            // Lance (hampe bois + pointe métal, tenue horizontalement pointée vers le joueur)
            g.fillStyle(0x8b6020);  // bois de la hampe
            g.fillRect(35, 22, 15, 3);  // hampe (sort à droite du sprite)
            g.fillStyle(0xd8d8d8);  // métal argenté
            g.fillRect(48, 19, 6, 9);  // pointe triangulaire (simulée en rectangle)
            g.fillStyle(0xffffff);
            g.fillRect(51, 21, 2, 5);  // reflet sur la pointe
        });
    }
}
