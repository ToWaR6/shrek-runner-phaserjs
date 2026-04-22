# 🎼 Orchestrator Agent - Master Coordinator

The **Orchestrator Agent** is the main entry point for all development work on Shrek Run.

You speak to the Orchestrator in plain language, and it intelligently coordinates the specialized agents to get the job done.

---

## 🎯 What It Does

Instead of this:
```
You: "Add a double jump power-up"
You: Hmm, which agents do I need?
You: Game mechanics for logic...
You: Visual for sprite...
You: Audio for SFX...
You: UI for HUD...
You: Ugh, let me coordinate all of them
```

You now do this:
```
You: Add a double jump power-up that lasts 3 seconds
Orchestrator: ✓ Assigning to Game Mechanics Agent
Orchestrator: ✓ Assigning to Visual Effects Agent
Orchestrator: ✓ Assigning to Audio Agent
Orchestrator: ✓ Assigning to UI Agent
Orchestrator: ✓ Done! All agents completed their tasks
```

---

## 📋 How to Use It

### Format 1: Simple Feature Request
```
/orchestrator
Add a shield power-up that grants 5 seconds of invulnerability.
Should absorb 1 hit, then disappear. Visual feedback included.
```

### Format 2: Bug Report
```
/orchestrator
Fix the bug where Shrek gets stuck in mud zones.
He should be able to jump out.
```

### Format 3: Performance Request
```
/orchestrator
Optimize the game for mobile. 
Target: maintain 55+ fps on iPhone 12.
```

### Format 4: Feature with Specific Details
```
/orchestrator
Implement 3 new enemies:
1. Fast runner (quick but weaker)
2. Shield bearer (slow but durable)
3. Trap placer (stationary, spawns hazards)

All should spawn in late game only.
```

---

## 🧠 How It Works

### Step 1: Analyze Request
Orchestrator reads your request and determines:
- What type of work is needed (feature, bug, optimization, etc.)
- Which domains are affected (game logic, visuals, audio, etc.)
- Complexity and dependencies

### Step 2: Select Agents
Based on analysis, it selects which agents to involve:

```
Game Feature (Power-up)
├─ Game Mechanics (45%) ← PRIMARY
├─ Visual Effects (20%)
├─ Audio (15%)
├─ UI/UX (15%)
└─ Performance/QA (5%)

Mobile Optimization
├─ Performance/QA (60%) ← PRIMARY
├─ Visual Effects (25%)
└─ Game Mechanics (15%)

Bug Fix
├─ Performance/QA (50%) ← PRIMARY
├─ Affected Domain (40%)
└─ Testing (10%)
```

### Step 3: Create Agent Tasks
Orchestrator automatically:
- Splits your request into domain-specific tasks
- Creates detailed task descriptions for each agent
- Determines execution order (sequential vs parallel)
- Tracks dependencies

### Step 4: Execute & Coordinate
Orchestrator:
- Assigns tasks to agents in the right order
- Waits for critical tasks before starting dependent ones
- Runs independent tasks in parallel
- Monitors progress
- Escalates issues if agents get stuck

### Step 5: Report Results
When done:
- Shows what each agent accomplished
- Highlights any issues or warnings
- Suggests next steps
- Offers to make refinements

---

## 📊 Agent Selection Logic

The Orchestrator uses this decision tree:

