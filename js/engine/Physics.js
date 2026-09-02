export const Physics = {
    gravity: 0.5,
    friction: 0.9,
    restitution: 0.7, // Bounciness
    
    checkCollisionRectCircle(rect, circle) {
        // Find the closest point to the circle within the rectangle
        let closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        let closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

        // Calculate the distance between the circle's center and this closest point
        let distanceX = circle.x - closestX;
        let distanceY = circle.y - closestY;

        // If the distance is less than the circle's radius, an intersection occurs
        let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        
        if (distanceSquared < (circle.radius * circle.radius)) {
            // Collision normal
            let distance = Math.sqrt(distanceSquared);
            // Handle edge case where distance is 0 (circle center is exactly on the edge)
            if (distance === 0) {
                 distance = 0.01;
            }
            let nx = distanceX / distance;
            let ny = distanceY / distance;
            
            // Penetration depth
            let penetration = circle.radius - distance;
            
            return {
                collided: true,
                nx: nx,
                ny: ny,
                penetration: penetration
            };
        }
        
        return { collided: false };
    },
    
    resolveCollision(circle, collision) {
        // Positional correction
        circle.x += collision.nx * collision.penetration;
        circle.y += collision.ny * collision.penetration;
        
        // Ground detection: If the normal is pointing mostly upwards
        if (collision.ny < -0.5) {
            circle.isGrounded = true;
        }

        // Velocity resolution (Reflection)
        let dotProduct = (circle.vx * collision.nx) + (circle.vy * collision.ny);
        
        // Only bounce if moving towards the surface
        if (dotProduct < 0) {
            circle.vx = circle.vx - (1 + Physics.restitution) * dotProduct * collision.nx;
            circle.vy = circle.vy - (1 + Physics.restitution) * dotProduct * collision.ny;
        }
    }
};
