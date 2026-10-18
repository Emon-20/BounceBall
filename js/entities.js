/**
 * Bounce Classic - Game Entities
 * Player Ball, Collectible Coins, Power-Up Tools (Growth, Shrink, Super Jump),
 * Static Obstacles (Spikes, Blocks, Breakables), Dynamic Hazards (Moving Platforms, Crushers),
 * and Level Finishing Line Archway.
 */

export class Ball {
    constructor(x = 100, y = 300) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.vx = 260;
        this.vy = 0;
        this.baseRadius = 16;
        this.radius = 16;
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;
        this.onGround = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;

        // Active Power-Up Tool state
        this.activeTool = null; // 'growth' | 'shrink' | 'superJump' | null
        this.toolTimer = 0;
        this.toolDuration = 0;
        this.speedModifier = 1.0;

        this.isDead = false;
        this.hasFinished = false;
    }

    reset(x = this.startX, y = this.startY) {
        this.x = x;
        this.y = y;
        this.vx = 260;
        this.vy = 0;
        this.radius = this.baseRadius;
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;
        this.onGround = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.activeTool = null;
        this.toolTimer = 0;
        this.toolDuration = 0;
        this.speedModifier = 1.0;
        this.isDead = false;
        this.hasFinished = false;
    }

    applyTool(toolType, duration = 10) {
        this.activeTool = toolType;
        this.toolDuration = duration;
        this.toolTimer = duration;

        // Tool-specific modifier adjustments
        if (toolType === 'superJump') {
            this.speedModifier = 1.05;
        } else {
            this.speedModifier = 1.0;
        }
    }

    expireTool() {
        this.activeTool = null;
        this.toolTimer = 0;
        this.toolDuration = 0;
        this.speedModifier = 1.0;
    }

    draw(ctx, cameraX, cameraY, theme) {
        if (this.isDead) return;

        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;

        ctx.save();
        ctx.translate(screenX, screenY);

        // Power-Up Aura effect
        if (this.activeTool) {
            ctx.save();
            const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.12;
            let auraColor = 'rgba(255, 107, 53, 0.4)';
            if (this.activeTool === 'shrink') auraColor = 'rgba(0, 210, 255, 0.45)';
            if (this.activeTool === 'superJump') auraColor = 'rgba(56, 239, 125, 0.45)';

            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 1.35 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = auraColor;
            ctx.fill();

            // Energy ring
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = this.activeTool === 'growth' ? '#ff793f' :
                              this.activeTool === 'shrink' ? '#00d2ff' : '#2ed573';
            ctx.stroke();
            ctx.restore();
        }

        // Apply Squash & Stretch from landing/jumping
        ctx.scale(this.scaleX, this.scaleY);

        // Drop shadow on ground (subtle depth)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, this.radius * 0.95, this.radius * 0.85, this.radius * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();
        ctx.restore();

        // Rotate ball interior to show rolling motion
        ctx.rotate(this.rotation);

        // Ball Body
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);

        if (theme === 'nokia') {
            // Nokia 3310 monochrome LCD aesthetic
            ctx.fillStyle = '#1c3619';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#0e1d0d';
            ctx.stroke();

            // Nokia grid pixel dot pattern
            ctx.fillStyle = '#486b42';
            ctx.fillRect(-this.radius * 0.4, -this.radius * 0.4, this.radius * 0.8, this.radius * 0.8);
        } else if (theme === 'cyber') {
            // Cyber synthwave neon style
            const grad = ctx.createRadialGradient(-this.radius * 0.3, -this.radius * 0.3, 2, 0, 0, this.radius);
            grad.addColorStop(0, '#ff9ff3');
            grad.addColorStop(0.5, '#f368e0');
            grad.addColorStop(1, '#5f27cd');
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#00f2fe';
            ctx.stroke();
        } else {
            // Classic Nokia Bounce red ball aesthetic
            const grad = ctx.createRadialGradient(-this.radius * 0.35, -this.radius * 0.35, 2, 0, 0, this.radius);
            grad.addColorStop(0, '#ff7675');
            grad.addColorStop(0.35, '#d63031');
            grad.addColorStop(0.85, '#b71540');
            grad.addColorStop(1, '#670319');
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#4a0817';
            ctx.stroke();
        }

        // Rolling pattern line & dots (visible rotation cues)
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.65, 0, Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = Math.max(1.5, this.radius * 0.1);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.radius * 0.4, -this.radius * 0.2, Math.max(1.5, this.radius * 0.12), 0, Math.PI * 2);
        ctx.arc(-this.radius * 0.4, this.radius * 0.2, Math.max(1.5, this.radius * 0.12), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        // 3D Specular reflection highlight
        ctx.beginPath();
        ctx.arc(-this.radius * 0.35, -this.radius * 0.35, this.radius * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();

        ctx.restore();
    }
}

