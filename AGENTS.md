# 🤖 Agents et Skills pour Shrek Run

Documentation des agents spécialisés pour développer ce projet Phaser 4 + React.

---

## 1. 🎮 **Game Mechanics Agent**

### Objectif
Développer et équilibrer la mécanique de gameplay (physique, collision, difficulté).

### Scope
- `src/game/scenes/Game.js` — Logique principale du jeu
- Paramètres de difficulté (vitesse, spawn rate)
- Équilibre: 7 oignons/21 requis

### Skills
- **Ajuster difficulté dynamique** : modifier la vitesse du boss Farquaad
- **Implémenter power-ups** : shields, speed boost, slow-motion
- **Tuner la physique** : gravity, velocity, collision groups
- **Gérer les obstacles** : spawn, comportement, dégâts

### Instructions précises
```
1. Lisez Game.js pour comprendre la physique actuelle
2. Les modifications de vitesse doivent être paramétriques (config objet)
3. Testez avec `npm run dev` après chaque changement
4. Les oignons collectibles doivent rester équilibrés (7/21)
5. Respectez le timing du boss: doit être rattrapable mais difficile
```

### Fichiers clés
- `src/game/scenes/Game.js` — Boucle de jeu
- `src/game/scenes/Intro.js` — Cinématique (affecte timing)
- `src/game/EventBus.js` — Communication avec React

### Exemple de tâche
> "Ajoute 3 power-ups différents: Shield (+5s invulnérabilité), SpeedBoost (1.5x vitesse 3s), SlowTime (x0.5 boss 4s). Ils doivent spawner comme des oignons spéciaux avec 20% de chance."

---

## 2. 🎨 **Visual/Sprite Agent**

### Objectif
Générer et animer les sprites procéduralement (pas de fichiers image).

### Scope
- `src/game/scenes/Game.js` — Rendering des personnages et obstacles
- Animations et tweens
- Particules et effets visuels

### Skills
- **Générer sprites Canvas** : personnages, obstacles, collectibles
- **Implémenter tweens** : animations fluides
- **Ajouter particules** : dust, splashes, explosions
- **Créer animations d'idle/run** : frames, timing

### Instructions précises
```
1. AUCUN fichier image externe — utiliser Phaser Graphics API
2. Les couleurs doivent correspondre au thème (vert marais, teintes Shrek)
3. Tester les perfs: les particules ne doivent pas ralentir (<60fps)
4. Les tweens doivent être non-bloquants
5. Tous les sprites doivent être nettoyés lors de destroy()
```

### Fichiers clés
- `src/game/scenes/Game.js` — Création des sprites
- `src/game/scenes/MainMenu.js` — Sprite du menu

### Exemple de tâche
> "Ajoute des particules de boue quand Shrek marche dans les zones ralentissantes. 5-8 particules par frame, couleur marron-gris, durée 0.5s."

---

## 3. 🔊 **Audio Manager Agent**

### Objectif
Gérer la musique et les effets sonores via EventBus et AudioManager.

### Scope
- `src/game/AudioManager.js` — Gestionnaire centralisé
- Événements audio via EventBus
- Timing des sons de jeu

### Skills
- **Implémenter new SFX** : jump, collectibles, collision
- **Gérer la musique de fond** : loop, cross-fade
- **Contrôler le volume** : réglages, mute
- **Ajouter feedback audio** : UI clicks, game over, win

### Instructions précises
```
1. Tous les sons doivent passer par AudioManager (singleton)
2. Émettre des événements via EventBus pour la communication
3. Les sons ne doivent pas dépasser 2s (sauf musique loop)
4. Implémenter un système de volume (0-1)
5. Ne pas créer de nouveaux fichiers audio — synthétiser si possible
```

### Fichiers clés
- `src/game/AudioManager.js` — Point d'entrée unique
- `src/game/EventBus.js` — Événements cross-layer

### Exemple de tâche
> "Ajoute un SFX quand on collecte un oignon (beep +2 demi-tons 100ms), un SFX quand Farquaad se rapproche (alerte 3 beeps croissants), et mute la musique lors du game over."

---

## 4. 🎯 **Level Design Agent**

### Objectif
Concevoir et générer les niveaux (obstacles, collectibles, progression).

### Scope
- Paramètres des niveaux (obstacle positions, density)
- Génération procédurale des étapes
- Courbe de difficulté

### Skills
- **Créer niveaux proceduraux** : zone par zone
- **Placer obstacles** : villageois, boue, pièges
- **Distribuer collectibles** : oignons stratégiques
- **Paramétrer difficulté** : timing, densité, speed cap

### Instructions précises
```
1. Pas de hardcoding de positions — utiliser une config objet
2. Les oignons doivent former un chemin guidé (7/21 trouvables)
3. La difficulté doit croître graduellement (pas de spike)
4. Chaque zone doit avoir une "signature" visuelle/mécanique
5. Tester que le niveau est complétable à tous les niveaux de difficulté
```

### Fichiers clés
- `src/game/scenes/Game.js` — Placement des objets
- Créer `src/game/levels/config.js` pour paramètres

