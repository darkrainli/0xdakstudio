const blobCanvas = document.getElementById('blob-canvas');
const bCtx = blobCanvas.getContext('2d');

let width, height;

// 初始化 Canvas 尺寸
function initBlobCanvas() {
    const parent = blobCanvas.parentElement;
    width = parent.clientWidth;
    height = parent.clientHeight;
    // 增加分辨率以获得清晰边缘
    blobCanvas.width = width;
    blobCanvas.height = height;
}

window.addEventListener('resize', initBlobCanvas);
// 初始延迟一点，确保容器已有尺寸
setTimeout(initBlobCanvas, 100);

// Metaballs 配置
const numBlobs = 6;
const blobs = [];

for (let i = 0; i < numBlobs; i++) {
    blobs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        r: Math.random() * 40 + 40 // 半径 40-80
    });
}

function updateBlobs() {
    if (!width || !height) return;

    blobs.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;

        // 边界反弹
        if (b.x < 0 || b.x > width) b.vx *= -1;
        if (b.y < 0 || b.y > height) b.vy *= -1;
    });
}

function drawBlobs() {
    if (!width || !height) return;

    // 清空画布
    bCtx.clearRect(0, 0, width, height);
    
    // 使用像素操作实现 Metaballs (比较耗性能，但效果最正宗)
    // 或者使用 Canvas 渐变叠加 + 阈值 (threshold) 技巧 (性能更好)
    
    // 这里使用 "阈值" 技巧：
    // 1. 绘制模糊的圆 (shadowBlur)
    // 2. 将整个画布的对比度拉高，让模糊边缘变得锐利
    
    // 注意：在 Safari/Chrome 中，可以通过 filter 属性实现
    bCtx.filter = 'blur(15px) contrast(30)';
    bCtx.fillStyle = 'black';
    // 背景设为白色（因为 contrast 会把任何非白变为黑，我们需要白色作为底色来对比）
    // 但我们的卡片底色是灰色的... 
    // 这种技巧要求背景必须是纯色。
    
    // 让我们尝试另一种方法：直接画黑球，利用 globalCompositeOperation
    
    // 为了实现那个参考图的“墨汁”效果，我们先填满白色（或灰色），然后画黑球
    // 但这样无法透明。
    
    // 还是用 blur+contrast 最好。为了透明背景，我们可以在 CSS 里设置 canvas 的 mix-blend-mode，或者在 canvas 里画完后把白色变透明。
    
    // 这里简化：直接画圆，加上连接线？不，那太几何了。
    // 还是用 blur+contrast，假设背景是透明的。
    
    // 绘制所有 blob
    blobs.forEach(b => {
        bCtx.beginPath();
        bCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        bCtx.fill();
    });
    
    bCtx.filter = 'none'; // 重置 filter

    // 绘制一些额外的几何装饰（点阵），模仿参考图
    // 这些装饰不参与 blur
    drawDecorations();
}

function drawDecorations() {
    // 随机画一些小的矩形点阵
    bCtx.fillStyle = 'black';
    const gridSize = 4;
    
    // 左上角点阵
    for(let x=20; x<80; x+=10) {
        for(let y=20; y<80; y+=10) {
            if(Math.random() > 0.5) {
                bCtx.fillRect(x, y, gridSize, gridSize);
            }
        }
    }
}

function animateBlobs() {
    updateBlobs();
    drawBlobs();
    requestAnimationFrame(animateBlobs);
}

// 启动
animateBlobs();