export class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.collected = false;
        this.animTimer = Math.random() * 10;
        this.value = 100;
    }

    update(dt) {
        if (!this.collected) {
            this.animTimer += dt * 3.8;
        }
    }

    draw(ctx, cameraX, cameraY, theme) {
        if (this.collected) return;

        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;

        // Skip if off-screen
        if (screenX < -30 || screenX > ctx.canvas.width + 30) return;

        ctx.save();
        ctx.translate(screenX, screenY);

        // 3D spinning horizontal scale
        const spinScale = Math.cos(this.animTimer);
        ctx.scale(spinScale, 1);

        if (theme === 'nokia') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#2d5a27';
            ctx.fill();
            ctx.strokeStyle = '#0e1d0d';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner pixel hole
            ctx.fillStyle = '#87ad75';
            ctx.fillRect(-2, -2, 4, 4);
        } else {
            // Golden shimmer coin
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            const grad = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
            grad.addColorStop(0, '#ffeaa7');
            grad.addColorStop(0.5, '#fdcb6e');
            grad.addColorStop(1, '#e17055');
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#d63031';
            ctx.stroke();

            // Inner ring
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.65, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Star emboss
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-1.5, -4, 3, 8);
            ctx.fillRect(-4, -1.5, 8, 3);
        }

        ctx.restore();
    }
}

export class PowerUp {
    /**
     * @param {number} x
     * @param {number} y
     * @param {'growth'|'shrink'|'superJump'} type
     */
    constructor(x, y, type = 'growth') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 16;
        this.collected = false;
        this.floatTimer = Math.random() * 10;
        this.duration = type === 'superJump' ? 8 : 10; // seconds
    }

    update(dt) {
        if (!this.collected) {
            this.floatTimer += dt * 3.5;
        }
    }

    draw(ctx, cameraX, cameraY, theme) {
        if (this.collected) return;

        const screenX = this.x - cameraX;
        const bobbingY = (this.y + Math.sin(this.floatTimer) * 6) - cameraY;

        if (screenX < -40 || screenX > ctx.canvas.width + 40) return;

        ctx.save();
        ctx.translate(screenX, bobbingY);

        // Tool-specific color theme
        let mainColor = '#ff6b35';
        let strokeColor = '#ee5253';
        let label = 'GROW';

        if (this.type === 'shrink') {
            mainColor = '#00d2ff';
            strokeColor = '#0984e3';
            label = 'TINY';
        } else if (this.type === 'superJump') {
            mainColor = '#2ed573';
            strokeColor = '#10ac84';
            label = 'JUMP';
        }

        if (theme === 'nokia') {
            mainColor = '#3a6933';
            strokeColor = '#0e1d0d';
        }

        // Pulsating outer aura ring
        const pulse = 1 + Math.sin(this.floatTimer * 1.5) * 0.15;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 1.4 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = theme === 'nokia' ? 'rgba(70, 110, 60, 0.25)' : `${mainColor}33`;
        ctx.fill();

        // Main Orb
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, this.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, mainColor);
        grad.addColorStop(1, strokeColor);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();

        // Tool Icon Symbol inside orb
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        if (this.type === 'growth') {
            // Expansion Arrows (pointing outwards)
            ctx.beginPath();
            // Up arrow
            ctx.moveTo(0, -9);
            ctx.lineTo(0, -3);
            ctx.moveTo(-4, -6);
            ctx.lineTo(0, -10);
            ctx.lineTo(4, -6);
            // Down arrow
            ctx.moveTo(0, 9);
            ctx.lineTo(0, 3);
            ctx.moveTo(-4, 6);
            ctx.lineTo(0, 10);
            ctx.lineTo(4, 6);
            ctx.stroke();
        } else if (this.type === 'shrink') {
            // Compression Arrows (pointing inwards)
            ctx.beginPath();
            // Upper pointing down
            ctx.moveTo(0, -10);
            ctx.lineTo(0, -3);
            ctx.moveTo(-4, -6);
            ctx.lineTo(0, -2);
            ctx.lineTo(4, -6);
            // Lower pointing up
            ctx.moveTo(0, 10);
            ctx.lineTo(0, 3);
            ctx.moveTo(-4, 6);
            ctx.lineTo(0, 2);
            ctx.lineTo(4, 6);
            ctx.stroke();
        } else if (this.type === 'superJump') {
            // Coiled Spring / Lightning Symbol
            ctx.beginPath();
            ctx.moveTo(2, -9);
            ctx.lineTo(-4, 0);
            ctx.lineTo(3, 0);
            ctx.lineTo(-2, 9);
            ctx.stroke();
        }

        ctx.restore();
    }
}

