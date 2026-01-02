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
                    // 灰色背景已经在 CSS 里设置了
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
                div.addEventListener('click', () => {
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
});
