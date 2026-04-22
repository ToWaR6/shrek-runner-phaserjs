# 🎯 Suggested First Tasks for Each Agent

Use these tasks to get started with the agent system. Each one is self-contained and demonstrates the agent's capabilities.

---

## 🎮 Game Mechanics Agent

### Recommended First Task: "Implement Shield Power-Up"

**Why this task?**
- Core gameplay mechanics
- Teaches physics/collision system
- Coordinate with other agents easily
- Moderate difficulty, good learning curve

**What it involves:**
- Modify collision detection
- Add power-up tracking state
- Emit events via EventBus
- Coordinate with Audio for feedback

**Estimated time:** 45 minutes

**To assign:**
```
/agent game-mechanics
[Copy Task 3 from TASK_EXAMPLES.md: "Add Shield Power-Up"]
```

**After completion, you'll have:**
- ✅ Tested collision system
- ✅ Experience with power-up mechanics
- ✅ Working event emissions
- ✅ Base for future power-ups (double jump, speed boost, etc.)

---

## 🎨 Visual Effects Agent

### Recommended First Task: "Create Mud Zone Visual Effect"

**Why this task?**
- Simplest visual task (semi-transparent rectangles)
- Teaches sprite rendering without images
- Uses Canvas/Graphics API
- Good intro to particles

**What it involves:**
- Render semi-transparent rectangles (mud zones)
- Add particle emitter for footsteps
- Simple animations (fade out)
- Coordinate with Audio for mud SFX

**Estimated time:** 30 minutes

**To assign:**
```
/agent visual-effects
[Copy Task 1 from TASK_EXAMPLES.md: "Create Mud Zone Visual Effect"]
```

**After completion, you'll have:**
- ✅ Procedural sprite generation working
- ✅ Particle emitter working
- ✅ Visual feedback for game events
- ✅ Foundation for more complex effects

---

## 🔊 Audio Manager Agent

### Recommended First Task: "Add Collect Sound Effect"

**Why this task?**
- Simplest audio task (single sound)
- Teaches EventBus communication
- Uses existing AudioManager pattern
- Quick feedback loop

**What it involves:**
- Emit "audio:collectOignon" event
- Implement ascending beep SFX
- Handle volume control
- Test sound playback

**Estimated time:** 20 minutes

**To assign:**
```
/agent audio
[Copy Task 1 from TASK_EXAMPLES.md: "Add Collect Sound Effect"]
```

**After completion, you'll have:**
- ✅ AudioManager patterns understood
- ✅ EventBus communication working
- ✅ Sound feedback in-game
- ✅ Foundation for boss alerts & victory stings

---

## 🎯 Level Design Agent

### Recommended First Task: "Parameterize Level Obstacles"

**Why this task?**
- Foundational (affects all other level work)
- Teaches data-driven design
- Uses config/levels.js template
- Enables easier future modifications

**What it involves:**
- Extract hardcoded values into levels.js
- Organize by difficulty (easy/normal/hard)
- Create helper functions
- Update Game.js to use config

**Estimated time:** 60 minutes

**To assign:**
```
/agent level-design
[Copy Task 1 from TASK_EXAMPLES.md: "Parameterize Level Obstacles"]
```

**After completion, you'll have:**
- ✅ Level data centralized
- ✅ Difficulty presets working
- ✅ Easy to add/remove obstacles
- ✅ Foundation for level tuning

---

## 🖥️ UI/UX React Agent

### Recommended First Task: "Implement HUD with Real-Time Updates"

**Why this task?**
- Teaches React-Phaser integration
- Uses EventBus communication
- Visible, interactive UI
- Improves game feedback immediately

**What it involves:**
- Create GameHUD React component
- Subscribe to EventBus events
- Display score, timer, boss distance
- Handle real-time updates

**Estimated time:** 45 minutes

**To assign:**
```
/agent ui-ux
[Copy Task 1 from TASK_EXAMPLES.md: "Implement HUD with Real-Time Updates"]
```

**After completion, you'll have:**
- ✅ React-Phaser communication working
- ✅ EventBus events flowing correctly
- ✅ HUD visible and updating
- ✅ Foundation for leaderboard & options

---

## 🚀 Performance/QA Agent

### Recommended First Task: "FPS Profiling & Optimization"

**Why this task?**
- Establishes baseline performance
- Uses profiling tools (Chrome DevTools)
- Identify bottlenecks early
- Prevent performance regressions

**What it involves:**
- Profile current fps during gameplay
- Identify render bottlenecks
- Implement object pooling
- Before/after benchmarks

**Estimated time:** 90 minutes

**To assign:**
```
/agent performance-qa
[Copy Task 1 from TASK_EXAMPLES.md: "FPS Profiling & Optimization"]
```

