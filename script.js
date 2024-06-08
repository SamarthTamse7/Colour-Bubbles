let startingHtml = `<div id="main">
<h1 id="title">Colour Bubbles</h1>
<div id="showCase">
    <div id="enemy1"></div>
    <div id="enemy2"></div>
    <div id="player"></div>
</div>
<button onclick="startGame()" id="playBtn">Play Game</button>
</div>`;

class player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = 'crimson';
        this.width = 50;
        this.height = 50;
        this.speed = 2;
        this.Apressed = false;
        this.Dpressed = false;
        this.Wpressed = false;
        this.Spressed = false;
        this.firing = false;
        this.timeTillNextBullet = 0;
        this.enemySpeed = 1500;
        this.score = 0;
        this.timeTillNextEnemy = 60;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    createBullet(ctx, xSpeed, ySpeed) {
        let bullet = new Bullet(Player.x + (Player.width / 2) - 2.5, Player.y + (Player.height / 2) - 5, xSpeed, ySpeed);
        bulletsContainer.push(bullet);
        this.timeTillNextBullet = 6;
        this.gunShot();
    }

    createParticle(x, y, color, radius, r, g, b) {
        for (let i = 1; i <= radius; i++) {
            let xSpeed = (Math.random() * (4 - (-4)) + (-4)) * Math.floor(Math.random() * (2.5 - 1) + 1);
            let ySpeed = (Math.random() * (4 - (-4)) + (-4)) * Math.floor(Math.random() * (2.5 - 1) + 1);
            let size = (Math.random() * ((radius / 15) - 1) + 1);
            let part = new particals(x + 2.5, y, xSpeed, ySpeed, size, r, g, b);
            particalsArray.push(part);
        }
        this.bubbleSound();
    }

    createEnemy(ctx) {
        if (this.timeTillNextEnemy <= 0) {
            let radius = Math.floor(Math.random() * (100 - 10) + 10);
            let x = Math.floor(Math.random() * (canvas.width - 10) + 10);
            let y = Math.floor(Math.random() * (0 - (-100)) + (-100));
            let r = Math.floor(Math.random() * (255 - 0) + 0);
            let g = Math.floor(Math.random() * (255 - 0) + 0);
            let b = Math.floor(Math.random() * (255 - 0) + 0);
            let a = 1;
            let color = `rgba(${r}, ${g}, ${b}, ${a})`;

            let xDistance = (canvas.width - x);
            let yDistance = (canvas.height - y);

            let xSpeed = xDistance / this.enemySpeed;
            let ySpeed = yDistance / this.enemySpeed;

            let Enemy = new enemy(x, y, 0, 0.4, color, radius, r, g, b);
            enemyArray.push(Enemy);
            this.timeTillNextEnemy = 60;
        }
    }

    gunShot() {
        let gunShot = document.getElementById('gunsound');
        gunShot.currentTime = 0;
        gunShot.play();
    }

    bubbleSound(){
        let bubbleBlast = document.getElementById('bubblesound');
        bubbleBlast.currentTime = 0;
        bubbleBlast.play();
    }
}

class Bullet {
    constructor(x, y, xSpeed, ySpeed) {
        this.x = x;
        this.y = y;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.damage = 1;
        this.color = 'gold';
        this.radius = 5;
    }

