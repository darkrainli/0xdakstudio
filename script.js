document.addEventListener('DOMContentLoaded', async () => {
    // 模态框相关元素
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const closeBtn = document.querySelector('.close');

    // Supabase 数据加载
    const galleryContainer = document.getElementById('gallery-container');

    async function fetchArtworks() {
        // 如果没有配置 Supabase，显示提示
        if (!window.sbClient) {
            // 尝试等待一会儿（针对慢网速）
            await new Promise(r => setTimeout(r, 500));
            if (!window.sbClient) {
                galleryContainer.innerHTML = '<div style="padding:20px">正在连接数据库，请稍候...<br><small>如果长时间无反应，请检查 config.js 配置或网络。</small></div>';
                // 最后再试一次
                setTimeout(() => {
                    if (window.sbClient) fetchArtworks();
                    else galleryContainer.innerHTML = '<div style="padding:20px; color:red">连接数据库失败。请刷新页面重试。</div>';
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

            if (!data || data.length === 0) {
                galleryContainer.innerHTML = '<div style="padding:20px; color:#999">暂无作品，请访问 /admin.html 上传</div>';
                return;
            }

            // 清空容器
            galleryContainer.innerHTML = '';

            // 渲染作品
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'artwork-item';
                // 存储标题和描述在 dataset 中，方便点击时读取
                div.dataset.title = item.title || '';
                div.dataset.description = item.description || '';
                
                const img = document.createElement('img');
                img.src = item.image_url;
                img.alt = item.title || 'Artwork';
                
                div.appendChild(img);
                galleryContainer.appendChild(div);

                // 绑定点击事件
                div.addEventListener('click', () => {
                    modal.style.display = 'flex';
                    modalImg.src = item.image_url;
                    
                    // 构建描述文字
                    let captionText = '';
                    if (item.title) captionText += `<strong>${item.title}</strong><br>`;
                    if (item.description) captionText += `<span style="font-size:0.9em; opacity:0.8">${item.description}</span>`;
                    modalCaption.innerHTML = captionText;
                });
            });

        } catch (err) {
            console.error(err);
            galleryContainer.innerHTML = `<div style="padding:20px; color:red">加载失败: ${err.message}</div>`;
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
