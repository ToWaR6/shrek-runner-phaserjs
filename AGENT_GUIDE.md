# 🤖 Shrek Run - Agent-Based Development Guide

This project is designed to be developed using **specialized agents**. Each agent has a specific domain and works collaboratively with others.

## 📚 Documentation Files

1. **AGENTS.md** — Detailed profile of each agent (scope, skills, constraints)
2. **TASK_EXAMPLES.md** — Ready-to-use task descriptions for each agent
3. **copilot-setup-steps.yml** — Configuration for agent specialization
4. **This file** — Quick start guide

---

## 🎯 Quick Start: How to Use Agents

### 🎼 **Recommended: Use the Orchestrator Agent**

For most requests, use the Orchestrator to automatically coordinate multiple agents:

```
/orchestrator
Add a double-jump power-up that lasts 3 seconds
```

The Orchestrator:
- ✅ Figures out which agents you need
- ✅ Creates detailed tasks for each
- ✅ Coordinates execution (parallel where possible)
- ✅ Enforces quality gates
- ✅ Reports final result

**Much simpler than manual coordination!**

See **ORCHESTRATOR_QUICK_START.md** for quick guide or **ORCHESTRATOR.md** for full details.

---

### Advanced: Direct Agent Assignment

For fine-grained control, assign directly to an agent:

```
/agent game-mechanics
Implement a "Double Jump" power-up...
[See TASK_EXAMPLES.md for full task description]
```

**When to use:**
- Prototyping/experimenting
- Very specific, narrow changes
- Learning how things work

---

## 🎮 The 7 Agents

| Agent | Specialty | Files | Status |
|-------|-----------|-------|--------|
| **Game Mechanics** | Physics, difficulty, core gameplay | `Game.js`, physics | ✅ Ready |
| **Visual Effects** | Sprites, animations, particles | `Game.js`, `MainMenu.js` | ✅ Ready |
| **Audio Manager** | Music, SFX, audio feedback | `AudioManager.js`, `EventBus.js` | ✅ Ready |
| **Level Design** | Obstacles, collectibles, level pacing | `Game.js`, `config/levels.js` | ✅ Ready |
| **UI/UX** | React menus, HUD, leaderboard | `App.jsx`, components | ✅ Ready |
| **Performance/QA** | Profiling, optimization, testing | All files (audit) | ✅ Ready |
| **Narrative** | Story, dialogue, flavor | `Intro.js`, messaging | ✅ Optional |

---

## 📋 Task Assignment Format

Use this format to assign tasks:

```
/agent [agent-name]
[Detailed task description from TASK_EXAMPLES.md or your own]

Requirements:
- [List key requirements]

Acceptance criteria:
- [How to verify success]
```

### Agent Names (use exactly these)
- `game-mechanics`
- `visual-effects`
- `audio`
- `level-design`
- `ui-ux`
- `performance-qa`
- `narrative` (bonus)

---

## 🔄 Coordination Guide

Agents coordinate via:

1. **Game Events (EventBus)**: Phaser → React communication
   - `"game:scoreUpdate"` — Score changed
   - `"game:timerTick"` — Timer updated
   - `"game:bossPosition"` — Boss distance info
   - `"audio:collectOignon"` — Play sound effect

2. **File Dependencies**:
   - `Game.js` — Core game logic (shared by mechanics, level design, visual)
   - `EventBus.js` — Event hub (used by audio, UI)
   - `AudioManager.js` — Audio singleton (used by mechanics for triggers)

3. **Collaboration Matrix** (in copilot-setup-steps.yml):
   ```
   game-mechanics  → reads from level-design, visual-effects
                   → writes to audio, ui-ux
   
   level-design    → reads from game-mechanics
                   → writes to game-mechanics, visual-effects
   
   ... [see copilot-setup-steps.yml for full matrix]
   ```

---

## 📂 Project Structure

```
src/
├── game/
│   ├── scenes/
│   │   ├── Boot.js          # Initialization
│   │   ├── Preloader.js     # Asset loading
│   │   ├── MainMenu.js      # Menu (UI + Phaser)
│   │   ├── Intro.js         # Cinematic (narrative)
│   │   ├── Game.js          # Main gameplay ⭐ (most agents work here)
│   │   ├── GameOver.js      # End screen
│   │   └── ScoreSummary.js  # Results
│   ├── config/              # Level configs (for level-design agent)
│   ├── AudioManager.js      # Audio singleton (audio agent)
│   ├── EventBus.js          # Event hub (all agents)
│   └── main.js              # Phaser config
├── App.jsx                  # React root
├── PhaserGame.jsx          # Phaser wrapper
└── main.jsx                # Entry point

dist/                        # Build output (auto-generated)
AGENTS.md                   # ✅ Agent profiles
TASK_EXAMPLES.md           # ✅ Ready tasks
copilot-setup-steps.yml    # ✅ Config
```

---

## ✅ Success Criteria (All Agents)

Every agent's work must satisfy:

- ✅ **Code Quality**: ESLint passes (`npm run lint`)
- ✅ **Performance**: 60+ fps maintained during gameplay
- ✅ **Testing**: Manual test in `npm run dev`
- ✅ **Memory**: No memory leaks detected
- ✅ **Structure**: Follows existing patterns (no breaking changes)
- ✅ **Communication**: Uses EventBus or AudioManager (no direct coupling)

---

## 🚀 Common Workflows

### Workflow A: Add a New Power-Up

