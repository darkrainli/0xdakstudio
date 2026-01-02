document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.querySelector('.close');
    const artworkItems = document.querySelectorAll('.artwork-item img');

    // 点击图片打开模态框
    artworkItems.forEach(img => {
        img.addEventListener('click', () => {
            modal.style.display = 'flex';
            modalImg.src = img.src;
        });
    });

    // 点击关闭按钮关闭模态框
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 点击模态框背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
});
