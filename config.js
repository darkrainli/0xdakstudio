// Supabase 配置
// 请将你的 Supabase URL 和 Anon Key 填入下方
const SUPABASE_URL = 'https://rumquqvignkxzezcworx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f_T0nYNO6M0VuAmvmY5cDw_WKRdb_Br';

// 初始化 Supabase 客户端
// 注意：需要先在 HTML 中引入 Supabase JS 库
// <script src="https://unpkg.com/@supabase/supabase-js@2"></script>

let supabase;

try {
    // 确保 createClient 可用
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized successfully.');
    } else if (typeof createClient === 'function') {
        // 兼容直接引入的情况
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized via global function.');
    } else {
        console.error('Supabase library not loaded! Check your internet connection or script tag.');
        alert('Supabase 组件加载失败，请检查网络或刷新页面。');
    }
} catch (e) {
    console.error('Supabase initialization error:', e);
}