export class Obstacle {
    /**
     * @param {Object} config
     * @param {'spike'|'block'|'breakable'|'tunnel_roof'|'moving_platform'|'crusher'} config.type
     */
    constructor(config) {
        this.type = config.type;
        this.x = config.x;
        this.y = config.y;
        this.w = config.w || 32;
        this.h = config.h || 32;
        this.inverted = config.inverted || false; // For ceiling spikes
        this.broken = false;

        // Dynamic / Moving platform config
        this.startX = this.x;
        this.startY = this.y;
        this.rangeX = config.rangeX || 0;
        this.rangeY = config.rangeY || 0;
        this.speed = config.speed || 1.5;
        this.timer = config.offset || 0;
        this.vx = 0;
        this.vy = 0;
    }

    update(dt) {
        if (this.broken) return;

        if (this.type === 'moving_platform') {
            this.timer += dt * this.speed;
            const prevX = this.x;
            const prevY = this.y;

            if (this.rangeX !== 0) {
                this.x = this.startX + Math.sin(this.timer) * this.rangeX;
            }
            if (this.rangeY !== 0) {
                this.y = this.startY + Math.sin(this.timer) * this.rangeY;
            }

            this.vx = this.x - prevX;
            this.vy = this.y - prevY;
        } else if (this.type === 'crusher') {
            // Rhythmic slam down and slow retract
            this.timer += dt * this.speed;
            // Sawtooth / sinusoidal slam
            const phase = Math.sin(this.timer);
            const slamOffset = Math.max(0, phase) * (this.rangeY || 100);
            this.y = this.startY + slamOffset;
        }
    }

