const blobCanvas = document.getElementById('blob-canvas');

if (blobCanvas) {
    const ctx = blobCanvas.getContext('2d');
    let width, height;
    let dpr = window.devicePixelRatio || 1;

    // ----------------------------
    // 1. 高清 Canvas 初始化
    // ----------------------------
    let needsResize = true;
    
    function initCanvas() {
        const parent = blobCanvas.parentElement;
        if (parent) {
            // 获取 CSS 显示尺寸
            const rect = parent.getBoundingClientRect();
            // 确保尺寸有效
            if (rect.width === 0 || rect.height === 0) return;
            
            width = rect.width;
            height = rect.height;
            
            // 设置物理像素尺寸 (解决模糊问题)
            blobCanvas.width = width * dpr;
            blobCanvas.height = height * dpr;
            
            // 缩放绘图上下文，使绘图操作可以直接使用逻辑像素
            ctx.scale(dpr, dpr);
            
            console.log('Grid Art Canvas resized:', width, height, 'DPR:', dpr);
        }
    }

    window.addEventListener('resize', () => {
        dpr = window.devicePixelRatio || 1;
        needsResize = true;
    });
    
    // 初始延迟，确保容器布局完成
    setTimeout(() => {
        // initCanvas(); // 移除直接调用，改用 needsResize
        needsResize = true;
        initEntities();
        animate();
    }, 100);

    // ----------------------------
    // 2. 实体定义 (底层虚拟对象)
    // ----------------------------
    const entities = [];
    // 参考图颜色：黑色为主，辅以深黄、橙红、紫
    const colors = ['#1A1A1A', '#1A1A1A', '#1A1A1A', '#D4AF37', '#C04000', '#6A0DAD'];
    
    function initEntities() {
        entities.length = 0;
        // 创建几个移动的“球体”
        const numEntities = 7;
        for (let i = 0; i < numEntities; i++) {
            entities.push({
                x: Math.random() * (width || 300),
                y: Math.random() * (height || 300),
                vx: (Math.random() - 0.5) * 1.2, // 速度
                vy: (Math.random() - 0.5) * 1.2,
                radius: Math.random() * 50 + 40, // 半径 40-90
                color: colors[i % colors.length], // 循环分配颜色
                // 脉冲参数（让圆稍微呼吸）
                pulseOffset: Math.random() * Math.PI * 2,
                pulseSpeed: 0.05
            });
        }
    }

    function updateEntities() {
        if (!width || !height) return;

        entities.forEach(e => {
            e.x += e.vx;
            e.y += e.vy;

            // 简单的边界反弹
            if (e.x < -e.radius) e.x = width + e.radius;
            if (e.x > width + e.radius) e.x = -e.radius;
            if (e.y < -e.radius) e.y = height + e.radius;
            if (e.y > height + e.radius) e.y = -e.radius;

            // 呼吸效果
            e.currentRadius = e.radius + Math.sin(Date.now() * 0.002 + e.pulseOffset) * 10;
        });
    }

    // ----------------------------
    // 3. 网格渲染 (Grid Rendering)
    // ----------------------------
    const gridSize = 16; // 网格间距，越小点越密

    function draw() {
        if (!width || !height) return;

        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制浅灰色背景，或者保持透明（这里填一个很淡的背景让点阵更明显）
        // ctx.fillStyle = '#EAEAEA';
        // ctx.fillRect(0, 0, width, height);

        // 遍历网格
        for (let x = 0; x < width; x += gridSize) {
            for (let y = 0; y < height; y += gridSize) {
                
                // 计算该网格点到最近实体的距离
                let minDist = Infinity;
                let closestEntity = null;

                for (const e of entities) {
                    // 计算距离
                    const dx = x - e.x;
                    const dy = y - e.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    // 归一化距离：0 = 中心，1 = 边缘
                    const normalizedDist = dist / e.currentRadius;

                    if (normalizedDist < minDist) {
                        minDist = normalizedDist;
                        closestEntity = e;
                    }
                }

                // 决定绘制什么
                if (closestEntity && minDist < 1.2) {
                    // 在实体范围内（或略微外扩）
                    
                    // 计算点的大小
                    // 内部 (minDist < 0.8): 大点
                    // 边缘 (0.8 < minDist < 1.0): 中点
                    // 外圈 (1.0 < minDist < 1.2): 小点
                    
                    let dotRadius = 0;
                    
                    if (minDist < 0.7) {
                        dotRadius = gridSize * 0.45; // 几乎填满网格的大点 (0.45 * 2 = 0.9)
                    } else if (minDist < 1.0) {
                        // 边缘过渡
                        dotRadius = gridSize * 0.3;
                    } else {
                        // 外围光晕
                        dotRadius = gridSize * 0.15;
                    }

                    ctx.fillStyle = closestEntity.color;
                    
                    ctx.beginPath();
                    // 网格中心对齐：x + gridSize/2
                    ctx.arc(x + gridSize/2, y + gridSize/2, dotRadius, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // 背景噪点（可选，为了增加复古感）
                    // ctx.fillStyle = '#CCCCCC';
                    // ctx.beginPath();
                    // ctx.arc(x + gridSize/2, y + gridSize/2, 1, 0, Math.PI * 2);
                    // ctx.fill();
                }
            }
        }
    }

    function animate() {
        if (needsResize) {
            initCanvas();
            needsResize = false;
        }
        updateEntities();
        draw();
        requestAnimationFrame(animate);
    }

} else {
    console.error('Blob canvas element not found!');
}
