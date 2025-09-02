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
let gameSpeed = 5; // Velocidad ajustada para que las líneas se vean bien

// Coche del jugador
const player = {
    x: gameWidth / 2,
    y: gameHeight - 70,
    width: 60,
    height: 80,
    speed: 5
};

// Pista (road)
let roadPoints = [];
const numSegments = 500;

// Función para generar la pista
function generateRoad() {
    roadPoints = [];
    let x = gameWidth / 2;
    let curve = 0;

    for (let i = 0; i < numSegments; i++) {
        const segment = {
            x: x,
            z: i,
            curve: curve
        };
        roadPoints.push(segment);

        if (i % 50 === 0) {
            curve += (Math.random() - 0.5) * 0.5;
        }
        x += curve;
        if (x < gameWidth * 0.2 || x > gameWidth * 0.8) {
            curve *= -1;
        }
    }
}

// Variables para el renderizado 3D básico
const camDepth = 0.5;
const roadWidth = 200;

// Función para dibujar la pista con perspectiva
function drawRoad() {
    ctx.fillStyle = '#000'; // Fondo
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    for (let i = gameSpeed - 1; i >= 0; i--) {
        const p = roadPoints[(i + gameSpeed) % numSegments];
        const nextP = roadPoints[(i + gameSpeed + 1) % numSegments];
        
        const scale = camDepth / (p.z + 0.001);
        const nextScale = camDepth / (nextP.z + 0.001);

        const x1 = gameWidth / 2 + (p.x - gameWidth / 2) * scale;
        const x2 = gameWidth / 2 + (nextP.x - gameWidth / 2) * nextScale;

        const w1 = roadWidth * scale;
        const w2 = roadWidth * nextScale;

        const y1 = gameHeight - i * 10;
        const y2 = gameHeight - (i + 1) * 10;

        // Dibujar el camino (carretera gris)
        ctx.beginPath();
        ctx.moveTo(x1 - w1 / 2, y1);
        ctx.lineTo(x2 - w2 / 2, y2);
        ctx.lineTo(x2 + w2 / 2, y2);
        ctx.lineTo(x1 + w1 / 2, y1);
        ctx.closePath();
        ctx.fillStyle = '#333';
        ctx.fill();

        // Dibujar los postes
        ctx.fillStyle = '#fff';
        if (i % 10 === 0) {
            const lineW1 = 10 * scale;
            const lineW2 = 10 * nextScale;
            
            // Postes izquierdos
            ctx.beginPath();
            ctx.moveTo(x1 - w1 / 2, y1);
            ctx.lineTo(x2 - w2 / 2, y2);
            ctx.lineTo(x2 - w2 / 2 - 5, y2);
            ctx.lineTo(x1 - w1 / 2 - 5, y1);
            ctx.closePath();
            ctx.fill();

            // Postes derechos
            ctx.beginPath();
            ctx.moveTo(x1 + w1 / 2, y1);
            ctx.lineTo(x2 + w2 / 2, y2);
            ctx.lineTo(x2 + w2 / 2 + 5, y2);
            ctx.lineTo(x1 + w1 / 2 + 5, y1);
            ctx.closePath();
            ctx.fill();
        }
    }
}

// Función para dibujar el coche
function drawPlayer() {
    ctx.fillStyle = '#ffc800'; // Color del coche
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);

    // Dibujar el parabrisas
    ctx.fillStyle = '#444';
    ctx.fillRect(player.x - player.width / 2 + 5, player.y - player.height / 2 + 10, player.width - 10, 15);
    
    // Dibujar los faros
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x - player.width / 2 + 5, player.y + player.height / 2 - 10, 10, 5);
    ctx.fillRect(player.x + player.width / 2 - 15, player.y + player.height / 2 - 10, 10, 5);
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

    player.x = Math.max(player.width / 2, Math.min(gameWidth - player.width / 2, player.x));
}

// Bucle principal del juego
function update() {
    movePlayer();
    drawRoad();
    drawPlayer();

    const dx = roadPoints[gameSpeed].x - roadPoints[gameSpeed + 1].x;
    for (let i = 0; i < numSegments; i++) {
        roadPoints[i].z = (roadPoints[i].z - 1) % numSegments;
        if (roadPoints[i].z < 0) {
            roadPoints[i].z += numSegments;
        }
        roadPoints[i].x += dx;
    }

    score += 1;
    scoreDisplay.textContent = `SCORE: ${score}`;

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
    }
}, 1000);