    draw(ctx, cameraX, cameraY, theme) {
        if (this.broken) return;

        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;

        // Screen culling
        if (screenX + this.w < -20 || screenX > ctx.canvas.width + 20) return;

        ctx.save();

        if (this.type === 'spike') {
            // Spikes (can be a row of triangular spikes)
            const spikeCount = Math.max(1, Math.round(this.w / 20));
            const spikeW = this.w / spikeCount;

            ctx.fillStyle = theme === 'nokia' ? '#0e1d0d' : '#eb4d4b';
            ctx.strokeStyle = theme === 'nokia' ? '#2d5a27' : '#ff7979';
            ctx.lineWidth = 1.5;

            for (let i = 0; i < spikeCount; i++) {
                const sx = screenX + i * spikeW;
                ctx.beginPath();
                if (this.inverted) {
                    ctx.moveTo(sx, screenY);
                    ctx.lineTo(sx + spikeW / 2, screenY + this.h);
                    ctx.lineTo(sx + spikeW, screenY);
                } else {
                    ctx.moveTo(sx, screenY + this.h);
                    ctx.lineTo(sx + spikeW / 2, screenY);
                    ctx.lineTo(sx + spikeW, screenY + this.h);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        } else if (this.type === 'block') {
            // Solid stone / brick block
            if (theme === 'nokia') {
                ctx.fillStyle = '#22441f';
                ctx.fillRect(screenX, screenY, this.w, this.h);
                ctx.strokeStyle = '#0e1d0d';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenX, screenY, this.w, this.h);

                // Nokia cross-hatch pattern
                ctx.fillStyle = '#2d5a27';
                ctx.fillRect(screenX + 3, screenY + 3, this.w - 6, this.h - 6);
            } else {
                ctx.fillStyle = '#576574';
                ctx.fillRect(screenX, screenY, this.w, this.h);

                // Brick texture / beveled edge
                ctx.fillStyle = '#8395a7';
                ctx.fillRect(screenX, screenY, this.w, 4);
                ctx.fillStyle = '#222f3e';
                ctx.fillRect(screenX, screenY + this.h - 4, this.w, 4);

                ctx.strokeStyle = '#1e272e';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(screenX, screenY, this.w, this.h);
            }
        } else if (this.type === 'breakable') {
            // Breakable brick crate (smashable with Growth Tool)
            if (theme === 'nokia') {
                ctx.fillStyle = '#3a6933';
                ctx.fillRect(screenX, screenY, this.w, this.h);
                ctx.strokeStyle = '#0e1d0d';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenX, screenY, this.w, this.h);

                // Cracked indicator
                ctx.beginPath();
                ctx.moveTo(screenX + 4, screenY + 4);
                ctx.lineTo(screenX + this.w - 4, screenY + this.h - 4);
                ctx.moveTo(screenX + this.w - 4, screenY + 4);
                ctx.lineTo(screenX + 4, screenY + this.h - 4);
                ctx.strokeStyle = '#0e1d0d';
                ctx.stroke();
            } else {
                // Cracked terracotta/wooden brick
                ctx.fillStyle = '#d35400';
                ctx.fillRect(screenX, screenY, this.w, this.h);

                // Highlights
                ctx.fillStyle = '#e67e22';
                ctx.fillRect(screenX + 2, screenY + 2, this.w - 4, 4);

                ctx.strokeStyle = '#8c3500';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenX, screenY, this.w, this.h);

                // Crack lines
                ctx.beginPath();
                ctx.moveTo(screenX + this.w * 0.2, screenY + 4);
                ctx.lineTo(screenX + this.w * 0.5, screenY + this.h * 0.5);
                ctx.lineTo(screenX + this.w * 0.8, screenY + this.h - 4);
                ctx.strokeStyle = '#f39c12';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Small smash warning badge
                ctx.fillStyle = '#fffa65';
                ctx.font = 'bold 9px "Outfit", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('CRACK', screenX + this.w / 2, screenY + this.h / 2 + 3);
            }
        } else if (this.type === 'tunnel_roof') {
            // Low hanging obstacle / tunnel (requires Shrink tool to slide through)
            ctx.fillStyle = theme === 'nokia' ? '#1c3619' : '#2c3e50';
            ctx.fillRect(screenX, screenY, this.w, this.h);

            // Warning stripes along bottom edge
            const stripeW = 12;
            const stripeCount = Math.ceil(this.w / stripeW);
            for (let s = 0; s < stripeCount; s++) {
                ctx.fillStyle = s % 2 === 0 ? '#f1c40f' : '#2c3e50';
                ctx.fillRect(screenX + s * stripeW, screenY + this.h - 6, stripeW, 6);
            }

            ctx.strokeStyle = theme === 'nokia' ? '#0e1d0d' : '#1a252f';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX, screenY, this.w, this.h);
        } else if (this.type === 'moving_platform') {
            // Floating mechanical platform
            if (theme === 'nokia') {
                ctx.fillStyle = '#486b42';
                ctx.fillRect(screenX, screenY, this.w, this.h);
                ctx.strokeStyle = '#0e1d0d';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenX, screenY, this.w, this.h);
            } else {
                ctx.fillStyle = '#0984e3';
                ctx.fillRect(screenX, screenY, this.w, this.h);

                // Metallic surface
                ctx.fillStyle = '#74b9ff';
                ctx.fillRect(screenX, screenY, this.w, 4);

                ctx.strokeStyle = '#0652dd';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenX, screenY, this.w, this.h);

                // LED indicator lights
                const ledCount = 3;
                for (let l = 0; l < ledCount; l++) {
                    const lx = screenX + 8 + l * ((this.w - 16) / (ledCount - 1));
                    ctx.beginPath();
                    ctx.arc(lx, screenY + this.h / 2, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = '#55efc4';
                    ctx.fill();
                }
            }
        } else if (this.type === 'crusher') {
            // Spiky crusher pillar slamming down
            ctx.fillStyle = theme === 'nokia' ? '#182f16' : '#2d3436';
            ctx.fillRect(screenX, screenY, this.w, this.h);

            // Bottom spikes of crusher
            const cSpikeCount = Math.max(1, Math.round(this.w / 16));
            const cSpikeW = this.w / cSpikeCount;
            ctx.fillStyle = theme === 'nokia' ? '#0e1d0d' : '#d63031';
            for (let i = 0; i < cSpikeCount; i++) {
                const sx = screenX + i * cSpikeW;
                ctx.beginPath();
                ctx.moveTo(sx, screenY + this.h);
                ctx.lineTo(sx + cSpikeW / 2, screenY + this.h + 10);
                ctx.lineTo(sx + cSpikeW, screenY + this.h);
                ctx.closePath();
                ctx.fill();
            }

            ctx.strokeStyle = '#636e72';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(screenX, screenY, this.w, this.h);
        }

        ctx.restore();
    }
}

