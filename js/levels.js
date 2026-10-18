/**
 * Bounce Classic - Level Design & Generator
 * Handcrafted levels featuring progressive mechanics, varied obstacle sections,
 * tool pickups (Growth, Shrink, Super Jump), dynamic moving platforms,
 * and an endless procedural runner mode.
 */

import { Coin, PowerUp, Obstacle, FinishLine } from './entities.js';

export class LevelManager {
    constructor() {
        this.levels = [
            this.buildLevel1(),
            this.buildLevel2(),
            this.buildLevel3(),
            this.buildLevel4()
        ];
    }

    getLevel(index) {
        if (index < this.levels.length) {
            // Re-instantiate level to get fresh entities
            switch (index) {
                case 0: return this.buildLevel1();
                case 1: return this.buildLevel2();
                case 2: return this.buildLevel3();
                case 3: return this.buildLevel4();
            }
        }
        return this.buildLevel1();
    }

    getTotalLevels() {
        return this.levels.length;
    }

    /**
     * Level 1: "Emerald Meadow"
     * Introduction to rolling momentum, natural bounce, jump timing,
     * coin collection arcs, moving platforms, and the Super Jump Tool!
     */
    buildLevel1() {
        const ground = [
            { x: 0, y: 380, w: 900, h: 120 },
            { x: 980, y: 380, w: 700, h: 120 },   // gap at 900-980
            { x: 1780, y: 340, w: 600, h: 160 },  // raised ledge
            { x: 2480, y: 380, w: 950, h: 120 }
        ];

        const obstacles = [
            // Static Spikes
            new Obstacle({ type: 'spike', x: 500, y: 350, w: 40, h: 30 }),
            new Obstacle({ type: 'spike', x: 750, y: 350, w: 60, h: 30 }),

            // Step block
            new Obstacle({ type: 'block', x: 1250, y: 320, w: 60, h: 60 }),
            new Obstacle({ type: 'spike', x: 1450, y: 350, w: 40, h: 30 }),

            // Moving Platform across the gap between 1680 and 1780
            new Obstacle({ type: 'moving_platform', x: 1640, y: 360, w: 100, h: 20, rangeY: 50, speed: 2.0 }),

            // Big Spike Pit requiring Super Jump
            new Obstacle({ type: 'spike', x: 2340, y: 460, w: 140, h: 40 }),

            // Final challenge spikes
            new Obstacle({ type: 'spike', x: 2800, y: 350, w: 60, h: 30 }),
            new Obstacle({ type: 'block', x: 3020, y: 320, w: 50, h: 60 })
        ];

        const powerUps = [
            // Super Jump tool placed right before the wide chasm & elevated ledge
            new PowerUp(1950, 290, 'superJump')
        ];

        const coins = [];
        // First arc of coins
        this.addCoinArc(coins, 250, 310, 5, 45, 40);
        this.addCoinArc(coins, 600, 270, 5, 40, 50);
        // Coins over gap
        this.addCoinLine(coins, 910, 310, 3, 30);
        // Coins on raised ledge
        this.addCoinLine(coins, 1820, 280, 5, 35);
        // High airborne coin rainbow via Super Jump!
        this.addCoinArc(coins, 2050, 160, 7, 50, 70);
        // Finish runway coins
        this.addCoinLine(coins, 2600, 320, 6, 35);

        const finishLine = new FinishLine(3350, 380);

        return {
            id: 1,
            name: 'Emerald Meadow',
            subtitle: 'The First Bounce',
            theme: 'classic',
            skyColor: '#74b9ff',
            groundColor: '#2ed573',
            groundTopColor: '#7bed9f',
            startX: 80,
            startY: 320,
            finishX: 3350,
            length: 3500,
            ground,
            obstacles,
            powerUps,
            coins,
            finishLine
        };
    }