**After completion, you'll have:**
- ✅ Baseline fps metrics documented
- ✅ Optimization opportunities identified
- ✅ Faster rendering
- ✅ Foundation for continued optimization

---

## 🐉 Narrative Agent

### Recommended First Task: "Enhance Intro Cinematic"

**Why this task?**
- Optional but fun (adds flavor)
- Teaches scene management
- Improves player engagement
- Sets tone for the game

**What it involves:**
- Add French dialogue
- Improve pacing (15 seconds total)
- Add dramatic music coordination
- Make story engaging

**Estimated time:** 30 minutes

**To assign:**
```
/agent narrative
[Copy Task 1 from TASK_EXAMPLES.md: "Enhance Intro Cinematic"]
```

**After completion, you'll have:**
- ✅ Enhanced narrative introduction
- ✅ Improved player immersion
- ✅ Coordinated audio-visual intro
- ✅ Foundation for more story elements

---

## 📊 Recommended Execution Order

### Phase 1: Foundation (First 2 hours)
```
1. Level Design Agent
   → Parameterize Level Obstacles
   (Everything depends on this being data-driven)

2. Audio Agent (parallel)
   → Add Collect Sound Effect
   (Small, quick wins)

3. UI Agent (parallel)
   → Implement HUD with Real-Time Updates
   (Visibility into game state)
```

### Phase 2: Content (Next 2 hours)
```
4. Game Mechanics Agent
   → Implement Shield Power-Up
   (New feature in game)

5. Visual Effects Agent (parallel)
   → Create Mud Zone Visual Effect
   (Polish the game)

6. Performance/QA Agent (parallel)
   → FPS Profiling & Optimization
   (Ensure quality baseline)
```

### Phase 3: Polish (Final 1 hour)
```
7. Narrative Agent (optional)
   → Enhance Intro Cinematic
   (Add flavor & story)
```

**Total time estimate:** ~5 hours for all recommended first tasks

---

## 🎯 Success Checklist

After completing recommended tasks, you should have:

- ✅ **Game Mechanics**: Shield power-up working, collision system tested
- ✅ **Visual**: Mud zones visible with particle feedback
- ✅ **Audio**: Collect sounds playing via EventBus
- ✅ **Level Design**: All obstacles parameterized in config
- ✅ **UI**: HUD showing real-time game state
- ✅ **Performance**: Baseline fps measured, optimization ideas identified
- ✅ **Narrative** (optional): Improved intro cinematic

---

## 🚀 After First Tasks: Next Steps

Once recommended tasks complete, suggested follow-up improvements:

**Game Mechanics**
- [ ] Add Double Jump power-up
- [ ] Add Speed Boost power-up
- [ ] Implement dynamic difficulty scaling

**Visual Effects**
- [ ] Create power-up sprites (shield, double jump, speed boost)
- [ ] Add boss approach warning animation
- [ ] Implement victory particle effects

**Audio**
- [ ] Add boss approach alert
- [ ] Add victory sting
- [ ] Add game over sound

**Level Design**
- [ ] Design zone-based level structure
- [ ] Optimize collectible distribution
- [ ] Create difficulty progression curve

**UI/UX**
- [ ] Build main menu with navigation
- [ ] Add leaderboard (localStorage)
- [ ] Implement options/settings

**Performance/QA**
- [ ] Cross-browser testing
- [ ] Memory leak detection
- [ ] Mobile touch input testing

**Narrative**
- [ ] Add victory message
- [ ] Create easter eggs
- [ ] Add in-game dialogue feedback

---

## 💡 Tips for First Tasks

1. **Start with Level Design** — Everything depends on this being data-driven
2. **Do Audio & UI in parallel** — They're independent
3. **Game Mechanics & Visual next** — These coordinate together
4. **End with Performance/Narrative** — Polish work

5. **Test after each task** (`npm run dev`)
6. **Review agent's work before merging**
7. **Keep notes on what worked/didn't work**
8. **Use Collaboration Matrix** to track dependencies

---

## 🎓 Learning Path

Using these first tasks, you'll learn:

| Agent | Skill | Relevant To |
|-------|-------|---|
| Level Design | Data-driven architecture | All future tasks |
| Audio | EventBus communication | UI, Game Mechanics |
| UI | React-Phaser integration | Future UX features |
| Game Mechanics | Physics & collision | All gameplay features |
| Visual | Procedural sprite generation | All visual features |
| Performance | Profiling & optimization | All agents' work |
| Narrative | Story & flavor | Overall game experience |

---

## ✨ Ready to Start?

1. **Read** AGENT_GUIDE.md (5 min)
2. **Pick** Level Design Agent as first task
3. **Copy** Task 1 from TASK_EXAMPLES.md
4. **Assign** with `/agent level-design`
5. **Wait** for completion
6. **Review** & merge

**Estimated time to first working feature:** ~1-2 hours total

Good luck! 🚀