### Exemple de tâche
> "Crée 3 niveaux de difficulté: Easy (obstacles simples, 10 oignons trouvables), Normal (obstacle mix, 8 oignons), Hard (dense, 6 oignons). Chacun dure ~4 minutes."

---

## 5. 🖥️ **UI/UX React Agent**

### Objectif
Développer l'interface React (menus, HUD, stats).

### Scope
- `src/App.jsx` — Composant principal
- `src/PhaserGame.jsx` — Intégration Phaser
- `src/game/scenes/MainMenu.js` — Menu stateful

### Skills
- **Créer composants React** : responsive, styled
- **Implémenter HUD** : score, oignons collectés, timer
- **Gérer les menus** : navigation, transitions
- **Communication EventBus** : syncing game ↔ UI

### Instructions précises
```
1. Tous les événements passent par EventBus (pas de props drilling)
2. React gère UI, Phaser gère game logic
3. Le HUD doit être non-intrusive (coins de l'écran)
4. Tester sur mobile (responsive design)
5. Pas de blocage du rendu — utiliser async si nécessaire
```

### Fichiers clés
- `src/App.jsx` — Root
- `src/PhaserGame.jsx` — Wrapper Phaser
- `src/game/EventBus.js` — Sync layer

### Exemple de tâche
> "Ajoute un leaderboard local (localStorage) affichant top 5 scores. Persister après chaque jeu. Ajouter bouton reset, afficher rank actuel en jeu."

---

## 6. 🚀 **Performance/QA Agent**

### Objectif
Optimiser, tester, déboguer et assurer la qualité.

### Scope
- Tests avec Puppeteer
- Profiling (fps, memory, render time)
- Linting et validation

### Skills
- **Profiler performance** : fps, memory leaks
- **Fixer bugs** : collision glitches, edge cases
- **Optimiser rendu** : culling, pooling, batching
- **Tester cross-browser** : desktop, mobile, touch

### Instructions précises
```
1. Baseline: doit maintenir 60fps sur desktop
2. Utiliser Performance API pour mesurer
3. Linter: `npm run lint` doit passer
4. Tester les cas limites: rapid input, extreme difficulty
5. Avant/après benchmark obligatoire
```

### Fichiers clés
- `package.json` — scripts de test/build
- `.eslintrc.cjs` — règles de linting
- `puppeteer` config si présente

### Exemple de tâche
> "Profile le jeu en temps réel (fps, GC pauses). Optimise le rendering des particules avec object pooling. Cible: min 55fps sur mobile."

---

## 7. 🐉 **Narrative/Features Agent** *(bonus)*

### Objectif
Ajouter du contenu narratif et des features "flavor".

### Scope
- Dialogues et cinématiques
- Easter eggs
- Feedback narrative (score messages)

### Skills
- **Écrire cinématiques** : Intro.js modifications
- **Ajouter dialogues** : Shrek, Farquaad, PNJs
- **Créer Easter eggs** : hidden content, references
- **Narrative feedback** : messages contextuels

### Instructions précises
```
1. Garder le ton humoristique du univers Shrek
2. Les cinématiques ne doivent pas être skippables sauf Escape key
3. Dialogues en français (ex: "Au revoir Farquaad !" sur victoire)
4. Easter eggs doivent être découvrables, pas accidentels
5. Pas de modifications majeures du gameplay
```

---

## 🔄 **Communication Inter-Agents**

```
┌─────────────────┐
│  Game Mechanics │ ←→ Difficulty curve, power-ups
└─────────────────┘
        ↓
┌─────────────────┐
│  Level Design   │ ← Obstacle density, spawn timing
└─────────────────┘
        ↓
┌────────────────────┐
│ Visual Effects     │ ← Sprite rendering, animations
│ Audio Manager      │ ← SFX events, feedback
│ UI/UX React Agent  │ ← HUD updates, state sync
└────────────────────┘
        ↓
┌────────────────────┐
│ Performance/QA     │ ← Testing, profiling, optimization
└────────────────────┘
```

---

## 📝 **Exemple: Créer une nouvelle feature avec plusieurs agents**

**Feature: "Double Jump" power-up**

1. **Game Mechanics Agent** → Implémente la logique (double jump logic, timer)
2. **Level Design Agent** → Place les power-ups aux endroits stratégiques
3. **Visual Agent** → Crée un sprite unique pour le double jump
4. **Audio Agent** → Ajoute un "whoosh" au double jump
5. **UI Agent** → Affiche un badge "Double Jump active" en HUD
6. **Performance Agent** → Teste la perf avec 50+ double jumps

---

## 🚀 **How to assign tasks**

```
/agent <agent-name>
Description of what you need implemented.

Example:
/agent game-mechanics
Add a "Slow Motion" power-up that slows boss speed to 0.5x for 4 seconds. 
Should spawn 15% chance, look different from normal onions, trigger SFX.
```

---

## 📊 **Success Criteria (All Agents)**

✅ Code passe ESLint  
✅ Maintient 60fps en gameplay  
✅ Tester manuellement dans `npm run dev`  
✅ Pas de memory leaks  
✅ Compliant avec la structure existante  
✅ Commits avec messages clairs + `Co-authored-by: Copilot`

