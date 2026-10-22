/**
 * Bounce Classic - Physics & Collision Engine
 * Realistic 2D bouncing ball dynamics, constant forward motion,
 * elasticity restitution, jump buffering, coyote time, squash & stretch,
 * and precise circle-geometry collision detection.
 */

export class PhysicsEngine {
    constructor() {
        // Core Physics Constants
        this.gravity = 1480;             // Gravity acceleration (px/s^2)
        this.baseForwardSpeed = 260;     // Constant forward speed (px/s)
        this.jumpImpulse = -560;         // Standard jump impulse (px/s)
        this.superJumpImpulse = -780;    // Super Jump impulse (px/s)
        this.restitution = 0.52;         // Bouncing elasticity on landing
        this.superRestitution = 0.72;    // Enhanced elasticity during Super Jump
        this.minBounceVelocity = 110;    // Threshold below which ball rests rather than bouncing infinitely

        // Tuning parameters
        this.coyoteTimeDuration = 0.12;  // Grace period after leaving ledge (seconds)
        this.jumpBufferDuration = 0.15;  // Grace period before landing (seconds)
    }

    /**
     * Updates ball physics for delta time dt (seconds)
     */
    updateBall(ball, dt) {
        // Enforce constant forward velocity
        let targetSpeed = this.baseForwardSpeed;
        if (ball.speedModifier) {
            targetSpeed *= ball.speedModifier;
        }
        ball.vx = targetSpeed;
        ball.x += ball.vx * dt;

        // Apply gravity to vertical velocity
        ball.vy += this.gravity * dt;
        // Cap terminal fall speed
        if (ball.vy > 1100) ball.vy = 1100;

        ball.y += ball.vy * dt;

        // Ball rolling rotation based on forward movement
        const currentRadius = ball.radius;
        const angularVelocity = ball.vx / currentRadius;
        ball.rotation += angularVelocity * dt;

        // Coyote Time & Jump Buffering timers
        if (ball.onGround) {
            ball.coyoteTimer = this.coyoteTimeDuration;
        } else {
            ball.coyoteTimer = Math.max(0, ball.coyoteTimer - dt);
        }

        if (ball.jumpBufferTimer > 0) {
            ball.jumpBufferTimer = Math.max(0, ball.jumpBufferTimer - dt);
        }

        // Squash & Stretch spring recovery
        const springSpeed = 14;
        ball.scaleX += (1 - ball.scaleX) * Math.min(1, springSpeed * dt);
        ball.scaleY += (1 - ball.scaleY) * Math.min(1, springSpeed * dt);

        // Smooth tool radius interpolation
        let targetRadius = ball.baseRadius;
        if (ball.activeTool === 'growth') {
            targetRadius = ball.baseRadius * 1.75;
        } else if (ball.activeTool === 'shrink') {
            targetRadius = ball.baseRadius * 0.58;
        }

        ball.radius += (targetRadius - ball.radius) * Math.min(1, 10 * dt);

        // Power-Up Timer countdown
        if (ball.activeTool && ball.toolTimer > 0) {
            ball.toolTimer -= dt;
            if (ball.toolTimer <= 0) {
                ball.expireTool();
            }
        }
    }

    /**
     * Attempts a player jump
     * Returns true if jump successfully initiated
     */
    triggerJump(ball) {
        const canJump = ball.onGround || ball.coyoteTimer > 0;
        if (canJump) {
            this.executeJump(ball);
            return true;
        } else {
            // Buffer jump request
            ball.jumpBufferTimer = this.jumpBufferDuration;
            return false;
        }
    }

    executeJump(ball) {
        const isSuper = ball.activeTool === 'superJump';
        ball.vy = isSuper ? this.superJumpImpulse : this.jumpImpulse;
        ball.onGround = false;
        ball.coyoteTimer = 0;
        ball.jumpBufferTimer = 0;

        // Upward stretch effect
        ball.scaleX = 0.82;
        ball.scaleY = 1.25;
    }