```
Is it a FEATURE?
├─ Game mechanic?
│  ├─ YES → Primary: Game Mechanics
│  │   ├─ Then: Visual Effects
│  │   ├─ Then: Audio
│  │   ├─ Then: UI/UX
│  │   └─ Finally: Performance/QA
│  
├─ Visual/animation?
│  ├─ YES → Primary: Visual Effects
│  │   ├─ Then: Game Mechanics (if collision-related)
│  │   ├─ Then: Audio
│  │   └─ Finally: Performance/QA
│
├─ Audio/sound?
│  ├─ YES → Primary: Audio
│  │   ├─ Coordinate: Game Mechanics (for events)
│  │   ├─ Coordinate: UI (for controls)
│  │   └─ Finally: Performance/QA
│
├─ UI/menu?
│  ├─ YES → Primary: UI/UX
│  │   ├─ Coordinate: Audio (for sound feedback)
│  │   ├─ Coordinate: Game Mechanics (for state)
│  │   └─ Finally: Performance/QA
│
├─ Level design?
│  ├─ YES → Primary: Level Design
│  │   ├─ Then: Game Mechanics (for tuning)
│  │   ├─ Then: Visual Effects (for decoration)
│  │   └─ Finally: Performance/QA
│
└─ Story/narrative?
   └─ Primary: Narrative
      ├─ Coordinate: Audio (for music)
      ├─ Coordinate: Visual (for effects)
      └─ Finally: Performance/QA

Is it a BUG?
└─ Primary: Performance/QA
   ├─ Then: Affected Domain
   └─ Finally: Re-test

Is it OPTIMIZATION?
└─ Primary: Performance/QA
   ├─ Then: Visual Effects (render optimization)
   ├─ Then: Game Mechanics (physics optimization)
   ├─ Then: Audio (audio optimization)
   └─ Finally: Full integration test

Is it TESTING?
└─ Primary: Performance/QA
   ├─ Coordinate with: All agents (as needed)
```

---

## 🎓 Example: Orchestrator in Action

### Request
```
/orchestrator
Add a "slow motion" power-up that slows the boss to 0.5x speed for 4 seconds.
It should look cool, have sound feedback, appear on the HUD when active,
and work smoothly on mobile.
```

### Orchestrator's Analysis
```
REQUEST TYPE: New Power-Up Feature
DOMAINS: Game Mechanics, Visual Effects, Audio, UI, Performance

BREAKDOWN:
├─ GAME MECHANICS TASK
│  ├─ Implement slow-motion logic
│  ├─ Track timer (4 seconds)
│  ├─ Apply 0.5x multiplier to boss speed
│  ├─ Prevent stacking (only 1 active at a time)
│  └─ Emit events for audio/UI
│
├─ VISUAL EFFECTS TASK
│  ├─ Create slow-motion particle effect (shimmering air)
│  ├─ Add screen filter (blue tint during slow-mo)
│  └─ Animate transition in/out (0.3s ease)
│
├─ AUDIO TASK
│  ├─ Add "power-up activated" SFX (descending drone sound)
│  ├─ Add "time resuming" SFX (rising tone)
│  └─ Slow-motion ambient tone (low hum)
│
├─ UI/UX TASK
│  ├─ Add HUD indicator: "SLOW-MO: 3.5s"
│  ├─ Countdown timer visible
│  └─ Status bar that depletes
│
└─ PERFORMANCE/QA TASK
   ├─ Profile slow-motion effect (fps impact)
   ├─ Test on mobile (55+ fps target)
   ├─ Verify no memory leaks
   └─ Test rapid power-up activation

EXECUTION PLAN (Parallel where possible):
1. Game Mechanics Agent (primary, 60 min)
2. [Parallel] Visual Effects Agent (20 min)
   [Parallel] Audio Agent (15 min)
   [Parallel] UI Agent (20 min)
3. Performance/QA Agent (30 min, after others done)

ESTIMATED TOTAL TIME: ~90 minutes
```

