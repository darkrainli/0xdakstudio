document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('art-canvas');
    const ctx = canvas.getContext('2d');
    const clearBtn = document.getElementById('clear-btn');
    const nextBtn = document.getElementById('next-btn');
    const aiOverlay = document.getElementById('ai-overlay');
    const aiStatus = document.querySelector('.ai-status');
    const aiResult = document.getElementById('ai-result');
    const predictionText = document.getElementById('prediction-text');
    const retryBtn = document.getElementById('retry-btn');

    // 1. 初始化 Canvas 尺寸
    function resizeCanvas() {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        // 填充白色背景（否则 MobileNet 会看到黑色背景）
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 设置笔触样式
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    
    // 初始调整并监听窗口大小
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 2. 绘画逻辑
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getCoords(e);
    }

    function draw(e) {
        if (!isDrawing) return;
        
        e.preventDefault(); // 防止触摸滚动
        const [x, y] = getCoords(e);

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        [lastX, lastY] = [x, y];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function getCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return [clientX - rect.left, clientY - rect.top];
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // 触摸支持
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    // 清除画布
    clearBtn.addEventListener('click', () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // 3. AI 识别逻辑 (MobileNet)
    let model = null;

    // 预加载模型
    async function loadModel() {
        try {
            // 加载 MobileNet 模型
            model = await mobilenet.load();
            console.log('Nano Banana (MobileNet) loaded!');
        } catch (err) {
            console.error('Failed to load model:', err);
        }
    }
    loadModel();

    nextBtn.addEventListener('click', async () => {
        // 显示遮罩和加载状态
        aiOverlay.classList.add('active');
        aiStatus.style.display = 'flex';
        aiResult.style.display = 'none';

        if (!model) {
            await loadModel();
        }

        if (model) {
            try {
                // 预测
                const predictions = await model.classify(canvas);
                console.log('Predictions:', predictions);

                // 获取概率最高的结果
                const topPrediction = predictions[0];
                const className = topPrediction.className;
                
                // 简单的中文翻译映射 (示例)
                const translations = {
                    'banana': '香蕉',
                    'apple': '苹果',
                    'orange': '橙子',
                    'computer': '电脑',
                    'cup': '杯子',
                    'pencil': '铅笔',
                    // ... 更多映射可以在这里添加，或者直接显示英文
                };

                const displayName = translations[className.toLowerCase()] || className;

                // 模拟思考延迟，增加仪式感
                setTimeout(() => {
                    aiStatus.style.display = 'none';
                    aiResult.style.display = 'block';
                    predictionText.innerText = `这看起来像... ${displayName}！`;
                }, 1500);

            } catch (err) {
                console.error(err);
                aiStatus.style.display = 'none';
                aiResult.style.display = 'block';
                predictionText.innerText = 'Nano Banana 遇到了一点问题...';
            }
        } else {
            aiStatus.style.display = 'none';
            aiResult.style.display = 'block';
            predictionText.innerText = '模型加载失败，请检查网络。';
        }
    });

    retryBtn.addEventListener('click', () => {
        aiOverlay.classList.remove('active');
        // 可选：是否要在重试时清空画布？
        // ctx.fillStyle = '#ffffff';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
});
