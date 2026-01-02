const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 噪点配置
const noiseDensity = 0.08; // 密度：0-1，越小越稀疏
const noiseColor = 255; // 噪点颜色：255=白

function draw() {
    // 1. 清空背景为纯黑
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. 获取画布像素数据
    const w = canvas.width;
    const h = canvas.height;
    const iData = ctx.getImageData(0, 0, w, h);
    const buffer = iData.data;
    const len = buffer.length;

    // 3. 随机生成噪点
    // 直接操作像素数组比 fillRect 快得多
    for (let i = 0; i < len; i += 4) {
        if (Math.random() < noiseDensity) {
            // 随机灰度，产生更有质感的噪点
            const gray = Math.random() * 255;
            
            buffer[i] = gray;     // R
            buffer[i + 1] = gray; // G
            buffer[i + 2] = gray; // B
            buffer[i + 3] = 255;  // Alpha (不透明)
        } else {
            // 保持黑色
            buffer[i] = 0;
            buffer[i + 1] = 0;
            buffer[i + 2] = 0;
            buffer[i + 3] = 255;
        }
    }

    // 4. 将像素数据放回画布
    ctx.putImageData(iData, 0, 0);

    // 5. 循环
    requestAnimationFrame(draw);
}

draw();
