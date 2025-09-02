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
    y: gameHeight - 70,
    width: 60,
    height: 80,
    speed: 5
};

// Pista (road)
let roadPoints = [];
const numSegments = 500;
const segmentLength = 10; 

// Función para generar la pista
function generateRoad() {
    roadPoints = [];
    let x = gameWidth / 2;
    let z = 0;
    let curve = 0;

    for (let i = 0; i < numSegments; i++) {
        const segment = {
            x: x,
            z: z,
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
        z += segmentLength;
    }
}

// Variables para el renderizado 3D básico
const camDepth = 0.5;
const roadWidth = 200;

// Función para dibujar la pista con perspectiva
function drawRoad() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    for (let i = roadPoints.length - 1; i >= 0; i--) {
        const p = roadPoints[i];
        
        // Proyección de perspectiva
        const scale = camDepth / p.z;
        const x_screen = gameWidth / 2 + (p.x - gameWidth / 2) * scale;
        const y_screen = gameHeight - p.z * scale;
        const w_screen = roadWidth * scale;

        // Dibuja los postes solo si están en la pantalla
        if (y_screen > 0 && y_screen < gameHeight) {
            ctx.fillStyle = '#fff';
            if (i % 5 === 0) { // Dibuja postes cada 5 segmentos para que sean más densos
                const postWidth = 5 * scale;
                const postHeight = 30 * scale; // Aumenta la altura de los postes
                
                // Poste izquierdo
                ctx.fillRect(x_screen - w_screen / 2 - postWidth * 2, y_screen, postWidth, postHeight);
                
                // Poste derecho
                ctx.fillRect(x_screen + w_screen / 2 + postWidth, y_screen, postWidth, postHeight);
            }
        }

        // Dibuja el camino (solo para conectar los puntos de la carretera)
        if (i < roadPoints.length - 1) {
            const nextP = roadPoints[i + 1];
            const nextScale = camDepth / nextP.z;

            const x_next = gameWidth / 2 + (nextP.x - gameWidth / 2) * nextScale;
            const y_next = gameHeight - nextP.z * nextScale;
            const w_next = roadWidth * nextScale;

            ctx.beginPath();
            ctx.moveTo(x_screen - w_screen / 2, y_screen);
            ctx.lineTo(x_next - w_next / 2, y_next);
            ctx.lineTo(x_next + w_next / 2, y_next);
            ctx.lineTo(x_screen + w_screen / 2, y_screen);
            ctx.closePath();
            ctx.fillStyle = '#333';
            ctx.fill();
        }
    }
}

// Función para dibujar el coche
function drawPlayer() {
    ctx.fillStyle = '#ffc800';
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
    ctx.fillStyle = '#444';
    ctx.fillRect(player.x - player.width / 2 + 5, player.y - player.height / 2 + 10, player.width - 10, 15);
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
    // Mueve los segmentos del camino hacia adelante
    for (const segment of roadPoints) {
        segment.z -= gameSpeed;
    }

    // Remueve los segmentos que ya pasaron
    while (roadPoints[0] && roadPoints[0].z < -100) { // Un pequeño ajuste en la condición
        roadPoints.shift();
    }
    // Añade nuevos segmentos si es necesario
    while (roadPoints.length < numSegments) {
        const lastSegment = roadPoints[roadPoints.length - 1];
        const newZ = lastSegment.z + segmentLength;
        const newX = lastSegment.x + lastSegment.curve;
        roadPoints.push({
            x: newX,
            z: newZ,
            curve: lastSegment.curve
        });
    }

    movePlayer();
    drawRoad();
    drawPlayer();

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
