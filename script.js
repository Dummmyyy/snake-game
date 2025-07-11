const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const pauseBtn = document.getElementById("pauseBtn");

// Настройки игры
const gridSize = 20;
let snake = [{ x: 200, y: 200 }];
let food = { x: 0, y: 0 };
let dx = gridSize;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameSpeed = 150;
let isPaused = false;
let gameInterval;

// Инициализация игры
function initGame() {
    createFood();
    highScoreElement.textContent = highScore;
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// Игровой цикл
function gameLoop() {
    if (isPaused) return;
    
    update();
    draw();
}

// Обновление состояния игры
function update() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Проверка на съедение еды
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        
        // Увеличиваем скорость каждые 50 очков
        if (score % 50 === 0) {
            clearInterval(gameInterval);
            gameSpeed = Math.max(gameSpeed - 10, 50);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
        
        createFood();
    } else {
        snake.pop();
    }

    // Проверка на столкновения
    if (
        head.x < 0 || head.x >= canvas.width ||
        head.y < 0 || head.y >= canvas.height ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        gameOver();
    }
}

// Отрисовка игры
function draw() {
    // Очистка холста
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовка змейки
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#4CAF50" : "#2E7D32";
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        
        // Границы сегментов
        ctx.strokeStyle = "#000";
        ctx.strokeRect(segment.x, segment.y, gridSize, gridSize);
    });

    // Отрисовка еды
    ctx.fillStyle = "#FF5252";
    ctx.beginPath();
    ctx.arc(
        food.x + gridSize / 2,
        food.y + gridSize / 2,
        gridSize / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Создание еды
function createFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
    
    // Проверяем, чтобы еда не появилась на змейке
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        createFood();
    }
}

// Конец игры
function gameOver() {
    clearInterval(gameInterval);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
        highScoreElement.textContent = highScore;
    }
    
    alert(`Игра окончена! Ваш счёт: ${score}`);
    resetGame();
}

// Сброс игры
function resetGame() {
    snake = [{ x: 200, y: 200 }];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 150;
    isPaused = false;
    pauseBtn.textContent = "Пауза (Пробел)";
    initGame();
}

// Управление
document.addEventListener("keydown", e => {
    if (e.key === " " || e.key === "Spacebar") {
        togglePause();
    } else if (!isPaused) {
        const key = e.key;
        const goingUp = dy === -gridSize;
        const goingDown = dy === gridSize;
        const goingLeft = dx === -gridSize;
        const goingRight = dx === gridSize;

        if (key === "ArrowUp" && !goingDown) {
            dx = 0;
            dy = -gridSize;
        } else if (key === "ArrowDown" && !goingUp) {
            dx = 0;
            dy = gridSize;
        } else if (key === "ArrowLeft" && !goingRight) {
            dx = -gridSize;
            dy = 0;
        } else if (key === "ArrowRight" && !goingLeft) {
            dx = gridSize;
            dy = 0;
        }
    }
});

// Пауза
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "Продолжить (Пробел)" : "Пауза (Пробел)";
}

pauseBtn.addEventListener("click", togglePause);

// Старт игры
initGame();

function drawFood() {
    const pulse = (Date.now() % 1000) / 1000; // 0..1
    const size = gridSize * (0.8 + pulse * 0.2);
    
    ctx.fillStyle = "#FF5252";
    ctx.beginPath();
    ctx.arc(
        food.x + gridSize/2,
        food.y + gridSize/2,
        size/2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

const walls = [
    {x: 100, y: 100, width: 200, height: 20},
    {x: 50, y: 300, width: 20, height: 100}
];

function checkWallCollision(head) {
    return walls.some(wall => 
        head.x < wall.x + wall.width &&
        head.x + gridSize > wall.x &&
        head.y < wall.y + wall.height &&
        head.y + gridSize > wall.y
    );
}

// В игровом цикле:
if (checkWallCollision(head)) gameOver();

function drawWalls() {
    ctx.fillStyle = "#555";
    walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}