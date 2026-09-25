// 24.08.2026 
// handdodgegame 

//connect JS to canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const webcam = document.getElementById("webcam");

// browser API
async function startWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });

    webcam.srcObject = stream;
    webcam.play();
}

// create hand detector
const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
})

// hand detector 
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// detect landmarks on hand
hands.onResults((results) => {
    if (results.multiHandLandmarks.length > 0) {

        const landmarks = results.multiHandLandmarks[0];

        const indexFingerTip = landmarks[8];

        player.x = 
            (1 - indexFingerTip.x) * 
            (canvas.width - player.width);
    }
});

// connect webcam frames to mediapipe
const camera = new Camera(webcam, {
    onFrame: async () => {
        await hands.send({ image: webcam });
    },
    width: 640,
    height: 480
});

// player info
const player = {
    x: 375,
    y: 500,
    width: 50,
    height: 50,
    speed: 10,
};

// function for drawing player
function drawPlayer() {
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

drawPlayer();

// funct create obstacle
const obstacle = {
    x: 200,
    y: 0,
    width: 40,
    height: 40,
    speed: 3
};

// score, lives, gameover vars
let score = 0;
let lives = 3;
let gameOver = false;
let highScore = 0;

// drawing function for obstacle
function drawObstacle() {
    ctx.fillStyle = "orange";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

// draw score
function drawScore() {
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 10, 30);
    ctx.fillText("High Score: " + highScore, 10, 60);
}

// function for lives
function drawLives() {
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Lives: " + lives, 10, 90);
}

function drawGameOver() {
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 40);
}

// restart control
function restartGame() {
    score = 0;
    lives = 3;
    gameOver = false;

    player.x = 375;
    player.y = 500;

    obstacle.x = 200;
    obstacle.y = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    gameLoop();
}

// collision detection
function checkCollision() {
    return (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
    );
}

// funct to move player character
document.addEventListener("keydown", function(event) {
    // move left
    if (event.key === "ArrowLeft") {
        player.x -= player.speed;
    }

    // move right
    if (event.key === "ArrowRight") {
        player.x += player.speed;
    }

    // left boundary
    if (player.x < 0) {
        player.x = 0;
    }

    // right boundary
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // restart
    if (event.key === "r" && gameOver) {
        restartGame();
    }
});

// game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // moving obstacle
    obstacle.y += obstacle.speed;

    if (obstacle.y > canvas.height) {
        score++;
        if (score > highScore) {
            highScore = score;
        }
        obstacle.y = 0;
        obstacle.x = Math.random() * (canvas.width - obstacle.width);
    }

    // collision detection
    if (checkCollision()) {
        lives--;

        obstacle.y = 0;
        obstacle.x = Math.random() * (canvas.width - obstacle.width);

        if (lives === 0) {
            gameOver = true;
        }
    }

    drawPlayer();
    drawObstacle();
    drawScore();
    drawLives();

    if (gameOver) {
        drawGameOver();
    } else {
        requestAnimationFrame(gameLoop);
    }

}

gameLoop();
camera.start();

