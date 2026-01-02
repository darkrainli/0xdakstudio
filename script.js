document.addEventListener('DOMContentLoaded', async () => {
    // 模态框相关元素
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const closeBtn = document.querySelector('.close');

    // Supabase 数据加载
    // 注意：ID 变了，现在是 gallery-track
    const galleryTrack = document.getElementById('gallery-track');

    async function fetchArtworks() {
        // 如果没有配置 Supabase，显示提示
        if (!window.sbClient) {
            // ... (省略之前的重试逻辑，保持不变) ...
            // 只是把 galleryContainer 改为 galleryTrack
            await new Promise(r => setTimeout(r, 500));
            if (!window.sbClient) {
                // 清空占位符
                galleryTrack.innerHTML = '<div style="padding:20px; text-align:center;">正在连接数据库...</div>';
                setTimeout(() => {
                    if (window.sbClient) fetchArtworks();
                    else galleryTrack.innerHTML = '<div style="padding:20px; color:red; text-align:center;">连接数据库失败。请刷新页面重试。</div>';
                }, 2000);
                return;
            }
        }

        try {
            const { data, error } = await window.sbClient
                .from('artworks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // 清空默认的占位符
            galleryTrack.innerHTML = '';

            if (!data || data.length === 0) {
                // 如果没有数据，显示几个空的灰色方块作为演示
                for(let i=0; i<3; i++) {
                    const div = document.createElement('div');
                    div.className = 'artwork-card';
                    galleryTrack.appendChild(div);
                }
                return;
            }

            // 渲染作品
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'artwork-card';
                // 存储标题和描述在 dataset 中
                div.dataset.title = item.title || '';
                div.dataset.description = item.description || '';
                
                const img = document.createElement('img');
                img.src = item.image_url;
                img.alt = item.title || 'Artwork';
                
                div.appendChild(img);
                galleryTrack.appendChild(div);

                // 绑定点击事件
                div.addEventListener('click', (e) => {
                    // 如果正在拖拽（父容器有 is-dragging 类），则阻止弹窗
                    if (document.querySelector('.horizontal-gallery-container').classList.contains('is-dragging')) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }

                    modal.style.display = 'flex';
                    modalImg.src = item.image_url;
                    
                    let captionText = '';
                    if (item.title) captionText += `<strong>${item.title}</strong><br>`;
                    if (item.description) captionText += `<span style="font-size:0.9em; opacity:0.8">${item.description}</span>`;
                    modalCaption.innerHTML = captionText;
                });
            });

        } catch (err) {
            console.error(err);
            galleryTrack.innerHTML = `<div style="padding:20px; color:red">加载失败: ${err.message}</div>`;
        }
    }

    // 初始化加载
    fetchArtworks();

    // 模态框关闭逻辑
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });

    // ---------------------------
    // 拖拽滚动 (Drag-to-Scroll) 实现
    // ---------------------------
    const slider = document.querySelector('.horizontal-gallery-container');
    let isDown = false;
    let startX;
    let scrollLeft;
    // 区分点击和拖拽
    let isDragging = false; 

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        isDragging = false; // 初始状态不是拖拽
        slider.classList.add('active'); // 可以在 CSS 里加点样式
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
        setTimeout(() => {
            slider.classList.remove('is-dragging'); // 延迟移除，防止触发点击
        }, 50);
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
        // 延迟一点点移除 is-dragging 类，确保 click 事件能检测到拖拽状态
        setTimeout(() => {
            slider.classList.remove('is-dragging');
        }, 50);
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        
        e.preventDefault(); // 防止选中文本
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5; // 滚动速度系数，1.5倍速
        
        // 如果移动距离超过 5px，则视为拖拽
        if (Math.abs(walk) > 5) {
            isDragging = true;
            slider.classList.add('is-dragging');
        }

        slider.scrollLeft = scrollLeft - walk;
    });

    // 修改卡片点击事件：如果是拖拽，则不触发弹窗
    // 我们需要在 fetchArtworks 函数里修改点击事件的逻辑
    // 为了不破坏现有结构，我们使用事件委托或者在创建元素时修改逻辑
});
