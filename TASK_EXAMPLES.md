# 🎯 Task Examples for Shrek Run Agents

Ready-to-use task descriptions you can copy/paste to assign to agents.

---

## 🎮 Game Mechanics Agent

### Task 1: Implement Double Jump Power-Up
```
Implement a "Double Jump" power-up in Game.js:

Requirements:
- When collected, grants 1 extra mid-air jump for 5 seconds
- Jump height remains same as normal jump
- Visual indicator in HUD: "Double Jump: 3.2s remaining"
- SFX feedback when activated (use Audio Agent's "powerup" event)
- Power-up sprite should glow/pulse (coordinate with Visual Agent)

Acceptance criteria:
- Player can double jump while power-up is active
- Timer countdown visible in HUD
- Works with jumping from platforms and mid-air
- No physics glitches (no infinite jumps)
- Maintains 60fps
```

### Task 2: Dynamic Difficulty Scaling
```
Implement progressive difficulty scaling in Game.js:

Current state: Boss speed is fixed
Target: Boss speed increases with time

Implementation:
- Create config: { difficultyIncrease: 0.05 } (5% per minute)
- Boss velocity += (elapsed_time_seconds * 0.001)
- Cap at maxSpeed: 350px/s (avoid impossible)
- Emit event "difficulty:increased" every 30s for Audio feedback

Acceptance criteria:
- Difficulty scales smoothly (no jumps)
- Game remains winnable at all difficulties
- Config values are parameterized
- ESLint passes
- Tested manually: game should be easy at start, hard at 5min mark
```

### Task 3: Add Shield Power-Up
```
Implement a "Shield" power-up:

Behavior:
- When collected, grants 1 hit of invulnerability (5 second duration)
- On collision with enemy/boss, shield absorbs 1 hit and disappears
- Visual feedback: shield sprite around Shrek (flashing)
- SFX: activation beep + hit absorption sound

Requirements:
- Update collision layer to check for shield state
- Emit "shield:active" and "shield:hit" events
- Support multiple shields (stacking)

Acceptance criteria:
- Collision kills enemy, not Shrek, when shield active
- Shield disappears after 5s or on first hit
- Visual indicator is clear to player
- ESLint passes
- Coordinated with Visual Agent for sprite rendering
```

---

## 🎨 Visual Effects Agent

### Task 1: Create Mud Zone Visual Effect
```
Add visual feedback for mud zones in Game.js rendering:

Current: Mud zones exist but are invisible (logic-only)
Goal: Make them visually obvious and add particles when walking through

Implementation:
- Render mud zones as semi-transparent brown rectangles
- Add particle emitter: 5-8 brown particles when player enters
- Particle: 0.3s lifetime, gravity enabled, fade out
- Tint player sprite slightly darker while in mud

Acceptance criteria:
- Mud zones are clearly visible (alpha: 0.3)
- Particles appear naturally
- No FPS drop (particles < 50 active max)
- Coordinated with Audio Agent for mud SFX
- Looks cohesive with swamp theme
```

### Task 2: Animate Boss Approach Warning
```
Create visual warning when Farquaad gets close (< 200px from player):

Implementation:
- Screen edge flashes red (brief, non-intrusive)
- Boss sprite scales up slightly (1.0 → 1.2) as warning
- Add danger particles around boss
- Coordinate with Audio Agent: play alert beep

Acceptance criteria:
- Visual only when boss is close enough to threaten
- Animation is smooth (tweens, no jumpiness)
- Doesn't block gameplay
- Maintains 60fps even with effects
- ESLint passes
```

### Task 3: Power-Up Sprite Renderers
```
Create unique sprite rendering for 3 power-ups:

1. Shield: Blue bubble around center
2. Double Jump: Purple boot icon with shine
3. Speed Boost: Red star with motion lines

Requirements:
- Each generated with Phaser Graphics API
- All fit in 32x32 bbox
- Glow/pulse animation (loop every 0.8s)
- Use consistent colors (match game theme)

Acceptance criteria:
- All 3 sprites render correctly
- Animations loop smoothly
- Visible in game at 60fps
- Sprites don't scale strangely on different resolutions
- Coordinated with Game Mechanics (placement) and Audio (collection SFX)
```

---

## 🔊 Audio Agent

### Task 1: Add Collect Sound Effect
```
Implement SFX when player collects oignon:

Requirements:
- Emit "audio:collectOignon" event from Game Mechanics
- AudioManager plays ascending beep: 500Hz → 800Hz over 100ms
- No overlap allowed (cancel previous if collecting rapidly)
- Volume: 0.7 (not too loud)

Acceptance criteria:
- Sound plays on every oignon collection
- No audio overlap (queued or cancelled)
- Duration < 200ms
- Triggered via EventBus, not direct call
```

