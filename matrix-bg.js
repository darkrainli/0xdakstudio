const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 噪点配置
const noiseDensity = 0.12; // 稍微增加密度
const noiseColor = 0; // 噪点颜色：0=黑 (在浅色背景上要用黑色噪点)

function draw() {
    // 1. 清空背景为指定的暖灰色
    ctx.fillStyle = '#DFD7D3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. 获取画布像素数据
    const w = canvas.width;
    const h = canvas.height;
    const iData = ctx.getImageData(0, 0, w, h);
    const buffer = iData.data;
    const len = buffer.length;

    // 3. 随机生成噪点
    for (let i = 0; i < len; i += 4) {
        if (Math.random() < noiseDensity) {
            // 随机深灰色/黑色噪点
            // 0 (黑) 到 100 (深灰) 之间随机
            const gray = Math.random() * 100;
            
            buffer[i] = gray;     // R
            buffer[i + 1] = gray; // G
            buffer[i + 2] = gray; // B
            buffer[i + 3] = 40;   // Alpha (非常淡，产生隐约的震荡感)
        } 
        // 这里的 else 不需要了，因为我们已经 fillRect 填充了底色
        // 而且 ImageData 会覆盖底色，所以如果不画噪点，需要保持透明（Alpha=0）
        // 但 fillRect 是在 canvas 上画，getImageData 拿到的是 canvas 的当前状态（已经是 #DFD7D3 了）
        // 所以我们只需要修改那些是“噪点”的像素
    }
    
    // 修正逻辑：getImageData 获取的是当前帧的底色
    // 我们只需要在每一帧随机把一些像素变暗即可
    
    // 重新编写循环以适应 fillRect 后的逻辑
    for (let i = 0; i < len; i += 4) {
        if (Math.random() < noiseDensity) {
            // 噪点像素：设为黑色，带一点透明度
            buffer[i] = 0;
            buffer[i + 1] = 0;
            buffer[i + 2] = 0;
            buffer[i + 3] = 30; // 约 12% 不透明度
        }
        // 非噪点像素保持原样（即 #DFD7D3）
    }

    // 4. 将像素数据放回画布
    ctx.putImageData(iData, 0, 0);

    // 5. 循环
    requestAnimationFrame(draw);
}

draw();
