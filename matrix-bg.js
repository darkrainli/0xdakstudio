const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
// 移除 resize 事件监听，或者确保 resize 后重新开始绘制（如果之前的绘制循环还在运行的话）
// 但在 requestAnimationFrame 中，只要 ctx 还在，它就会继续画。
// 问题在于：当改变 canvas 尺寸时，画布内容会被清空。
// 我们的 draw 函数每一帧都会清空并重绘，所以理论上不应该消失。
// 除非... resize 导致了某些状态重置。
window.addEventListener('resize', resizeCanvas);

// ---------------------------------------------------
// 简单的 Perlin Noise 实现 (为了不依赖外部库，手写一个简化版)
// ---------------------------------------------------
const permutation = new Uint8Array(512);
const p = new Uint8Array(256);
for (let i = 0; i < 256; i++) p[i] = i;
// Shuffle
for (let i = 255; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    [p[i], p[r]] = [p[r], p[i]];
}
for (let i = 0; i < 512; i++) permutation[i] = p[i & 255];

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(t, a, b) { return a + t * (b - a); }
function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function noise(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = permutation[X] + Y;
    const AA = permutation[A] + Z;
    const AB = permutation[A + 1] + Z;
    const B = permutation[X + 1] + Y;
    const BA = permutation[B] + Z;
    const BB = permutation[B + 1] + Z;

    return lerp(w, lerp(v, lerp(u, grad(permutation[AA], x, y, z),
        grad(permutation[BA], x - 1, y, z)),
        lerp(u, grad(permutation[AB], x, y - 1, z),
        grad(permutation[BB], x - 1, y - 1, z))),
        lerp(v, lerp(u, grad(permutation[AA + 1], x, y, z - 1),
        grad(permutation[BA + 1], x - 1, y, z - 1)),
        lerp(u, grad(permutation[AB + 1], x, y - 1, z - 1),
        grad(permutation[BB + 1], x - 1, y - 1, z - 1))));
}
// ---------------------------------------------------

// 配置参数
const gridSize = 20; // 增大网格到 20px
let time = 0;

function draw() {
    // 1. 清空背景
    ctx.fillStyle = '#F4F4F4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#E7E5E5'; // 点阵颜色

    // 2. 遍历网格
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            // 3. 计算噪声值
            // 减小除数（从 300 减到 180），让云团更碎、变化更丰富
            const n = noise(x / 180, y / 180, time);
            
            const value = (n + 1) / 2;

            // 4. 根据噪声值决定点的半径
            // 增大半径比例（从 0.8 到 0.9），让点更大更明显
            let radius = value * gridSize * 0.9;
            
            // 降低阈值（从 1 到 0.5），让更多的点显示出来
            if (radius > 0.5) {
                ctx.beginPath();
                ctx.arc(x, y, radius / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // 时间流速
    // 加快流速（从 0.003 到 0.008），让变化肉眼可见
    time += 0.008;

    requestAnimationFrame(draw);
}

draw();
