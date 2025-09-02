const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

// Configuración del juego
const gameWidth = 320;
const gameHeight = 480;
canvas.width = gameWidth;
canvas.height = gameHeight;

let score = 0;
let time = 60;
let gameSpeed = 5;

// Coche del jugador
const player = {
    x: gameWidth / 2,
    y: gameHeight - 50,
    width: 30,
    height: 40,
    speed: 5
};

// Pista (road)
let roadPoints = [];

// Función para generar la pista
function generateRoad() {
    roadPoints = [];
    let roadWidth = gameWidth * 0.4;
    let roadCenter = gameWidth / 2;

    for (let i = 0; i < 200; i++) {
        roadPoints.push({
            x: roadCenter + Math.sin(i * 0.05) * 50,
            width: roadWidth
        });
        roadWidth = Math.max(gameWidth * 0.1, roadWidth * 0.99); // La pista se hace más angosta
    }
}

// Función para dibujar el coche
function drawPlayer() {
    ctx.fillStyle = '#ffc800'; // Color del coche
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
}

// Función para dibujar la pista y las líneas
function drawRoad() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, gameWidth, gameHeight); // Fondo del cielo

    for (let i = 0; i < roadPoints.length; i++) {
        const p1 = roadPoints[i];
        const p2 = roadPoints[i + 1];

        if (!p2) continue;

        const y1 = gameHeight - i * gameSpeed;
        const y2 = gameHeight - (i + 1) * gameSpeed;

        const x1Left = p1.x - p1.width / 2;
        const x1Right = p1.x + p1.width / 2;
        const x2Left = p2.x - p2.width / 2;
        const x2Right = p2.x + p2.width / 2;

        // Dibujar el camino
        ctx.beginPath();
        ctx.moveTo(x1Left, y1);
        ctx.lineTo(x2Left, y2);
        ctx.lineTo(x2Right, y2);
        ctx.lineTo(x1Right, y1);
        ctx.closePath();
        ctx.fillStyle = '#555';
        ctx.fill();

        // Dibujar las líneas
        ctx.fillStyle = '#fff';
        if (i % 10 === 0) { // Líneas blancas
            ctx.fillRect(x1Left + 5, y1, 5, 20);
            ctx.fillRect(x1Right - 10, y1, 5, 20);
        }
    }
}

// Lógica de movimiento
let movingLeft = false;
let movingRight = false;

function movePlayer() {
    if (movingLeft) {
        player.x -= player.speed;
    }
    if (movingRight) {
        player.x += player.speed;
    }

    // Limitar al coche dentro de la pantalla
    player.x = Math.max(player.width / 2, Math.min(gameWidth - player.width / 2, player.x));
}

// Bucle principal del juego
function update() {
    movePlayer();
    drawRoad();
    drawPlayer();

    // Actualizar la puntuación
    score += 1;
    scoreDisplay.textContent = `SCORE: ${score}`;

    // Desplazar la pista
    for (let i = 0; i < gameSpeed; i++) {
        roadPoints.shift();
    }
    if (roadPoints.length < 50) {
        generateRoad();
    }

    requestAnimationFrame(update);
}

// Controles para dispositivos móviles
leftBtn.addEventListener('mousedown', () => movingLeft = true);
leftBtn.addEventListener('mouseup', () => movingLeft = false);
leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); movingLeft = true; });
leftBtn.addEventListener('touchend', () => movingLeft = false);

rightBtn.addEventListener('mousedown', () => movingRight = true);
rightBtn.addEventListener('mouseup', () => movingRight = false);
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); movingRight = true; });
rightBtn.addEventListener('touchend', () => movingRight = false);

// Iniciar el juego
generateRoad();
update();

// Temporizador
setInterval(() => {
    if (time > 0) {
        time--;
        timeDisplay.textContent = `TIME: ${time}`;
    }
    if (time === 0) {
        alert(`Juego terminado. Tu puntuación final es: ${score}`);
        // Puedes recargar el juego o mostrar una pantalla de game over
    }
}, 1000);