### Orchestrator's Actions
```
✓ Assigned to Game Mechanics Agent
  → "Implement slow-motion power-up logic..."

✓ Waiting for Game Mechanics to complete collision system...

✓ Assigned to Visual Effects Agent
  → "Create slow-motion visual effects..."

✓ Assigned to Audio Agent
  → "Add slow-motion sound effects..."

✓ Assigned to UI Agent
  → "Add slow-motion HUD indicator..."

⏳ Waiting for all agents to complete (3 running in parallel)...

✓ Game Mechanics Agent: DONE (60 min)
✓ Visual Effects Agent: DONE (18 min)
✓ Audio Agent: DONE (12 min)
✓ UI Agent: DONE (22 min)

✓ Assigned to Performance/QA Agent
  → "Test slow-motion performance..."

✓ Performance/QA Agent: DONE (28 min)
  └─ Desktop: 62 fps (✓ Good)
  └─ Mobile: 56 fps (✓ Acceptable)
  └─ Memory: No leaks detected
  └─ Recommendation: Could optimize particles further

SUCCESS! Feature complete.
Total time: 98 minutes (vs ~5 hours if done manually)
```

---

## 💬 Example Requests & Responses

### Example 1: Add Enemy Type
```
REQUEST:
/orchestrator
Add a flying enemy that shoots projectiles at the player.
It should spawn in the late game zone.

RESPONSE:
✓ This is a Game Feature (moderate complexity)
✓ Assigning to: Game Mechanics → Visual Effects → Level Design → Audio → QA
✓ Estimated time: 2-3 hours
✓ Started!
```

### Example 2: Performance Issue
```
REQUEST:
/orchestrator
The game stutters when there are 10+ particles on screen.
Fix it.

RESPONSE:
✓ This is a Performance Bug
✓ Assigning to: Performance/QA (audit) → Visual Effects (optimization)
✓ Estimated time: 1-2 hours
✓ Started! (Running diagnostics now...)
```

### Example 3: Polish Work
```
REQUEST:
/orchestrator
Make the main menu look better. It's too plain.
Add animations, better colors, maybe some particle effects.

RESPONSE:
✓ This is UI/Polish Work
✓ Assigning to: UI/UX → Visual Effects → Audio (for UI sounds)
✓ Estimated time: 1.5-2 hours
✓ Started!
```

### Example 4: Complex Feature
```
REQUEST:
/orchestrator
Difficulty selection screen:
- Easy / Normal / Hard buttons
- Difficulty descriptions
- Visual preview of level difficulty
- Persistent selection (localStorage)
- Apply to next level

RESPONSE:
✓ This is a UI Feature with persistence
✓ Assigning to: UI/UX (primary) → Game Mechanics (difficulty config)
           → Level Design (visual preview) → Performance/QA (testing)
✓ Estimated time: 3-4 hours (multiple coordinate points)
✓ Started!
```

---

## 🔄 What Makes Orchestrator Smart

### 1. **Complexity Detection**
- Simple task (1 agent) → 30-60 min
- Moderate task (2-3 agents) → 1-2 hours
- Complex task (4+ agents) → 2-4 hours
- Massive task → Breaks into phases

### 2. **Dependency Management**
- Identifies which agents must wait for others
- Parallelizes independent work
- Prevents race conditions via EventBus

### 3. **Domain Analysis**
- Understands what each agent specializes in
- Maps feature requests to agent expertise
- Avoids overloading one agent

### 4. **Quality Gates**
- Always assigns Performance/QA at the end
- Requires 60+ fps, zero ESLint errors, no memory leaks
- Won't approve work that doesn't meet criteria

### 5. **Communication Clarity**
- Explains what it's doing (transparency)
- Shows progress updates
- Offers refinements if needed

---

## 📈 Improvement Loop

If a task doesn't work perfectly:

```
You: /orchestrator refine
     The slow-motion effect looks too blue. Make it more subtle.

Orchestrator: ✓ I'll ask Visual Effects Agent to adjust...
             ✓ Assigned refinement task
             ✓ Done in 15 minutes!
```

Or if something was missed:

```
You: /orchestrator enhance
     Can you also add a slow-motion power-up bar on the HUD?

Orchestrator: ✓ I'll update the UI task...
             ✓ Assigned enhancement to UI Agent
             ✓ Done in 10 minutes!
```

---

## 🎯 Success Criteria for Orchestrator

The Orchestrator's job is done well when:

