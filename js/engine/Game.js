import { InputHandler } from './Input.js';
import { Physics } from './Physics.js';
import { Ball } from '../entities/Ball.js';
import { level1 } from '../levels/level1.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = new InputHandler();
        
        this.state = 'MENU'; // MENU, PLAYING, GAMEOVER, WON
        this.lastTime = 0;
        
        // Setup UI elements
        this.uiMenu = document.getElementById('main-menu');
        this.uiGameOver = document.getElementById('game-over');
        this.uiHud = document.getElementById('hud');
        this.scoreVal = document.getElementById('score-val');
        this.finalScore = document.getElementById('final-score');
        
        this.btnStart = document.getElementById('start-btn');
        this.btnRestart = document.getElementById('restart-btn');
        
        this.btnStart.addEventListener('click', () => this.start());
        this.btnRestart.addEventListener('click', () => this.start());
        
        // Resize handler
        window.addEventListener('resize', () => this.resize());
        this.resize();
        
        // Objects
        this.ball = null;
        this.platforms = [];
    }
    
    resize() {
        // Internal resolution vs display resolution
        // Fixed internal resolution for consistent gameplay
        this.canvas.width = 1200;
        this.canvas.height = 800;
    }
    
    start() {
        this.state = 'PLAYING';
        this.uiMenu.classList.add('hidden');
        this.uiGameOver.classList.add('hidden');
        this.uiHud.classList.remove('hidden');
        
        this.ball = new Ball(level1.spawnPoint.x, level1.spawnPoint.y);
        this.platforms = level1.platforms;
        
        this.lastTime = performance.now();
        this.startTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }
    
    loop(time) {
        if (this.state !== 'PLAYING') return;
        
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;
        
        this.update(deltaTime);
        this.draw();
        
        if (this.state === 'PLAYING') {
            requestAnimationFrame((time) => this.loop(time));
        }
    }
    
    update(dt) {
        this.ball.update(this.input, this.canvas.width, this.canvas.height);
        
        if (this.ball.isDead) {
            this.gameOver(false);
            return;
        }
        
        // Collisions
        for (let p of this.platforms) {
            let collision = Physics.checkCollisionRectCircle(p, this.ball);
            if (collision.collided) {
                if (p.type === 'hazard') {
                    this.gameOver(false);
                    return;
                } else if (p.type === 'goal') {
                    this.gameOver(true);
                    return;
                }
                
                // Normal collision resolution
                let originalRestitution = Physics.restitution;
                if (p.type === 'bounce') {
                    Physics.restitution = 1.2; // Extra bouncy
                } else {
                    Physics.restitution = 0.5; // Normal platform absorbs energy
                }
                
                Physics.resolveCollision(this.ball, collision);
                Physics.restitution = originalRestitution; // reset
            }
        }
        
        // Update score (timer)
        this.ball.score = Math.floor((performance.now() - this.startTime) / 100);
        this.scoreVal.innerText = this.ball.score;
    }
    
    draw() {
        // Clear screen
        this.ctx.fillStyle = '#12121a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid background for cool effect
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
        
        for (let p of this.platforms) {
            p.draw(this.ctx);
        }
        
        this.ball.draw(this.ctx);
    }
    
    gameOver(won) {
        this.state = won ? 'WON' : 'GAMEOVER';
        this.uiHud.classList.add('hidden');
        this.uiGameOver.classList.remove('hidden');
        
        const title = this.uiGameOver.querySelector('h1');
        if (won) {
            title.innerText = 'You Win!';
            title.style.textShadow = '0 0 20px #0f0, 0 0 40px #0f0';
        } else {
            title.innerText = 'Game Over';
            title.style.textShadow = '0 0 20px #f00, 0 0 40px #f00';
        }
        
        this.finalScore.innerText = won ? `Time: ${this.ball.score}` : 'You Died';
    }
}
