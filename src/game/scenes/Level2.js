import { AudioManager } from '../AudioManager';
import { CastleAudio } from '../audio/CastleAudio';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Math as PhaserMath } from 'phaser';
import { LEVEL_2_CONFIG, getLevel2ObstaclesForDifficulty, getLevel2BossConfigForDifficulty, getLevel2PlayerConfigForDifficulty } from '../config/levels';
import { CastleVFX } from '../effects/CastleVFX';

// World dimensions (Level 2 is castle-themed, slightly shorter)
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
const MIN_ONIONS = 7;

// Enemy (Farquaad on horse) — speed will be difficulty-based
const ENEMY_W = 50;
const ENEMY_H = 72;

export class Level2 extends Scene
{
    constructor ()
    {
        super('Level2');
    }

    init (data)
    {
        // Carry over lives and score from Level 1
        this.lives = (data && data.lives !== undefined) ? data.lives : 3;
        this.level1Score = (data && data.level1Score !== undefined) ? data.level1Score : 0;
        
        // Get difficulty from localStorage
        this.selectedDifficulty = localStorage.getItem('selectedDifficulty') || 'normal';
    }

    create ()
    {
        this.onionCount        = 0;
        this.isWin             = false;
        this._isGameOver       = false;
        this._enemyMoving      = false;
        this._gameElapsed      = 0;
        this._speedMultiplier  = 1.0;
        this._spikeTimer       = 0;
        this._startTime        = 0;
        this._enemyVY          = 0;
        
        // Initialize VFX system
        this.vfx = new CastleVFX(this);
        this._bossRageActive = false;

        // Initialize Castle Audio system
        CastleAudio.init();
        CastleAudio.startMusic();
        
        // Get difficulty-based config
        const playerConfig = getLevel2PlayerConfigForDifficulty(this.selectedDifficulty);
        const bossConfig = getLevel2BossConfigForDifficulty(this.selectedDifficulty);
        const obstaclesConfig = getLevel2ObstaclesForDifficulty(this.selectedDifficulty);
        
        // Store for use in update
        this._playerSpeed = playerConfig.playerSpeed;
        this._playerJumpPower = playerConfig.playerJumpPower;
        this._bossBaseSpeed = bossConfig.baseSpeed;
        this._bossMaxSpeed = bossConfig.maxSpeed;
        this._bossDifficultyScaling = bossConfig.difficultyScaling;
        this._obstaclesConfig = obstaclesConfig;

        this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

        this._makeTextures();
        this._createBackground();
        this._createNightOverlay();
        this._createLevel();
        this._createOnions();
        this._createFinish();
        this._createStartSign();
        this._createCastleGuards();
        this._createSpikeZones();
        this._createDoors();
        this._createPlayer();
        this._createEnemy();
        this._createHUD();
        this._createTorchEffects();
        this._updateNight();
        this._setupInput();

        this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.doors);
        this.physics.add.overlap(this.player, this.onions, this._collectOnion, null, this);
        this.physics.add.overlap(this.player, this.finishGroup, this._winLevel, null, this);
        this.physics.add.overlap(this.player, this.castleGuards, this._onGuardHit, null, this);
        this.physics.add.overlap(this.player, this.spikeZones, this._onSpikeHit, null, this);

        this._startTime = this.time.now;
        
        // Show difficulty hint
        this.vfx.difficultyColorHint(this.selectedDifficulty, 512, 100);
        
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

        // Spike texture (deadly)
        make('spike', 1, 1, g => {
            g.fillStyle(0xff4444);
            g.fillRect(0, 0, 1, 1);
        });

        // Door texture (castle door)
        make('door', 1, 1, g => {
            g.fillStyle(0x3a2010);
            g.fillRect(0, 0, 1, 1);
        });

