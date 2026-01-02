// Supabase 配置
// 请将你的 Supabase URL 和 Anon Key 填入下方
const SUPABASE_URL = 'https://rumquqvignkxzezcworx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f_T0nYNO6M0VuAmvmY5cDw_WKRdb_Br';

// Google Gemini API Key
// ⚠️ 警告：在前端暴露 API Key 是不安全的。生产环境请通过后端转发。
// 请在这里填入你的 Key
window.GEMINI_API_KEY = 'AIzaSyC7yKSRC7SsMJzh4ow3wW-xDiCO8daZDLQ';

// 初始化 Supabase 客户端
// 注意：需要先在 HTML 中引入 Supabase JS 库
// <script src="https://unpkg.com/@supabase/supabase-js@2"></script>

// 使用 window.sbClient 避免与库本身的全局变量 supabase 冲突
window.sbClient = null;

try {
    // 检查 window.supabase 是否存在（这是 Supabase 库的全局对象）
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        window.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized successfully as window.sbClient.');
    } 
    // 兼容环境
    else if (typeof createClient === 'function') {
        window.sbClient = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized via global function.');
    } 
    else {
        console.error('Supabase library not loaded properly.');
    }
} catch (e) {
    console.error('Supabase initialization error:', e);
    // 懒加载重试
    window.addEventListener('load', () => {
        if (!window.sbClient && typeof window.supabase !== 'undefined') {
            window.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('Supabase client initialized via lazy load.');
        }
    });
}
