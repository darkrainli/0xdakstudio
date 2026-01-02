const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
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
const gridSize = 15; // 稍微增大网格间距，让离散感更强
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
            const n = noise(x / 400, y / 400, time); // 增大除数，让云团更舒缓
            const value = (n + 1) / 2;

            // 4. 计算偏移量 (Jitter)
            // 让点的位置不再死板地固定在网格上
            // value 越大（即点越大），偏移越小（为了保持视觉重心）；点越小，越容易飘散
            // 随机偏移范围：-gridSize/2 到 +gridSize/2
            const offsetX = (Math.random() - 0.5) * gridSize * 0.8;
            const offsetY = (Math.random() - 0.5) * gridSize * 0.8;

            // 5. 绘制点
            let radius = value * gridSize * 0.6; // 稍微减小半径比例
            
            if (radius > 1) {
                ctx.beginPath();
                // 加上偏移量
                ctx.arc(x + offsetX, y + offsetY, radius / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // 时间流速
    time += 0.002; // 稍微减慢

    requestAnimationFrame(draw);
}

draw();
