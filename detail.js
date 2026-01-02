document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert('未找到作品ID');
        window.location.href = '/';
        return;
    }

    const titleEl = document.getElementById('artwork-title');
    const descEl = document.getElementById('artwork-description');
    const galleryEl = document.getElementById('detail-gallery');

    // 增加重试逻辑：等待 Supabase 客户端初始化
    async function waitForSupabase() {
        let attempts = 0;
        while (!window.sbClient && attempts < 10) {
            await new Promise(r => setTimeout(r, 200));
            attempts++;
        }
        return !!window.sbClient;
    }

    if (!(await waitForSupabase())) {
        titleEl.innerText = '连接超时';
        descEl.innerText = '无法连接到数据库，请检查网络或配置。';
        return;
    }

    try {
        // 获取作品详情
        const { data, error } = await window.sbClient
            .from('artworks')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) throw new Error('作品不存在');

        // 渲染信息
        titleEl.innerText = data.title || '无题';
        // 处理描述中的换行符
        descEl.innerHTML = (data.description || '').replace(/\n/g, '<br>');
        document.title = `${data.title} - 0xdak.art`;

        // 渲染图片列表
        // 目前数据库结构只支持一张图片，所以我们先展示这一张
        // 如果将来扩展为多图，可以在这里 fetch 关联表
        galleryEl.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = data.image_url;
        img.className = 'detail-image';
        img.alt = data.title;
        
        galleryEl.appendChild(img);

        // 如果有更多图片逻辑，可以在这里扩展
        // 例如：
        // const images = await fetchOtherImages(id);
        // images.forEach(...)

    } catch (err) {
        console.error(err);
        titleEl.innerText = '加载失败';
        descEl.innerText = err.message;
        galleryEl.innerHTML = '';
    }
});