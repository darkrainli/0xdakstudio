const blobCanvas = document.getElementById('blob-canvas');

if (blobCanvas) {
    const bCtx = blobCanvas.getContext('2d');
    let width, height;

    // 初始化 Canvas 尺寸
    function initBlobCanvas() {
        // 确保获取到容器的尺寸
        const parent = blobCanvas.parentElement;
        if (parent) {
            width = parent.clientWidth || 300;
            height = parent.clientHeight || 300;
            
            // 设置 Canvas 内部分辨率
            blobCanvas.width = width;
            blobCanvas.height = height;
            
            console.log('Blob Canvas resized to:', width, height);
        }
    }

    window.addEventListener('resize', initBlobCanvas);
    // 立即执行一次，并延时执行以确保布局稳定
    initBlobCanvas();
    setTimeout(initBlobCanvas, 500);

    // Metaballs 配置
    const numBlobs = 8;
    const blobs = [];

    // 初始化 blobs
    function initBlobs() {
        blobs.length = 0; // 清空
        for (let i = 0; i < numBlobs; i++) {
            blobs.push({
                x: Math.random() * (width || 300),
                y: Math.random() * (height || 300),
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                r: Math.random() * 30 + 30 // 半径 30-60
            });
        }
    }
    // 确保有宽高后再初始化球体
    setTimeout(initBlobs, 100);

    function updateBlobs() {
        if (!width || !height) return;

        blobs.forEach(b => {
            b.x += b.vx;
            b.y += b.vy;

            // 边界反弹
            if (b.x < b.r) { b.x = b.r; b.vx *= -1; }
            if (b.x > width - b.r) { b.x = width - b.r; b.vx *= -1; }
            if (b.y < b.r) { b.y = b.r; b.vy *= -1; }
            if (b.y > height - b.r) { b.y = height - b.r; b.vy *= -1; }
        });
    }

    function drawBlobs() {
        if (!width || !height) return;

        // 清空画布
        bCtx.clearRect(0, 0, width, height);
        
        // 保存状态
        bCtx.save();
        
        // 关键：为了在浅色背景上显示 Metaballs，我们需要特殊处理
        // 这里的 contrast 滤镜需要配合白色背景才能产生“粘连”效果
        // 所以我们先画一个白底，然后画黑球，最后把白色变透明？不行，canvas 不支持把特定颜色变透明。
        
        // 替代方案：不使用滤镜，直接画圆，虽然没有粘连效果，但至少能看到东西。
        // 或者：保持滤镜，但背景必须是白色。
        // 鉴于我们的卡片背景是 #EAEAEA (浅灰)，我们可以把 canvas 背景设为透明，
        // 但滤镜需要“对比”，所以我们可以：
        // 1. 在 canvas 上填满 #EAEAEA
        // 2. 画模糊的黑球
        // 3. 应用 contrast
        
        // 尝试实现：
        bCtx.filter = 'blur(12px) contrast(20)';
        
        // 填充背景色 (必须填，否则 contrast 对透明背景无效)
        bCtx.fillStyle = '#EAEAEA'; 
        bCtx.fillRect(0, 0, width, height);
        
        bCtx.fillStyle = '#000';
        
        // 绘制所有 blob
        blobs.forEach(b => {
            bCtx.beginPath();
            bCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            bCtx.fill();
        });
        
        bCtx.restore(); // 恢复滤镜状态

        // 绘制一些额外的几何装饰（点阵），模仿参考图
        // 这些装饰不参与 blur
        drawDecorations();
    }

    function drawDecorations() {
        // 随机画一些小的矩形点阵
        bCtx.fillStyle = '#000';
        const gridSize = 4;
        
        // 左上角点阵
        for(let x=40; x<100; x+=12) {
            for(let y=40; y<100; y+=12) {
                // 静态的随机
                // 为了不闪烁，我们可以用坐标哈希
                if(((x * y) % 7) > 2) {
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
    console.log('Blob animation started');
    animateBlobs();

} else {
    console.error('Blob canvas element not found!');
}
