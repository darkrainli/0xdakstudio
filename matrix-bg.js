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
const GRID_SIZE = 25; // 增加网格间距 (从 15 -> 25)
let time = 0;

function draw() {
    // 1. 清空背景
    ctx.fillStyle = '#F4F4F4'; // 更新为 #F4F4F4
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000'; // 圆点颜色

    // 2. 遍历网格
    for (let x = 0; x < canvas.width; x += GRID_SIZE) {
        for (let y = 0; y < canvas.height; y += GRID_SIZE) {
            
            // 3. 计算噪声值
            // scale: 控制纹理大小，稍微调大一点让“水滴”感更强
            const scale = 0.005;
            
            // 核心修改：模拟下落
            // 我们让 y 轴的噪声采样坐标随时间快速移动 (y - time * speed)
            // x 轴稍微动一点点，模拟水流的左右摆动
            // 这里的 time * 100 表示 y 轴移动速度很快，像下雨/水流
            const noiseVal = simplex2(x * scale + time * 0.2, (y * scale) - (time * 0.8)); 
            
            // 4. 映射半径
            // 让水滴感更明显：大部分地方是空的（负值截断），只有噪声峰值处出现圆点
            let radius = (noiseVal - 0.2) * (GRID_SIZE * 0.8);
            
            // 只有当半径大于 0 时才绘制，这样会形成稀疏的水滴分布
            if (radius > 0) {
                // 限制最大半径，不要粘在一起
                if (radius > GRID_SIZE / 2.5) radius = GRID_SIZE / 2.5;
                
                ctx.beginPath();
                ctx.arc(x + GRID_SIZE/2, y + GRID_SIZE/2, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // 6. 时间流动
    time += 0.02; // 整体流速

    requestAnimationFrame(draw);
}

draw();
