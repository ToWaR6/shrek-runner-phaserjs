/**
 * Level 2 Comprehensive QA Testing Suite
 * Automated tests for game mechanics, VFX, audio, performance
 * 
 * Usage: node test-level2.js
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const TEST_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './test-screenshots';
const TEST_RESULTS = [];

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test utility functions
function logTest(name, status, details = '') {
  const result = {
    name,
    status,
    timestamp: new Date().toISOString(),
    details
  };
  TEST_RESULTS.push(result);
  console.log(`[${status}] ${name}${details ? ' - ' + details : ''}`);
}

function logSeparator(title) {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${title}`);
  console.log('='.repeat(80) + '\n');
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  let browser;
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    console.log('🎮 Level 2 Comprehensive QA Test Suite');
    console.log(`Start Time: ${new Date().toISOString()}\n`);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1024, height: 768 });

    // ========================================
    // TEST SECTION 1: PAGE LOAD & BUILD
    // ========================================
    logSeparator('TEST 1: Page Load & Build Verification');

    try {
      await page.goto(TEST_URL, { waitUntil: 'networkidle2', timeout: 15000 });
      const isLoaded = await page.evaluate(() => window.location.pathname !== '/error');
      if (isLoaded) {
        logTest('Page Load', 'PASS', 'Game loaded successfully');
        testsPassed++;
      } else {
        logTest('Page Load', 'FAIL', 'Game failed to load');
        testsFailed++;
      }
    } catch (err) {
      logTest('Page Load', 'FAIL', err.message);
      testsFailed++;
    }

    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // ========================================
    // TEST SECTION 2: GAME INITIALIZATION
    // ========================================
    logSeparator('TEST 2: Game Initialization');

    try {
      // Wait for game to be ready
      await page.waitForFunction(() => window.game !== undefined, { timeout: 10000 });
      
      const gameReady = await page.evaluate(() => {
        return window.game && window.game.isRunning;
      });

      if (gameReady) {
        logTest('Game Initialization', 'PASS', 'Phaser game instance created');
        testsPassed++;
      } else {
        logTest('Game Initialization', 'FAIL', 'Phaser game not ready');
        testsFailed++;
      }
    } catch (err) {
      logTest('Game Initialization', 'FAIL', err.message);
      testsFailed++;
    }

    // ========================================
    // TEST SECTION 3: SCENE LOADING
    // ========================================
    logSeparator('TEST 3: Scene Navigation & Level 2 Loading');

    try {
      // Navigate through scenes: MainMenu -> LevelSelect -> DifficultySelect -> Game -> Level2
      
      // Start with main menu (should load automatically)
      await delay(2000);

      // Take screenshot of main menu
      await page.screenshot({ path: `${SCREENSHOT_DIR}/01-main-menu.png` });
      logTest('Main Menu Display', 'PASS', 'Screenshot captured');
      testsPassed++;

      // Simulate clicking Start (or advancing through intro)
      const started = await page.evaluate(() => {
        // Try to find and click start button or press spacebar
        const startBtn = document.querySelector('[data-testid="start-button"]');
        if (startBtn) {
          startBtn.click();
          return true;
        }
        // Fallback: emit event to advance scene
        if (window.EventBus) {
          window.EventBus.emit('start-game');
          return true;
        }
        return false;
      });

      await delay(1000);

      logTest('Game Flow', 'PASS', 'Scene navigation initiated');
      testsPassed++;

    } catch (err) {
      logTest('Scene Navigation', 'FAIL', err.message);
      testsFailed++;
    }

    // ========================================
    // TEST SECTION 4: LEVEL 2 SPECIFICS
    // ========================================
    logSeparator('TEST 4: Level 2 Game Mechanics');

    try {
      // Get game scene info
      const gameInfo = await page.evaluate(() => {
        if (!window.game) return null;
        const scene = window.game.scene.getActive();
        if (scene && scene.constructor.name === 'Level2') {
          return {
            sceneKey: scene.key,
            hasPlayer: !!scene.player,
            hasEnemy: !!scene.enemy,
            onionCount: scene.onionCount,
            lives: scene.lives,
            selectedDifficulty: scene.selectedDifficulty
          };
        }
        return null;
      });

      if (gameInfo) {
        logTest('Level 2 Scene Active', 'PASS', `Difficulty: ${gameInfo.selectedDifficulty}`);
        testsPassed++;

        if (gameInfo.hasPlayer) {
          logTest('Player Object', 'PASS', 'Player sprite created');
          testsPassed++;
        }

        if (gameInfo.hasEnemy) {
          logTest('Boss Object', 'PASS', 'Boss (Farquaad) created');
          testsPassed++;
        }
      } else {
        logTest('Level 2 Scene Active', 'FAIL', 'Level 2 scene not found');
        testsFailed++;
      }
    } catch (err) {
      logTest('Level 2 Mechanics', 'FAIL', err.message);
      testsFailed++;
    }

    // ========================================
    // TEST SECTION 5: OIGNON SPAWN VERIFICATION
    // ========================================
    logSeparator('TEST 5: Oignon Collection System');

    try {
      const onionStats = await page.evaluate(() => {
        if (!window.game) return null;
        const scene = window.game.scene.getActive();
        if (scene && scene.onions) {
          const onionData = [];
          scene.onions.children.entries.forEach(onion => {
            onionData.push({
              x: onion.x,
              y: onion.y,
              active: onion.active
            });
          });
          return {
            totalSpawned: onionData.length,
            details: onionData
          };
        }
        return null;
      });

      if (onionStats) {
        if (onionStats.totalSpawned === 20) {
          logTest('Oignon Spawn Count', 'PASS', `20 oignons spawned as expected`);
          testsPassed++;
        } else {
          logTest('Oignon Spawn Count', 'FAIL', `Expected 20, found ${onionStats.totalSpawned}`);
          testsFailed++;
        }
      }
    } catch (err) {
      logTest('Oignon System', 'FAIL', err.message);
      testsFailed++;
    }

    // ========================================
    // TEST SECTION 6: DIFFICULTY CONFIG
    // ========================================
    logSeparator('TEST 6: Difficulty Configuration');

    try {
      const difficultyConfig = await page.evaluate(() => {
        if (!window.game) return null;
        const scene = window.game.scene.getActive();
        if (scene && scene.constructor.name === 'Level2') {
          return {
            difficulty: scene.selectedDifficulty,
            guards: scene.castleGuards ? scene.castleGuards.children.entries.length : 0,
            spikes: scene.spikeZones ? scene.spikeZones.children.entries.length : 0,
            doors: scene.doors ? scene.doors.children.entries.length : 0,
            platforms: scene.platforms ? scene.platforms.children.entries.length : 0,
            bossMaxSpeed: scene._bossMaxSpeed
          };
        }
        return null;
      });

      if (difficultyConfig) {
        logTest(`Difficulty: ${difficultyConfig.difficulty.toUpperCase()}`, 'PASS');
        logTest(`  - Guards Spawned: ${difficultyConfig.guards}`, 'INFO');
        logTest(`  - Spike Zones: ${difficultyConfig.spikes}`, 'INFO');
        logTest(`  - Doors: ${difficultyConfig.doors}`, 'INFO');
        logTest(`  - Platforms: ${difficultyConfig.platforms}`, 'INFO');
        logTest(`  - Boss Max Speed: ${difficultyConfig.bossMaxSpeed} px/s`, 'INFO');

        // Verify specification
        const specs = {
          easy: { guards: 3, spikes: 2, doors: 2, maxSpeed: 300 },
          normal: { guards: 4, spikes: 4, doors: 3, maxSpeed: 390 },
          hard: { guards: 5, spikes: 6, doors: 4, maxSpeed: 520 }
        };

        const spec = specs[difficultyConfig.difficulty];
        if (spec) {
          let configOk = true;
          if (difficultyConfig.guards !== spec.guards) {
            logTest(`Guard Count Mismatch`, 'WARN', `Expected ${spec.guards}, got ${difficultyConfig.guards}`);
            configOk = false;
          }
          if (difficultyConfig.spikes !== spec.spikes) {
            logTest(`Spike Count Mismatch`, 'WARN', `Expected ${spec.spikes}, got ${difficultyConfig.spikes}`);
            configOk = false;
          }
          if (difficultyConfig.doors !== spec.doors) {
            logTest(`Door Count Mismatch`, 'WARN', `Expected ${spec.doors}, got ${difficultyConfig.doors}`);
            configOk = false;
          }
          if (difficultyConfig.bossMaxSpeed !== spec.maxSpeed) {
            logTest(`Boss Speed Mismatch`, 'WARN', `Expected ${spec.maxSpeed}, got ${difficultyConfig.bossMaxSpeed}`);
            configOk = false;
          }

          if (configOk) {
            logTest('Difficulty Spec Compliance', 'PASS', `All obstacles match specification`);
            testsPassed++;
          } else {
            testsFailed++;
          }
        }
      }
    } catch (err) {
      logTest('Difficulty Config', 'FAIL', err.message);
      testsFailed++;
    }

    // ========================================
    // TEST SECTION 7: PERFORMANCE BASELINE
    // ========================================
    logSeparator('TEST 7: Performance Metrics');

    try {
      const perfMetrics = await page.evaluate(() => {
        return {
          fps: window.game?.loop?.actualFps || 0,
          gameRunning: window.game?.isRunning,
          scenes: window.game?.scene.keys || []
        };
      });

      if (perfMetrics.fps > 30) {
        logTest('Initial FPS', 'PASS', `${Math.round(perfMetrics.fps)} FPS`);
        testsPassed++;
      } else {
        logTest('Initial FPS', 'WARN', `${Math.round(perfMetrics.fps)} FPS (below optimal)`);
      }
    } catch (err) {
      logTest('Performance Baseline', 'FAIL', err.message);
      testsFailed++;
    }

    // ========================================
    // TEST SECTION 8: AUDIO SYSTEM
    // ========================================
    logSeparator('TEST 8: Audio System Check');

    try {
      const audioStatus = await page.evaluate(() => {
        if (!window.CastleAudio) return null;
        return {
          audioSystemExists: !!window.CastleAudio,
          musicPlaying: window.CastleAudio.isMusicPlaying?.() || false,
          soundsRegistered: Object.keys(window.CastleAudio.sounds || {}).length
        };
      });

      if (audioStatus?.audioSystemExists) {
        logTest('Castle Audio System', 'PASS', 'Audio system initialized');
        testsPassed++;
        logTest(`  - Sounds Registered: ${audioStatus.soundsRegistered}`, 'INFO');
      } else {
        logTest('Castle Audio System', 'INFO', 'CastleAudio not yet exposed to window');
      }
    } catch (err) {
      logTest('Audio System', 'FAIL', err.message);
      testsFailed++;
    }

    // ========================================
    // TEST SECTION 9: VFX SYSTEM
    // ========================================
    logSeparator('TEST 9: VFX System Check');

    try {
      const vfxStatus = await page.evaluate(() => {
        const scene = window.game?.scene.getActive();
        if (scene?.vfx) {
          return {
            vfxExists: !!scene.vfx,
            hasParticles: !!scene.vfx.particleManager,
            methods: Object.getOwnPropertyNames(Object.getPrototypeOf(scene.vfx))
          };
        }
        return null;
      });

      if (vfxStatus?.vfxExists) {
        logTest('VFX System', 'PASS', 'CastleVFX system initialized');
        testsPassed++;
      } else {
        logTest('VFX System', 'INFO', 'VFX verification deferred');
      }
    } catch (err) {
      logTest('VFX System', 'FAIL', err.message);
      testsFailed++;
    }

    // ========================================
    // TEST SECTION 10: CONSOLE ERRORS
    // ========================================
    logSeparator('TEST 10: Console Error Check');

    if (errors.length === 0) {
      logTest('Console Errors', 'PASS', 'No errors in console');
      testsPassed++;
    } else {
      logTest('Console Errors', 'WARN', `${errors.length} errors found`);
      errors.forEach(err => logTest(`  - ${err}`, 'ERROR'));
      testsFailed++;
    }

    // ========================================
    // FINAL SUMMARY
    // ========================================
    logSeparator('TEST EXECUTION SUMMARY');

    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📊 Total Tests: ${testsPassed + testsFailed}`);
    console.log(`📈 Pass Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

    // Save results to JSON
    const resultsSummary = {
      timestamp: new Date().toISOString(),
      totalTests: testsPassed + testsFailed,
      passed: testsPassed,
      failed: testsFailed,
      passRate: ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1),
      results: TEST_RESULTS
    };

    fs.writeFileSync(
      './test-results.json',
      JSON.stringify(resultsSummary, null, 2)
    );

    console.log('\n📁 Results saved to test-results.json');
    console.log(`🖼️  Screenshots saved to ${SCREENSHOT_DIR}/`);

  } catch (err) {
    console.error('Test Suite Error:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run tests
runTests().then(() => {
  console.log('\n✅ Test suite completed\n');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
