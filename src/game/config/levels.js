// src/game/config/levels.js
/**
 * Level configuration for Shrek Run
 * 
 * This file defines parameterized level data for different difficulty levels.
 * The Level Design Agent uses this to spawn obstacles, collectibles, and manage difficulty curves.
 * 
 * All values are data-driven — avoid hardcoding positions in Game.js!
 */

export const LEVEL_CONFIG = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Level dimensions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  levelWidth: 6400,  // Player must traverse this distance
  levelHeight: 600,  // Play area height
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Collectibles (Oignons)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  collectibles: {
    totalRequired: 7,  // Win condition: must collect 7+ out of total
    totalInLevel: 21,   // Total oignons in level
    
    distribution: [
      // Early zone (0-1600px): easy oignons on main path
      { x: 300, y: 400, difficulty: 'easy', zone: 'early' },
      { x: 600, y: 300, difficulty: 'easy', zone: 'early' },
      { x: 900, y: 500, difficulty: 'easy', zone: 'early' },
      { x: 1200, y: 350, difficulty: 'easy', zone: 'early' },
      { x: 1500, y: 400, difficulty: 'easy', zone: 'early' },
      
      // Mid zone (1600-4000px): balanced, some easy on path + challenge offtop
      { x: 1800, y: 400, difficulty: 'easy', zone: 'mid' },
      { x: 2100, y: 300, difficulty: 'easy', zone: 'mid' },
      { x: 2400, y: 450, difficulty: 'challenge', zone: 'mid', note: 'Needs platforming' },
      { x: 2700, y: 200, difficulty: 'challenge', zone: 'mid', note: 'High platform' },
      { x: 3000, y: 500, difficulty: 'easy', zone: 'mid' },
      { x: 3300, y: 350, difficulty: 'challenge', zone: 'mid', note: 'Near villager' },
      { x: 3600, y: 400, difficulty: 'challenge', zone: 'mid', note: 'In mud zone' },
      { x: 3900, y: 450, difficulty: 'easy', zone: 'mid' },
      
      // Late zone (4000-6400px): hard, mostly challenge
      { x: 4200, y: 300, difficulty: 'challenge', zone: 'late', note: 'Multiple enemies' },
      { x: 4500, y: 200, difficulty: 'hard', zone: 'late', note: 'Very high' },
      { x: 4800, y: 500, difficulty: 'challenge', zone: 'late' },
      { x: 5100, y: 350, difficulty: 'hard', zone: 'late', note: 'Dense obstacles' },
      { x: 5400, y: 400, difficulty: 'challenge', zone: 'late' },
      { x: 5700, y: 450, difficulty: 'hard', zone: 'late', note: 'Boss approaching' },
      { x: 6000, y: 300, difficulty: 'hard', zone: 'late' },
      { x: 6300, y: 400, difficulty: 'challenge', zone: 'late', note: 'Before cabin' },
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Obstacles (Villagers, Mud zones, etc.)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  obstacles: {
    // Villagers: NPCs that kill player on contact
    villagers: {
      easy: [
        { x: 1000, y: 500, velocity: 50 },   // Slow walking
        { x: 2000, y: 450, velocity: 60 },
        { x: 3500, y: 500, velocity: 50 },
      ],
      normal: [
        { x: 800, y: 500, velocity: 60 },
        { x: 1800, y: 450, velocity: 70 },
        { x: 2500, y: 500, velocity: 60 },
        { x: 3300, y: 480, velocity: 65 },
        { x: 4500, y: 450, velocity: 75 },
        { x: 5200, y: 500, velocity: 70 },
      ],
      hard: [
        { x: 600, y: 500, velocity: 80 },
        { x: 1500, y: 450, velocity: 70 },
        { x: 2300, y: 500, velocity: 75 },
        { x: 3100, y: 480, velocity: 80 },
        { x: 4000, y: 450, velocity: 85 },
        { x: 4700, y: 500, velocity: 80 },
        { x: 5400, y: 480, velocity: 85 },
        { x: 6000, y: 450, velocity: 90 },
      ]
    },

    // Mud zones: areas that slow the player
    mudZones: {
      easy: [
        { x: 500, width: 300, y: 450, height: 100, slowFactor: 0.6 },
        { x: 2000, width: 350, y: 480, height: 80, slowFactor: 0.65 },
      ],
      normal: [
        { x: 400, width: 300, y: 450, height: 100, slowFactor: 0.5 },
        { x: 1500, width: 350, y: 480, height: 80, slowFactor: 0.55 },
        { x: 2800, width: 400, y: 500, height: 100, slowFactor: 0.5 },
        { x: 4200, width: 350, y: 470, height: 90, slowFactor: 0.55 },
      ],
      hard: [
        { x: 300, width: 300, y: 450, height: 100, slowFactor: 0.4 },
        { x: 1200, width: 400, y: 480, height: 90, slowFactor: 0.45 },
        { x: 2400, width: 450, y: 500, height: 100, slowFactor: 0.4 },
        { x: 3600, width: 400, y: 470, height: 110, slowFactor: 0.45 },
        { x: 4800, width: 500, y: 490, height: 100, slowFactor: 0.4 },
        { x: 5800, width: 350, y: 480, height: 95, slowFactor: 0.45 },
      ]
    },

    // Platforms: elevated surfaces player can jump on
    platforms: {
      easy: [
        { x: 1200, y: 350, width: 300, height: 20 },
        { x: 2500, y: 250, width: 280, height: 20 },
      ],
      normal: [
        { x: 1000, y: 320, width: 350, height: 20 },
        { x: 2300, y: 280, width: 320, height: 20 },
        { x: 3700, y: 300, width: 350, height: 20 },
        { x: 4900, y: 250, width: 300, height: 20 },
      ],
      hard: [
        { x: 800, y: 300, width: 350, height: 20 },
        { x: 1800, y: 250, width: 300, height: 20 },
        { x: 2800, y: 200, width: 320, height: 20 },
        { x: 3800, y: 280, width: 350, height: 20 },
        { x: 4700, y: 220, width: 300, height: 20 },
        { x: 5600, y: 280, width: 340, height: 20 },
      ]
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Boss (Farquaad) settings
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  boss: {
    startX: -200,                // Starts off-screen to the left
    startY: 500,
    
    baseSpeed: {
      easy: 120,
      normal: 150,
      hard: 180
    },
    
    maxSpeed: {
      easy: 200,
      normal: 280,
      hard: 350
    },
    
    // Difficulty scaling: boss gets faster over time
    difficultyScaling: {
      easy: 0.02,      // +2% speed per second
      normal: 0.04,    // +4% per second
      hard: 0.06       // +6% per second
    },
    
    // Boss approach warning (audio/visual feedback)
    warningDistance: 300  // Warn when boss is within 300px
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Destination (Cabin)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  destination: {
    x: 6300,
    y: 500,
    width: 100,
    height: 100,
    // Win condition is also: oignons >= collectibles.totalRequired
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Difficulty presets
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  difficulties: {
    easy: {
      label: 'Facile',
      description: 'Pour découvrir le jeu',
      playerSpeed: 200,
      playerJumpPower: 400,
      baseGameSpeed: 1.0
    },
    normal: {
      label: 'Normal',
      description: 'Défi équilibré',
      playerSpeed: 220,
      playerJumpPower: 400,
      baseGameSpeed: 1.1
    },
    hard: {
      label: 'Difficile',
      description: 'Vrai défi pour experts',
      playerSpeed: 200,  // Actually slower to compensate
      playerJumpPower: 380,  // Less jump power
      baseGameSpeed: 1.3
    }
  }
};

/**
 * Helper function: Get obstacle config for selected difficulty
 * @param {string} difficulty - 'easy', 'normal', or 'hard'
 * @returns {object} Obstacle configuration for that difficulty
 */
export function getObstaclesForDifficulty(difficulty) {
  return {
    villagers: LEVEL_CONFIG.obstacles.villagers[difficulty] || [],
    mudZones: LEVEL_CONFIG.obstacles.mudZones[difficulty] || [],
    platforms: LEVEL_CONFIG.obstacles.platforms[difficulty] || []
  };
}

/**
 * Helper function: Get boss config for selected difficulty
 * @param {string} difficulty - 'easy', 'normal', or 'hard'
 * @returns {object} Boss configuration
 */
export function getBossConfigForDifficulty(difficulty) {
  return {
    baseSpeed: LEVEL_CONFIG.boss.baseSpeed[difficulty],
    maxSpeed: LEVEL_CONFIG.boss.maxSpeed[difficulty],
    difficultyScaling: LEVEL_CONFIG.boss.difficultyScaling[difficulty]
  };
}

/**
 * Helper function: Get player stats for difficulty
 * @param {string} difficulty - 'easy', 'normal', or 'hard'
 * @returns {object} Player configuration
 */
export function getPlayerConfigForDifficulty(difficulty) {
  return LEVEL_CONFIG.difficulties[difficulty];
}

export const LEVEL_2_CONFIG = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Level dimensions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  levelWidth: 6000,   // Slightly shorter than Level 1 (6400)
  levelHeight: 600,   // Same height

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Collectibles (Oignons)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  collectibles: {
    totalRequired: 7,  // Win condition: must collect 7+ out of total
    totalInLevel: 20,  // Total oignons in level (castle theme, slightly fewer)

    distribution: [
      // Early zone (0-1500px): 7 easy oignons on main path
      { x: 250, y: 400, difficulty: 'easy', zone: 'early' },
      { x: 500, y: 350, difficulty: 'easy', zone: 'early' },
      { x: 800, y: 420, difficulty: 'easy', zone: 'early' },
      { x: 1100, y: 380, difficulty: 'easy', zone: 'early' },
      { x: 1350, y: 400, difficulty: 'easy', zone: 'early' },
      { x: 1550, y: 360, difficulty: 'easy', zone: 'early' },
      { x: 1750, y: 410, difficulty: 'easy', zone: 'early' },

      // Mid zone (1500-4000px): 8 oignons (all challenge/medium)
      { x: 2000, y: 400, difficulty: 'challenge', zone: 'mid', note: 'Slightly elevated' },
      { x: 2300, y: 320, difficulty: 'challenge', zone: 'mid', note: 'High platform in castle' },
      { x: 2600, y: 480, difficulty: 'challenge', zone: 'mid', note: 'Near spike zone' },
      { x: 2900, y: 250, difficulty: 'challenge', zone: 'mid', note: 'Between spike zones' },
      { x: 3200, y: 400, difficulty: 'challenge', zone: 'mid', note: 'Above spikes' },
      { x: 3500, y: 350, difficulty: 'challenge', zone: 'mid', note: 'Near castle guard' },
      { x: 3800, y: 420, difficulty: 'challenge', zone: 'mid', note: 'In spike corridor' },
      { x: 4100, y: 500, difficulty: 'challenge', zone: 'mid', note: 'Below main platform' },

      // Late zone (4000-6000px): 5 hard oignons (challenging)
      { x: 4400, y: 280, difficulty: 'hard', zone: 'late', note: 'Very high platform' },
      { x: 4800, y: 200, difficulty: 'hard', zone: 'late', note: 'Above spike zone' },
      { x: 5200, y: 450, difficulty: 'hard', zone: 'late', note: 'Dense obstacles' },
      { x: 5600, y: 320, difficulty: 'hard', zone: 'late', note: 'Boss approaching' },
      { x: 5900, y: 380, difficulty: 'hard', zone: 'late', note: 'Before castle exit' },
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Obstacles (Castle Guards, Spike Zones, etc.)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  obstacles: {
    // Castle Guards: NPCs that kill player on contact (replacing villagers)
    castleGuards: {
      easy: [
        { x: 1200, y: 500, velocity: 55 },   // Slow guard
        { x: 2800, y: 480, velocity: 65 },
        { x: 4200, y: 500, velocity: 55 },
      ],
      normal: [
        { x: 1000, y: 500, velocity: 70 },
        { x: 2200, y: 480, velocity: 75 },
        { x: 3400, y: 500, velocity: 70 },
        { x: 4600, y: 480, velocity: 75 },
      ],
      hard: [
        { x: 800, y: 500, velocity: 80 },
        { x: 1800, y: 480, velocity: 85 },
        { x: 2900, y: 500, velocity: 80 },
        { x: 4000, y: 480, velocity: 85 },
        { x: 5000, y: 500, velocity: 85 },
      ]
    },

    // Spike zones: deadly instant-kill obstacles (replacing mud zones)
    spikeZones: {
      easy: [
        { x: 600, width: 250, y: 480, height: 40, deadly: true },
        { x: 2400, width: 300, y: 500, height: 35, deadly: true },
      ],
      normal: [
        { x: 500, width: 300, y: 480, height: 40, deadly: true },
        { x: 1800, width: 280, y: 500, height: 35, deadly: true },
        { x: 3200, width: 320, y: 490, height: 40, deadly: true },
        { x: 4600, width: 300, y: 510, height: 35, deadly: true },
      ],
      hard: [
        { x: 400, width: 320, y: 480, height: 45, deadly: true },
        { x: 1400, width: 350, y: 500, height: 40, deadly: true },
        { x: 2600, width: 300, y: 510, height: 35, deadly: true },
        { x: 3800, width: 330, y: 490, height: 40, deadly: true },
        { x: 4900, width: 350, y: 520, height: 35, deadly: true },
        { x: 5600, width: 300, y: 500, height: 40, deadly: true },
      ]
    },

    // Door obstacles: block paths, require jumping over or timing
    doors: {
      easy: [
        { x: 1600, y: 420, width: 120, height: 180 },
        { x: 3600, y: 420, width: 120, height: 180 },
      ],
      normal: [
        { x: 1500, y: 400, width: 120, height: 200 },
        { x: 2800, y: 420, width: 120, height: 180 },
        { x: 3900, y: 400, width: 120, height: 200 },
      ],
      hard: [
        { x: 1300, y: 380, width: 120, height: 220 },
        { x: 2500, y: 400, width: 120, height: 200 },
        { x: 3600, y: 380, width: 120, height: 220 },
        { x: 4700, y: 400, width: 120, height: 200 },
      ]
    },

    // Platforms: elevated surfaces player can jump on (castle theme)
    platforms: {
      easy: [
        { x: 1100, y: 350, width: 280, height: 20 },
        { x: 2400, y: 280, width: 250, height: 20 },
        { x: 3800, y: 320, width: 300, height: 20 },
      ],
      normal: [
        { x: 900, y: 320, width: 320, height: 20 },
        { x: 2200, y: 270, width: 300, height: 20 },
        { x: 3500, y: 300, width: 320, height: 20 },
        { x: 4700, y: 280, width: 300, height: 20 },
      ],
      hard: [
        { x: 700, y: 300, width: 350, height: 20 },
        { x: 1900, y: 240, width: 320, height: 20 },
        { x: 2900, y: 200, width: 300, height: 20 },
        { x: 4000, y: 260, width: 350, height: 20 },
        { x: 4900, y: 220, width: 300, height: 20 },
        { x: 5600, y: 280, width: 320, height: 20 },
      ]
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Boss (Farquaad) settings — Increased difficulty
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  boss: {
    startX: -200,                // Starts off-screen to the left
    startY: 500,

    baseSpeed: {
      easy: 200,                 // Increased from Level 1 (120)
      normal: 250,               // Increased from Level 1 (150)
      hard: 320                  // Increased from Level 1 (180)
    },

    maxSpeed: {
      easy: 300,                 // Increased from Level 1 (200)
      normal: 390,               // Increased from Level 1 (280)
      hard: 520                  // Increased from Level 1 (350) — matches spec
    },

    // Difficulty scaling: boss gets faster over time (same as Level 1)
    difficultyScaling: {
      easy: 0.02,      // +2% speed per second
      normal: 0.04,    // +4% per second
      hard: 0.06       // +6% per second
    },

    // Boss approach warning (audio/visual feedback)
    warningDistance: 300  // Warn when boss is within 300px
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Destination (Castle Exit/Gate)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  destination: {
    x: 5900,
    y: 500,
    width: 100,
    height: 100,
    // Win condition is also: oignons >= collectibles.totalRequired
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Difficulty presets (castle challenge increases)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  difficulties: {
    easy: {
      label: 'Facile',
      description: 'Château moins menaçant',
      playerSpeed: 200,
      playerJumpPower: 400,
      baseGameSpeed: 1.0
    },
    normal: {
      label: 'Normal',
      description: 'Défi du château',
      playerSpeed: 220,
      playerJumpPower: 400,
      baseGameSpeed: 1.15
    },
    hard: {
      label: 'Difficile',
      description: 'Forteresse impénétrable',
      playerSpeed: 190,  // Slightly slower than Level 1
      playerJumpPower: 380,
      baseGameSpeed: 1.4  // Increased from 1.3 in Level 1
    }
  }
};

/**
 * Helper function: Get Level 2 obstacle config for selected difficulty
 * @param {string} difficulty - 'easy', 'normal', or 'hard'
 * @returns {object} Obstacle configuration for that difficulty
 */
export function getLevel2ObstaclesForDifficulty(difficulty) {
  return {
    castleGuards: LEVEL_2_CONFIG.obstacles.castleGuards[difficulty] || [],
    spikeZones: LEVEL_2_CONFIG.obstacles.spikeZones[difficulty] || [],
    doors: LEVEL_2_CONFIG.obstacles.doors[difficulty] || [],
    platforms: LEVEL_2_CONFIG.obstacles.platforms[difficulty] || []
  };
}

/**
 * Helper function: Get Level 2 boss config for selected difficulty
 * @param {string} difficulty - 'easy', 'normal', or 'hard'
 * @returns {object} Boss configuration
 */
export function getLevel2BossConfigForDifficulty(difficulty) {
  return {
    baseSpeed: LEVEL_2_CONFIG.boss.baseSpeed[difficulty],
    maxSpeed: LEVEL_2_CONFIG.boss.maxSpeed[difficulty],
    difficultyScaling: LEVEL_2_CONFIG.boss.difficultyScaling[difficulty]
  };
}

/**
 * Helper function: Get Level 2 player stats for difficulty
 * @param {string} difficulty - 'easy', 'normal', or 'hard'
 * @returns {object} Player configuration
 */
export function getLevel2PlayerConfigForDifficulty(difficulty) {
  return LEVEL_2_CONFIG.difficulties[difficulty];
}

/**
 * NOTES FOR LEVEL DESIGN AGENT:
 * 
 * 1. When adding new obstacles, follow the structure above (by difficulty)
 * 2. Test that players can get 7+ oignons in all difficulties
 * 3. Ensure difficulty curve is smooth (no sudden spikes)
 * 4. Update this file INSTEAD of hardcoding in Game.js
 * 5. Use the helper functions in Game.js:
 *    - Level 1: const villagers = getObstaclesForDifficulty(difficulty).villagers;
 *    - Level 2: const castleGuards = getLevel2ObstaclesForDifficulty(difficulty).castleGuards;
 * 
 * 6. Spawn oignons from collectibles.distribution[] (don't scatter randomly)
 * 7. Coordinate with Game Mechanics Agent for timing/physics
 * 8. Coordinate with Visual Agent for zone-based rendering
 * 
 * LEVEL 2 SPECIFICS:
 * - Castle Guards replace Villagers (same behavior, castle theme)
 * - Spike Zones replace Mud Zones (instant kill vs slow-down)
 * - Doors are NEW obstacles (block paths, require platforming to avoid)
 * - Farquaad speed increased to 520 px/s max on hard
 * - 20 total oignons: 7 easy + 8 medium + 5 hard
 * - Level width: 6000px (slightly compressed vs Level 1's 6400px)
 */
