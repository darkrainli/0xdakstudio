const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 噪点配置
const noiseDensity = 0.15; // 再次增加密度
const noiseColor = 0; 

function draw() {
    // 1. 清空背景
    ctx.fillStyle = '#DFD7D3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. 获取像素
    const w = canvas.width;
    const h = canvas.height;
    const iData = ctx.getImageData(0, 0, w, h);
    const buffer = iData.data;
    const len = buffer.length;

    // 3. 随机生成噪点
    for (let i = 0; i < len; i += 4) {
        if (Math.random() < noiseDensity) {
            // 噪点像素：纯黑
            buffer[i] = 0;
            buffer[i + 1] = 0;
            buffer[i + 2] = 0;
            // 增加不透明度：从 30 (12%) 增加到 80 (31%)
            // 这样肉眼应该非常明显了
            buffer[i + 3] = 80; 
        }
    }

    // 4. 放回画布
    ctx.putImageData(iData, 0, 0);

    // 5. 循环
    requestAnimationFrame(draw);
}

draw();
