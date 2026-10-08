/* ============================================================
   NEON BOUNCE — game.js
   Complete game engine: physics, 5 levels, rendering, UI
   ============================================================ */

(function () {
    "use strict";

    // ───────── Constants ─────────
    const GRAVITY = 0.55;
    const JUMP_FORCE = -11.5;
    const MOVE_ACCEL = 0.6;
    const FRICTION = 0.88;
    const FRICTION_ICE = 0.965;
    const MAX_SPEED = 7;
    const BALL_RADIUS = 18;
    const CAMERA_LEAD = 0.12;
    const SCROLL_MARGIN = 0.35;

    // ───────── Color Palette ─────────
    const C = {
        bgGrad1: "#08080e",
        bgGrad2: "#10101e",
        floor: "#1a1a2e",
        floorTop: "#00f0ff",
        platform: "#1e1e36",
        platformTop: "#a040ff",
        spike: "#ff2c5c",
        spikeGlow: "rgba(255,44,92,0.4)",
        ring: "#ffd700",
        ringGlow: "rgba(255,215,0,0.5)",
        exit: "#ff2cf0",
        exitUnlocked: "#00ff88",
        ball: "#00f0ff",
        ballInner: "rgba(0,240,255,0.25)",
        ballGlow: "rgba(0,240,255,0.35)",
        obstacle: "#ff6f00",
        obstacleGlow: "rgba(255,111,0,0.35)",
        switchOff: "#555580",
        switchOn: "#00ff88",
        gate: "#ff2cf0",
        gateOpen: "rgba(0,255,136,0.15)",
        slippery: "#44aaff",
        tunnel: "#2a1a40",
        particle: "#00f0ff",
        checkpoint: "#00ff88",
    };

    // ───────── Utility ─────────
    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function circleRect(cx, cy, r, rx, ry, rw, rh) {
        const nearX = clamp(cx, rx, rx + rw);
        const nearY = clamp(cy, ry, ry + rh);
        const dx = cx - nearX, dy = cy - nearY;
        return dx * dx + dy * dy <= r * r;
    }

    // ───────── Particle Pool ─────────
    class ParticlePool {
        constructor(max) {
            this.pool = [];
            this.max = max;
        }
        emit(x, y, count, color, speed, life) {
            for (let i = 0; i < count; i++) {
                if (this.pool.length >= this.max) this.pool.shift();
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * speed + 1;
                this.pool.push({
                    x, y,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd - 2,
                    life: life + Math.random() * life * 0.5,
                    maxLife: life,
                    color,
                    r: Math.random() * 3 + 1,
                });
            }
        }
        update() {
            for (let i = this.pool.length - 1; i >= 0; i--) {
                const p = this.pool[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08;
                p.life--;
                if (p.life <= 0) this.pool.splice(i, 1);
            }
        }
        draw(ctx, camX) {
            for (const p of this.pool) {
                const alpha = clamp(p.life / p.maxLife, 0, 1);
                ctx.globalAlpha = alpha * 0.8;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x - camX, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  LEVEL BUILDER
    // ═══════════════════════════════════════════════════════════

    function buildLevels(floorY) {
        const levels = [];

        // ──── LEVEL 1: Tutorial ────
        levels.push({
            name: "Tutorial",
            width: 3500,
            requiredRings: 5,
            slippery: false,
            platforms: [
                { x: 600, y: floorY - 110, w: 200, h: 18 },
                { x: 1200, y: floorY - 130, w: 180, h: 18 },
                { x: 2000, y: floorY - 100, w: 250, h: 18 },
                { x: 2600, y: floorY - 140, w: 200, h: 18 },
            ],
            spikes: [
                { x: 800, y: floorY - 20, w: 60, h: 20 },
                { x: 1600, y: floorY - 20, w: 80, h: 20 },
                { x: 2400, y: floorY - 20, w: 60, h: 20 },
            ],
            rings: [
                { x: 400, y: floorY - 50 },
                { x: 700, y: floorY - 140 },
                { x: 1300, y: floorY - 170 },
                { x: 1900, y: floorY - 50 },
                { x: 2700, y: floorY - 180 },
            ],
            obstacles: [],
            switches: [],
            gates: [],
            tunnels: [],
            checkpoints: [{ x: 1500, y: floorY - 40 }],
            exitX: 3300,
        });

        // ──── LEVEL 2: Verticality ────
        levels.push({
            name: "Verticality",
            width: 4200,
            requiredRings: 7,
            slippery: false,
            platforms: [
                { x: 400, y: floorY - 120, w: 220, h: 18 },
                { x: 750, y: floorY - 200, w: 180, h: 18 },
                { x: 1100, y: floorY - 140, w: 260, h: 18 },
                { x: 1500, y: floorY - 220, w: 200, h: 18 },
                { x: 1900, y: floorY - 100, w: 300, h: 18 },
                { x: 2400, y: floorY - 180, w: 200, h: 18 },
                { x: 2800, y: floorY - 250, w: 180, h: 18 },
                { x: 3200, y: floorY - 130, w: 250, h: 18 },
                { x: 3600, y: floorY - 200, w: 200, h: 18 },
            ],
            spikes: [
                { x: 600, y: floorY - 20, w: 100, h: 20 },
                { x: 1350, y: floorY - 20, w: 80, h: 20 },
                { x: 2100, y: floorY - 20, w: 120, h: 20 },
                { x: 2700, y: floorY - 20, w: 80, h: 20 },
                { x: 3400, y: floorY - 20, w: 100, h: 20 },
            ],
            rings: [
                { x: 500, y: floorY - 160 },
                { x: 850, y: floorY - 240 },
                { x: 1200, y: floorY - 180 },
                { x: 1600, y: floorY - 260 },
                { x: 2050, y: floorY - 50 },
                { x: 2500, y: floorY - 220 },
                { x: 3700, y: floorY - 240 },
            ],
            obstacles: [],
            switches: [],
            gates: [],
            tunnels: [],
            checkpoints: [
                { x: 1400, y: floorY - 40 },
                { x: 2800, y: floorY - 40 },
            ],
            exitX: 4000,
        });

        // ──── LEVEL 3: Hazards & Timing ────
        levels.push({
            name: "Hazards & Timing",
            width: 4800,
            requiredRings: 8,
            slippery: false,
            platforms: [
                { x: 500, y: floorY - 100, w: 200, h: 18 },
                { x: 1000, y: floorY - 160, w: 200, h: 18 },
                { x: 1600, y: floorY - 120, w: 240, h: 18 },
                { x: 2200, y: floorY - 180, w: 200, h: 18 },
                { x: 2700, y: floorY - 100, w: 300, h: 18 },
                { x: 3300, y: floorY - 200, w: 200, h: 18 },
                { x: 3800, y: floorY - 130, w: 250, h: 18 },
            ],
            spikes: [
                { x: 700, y: floorY - 20, w: 80, h: 20 },
                { x: 1400, y: floorY - 20, w: 100, h: 20 },
                { x: 2000, y: floorY - 20, w: 80, h: 20 },
                { x: 3100, y: floorY - 20, w: 120, h: 20 },
                { x: 3600, y: floorY - 20, w: 80, h: 20 },
            ],
            rings: [
                { x: 350, y: floorY - 50 },
                { x: 600, y: floorY - 140 },
                { x: 1100, y: floorY - 200 },
                { x: 1700, y: floorY - 160 },
                { x: 2300, y: floorY - 220 },
                { x: 2900, y: floorY - 50 },
                { x: 3400, y: floorY - 240 },
                { x: 4200, y: floorY - 50 },
            ],
            obstacles: [
                { x: 900, y: floorY - 80, w: 50, h: 50, moveAxis: "y", moveRange: 80, speed: 0.025 },
                { x: 1800, y: floorY - 60, w: 60, h: 40, moveAxis: "x", moveRange: 120, speed: 0.02 },
                { x: 2500, y: floorY - 90, w: 50, h: 50, moveAxis: "y", moveRange: 100, speed: 0.03 },
                { x: 3500, y: floorY - 70, w: 60, h: 40, moveAxis: "x", moveRange: 100, speed: 0.022 },
                { x: 4000, y: floorY - 80, w: 50, h: 50, moveAxis: "y", moveRange: 90, speed: 0.028 },
            ],
            switches: [],
            gates: [],
            tunnels: [],
            checkpoints: [
                { x: 1500, y: floorY - 40 },
                { x: 3000, y: floorY - 40 },
            ],
            exitX: 4600,
        });

        // ──── LEVEL 4: Momentum & Puzzles ────
        levels.push({
            name: "Momentum & Puzzles",
            width: 5000,
            requiredRings: 8,
            slippery: true,
            platforms: [
                { x: 400, y: floorY - 110, w: 160, h: 18 },
                { x: 800, y: floorY - 180, w: 130, h: 18 },
                { x: 1300, y: floorY - 130, w: 200, h: 18 },
                { x: 1800, y: floorY - 200, w: 150, h: 18 },
                { x: 2300, y: floorY - 110, w: 220, h: 18 },
                { x: 2800, y: floorY - 170, w: 160, h: 18 },
                { x: 3300, y: floorY - 220, w: 140, h: 18 },
                { x: 3700, y: floorY - 130, w: 200, h: 18 },
                { x: 4200, y: floorY - 160, w: 180, h: 18 },
            ],
            spikes: [
                { x: 600, y: floorY - 20, w: 80, h: 20 },
                { x: 1100, y: floorY - 20, w: 100, h: 20 },
                { x: 1600, y: floorY - 20, w: 80, h: 20 },
                { x: 2600, y: floorY - 20, w: 100, h: 20 },
                { x: 3500, y: floorY - 20, w: 80, h: 20 },
                { x: 4100, y: floorY - 20, w: 100, h: 20 },
            ],
            rings: [
                { x: 500, y: floorY - 150 },
                { x: 900, y: floorY - 220 },
                { x: 1400, y: floorY - 170 },
                { x: 1900, y: floorY - 240 },
                { x: 2400, y: floorY - 50 },
                { x: 2900, y: floorY - 210 },
                { x: 3800, y: floorY - 170 },
                { x: 4300, y: floorY - 200 },
            ],
            obstacles: [
                { x: 1000, y: floorY - 60, w: 40, h: 40, moveAxis: "x", moveRange: 80, speed: 0.03 },
                { x: 2100, y: floorY - 80, w: 40, h: 40, moveAxis: "y", moveRange: 70, speed: 0.025 },
                { x: 3100, y: floorY - 70, w: 50, h: 40, moveAxis: "x", moveRange: 100, speed: 0.028 },
            ],
            tunnels: [
                { x: 1500, y: floorY - 65, w: 250, h: 65 },
                { x: 3400, y: floorY - 60, w: 200, h: 60 },
            ],
            switches: [],
            gates: [],
            checkpoints: [
                { x: 1200, y: floorY - 40 },
                { x: 2500, y: floorY - 40 },
                { x: 3800, y: floorY - 40 },
            ],
            exitX: 4800,
        });

        // ──── LEVEL 5: The Finale ────
        levels.push({
            name: "The Finale",
            width: 5800,
            requiredRings: 6,
            slippery: false,
            platforms: [
                { x: 500, y: floorY - 120, w: 200, h: 18 },
                { x: 1000, y: floorY - 200, w: 180, h: 18 },
                { x: 1500, y: floorY - 140, w: 220, h: 18 },
                { x: 2000, y: floorY - 220, w: 200, h: 18 },
                { x: 2600, y: floorY - 110, w: 300, h: 18 },
                { x: 3200, y: floorY - 180, w: 200, h: 18 },
                { x: 3700, y: floorY - 250, w: 160, h: 18 },
                { x: 4200, y: floorY - 130, w: 240, h: 18 },
                { x: 4700, y: floorY - 200, w: 200, h: 18 },
                { x: 5100, y: floorY - 150, w: 220, h: 18 },
            ],
            spikes: [
                { x: 700, y: floorY - 20, w: 100, h: 20 },
                { x: 1300, y: floorY - 20, w: 80, h: 20 },
                { x: 1800, y: floorY - 20, w: 100, h: 20 },
                { x: 2400, y: floorY - 20, w: 80, h: 20 },
                { x: 3000, y: floorY - 20, w: 120, h: 20 },
                { x: 3500, y: floorY - 20, w: 80, h: 20 },
                { x: 4500, y: floorY - 20, w: 100, h: 20 },
                { x: 5000, y: floorY - 20, w: 80, h: 20 },
            ],
            rings: [
                { x: 600, y: floorY - 160 },
                { x: 1100, y: floorY - 240 },
                { x: 2100, y: floorY - 260 },
                { x: 3300, y: floorY - 220 },
                { x: 4300, y: floorY - 170 },
                { x: 5200, y: floorY - 190 },
            ],
            obstacles: [
                { x: 900, y: floorY - 80, w: 50, h: 50, moveAxis: "y", moveRange: 80, speed: 0.03 },
                { x: 1600, y: floorY - 60, w: 60, h: 40, moveAxis: "x", moveRange: 120, speed: 0.025 },
                { x: 2300, y: floorY - 90, w: 50, h: 50, moveAxis: "y", moveRange: 100, speed: 0.035 },
                { x: 3400, y: floorY - 70, w: 60, h: 40, moveAxis: "x", moveRange: 100, speed: 0.028 },
                { x: 4600, y: floorY - 80, w: 50, h: 50, moveAxis: "y", moveRange: 90, speed: 0.032 },
                { x: 5100, y: floorY - 70, w: 60, h: 40, moveAxis: "x", moveRange: 80, speed: 0.03 },
            ],
            switches: [
                { x: 1700, y: floorY - 30, w: 40, h: 30, id: "gate1" },
                { x: 3600, y: floorY - 30, w: 40, h: 30, id: "gate2" },
            ],
            gates: [
                { x: 2550, y: floorY - 200, w: 20, h: 200, switchId: "gate1" },
                { x: 4650, y: floorY - 200, w: 20, h: 200, switchId: "gate2" },
            ],
            tunnels: [],
            checkpoints: [
                { x: 1400, y: floorY - 40 },
                { x: 2800, y: floorY - 40 },
                { x: 4200, y: floorY - 40 },
            ],
            exitX: 5600,
        });

        return levels;
    }

    // ═══════════════════════════════════════════════════════════
    //  MAIN GAME CLASS
    // ═══════════════════════════════════════════════════════════

    class Game {
        constructor() {
            // Canvas
            this.canvas = document.getElementById("game-canvas");
            this.ctx = this.canvas.getContext("2d");

            // State
            this.state = "menu";
            this.currentLevel = 0;
            this.totalScore = 0;
            this.unlockedLevels = 1;
            this.particles = new ParticlePool(300);
            this.time = 0;

            // Runtime arrays (populated per-level)
            this.activeRings = [];
            this.activeSpikes = [];
            this.activeObstacles = [];
            this.activeSwitches = [];
            this.activeGates = [];
            this.activeTunnels = [];
            this.activeCheckpoints = [];
            this.exitUnlocked = false;
            this.exitFlash = 0;
            this.showUnlockTimer = 0;
            this.ringsCollected = 0;
            this.levelScore = 0;
            this.camX = 0;
            this.camTargetX = 0;
            this.ball = null;

            // Load saved progress
            try {
                const save = JSON.parse(localStorage.getItem("neonbounce_save"));
                if (save) {
                    this.unlockedLevels = save.unlocked || 1;
                    this.totalScore = save.totalScore || 0;
                }
            } catch (e) { /* ignore corrupt save */ }

            // Input
            this.keys = {};
            this.touchInput = { left: false, right: false, jump: false };

            // Sizing — sets this.W, this.H, this.floorY, this.levels
            this.resize();
            window.addEventListener("resize", () => this.resize());

            // Wire up input and UI
            this.setupInput();
            this.setupUI();

            // Show main menu and start the game loop
            this.showScreen("menu");
            requestAnimationFrame(() => this.loop());
        }

        // ───────── Canvas Sizing ─────────
        resize() {
            const dpr = window.devicePixelRatio || 1;
            this.W = this.canvas.clientWidth;
            this.H = this.canvas.clientHeight;
            this.canvas.width = this.W * dpr;
            this.canvas.height = this.H * dpr;
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.floorY = this.H - 60;
            this.levels = buildLevels(this.floorY);
        }

        // ───────── Input Binding ─────────
        setupInput() {
            window.addEventListener("keydown", e => {
                this.keys[e.code] = true;
                if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW"].includes(e.code)) {
                    e.preventDefault();
                }
            });
            window.addEventListener("keyup", e => { this.keys[e.code] = false; });

            // Touch / mouse controls
            const bindBtn = (id, prop) => {
                const el = document.getElementById(id);
                if (!el) return;
                const onStart = (e) => { e.preventDefault(); this.touchInput[prop] = true; el.classList.add("active"); };
                const onEnd = (e) => { e.preventDefault(); this.touchInput[prop] = false; el.classList.remove("active"); };
                el.addEventListener("touchstart", onStart, { passive: false });
                el.addEventListener("mousedown", onStart);
                el.addEventListener("touchend", onEnd, { passive: false });
                el.addEventListener("touchcancel", onEnd, { passive: false });
                el.addEventListener("mouseup", onEnd);
                el.addEventListener("mouseleave", onEnd);
            };
            bindBtn("btn-left", "left");
            bindBtn("btn-right", "right");
            bindBtn("btn-jump", "jump");
        }

        get inputLeft()  { return this.keys["ArrowLeft"]  || this.keys["KeyA"] || this.touchInput.left; }
        get inputRight() { return this.keys["ArrowRight"] || this.keys["KeyD"] || this.touchInput.right; }
        get inputJump()  { return this.keys["Space"] || this.keys["ArrowUp"] || this.keys["KeyW"] || this.touchInput.jump; }

        // ───────── UI Wiring ─────────
        setupUI() {
            // Cache DOM refs
            this.ui = {
                hud:           document.getElementById("hud"),
                hudLevel:      document.getElementById("hud-level"),
                ringCount:     document.getElementById("ring-count"),
                ringTotal:     document.getElementById("ring-total"),
                scoreVal:      document.getElementById("score-val"),
                unlockNotify:  document.getElementById("unlock-notify"),
                touchControls: document.getElementById("touch-controls"),
                screenMenu:    document.getElementById("screen-menu"),
                screenLevels:  document.getElementById("screen-levels"),
                screenCleared: document.getElementById("screen-cleared"),
                screenComplete:document.getElementById("screen-complete"),
                levelGrid:     document.getElementById("level-grid"),
                clearedStats:  document.getElementById("cleared-stats"),
                completeStats: document.getElementById("complete-stats"),
            };

            // Button handlers
            this.addClick("btn-play", () => this.startLevel(0));
            this.addClick("btn-levels", () => this.showScreen("levels"));
            this.addClick("btn-back-menu", () => this.showScreen("menu"));
            this.addClick("btn-back-menu2", () => this.showScreen("menu"));
            this.addClick("btn-next-level", () => {
                if (this.currentLevel + 1 < this.levels.length) {
                    this.startLevel(this.currentLevel + 1);
                } else {
                    this.showScreen("complete");
                }
            });
            this.addClick("btn-replay", () => {
                this.totalScore = 0;
                this.startLevel(0);
            });
            this.addClick("btn-complete-menu", () => this.showScreen("menu"));
        }

        /** Safe click listener helper */
        addClick(id, fn) {
            const el = document.getElementById(id);
            if (el) el.addEventListener("click", fn);
        }

        // ───────── Screen Management ─────────
        showScreen(screen) {
            this.state = screen;

            // Hide everything
            const allScreens = [
                this.ui.screenMenu,
                this.ui.screenLevels,
                this.ui.screenCleared,
                this.ui.screenComplete,
            ];
            allScreens.forEach(s => { if (s) s.classList.add("hidden"); });
            if (this.ui.hud)           this.ui.hud.classList.add("hidden");
            if (this.ui.touchControls) this.ui.touchControls.classList.add("hidden");
            if (this.ui.unlockNotify)  this.ui.unlockNotify.classList.add("hidden");

            // Show the right screen
            switch (screen) {
                case "menu":
                    this.ui.screenMenu.classList.remove("hidden");
                    break;
                case "levels":
                    this.buildLevelGrid();
                    this.ui.screenLevels.classList.remove("hidden");
                    break;
                case "cleared":
                    this.ui.screenCleared.classList.remove("hidden");
                    break;
                case "complete":
                    this.ui.completeStats.innerHTML = "Total Score: " + this.totalScore;
                    this.ui.screenComplete.classList.remove("hidden");
                    break;
            }
        }

        buildLevelGrid() {
            const grid = this.ui.levelGrid;
            grid.innerHTML = "";
            for (let i = 0; i < this.levels.length; i++) {
                const card = document.createElement("div");
                const locked = i >= this.unlockedLevels;
                card.className = "level-card" + (locked ? " locked" : "");
                card.innerHTML =
                    '<span>' + (i + 1) + '</span>' +
                    '<span class="level-label">' + this.levels[i].name + '</span>';
                if (!locked) {
                    const idx = i; // closure capture
                    card.addEventListener("click", () => this.startLevel(idx));
                }
                grid.appendChild(card);
            }
        }

        // ───────── Level Initialization ─────────
        startLevel(idx) {
            this.currentLevel = idx;
            const lvl = this.levels[idx];
            if (!lvl) return; // safety guard

            // Clone mutable state from level definition
            this.activeRings = lvl.rings.map(r => ({
                ...r,
                collected: false,
                bobPhase: Math.random() * Math.PI * 2,
            }));
            this.activeSpikes = lvl.spikes.map(s => ({ ...s }));
            this.activeObstacles = lvl.obstacles.map(o => ({
                ...o,
                baseX: o.x,
                baseY: o.y,
                phase: Math.random() * Math.PI * 2,
            }));
            this.activeSwitches = lvl.switches.map(s => ({ ...s, activated: false }));
            this.activeGates = lvl.gates.map(g => ({ ...g, open: false }));
            this.activeTunnels = lvl.tunnels.map(t => ({ ...t }));
            this.activeCheckpoints = lvl.checkpoints.map(c => ({ ...c, activated: false }));

            this.exitUnlocked = false;
            this.exitFlash = 0;
            this.showUnlockTimer = 0;
            this.ringsCollected = 0;
            this.levelScore = 0;

            // Ball spawn
            this.ball = {
                x: 100,
                y: this.floorY - BALL_RADIUS,
                vx: 0,
                vy: 0,
                grounded: true,
                angle: 0,
                jumpHeld: false,
                spawnX: 100,
                spawnY: this.floorY - BALL_RADIUS,
                hurtTimer: 0,
            };

            this.camX = 0;
            this.camTargetX = 0;

            // Switch to playing state: hide all screens, show HUD + touch controls
            this.state = "playing";
            const allScreens = [
                this.ui.screenMenu,
                this.ui.screenLevels,
                this.ui.screenCleared,
                this.ui.screenComplete,
            ];
            allScreens.forEach(s => { if (s) s.classList.add("hidden"); });
            this.ui.hud.classList.remove("hidden");
            this.ui.touchControls.classList.remove("hidden");
            this.ui.unlockNotify.classList.add("hidden");

            // Update HUD values
            this.ui.hudLevel.textContent = "Level " + (idx + 1);
            this.ui.ringTotal.textContent = lvl.requiredRings;
            this.ui.ringCount.textContent = "0";
            this.ui.scoreVal.textContent = this.totalScore;
        }

        // ───────── Main Loop ─────────
        loop() {
            this.update();
            this.render();
            requestAnimationFrame(() => this.loop());
        }

        // ═══════════════════════════════════════════════════════
        //  UPDATE
        // ═══════════════════════════════════════════════════════
        update() {
            this.time++;
            this.particles.update();

            if (this.state !== "playing") return;

            const lvl = this.levels[this.currentLevel];
            if (!lvl || !this.ball) return;

            const ball = this.ball;
            const friction = lvl.slippery ? FRICTION_ICE : FRICTION;

            // ── Movement ──
            if (this.inputLeft)  ball.vx -= MOVE_ACCEL;
            if (this.inputRight) ball.vx += MOVE_ACCEL;
            ball.vx *= friction;
            ball.vx = clamp(ball.vx, -MAX_SPEED, MAX_SPEED);

            // ── Jump (single press) ──
            if (this.inputJump && ball.grounded && !ball.jumpHeld) {
                ball.vy = JUMP_FORCE;
                ball.grounded = false;
                ball.jumpHeld = true;
                this.particles.emit(ball.x, ball.y + BALL_RADIUS, 8, C.particle, 3, 20);
            }
            if (!this.inputJump) ball.jumpHeld = false;

            // ── Gravity ──
            ball.vy += GRAVITY;

            // ── Integrate position ──
            ball.x += ball.vx;
            ball.y += ball.vy;

            // ── World bounds ──
            ball.x = clamp(ball.x, BALL_RADIUS, lvl.width - BALL_RADIUS);

            // ── Rolling visual ──
            if (ball.grounded) ball.angle += ball.vx * 0.06;

            // ── Ground collision ──
            ball.grounded = false;
            if (ball.y + BALL_RADIUS >= this.floorY) {
                ball.y = this.floorY - BALL_RADIUS;
                ball.vy = 0;
                ball.grounded = true;
            }

            // ── Platform collision (one-way: land on top) ──
            for (const p of lvl.platforms) {
                if (ball.vy >= 0 &&
                    ball.x + BALL_RADIUS > p.x &&
                    ball.x - BALL_RADIUS < p.x + p.w &&
                    ball.y + BALL_RADIUS >= p.y &&
                    ball.y + BALL_RADIUS <= p.y + p.h + ball.vy + 4) {
                    ball.y = p.y - BALL_RADIUS;
                    ball.vy = 0;
                    ball.grounded = true;
                }
            }

            // ── Spikes ──
            if (ball.hurtTimer > 0) {
                ball.hurtTimer--;
            } else {
                for (const s of this.activeSpikes) {
                    if (circleRect(ball.x, ball.y, BALL_RADIUS * 0.7, s.x, s.y, s.w, s.h)) {
                        this.hurtBall();
                        break;
                    }
                }
            }

            // ── Moving obstacles ──
            for (const o of this.activeObstacles) {
                o.phase += o.speed;
                if (o.moveAxis === "x") {
                    o.x = o.baseX + Math.sin(o.phase) * o.moveRange;
                } else {
                    o.y = o.baseY + Math.sin(o.phase) * o.moveRange;
                }
                if (ball.hurtTimer <= 0 && circleRect(ball.x, ball.y, BALL_RADIUS * 0.7, o.x, o.y, o.w, o.h)) {
                    this.hurtBall();
                }
            }

            // ── Gates (solid wall if closed) ──
            for (const g of this.activeGates) {
                if (!g.open && circleRect(ball.x, ball.y, BALL_RADIUS, g.x, g.y, g.w, g.h)) {
                    if (ball.vx > 0) ball.x = g.x - BALL_RADIUS;
                    else             ball.x = g.x + g.w + BALL_RADIUS;
                    ball.vx = 0;
                }
            }

            // ── Switches ──
            for (const sw of this.activeSwitches) {
                if (!sw.activated && circleRect(ball.x, ball.y, BALL_RADIUS, sw.x, sw.y, sw.w, sw.h)) {
                    sw.activated = true;
                    this.particles.emit(sw.x + sw.w / 2, sw.y, 15, C.switchOn, 4, 30);
                    for (const g of this.activeGates) {
                        if (g.switchId === sw.id) g.open = true;
                    }
                }
            }

            // ── Ring collection ──
            for (const r of this.activeRings) {
                if (r.collected) continue;
                r.bobPhase += 0.04;
                const ry = r.y + Math.sin(r.bobPhase) * 5;
                const dx = ball.x - r.x, dy = ball.y - ry;
                if (dx * dx + dy * dy < (BALL_RADIUS + 14) * (BALL_RADIUS + 14)) {
                    r.collected = true;
                    this.ringsCollected++;
                    this.levelScore += 100;
                    this.totalScore += 100;
                    this.particles.emit(r.x, ry, 12, C.ring, 4, 25);
                    this.ui.ringCount.textContent = this.ringsCollected;
                    this.ui.scoreVal.textContent = this.totalScore;

                    // Check if exit should unlock
                    if (!this.exitUnlocked && this.ringsCollected >= lvl.requiredRings) {
                        this.exitUnlocked = true;
                        this.showUnlockTimer = 150;
                        this.ui.unlockNotify.classList.remove("hidden");
                        this.particles.emit(lvl.exitX, this.floorY - 60, 25, C.exitUnlocked, 5, 40);
                    }
                }
            }

            // ── Checkpoints ──
            for (const cp of this.activeCheckpoints) {
                if (!cp.activated && Math.abs(ball.x - cp.x) < 30 && Math.abs(ball.y - (cp.y - BALL_RADIUS)) < 40) {
                    cp.activated = true;
                    ball.spawnX = cp.x;
                    ball.spawnY = this.floorY - BALL_RADIUS;
                    this.particles.emit(cp.x, cp.y, 10, C.checkpoint, 3, 25);
                }
            }

            // ── Unlock notify countdown ──
            if (this.showUnlockTimer > 0) {
                this.showUnlockTimer--;
                if (this.showUnlockTimer <= 0) {
                    this.ui.unlockNotify.classList.add("hidden");
                }
            }

            // ── Exit check ──
            this.exitFlash += 0.04;
            if (this.exitUnlocked && Math.abs(ball.x - lvl.exitX) < 40) {
                this.levelComplete();
            }

            // ── Camera follow ──
            this.camTargetX = ball.x - this.W * SCROLL_MARGIN;
            this.camTargetX = clamp(this.camTargetX, 0, Math.max(0, lvl.width - this.W));
            this.camX = lerp(this.camX, this.camTargetX, CAMERA_LEAD);
        }

        hurtBall() {
            const ball = this.ball;
            if (!ball) return;
            ball.hurtTimer = 60;
            ball.vy = JUMP_FORCE * 0.6;
            ball.vx = -ball.vx * 0.5;
            this.particles.emit(ball.x, ball.y, 15, C.spike, 4, 20);
            this.levelScore = Math.max(0, this.levelScore - 30);
            this.totalScore = Math.max(0, this.totalScore - 30);
            this.ui.scoreVal.textContent = this.totalScore;
        }

        levelComplete() {
            this.state = "cleared";
            const bonus = 500;
            this.totalScore += bonus;

            // Unlock next
            if (this.currentLevel + 1 >= this.unlockedLevels) {
                this.unlockedLevels = Math.min(this.levels.length, this.currentLevel + 2);
            }

            // Persist
            try {
                localStorage.setItem("neonbounce_save", JSON.stringify({
                    unlocked: this.unlockedLevels,
                    totalScore: this.totalScore,
                }));
            } catch (e) { /* ignore */ }

            // Celebration particles
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    if (!this.ball) return;
                    this.particles.emit(
                        this.ball.x + (Math.random() - 0.5) * 100,
                        this.ball.y - Math.random() * 80,
                        20, i % 2 === 0 ? C.ring : C.exitUnlocked, 5, 35
                    );
                }, i * 100);
            }

            if (this.currentLevel + 1 >= this.levels.length) {
                this.ui.completeStats.innerHTML = "Total Score: " + this.totalScore;
                setTimeout(() => this.showScreen("complete"), 600);
            } else {
                this.ui.clearedStats.innerHTML =
                    "Rings: " + this.ringsCollected + " / " + this.levels[this.currentLevel].requiredRings + "<br>" +
                    "Level Score: " + (this.levelScore + bonus) + "<br>" +
                    "Total Score: " + this.totalScore;
                setTimeout(() => this.showScreen("cleared"), 600);
            }
        }

        // ═══════════════════════════════════════════════════════
        //  RENDER
        // ═══════════════════════════════════════════════════════
        render() {
            const ctx = this.ctx;
            const W = this.W, H = this.H;
            const cam = this.camX || 0;

            // ── Background gradient ──
            const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
            bgGrad.addColorStop(0, C.bgGrad1);
            bgGrad.addColorStop(1, C.bgGrad2);
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, W, H);

            // ── Background stars ──
            ctx.fillStyle = "rgba(255,255,255,0.06)";
            for (let i = 0; i < 60; i++) {
                const sx = ((i * 137.5 + 50) % (W + 200)) - (cam * 0.05) % (W + 200);
                const sy = (i * 97.3 + 20) % (H * 0.7);
                ctx.fillRect(sx, sy, 2, 2);
            }

            if (this.state !== "playing" || !this.ball) {
                // Render ambient bg even on menus
                this.particles.draw(ctx, 0);
                return;
            }

            const lvl = this.levels[this.currentLevel];
            if (!lvl) return;

            // ── Subtle grid ──
            ctx.strokeStyle = "rgba(255,255,255,0.03)";
            ctx.lineWidth = 1;
            const gridSize = 80;
            const gridOffX = -(cam % gridSize);
            for (let gx = gridOffX; gx < W; gx += gridSize) {
                ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
            }
            for (let gy = 0; gy < H; gy += gridSize) {
                ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
            }

            // ── Ground ──
            ctx.fillStyle = C.floor;
            ctx.fillRect(0, this.floorY, W, H - this.floorY);
            ctx.strokeStyle = C.floorTop;
            ctx.lineWidth = 2;
            ctx.shadowColor = C.floorTop;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(0, this.floorY);
            ctx.lineTo(W, this.floorY);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // ── Tunnels ──
            for (const t of this.activeTunnels) {
                const tx = t.x - cam;
                ctx.fillStyle = C.tunnel;
                ctx.fillRect(tx, t.y, t.w, t.h);
                ctx.strokeStyle = "rgba(100,60,180,0.5)";
                ctx.lineWidth = 2;
                ctx.strokeRect(tx, t.y, t.w, t.h);
                ctx.fillStyle = "rgba(100,60,180,0.3)";
                ctx.fillRect(tx, t.y, t.w, 3);
            }

            // ── Platforms ──
            for (const p of lvl.platforms) {
                const px = p.x - cam;
                if (px + p.w < -50 || px > W + 50) continue;
                ctx.fillStyle = C.platform;
                ctx.fillRect(px, p.y, p.w, p.h);
                ctx.strokeStyle = C.platformTop;
                ctx.lineWidth = 2;
                ctx.shadowColor = C.platformTop;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.moveTo(px, p.y);
                ctx.lineTo(px + p.w, p.y);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // ── Spikes ──
            for (const s of this.activeSpikes) {
                const sx = s.x - cam;
                if (sx + s.w < -20 || sx > W + 20) continue;
                const numTri = Math.max(1, Math.floor(s.w / 20));
                const triW = s.w / numTri;
                ctx.fillStyle = C.spike;
                ctx.shadowColor = C.spikeGlow;
                ctx.shadowBlur = 10;
                for (let i = 0; i < numTri; i++) {
                    ctx.beginPath();
                    ctx.moveTo(sx + i * triW, s.y + s.h);
                    ctx.lineTo(sx + i * triW + triW / 2, s.y);
                    ctx.lineTo(sx + (i + 1) * triW, s.y + s.h);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
            }

            // ── Moving obstacles ──
            for (const o of this.activeObstacles) {
                const ox = o.x - cam;
                if (ox + o.w < -50 || ox > W + 50) continue;
                ctx.fillStyle = C.obstacle;
                ctx.shadowColor = C.obstacleGlow;
                ctx.shadowBlur = 12;
                ctx.fillRect(ox, o.y, o.w, o.h);
                ctx.shadowBlur = 0;
                ctx.strokeStyle = "rgba(255,255,255,0.3)";
                ctx.lineWidth = 1;
                ctx.strokeRect(ox + 3, o.y + 3, o.w - 6, o.h - 6);
            }

            // ── Switches ──
            for (const sw of this.activeSwitches) {
                const sx = sw.x - cam;
                ctx.fillStyle = sw.activated ? C.switchOn : C.switchOff;
                ctx.shadowColor = sw.activated ? C.switchOn : "transparent";
                ctx.shadowBlur = sw.activated ? 12 : 0;
                ctx.fillRect(sx, sw.y, sw.w, sw.h);
                ctx.shadowBlur = 0;
                ctx.fillStyle = "#000";
                ctx.font = "bold 10px Outfit, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(sw.activated ? "ON" : "SW", sx + sw.w / 2, sw.y + sw.h / 2 + 4);
            }

            // ── Gates ──
            for (const g of this.activeGates) {
                const gx = g.x - cam;
                if (g.open) {
                    ctx.fillStyle = C.gateOpen;
                    ctx.fillRect(gx, g.y, g.w, g.h);
                } else {
                    ctx.fillStyle = C.gate;
                    ctx.shadowColor = C.gate;
                    ctx.shadowBlur = 10;
                    ctx.fillRect(gx, g.y, g.w, g.h);
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = "rgba(255,255,255,0.2)";
                    ctx.lineWidth = 1;
                    for (let sy = g.y; sy < g.y + g.h; sy += 12) {
                        ctx.beginPath(); ctx.moveTo(gx, sy); ctx.lineTo(gx + g.w, sy); ctx.stroke();
                    }
                }
            }

            // ── Checkpoints ──
            for (const cp of this.activeCheckpoints) {
                const cx = cp.x - cam;
                ctx.strokeStyle = cp.activated ? C.checkpoint : "rgba(0,255,136,0.3)";
                ctx.lineWidth = 3;
                ctx.shadowColor = cp.activated ? C.checkpoint : "transparent";
                ctx.shadowBlur = cp.activated ? 10 : 0;
                ctx.beginPath();
                ctx.moveTo(cx, cp.y);
                ctx.lineTo(cx, cp.y - 40);
                ctx.stroke();
                ctx.fillStyle = cp.activated ? C.checkpoint : "rgba(0,255,136,0.3)";
                ctx.beginPath();
                ctx.moveTo(cx, cp.y - 40);
                ctx.lineTo(cx + 18, cp.y - 32);
                ctx.lineTo(cx, cp.y - 24);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // ── Rings ──
            for (const r of this.activeRings) {
                if (r.collected) continue;
                const rx = r.x - cam;
                const ry = r.y + Math.sin(r.bobPhase) * 5;
                if (rx < -30 || rx > W + 30) continue;
                ctx.shadowColor = C.ringGlow;
                ctx.shadowBlur = 14;
                ctx.strokeStyle = C.ring;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(rx, ry, 12, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = "rgba(255,215,0,0.3)";
                ctx.beginPath();
                ctx.arc(rx, ry, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // ── Exit Wall ──
            {
                const ex = lvl.exitX - cam;
                if (ex > -60 && ex < W + 60) {
                    if (this.exitUnlocked) {
                        const pulse = Math.sin(this.exitFlash * 3) * 0.3 + 0.7;
                        ctx.fillStyle = "rgba(0,255,136," + (0.1 * pulse) + ")";
                        ctx.fillRect(ex - 20, this.floorY - 180, 40, 180);
                        ctx.strokeStyle = C.exitUnlocked;
                        ctx.lineWidth = 3;
                        ctx.shadowColor = C.exitUnlocked;
                        ctx.shadowBlur = 18 * pulse;
                        ctx.strokeRect(ex - 20, this.floorY - 180, 40, 180);
                        ctx.fillStyle = C.exitUnlocked;
                        ctx.font = "bold 28px Outfit, sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("\u2192", ex, this.floorY - 85);
                        ctx.shadowBlur = 0;
                    } else {
                        ctx.fillStyle = C.exit;
                        ctx.globalAlpha = 0.7;
                        ctx.fillRect(ex - 12, this.floorY - 180, 24, 180);
                        ctx.globalAlpha = 1;
                        ctx.strokeStyle = C.exit;
                        ctx.lineWidth = 2;
                        ctx.shadowColor = C.exit;
                        ctx.shadowBlur = 10;
                        ctx.strokeRect(ex - 12, this.floorY - 180, 24, 180);
                        // Lock icon text
                        ctx.fillStyle = "#fff";
                        ctx.font = "bold 16px Outfit, sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("\uD83D\uDD12", ex, this.floorY - 85);
                        ctx.shadowBlur = 0;
                    }
                }
            }

            // ── Ball ──
            {
                const ball = this.ball;
                const bx = ball.x - cam;
                const by = ball.y;

                // Hurt flash blink
                if (ball.hurtTimer > 0 && Math.floor(ball.hurtTimer / 4) % 2 === 0) {
                    ctx.globalAlpha = 0.4;
                }

                // Glow
                ctx.shadowColor = C.ballGlow;
                ctx.shadowBlur = 20;

                // Translucent body
                const ballGrad = ctx.createRadialGradient(bx - 4, by - 4, 2, bx, by, BALL_RADIUS);
                ballGrad.addColorStop(0, "rgba(255,255,255,0.5)");
                ballGrad.addColorStop(0.4, C.ballInner);
                ballGrad.addColorStop(1, "rgba(0,240,255,0.08)");
                ctx.fillStyle = ballGrad;
                ctx.beginPath();
                ctx.arc(bx, by, BALL_RADIUS, 0, Math.PI * 2);
                ctx.fill();

                // Outline
                ctx.strokeStyle = C.ball;
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Rolling cross
                ctx.save();
                ctx.translate(bx, by);
                ctx.rotate(ball.angle);
                ctx.strokeStyle = "rgba(0,240,255,0.4)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-BALL_RADIUS * 0.6, 0);
                ctx.lineTo(BALL_RADIUS * 0.6, 0);
                ctx.moveTo(0, -BALL_RADIUS * 0.6);
                ctx.lineTo(0, BALL_RADIUS * 0.6);
                ctx.stroke();
                ctx.restore();

                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;

                // Ground trail
                if (Math.abs(ball.vx) > 1.5 && ball.grounded && this.time % 3 === 0) {
                    this.particles.emit(ball.x, ball.y + BALL_RADIUS - 2, 1, C.particle, 1.5, 12);
                }
            }

            // ── Particles on top ──
            this.particles.draw(ctx, cam);

            // ── Slippery floor indicator ──
            if (lvl.slippery) {
                ctx.fillStyle = C.slippery;
                ctx.globalAlpha = 0.12;
                ctx.fillRect(0, this.floorY - 3, W, 3);
                ctx.globalAlpha = 0.4;
                ctx.font = "bold 11px Outfit, sans-serif";
                ctx.textAlign = "left";
                ctx.fillText("\u26A0 ICY FLOOR", 10, this.floorY - 8);
                ctx.globalAlpha = 1;
            }
        }
    }

    // ───────── Boot ─────────
    window.addEventListener("DOMContentLoaded", () => {
        new Game();
    });

})();