- ✅ You describe what you want (not how to build it)
- ✅ It automatically picks the right agents
- ✅ All agents work correctly with no manual coordination
- ✅ Feature is complete and polished in minimal time
- ✅ Quality gates pass (fps, lint, memory)
- ✅ You're happy with the result

---

## 🚀 Using the Orchestrator

### Day-to-Day Workflow (New!)

**Old way:**
```
You: Need a power-up? Check TASK_EXAMPLES.md...
     Pick a task, copy it, find agent, assign...
     Wait for agent, check their work...
     Pick next task, repeat...
```

**New way (Orchestrator):**
```
You: I need a power-up
Orchestrator: Done! All agents coordinated automatically.
```

### One-Liner Commands

```
/orchestrator Add double jump power-up (3 sec duration)
/orchestrator Fix collision detection bug in mud zones
/orchestrator Optimize for mobile (55+ fps target)
/orchestrator Add main menu screen with difficulty selection
/orchestrator Implement leaderboard with top 10 scores
/orchestrator Create 3 new enemy types for late game
```

---

## ⚙️ Configuration

Add to `copilot-setup-steps.yml`:

```yaml
orchestrator:
  name: "Orchestrator"
  description: "Master coordinator - analyzes requests and delegates to appropriate agents"
  role: "MASTER_COORDINATOR"
  
  responsibilities:
    - Parse natural language requests
    - Determine required agents
    - Create domain-specific tasks
    - Manage execution order
    - Coordinate parallel work
    - Quality gate enforcement
    - Report final results
  
  agent_knowledge:
    - game-mechanics: "Physics, gameplay, power-ups, difficulty"
    - visual-effects: "Sprites, animations, particles, polish"
    - audio: "Music, SFX, audio feedback"
    - level-design: "Obstacles, collectibles, level pacing"
    - ui-ux: "Menus, HUD, leaderboard, React integration"
    - performance-qa: "Profiling, optimization, testing"
    - narrative: "Story, dialogue, flavor"
  
  decision_matrix:
    feature_request:
      - analyze_type (game/visual/audio/ui/level/story)
      - select_agents (primary + supporting)
      - create_tasks (domain-specific)
      - determine_sequence (parallel vs sequential)
    
    bug_report:
      - assign_to: performance-qa (primary)
      - then_assign: affected_domain
      - gate: full_test_before_approval
    
    optimization:
      - assign_to: performance-qa (primary)
      - profile_first: true
      - then_assign: affected_agents
      - benchmark: before_and_after
  
  quality_gates:
    - eslint: "0 errors"
    - fps: "60+ desktop, 55+ mobile"
    - memory: "no leaks"
    - functionality: "meets requirements"
    - coordination: "all agents aligned"
```

---

## 💡 Benefits

### For You
- ✅ Simpler interface (1 orchestrator, not 7 agents)
- ✅ Faster feature turnaround (parallel work auto-managed)
- ✅ Better quality (quality gates enforced)
- ✅ Less coordination overhead (orchestrator handles it)
- ✅ More focus on design, less on process

### For the Agents
- ✅ Clearer tasks (orchestrator creates detailed briefs)
- ✅ Better coordination (orchestrator manages dependencies)
- ✅ Less context switching (focused on their domain)
- ✅ Success metrics built-in (quality gates)

### For the Project
- ✅ Features complete faster
- ✅ Higher code quality (QA gates)
- ✅ Better architecture (EventBus enforced)
- ✅ Scalable process (can add more agents)

---

## 🎬 Ready to Try It?

Next time you want to add a feature, instead of:
```
/agent game-mechanics
[copy task from TASK_EXAMPLES.md]
```

Just say:
```
/orchestrator
[describe what you want in plain English]
```

The Orchestrator handles the rest! 🎼

---

**The Orchestrator is your team captain. You focus on what to build. It focuses on how to coordinate the specialists to build it.** ✨
