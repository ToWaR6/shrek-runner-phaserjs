import { AudioManager } from '../AudioManager';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Math as PhaserMath } from 'phaser';

// World dimensions
const WORLD_W = 6000;
const WORLD_H = 800;

// Ground: surface at y=720, height=80, center at y=760
const GROUND_SURFACE = 720;
const GROUND_H = 80;
const GROUND_CY = GROUND_SURFACE + GROUND_H / 2; // 760

// Platform height
const PLAT_H = 24;

// Player
const PLAYER_W = 44;
const PLAYER_H = 60;
const PLAYER_SPEED = 560;
const PLAYER_ACCEL = 2200;
const PLAYER_DRAG = 1400;
const JUMP_VEL = -700;

// Onion size
const ONION_W = 18;
const ONION_H = 22;

// Minimum onions required to unlock the finish
const MIN_ONIONS  = 7;

// Enemy (Farquaad on horse)
const ENEMY_W     = 50;
const ENEMY_H     = 72;
const ENEMY_SPEED = 460; // px/s — slower than player max (560) → must keep moving

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    init (data)
    {
        // Lives persist across restarts — default 3 on first launch
        this.lives = (data && data.lives !== undefined) ? data.lives : 3;
    }

    create ()
    {
        this.onionCount        = 0;
        this.isWin             = false;
        this._isGameOver       = false;
        this._enemyMoving      = false;
        this._gameElapsed      = 0;
        this._speedMultiplier  = 1.0;
        this._mudTimer         = 0;
        this._startTime        = 0; // set after HUD, used for score
        this._enemyVY          = 0; // simulated vertical velocity for enemy

        this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

        this._makeTextures();
        this._createBackground();
        this._createNightOverlay();
        this._createLevel();
        this._createOnions();
        this._createFinish();
        this._createStartSign();
        this._createVillagers();
        this._createMudZones();
        this._createDragon();
        this._createPlayer();
        this._createEnemy();
        this._createHUD();
        this._updateNight();
        this._setupInput();

        this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(this.player, this.onions,    this._collectOnion, null, this);
        this.physics.add.overlap(this.player, this.finishGroup, this._winLevel, null, this);
        this.physics.add.overlap(this.player, this.villagers, this._onVillagerHit, null, this);
        this.physics.add.overlap(this.player, this.mudZones, this._onMudOverlap, null, this);

        this._startTime = this.time.now;
        EventBus.emit('current-scene-ready', this);
    }

    // ─── Texture generation ───────────────────────────────────────────────────

    _makeTextures ()
    {
        const make = (key, w, h, drawFn) => {
            if (this.textures.exists(key)) return;
            const g = this.add.graphics().setVisible(false);
            drawFn(g);
            g.generateTexture(key, w, h);
            g.destroy();
        };

        // 1×1 white pixel for platforms/ground (scaled + tinted)
        make('px', 1, 1, g => {
            g.fillStyle(0xffffff);
            g.fillRect(0, 0, 1, 1);
        });

        // Finish zone invisible trigger
        make('finish-px', 1, 1, g => {
            g.fillStyle(0xffffff);
            g.fillRect(0, 0, 1, 1);
        });

        // Onion collectible
        make('onion', ONION_W, ONION_H, g => {
            g.fillStyle(0xf0c000);
            g.fillEllipse(ONION_W / 2, ONION_H / 2 + 2, ONION_W, ONION_H - 4);
            g.fillStyle(0x7ab020);
            g.fillRect(ONION_W / 2 - 2, 0, 4, 8);
        });

        // ── Shrek sprite frames (44×60) ──────────────────────────────────────
        //
        // Palette
        const SK  = 0x4aaa3a;  // skin green
        const SKS = 0x3a8a2a;  // skin shadow
        const VS  = 0x7a5030;  // vest brown
        const VD  = 0x5a3820;  // vest dark
        const GL  = 0xd4a840;  // gold belt buckle
        const EW  = 0xf0e8d0;  // eye white
        const PU  = 0x2a1808;  // pupil dark
        const PT  = 0x5a3820;  // pants
        const W   = PLAYER_W;  // 44
        const H   = PLAYER_H;  // 60

        // Reusable: draw head + body (everything above y=44)
        const drawUpper = (g) => {
            // ── Head (y 0..30) ──
            // Base fill - larger head for ogre look
            g.fillStyle(SK);  g.fillRect(0, 0, W, 30);
            // Bigger rounder head
            g.fillStyle(SK);  g.fillEllipse(22, 15, 42, 30);
            // Iconic ears sticking out more (ogre ears)
            g.fillStyle(SK);  g.fillEllipse(2,  12, 12, 16);
            g.fillStyle(SK);  g.fillEllipse(42, 12, 12, 16);
            g.fillStyle(SKS); g.fillEllipse(2,  12, 8, 12);
            g.fillStyle(SKS); g.fillEllipse(42, 12, 8, 12);
            // Shrek antenna-ears (pointy protrusions at top)
            g.fillStyle(SK);  g.fillRect(8, -2, 4, 6);    // left antenna
            g.fillStyle(SKS); g.fillRect(9, -2, 2, 6);    // left antenna shadow
            g.fillStyle(SK);  g.fillRect(32, -2, 4, 6);   // right antenna
            g.fillStyle(SKS); g.fillRect(33, -2, 2, 6);   // right antenna shadow
            // Heavy prominent brow ridges (Shrek's scowl)
            g.fillStyle(SKS); g.fillRect(9, 4, 12, 7);
            g.fillStyle(SKS); g.fillRect(23, 4, 12, 7);
            g.fillStyle(VD);  g.fillRect(9, 4, 12, 3);
            g.fillStyle(VD);  g.fillRect(23, 4, 12, 3);
            // Eyes (larger + more expressive)
            g.fillStyle(EW);  g.fillEllipse(14, 13, 10, 8);
            g.fillStyle(EW);  g.fillEllipse(30, 13, 10, 8);
            g.fillStyle(PU);  g.fillRect(12,  10, 5, 6);
            g.fillStyle(PU);  g.fillRect(28,  10, 5, 6);
            g.fillStyle(0x000000); g.fillRect(13, 11, 3, 2); // highlight
            g.fillStyle(0x000000); g.fillRect(29, 11, 3, 2); // highlight
            // Prominent broad nose with visible nostrils (ogre nose)
            g.fillStyle(SKS); g.fillRect(18, 18, 8, 7);
            g.fillStyle(VD);  g.fillRect(18, 21, 3, 3);
            g.fillStyle(VD);  g.fillRect(23, 21, 3, 3);
            // Mouth / smile (more defined)
            g.fillStyle(VD);  g.fillRect(15, 25, 14, 4);
            g.fillStyle(0x000000); g.fillRect(16, 26, 12, 2);
            // ── Body / vest (y 30..46) ──
            g.fillStyle(SK);  g.fillRect(0,  30, W,  16);  // green skin base (wider chest)
            g.fillStyle(VS);  g.fillRect(5,  30, 14, 16);  // left vest panel (wider)
            g.fillStyle(VS);  g.fillRect(25, 30, 14, 16);  // right vest panel (wider)
            g.fillStyle(VD);  g.fillRect(5,  42, 34,  5);  // belt (wider)
            g.fillStyle(GL);  g.fillRect(18, 42,  8,  5);  // buckle (bigger)
        };

        // Reusable: draw a pair of legs given offsets
        // lx/rx = left/right leg x origin, ly/ry = y origin, lh/rh = height
        const drawLegs = (g, lx, ly, lh, rx, ry, rh) => {
            g.fillStyle(PT);
            g.fillRect(lx, ly, 13, lh);          // left leg (wider)
            g.fillRect(rx, ry, 13, rh);           // right leg (wider)
            g.fillStyle(VD);
            g.fillRect(lx - 1, ly + lh, 15, 5);  // left boot (bigger)
            g.fillRect(rx - 1, ry + rh, 15, 5);  // right boot (bigger)
        };

        // idle / walk2 (symmetric stance)
        make('shrek', W, H, g => {
            drawUpper(g);
            drawLegs(g,  7, 46, 12,  24, 46, 12);
        });

        // walk1 — left leg forward, right leg back
        make('shrek-walk1', W, H, g => {
            drawUpper(g);
            drawLegs(g,  5, 46, 13,  26, 48, 11);
        });

        // walk2 — same as idle (transition frame)
        make('shrek-walk2', W, H, g => {
            drawUpper(g);
            drawLegs(g,  7, 46, 12,  24, 46, 12);
        });

        // walk3 — right leg forward, left leg back
        make('shrek-walk3', W, H, g => {
            drawUpper(g);
            drawLegs(g, 11, 48, 11,  20, 46, 13);
        });

        // jump — legs tucked up
        make('shrek-jump', W, H, g => {
            drawUpper(g);
            g.fillStyle(PT);
            g.fillRect(6,  48, 13, 10);   // left leg tucked (wider)
            g.fillRect(25, 48, 13, 10);   // right leg tucked (wider)
            g.fillStyle(VD);
            g.fillRect(5,  56, 15, 4);
            g.fillRect(24, 56, 15, 4);
        });

        // ── Farquaad on horseback (50×72) ─────────────────────────────────────
        make('farquaad', ENEMY_W, ENEMY_H, g => {
            // Horse body (brown)
            g.fillStyle(0x8b5e2a);
            g.fillRect(0, 46, 50, 22);
            // Horse legs (dark brown)
            g.fillStyle(0x5a3c18);
            g.fillRect(5,  62, 7, 10);
            g.fillRect(15, 62, 7, 10);
            g.fillRect(28, 62, 7, 10);
            g.fillRect(38, 62, 7, 10);
            // Horse head (front-left)
            g.fillStyle(0x8b5e2a);
            g.fillRect(0, 40, 16, 18);
            g.fillStyle(0x5a3c18);
            g.fillRect(0, 52, 10, 4); // mouth/snout detail
            // Horse mane
            g.fillStyle(0x3d2000);
            g.fillRect(0, 36, 8, 16);
            // Farquaad armor body (red/purple)
            g.fillStyle(0x8b1a1a);
            g.fillRect(15, 20, 20, 28);
            // Armor shoulder pads
            g.fillStyle(0xc0c0c0);
            g.fillRect(11, 22, 8, 8);
            g.fillRect(31, 22, 8, 8);
            // Armor center stripe (gold)
            g.fillStyle(0xd4a020);
            g.fillRect(22, 20, 6, 28);
            // Farquaad head (skin tone)
            g.fillStyle(0xf0c090);
            g.fillRect(17, 4, 16, 18);
            // Dark hair
            g.fillStyle(0x1a0a00);
            g.fillRect(17, 4, 16, 6);
            // Eyes
            g.fillStyle(0xffffff);
            g.fillRect(19, 12, 4, 4);
            g.fillRect(27, 12, 4, 4);
            g.fillStyle(0x000000);
            g.fillRect(20, 13, 2, 2);
            g.fillRect(28, 13, 2, 2);
            // Crown (gold)
            g.fillStyle(0xd4a020);
            g.fillRect(16, 0, 4, 6);  // left tooth
            g.fillRect(23, 0, 4, 7);  // center tooth (tallest)
            g.fillRect(30, 0, 4, 6);  // right tooth
            g.fillRect(16, 4, 18, 4); // crown base
            // Right arm holding reins
            g.fillStyle(0x8b1a1a);
            g.fillRect(35, 26, 12, 6);
            g.fillStyle(0xf0c090);
            g.fillRect(45, 26, 5, 6); // fist
            // Lance (hampe bois + pointe métal, tenue horizontalement pointée vers le joueur)
            g.fillStyle(0x8b6020);  // bois de la hampe
            g.fillRect(35, 22, 15, 3);  // hampe (sort à droite du sprite)
            g.fillStyle(0xd8d8d8);  // métal argenté
            g.fillRect(48, 19, 6, 9);  // pointe triangulaire (simulée en rectangle)
            g.fillStyle(0xffffff);
            g.fillRect(51, 21, 2, 5);  // reflet sur la pointe
        });

        // Villager with pitchfork (32×52)
        make('villager', 32, 52, g => {
            // Body (white shirt)
            g.fillStyle(0xf0f0e0);
            g.fillRect(8, 18, 16, 18);
            // Pants (brown)
            g.fillStyle(0x6b4c2a);
            g.fillRect(8, 36, 7, 14);
            g.fillRect(17, 36, 7, 14);
            // Boots
            g.fillStyle(0x3a2010);
            g.fillRect(7, 48, 9, 4);
            g.fillRect(16, 48, 9, 4);
            // Head (skin)
            g.fillStyle(0xf0c090);
            g.fillEllipse(16, 12, 18, 18);
            // Hair (dark)
            g.fillStyle(0x3a2800);
            g.fillRect(8, 4, 16, 8);
            // Eyes
            g.fillStyle(0x000000);
            g.fillRect(12, 10, 2, 2);
            g.fillRect(18, 10, 2, 2);
            // Pitchfork handle (wood, left side)
            g.fillStyle(0x8b6020);
            g.fillRect(2, 2, 3, 48);
            // Pitchfork head (metal)
            g.fillStyle(0xb0b0b0);
            g.fillRect(0, 0, 3, 6);   // left tine
            g.fillRect(4, 0, 3, 6);   // right tine
            g.fillRect(0, 4, 7, 3);   // crossbar
        });

        // Mud zone (1×1 pixel, will be scaled — dark brown)
        make('mud', 1, 1, g => {
            g.fillStyle(0x5a3820);
            g.fillRect(0, 0, 1, 1);
        });

        // Dragon (80×60) — hovering mid-air, faces left (toward player)
        make('dragon', 80, 60, g => {
            // Body (dark green)
            g.fillStyle(0x2a6e1a);
            g.fillEllipse(42, 34, 52, 36);
            // Belly (lighter)
            g.fillStyle(0x6aaa3a);
            g.fillEllipse(42, 38, 36, 24);
            // Head (faces left)
            g.fillStyle(0x2a6e1a);
            g.fillEllipse(14, 22, 32, 26);
            // Snout
            g.fillStyle(0x3a8a2a);
            g.fillRect(0, 22, 14, 12);
            // Nostrils
            g.fillStyle(0x1a4a10);
            g.fillRect(2, 24, 3, 3);
            g.fillRect(6, 24, 3, 3);
            // Eye (yellow + slit)
            g.fillStyle(0xffdd00);
            g.fillEllipse(20, 16, 10, 8);
            g.fillStyle(0x000000);
            g.fillRect(23, 13, 2, 7);
            // Teeth (white, bottom of snout)
            g.fillStyle(0xffffff);
            g.fillRect(2, 32, 3, 5);
            g.fillRect(7, 34, 3, 5);
            g.fillRect(12, 33, 3, 4);
            // Wing left (folded up)
            g.fillStyle(0x1a5010);
            g.fillTriangle(30, 10, 55, 0, 65, 20);
            g.fillStyle(0x3a8020);
            g.fillTriangle(32, 12, 52, 4, 60, 18);
            // Wing right (partially visible)
            g.fillStyle(0x1a5010);
            g.fillTriangle(50, 14, 72, 4, 78, 22);
            // Tail
            g.fillStyle(0x2a6e1a);
            g.fillRect(62, 38, 18, 8);
            g.fillRect(72, 42, 10, 6);
            g.fillRect(78, 46, 6, 4);
            // Spikes on back
            g.fillStyle(0x1a4a10);
            [38, 46, 54].forEach(x => {
                g.fillTriangle(x, 18, x - 4, 30, x + 4, 30);
            });
        });

        // Donkey (60×48) — decorative, Shrek 2 wink
        make('donkey', 60, 48, g => {
            // Body (grey-beige)
            g.fillStyle(0xb8a888);
            g.fillEllipse(30, 30, 44, 26);
            // Head
            g.fillStyle(0xb8a888);
            g.fillEllipse(8, 22, 22, 18);
            // Long snout
            g.fillStyle(0xc8b898);
            g.fillEllipse(2, 26, 14, 10);
            // Nostril
            g.fillStyle(0x7a6040);
            g.fillCircle(3, 27, 2);
            // Eye
            g.fillStyle(0x3a2800);
            g.fillCircle(10, 18, 3);
            g.fillStyle(0xffffff);
            g.fillCircle(11, 17, 1);
            // Ears (long)
            g.fillStyle(0xb8a888);
            g.fillRect(10, 4, 6, 16);
            g.fillRect(18, 6, 5, 14);
            g.fillStyle(0xd4b0b0);
            g.fillRect(11, 6, 3, 12);
            // Mane
            g.fillStyle(0x7a6840);
            g.fillRect(14, 10, 20, 5);
            // Legs
            g.fillStyle(0xa89878);
            g.fillRect(16, 38, 7, 10);
            g.fillRect(25, 39, 7, 9);
            g.fillRect(36, 38, 7, 10);
            g.fillRect(45, 39, 7, 9);
            // Tail (small tuft)
            g.fillStyle(0x7a6840);
            g.fillRect(52, 24, 4, 10);
            g.fillCircle(54, 34, 4);
        });
    }

    // ─── Background ───────────────────────────────────────────────────────────

    _createBackground ()
    {
        // Sky
        this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x5a9e6a);

        // Distant hills
        for (let x = 0; x < WORLD_W; x += 400) {
            const h = 100 + (x % 600) / 4;
            this.add.rectangle(x + 200, GROUND_SURFACE - h / 2, 380, h, 0x3a7040).setAlpha(0.5);
        }

        // Swamp trees — organic canopy + brown trunk + hanging vines
        for (let x = 80; x < WORLD_W; x += 220 + (x % 90)) {
            const trunkH  = 65 + (x % 65);
            const trunkW  = 16 + (x % 10);
            const topY    = GROUND_SURFACE - trunkH;
            const cSize   = 48 + (x % 42);

            const g = this.add.graphics().setAlpha(0.72);

            // Trunk (gnarled dark brown)
            g.fillStyle(0x3a2008);
            g.fillRect(x - trunkW / 2, topY, trunkW, trunkH);
            // Slightly wider base
            g.fillRect(x - trunkW / 2 - 4, topY + trunkH - 14, trunkW + 8, 14);

            // Canopy — overlapping circles for organic swamp tree look
            g.fillStyle(0x1b4710);
            g.fillCircle(x, topY, cSize);
            g.fillStyle(0x245a18);
            g.fillCircle(x - cSize * 0.52, topY + cSize * 0.18, cSize * 0.68);
            g.fillCircle(x + cSize * 0.52, topY + cSize * 0.18, cSize * 0.62);
            g.fillStyle(0x1b4710);
            g.fillCircle(x, topY - cSize * 0.38, cSize * 0.72);

            // Hanging Spanish moss / vines
            g.fillStyle(0x2a5c12);
            const vineOffsets = [-18, -4, 10, 24];
            vineOffsets.forEach((ox, i) => {
                const vLen = 14 + ((x + i * 7) % 18);
                g.fillRect(x + ox, topY + cSize * 0.55, 3, vLen);
            });
        }

        // Mud strip under ground surface
        this.add.rectangle(WORLD_W / 2, GROUND_CY, WORLD_W, GROUND_H, 0x3d2b1f);
    }

    // ─── Night overlay (linked to lives) ─────────────────────────────────────

    _createNightOverlay ()
    {
        // Full-screen dark rectangle — depth 3 = above bg, below sprites
        this.nightOverlay = this.add.rectangle(
            WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x000033
        ).setDepth(3).setAlpha(0);
    }

    _updateNight ()
    {
        if (!this.nightOverlay) return;
        // 3 lives=day, 2=dusk, 1=night
        const targetAlpha = this.lives <= 1 ? 0.50 : this.lives <= 2 ? 0.25 : 0.0;
        this.tweens.add({
            targets: this.nightOverlay,
            alpha: targetAlpha,
            duration: 600,
            ease: 'Quad.easeInOut',
        });
    }

    // ─── Level geometry ───────────────────────────────────────────────────────

    _createLevel ()
    {
        this.platforms = this.physics.add.staticGroup();

        // cx = center x,  cy = center y of body
        const addTile = (cx, cy, w, h, tint) => {
            this.platforms.create(cx, cy, 'px')
                .setScale(w, h)
                .setTint(tint)
                .refreshBody();
        };

        // Ground sections  (gap1: 1400-1550, gap2: 2550-2720, gap3: 3720-3900, gap4: 4870-5050)
        const groundTiles = [
            [0,    1400],
            [1550, 1000],  // 1550..2550
            [2720, 1000],  // 2720..3720
            [3900,  970],  // 3900..4870
            [5050,  950],  // 5050..6000
        ];
        groundTiles.forEach(([x, w]) => {
            addTile(x + w / 2, GROUND_CY, w, GROUND_H, 0x5a8a3c);
        });

        // Decorative ground line (darker strip at top)
        groundTiles.forEach(([x, w]) => {
            addTile(x + w / 2, GROUND_SURFACE + 4, w, 8, 0x3d6a28);
        });

        // Platforms: [leftX, surfaceY, width]
        const plats = [
            // Approach to gap 1
            [880,  640, 160],
            [1100, 570, 140],
            // Bridge over gap 1
            [1360, 690, 180],
            // After gap 1
            [1720, 620, 200],
            [1980, 530, 160],
            [2220, 610, 140],
            // Bridge over gap 2
            [2500, 688, 200],
            // After gap 2
            [2780, 570, 200],
            [3020, 480, 160],
            [3240, 570, 180],
            // Bridge over gap 3
            [3680, 688, 200],
            // After gap 3
            [3960, 600, 200],
            [4200, 510, 160],
            [4450, 600, 180],
            // Bridge over gap 4
            [4820, 688, 200],
            // Final stretch platforms
            [5120, 610, 220],
            [5380, 520, 180],
            [5620, 610, 200],
        ];

        plats.forEach(([lx, sy, w]) => {
            const cx = lx + w / 2;
            const cy = sy + PLAT_H / 2;
            addTile(cx, cy, w, PLAT_H, 0x6aaa4c);
            // Darker edge
            addTile(cx, sy + 2, w, 4, 0x4a8a2c);
        });
    }

    // ─── Onions ───────────────────────────────────────────────────────────────

    _createOnions ()
    {
        this.onions = this.physics.add.staticGroup();

        // Placed on/above ground or platforms  [x, y]
        const positions = [
            [200, 690],  [500, 690],  [900, 600],  [1150, 530],
            [1400, 650], [1750, 580], [2010, 490], [2260, 570],
            [2550, 648], [2820, 530],  [3050, 450], [3280, 530],
            [3700, 648], [3990, 560], [4240, 470], [4480, 560],
            [4850, 648], [5150, 570], [5410, 480], [5660, 570], [5950, 600],
        ];

        this.totalOnions = positions.length;

        positions.forEach(([x, y]) => {
            const o = this.onions.create(x, y, 'onion').refreshBody();
            this.tweens.add({
                targets: o,
                y: y - 7,
                duration: 700 + Math.random() * 300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    // ─── Finish zone ──────────────────────────────────────────────────────────

    _createFinish ()
    {
        const fx = 5860;
        const gy = GROUND_SURFACE;

        // ── Shrek's Outhouse ─────────────────────────────────────────────────

        // Odeur verte ondulée (3 tirets) au-dessus
        [{ ox: -10, oy: 148 }, { ox: 0, oy: 158 }, { ox: 10, oy: 148 }].forEach(p => {
            this.add.rectangle(fx + p.ox, gy - p.oy, 10, 5, 0x7aaa00);
        });

        // Toit pointu simulé en escalier (du haut vers le bas, de plus en plus large)
        const roofColor = 0x4a3010;
        [
            { w: 14, oy: 128 },
            { w: 28, oy: 118 },
            { w: 42, oy: 108 },
            { w: 56, oy: 98 },
            { w: 70, oy: 88 },
        ].forEach(r => {
            this.add.rectangle(fx, gy - r.oy, r.w, 12, roofColor);
        });

        // Corps principal de la cabane
        this.add.rectangle(fx, gy - 45, 60, 90, 0x8b5e2a);

        // Planches verticales sombres
        [-18, -6, 6, 18].forEach(ox => {
            this.add.rectangle(fx + ox, gy - 45, 3, 90, 0x5a3c18);
        });

        // Porte sombre
        this.add.rectangle(fx, gy - 18, 24, 54, 0x3a2010);

        // Croissant de lune sur la porte (cercle clair centré haut de porte)
        this.add.circle(fx, gy - 38, 9, 0xf5e060);
        // Demi-disque sombre par-dessus pour simuler le croissant
        this.add.circle(fx + 5, gy - 38, 7, 0x3a2010);

        // Panneau "SHREK" au-dessus de la porte
        this.add.rectangle(fx, gy - 75, 50, 14, 0x5a3c18);
        this.add.text(fx, gy - 75, 'SHREK', {
            fontSize: '9px',
            color: '#f5e060',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);

        // Invisible trigger
        this.finishGroup = this.physics.add.staticGroup();
        this.finishGroup.create(fx, gy - 50, 'finish-px')
            .setScale(100, 100)
            .setAlpha(0)
            .refreshBody();
    }

    // ─── Dragon & Âne (décoratifs) ────────────────────────────────────────────

    _createDragon ()
    {
        // Plateforme [3020, 480, 160] — surfaceY = 480
        const platSurfaceY = 480;

        // Dragon : côté droit, face à gauche (vers l'âne)
        const dx = 3145;
        const dy = platSurfaceY - 30; // pieds sur la plateforme
        this.dragon = this.add.sprite(dx, dy, 'dragon').setDepth(4).setFlipX(false);

        // Léger balancement sur place (reste sur la plateforme)
        this.tweens.add({
            targets: this.dragon,
            y: dy - 6,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        this.tweens.add({
            targets: this.dragon,
            scaleY: 1.06,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.easeInOut',
        });

        // Âne : côté gauche, face à droite (vers le dragon)
        const ax = 3045;
        const ay = platSurfaceY - 24; // pieds sur la plateforme
        this.add.sprite(ax, ay, 'donkey').setDepth(4).setFlipX(true);

        // Tout petit cœur entre les deux
        const heartX = (ax + dx) / 2;
        const heartY = platSurfaceY - 55;
        const heart = this.add.graphics().setDepth(5);
        heart.fillStyle(0xff2255);
        // Radii réduits à 4 pour un cœur minuscule
        heart.fillCircle(-4, 0, 4);
        heart.fillCircle(4, 0, 4);
        heart.fillTriangle(-8, 3, 8, 3, 0, 12);
        heart.x = heartX;
        heart.y = heartY;

        // Légère pulsation
        this.tweens.add({
            targets: heart,
            scaleX: 1.25, scaleY: 1.25,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        // Légère flottaison
        this.tweens.add({
            targets: heart,
            y: heartY - 5,
            duration: 1400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    // ─── Player ───────────────────────────────────────────────────────────────

    _createPlayer ()
    {
        // Physics body — texture never changes, body always stable
        this.player = this.physics.add.sprite(100, GROUND_SURFACE - PLAYER_H / 2, 'shrek');
        this.player.setBounce(0.05);
        this.player.setCollideWorldBounds(true);
        this.player.setMaxVelocity(PLAYER_SPEED, 1400);
        this.player.setDragX(PLAYER_DRAG);
        this.player.setAlpha(0); // invisible — visuals handled by playerSprite

        // Visual sprite — no physics, just follows the body and handles animation
        this.playerSprite = this.add.sprite(100, GROUND_SURFACE - PLAYER_H / 2, 'shrek');
        this.playerSprite.setDepth(5);

        // Animation state
        this._walkFrame   = 0;
        this._walkTimer   = 0;
        this._wasOnGround = true;
        this._isSquashing = false;
    }

    // ─── Start sign ───────────────────────────────────────────────────────────

    _createStartSign ()
    {
        const sx = 200;
        const gy = GROUND_SURFACE;

        // Post
        this.add.rectangle(sx, gy - 40, 6, 80, 0x6b4c2a);
        // Sign board
        this.add.rectangle(sx, gy - 90, 160, 50, 0xf0e8c0);
        this.add.rectangle(sx, gy - 90, 156, 46, 0xe8d890);
        // Text
        this.add.text(sx, gy - 98, 'MARÉCAGE DE SHREK', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 11,
            color: '#3a2010',
            align: 'center',
        }).setOrigin(0.5);
        this.add.text(sx, gy - 82, '⚠ PROPRIÉTÉ PRIVÉE ⚠', {
            fontFamily: 'Fondamento',
            fontSize: 10,
            color: '#8b1a1a',
            align: 'center',
        }).setOrigin(0.5);
    }

    // ─── Villagers (static enemies with pitchforks) ───────────────────────────

    _createVillagers ()
    {
        this.villagers = this.physics.add.staticGroup();

        // Positions on solid ground sections (away from gaps and start)
        const positions = [
            700,  1650, 1900,
            2800, 3100,
            3980, 4300,
            5150, 5500,
        ];

        positions.forEach(x => {
            this.villagers.create(x, GROUND_SURFACE - 26, 'villager').refreshBody();
        });
    }

    // ─── Mud zones (slow the player) ─────────────────────────────────────────

    _createMudZones ()
    {
        this.mudZones = this.physics.add.staticGroup();

        // [x_center, width] — on ground
        const zones = [
            [450,  200],
            [1200, 160],
            [2100, 180],
            [3300, 200],
            [4600, 160],
        ];

        zones.forEach(([cx, w]) => {
            // Visual: dark brown rectangle on ground surface
            this.add.rectangle(cx, GROUND_SURFACE + 2, w, 8, 0x5a3820, 0.85);
            // Bubbles (small circles for visual)
            for (let i = 0; i < 3; i++) {
                this.add.circle(cx - 40 + i * 40, GROUND_SURFACE - 2, 4, 0x7a5830, 0.7);
            }
            // Physics trigger (thin strip on ground surface)
            this.mudZones.create(cx, GROUND_SURFACE - 4, 'mud')
                .setScale(w, 16)
                .setAlpha(0)
                .refreshBody();
        });
    }

    // ─── Enemy ────────────────────────────────────────────────────────────────

    _createEnemy ()
    {
        const startX = -300;
        const startY = GROUND_SURFACE - ENEMY_H / 2;

        this.enemy = this.add.sprite(startX, startY, 'farquaad').setDepth(4);

        // Gallop bob tween (loops forever)
        this.tweens.add({
            targets: this.enemy,
            y: startY - 6,
            duration: 180,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // 1.2-second grace period before Farquaad starts chasing
        this._enemyMoving = false;
        this.time.delayedCall(1200, () => {
            this._enemyMoving = true;
            // Flash warning text
            const warn = this.add.text(512, 200, '⚠ FARQUAAD ARRIVE !', {
                fontFamily: 'Uncial Antiqua',
                fontSize: 36,
                color: '#ff4400',
                stroke: '#000000',
                strokeThickness: 8,
            }).setOrigin(0.5).setScrollFactor(0).setDepth(25);
            this.tweens.add({
                targets: warn,
                alpha: 0,
                delay: 1500,
                duration: 600,
                onComplete: () => warn.destroy(),
            });
        });
    }

    // ─── HUD ──────────────────────────────────────────────────────────────────

    _createHUD ()
    {
        this.hudBg = this.add.rectangle(125, 28, 240, 44, 0x000000, 0.55)
            .setScrollFactor(0).setDepth(10);

        this.hudText = this.add.text(14, 10, '', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 18,
            color: '#f5d020',
            stroke: '#000000',
            strokeThickness: 4,
        }).setScrollFactor(0).setDepth(11);

        // Danger / proximity bar (right side of screen)
        this.dangerBg = this.add.rectangle(750, 28, 260, 44, 0x000000, 0.55)
            .setScrollFactor(0).setDepth(10);

        this.dangerLabel = this.add.text(628, 10, '🐴 FARQUAAD', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 14,
            color: '#ff8800',
            stroke: '#000000',
            strokeThickness: 3,
        }).setScrollFactor(0).setDepth(11);

        // Bar track
        this.add.rectangle(750, 34, 128, 12, 0x333333, 0.9)
            .setScrollFactor(0).setDepth(11);

        // Danger fill bar (origin left = 0, so width grows rightward)
        this.dangerBar = this.add.rectangle(686, 34, 1, 10, 0x22bb22)
            .setOrigin(0, 0.5)
            .setScrollFactor(0).setDepth(12);

        // Hearts display (lives)
        this.heartTexts = [];
        for (let i = 0; i < 3; i++) {
            const h = this.add.text(14 + i * 32, 36, '❤', {
                fontFamily: 'Fondamento',
                fontSize: 22,
                color: '#ff4444',
            }).setScrollFactor(0).setDepth(11);
            this.heartTexts.push(h);
        }

        this._updateHUD();
    }

    _updateHUD ()
    {
        const reached = this.onionCount >= MIN_ONIONS;
        this.hudText.setText(`Oignons: ${this.onionCount} / ${this.totalOnions}`);
        this.hudText.setColor(reached ? '#6ecf3a' : '#f5d020');
        if (this.heartTexts) {
            this.heartTexts.forEach((h, i) => {
                h.setAlpha(i < this.lives ? 1 : 0.2);
            });
        }
    }

    // ─── Input ────────────────────────────────────────────────────────────────

    _setupInput ()
    {
        this.keys = this.input.keyboard.addKeys({
            left:   'Q',
            right:  'D',
            up:     'Z',
            space:  'SPACE',
            left2:  'LEFT',
            right2: 'RIGHT',
            up2:    'UP',
        });
    }

    // ─── Update loop ─────────────────────────────────────────────────────────

    update (time, delta)
    {
        // Always sync visual to physics body (even on win screen so player settles)
        this.playerSprite.setPosition(this.player.x, this.player.y);

        if (this.isWin) return;

        const k = this.keys;
        const onGround = this.player.body.blocked.down;
        const vx = this.player.body.velocity.x;
        const vy = this.player.body.velocity.y;

        // ── Movement (physics body only) ──
        const goLeft  = k.left.isDown  || k.left2.isDown;
        const goRight = k.right.isDown || k.right2.isDown;
        const jump    = k.up.isDown    || k.up2.isDown || k.space.isDown;

        // ── Mud slow effect ──
        if (this._mudTimer > 0) {
            this._mudTimer -= delta;
            // Halve max speed while in mud
            this.player.setMaxVelocity(PLAYER_SPEED * 0.45, 1400);
        } else {
            this.player.setMaxVelocity(PLAYER_SPEED, 1400);
        }

        if (goLeft) {
            this.player.setAccelerationX(-PLAYER_ACCEL);
            this.playerSprite.setFlipX(true);
        } else if (goRight) {
            this.player.setAccelerationX(PLAYER_ACCEL);
            this.playerSprite.setFlipX(false);
        } else {
            this.player.setAccelerationX(0);
        }

        if (jump && onGround) {
            this.player.setVelocityY(JUMP_VEL);
        }

        // ── Animation frame (visual sprite only — never touches physics body) ──
        const WALK_FRAMES = ['shrek-walk1', 'shrek-walk2', 'shrek-walk3', 'shrek-walk2'];
        const FRAME_MS    = 130;

        if (!onGround) {
            this.playerSprite.setTexture('shrek-jump');
        } else if (Math.abs(vx) > 60) {
            this._walkTimer += delta;
            if (this._walkTimer >= FRAME_MS) {
                this._walkTimer = 0;
                this._walkFrame = (this._walkFrame + 1) % WALK_FRAMES.length;
            }
            this.playerSprite.setTexture(WALK_FRAMES[this._walkFrame]);
        } else {
            this._walkTimer = 0;
            this._walkFrame = 0;
            this.playerSprite.setTexture('shrek');
        }

        // ── Landing squash ──
        if (onGround && !this._wasOnGround) {
            this._isSquashing = true;
            this.tweens.add({
                targets: this.playerSprite,
                scaleX: 1.25,
                scaleY: 0.70,
                duration: 60,
                yoyo: true,
                ease: 'Quad.easeOut',
                onComplete: () => { this._isSquashing = false; }
            });
        }
        this._wasOnGround = onGround;

        // ── In-air squash/stretch ──
        if (!onGround && !this._isSquashing) {
            this.playerSprite.setScale(vy < 0 ? 0.88 : 1.06, vy < 0 ? 1.14 : 0.94);
        } else if (onGround && !this._isSquashing) {
            this.playerSprite.setScale(1, 1);
        }

        // ── Lean based on speed ──
        this.playerSprite.setRotation(PhaserMath.Clamp(vx / 8000, -0.15, 0.15));

        // ── Enemy speed acceleration (every 20s, +8%, max ×2.2) ──
        if (this._enemyMoving && !this._isGameOver) {
            this._gameElapsed += delta;
            this._speedMultiplier = Math.min(2.2, 1 + Math.floor(this._gameElapsed / 20000) * 0.08);
        }

        // ── Enemy (Farquaad) movement, sword, and collision ──
        if (!this._isGameOver) {
            if (this._enemyMoving) {
                // Chase the player in both directions — prevents player from jumping over
                const targetX = this.player.x - 24;
                const step = ENEMY_SPEED * this._speedMultiplier * delta / 1000;
                if (this.enemy.x < targetX) {
                    this.enemy.x = Math.min(this.enemy.x + step, targetX);
                } else if (this.enemy.x > targetX + 10) {
                    this.enemy.x = Math.max(this.enemy.x - step, targetX);
                }

                // Vertical tracking: snap when player is in the air and nearby
                const playerInAir = !this.player.body.blocked.down;
                const dx = this.player.x - this.enemy.x;
                const groundY     = GROUND_SURFACE - ENEMY_H / 2;
                if (playerInAir) {
                    // Snap to player height instantly — can't be jumped over
                    this.enemy.y  = this.player.y;
                    this._enemyVY = 0;
                } else {
                    // Simulate gravity to fall back to ground naturally
                    this._enemyVY     += 1800 * delta / 1000;
                    this.enemy.y       = Math.min(this.enemy.y + this._enemyVY * delta / 1000, groundY);
                    if (this.enemy.y >= groundY) { this.enemy.y = groundY; this._enemyVY = 0; }
                }
            }

            // Collision check: player center vs enemy hitbox (including mid-air leaps)
            if (this._enemyMoving) {
                const dx = Math.abs(this.player.x - this.enemy.x);
                const dy = Math.abs(this.player.y - this.enemy.y);
                if (dx < 32 && dy < 58) {
                    this._onEnemyCatch();
                }
            }

            // HUD danger bar update
            const dist    = Math.max(0, this.player.x - this.enemy.x);
            const danger  = PhaserMath.Clamp(1 - dist / 650, 0, 1);
            const barW    = Math.floor(126 * danger);
            this.dangerBar.setSize(Math.max(1, barW), 10);
            const col = danger > 0.7 ? 0xff2222 : danger > 0.4 ? 0xf5d020 : 0x22bb22;
            this.dangerBar.setFillStyle(col);
        }

    }

    // ─── Callbacks ────────────────────────────────────────────────────────────

    _onEnemyCatch ()
    {
        if (this._isGameOver) return;
        this._isGameOver  = true; // prevent double-call before scene transition
        this._enemyMoving = false;

        this.lives--;

        if (this.lives <= 0) {
            // No lives left — go to score screen
            this.player.setVelocity(0, 0);
            this.player.setAccelerationX(0);
            AudioManager.gameOver();
            this.scene.start('ScoreSummary', {
                won:         false,
                onionCount:  this.onionCount,
                totalOnions: this.totalOnions,
                lives:       0,
                timeMs:      this.time.now - this._startTime,
            });
            return;
        }

        // Lives remaining — restart level from beginning, keeping lives count
        this._updateNight();
        AudioManager.hit();
        this.scene.restart({ lives: this.lives });
    }

    _collectOnion (player, onion)
    {
        onion.destroy();
        this.onionCount++;
        this._updateHUD();
        AudioManager.onion();

        // Quick scale pop on HUD
        this.tweens.add({
            targets: this.hudBg,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 80,
            yoyo: true,
        });
    }

    _onVillagerHit (player, villager)
    {
        // Villager deals damage like Farquaad (respects invincibility)
        this._onEnemyCatch();
    }

    _onMudOverlap ()
    {
        // Refresh mud timer — slows player for 300ms
        this._mudTimer = 300;
    }

    _winLevel ()
    {
        if (this.isWin) return;

        // Block finish if not enough onions
        if (this.onionCount < MIN_ONIONS) {
            const needed = MIN_ONIONS - this.onionCount;
            const msg = this.add.text(512, 250,
                `🧅 Encore ${needed} oignon${needed > 1 ? 's' : ''} !`,
                {
                    fontFamily: 'Uncial Antiqua',
                    fontSize: 32,
                    color: '#ff8800',
                    stroke: '#000000',
                    strokeThickness: 7,
                }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(30);
            this.tweens.add({
                targets: msg,
                alpha: 0,
                delay: 1800,
                duration: 500,
                onComplete: () => msg.destroy(),
            });
            return;
        }

        this.isWin = true;

        // Stop everything
        this._enemyMoving = false;
        this.tweens.killTweensOf(this.enemy);
        AudioManager.win();

        this.player.setAccelerationX(0);
        this.player.setVelocityX(0);

        // Go to score screen
        this.time.delayedCall(600, () => {
            this.scene.start('ScoreSummary', {
                won:         true,
                onionCount:  this.onionCount,
                totalOnions: this.totalOnions,
                lives:       this.lives,
                timeMs:      this.time.now - this._startTime,
            });
        });
    }
}
