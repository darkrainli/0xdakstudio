import { GoogleGenerativeAI } from "@google/generative-ai";

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

    // 3. Gemini AI 识别逻辑
    async function identifyDrawingWithGemini(canvas) {
        const API_KEY = window.GEMINI_API_KEY;
        
        if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
            throw new Error("请先在 config.js 中配置 Google Gemini API Key");
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        // 使用 gemini-1.5-flash-latest 模型，以获得更好的兼容性
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // 1. 将 canvas 转换为 base64 (移除 data:image/jpeg;base64, 前缀)
        const base64Image = canvas.toDataURL("image/jpeg")
            .replace(/^data:image\/jpeg;base64,/, "");

        // 2. 准备 Prompt
        const prompt = "Look at this simple sketch. What object is it depicting? Answer in one word in Chinese. (e.g. '香蕉'). If it's abstract or messy, make a creative guess.";

        // 3. 调用 API
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        return response.text().trim();
    }

    nextBtn.addEventListener('click', async () => {
        // 显示遮罩和加载状态
        aiOverlay.classList.add('active');
        aiStatus.style.display = 'flex';
        aiResult.style.display = 'none';

        try {
            const text = await identifyDrawingWithGemini(canvas);
            
            aiStatus.style.display = 'none';
            aiResult.style.display = 'block';
            predictionText.innerText = `Nano Banana 觉得这是... ${text}！`;

        } catch (err) {
            console.error(err);
            aiStatus.style.display = 'none';
            aiResult.style.display = 'block';
            
            if (err.message.includes("API Key")) {
                predictionText.innerText = "请配置 API Key";
            } else if (err.message.includes("fetch") || err.message.includes("Failed to fetch")) {
                predictionText.innerHTML = "网络连接失败。<br><span style='font-size:14px;color:#666'>请确保你的 VPN/代理已开启，并且支持 Google API。</span><br><span style='font-size:12px;color:#999'>提示：如果你在中国大陆，你需要全局代理或配置浏览器代理规则。</span>";
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
