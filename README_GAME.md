# Shrek Run — Contexte du projet

> Fichier de référence pour GitHub Copilot. À lire en priorité pour comprendre ce projet.

## Vue d'ensemble

**Shrek Run** est un jeu de type runner/platformer 2D en side-scrolling, développé avec **Phaser 4**, **React 19** et **Vite**. Malgré le nom du dépôt (`sonic-phaserjs`), il ne s'agit pas d'un clone de Sonic — le personnage est **Shrek**.

Tous les sprites sont générés **procéduralement** en JavaScript via l'API Graphics de Phaser (aucun fichier image externe).

---

## Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| Phaser | 4.0.0 | Moteur de jeu (arcade physics, scenes, tweens) |
| React | 19.0.0 | Interface autour du jeu |
| Vite | 6.3.1 | Bundler / dev server (port 8080) |
| ESLint | 9.x | Linting |

---

## Structure du projet

```
src/
├── main.jsx              # Point d'entrée React
├── App.jsx               # Composant racine React
├── PhaserGame.jsx        # Bridge React ↔ Phaser (via forwardRef)
└── game/
    ├── main.js           # Config Phaser + instanciation du jeu
    ├── EventBus.js       # Bus d'événements React ↔ Phaser
    └── scenes/
        ├── Boot.js       # Scène de démarrage (chargement minimal)
        ├── Preloader.js  # Préchargement des assets
        ├── MainMenu.js   # Menu principal
        ├── Game.js       # Scène de jeu principale (fichier central ~800 lignes)
        └── GameOver.js   # Écran de game over
public/
└── assets/              # Assets statiques (audio, images éventuelles)
```

---

## Gameplay

### Objectif
Guider Shrek depuis la gauche du niveau jusqu'au **château** situé à droite (x ≈ 5860), en évitant d'être rattrapé par **Lord Farquaad** à cheval.

### Contrôles
| Action | Touches |
|--------|---------|
| Aller à gauche | `Q` ou `←` |
| Aller à droite | `D` ou `→` |
| Sauter | `Z`, `↑` ou `Espace` |
| Lancer la partie | `Espace` ou `Entrée` (menu) |

### Collectibles — Oignons
- **20 oignons** répartis sur le niveau (flottants, animés en yoyo).
- Collecte optionnelle — le score est affiché à la fin (`X / 20`).
- Ramasser un oignon anime le compteur HUD.

### Ennemi — Lord Farquaad
- Apparaît depuis la gauche après **1,2 seconde** de grace period, signalé par `⚠ FARQUAAD ARRIVE !`.
- Se déplace à **320 px/s** (le joueur peut atteindre 560 px/s → il faut avancer).
- Suit le joueur en hauteur si ce dernier est en l'air et proche (<60 px).
- Sort son **épée** lorsqu'il est à moins de 200 px du joueur.
- Si Farquaad touche Shrek (hitbox dx<32, dy<58) → **Game Over**.
- **Barre de danger** (HUD droite) : verte → jaune → rouge selon la proximité.

### Conditions de fin
| Condition | Résultat |
|-----------|---------|
| Atteindre le château (zone invisible x≈5860) | Victoire — affiche le score d'oignons |
| Être rattrapé par Farquaad | Game Over → retour au menu |

### Niveaux et obstacles
- **Monde** : 6000 × 800 px, décor marécage (swamp).
- **4 fosses** dans le sol (gaps) aux environs de x = 1400, 2550, 3720, 4870.
- **Plateformes** de saut pour franchir les gaps et atteindre des oignons en hauteur.
- Caméra qui suit Shrek avec lerp (0.08).

---

## Architecture du code — points clés

### `src/game/scenes/Game.js` (fichier principal)
Constantes importantes en tête de fichier :
- `WORLD_W = 6000`, `WORLD_H = 800`
- `PLAYER_SPEED = 560`, `PLAYER_ACCEL = 2200`, `JUMP_VEL = -700`
- `ENEMY_SPEED = 320`
- `GROUND_SURFACE = 720`

Méthodes privées :
| Méthode | Rôle |
|---------|------|
| `_makeTextures()` | Génère tous les sprites (Shrek, Farquaad, oignon, pixel) via Graphics |
| `_createBackground()` | Fond (ciel, arbres, sol) |
| `_createLevel()` | Sol segmenté + plateformes statiques |
| `_createOnions()` | Oignons (staticGroup + tweens yoyo) |
| `_createFinish()` | Château visuel + zone trigger invisible |
| `_createPlayer()` | Sprite physique Shrek (corps invisible) + sprite visuel séparé |
| `_createEnemy()` | Farquaad (sprite non-physique, déplacement manuel) |
| `_createHUD()` | Compteur oignons + barre danger |
| `_onEnemyCatch()` | Gère la mort du joueur |
| `_collectOnion()` | Callback overlap oignon |
| `_winLevel()` | Callback overlap zone finish |

### Sprite Shrek — pattern à retenir
Le joueur utilise **deux objets séparés** :
- `this.player` → corps physique arcade (invisible, `setAlpha(0)`)
- `this.playerSprite` → sprite visuel (suivi manuel dans `update`)

Ce pattern évite les conflits entre la physique et les animations.

### EventBus
Utilisé pour signaler à React quelle scène est active :
```js
EventBus.emit('current-scene-ready', this); // fin de create() de chaque scène
```

---

## Commandes de développement

```bash
npm install          # Installer les dépendances
npm run dev          # Lancer le serveur de dev (http://localhost:8080)
npm run build        # Build de production dans dist/
npm run dev-nolog    # Dev sans télémétrie Phaser
npm run build-nolog  # Build sans télémétrie Phaser
```

---

## Points d'attention pour les modifications

- **Ajouter une scène** : créer le fichier dans `src/game/scenes/`, l'importer dans `src/game/main.js`, et émettre `EventBus.emit('current-scene-ready', this)` dans `create()`.
- **Modifier la difficulté** : ajuster `ENEMY_SPEED`, `PLAYER_SPEED`, `JUMP_VEL` dans les constantes en tête de `Game.js`.
- **Ajouter des assets image** : les placer dans `public/assets/` et les charger dans `Preloader.js`.
- **Ajouter des oignons** : ajouter des coordonnées `[x, y]` dans le tableau `positions` de `_createOnions()`.
- **Ajouter des plateformes** : ajouter `[leftX, surfaceY, width]` dans le tableau `plats` de `_createLevel()`.
