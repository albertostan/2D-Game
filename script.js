const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const backgroundImage = new Image();
backgroundImage.src = 'images/pxfuel.jpg';

const characterImage = new Image();
characterImage.src = 'images/descărcare.jpg';

let backgroundScroll = 0;

let obstacles = [
    { x: 200, y: canvas.height - 95, width: 50, height: 50 },
    { x: 400, y: canvas.height - 170, width: 50, height: 50 },
    { x: 700, y: canvas.height - 120, width: 50, height: 50 }
];

let obstacleSpeed = 2;

let currentLevel = 1;

let gameOver = false;

const levels = {
    1: [
        { x: 200, y: canvas.height - 95, width: 50, height: 50 },
        { x: 400, y: canvas.height - 170, width: 50, height: 50 },
        { x: 700, y: canvas.height - 120, width: 50, height: 50 }
    ],
    2: [
        { x: 200, y: canvas.height - 95, width: 50, height: 50 },
        { x: 400, y: canvas.height - 170, width: 50, height: 50 },
        { x: 600, y: canvas.height - 220, width: 50, height: 50 },
        { x: 800, y: canvas.height - 140, width: 50, height: 50 }
    ],
    3: [
        { x: 200, y: canvas.height - 95, width: 50, height: 50 },
        { x: 400, y: canvas.height - 170, width: 50, height: 50 },
        { x: 600, y: canvas.height - 220, width: 50, height: 50 },
        { x: 800, y: canvas.height - 140, width: 50, height: 50 },
    ],
    4: [
        { x: 200, y: canvas.height - 95, width: 50, height: 70 },
        { x: 400, y: canvas.height - 170, width: 50, height: 70 },
        { x: 600, y: canvas.height - 220, width: 50, height: 70 },
        { x: 1000, y: canvas.height - 230, width: 50, height: 70 },
    ],
};

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
};

// Character properties
let character = {
    x: 50,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5,
    velocity: 0,
    jumping: false
};
// Platform properties
let platform = {
    x: 0,
    y: canvas.height - 45,
    width: canvas.width,
    height: 50
};

// Handle keyboard input
let keys = {};
window.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
});
window.addEventListener("keyup", function(e) {
    delete keys[e.keyCode];
});

// Update game objects
function update() {
    if (gameOver) return;

    updateLevel(currentLevel);

    // Move character
    if (keys[37]) { // Left arrow
        character.x -= character.speed;
        if (character.x < 0) {
            character.x = 0;
        }
    }
    if (keys[39]) { // Right arrow
        character.x += character.speed;
        if (character.x + character.width > canvas.width) {
            character.x = canvas.width - character.width;
        }
    }
    if (keys[38] && !character.jumping) { // Up arrow
        character.velocity = -10;
        character.jumping = true;
    }

    // Gravity
    character.velocity += 0.5;
    character.y += character.velocity;

    // Collision with platform
    if (character.y > platform.y - character.height) {
        character.y = platform.y - character.height;
        character.jumping = false;
    };

    character.y = Math.max(0, Math.min(canvas.height - character.height, character.y));

    // Update background scroll position
    backgroundScroll += 1;

    obstacles.forEach(obstacle => {
        // Collision detection for each side of the character
        const topCollision = character.y < obstacle.y + obstacle.height && character.y + character.height > obstacle.y && character.x + character.width > obstacle.x && character.x < obstacle.x + obstacle.width;
        const bottomCollision = character.y + character.height > obstacle.y && character.y < obstacle.y && character.x + character.width > obstacle.x && character.x < obstacle.x + obstacle.width;
        const leftCollision = character.x + character.width > obstacle.x && character.x < obstacle.x && character.y + character.height > obstacle.y && character.y < obstacle.y + obstacle.height;
        const rightCollision = character.x < obstacle.x + obstacle.width && character.x + character.width > obstacle.x + obstacle.width && character.y + character.height > obstacle.y && character.y < obstacle.y + obstacle.height;

        if (topCollision || bottomCollision || leftCollision || rightCollision) {
            if (leftCollision) {
                // Move character to the left of the obstacle
                character.x = obstacle.x - character.width;
                // Gradually decrease character's speed to simulate deceleration
                character.speed = 5; // Adjust the deceleration rate as needed
                // Stop character's movement if speed becomes too low
                if (Math.abs(character.speed) < 0.5) {
                    character.speed = 0;
                };
                character.jumping = false;
            }
        };
        
        // Check if character reaches the right side of the canvas
        if (character.x + character.width >= canvas.width) {
            // Increment currentLevel
            currentLevel++;

            // Reset character position
            character.x = 50;
            character.y = canvas.height - 100;

            // Update level-specific properties
            updateLevel(currentLevel);
        }
    });

    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed; // Move obstacle to the left
        if (obstacle.x + obstacle.width < 0) {
            // Reset obstacle position if it moves out of the canvas
            obstacle.x = canvas.width; // Move obstacle to the right side of the canvas
        }
    });

    if (currentLevel === 3 && character.x <= 0) {
        gameOver = true;
    };

    if (character.x <= 0) {
        gameOver = true;
    }
};




function resetGame() {
    character.x = 50;
    character.y = canvas.height - 100;

    character.speed = 5;

    gameOver = false;
};

// Add event listener for keydown event
window.addEventListener("keydown", function(event) {
    // Check if the game is over and any key is pressed
    if (gameOver) {
        // Reset the game
        resetGame();
    }
});


// Render game objects
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw obstacles
    ctx.fillStyle = "blue";
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw character
    ctx.drawImage(characterImage, character.x, character.y, character.width, character.height);

    renderLevel(currentLevel);
    if (gameOver) {
        renderGameOver();
    };
};

canvas.addEventListener('click', function(event) {
    if (gameOver) {
        const restartButtonX = canvas.width / 2 - 80;
        const restartButtonY = canvas.height / 2;
        const restartButtonWidth = 160;
        const restartButtonHeight = 40;

        if (
            event.clientX >= restartButtonX &&
            event.clientX <= restartButtonX + restartButtonWidth &&
            event.clientY >= restartButtonY &&
            event.clientY <= restartButtonY + restartButtonHeight
        ) {
            resetGame();
        }
    }
});


function updateLevel(level) {
    // Clear obstacles array before adding obstacles for the current level
    obstacles = [];

    switch (level) {
        case 1:
            obstacleSpeed = 2;
            levels[1].forEach(obstacle => obstacles.push(obstacle));
            break;
        case 2:
            obstacleSpeed = 4;
            levels[2].forEach(obstacle => obstacles.push(obstacle));
            break;
        case 3:
            obstacleSpeed = 6;
            levels[3].forEach(obstacle => obstacles.push(obstacle));
            break;
        case 4:
            obstacleSpeed = 8;
            levels[4].forEach(obstacle => obstacles.push(obstacle));
            break;
        default:
            break;
    }
};


function renderLevel(level) {
    // This function can handle different rendering for each level
    const obstacles = levels[level];
    obstacles.forEach(obstacle => {
        ctx.fillStyle = "blue";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
};

function renderGameOver() {
    // Render game over message and restart button
    ctx.fillStyle = "black";
    ctx.font = "50px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2 - 50);

    ctx.fillStyle = "#007bff"; // Blue
    ctx.fillRect(canvas.width / 2 - 80, canvas.height / 2, 210, 40);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Press any key", canvas.width / 2 - 35, canvas.height / 2 + 25);
}

gameLoop();