    /**
     * Level 2: "Brick Fortress"
     * Focus on Growth Tool: Demolish breakable brick walls, heavy bounces,
     * stepped battlements, and moving platforms.
     */
    buildLevel2() {
        const ground = [
            { x: 0, y: 380, w: 750, h: 120 },
            { x: 850, y: 380, w: 900, h: 120 },
            { x: 1850, y: 340, w: 850, h: 160 },
            { x: 2800, y: 380, w: 1200, h: 120 }
        ];

        const obstacles = [
            // Spikes near entrance
            new Obstacle({ type: 'spike', x: 400, y: 350, w: 40, h: 30 }),

            // Breakable block gate 1 (can be smashed with Growth Tool!)
            new Obstacle({ type: 'breakable', x: 1100, y: 300, w: 50, h: 80 }),

            // Stepped blocks
            new Obstacle({ type: 'block', x: 1350, y: 330, w: 60, h: 50 }),
            new Obstacle({ type: 'spike', x: 1470, y: 350, w: 60, h: 30 }),

            // Breakable block wall 2
            new Obstacle({ type: 'breakable', x: 1650, y: 280, w: 50, h: 100 }),

            // Moving platform ferry
            new Obstacle({ type: 'moving_platform', x: 1730, y: 350, w: 100, h: 20, rangeX: 60, speed: 2.2 }),

            // Spikes on battlement
            new Obstacle({ type: 'spike', x: 2100, y: 310, w: 80, h: 30 }),
            new Obstacle({ type: 'breakable', x: 2350, y: 240, w: 60, h: 100 }),

            // Moving platform elevator
            new Obstacle({ type: 'moving_platform', x: 2680, y: 360, w: 100, h: 20, rangeY: 70, speed: 2.5 }),

            // Double spikes near finish
            new Obstacle({ type: 'spike', x: 3100, y: 350, w: 60, h: 30 }),
            new Obstacle({ type: 'spike', x: 3450, y: 350, w: 80, h: 30 })
        ];

        const powerUps = [
            // Growth tool to smash the first breakable wall
            new PowerUp(880, 310, 'growth'),
            // Growth tool on battlement
            new PowerUp(2000, 270, 'growth')
        ];

        const coins = [];
        this.addCoinArc(coins, 200, 300, 4, 40, 40);
        this.addCoinLine(coins, 600, 310, 4, 30);
        this.addCoinArc(coins, 1180, 240, 5, 40, 50);
        this.addCoinLine(coins, 1880, 270, 5, 30);
        this.addCoinArc(coins, 2450, 200, 6, 45, 60);
        this.addCoinLine(coins, 2900, 310, 8, 35);

        const finishLine = new FinishLine(3850, 380);

        return {
            id: 2,
            name: 'Brick Fortress',
            subtitle: 'Growth & Demolition',
            theme: 'classic',
            skyColor: '#e056fd',
            groundColor: '#d35400',
            groundTopColor: '#f39c12',
            startX: 80,
            startY: 320,
            finishX: 3850,
            length: 4000,
            ground,
            obstacles,
            powerUps,
            coins,
            finishLine
        };
    }

    /**
     * Level 3: "Tunnel Maze & Sky Spikes"
     * Focus on Shrink Tool: Slip through low tunnels and under hanging spikes,
     * dodge rhythmic crushers, and navigate tight gaps.
     */
    buildLevel3() {
        const ground = [
            { x: 0, y: 380, w: 800, h: 120 },
            { x: 880, y: 380, w: 1000, h: 120 },
            { x: 1980, y: 380, w: 1100, h: 120 },
            { x: 3180, y: 380, w: 1200, h: 120 }
        ];

        const obstacles = [
            // First jump test
            new Obstacle({ type: 'spike', x: 450, y: 350, w: 50, h: 30 }),

            // Low hanging tunnel roof - requires Shrunk ball to pass!
            // Clearance: from ground (y=380) to tunnel roof bottom (y=345) is 35px.
            // Normal ball diameter is 32px (fits barely or bumps), Shrink ball diameter is 19px (easily slips through)!
            new Obstacle({ type: 'tunnel_roof', x: 1050, y: 260, w: 220, h: 85 }),

            // Rhythmic Crusher pillar
            new Obstacle({ type: 'crusher', x: 1450, y: 180, w: 60, h: 100, rangeY: 70, speed: 3.0 }),

            // Gap moving platform
            new Obstacle({ type: 'moving_platform', x: 1880, y: 360, w: 90, h: 20, rangeX: 50, speed: 2.2 }),

            // Second tunnel with ceiling spikes above
            new Obstacle({ type: 'tunnel_roof', x: 2300, y: 260, w: 260, h: 85 }),
            new Obstacle({ type: 'spike', x: 2400, y: 230, w: 60, h: 30, inverted: true }),

            // Oscillating dynamic crusher
            new Obstacle({ type: 'crusher', x: 2800, y: 190, w: 70, h: 90, rangeY: 65, speed: 2.8 }),

            // Final spike hurdle
            new Obstacle({ type: 'spike', x: 3400, y: 350, w: 70, h: 30 }),
            new Obstacle({ type: 'spike', x: 3750, y: 350, w: 80, h: 30 })
        ];

        const powerUps = [
            // Shrink tool before first tunnel
            new PowerUp(920, 310, 'shrink'),
            // Shrink tool before second tunnel
            new PowerUp(2150, 310, 'shrink')
        ];

        const coins = [];
        this.addCoinLine(coins, 200, 310, 5, 35);
        this.addCoinArc(coins, 550, 270, 4, 35, 45);
        // Low coins inside tunnel
        this.addCoinLine(coins, 1070, 360, 5, 40);
        this.addCoinArc(coins, 1550, 260, 5, 45, 50);
        // Low coins inside second tunnel
        this.addCoinLine(coins, 2320, 360, 6, 40);
        this.addCoinArc(coins, 2900, 280, 6, 45, 55);
        this.addCoinLine(coins, 3250, 310, 6, 35);

        const finishLine = new FinishLine(4250, 380);

        return {
            id: 3,
            name: 'Tunnel Maze',
            subtitle: 'Shrink & Precision',
            theme: 'classic',
            skyColor: '#00cec9',
            groundColor: '#2c3e50',
            groundTopColor: '#34495e',
            startX: 80,
            startY: 320,
            finishX: 4250,
            length: 4400,
            ground,
            obstacles,
            powerUps,
            coins,
            finishLine
        };
    }