    /**
     * Resolves collision between ball and an Axis-Aligned Bounding Box (AABB)
     */
    resolveCircleAABB(ball, box) {
        const r = ball.radius;

        // Find closest point on box to circle center
        const closestX = Math.max(box.x, Math.min(ball.x, box.x + box.w));
        const closestY = Math.max(box.y, Math.min(ball.y, box.y + box.h));

        const dx = ball.x - closestX;
        const dy = ball.y - closestY;
        const distSq = dx * dx + dy * dy;

        if (distSq >= r * r) {
            return false; // No collision
        }

        const dist = Math.sqrt(distSq);
        let nx, ny, overlap;

        if (dist > 0.0001) {
            nx = dx / dist;
            ny = dy / dist;
            overlap = r - dist;
        } else {
            // Circle center is inside box - push upward by default
            nx = 0;
            ny = -1;
            overlap = r;
        }

        // Determine dominant penetration axis
        if (Math.abs(ny) >= Math.abs(nx)) {
            // Vertical collision
            if (ny < 0) {
                // Landing on top surface of box
                ball.y = box.y - r;

                const isSuper = ball.activeTool === 'superJump';
                const elasticity = isSuper ? this.superRestitution : this.restitution;

                // Check for buffered jump
                if (ball.jumpBufferTimer > 0) {
                    this.executeJump(ball);
                    return { type: 'jumped', box };
                }

                if (ball.vy > this.minBounceVelocity) {
                    // Natural elastic bounce
                    ball.vy = -ball.vy * elasticity;
                    // Squash on impact
                    const impactRatio = Math.min(1.0, Math.abs(ball.vy) / 600);
                    ball.scaleX = 1 + 0.35 * impactRatio;
                    ball.scaleY = 1 - 0.30 * impactRatio;
                    ball.onGround = false;
                    return { type: 'bounce', box, impact: impactRatio };
                } else {
                    // Resting on ground
                    ball.vy = 0;
                    ball.onGround = true;
                    // Moving platform horizontal velocity transfer
                    if (box.vx) {
                        ball.x += box.vx;
                    }
                    return { type: 'land', box };
                }
            } else {
                // Hitting ceiling / bottom of box
                ball.y = box.y + box.h + r;
                if (ball.vy < 0) ball.vy = 0;
                return { type: 'head_hit', box };
            }
        } else {
            // Horizontal wall collision
            if (nx < 0) {
                // Hit left wall of block
                ball.x = box.x - r;
                return { type: 'wall_hit_front', box };
            } else {
                // Hit right wall of block
                ball.x = box.x + box.w + r;
                return { type: 'wall_hit_back', box };
            }
        }
    }

    /**
     * Checks if ball intersects a triangular spike
     */
    checkSpikeCollision(ball, spike) {
        // Spike has base [x, y+h] to [x+w, y+h] and tip [x+w/2, y] (or inverted if ceiling spike)
        const r = ball.radius * 0.85; // Slightly forgiving hitbox for fair play
        const bx = spike.x;
        const by = spike.y;
        const bw = spike.w;
        const bh = spike.h;

        // Quick AABB bounds check first
        if (ball.x + r < bx || ball.x - r > bx + bw || ball.y + r < by || ball.y - r > by + bh) {
            return false;
        }

        // Distance from tip and center
        const tipX = bx + bw / 2;
        const tipY = spike.inverted ? by + bh : by;

        const distTipSq = (ball.x - tipX) * (ball.x - tipX) + (ball.y - tipY) * (ball.y - tipY);
        if (distTipSq < r * r) return true;

        // Check if inside triangle body
        const relX = (ball.x - bx) / bw; // 0 to 1
        if (relX >= 0 && relX <= 1) {
            let surfaceY;
            if (spike.inverted) {
                // Inverted spike (points downward)
                surfaceY = by + (1 - Math.abs(relX - 0.5) * 2) * bh;
                if (ball.y - r < surfaceY) return true;
            } else {
                // Standard spike (points upward)
                surfaceY = by + bh - (1 - Math.abs(relX - 0.5) * 2) * bh;
                if (ball.y + r > surfaceY) return true;
            }
        }

        return false;
    }

    /**
     * Checks circle-circle distance for collectibles (coins & tools)
     */
    checkCircleCircle(ball, obj) {
        const dx = ball.x - obj.x;
        const dy = ball.y - obj.y;
        const radiusSum = ball.radius + obj.radius;
        return (dx * dx + dy * dy) <= (radiusSum * radiusSum);
    }
}
