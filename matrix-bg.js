const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 噪点配置
// 密度适中，保证质感
const noiseDensity = 0.09; 

function draw() {
    // 1. 清空背景
    ctx.fillStyle = '#F4F4F4';
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
            // 不透明度：15 (约 6%)
            // 这是一个非常微妙的值，既能看到震荡，又完全不会干扰前景
            buffer[i + 3] = 15; 
        }
    }

    // 4. 放回画布
    ctx.putImageData(iData, 0, 0);

    // 5. 循环
    requestAnimationFrame(draw);
}

draw();