    /**
     * Level 4: "Neon Overdrive (Grand Master Run)"
     * Climactic challenge combining all 3 power-ups in fluid sequence:
     * Super Jump over deep abyss -> Growth to blast mega-blockades ->
     * Shrink to weave beneath oscillating crushers!
     */
    buildLevel4() {
        const ground = [
            { x: 0, y: 380, w: 750, h: 120 },
            { x: 900, y: 380, w: 850, h: 120 },
            { x: 1900, y: 380, w: 900, h: 120 },
            { x: 2950, y: 340, w: 950, h: 160 },
            { x: 4050, y: 380, w: 1200, h: 120 }
        ];

        const obstacles = [
            // Intro hazards
            new Obstacle({ type: 'spike', x: 380, y: 350, w: 50, h: 30 }),

            // Zone 1: Giant spike canyon requiring Super Jump
            new Obstacle({ type: 'spike', x: 750, y: 440, w: 150, h: 40 }),

            // Zone 2: Breakable bastions requiring Growth
            new Obstacle({ type: 'breakable', x: 1200, y: 280, w: 55, h: 100 }),
            new Obstacle({ type: 'breakable', x: 1450, y: 260, w: 55, h: 120 }),

            // Double Moving Platforms
            new Obstacle({ type: 'moving_platform', x: 1750, y: 350, w: 90, h: 20, rangeY: 60, speed: 2.4 }),
            new Obstacle({ type: 'moving_platform', x: 2150, y: 350, w: 90, h: 20, rangeX: 70, speed: 2.6 }),

            // Zone 3: Low spiky crawlway requiring Shrink
            new Obstacle({ type: 'tunnel_roof', x: 2350, y: 260, w: 300, h: 85 }),
            new Obstacle({ type: 'crusher', x: 2750, y: 180, w: 70, h: 100, rangeY: 75, speed: 3.2 }),

            // Zone 4: High ledge hurdles
            new Obstacle({ type: 'spike', x: 3200, y: 310, w: 70, h: 30 }),
            new Obstacle({ type: 'block', x: 3450, y: 280, w: 60, h: 60 }),
            new Obstacle({ type: 'spike', x: 3700, y: 310, w: 70, h: 30 }),

            // Final sprint moving elevator and spikes
            new Obstacle({ type: 'moving_platform', x: 3900, y: 360, w: 100, h: 20, rangeY: 65, speed: 2.2 }),
            new Obstacle({ type: 'spike', x: 4350, y: 350, w: 90, h: 30 }),
            new Obstacle({ type: 'spike', x: 4700, y: 350, w: 90, h: 30 })
        ];

        const powerUps = [
            // Super Jump for the chasm
            new PowerUp(600, 310, 'superJump'),
            // Growth for the fortress barricades
            new PowerUp(1050, 310, 'growth'),
            // Shrink for the tunnel & crusher
            new PowerUp(2200, 310, 'shrink'),
            // Final Super Jump for the grand finish
            new PowerUp(3050, 270, 'superJump')
        ];

        const coins = [];
        this.addCoinArc(coins, 200, 300, 5, 40, 45);
        this.addCoinArc(coins, 700, 160, 7, 45, 80); // Super jump rainbow
        this.addCoinLine(coins, 1300, 290, 4, 35);
        this.addCoinArc(coins, 1800, 220, 6, 45, 60);
        this.addCoinLine(coins, 2400, 360, 6, 40); // Tunnel crawl coins
        this.addCoinArc(coins, 3100, 150, 8, 45, 85); // High sky coins
        this.addCoinLine(coins, 4100, 310, 8, 35);
        this.addCoinLine(coins, 4500, 310, 6, 35);

        const finishLine = new FinishLine(5150, 380);

        return {
            id: 4,
            name: 'Neon Overdrive',
            subtitle: 'Master of Spheres',
            theme: 'cyber',
            skyColor: '#130f40',
            groundColor: '#4834d4',
            groundTopColor: '#686de0',
            startX: 80,
            startY: 320,
            finishX: 5150,
            length: 5300,
            ground,
            obstacles,
            powerUps,
            coins,
            finishLine
        };
    }

