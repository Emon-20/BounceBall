/**
 * Bounce Classic - Main Game Controller & Loop
 * Integrates Physics, Entities, Levels, Renderer, Audio, Particles, and UI.
 */

import { sound } from './audio.js';
import { ParticleSystem } from './particles.js';
import { PhysicsEngine } from './physics.js';
import { Ball } from './entities.js';
import { LevelManager } from './levels.js';
import { Renderer } from './renderer.js';
import { UIManager } from './ui.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.container = document.getElementById('game-container');

        // Subsystems
        this.physics = new PhysicsEngine();
        this.particles = new ParticleSystem();
        this.renderer = new Renderer(this.canvas);
        this.levelManager = new LevelManager();

        // Game State
        this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'CLEARED' | 'GAMEOVER'
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.ball = new Ball();

        // Camera
        this.cameraX = 0;
        this.cameraY = 0;

        // Scoring & Stats
        this.score = 0;
        this.coinsCollected = 0;
        this.totalLevelCoins = 0;
        this.levelStartTime = 0;
        this.elapsedTime = 0;

        // UI Manager
        this.ui = new UIManager({
            onPlay: (levelIndex) => this.startLevel(levelIndex),
            onPlayEndless: () => this.startEndless(),
            onSelectLevel: () => this.ui.showScreen('levels'),
            onPause: () => this.pauseGame(),
            onResume: () => this.resumeGame(),
            onRestart: () => this.restartLevel(),
            onNextLevel: () => this.nextLevel(),
            onToggleAudio: () => sound.toggleMute(),
            onToggleMusic: () => sound.toggleMusic(),
            onToggleTheme: () => this.cycleTheme(),
            onToggleScanlines: () => this.renderer.toggleScanlines(),
            getTotalLevels: () => this.levelManager.getTotalLevels()
        });

        // Initialize display buttons state
        this.ui.updateAudioButton(sound.muted);
        this.ui.updateMusicButton(sound.musicMuted);
        this.ui.updateThemeButton(this.renderer.theme);
        if (this.renderer.scanlines) {
            document.getElementById('btn-scanlines')?.classList.add('active');
        }

        // Setup resize and controls
        this.setupWindowResize();
        this.setupInputListeners();

        // Loop timing
        this.lastTime = performance.now();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);

        // Show main menu initially
        this.ui.showScreen('menu');
    }

    setupWindowResize() {
        const resize = () => {
            const w = this.container.clientWidth;
            const h = this.container.clientHeight;
            this.renderer.resize(w, h);
        };
        window.addEventListener('resize', resize);
        resize();
    }

    setupInputListeners() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                e.preventDefault();
                this.handleJumpInput();
            } else if (e.code === 'Escape' || e.code === 'KeyP') {
                e.preventDefault();
                if (this.state === 'PLAYING') {
                    this.pauseGame();
                } else if (this.state === 'PAUSED') {
                    this.resumeGame();
                }
            } else if (e.code === 'KeyR') {
                if (this.state === 'PLAYING' || this.state === 'GAMEOVER') {
                    this.restartLevel();
                }
            }
        });

        // Touch & Mouse tap controls on canvas and container
        const handleTap = (e) => {
            if (this.state === 'PLAYING') {
                // If clicked on HUD button, don't jump
                if (e.target.closest('#btn-hud-pause') || e.target.closest('button')) {
                    return;
                }
                this.handleJumpInput();
            }
        };

        this.canvas.addEventListener('pointerdown', handleTap);
        // Dedicated on-screen mobile jump button
        document.getElementById('btn-screen-jump')?.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.handleJumpInput();
        });
    }

    handleJumpInput() {
        sound.init(); // Unlock AudioContext on user gesture
        if (this.state !== 'PLAYING') return;

        const jumped = this.physics.triggerJump(this.ball);
        if (jumped) {
            if (this.ball.activeTool === 'superJump') {
                sound.playSuperJump();
            } else {
                sound.playJump();
            }
            this.particles.createDustPuff(this.ball.x, this.ball.y + this.ball.radius, 7);
        }
    }

    startLevel(index) {
        sound.init();
        sound.startMusic();
        this.currentLevelIndex = index;
        this.currentLevel = this.levelManager.getLevel(index);
        this.initLevelState();
    }

    startEndless() {
        sound.init();
        sound.startMusic();
        this.currentLevelIndex = 99;
        this.currentLevel = this.levelManager.createEndlessLevel();
        this.initLevelState();
    }

    initLevelState() {
        this.state = 'PLAYING';
        this.score = 0;
        this.coinsCollected = 0;
        this.totalLevelCoins = this.currentLevel.coins.length;
        this.levelStartTime = performance.now();
        this.elapsedTime = 0;

        this.ball.reset(this.currentLevel.startX, this.currentLevel.startY);
        this.cameraX = this.ball.x - 200;
        this.cameraY = 0;
        this.particles.reset();

        this.ui.showScreen('none');
        this.updateHUD();
    }

    restartLevel() {
        if (this.currentLevelIndex === 99) {
            this.startEndless();
        } else {
            this.startLevel(this.currentLevelIndex);
        }
    }

    nextLevel() {
        const nextIdx = this.currentLevelIndex + 1;
        if (nextIdx < this.levelManager.getTotalLevels()) {
            this.startLevel(nextIdx);
        } else {
            // Completed all levels! Loop to level 1 or endless
            this.ui.showScreen('menu');
        }
    }

    pauseGame() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.ui.showScreen('pause');
        }
    }

    resumeGame() {
        if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.ui.showScreen('none');
            this.lastTime = performance.now();
        }
    }

    cycleTheme() {
        const themes = ['classic', 'nokia', 'cyber'];
        const nextIdx = (themes.indexOf(this.renderer.theme) + 1) % themes.length;
        const newTheme = themes[nextIdx];
        this.renderer.setTheme(newTheme);
        return newTheme;
    }

    /**
     * Main animation frame loop
     */
    loop(currentTime) {
        requestAnimationFrame(this.loop);

        let dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap dt to prevent physics tunneling upon frame hitch or background tab
        if (dt > 0.05) dt = 0.05;

        if (this.state === 'PLAYING') {
            this.update(dt);
        }

        // Always update renderer and visual effects
        this.renderer.update(dt);
        this.particles.update(dt);

        // Render current scene
        this.renderer.render({
            cameraX: this.cameraX,
            cameraY: this.cameraY,
            level: this.currentLevel,
            ball: this.ball,
            particles: this.particles
        });
    }

    /**
     * Fixed-rate logic & physics update
     */
    update(dt) {
        this.elapsedTime = (performance.now() - this.levelStartTime) / 1000;

        // 1. Update ball physics
        this.physics.updateBall(this.ball, dt);

        // Check if ball fell below map abyss
        if (this.ball.y > 550) {
            this.triggerGameOver();
            return;
        }

        // Particle trail
        this.particles.createTrailParticle(this.ball.x, this.ball.y, this.ball.radius, this.ball.activeTool);

        // 2. Endless mode extension
        if (this.currentLevel.isEndless) {
            this.levelManager.extendEndless(this.currentLevel, this.ball.x);
        }

        // 3. Update level entities
        this.currentLevel.finishLine?.update(dt);

        for (const obs of this.currentLevel.obstacles) {
            obs.update(dt);
        }

        for (const coin of this.currentLevel.coins) {
            coin.update(dt);
        }

        for (const tool of this.currentLevel.powerUps) {
            tool.update(dt);
        }

        // 4. Resolve Ground Collisions
        let landedAny = false;
        for (const seg of this.currentLevel.ground) {
            const res = this.physics.resolveCircleAABB(this.ball, seg);
            if (res) {
                if (res.type === 'bounce') {
                    sound.playBounce(res.impact);
                    this.particles.createDustPuff(this.ball.x, this.ball.y + this.ball.radius, 4);
                } else if (res.type === 'jumped') {
                    if (this.ball.activeTool === 'superJump') {
                        sound.playSuperJump();
                    } else {
                        sound.playJump();
                    }
                    this.particles.createDustPuff(this.ball.x, this.ball.y + this.ball.radius, 6);
                } else if (res.type === 'land') {
                    landedAny = true;
                }
            }
        }
        if (!landedAny && this.ball.onGround && this.ball.vy !== 0) {
            this.ball.onGround = false;
        }

        // 5. Resolve Obstacle & Moving Platform Collisions
        for (const obs of this.currentLevel.obstacles) {
            if (obs.broken) continue;

            if (obs.type === 'spike') {
                if (this.physics.checkSpikeCollision(this.ball, obs)) {
                    this.triggerGameOver();
                    return;
                }
            } else if (obs.type === 'block' || obs.type === 'moving_platform' || obs.type === 'tunnel_roof') {
                const res = this.physics.resolveCircleAABB(this.ball, obs);
                if (res) {
                    if (res.type === 'bounce') {
                        sound.playBounce(res.impact);
                    } else if (res.type === 'jumped') {
                        if (this.ball.activeTool === 'superJump') {
                            sound.playSuperJump();
                        } else {
                            sound.playJump();
                        }
                    } else if (res.type === 'wall_hit_front') {
                        // Crashed head-on into wall!
                        this.triggerGameOver();
                        return;
                    }
                }
            } else if (obs.type === 'breakable') {
                const res = this.physics.resolveCircleAABB(this.ball, obs);
                if (res) {
                    if (this.ball.activeTool === 'growth') {
                        // Smashed through with Growth Tool!
                        obs.broken = true;
                        sound.playSmash();
                        this.renderer.triggerShake(7, 0.25);
                        this.particles.createBlockDebris(obs.x, obs.y, obs.w, obs.h);
                        this.score += 250;
                    } else {
                        // Normal ball crashes into breakable wall!
                        this.triggerGameOver();
                        return;
                    }
                }
            } else if (obs.type === 'crusher') {
                // Crusher hits ball
                const res = this.physics.resolveCircleAABB(this.ball, obs);
                if (res) {
                    this.triggerGameOver();
                    return;
                }
            }
        }

        // 6. Collectible Coins
        for (const coin of this.currentLevel.coins) {
            if (!coin.collected && this.physics.checkCircleCircle(this.ball, coin)) {
                coin.collected = true;
                this.coinsCollected++;
                this.score += coin.value;
                sound.playCoin();
                this.particles.createCoinSparkles(coin.x, coin.y);
            }
        }

        // 7. Power-Up Tools
        for (const tool of this.currentLevel.powerUps) {
            if (!tool.collected && this.physics.checkCircleCircle(this.ball, tool)) {
                tool.collected = true;
                this.ball.applyTool(tool.type, tool.duration);
                sound.playPowerUp(tool.type);
                this.particles.createPowerUpBurst(tool.x, tool.y, tool.type);
                this.renderer.triggerShake(4, 0.15);
            }
        }

        // 8. Finishing Line Trigger
        if (this.currentLevel.finishLine && !this.ball.hasFinished) {
            const fl = this.currentLevel.finishLine;
            if (this.ball.x >= fl.x + 20) {
                this.triggerLevelComplete();
                return;
            }
        }

        // 9. Camera Tracking
        const targetCamX = this.ball.x - 220;
        this.cameraX += (targetCamX - this.cameraX) * Math.min(1, 10 * dt);

        // 10. Update HUD
        this.updateHUD();
    }

    updateHUD() {
        const progress = this.currentLevel.isEndless ?
            (this.ball.x / 10000) % 1.0 :
            Math.min(1.0, (this.ball.x - this.currentLevel.startX) / (this.currentLevel.finishX - this.currentLevel.startX));

        this.ui.updateHUD(
            this.score,
            this.coinsCollected,
            progress,
            this.ball.activeTool,
            this.ball.toolTimer,
            this.ball.toolDuration,
            this.currentLevel
        );
    }

    triggerGameOver() {
        this.ball.isDead = true;
        this.state = 'GAMEOVER';
        sound.playPop();
        this.renderer.triggerShake(12, 0.35);
        this.particles.createBallPop(this.ball.x, this.ball.y, this.ball.radius);

        const distanceMeters = Math.max(0, Math.floor((this.ball.x - this.currentLevel.startX) / 10));

        setTimeout(() => {
            this.ui.showGameOver({
                score: this.score,
                coins: this.coinsCollected,
                distance: distanceMeters
            });
        }, 650);
    }

    triggerLevelComplete() {
        this.ball.hasFinished = true;
        this.state = 'CLEARED';
        sound.playWin();
        this.particles.createConfetti(this.ball.x + 40, this.ball.y - 40, 80);

        const timeSeconds = this.elapsedTime.toFixed(1);

        setTimeout(() => {
            this.ui.showLevelCleared({
                levelIndex: this.currentLevelIndex,
                score: this.score,
                coins: this.coinsCollected,
                totalCoins: this.totalLevelCoins,
                time: timeSeconds
            });
        }, 900);
    }
}

// Instantiate game on page load
window.addEventListener('DOMContentLoaded', () => {
    window.bounceGame = new Game();
});
