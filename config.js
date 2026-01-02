// Supabase 配置
// 请将你的 Supabase URL 和 Anon Key 填入下方
const SUPABASE_URL = 'https://rumquqvignkxzezcworx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f_T0nYNO6M0VuAmvmY5cDw_WKRdb_Br';

// 初始化 Supabase 客户端
// 注意：需要先在 HTML 中引入 Supabase JS 库
// <script src="https://unpkg.com/@supabase/supabase-js@2"></script>

let supabase;

// 确保 createClient 可用
try {
    // 检查 window.supabase 是否存在以及是否有 createClient 方法
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized successfully.');
    } 
    // 某些环境（如本地文件打开）可能会直接暴露 createClient
    else if (typeof createClient === 'function') {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized via global function.');
    } 
    // 如果都不行，抛出错误
    else {
        throw new Error('Supabase library not loaded properly.');
    }
} catch (e) {
    console.error('Supabase initialization error:', e);
    // 尝试最后一种挽救措施：等待 DOM 加载完毕再试一次
    window.addEventListener('load', () => {
        if (!supabase && typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('Supabase client initialized via lazy load.');
        }
    });
}
