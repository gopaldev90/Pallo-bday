document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript loaded');
    let scoreElement = document.querySelector('#score h3');
    let score = 0;

    const knife = document.getElementById('knife');
    const cake = document.querySelector('.orbit img'); // Select the cake image
    const redDot = document.querySelector('.center-dot'); // Select the red dot

    if (!knife || !cake || !redDot) {
        console.error('Knife, Cake, or Red Dot element not found');
        return;
    }

    // Function to calculate the knife tip position after rotation
    function getKnifeTipPosition() {
        // Get the knife's bounding rectangle
        const knifeRect = knife.getBoundingClientRect();
        const knifeCenterX = knifeRect.left + knifeRect.width / 2;
        const knifeCenterY = knifeRect.top + knifeRect.height / 2;

        // Get the current rotation of the knife (if any)
        const computedStyle = window.getComputedStyle(knife);
        const transformMatrix = computedStyle.transform;

        let knifeTip = { x: knifeCenterX, y: knifeCenterY + knifeRect.height / 2 }; // Default knife tip

        // Check if the knife has been rotated using a transform matrix
        if (transformMatrix !== 'none') {
            const values = transformMatrix.split('(')[1].split(')')[0].split(',');
            const a = parseFloat(values[0]); // cos(θ)
            const b = parseFloat(values[1]); // sin(θ)
            const angle = Math.atan2(b, a);  // θ (rotation angle in radians)

            // Calculate the knife tip's position based on the angle of rotation
            const halfHeight = knifeRect.height / 2;
            knifeTip = {
                x: knifeCenterX + Math.sin(angle) * halfHeight,
                y: knifeCenterY - Math.cos(angle) * halfHeight
            };
        }

        return knifeTip;
    }

    document.addEventListener('click', function(event) {
        console.log('Page clicked!');

        // Calculate the knife tip position on each click (considering the rotation)
        const knifeTip = getKnifeTipPosition();

        let projectile = document.createElement('div');
        projectile.classList.add('projectile');  // Assuming you have some styling for this

        // Position the projectile at the knife tip (where the red dot is)
        projectile.style.left = (knifeTip.x - 5) + 'px'; // Adjust for center
        projectile.style.top = (knifeTip.y - 5) + 'px';  // Adjust for center

        document.body.appendChild(projectile);

        // Launch the projectile in a straight line
        launchProjectile(projectile, knifeTip);
    });

    // Function to launch the projectile in a straight line
    function launchProjectile(projectile, knifeTip) {
        // i want to play sound here
        const ls = new Audio('launch.mp3');  // Load the sound file
        const ms = new Audio('Missed.mp3');
    ls.play();  
    let startTime = null;
    const duration = 1000;  // Duration of the animation in milliseconds

    // Calculate the direction vector from the knife tip
    const knifeAngle = getKnifeAngle(); // This function should return the angle in radians
    const speed = 0.5;  // Speed of the projectile

    // Compute a perpendicular direction to the knife's angle
    const directionX = Math.cos(knifeAngle + Math.PI / 2) * speed;
    const directionY = Math.sin(knifeAngle + Math.PI / 2) * speed;

    function animate(time) {
        if (!startTime) startTime = time;
        const elapsedTime = time - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Move the projectile in a straight line
        const currentX = knifeTip.x + progress * directionX * duration;
        const currentY = knifeTip.y + progress * directionY * duration;

        projectile.style.left = currentX + 'px';
        projectile.style.top = currentY + 'px';

        // Check for collision on every animation frame
        if (isCollision(projectile, cake)) {
            score += 1;
            console.log('Projectile hit the cake!');
            projectile.remove();  // Remove projectile immediately after collision
        } else if (progress >= 1) {
            score = 0;
            ms.play();
            projectile.remove();
        } else {
            requestAnimationFrame(animate);
        }
        scoreElement.textContent = score;
        if(score>20){
            
            window.location.href = 'won.html';
        }
    }

    requestAnimationFrame(animate);
}

    // Function to get the angle of the knife in radians
    function getKnifeAngle() {
        const computedStyle = window.getComputedStyle(knife);
        const transformMatrix = computedStyle.transform;

        if (transformMatrix !== 'none') {
            const values = transformMatrix.split('(')[1].split(')')[0].split(',');
            const a = parseFloat(values[0]); // cos(θ)
            const b = parseFloat(values[1]); // sin(θ)
            return Math.atan2(b, a);  // θ (rotation angle in radians)
        }
        return 0;  // No rotation
    }

    // Improved Collision detection function for the cake image
    function isCollision(projectile, cake) {
        const projectileRect = projectile.getBoundingClientRect();
        const cakeRect = cake.getBoundingClientRect();

        // Get the center points of the projectile and the cake image
        const projectileCenterX = projectileRect.left + projectileRect.width / 2;
        const projectileCenterY = projectileRect.top + projectileRect.height / 2;
        const cakeCenterX = cakeRect.left + cakeRect.width / 2;
        const cakeCenterY = cakeRect.top + cakeRect.height / 2;

        // Calculate the radius of the cake (since it's circular with border-radius: 50%)
        const cakeRadius = cakeRect.width / 2;

        // Calculate the distance between the center of the projectile and the cake's center
        const distance = Math.sqrt(
            Math.pow(projectileCenterX - cakeCenterX, 2) +
            Math.pow(projectileCenterY - cakeCenterY, 2)
        );

        // Check if the distance is less than or equal to the radius of the cake
        return distance <= cakeRadius;
    }
});
