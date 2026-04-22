# 📊 Agent System Quick Reference

A complete agent-based development framework for Shrek Run (Phaser 4 + React).

---

## 🎯 What You Just Got

| File | Purpose |
|------|---------|
| **AGENTS.md** | 📖 Detailed profiles for each agent (scope, skills, constraints) |
| **AGENT_GUIDE.md** | 🚀 How to use the agent system + quick start guide |
| **TASK_EXAMPLES.md** | 📋 Ready-to-copy task descriptions for all agents |
| **copilot-setup-steps.yml** | ⚙️ Agent specialization config + collaboration matrix |
| **src/game/config/levels.js** | 🎮 Level configuration template for Level Design Agent |

---

## 🎼 **NEW: Orchestrator Agent** (Master Coordinator)

**Simplify your workflow - talk to ONE agent instead of seven!**

The Orchestrator automatically:
- Analyzes your request
- Picks the right agents
- Creates their tasks
- Coordinates execution
- Reports results

### Quick Example:
```
You: /orchestrator Add a double-jump power-up

Orchestrator: ✓ Coordinating Game Mechanics, Visual, Audio, UI agents
              ✓ Running in optimal sequence
              ✓ Enforcing quality gates
              ✓ Done! (2 hours)
```

---

## 🎮 The 7 Specialist Agents

```
┌─────────────────────┐
│ 1. Game Mechanics   │ → Core gameplay, physics, difficulty
├─────────────────────┤
│ 2. Visual Effects   │ → Sprites, animations, particles
├─────────────────────┤
│ 3. Audio Manager    │ → Music, SFX, feedback
├─────────────────────┤
│ 4. Level Design     │ → Obstacles, collectibles, pacing
├─────────────────────┤
│ 5. UI/UX (React)    │ → Menus, HUD, leaderboard
├─────────────────────┤
│ 6. Performance/QA   │ → Profiling, testing, optimization
├─────────────────────┤
│ 7. Narrative        │ → Story, dialogue, flavor (optional)
└─────────────────────┘
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Pick a Feature
Example: "Add a double-jump power-up"

### Step 2: Assign to Agent
```
/agent game-mechanics
Implement a "Double Jump" power-up that lasts 3 seconds...
[Copy task from TASK_EXAMPLES.md]
```

### Step 3: Wait & Review
- Agent implements and tests
- You review the code
- Merge when satisfied

---

## 📚 Documentation Map

```
START HERE → AGENT_GUIDE.md
             ├─ Quick overview of agent system
             ├─ How to assign tasks
             ├─ Coordination guidelines
             └─ Next steps

DEEP DIVE → AGENTS.md
            ├─ Detailed profile for each agent
            ├─ Scope & constraints
            ├─ Skills & instructions
            └─ Coordination with other agents

READY TASKS → TASK_EXAMPLES.md
              ├─ Game Mechanics tasks (3 examples)
              ├─ Visual Effects tasks (3 examples)
              ├─ Audio tasks (3 examples)
              ├─ Level Design tasks (3 examples)
              ├─ UI/UX tasks (3 examples)
              ├─ Performance/QA tasks (3 examples)
              └─ Narrative tasks (2 examples)

CONFIGURATION → copilot-setup-steps.yml
                ├─ Agent profiles
                ├─ Tool access matrix
                ├─ Collaboration rules
                └─ Validation commands

TEMPLATE → src/game/config/levels.js
           ├─ Parameterized level design
           ├─ Obstacle configs by difficulty
           ├─ Boss settings
           └─ Helper functions for Game.js
```

---

## ✅ Success Criteria

Every agent's work must pass:

- ✅ **ESLint** (`npm run lint`)
- ✅ **Performance** (60+ fps)
- ✅ **Manual Testing** (`npm run dev`)
- ✅ **Memory** (no leaks)
- ✅ **Architecture** (EventBus communication)

---

## 🔄 Example Workflows

### Add a Power-Up Feature

```
1. Game Mechanics Agent
   → Implement double-jump logic, timer, collision

2. Level Design Agent  
   → Place power-ups on level, tune spawn rate

3. Visual Effects Agent
   → Create sprite, add pulse animation

4. Audio Agent
   → Add activation sound + feedback

5. UI Agent
   → Add HUD indicator

6. Performance/QA Agent
   → Profile, test, optimize