### Task 2: Boss Approach Alert
```
Create warning sound for boss proximity:

When boss < 300px from player:
- Play ascending beep pattern (3 beeps, increasing pitch)
- First: 300Hz (0.1s), second: 400Hz (0.1s), third: 500Hz (0.1s)
- Repeat every 2 seconds while boss is close
- Stop when distance > 300px

Coordinate with Visual Agent (screen flash)

Acceptance criteria:
- Alert only triggers when relevant
- Doesn't loop continuously (2s minimum between repeats)
- Volume balanced (0.6, not alarming)
- ESLint passes
```

### Task 3: Victory & Game Over Stings
```
Implement audio feedback for end states:

Victory (reached cabin with 7+ oignons):
- Triumphant sting: rising chord 300-600Hz over 0.5s
- Celebratory "ding" at peak

Game Over (caught by boss/enemy):
- Sad trombone: descending 400→200Hz over 0.6s
- Impact thud underneath

Requirements:
- Emit "game:won" and "game:lost" events to trigger
- No music overlap (fade out existing)
- Use Phaser.Sound.WebAudioSoundManager or synth

Acceptance criteria:
- Both sounds play correctly
- Heard on actual device/browser (not just simulation)
- Timing matches game events
- ESLint passes
```

---

## 🎯 Level Design Agent

### Task 1: Parameterize Level Obstacles
```
Extract hardcoded obstacle positions into a config object:

Current: Villagers/obstacles hardcoded in Game.js spawning logic
Goal: Create src/game/config/levels.js with parameterized difficulty

Implementation:
- Create levels config:
  {
    easy: { villagersCount: 5, mudZones: 3, onionCount: 21, spawnDensity: 0.2 },
    normal: { villagersCount: 8, mudZones: 5, onionCount: 21, spawnDensity: 0.4 },
    hard: { villagersCount: 12, mudZones: 8, onionCount: 21, spawnDensity: 0.6 }
  }
- Load config in Game.js based on selected difficulty
- Spawn obstacles dynamically from config

Acceptance criteria:
- No hardcoded obstacle positions remain in Game.js
- Config is readable and maintainable
- Difficulty selection works
- 7+ oignons achievable on all difficulties
- ESLint passes
```

### Task 2: Design Zone-Based Level Structure
```
Restructure level into 3 zones with distinct gameplay:

Zone structure (6400px total):
1. Early (0-1600px): Tutorial zone
   - Easy platforming, few obstacles
   - 7 oignons easily accessible
   
2. Mid (1600-4000px): Balanced challenge
   - Mix of villagers, mud, platforms
   - 10 oignons (5 easy, 5 challenging)
   
3. Late (4000-6400px): Boss gauntlet
   - Dense obstacles, high difficulty
   - 4 hard-to-reach oignons + cabin

Requirements:
- Each zone has distinct visual theme
- Difficulty ramp is smooth (no sudden spikes)
- 7-oignon win condition is achievable in Mid zone
- Boss becomes progressively faster in Late zone

Acceptance criteria:
- Test playthrough: beatable in 3-5 minutes
- Can complete with 7 oignons collected in zone 2
- Visual zone transitions visible
- No framerate drops at zone boundaries
```

### Task 3: Collectible Distribution Strategy
```
Optimize oignon placement for guided progression:

Current: 21 oignons scattered randomly
Goal: Distribute so 7 are "on the path" (easy), 14 are "off-path" (challenging)

Strategy:
- Easy path (guaranteed 7): place in continuous line, minimal obstacles
- Challenge path (optional 14): hidden in difficult sections, reward exploration

Implementation:
- Mark each oignon with difficulty tag: "required" vs "optional"
- Render differently (slight visual distinction)
- Spawn positions from config array, not random

Acceptance criteria:
- Player can easily get 7 without exploring
- Skilled players can get all 21
- Distribution feels natural (not obviously forced)
- Visual distinction is subtle but present
- ESLint passes
```

---

## 🖥️ UI/UX React Agent

### Task 1: Implement HUD with Real-Time Updates
```
Create in-game HUD showing:
- Oignons collected / total required (7/21)
- Timer (elapsed seconds)
- Boss distance (distance to player in px)
- Power-up indicators (if active)

Requirements:
- React component: src/components/GameHUD.jsx
- Non-intrusive positioning (top-left corner, semi-transparent)
- Update via EventBus events (not props drilling)
- Subscribe to "game:scoreUpdate", "game:timerTick", "game:bossPosition"

Acceptance criteria:
- HUD appears during gameplay
- All values update in real-time
- Responsive on mobile (readable at 375px)
- No jank or lag
- EventBus is sole communication method
```

### Task 2: Main Menu with Options
```
Build a main menu with navigation:

Screens:
1. Title screen: "Shrek Run", Start / Options / Quit buttons
2. Difficulty select: Easy / Normal / Hard
3. Options: Volume slider, Accessibility toggles

Requirements:
- React state machine for navigation
- Start → launch Game.js scene
- Options → emit volume changes via EventBus
- Accessibility: high contrast mode option

Acceptance criteria:
- Menu is responsive (mobile + desktop)
- Transitions are smooth (no jumps)
- Options persist (localStorage)
- Volume control works (syncs with Audio Agent)
- ESLint passes
```