    /**
     * Procedural Endless Mode:
     * Generates a dynamic infinite runner stream of varied platform sections,
     * tool drops, coins, and moving hazards.
     */
    createEndlessLevel() {
        return {
            id: 99,
            name: 'Endless RetroSphere',
            subtitle: 'Infinite High Score Run',
            theme: 'classic',
            skyColor: '#6c5ce7',
            groundColor: '#00b894',
            groundTopColor: '#55efc4',
            startX: 80,
            startY: 320,
            finishX: Infinity,
            length: Infinity,
            isEndless: true,
            ground: [
                { x: 0, y: 380, w: 1200, h: 120 }
            ],
            obstacles: [],
            powerUps: [],
            coins: [],
            finishLine: null,
            generatedUpToX: 1200
        };
    }

    /**
     * Appends new randomized section chunks to Endless mode as player advances
     */
    extendEndless(level, playerX) {
        if (!level.isEndless) return;

        while (level.generatedUpToX < playerX + 2400) {
            const startX = level.generatedUpToX;
            const chunkType = Math.floor(Math.random() * 5);
            const chunkW = 700 + Math.floor(Math.random() * 400);

            // Ground with occasional gap
            const hasGap = Math.random() < 0.45;
            const gapW = hasGap ? 100 : 0;
            const segmentW = chunkW - gapW;

            level.ground.push({
                x: startX + gapW,
                y: 380,
                w: segmentW,
                h: 120
            });

            // Populate chunk based on type
            if (chunkType === 0) {
                // Coin arc & gentle spikes
                level.obstacles.push(new Obstacle({
                    type: 'spike',
                    x: startX + gapW + segmentW * 0.5,
                    y: 350,
                    w: 50,
                    h: 30
                }));
                this.addCoinArc(level.coins, startX + gapW + 80, 270, 5, 40, 50);
            } else if (chunkType === 1) {
                // Growth Tool & Breakable wall
                level.powerUps.push(new PowerUp(startX + gapW + 60, 310, 'growth'));
                level.obstacles.push(new Obstacle({
                    type: 'breakable',
                    x: startX + gapW + 350,
                    y: 280,
                    w: 55,
                    h: 100
                }));
                this.addCoinLine(level.coins, startX + gapW + 150, 300, 4, 35);
            } else if (chunkType === 2) {
                // Shrink Tool & Low tunnel or crusher
                level.powerUps.push(new PowerUp(startX + gapW + 60, 310, 'shrink'));
                level.obstacles.push(new Obstacle({
                    type: 'tunnel_roof',
                    x: startX + gapW + 280,
                    y: 260,
                    w: 220,
                    h: 85
                }));
                this.addCoinLine(level.coins, startX + gapW + 300, 360, 5, 35);
            } else if (chunkType === 3) {
                // Super Jump Tool & Deep Pit / Elevated coins
                level.powerUps.push(new PowerUp(startX + gapW + 60, 310, 'superJump'));
                level.obstacles.push(new Obstacle({
                    type: 'spike',
                    x: startX + gapW + 260,
                    y: 350,
                    w: 90,
                    h: 30
                }));
                this.addCoinArc(level.coins, startX + gapW + 200, 160, 6, 45, 75);
            } else {
                // Moving Platform & Stepped blocks
                level.obstacles.push(new Obstacle({
                    type: 'moving_platform',
                    x: startX + gapW + 200,
                    y: 340,
                    w: 90,
                    h: 20,
                    rangeY: 50,
                    speed: 2.5
                }));
                this.addCoinArc(level.coins, startX + gapW + 160, 240, 5, 40, 45);
            }

            level.generatedUpToX = startX + chunkW;
        }

        // Clean up entities far behind the camera
        const cleanupThreshold = playerX - 1000;
        level.ground = level.ground.filter(g => g.x + g.w > cleanupThreshold);
        level.obstacles = level.obstacles.filter(o => o.x + o.w > cleanupThreshold);
        level.powerUps = level.powerUps.filter(p => p.x > cleanupThreshold);
        level.coins = level.coins.filter(c => c.x > cleanupThreshold);
    }

    // Helper functions for coin layout
    addCoinArc(coinsList, startX, apexY, count, spacingX, arcHeight) {
        for (let i = 0; i < count; i++) {
            const t = (i / (count - 1)) * 2 - 1; // -1 to 1
            const y = apexY + (t * t) * arcHeight;
            coinsList.push(new Coin(startX + i * spacingX, y));
        }
    }

    addCoinLine(coinsList, startX, y, count, spacingX) {
        for (let i = 0; i < count; i++) {
            coinsList.push(new Coin(startX + i * spacingX, y));
        }
    }
}
