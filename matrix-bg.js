const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

// 设置 Canvas 全屏
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 字符集：可以是二进制、片假名、或者一些神秘符号
// const chars = '01'; // 极简二进制
// const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // 标准字符
const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789'; // 黑客帝国风格
const charArray = chars.split('');

const fontSize = 14;
const columns = canvas.width / fontSize; // 列数

// drops[i] 存储第 i 列当前字符下落到的 y 坐标（以行数为单位）
const drops = [];
for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100; // 随机初始高度，错落有致
}

function draw() {
    // 每一帧都绘制一个半透明的黑色矩形，覆盖在前一帧上
    // 这样会形成“拖尾”效果，opacity 越小，拖尾越长
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // 白色背景，所以用白色遮罩
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000'; // 字体颜色：黑色
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        // 随机取一个字符
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        // 绘制字符
        // x = i * fontSize
        // y = drops[i] * fontSize
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // 如果字符落出屏幕底端，或者随机重置
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        // 增加 y 坐标
        drops[i]++;
    }
}

// 动画循环
setInterval(draw, 33); // 约 30fps