        // ── Shrek sprite frames (44×60) ──────────────────────────────────────
        const SK  = 0x4aaa3a;  // skin green
        const SKS = 0x3a8a2a;  // skin shadow
        const VS  = 0x7a5030;  // vest brown
        const VD  = 0x5a3820;  // vest dark
        const GL  = 0xd4a840;  // gold belt buckle
        const EW  = 0xf0e8d0;  // eye white
        const PU  = 0x2a1808;  // pupil dark
        const PT  = 0x5a3820;  // pants
        const W   = PLAYER_W;
        const H   = PLAYER_H;

        const drawUpper = (g) => {
            g.fillStyle(SK);  g.fillRect(0, 0, W, 27);
            g.fillStyle(SK);  g.fillEllipse(22, 14, 40, 27);
            g.fillStyle(SKS); g.fillEllipse(2,  11, 10, 14);
            g.fillStyle(SKS); g.fillEllipse(42, 11, 10, 14);
            g.fillStyle(SKS); g.fillRect(10, 6, 10, 5);
            g.fillStyle(SKS); g.fillRect(24, 6, 10, 5);
            g.fillStyle(EW);  g.fillEllipse(15, 12, 9, 7);
            g.fillStyle(EW);  g.fillEllipse(29, 12, 9, 7);
            g.fillStyle(PU);  g.fillRect(13,  9, 4, 5);
            g.fillStyle(PU);  g.fillRect(27,  9, 4, 5);
            g.fillStyle(SKS); g.fillRect(19, 17, 6, 5);
            g.fillStyle(VD);  g.fillRect(19, 19, 2, 2);
            g.fillStyle(VD);  g.fillRect(23, 19, 2, 2);
            g.fillStyle(VD);  g.fillRect(16, 23, 12, 3);
            g.fillStyle(SK);  g.fillRect(0,  27, W,  17);
            g.fillStyle(VS);  g.fillRect(7,  27, 12, 17);
            g.fillStyle(VS);  g.fillRect(25, 27, 12, 17);
            g.fillStyle(VD);  g.fillRect(7,  40, 30,  5);
            g.fillStyle(GL);  g.fillRect(19, 40,  6,  5);
        };

        const drawLegs = (g, lx, ly, lh, rx, ry, rh) => {
            g.fillStyle(PT);
            g.fillRect(lx, ly, 12, lh);
            g.fillRect(rx, ry, 12, rh);
            g.fillStyle(VD);
            g.fillRect(lx - 1, ly + lh, 14, 4);
            g.fillRect(rx - 1, ry + rh, 14, 4);
        };

        make('shrek', W, H, g => {
            drawUpper(g);
            drawLegs(g,  8, 44, 12,  24, 44, 12);
        });

        make('shrek-walk1', W, H, g => {
            drawUpper(g);
            drawLegs(g,  5, 44, 13,  27, 46, 10);
        });

        make('shrek-walk2', W, H, g => {
            drawUpper(g);
            drawLegs(g,  8, 44, 12,  24, 44, 12);
        });

        make('shrek-walk3', W, H, g => {
            drawUpper(g);
            drawLegs(g, 11, 46, 10,  21, 44, 13);
        });

        make('shrek-jump', W, H, g => {
            drawUpper(g);
            g.fillStyle(PT);
            g.fillRect(7,  46, 12, 9);
            g.fillRect(25, 46, 12, 9);
            g.fillStyle(VD);
            g.fillRect(6,  53, 14, 4);
            g.fillRect(24, 53, 14, 4);
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
            g.fillRect(0, 52, 10, 4);
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
            g.fillRect(16, 0, 4, 6);
            g.fillRect(23, 0, 4, 7);
            g.fillRect(30, 0, 4, 6);
            g.fillRect(16, 4, 18, 4);
            // Right arm holding reins
            g.fillStyle(0x8b1a1a);
            g.fillRect(35, 26, 12, 6);
            g.fillStyle(0xf0c090);
            g.fillRect(45, 26, 5, 6);
            // Lance
            g.fillStyle(0x8b6020);
            g.fillRect(35, 22, 15, 3);
            g.fillStyle(0xd8d8d8);
            g.fillRect(48, 19, 6, 9);
            g.fillStyle(0xffffff);
            g.fillRect(51, 21, 2, 5);
        });

