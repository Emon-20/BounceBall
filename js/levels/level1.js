import { Platform } from '../entities/Platform.js';

export const level1 = {
    spawnPoint: { x: 100, y: 100 },
    platforms: [
        // Ground
        new Platform(0, 750, 1200, 50, 'normal'),
        
        // Steps
        new Platform(300, 650, 150, 20, 'normal'),
        new Platform(500, 550, 150, 20, 'normal'),
        
        // Bouncy pad
        new Platform(700, 730, 100, 20, 'bounce'),
        
        // High platform
        new Platform(850, 300, 200, 20, 'normal'),
        
        // Hazards
        new Platform(400, 730, 50, 20, 'hazard'),
        
        // Goal
        new Platform(950, 250, 50, 50, 'goal'),
        
        // Left wall
        new Platform(-50, 0, 50, 800, 'normal'),
        // Right wall
        new Platform(1200, 0, 50, 800, 'normal')
    ]
};
