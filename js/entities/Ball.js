import { Physics } from '../engine/Physics.js';

export class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.color = '#0ff';
        this.isDead = false;
        this.score = 0;
        this.isGrounded = false;
    }

    update(input, width, height) {
        if (this.isDead) return;

        // Apply input
        if (input.isDown('ArrowLeft') || input.isDown('a') || input.isDown('KeyA')) {
            this.vx -= 0.5;
        }
        if (input.isDown('ArrowRight') || input.isDown('d') || input.isDown('KeyD')) {
            this.vx += 0.5;
        }

        // Jump logic
        if ((input.isDown('ArrowUp') || input.isDown('Space') || input.isDown('w') || input.isDown('KeyW')) && this.isGrounded) {
            this.vy = -12; // Jump impulse
            this.isGrounded = false; // Prevent double jumps
        }
        
        // Reset grounded for next frame's collisions
        this.isGrounded = false;

        // Apply friction to horizontal movement
        this.vx *= Physics.friction;

        // Apply gravity
        this.vy += Physics.gravity;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Screen bounds (basic wall collisions)
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -Physics.restitution;
        } else if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -Physics.restitution;
        }

        // Screen bounds (floor - death or bounce)
        if (this.y - this.radius > height) {
            this.isDead = true;
        }
        
        // Ceiling bounce (optional, just to keep in bounds)
        if (this.y - this.radius < -1000) {
            this.y = this.radius - 1000;
            this.vy *= -Physics.restitution;
        }
    }

    draw(ctx) {
        if (this.isDead) return;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        // Neon glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}
