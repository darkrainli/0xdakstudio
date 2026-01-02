const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// --- 极简 Simplex Noise 实现 (2D) ---
// 为了不引入外部库，这里内联一个简单的噪声算法
const perm = new Uint8Array(512);
const grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
function seed(s) {
    for(let i=0; i<256; i++) perm[i] = i;
    for(let i=0; i<256; i++) {
        let r = (Math.random()*256)|0;
        let t = perm[i]; perm[i] = perm[r]; perm[r] = t;
        perm[i+256] = perm[i];
    }
}
seed(0);
function simplex2(x, y) {
    const F2 = 0.5*(Math.sqrt(3.0)-1.0), G2 = (3.0-Math.sqrt(3.0))/6.0;
    let n0, n1, n2;
    let s = (x+y)*F2;
    let i = (x+s)|0, j = (y+s)|0;
    let t = (i+j)*G2;
    let X0 = i-t, Y0 = j-t;
    let x0 = x-X0, y0 = y-Y0;
    let i1, j1;
    if(x0>y0) {i1=1; j1=0;} else {i1=0; j1=1;}
    let x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    let x2 = x0 - 1.0 + 2.0 * G2, y2 = y0 - 1.0 + 2.0 * G2;
    let ii = i & 255, jj = j & 255;
    let gi0 = perm[ii+perm[jj]] % 12, gi1 = perm[ii+i1+perm[jj+j1]] % 12, gi2 = perm[ii+1+perm[jj+1]] % 12;
    let t0 = 0.5 - x0*x0 - y0*y0;
    if(t0<0) n0 = 0.0; else {t0 *= t0; n0 = t0 * t0 * (grad3[gi0][0]*x0 + grad3[gi0][1]*y0);}
    let t1 = 0.5 - x1*x1 - y1*y1;
    if(t1<0) n1 = 0.0; else {t1 *= t1; n1 = t1 * t1 * (grad3[gi1][0]*x1 + grad3[gi1][1]*y1);}
    let t2 = 0.5 - x2*x2 - y2*y2;
    if(t2<0) n2 = 0.0; else {t2 *= t2; n2 = t2 * t2 * (grad3[gi2][0]*x2 + grad3[gi2][1]*y2);}
    return 70.0 * (n0 + n1 + n2);
}

// --- 动画配置 ---
const GRID_SIZE = 15; // 网格大小 (像素)
let time = 0;

function draw() {
    // 1. 清空背景
    ctx.fillStyle = '#DFD7D3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000'; // 圆点颜色

    // 2. 遍历网格
    for (let x = 0; x < canvas.width; x += GRID_SIZE) {
        for (let y = 0; y < canvas.height; y += GRID_SIZE) {
            
            // 3. 计算噪声值
            // scale: 控制噪声的“缩放”，值越小，斑点越大越平滑
            // time: 控制流动
            const scale = 0.003;
            const noiseVal = simplex2(x * scale, y * scale + time * 0.05); 
            
            // 4. 将噪声值映射到圆点半径
            // noiseVal 范围大概在 -1 到 1 之间
            // 我们需要把它映射到 0 到 GRID_SIZE/2
            
            // 增加对比度：让大的更大，小的更小
            let radius = (noiseVal + 0.2) * (GRID_SIZE * 0.8);
            
            // 限制最小和最大半径
            if (radius < 1) radius = 1; // 最小也是个小点，保持网格感
            if (radius > GRID_SIZE / 1.5) radius = GRID_SIZE / 1.5;

            // 5. 绘制圆点
            ctx.beginPath();
            ctx.arc(x + GRID_SIZE/2, y + GRID_SIZE/2, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 6. 时间流动
    time += 0.05; // 控制速度

    requestAnimationFrame(draw);
}

draw();
