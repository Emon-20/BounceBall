/**
 * Bounce Classic - Retro Graphics & Parallax Renderer
 * Handles multi-layered parallax backgrounds, ground geometry styling,
 * theme pallets (Classic Arcade, Nokia 3310 LCD, Cyber Synthwave),
 * camera tracking with lead offset, and screen shake.
 */

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.theme = 'classic'; // 'classic' | 'nokia' | 'cyber'
        this.scanlines = false;

        // Screen Shake
        this.shakeTimer = 0;
        this.shakeIntensity = 0;

        // Virtual internal resolution
        this.virtualWidth = 800;
        this.virtualHeight = 450;
        this.scale = 1;

        // Cloud & scenery offsets
        this.sceneryTimer = 0;

        // Load saved theme
        try {
            if (typeof localStorage !== 'undefined') {
                const savedTheme = localStorage.getItem('bounce_theme');
                if (savedTheme) this.theme = savedTheme;
                const savedScanlines = localStorage.getItem('bounce_scanlines');
                if (savedScanlines) this.scanlines = savedScanlines === 'true';
            }
        } catch (e) {}
    }

    setTheme(theme) {
        this.theme = theme;
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('bounce_theme', theme);
            }
        } catch (e) {}
    }

    toggleScanlines() {
        this.scanlines = !this.scanlines;
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('bounce_scanlines', String(this.scanlines));
            }
        } catch (e) {}
        return this.scanlines;
    }

    triggerShake(intensity = 6, duration = 0.2) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    resize(containerWidth, containerHeight) {
        const dpr = window.devicePixelRatio || 1;
        this.scale = Math.min(containerWidth / this.virtualWidth, containerHeight / this.virtualHeight);

        const displayWidth = Math.floor(this.virtualWidth * this.scale);
        const displayHeight = Math.floor(this.virtualHeight * this.scale);

        this.canvas.width = Math.floor(displayWidth * dpr);
        this.canvas.height = Math.floor(displayHeight * dpr);
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;

        this.ctx.resetTransform();
        this.ctx.scale(dpr * this.scale, dpr * this.scale);
        this.ctx.imageSmoothingEnabled = false; // Sharp retro pixels!
    }

    update(dt) {
        this.sceneryTimer += dt;
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            if (this.shakeTimer <= 0) {
                this.shakeIntensity = 0;
            }
        }
    }

    /**
     * Clears canvas and renders entire frame
     */
    render(gameState) {
        const { cameraX, cameraY, level, ball, particles } = gameState;
        const ctx = this.ctx;

        // Apply screen shake offset
        let shakeOffsetX = 0;
        let shakeOffsetY = 0;
        if (this.shakeTimer > 0) {
            shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
        }

        ctx.save();
        ctx.translate(shakeOffsetX, shakeOffsetY);

        // 1. Render Sky & Parallax Background
        this.renderBackground(cameraX, cameraY, level);

        // 2. Render Ground Platforms
        this.renderGround(cameraX, cameraY, level);

        // 3. Render Level Entities
        if (level) {
            // Finish Line
            if (level.finishLine) {
                level.finishLine.draw(ctx, cameraX, cameraY, this.theme);
            }

            // Obstacles
            for (const obs of level.obstacles) {
                obs.draw(ctx, cameraX, cameraY, this.theme);
            }

            // Collectibles
            for (const coin of level.coins) {
                coin.draw(ctx, cameraX, cameraY, this.theme);
            }

            // Power-Up Tools
            for (const tool of level.powerUps) {
                tool.draw(ctx, cameraX, cameraY, this.theme);
            }
        }

        // 4. Render Ball
        if (ball) {
            ball.draw(ctx, cameraX, cameraY, this.theme);
        }

        // 5. Render Particle FX & Floating Text
        if (particles) {
            particles.draw(ctx, cameraX, cameraY);
        }

        // 6. Retro Effects Overlay (Nokia LCD Matrix / Scanlines)
        if (this.theme === 'nokia') {
            this.renderNokiaLCDOverlay();
        } else if (this.scanlines) {
            this.renderScanlinesOverlay();
        }

        ctx.restore();
    }

    renderBackground(cameraX, cameraY, level) {
        const ctx = this.ctx;
        const w = this.virtualWidth;
        const h = this.virtualHeight;

        if (this.theme === 'nokia') {
            // Nokia Monochrome 3310 greenish-yellow LCD
            ctx.fillStyle = '#87ad75';
            ctx.fillRect(0, 0, w, h);

            // Parallax Nokia pixel hills
            ctx.fillStyle = '#658f55';
            const hillScroll = (cameraX * 0.15) % 400;
            ctx.beginPath();
            ctx.moveTo(0, h);
            for (let x = -400; x <= w + 400; x += 120) {
                const hx = x - hillScroll;
                ctx.lineTo(hx, 220 + Math.sin(x * 0.015) * 45);
            }
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fill();

            return;
        }

        if (this.theme === 'cyber') {
            // Synthwave dark sky
            const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
            skyGrad.addColorStop(0, '#0a0a23');
            skyGrad.addColorStop(0.65, '#2e1548');
            skyGrad.addColorStop(1, '#ff388b');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, w, h);

            // Neon sun
            ctx.save();
            const sunY = 160;
            const sunX = w / 2;
            const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 70);
            sunGrad.addColorStop(0, '#ffeaa7');
            sunGrad.addColorStop(0.5, '#ff4757');
            sunGrad.addColorStop(1, 'rgba(255, 71, 87, 0)');
            ctx.fillStyle = sunGrad;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Distant cyber grid mountains
            ctx.fillStyle = '#1e113a';
            const mScroll = (cameraX * 0.1) % 500;
            ctx.beginPath();
            ctx.moveTo(0, h);
            for (let x = -500; x <= w + 500; x += 140) {
                const mx = x - mScroll;
                ctx.lineTo(mx, 250 + Math.sin(x * 0.02) * 60);
            }
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fill();

            return;
        }

        // Classic Arcade Nostalgia Theme
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, level?.skyColor || '#74b9ff');
        skyGrad.addColorStop(0.7, '#a8e6cf');
        skyGrad.addColorStop(1, '#dff9fb');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Distant Clouds (moving continuously)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const cloudScroll1 = ((cameraX * 0.08) + (this.sceneryTimer * 8)) % 900;
        this.drawCloud(150 - cloudScroll1, 70, 60, 25);
        this.drawCloud(550 - cloudScroll1, 100, 75, 30);
        this.drawCloud(950 - cloudScroll1, 55, 90, 32);

        // Parallax Layer 1: Distant Emerald Mountain Ridges
        ctx.fillStyle = '#55a882';
        const mountScroll = (cameraX * 0.15) % 600;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = -600; x <= w + 600; x += 160) {
            const mx = x - mountScroll;
            ctx.lineTo(mx, 260 + Math.sin(x * 0.012) * 45);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Parallax Layer 2: Rolling Midground Hills
        ctx.fillStyle = '#26de81';
        const hillScroll = (cameraX * 0.35) % 450;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = -450; x <= w + 450; x += 130) {
            const hx = x - hillScroll;
            ctx.lineTo(hx, 310 + Math.sin(x * 0.025) * 35);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
    }

    drawCloud(x, y, w, h) {
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
        ctx.ellipse(x - w * 0.25, y + h * 0.1, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
        ctx.ellipse(x + w * 0.25, y + h * 0.1, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    renderGround(cameraX, cameraY, level) {
        if (!level || !level.ground) return;
        const ctx = this.ctx;

        for (const seg of level.ground) {
            const screenX = seg.x - cameraX;
            const screenY = seg.y - cameraY;

            // Frustum culling
            if (screenX + seg.w < -20 || screenX > this.virtualWidth + 20) continue;

            if (this.theme === 'nokia') {
                // Nokia solid LCD ground
                ctx.fillStyle = '#1c3619';
                ctx.fillRect(screenX, screenY, seg.w, seg.h);

                // Top surface line
                ctx.fillStyle = '#0e1d0d';
                ctx.fillRect(screenX, screenY, seg.w, 4);
                continue;
            }

            if (this.theme === 'cyber') {
                // Neon synthwave grid ground
                ctx.fillStyle = '#1e113a';
                ctx.fillRect(screenX, screenY, seg.w, seg.h);

                // Glowing neon edge
                ctx.fillStyle = '#00f2fe';
                ctx.fillRect(screenX, screenY, seg.w, 4);

                // Grid vertical lines
                ctx.strokeStyle = 'rgba(255, 0, 128, 0.4)';
                ctx.lineWidth = 1.5;
                const gridSpacing = 40;
                const startG = Math.floor(seg.x / gridSpacing) * gridSpacing;
                for (let gx = startG; gx <= seg.x + seg.w; gx += gridSpacing) {
                    if (gx >= seg.x) {
                        const lineX = gx - cameraX;
                        ctx.beginPath();
                        ctx.moveTo(lineX, screenY + 4);
                        ctx.lineTo(lineX, screenY + seg.h);
                        ctx.stroke();
                    }
                }
                continue;
            }

            // Classic Retro Platformer Ground
            // Dirt underlayer
            ctx.fillStyle = level.groundColor || '#d35400';
            ctx.fillRect(screenX, screenY + 12, seg.w, seg.h - 12);

            // Brick/rock texture pattern on dirt
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            const brickW = 40;
            const brickH = 20;
            const startX = Math.floor(seg.x / brickW) * brickW;
            for (let bx = startX; bx < seg.x + seg.w; bx += brickW) {
                for (let by = seg.y + 16; by < seg.y + seg.h; by += brickH) {
                    const rowOffset = ((by / brickH) % 2 === 0) ? 0 : brickW / 2;
                    const px = bx + rowOffset - cameraX;
                    const py = by - cameraY;
                    if (px + brickW > screenX && px < screenX + seg.w) {
                        ctx.fillRect(px + 2, py + 2, brickW - 4, brickH - 4);
                    }
                }
            }

            // Lush top curb / grass rim
            ctx.fillStyle = level.groundTopColor || '#2ed573';
            ctx.fillRect(screenX, screenY, seg.w, 12);

            // Grass sawtooth fringe
            ctx.fillStyle = level.groundTopColor || '#2ed573';
            const bladeW = 12;
            const bladeCount = Math.ceil(seg.w / bladeW);
            for (let b = 0; b < bladeCount; b++) {
                const bx = screenX + b * bladeW;
                ctx.beginPath();
                ctx.moveTo(bx, screenY + 12);
                ctx.lineTo(bx + bladeW / 2, screenY + 18);
                ctx.lineTo(bx + bladeW, screenY + 12);
                ctx.closePath();
                ctx.fill();
            }

            // Dark underline on grass
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fillRect(screenX, screenY + 11, seg.w, 2);
        }
    }

    renderNokiaLCDOverlay() {
        const ctx = this.ctx;
        const w = this.virtualWidth;
        const h = this.virtualHeight;

        // Subtle pixel grid overlay imitating the 84x48 or 128x128 Nokia screen dots
        ctx.fillStyle = 'rgba(14, 29, 13, 0.08)';
        for (let y = 0; y < h; y += 3) {
            ctx.fillRect(0, y, w, 1);
        }
    }

    renderScanlinesOverlay() {
        const ctx = this.ctx;
        const w = this.virtualWidth;
        const h = this.virtualHeight;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 1.5);
        }
    }
}
