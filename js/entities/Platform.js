export class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'normal', 'bounce', 'hazard', 'goal'
    }
    
    draw(ctx) {
        ctx.save();
        
        if (this.type === 'normal') {
            ctx.fillStyle = '#222';
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 2;
        } else if (this.type === 'bounce') {
            ctx.fillStyle = '#f0f';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#f0f';
        } else if (this.type === 'hazard') {
            ctx.fillStyle = '#f00';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#f00';
        } else if (this.type === 'goal') {
            ctx.fillStyle = '#0f0';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#0f0';
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        if (this.type === 'normal') {
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        
        ctx.restore();
    }
}