```

**Timeline**: ~2 hours (parallel work possible)

---

### Fix a Bug

```
1. Performance/QA Agent
   → Identify root cause

2. Relevant agent(s) (Game/Visual/Audio/etc.)
   → Implement fix

3. Performance/QA Agent
   → Verify fix, re-test
```

**Timeline**: ~30 min to 1 hour

---

## 📞 Quick Answers

**Q: Which agent should I use?**
- Graphics/animations → **Visual Effects**
- Gameplay/physics → **Game Mechanics**
- Sound → **Audio Manager**
- Obstacles/levels → **Level Design**
- Menus/HUD → **UI/UX**
- Performance/bugs → **Performance/QA**
- Story/flavor → **Narrative**

**Q: Can agents work in parallel?**
- Yes! Check copilot-setup-steps.yml Collaboration Matrix

**Q: How do agents communicate?**
- Via EventBus (Phaser → React events)
- Shared config files (levels.js)
- No direct coupling (single responsibility)

**Q: What if an agent gets stuck?**
- Provide more context/clarity
- Or assign to a different agent with cross-domain expertise

---

## 🎓 How to Read AGENTS.md

Each section includes:

| Field | Example |
|-------|---------|
| **Objective** | "Develop core gameplay mechanics" |
| **Scope** | `src/game/scenes/Game.js` |
| **Key Constraint** | ⚠️ "7 oignons / 21 required for win" |
| **Typical Task** | "Add double-jump power-up" |
| **Coordinates With** | Visual, Audio, UI agents |
| **Success Metric** | "60+ fps, collectibles balanced" |

---

## 🛠️ Files You Can Modify

Safe to edit per agent:

| Agent | Primary Files | Can Also Touch |
|-------|---------------|---|
| **Game Mechanics** | `Game.js` | `levels.js`, `EventBus.js` |
| **Visual Effects** | `Game.js`, `MainMenu.js` | `config` |
| **Audio** | `AudioManager.js` | `EventBus.js` |
| **Level Design** | `levels.js` | `Game.js` (only spawn logic) |
| **UI/UX** | `App.jsx`, components | `EventBus.js` |
| **Performance/QA** | All (audit) | All (optimization) |
| **Narrative** | `Intro.js`, `ScoreSummary.js` | Audio, UI |

---

## 🎯 Next Steps

1. **Read** AGENT_GUIDE.md (5 min overview)
2. **Skim** AGENTS.md (understand constraints)
3. **Pick a task** from TASK_EXAMPLES.md
4. **Assign** to agent using `/agent [name]`
5. **Review** when agent completes

---

## 💡 Pro Tips

1. **Use TASK_EXAMPLES.md** before writing custom tasks
2. **Check Collaboration Matrix** before parallel work
3. **Test locally** after each agent completes
4. **Use EventBus** for all cross-domain communication
5. **Parameterize values** in config files (not hardcoded)

---

## 📖 File Purposes at a Glance

| File | Start Here? | When to Read |
|------|-------------|---|
| AGENT_GUIDE.md | ✅ YES | First (quick overview) |
| AGENTS.md | ⭐ IF TIME | Before assigning tasks |
| TASK_EXAMPLES.md | ✅ YES | When creating task |
| copilot-setup-steps.yml | Only if needed | For collaboration issues |
| levels.js | ⭐ IF TIME | When doing level design |

---

## 🚨 Important Reminders

- ⚠️ **Visual Agent**: NO external images (Canvas/Graphics API only)
- ⚠️ **Audio Agent**: Use AudioManager singleton (no direct Phaser audio)
- ⚠️ **Level Design**: Parameterize all values (config-driven)
- ⚠️ **UI Agent**: No prop drilling (EventBus only)
- ⚠️ **All Agents**: ESLint must pass, 60+ fps target

---

## 🎮 Game Target Specs

- **Player goal**: Travel 6400px left-to-right
- **Win condition**: Collect 7+ oignons (out of 21)
- **Enemy**: Farquaad (boss), progressively speeds up
- **Obstacles**: Villagers (instant kill), mud zones (slowdown)
- **Performance**: 60 fps desktop, 55 fps mobile

---

## ✨ Ready to Go!

You now have:
- ✅ 7 specialized agents ready to use
- ✅ 21+ task examples (3 per agent)
- ✅ Configuration + collaboration rules
- ✅ Level design template
- ✅ Complete documentation

**Start with AGENT_GUIDE.md for the quickest path forward.** 🚀
