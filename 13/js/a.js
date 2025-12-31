var myVideo = document.getElementById("video1");

function playPause1() {
    if (myVideo1.paused)
        myVideo1.play();
    else
        myVideo1.pause();
}

function makeBig() {
    myVideo1.width = 560;
}

function makeSmall() {
    myVideo1.width = 320;
}

function makeNormal() {
    myVideo1.width = 420;
}
var myVideo2 = document.getElementById("video2");

function playPause2() {
    if (myVideo2.paused)
        myVideo2.play();
    else
        myVideo2.pause();
}

function makeBig() {
    myVideo2.width = 560;
}

function makeSmall() {
    myVideo2.width = 320;
}

function makeNormal() {
    myVideo2.width = 420;
}



const canvas = document.getElementById('fireworkContainer');
const ctx = canvas.getContext('2d');


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


const COLORS = [
    '#FF3366', '#FF9900', '#FFDD00', '#33CC33',
    '#3399FF', '#9933FF', '#CC33FF', '#FF33CC'
];


class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 3 + 1;
        this.vx = Math.random() * 7 - 3.5;
        this.vy = Math.random() * -7 - 1.5;
        this.gravity = 0.08;
        this.friction = 0.94;
        this.alpha = 1;
        this.decay = Math.random() * 0.025 + 0.01;
    }
    update() {
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}


class Firework {
    constructor() {
        this.sx = Math.random() * canvas.width;
        this.sy = canvas.height;
        this.tx = Math.random() * canvas.width * 0.9 + canvas.width * 0.05;
        this.ty = Math.random() * canvas.height * 0.4 + canvas.height * 0.1;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.done = false;
        this.particles = [];
        this.init();
    }
    init() {
        const dx = this.tx - this.sx;
        const dy = this.ty - this.sy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.vx = dx / distance * 6;
        this.vy = dy / distance * 6;
        this.currentX = this.sx;
        this.currentY = this.sy;
    }
    update() {
        if (!this.done) {
            this.currentX += this.vx;
            this.currentY += this.vy;

            if (Math.abs(this.currentX - this.tx) < 6 && Math.abs(this.currentY - this.ty) < 6) {
                this.explode();
                this.done = true;
            } else {

                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.currentX, this.currentY, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            this.particles[i].draw();
            if (this.particles[i].alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    explode() {

        for (let i = 0; i < 100; i++) {
            this.particles.push(new Particle(this.currentX, this.currentY, this.color));
        }
    }
}

const fireworks = [];

setInterval(() => {
    if (fireworks.length < 4) {
        fireworks.push(new Firework());
    }
}, 1000);


function animate() {

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        if (fireworks[i].done && fireworks[i].particles.length === 0) {
            fireworks.splice(i, 1);
        }
    }
    requestAnimationFrame(animate);
}
window.addEventListener('load', animate);