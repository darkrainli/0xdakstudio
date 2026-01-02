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
        
        // 填充白色背景（否则 API 会看到黑色背景）
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

    // 3. 智谱 GLM-4V 识别逻辑
    async function identifyDrawingWithZhipu(canvas) {
        const API_KEY = window.ZHIPU_API_KEY;
        
        if (!API_KEY || API_KEY.includes('YOUR_ZHIPU_API_KEY')) {
            throw new Error("请先在 config.js 中配置智谱 API Key");
        }

        // 1. 将 canvas 转换为 base64 (移除 data:image/jpeg;base64, 前缀)
        const base64Image = canvas.toDataURL("image/jpeg")
            .replace(/^data:image\/jpeg;base64,/, "");

        // 2. 调用智谱 API
        const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "glm-4v-flash", // 使用性价比最高的 Flash 模型
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "这张简笔画画的是什么？请用一个中文词语回答（例如：香蕉）。如果是乱涂乱画，就猜一个最像的。" },
                            { type: "image_url", image_url: { url: base64Image } }
                        ]
                    }
                ],
                max_tokens: 50,
                temperature: 0.1 // 降低随机性，提高准确度
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    nextBtn.addEventListener('click', async () => {
        // 显示遮罩和加载状态
        aiOverlay.classList.add('active');
        aiStatus.style.display = 'flex';
        aiResult.style.display = 'none';

        try {
            const text = await identifyDrawingWithZhipu(canvas);
            
            aiStatus.style.display = 'none';
            aiResult.style.display = 'block';
            predictionText.innerText = `我识别出来是... ${text}！`;

        } catch (err) {
            console.error(err);
            aiStatus.style.display = 'none';
            aiResult.style.display = 'block';
            
            if (err.message.includes("API Key")) {
                predictionText.innerText = "请配置智谱 API Key";
            } else {
                // 显示具体的错误信息，方便调试
                predictionText.innerText = `出错了: ${err.message || err.toString()}`;
            }
        }
    });

    retryBtn.addEventListener('click', () => {
        aiOverlay.classList.remove('active');
    });
});
