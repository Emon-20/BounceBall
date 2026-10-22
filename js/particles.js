/**
 * Bounce Classic - Particle & FX System
 * High-performance visual effects for jumps, bounces, coin collections, power-up trails,
 * hazard collisions, block smashing, and victory confetti.
 */

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
    }

    reset() {
        this.particles = [];
        this.floatingTexts = [];
    }

    /** Dust puff when bouncing or jumping */
    createDustPuff(x, y, count = 6, color = 'rgba(255, 255, 255, 0.7)') {
        for (let i = 0; i < count; i++) {
            const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.8; // mostly upward & sideways
            const speed = 30 + Math.random() * 70;
            this.particles.push({
                type: 'circle',
                x: x + (Math.random() - 0.5) * 8,
                y: y + (Math.random() - 0.5) * 4,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed * 0.6,
                radius: 3 + Math.random() * 4,
                grow: 2,
                color: color,
                alpha: 0.8,
                decay: 2.2 + Math.random() * 1.0,
                gravity: -10
            });
        }
    }

    /** Sparkling burst when collecting a coin */
    createCoinSparkles(x, y, color = '#ffd700') {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
            const speed = 70 + Math.random() * 110;
            this.particles.push({
                type: 'spark',
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 2 + Math.random() * 3,
                color: color,
                alpha: 1.0,
                decay: 1.8 + Math.random() * 1.2,
                gravity: 90
            });
        }
        this.createFloatingText('+100', x, y - 10, '#ffe066');
    }

    /** Power-up pickup burst with tool-specific theme */
    createPowerUpBurst(x, y, toolType) {
        let color = '#00f2fe';
        let label = 'POWER UP!';
        if (toolType === 'growth') {
            color = '#ff6b35';
            label = 'GROWTH!';
        } else if (toolType === 'shrink') {
            color = '#00d2ff';
            label = 'SHRINK!';
        } else if (toolType === 'superJump') {
            color = '#38ef7d';
            label = 'SUPER JUMP!';
        }

        const count = 22;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 100 + Math.random() * 140;
            this.particles.push({
                type: 'star',
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 3 + Math.random() * 3,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 8,
                color: color,
                alpha: 1.0,
                decay: 1.4,
                gravity: 40
            });
        }
        this.createFloatingText(label, x, y - 18, color, 18);
    }

    /** Continuous trail left behind active ball */
    createTrailParticle(x, y, radius, toolType) {
        if (!toolType) {
            // Subtle roll trail
            if (Math.random() < 0.3) {
                this.particles.push({
                    type: 'circle',
                    x: x - radius * 0.5 + (Math.random() - 0.5) * 4,
                    y: y + (Math.random() - 0.5) * 6,
                    vx: -40 - Math.random() * 30,
                    vy: (Math.random() - 0.5) * 20,
                    radius: 2 + Math.random() * 2,
                    grow: -1,
                    color: 'rgba(255, 90, 70, 0.45)',
                    alpha: 0.5,
                    decay: 2.5,
                    gravity: 0
                });
            }
            return;
        }

        let color = '#fff';
        if (toolType === 'growth') color = 'rgba(255, 107, 53, 0.7)';
        if (toolType === 'shrink') color = 'rgba(0, 210, 255, 0.7)';
        if (toolType === 'superJump') color = 'rgba(56, 239, 125, 0.7)';

        this.particles.push({
            type: 'circle',
            x: x - radius * 0.6 + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * (radius * 0.8),
            vx: -70 - Math.random() * 40,
            vy: (Math.random() - 0.5) * 40,
            radius: 3 + Math.random() * (radius * 0.3),
            grow: -2,
            color: color,
            alpha: 0.7,
            decay: 2.2,
            gravity: 10
        });
    }

    /** Breakable block smash rubble */
    createBlockDebris(x, y, w, h, color = '#b3541e') {
        const count = 16;
        for (let i = 0; i < count; i++) {
            const px = x + Math.random() * w;
            const py = y + Math.random() * h;
            this.particles.push({
                type: 'rect',
                x: px,
                y: py,
                w: 6 + Math.random() * 8,
                h: 6 + Math.random() * 8,
                vx: (Math.random() - 0.5) * 220,
                vy: -100 - Math.random() * 200,
                rotation: Math.random() * Math.PI,
                rotSpeed: (Math.random() - 0.5) * 12,
                color: color,
                alpha: 1.0,
                decay: 1.3,
                gravity: 550
            });
        }
        this.createFloatingText('CRUSH!', x + w / 2, y, '#ff9f43', 16);
    }

    /** Ball pop / death rubber fragments */
    createBallPop(x, y, radius) {
        const count = 24;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
            const speed = 120 + Math.random() * 200;
            this.particles.push({
                type: 'rect',
                x: x,
                y: y,
                w: 4 + Math.random() * 6,
                h: 4 + Math.random() * 6,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rotation: Math.random() * Math.PI,
                rotSpeed: (Math.random() - 0.5) * 14,
                color: i % 2 === 0 ? '#ff3838' : '#ff793f',
                alpha: 1.0,
                decay: 1.1,
                gravity: 600
            });
        }
    }

    /** Confetti celebration at finish line */
    createConfetti(x, y, count = 70) {
        const colors = ['#ff3838', '#ffd700', '#2ed573', '#1e90ff', '#ff6b81', '#9b59b6'];
        for (let i = 0; i < count; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
            const speed = 180 + Math.random() * 320;
            this.particles.push({
                type: 'confetti',
                x: x + (Math.random() - 0.5) * 60,
                y: y,
                w: 6 + Math.random() * 6,
                h: 10 + Math.random() * 8,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1.0,
                decay: 0.5 + Math.random() * 0.4,
                gravity: 300,
                flutter: Math.random() * Math.PI * 2
            });
        }
    }

    /** Floating text notification (+100, POWER UP, etc.) */
    createFloatingText(text, x, y, color = '#fff', fontSize = 14) {
        this.floatingTexts.push({
            text,
            x,
            y,
            vy: -45,
            color,
            fontSize,
            alpha: 1.0,
            decay: 1.2
        });
    }

    update(dt) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += (p.gravity || 0) * dt;

            if (p.rotSpeed) p.rotation += p.rotSpeed * dt;
            if (p.grow) p.radius = Math.max(0.5, p.radius + p.grow * dt);
            if (p.flutter !== undefined) {
                p.flutter += dt * 8;
                p.vx += Math.sin(p.flutter) * 30 * dt;
            }

            p.alpha -= p.decay * dt;
            if (p.alpha <= 0 || (p.radius && p.radius <= 0)) {
                this.particles.splice(i, 1);
            }
        }

        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy * dt;
            ft.alpha -= ft.decay * dt;
            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    draw(ctx, cameraX, cameraY) {
        ctx.save();

        // Draw regular particles
        for (const p of this.particles) {
            ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
            ctx.fillStyle = p.color;

            const screenX = p.x - cameraX;
            const screenY = p.y - cameraY;

            if (p.type === 'circle') {
                ctx.beginPath();
                ctx.arc(screenX, screenY, Math.max(0.5, p.radius), 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'spark') {
                ctx.beginPath();
                ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'rect') {
                ctx.save();
                ctx.translate(screenX, screenY);
                ctx.rotate(p.rotation || 0);
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            } else if (p.type === 'star') {
                ctx.save();
                ctx.translate(screenX, screenY);
                ctx.rotate(p.rotation || 0);
                ctx.beginPath();
                for (let s = 0; s < 4; s++) {
                    const rot = (s * Math.PI) / 2;
                    ctx.lineTo(Math.cos(rot) * p.radius * 2, Math.sin(rot) * p.radius * 2);
                    ctx.lineTo(Math.cos(rot + Math.PI / 4) * (p.radius * 0.6), Math.sin(rot + Math.PI / 4) * (p.radius * 0.6));
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            } else if (p.type === 'confetti') {
                ctx.save();
                ctx.translate(screenX, screenY);
                ctx.rotate(p.rotation || 0);
                const scaleW = Math.cos(p.flutter || 0);
                ctx.scale(scaleW, 1);
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            }
        }

        // Draw floating texts
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const ft of this.floatingTexts) {
            ctx.globalAlpha = Math.max(0, Math.min(1, ft.alpha));
            ctx.font = `bold ${ft.fontSize}px 'Outfit', sans-serif`;

            const sx = ft.x - cameraX;
            const sy = ft.y - cameraY;

            // Retro text outline
            ctx.fillStyle = '#000000';
            ctx.fillText(ft.text, sx + 1, sy + 1);
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, sx, sy);
        }

        ctx.restore();
    }
}