export class FinishLine {
    constructor(x, y, h = 260) {
        this.x = x;
        this.y = y;
        this.w = 60;
        this.h = h;
        this.animTimer = 0;
    }

    update(dt) {
        this.animTimer += dt * 4;
    }

    draw(ctx, cameraX, cameraY, theme) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;

        if (screenX < -100 || screenX > ctx.canvas.width + 100) return;

        ctx.save();
        ctx.translate(screenX, screenY);

        // Ground trigger glowing zone
        const glowPulse = 0.5 + Math.sin(this.animTimer * 0.8) * 0.3;
        ctx.fillStyle = theme === 'nokia' ? 'rgba(72, 107, 66, 0.4)' : `rgba(46, 213, 115, ${glowPulse * 0.35})`;
        ctx.fillRect(-15, -this.h, 70, this.h);

        // Twin Checkered Pillars
        const pillarW = 12;
        const checkH = 16;
        const rows = Math.floor(this.h / checkH);

        for (let side of [0, 50]) {
            for (let r = 0; r < rows; r++) {
                const isBlack = (r % 2 === 0);
                ctx.fillStyle = isBlack ? '#2f3542' : '#ffffff';
                if (theme === 'nokia') {
                    ctx.fillStyle = isBlack ? '#0e1d0d' : '#87ad75';
                }
                ctx.fillRect(side, -this.h + r * checkH, pillarW, checkH);
            }
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(side, -this.h, pillarW, this.h);
        }

        // Top Arch Banner
        const archY = -this.h - 24;
        ctx.fillStyle = theme === 'nokia' ? '#22441f' : '#ff4757';
        ctx.fillRect(-5, archY, 72, 28);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-5, archY, 72, 28);

        // "FINISH" Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FINISH', 31, archY + 18);

        // Waving Checkered Flags at the tops of the pillars
        const wave = Math.sin(this.animTimer) * 4;
        ctx.beginPath();
        ctx.moveTo(6, archY);
        ctx.lineTo(6 - 22 + wave, archY - 14);
        ctx.lineTo(6, archY - 24);
        ctx.closePath();
        ctx.fillStyle = '#ffa502';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(56, archY);
        ctx.lineTo(56 + 22 + wave, archY - 14);
        ctx.lineTo(56, archY - 24);
        ctx.closePath();
        ctx.fillStyle = '#ffa502';
        ctx.fill();

        ctx.restore();
    }
}