### Task 3: Leaderboard (localStorage)
```
Implement local leaderboard:

Features:
- Store top 10 scores in localStorage
- Display after game over with rank
- Show: rank, score, oignons, time taken
- Button to reset leaderboard

Requirements:
- Save each game result
- Sort by score (oignons collected > time taken)
- Persist across sessions
- Display current run's rank

Acceptance criteria:
- Scores persist after page reload
- Top 10 display correctly sorted
- Current run shows rank immediately
- Reset button works
- Mobile-responsive table
```

---

## 🚀 Performance & QA Agent

### Task 1: FPS Profiling & Optimization
```
Profile and optimize rendering performance:

Baseline: Measure current fps during peak gameplay

Tasks:
1. Profile with Chrome DevTools (Performance tab):
   - Identify render bottlenecks
   - Check GC pauses
   - Measure frame time

2. Optimize:
   - Implement object pooling for particles
   - Use culling for off-screen sprites
   - Batch graphics draws if possible

3. Benchmark:
   - Before: average fps (60s gameplay)
   - After: average fps (60s gameplay)
   - Document findings

Acceptance criteria:
- Maintain 60+ fps on desktop
- Maintain 55+ fps on mobile
- No GC pauses > 16ms
- Before/after metrics documented
```

### Task 2: Cross-Browser Testing
```
Test on multiple browsers and devices:

Desktop:
- Chrome (latest)
- Firefox (latest)
- Safari (if available)

Mobile (simulate or actual):
- iOS Safari
- Android Chrome
- Touch input validation

Report:
- Any graphical glitches
- Performance differences
- Input responsiveness
- Compatibility issues

Acceptance criteria:
- Game is playable on all tested browsers
- No console errors
- Touch input responsive (< 50ms lag)
- Resolution adapts correctly
```

### Task 3: Memory Leak Detection
```
Identify and fix memory leaks:

Test: Play through 3 full games (win/lose/quit) with DevTools Memory profiler

Measurements:
- Heap size after each game
- Check for object references that should be cleaned up
- Monitor for unbounded object growth

If leaks found:
- Identify source
- Fix cleanup (destroy textures, emitters, event listeners)
- Verify fix with repeat test

Acceptance criteria:
- Heap returns to baseline after game cleanup
- No detached DOM nodes
- No unreferenced textures in memory
- 3 game cycles don't accumulate > 5MB
```

---

## 🐉 Narrative Agent (Bonus)

### Task 1: Enhance Intro Cinematic
```
Improve the introduction sequence:

Current: Basic narrative setup
Enhancement:
- Add dialogue: Farquaad's threat and Shrek's defiance
- French dialogue (project theme)
- Pacing: 15 seconds total (skippable with Escape)
- Mood: humorous, establish stakes

Requirements:
- Modify Intro.js scene
- Use TextBitmap or Graphics for text rendering
- Coordinate with Audio Agent: add dramatic music

Acceptance criteria:
- Cinematic plays before gameplay
- Dialogue is in French
- Escape key skips to game
- Mood matches Shrek universe
- No audio overlap issues
```

### Task 2: Add Victory Message
```
Implement victory feedback:

When player reaches cabin with 7+ oignons:
- Display message: "Bravo Shrek! Tu as échappé à Farquaad!"
- Celebratory animation
- Final score display

Requirements:
- Modify ScoreSummary.js
- Message in French
- Celebratory visual (confetti-like particles)
- Coordinate with Audio Agent: victory sting

Acceptance criteria:
- Message displays on win
- Animation is engaging but not obnoxious
- Audio plays (sting)
- Readable on mobile
```

---

## 📝 How to Use These Tasks

1. Copy a task description
2. Assign to agent:
   ```
   /agent game-mechanics
   [paste task description]
   ```
3. Agent implements and tests
4. You review and merge

---

## 🔄 Example: Implementing a Complete Feature

**Feature: "Shield" Power-Up**

1. **Game Mechanics Agent**
   ```
   /agent game-mechanics
   [Task 3: Add Shield Power-Up]
   ```

2. **Visual Effects Agent** (after mechanics done)
   ```
   /agent visual-effects
   [Task 3: Power-Up Sprite Renderers - Shield variant]
   ```

3. **Audio Agent** (parallel with visual)
   ```
   /agent audio
   [Task 1: Add Collect Sound Effect - for shields]
   ```

4. **Level Design Agent** (after mechanics ready)
   ```
   /agent level-design
   [Task 1: Parameterize shield drop rate: 5% spawn chance]
   ```

5. **UI Agent** (optional, if HUD needs updating)
   ```
   /agent ui-ux
   [Add shield indicator to HUD if active]
   ```

6. **Performance Agent** (final validation)
   ```
   /agent performance-qa
   [Task 1: Profile shield particles for FPS impact]
   ```

Result: Complete, polished feature with all coordinated aspects.