1. **Game Mechanics** → Implement power-up logic & physics
2. **Level Design** → Parameterize spawn rates
3. **Visual Effects** → Create sprite & animation
4. **Audio** → Add collection & activation SFX
5. **UI/UX** → Add HUD indicator
6. **Performance/QA** → Profile & optimize

**Timeline**: ~1-2 hours per agent

---

### Workflow B: Fix a Bug

1. **Performance/QA** → Identify & propose fix
2. **Game Mechanics** / **Visual** / **Audio** (as needed) → Implement fix
3. **Performance/QA** → Re-test, verify fix

**Timeline**: ~30 min to 1 hour

---

### Workflow C: Refactor/Optimize

1. **Performance/QA** → Profile, identify hotspots
2. **Relevant agents** → Refactor their domain
3. **Performance/QA** → Benchmark improvements

**Timeline**: Varies by scope

---

## 📖 How to Read AGENTS.md

Each agent section includes:

1. **Objective** — What they do
2. **Scope** — Which files/systems they own
3. **Skills** — Specific capabilities
4. **Instructions** — Guidelines & constraints
5. **Files to read** — Starting point
6. **Coordination** — How they work with other agents

**Pro tip**: Skim AGENTS.md to understand constraints, then use TASK_EXAMPLES.md for concrete tasks.

---

## 🎓 Example: Reading an Agent Profile

**Visual Effects Agent**

| Field | Value |
|-------|-------|
| **Objective** | Generate sprites & handle animations |
| **Scope** | `Game.js`, `MainMenu.js` (rendering only) |
| **Key constraint** | ⚠️ **NO external images** — all sprites are procedural |
| **Typical task** | "Add dust particles when player jumps" |
| **Coordinates with** | Game Mechanics (collision), Audio (SFX sync) |
| **Success metric** | 60+ fps with particles |

**What this means**: If you need visual effects, always assign to this agent, and remember they can't use image files.

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Dev server (with logging)
npm run dev

# Dev server (no logging)
npm run dev-nolog

# Production build
npm run build

# Lint code
npm run lint
```

---

## 📝 Assignment Template

**Copy/paste this when assigning tasks:**

```
/agent [agent-name]

**Task**: [Short title]

**Description**:
[Detailed what + why]

**Requirements**:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

**Acceptance Criteria**:
- [Success metric 1]
- [Success metric 2]
- [Success metric 3]

**Related Agents**: 
- [If this affects another agent, mention it]
```

---

## ❓ FAQ

**Q: Can agents work in parallel?**  
A: Yes! Agents working on different files can work simultaneously. Use the **Collaboration Matrix** in copilot-setup-steps.yml to check dependencies.

**Q: What if two agents need to modify the same file?**  
A: They coordinate via EventBus (communication layer). Game Mechanics emits events, UI/Audio agents listen.

**Q: How do I validate an agent's work?**  
A: Run `npm run dev`, play the game, and verify against Acceptance Criteria in the task.

**Q: Can I assign multiple tasks to one agent?**  
A: Yes, but do it sequentially (one at a time) so they can focus.

**Q: What if an agent gets stuck?**  
A: Ask the agent for clarification, or assign the task to a different agent if it spans multiple domains.

---

## 🎯 Next Steps

1. **Read AGENTS.md** to understand each agent's domain
2. **Pick a feature** from your backlog
3. **Check TASK_EXAMPLES.md** for a similar task template
4. **Assign to agent(s)** using `/agent [name]`
5. **Review & merge** when complete

---

## 📊 Configuration

The **copilot-setup-steps.yml** file defines:
- Agent profiles & specialization
- File access for each agent
- Tool availability (what each can do)
- Validation commands (lint, build, test)
- Collaboration matrix (who talks to whom)

**You don't need to modify this unless adding new agents.**

---

## 🚨 Important Notes

### For Game Mechanics Agent
- Always parameterize difficulty settings (no magic numbers)
- Respect the 7 oignons / 21 total balance
- Coordinate with Level Design for spawn timing

### For Visual Effects Agent
- **NO external image files** — use Phaser Graphics API
- Keep particles < 50 concurrent (performance)
- Test on mobile (60fps target)

### For Audio Agent
- Use **AudioManager singleton** (no direct Phaser audio calls)
- Emit via **EventBus** (no direct coupling)
- SFX duration < 2 seconds (except loops)

### For Level Design Agent
- Extract all hardcoded values into config objects
- Ensure 7+ oignons are achievable
- Test difficulty curve (smooth scaling)

### For UI Agent
- React handles UI only, Phaser handles game
- **No prop drilling** — use EventBus exclusively
- Mobile responsive (375px minimum width)

### For Performance/QA Agent
- Before/after benchmarks required
- 60+ fps desktop, 55+ fps mobile
- Document all findings

---

## 💡 Tips & Tricks

1. **Use copilot-setup-steps.yml as reference** when questions arise about an agent's scope
2. **Check TASK_EXAMPLES.md first** before writing custom tasks (might already exist)
3. **Test locally** (`npm run dev`) after each agent completes
4. **Use EventBus** for all cross-domain communication (golden rule)
5. **Assign by domain** — if a task touches multiple areas, split it by agent

---

## 📞 Support

- **Agent not understanding a task?** → Clarify requirements & provide more context
- **Performance issue?** → Escalate to Performance/QA agent
- **Multiple agents disagreeing?** → Check Collaboration Matrix, ensure EventBus communication
- **New feature idea?** → Check TASK_EXAMPLES.md for patterns, or create custom task using template

---

**Happy developing! 🎮**

*Built for Phaser 4 + React 19 + Vite 6*