        // Castle guard with armor (36×52)
        make('castle-guard', 36, 52, g => {
            // Body (armor)
            g.fillStyle(0x8b1a1a);
            g.fillRect(8, 18, 20, 20);
            // Shoulder armor
            g.fillStyle(0xc0c0c0);
            g.fillRect(6, 16, 8, 8);
            g.fillRect(22, 16, 8, 8);
            // Helmet
            g.fillStyle(0xc0c0c0);
            g.fillEllipse(18, 10, 16, 12);
            // Helmet visor
            g.fillStyle(0x404040);
            g.fillRect(10, 9, 16, 4);
            // Eye slots
            g.fillStyle(0x000000);
            g.fillRect(12, 10, 3, 2);
            g.fillRect(21, 10, 3, 2);
            // Legs (metal)
            g.fillStyle(0xa0a0a0);
            g.fillRect(8, 38, 7, 12);
            g.fillRect(21, 38, 7, 12);
            // Boots
            g.fillStyle(0x3a2010);
            g.fillRect(7, 48, 9, 4);
            g.fillRect(20, 48, 9, 4);
            // Pike (weapon)
            g.fillStyle(0x8b6020);
            g.fillRect(2, 2, 4, 48);
            g.fillStyle(0xd8d8d8);
            g.fillTriangle(4, 0, 8, 4, 4, 8);
        });
    }

    // ─── Background (castle theme) ─────────────────────────────────────────────

    _createBackground ()
    {
        // Sky (greyish for castle mood)
        this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x7a8a9a);

        // Distant castle silhouette
        for (let x = 0; x < WORLD_W; x += 500) {
            const h = 80 + (x % 400) / 3;
            this.add.rectangle(x + 250, GROUND_SURFACE - h / 2, 480, h, 0x4a5a6a).setAlpha(0.4);
        }

        // Castle towers/walls in background
        for (let x = 100; x < WORLD_W; x += 600 + (x % 200)) {
            const towerH = 120 + (x % 100);
            const towerW = 60 + (x % 40);
            const topY = GROUND_SURFACE - towerH;

            const g = this.add.graphics().setAlpha(0.5);
            g.fillStyle(0x5a6a7a);
            g.fillRect(x - towerW / 2, topY, towerW, towerH);
            
            // Crenellations (castle battlements)
            for (let i = 0; i < 3; i++) {
                g.fillRect(x - towerW / 2 + i * (towerW / 3), topY - 12, towerW / 4, 12);
            }

            // Window details
            g.fillStyle(0x2a3a4a);
            for (let i = 0; i < 2; i++) {
                g.fillRect(x - towerW / 4, topY + 30 + i * 25, 12, 12);
                g.fillRect(x + towerW / 4, topY + 30 + i * 25, 12, 12);
            }
        }

        // Mud/grass strip under ground surface
        this.add.rectangle(WORLD_W / 2, GROUND_CY, WORLD_W, GROUND_H, 0x5a4a3a);
    }

    // ─── Night overlay (linked to lives) ─────────────────────────────────────

    _createNightOverlay ()
    {
        this.nightOverlay = this.add.rectangle(
            WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x000033
        ).setDepth(3).setAlpha(0);
    }

    _updateNight ()
    {
        if (!this.nightOverlay) return;
        const targetAlpha = this.lives <= 1 ? 0.50 : this.lives <= 2 ? 0.25 : 0.0;
        this.tweens.add({
            targets: this.nightOverlay,
            alpha: targetAlpha,
            duration: 600,
            ease: 'Quad.easeInOut',
        });
    }

    // ─── Level geometry (castle platforms) ─────────────────────────────────────

    _createLevel ()
    {
        this.platforms = this.physics.add.staticGroup();

        const addTile = (cx, cy, w, h, tint) => {
            this.platforms.create(cx, cy, 'px')
                .setScale(w, h)
                .setTint(tint)
                .refreshBody();
        };

        // Ground sections with gaps (castle courtyard design)
        const groundTiles = [
            [0,    1300],
            [1450, 1100],  // 1450..2550
            [2700, 1100],  // 2700..3800
            [3950, 950],   // 3950..4900
            [5000, 1000],  // 5000..6000
        ];
        groundTiles.forEach(([x, w]) => {
            addTile(x + w / 2, GROUND_CY, w, GROUND_H, 0x6a7a5a);
        });

        // Decorative ground line (darker strip at top)
        groundTiles.forEach(([x, w]) => {
            addTile(x + w / 2, GROUND_SURFACE + 4, w, 8, 0x4a5a3a);
        });

        // Platforms: castle stones and wooden beams
        const plats = [
            // Early zone
            [850,  640, 160],
            [1050, 570, 140],
            // Bridge over gap 1
            [1300, 690, 180],
            // Mid zone 1
            [1700, 620, 180],
            [1900, 530, 150],
            // Platform chain
            [2200, 600, 140],
            // Bridge over gap 2
            [2550, 688, 200],
            // Mid zone 2
            [2800, 570, 180],
            [3000, 480, 150],
            [3200, 560, 170],
            // Bridge over gap 3
            [3700, 688, 200],
            // Late zone
            [3950, 600, 180],
            [4150, 510, 150],
            [4400, 590, 170],
            // Bridge over gap 4
            [4850, 688, 200],
            // Final platforms
            [5100, 610, 200],
            [5320, 520, 160],
            [5550, 600, 180],
        ];

        plats.forEach(([lx, sy, w]) => {
            const cx = lx + w / 2;
            const cy = sy + PLAT_H / 2;
            addTile(cx, cy, w, PLAT_H, 0x8aaa5c);
            addTile(cx, sy + 2, w, 4, 0x6a8a3c);
        });
    }

    // ─── Onions (20 total) ────────────────────────────────────────────────────

    _createOnions ()
    {
        this.onions = this.physics.add.staticGroup();

        // Use config positions
        const positions = LEVEL_2_CONFIG.collectibles.distribution.map(o => [o.x, o.y]);

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
            
            // Add shimmer effect to onions
            if (this.vfx) {
                this.vfx.addOnionShimmer(o);
            }
        });
    }

    // ─── Finish zone (Castle exit) ────────────────────────────────────────────

    _createFinish ()
    {
        const fx = LEVEL_2_CONFIG.destination.x;
        const gy = GROUND_SURFACE;

        // ── Castle Gate ──────────────────────────────────────
        
        // Gate frame (stone)
        this.add.rectangle(fx, gy - 80, 120, 160, 0x8a7a6a);
        this.add.rectangle(fx, gy - 80, 110, 150, 0x6a5a4a);

        // Gate door panels (wood)
        this.add.rectangle(fx - 25, gy - 80, 40, 140, 0x4a3020);
        this.add.rectangle(fx + 25, gy - 80, 40, 140, 0x3a2010);

        // Metal bands (iron reinforcement)
        [
            { y: gy - 130 },
            { y: gy - 80 },
            { y: gy - 30 }
        ].forEach(p => {
            this.add.rectangle(fx, p.y, 100, 6, 0x303030);
        });

        // Gate knockers (circular)
        this.add.circle(fx - 20, gy - 80, 8, 0xd0a050);
        this.add.circle(fx + 20, gy - 80, 8, 0xd0a050);

        // Crown on gate top
        this.add.rectangle(fx, gy - 160, 50, 16, 0xd4a020);
        [fx - 15, fx, fx + 15].forEach(x => {
            this.add.rectangle(x, gy - 170, 8, 12, 0xd4a020);
        });

        // Invisible trigger
        this.finishGroup = this.physics.add.staticGroup();
        this.finishGroup.create(fx, gy - 80, 'finish-px')
            .setScale(100, 100)
            .setAlpha(0)
            .refreshBody();
    }

    // ─── Castle Guards (static enemies) ──────────────────────────────────────

    _createCastleGuards ()
    {
        this.castleGuards = this.physics.add.staticGroup();

        const guardsConfig = this._obstaclesConfig.castleGuards || [];
        guardsConfig.forEach(config => {
            this.castleGuards.create(config.x, config.y, 'castle-guard').refreshBody();
        });
    }

    // ─── Spike Zones (instant kill) ──────────────────────────────────────────

    _createSpikeZones ()
    {
        this.spikeZones = this.physics.add.staticGroup();

        const spikeConfig = this._obstaclesConfig.spikeZones || [];
        spikeConfig.forEach(config => {
            // Visual: red spike pattern
            const g = this.add.graphics().setAlpha(0.7);
            g.fillStyle(0xff4444);
            
            // Draw spike pattern
            const spikesPerZone = Math.floor(config.width / 20);
            for (let i = 0; i < spikesPerZone; i++) {
                const xBase = config.x - config.width / 2 + i * 20;
                g.fillTriangle(
                    xBase + 5, config.y - config.height,
                    xBase, config.y,
                    xBase + 10, config.y
                );
            }

            // Physics trigger
            this.spikeZones.create(config.x, config.y - config.height / 2, 'spike')
                .setScale(config.width, config.height)
                .setAlpha(0)
                .refreshBody();
        });
    }

    // ─── Doors (solid obstacles) ─────────────────────────────────────────────

    _createDoors ()
    {
        this.doors = this.physics.add.staticGroup();

        const doorsConfig = this._obstaclesConfig.doors || [];
        doorsConfig.forEach(config => {
            // Visual: castle door
            this.add.rectangle(config.x, config.y - config.height / 2, config.width, config.height, 0x4a3020);
            this.add.rectangle(config.x, config.y - config.height / 2 + 10, config.width - 8, config.height - 10, 0x3a2010);

            // Add decorative elements
            this.add.circle(config.x - config.width / 4, config.y - config.height / 2, 4, 0xd4a020);
            this.add.circle(config.x + config.width / 4, config.y - config.height / 2, 4, 0xd4a020);

            // Physics trigger (solid)
            this.doors.create(config.x, config.y - config.height / 2, 'door')
                .setScale(config.width, config.height)
                .setAlpha(0)
                .refreshBody();
        });
    }

    // ─── Player ───────────────────────────────────────────────────────────────

    _createPlayer ()
    {
        this.player = this.physics.add.sprite(100, GROUND_SURFACE - PLAYER_H / 2, 'shrek');
        this.player.setBounce(0.05);
        this.player.setCollideWorldBounds(true);
        this.player.setMaxVelocity(this._playerSpeed, 1400);
        this.player.setDragX(PLAYER_DRAG);
        this.player.setAlpha(0);

        this.playerSprite = this.add.sprite(100, GROUND_SURFACE - PLAYER_H / 2, 'shrek');
        this.playerSprite.setDepth(5);

        this._walkFrame   = 0;
        this._walkTimer   = 0;
        this._wasOnGround = true;
        this._isSquashing = false;
    }

    // ─── Start sign ───────────────────────────────────────────────────────────

    _createStartSign ()
    {
        const sx = 150;
        const gy = GROUND_SURFACE;

        this.add.rectangle(sx, gy - 40, 6, 80, 0x6b4c2a);
        this.add.rectangle(sx, gy - 90, 160, 50, 0xf0e8c0);
        this.add.rectangle(sx, gy - 90, 156, 46, 0xe8d890);
        this.add.text(sx, gy - 98, 'CHÂTEAU DE FARQUAAD', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 10,
            color: '#3a2010',
            align: 'center',
        }).setOrigin(0.5);
        this.add.text(sx, gy - 82, '⚠ NIVEAU 2 ⚠', {
            fontFamily: 'Fondamento',
            fontSize: 10,
            color: '#8b1a1a',
            align: 'center',
        }).setOrigin(0.5);
    }

    // ─── Enemy (Farquaad) ─────────────────────────────────────────────────────

    _createEnemy ()
    {
        const startX = -300;
        const startY = GROUND_SURFACE - ENEMY_H / 2;

        this.enemy = this.add.sprite(startX, startY, 'farquaad').setDepth(4);

        this.tweens.add({
            targets: this.enemy,
            y: startY - 6,
            duration: 180,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this._enemyMoving = false;
        this.time.delayedCall(1200, () => {
            this._enemyMoving = true;
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

    // ─── Torch effects (castle atmosphere) ──────────────────────────────────

    _createTorchEffects ()
    {
        // Torch particles at castle entrance/exit
        const torchPositions = [
            { x: 100, y: GROUND_SURFACE - 60 },     // Start area
            { x: LEVEL_2_CONFIG.destination.x, y: GROUND_SURFACE - 100 }  // Exit area
        ];

        this.torchEmitters = [];
        torchPositions.forEach(pos => {
            const emitter = this.vfx.torchParticles(pos.x, pos.y);
            this.torchEmitters.push(emitter);
            emitter.emitParticleAt(pos.x, pos.y, 3);
        });
    }

    // ─── HUD ──────────────────────────────────────────────────────────────────

    _createHUD ()
    {
        // Left panel - Level info and oignons
        this.hudBg = this.add.rectangle(125, 28, 240, 44, 0x000000, 0.55)
            .setScrollFactor(0).setDepth(10);

        this.hudText = this.add.text(14, 10, '', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 18,
            color: '#f5d020',
            stroke: '#000000',
            strokeThickness: 4,
        }).setScrollFactor(0).setDepth(11);

        // Center panel - Score display
        this.scoreBg = this.add.rectangle(512, 28, 280, 44, 0x000000, 0.55)
            .setScrollFactor(0).setDepth(10);

        this.scoreText = this.add.text(512, 18, '', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 14,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(11);

        // Right panel - Danger bar
        this.dangerBg = this.add.rectangle(900, 28, 160, 44, 0x000000, 0.55)
            .setScrollFactor(0).setDepth(10);

        this.dangerLabel = this.add.text(808, 10, '🐴 FARQUAAD', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 14,
            color: '#ff8800',
            stroke: '#000000',
            strokeThickness: 3,
        }).setScrollFactor(0).setDepth(11);

        this.add.rectangle(900, 34, 128, 12, 0x333333, 0.9)
            .setScrollFactor(0).setDepth(11);

        this.dangerBar = this.add.rectangle(836, 34, 1, 10, 0x22bb22)
            .setOrigin(0, 0.5)
            .setScrollFactor(0).setDepth(12);

        // Hearts
        this.heartTexts = [];
        for (let i = 0; i < 3; i++) {
            const h = this.add.text(14 + i * 32, 36, '❤', {
                fontFamily: 'Fondamento',
                fontSize: 22,
                color: '#ff4444',
            }).setScrollFactor(0).setDepth(11);
            this.heartTexts.push(h);
        }

        // Level 2 indicator
        this.add.text(14, 56, 'NIVEAU 2/2', {
            fontFamily: 'Uncial Antiqua',
            fontSize: 12,
            color: '#d4a840',
            stroke: '#000000',
            strokeThickness: 3,
        }).setScrollFactor(0).setDepth(11);

        // Difficulty badge
        const difficulty = localStorage.getItem('selectedDifficulty') || 'normal';
        const diffColor = { easy: '#22cc22', normal: '#ffdd00', hard: '#ff4444' }[difficulty];
        const diffLabel = { easy: 'FACILE', normal: 'NORMAL', hard: 'DIFFICILE' }[difficulty];
        
        this.add.text(512, 56, `🎯 ${diffLabel}`, {
            fontFamily: 'Fondamento',
            fontSize: 12,
            color: diffColor,
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(11);

        this._updateHUD();
    }

    _updateHUD ()
    {
        const reached = this.onionCount >= MIN_ONIONS;
        this.hudText.setText(`Oignons: ${this.onionCount} / ${this.totalOnions}`);
        this.hudText.setColor(reached ? '#6ecf3a' : '#f5d020');

        // Update score display
        const level1Score = this.level1Score || 0;
        const totalScore = level1Score + this.onionCount;
        this.scoreText.setText(`Marais: ${level1Score} + Château: ${this.onionCount} = ${totalScore}`);

        if (this.heartTexts) {
            this.heartTexts.forEach((h, i) => {
                h.setAlpha(i < this.lives ? 1 : 0.2);
            });
        }

        // Auto-save checkpoint every 5 onions
        if (this.onionCount % 5 === 0) {
            localStorage.setItem('level2Progress', JSON.stringify({
                level: 2,
                onionCount: this.onionCount,
                lives: this.lives,
                difficulty: localStorage.getItem('selectedDifficulty')
            }));
            localStorage.setItem('level2Score', this.onionCount.toString());
            localStorage.setItem('totalScore', totalScore.toString());
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

    // ─── Update loop ──────────────────────────────────────────────────────────

    update (time, delta)
    {
        this.playerSprite.setPosition(this.player.x, this.player.y);

        if (this.isWin) return;

        const k = this.keys;
        const onGround = this.player.body.blocked.down;
        const vx = this.player.body.velocity.x;
        const vy = this.player.body.velocity.y;

        const goLeft  = k.left.isDown  || k.left2.isDown;
        const goRight = k.right.isDown || k.right2.isDown;
        const jump    = k.up.isDown    || k.up2.isDown || k.space.isDown;

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

        // Animation frames
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

        // Landing squash
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

        if (!onGround && !this._isSquashing) {
            this.playerSprite.setScale(vy < 0 ? 0.88 : 1.06, vy < 0 ? 1.14 : 0.94);
        } else if (onGround && !this._isSquashing) {
            this.playerSprite.setScale(1, 1);
        }

        this.playerSprite.setRotation(PhaserMath.Clamp(vx / 8000, -0.15, 0.15));

        // Enemy speed acceleration + VFX
        if (this._enemyMoving && !this._isGameOver) {
            this._gameElapsed += delta;
            const newMultiplier = Math.min(this._bossMaxSpeed / this._bossBaseSpeed, 1 + Math.floor(this._gameElapsed / 20000) * this._bossDifficultyScaling);
            
            // Trigger rage glow if speed multiplier increased
            if (newMultiplier > this._speedMultiplier && !this._bossRageActive) {
                this._bossRageActive = true;
                this.vfx.bossAccelerationFlicker();
                
                // Only start new rage glow if not already active
                if (!this.enemy.hasRageGlow) {
                    this.enemy.hasRageGlow = true;
                    this.vfx.bossRageGlow(this.enemy);
                }
                
                // Update boss phase music
                CastleAudio.setBossPhaseMusic(newMultiplier);
                EventBus.emit('boss-speed-change', newMultiplier);
            }
            
            this._speedMultiplier = newMultiplier;
        }

        // Tension phase: increase tempo near level end (x > 4500)
        if (!this._isGameOver && this.player.x > 4500) {
            const tensionIntensity = Math.min(1.0, (this.player.x - 4500) / 1500);
            CastleAudio.setTensionPhase(tensionIntensity);
        }

        // Enemy movement
        if (!this._isGameOver) {
            if (this._enemyMoving) {
                const targetX = this.player.x - 24;
                const step = this._bossBaseSpeed * this._speedMultiplier * delta / 1000;
                if (this.enemy.x < targetX) {
                    this.enemy.x = Math.min(this.enemy.x + step, targetX);
                } else if (this.enemy.x > targetX + 10) {
                    this.enemy.x = Math.max(this.enemy.x - step, targetX);
                }

                const playerInAir = !this.player.body.blocked.down;
                const groundY     = GROUND_SURFACE - ENEMY_H / 2;
                if (playerInAir) {
                    this.enemy.y  = this.player.y;
                    this._enemyVY = 0;
                } else {
                    this._enemyVY     += 1800 * delta / 1000;
                    this.enemy.y       = Math.min(this.enemy.y + this._enemyVY * delta / 1000, groundY);
                    if (this.enemy.y >= groundY) { this.enemy.y = groundY; this._enemyVY = 0; }
                }
            }

            if (this._enemyMoving) {
                const dx = Math.abs(this.player.x - this.enemy.x);
                const dy = Math.abs(this.player.y - this.enemy.y);
                
                // Boss proximity camera zoom
                if (dx < 200) {
                    this.vfx.cameraZoomOnBoss(1.15, 300);
                } else {
                    this.vfx.cameraResetZoom(300);
                }
                
                if (dx < 32 && dy < 58) {
                    this._onEnemyCatch();
                }
            }

            // Danger bar update
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
        this._isGameOver  = true;
        this._enemyMoving = false;

        // VFX: Death flash and screen shake
        this.vfx.deathFlash();
        this.vfx.screenShake(4, 200);
        EventBus.emit('player-death');

        this.lives--;
        this._updateNight();

        if (this.lives <= 0) {
            this.player.setVelocity(0, 0);
            this.player.setAccelerationX(0);
            AudioManager.gameOver();
            this.scene.start('ScoreSummary', {
                won:         false,
                onionCount:  this.onionCount,
                totalOnions: this.totalOnions,
                lives:       0,
                timeMs:      this.time.now - this._startTime,
                level:       2,
                level1Score: this.level1Score,
            });
            return;
        }

        AudioManager.hit();
        this.scene.restart({ lives: this.lives, level1Score: this.level1Score });
    }

    _onGuardHit (player, guard)
    {
        // VFX: Guard hit particles and screen shake
        this.vfx.guardHitParticles(guard.x, guard.y);
        this.vfx.screenShake(3, 150);
        EventBus.emit('guard-hit');
        this._onEnemyCatch();
    }

    _onSpikeHit (player, spike)
    {
        // VFX: Spike particles and screen shake
        this.vfx.spikesParticles(player.x, player.y);
        this.vfx.screenShake(3, 180);
        EventBus.emit('spike-hit');
        this._onEnemyCatch();
    }

    _collectOnion (player, onion)
    {
        // VFX: Collection shimmer and particles
        this.vfx.onionCollectParticles(onion.x, onion.y);
        
        onion.destroy();
        this.onionCount++;
        this._updateHUD();
        AudioManager.onion();
        EventBus.emit('oignon-collected');

        this.tweens.add({
            targets: this.hudBg,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 80,
            yoyo: true,
        });
    }

    _winLevel ()
    {
        if (this.isWin) return;

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

        this._enemyMoving = false;
        this.tweens.killTweensOf(this.enemy);
        AudioManager.win();

        this.player.setAccelerationX(0);
        this.player.setVelocityX(0);

        // VFX: Victory explosion at player location
        this.vfx.victoryExplosion(this.player.x, this.player.y);
        this.vfx.screenShake(2, 300);
        this.vfx.cameraZoomOnBoss(1.3, 400);

        // Emit victory event for cinematique
        EventBus.emit('level-complete', { level: 2, onionCount: this.onionCount });

        this.time.delayedCall(600, () => {
            this.scene.start('ScoreSummary', {
                won:         true,
                onionCount:  this.onionCount,
                totalOnions: this.totalOnions,
                lives:       this.lives,
                timeMs:      this.time.now - this._startTime,
                level:       2,
                level1Score: this.level1Score,
            });
        });
    }

    shutdown() {
        CastleAudio.stopMusic();
    }
}