    move(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

}

function renderBullet(ctx) {
    for (let i = 0; i < bulletsContainer.length; i++) {
        bulletsContainer[i].x += bulletsContainer[i].xSpeed;
        bulletsContainer[i].y += bulletsContainer[i].ySpeed;
        bulletsContainer[i].move(ctx);
        let isCollision = collisionWithEnemy(bulletsContainer[i]);
        if (isCollision) {
            bulletsContainer.splice(i, 1);
        }
        if (bulletsContainer[i].y <= (10 - bulletsContainer[i].radius)) {
            bulletsContainer.splice(i, 1);
        }
    }
}

function collisionWithEnemy(obj) {
    for (let i = 0; i < enemyArray.length; i++) {
        if (obj.x > enemyArray[i].x - enemyArray[i].radius && (obj.x) < enemyArray[i].x + enemyArray[i].radius) {
            if (obj.y > enemyArray[i].y && (obj.y) < (enemyArray[i].y + (enemyArray[i].radius))) {
                Player.createParticle(obj.x, obj.y, enemyArray[i].color, enemyArray[i].radius, enemyArray[i].r, enemyArray[i].g, enemyArray[i].b);
                Player.score += Math.floor(enemyArray[i].radius);
                enemyArray.splice(i, 1);
                if (Player.score > 3500) {
                    Player.enemySpeed = 1200;
                }
                return true;
            }
        }
    }
    return false;
}

function renderParticle(ctx) {
    for (let i = 0; i < particalsArray.length; i++) {
        particalsArray[i].x += particalsArray[i].xSpeed;
        particalsArray[i].y += particalsArray[i].ySpeed;
        particalsArray[i].alpha -= 0.01;
        particalsArray[i].color = `rgba(${particalsArray[i].r}, ${particalsArray[i].g}, ${particalsArray[i].b}, ${particalsArray[i].alpha})`;
        particalsArray[i].draw(ctx);
        if (particalsArray[i].alpha <= 0) {
            particalsArray.shift();
        }
    }
}

function renderEnemy(ctx) {
    for (let i = 0; i < enemyArray.length; i++) {
        enemyArray[i].x += enemyArray[i].xSpeed;
        enemyArray[i].y += enemyArray[i].ySpeed;
        enemyArray[i].draw(ctx);
        if (enemyArray[i].y + (enemyArray[i].radius) > canvas.height) {
            clearInterval(gameLoop);
            alert('Game Over \nYour Score : ' + Player.score);
            let ans = confirm('Do You Want To Play Again');
            if (ans) {
                startGame();
            }else{
                document.body.innerHTML = startingHtml;
            }
        }
    }
}

class particals {
    constructor(x, y, xSpeed, ySpeed, size, r, g, b) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.alpha = 1;
        this.color = `rgba(${r}, ${g}, ${b},1)`;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.r = r;
        this.g = g;
        this.b = b;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

}

class enemy {
    constructor(x, y, xSpeed, ySpeed, color, radius, r, g, b) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.r = r;
        this.g = g;
        this.b = b;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }



}

let Player;
let bulletsContainer = [];
let particalsArray = [];
let enemyArray = [];

function game() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    Player.draw(ctx);
    if (bulletsContainer.length > 0) {
        renderBullet(ctx);
    }
    if (particalsArray.length > 0) {
        renderParticle(ctx);
    }
    if (enemyArray.length < 10) {
        Player.createEnemy(ctx);
    }
    if (enemyArray.length > 0) {
        renderEnemy(ctx);
    }
    Player.timeTillNextBullet -= 0.5;
    Player.timeTillNextEnemy -= 1;
}

let canvas;
let ctx;

let gameLoop = 0;
function startGame() {
    alert('click on cirles to shoot in that direction');
    document.body.innerHTML = `<canvas id="canvas"></canvas><audio src="gunshot.mp3" id="gunsound"></audio><audio src="ballCollide.mp3" id="bubblesound"></audio>`;
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");

    const canvasHeight = window.innerHeight;
    const canvasWidth = window.innerWidth;

    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    canvas.style.background = 'black';

    Player = new player((canvas.width / 2) - 25, canvas.height - 25);
    bulletsContainer = [];
    particalsArray = [];
    enemyArray = [];
    Player.enemySpeed = 1500;
    Player.score = 0;

    gameLoop = setInterval(game, 1000 / 120);

    canvas.addEventListener('click', (e) => {
        let x = e.clientX;
        let y = e.clientY;
        let xDistance = (x - (Player.x + (Player.width / 2)));
        let yDistance = (y - (Player.y + (Player.height / 2)));

        if (xDistance > 50 || xDistance < -50 || yDistance < -200) {
            let xSpeed = xDistance / 30;
            let ySpeed = yDistance / 30;
            Player.createBullet(ctx, xSpeed, ySpeed);
        }
    })
}
