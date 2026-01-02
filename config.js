// Supabase 配置
// 请将你的 Supabase URL 和 Anon Key 填入下方
const SUPABASE_URL = 'https://rumquqvignkxzezcworx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f_T0nYNO6M0VuAmvmY5cDw_WKRdb_Br';

// 初始化 Supabase 客户端
// 注意：需要先在 HTML 中引入 Supabase JS 库
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

let supabase;

// 确保 createClient 可用
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else if (typeof createClient !== 'undefined') {
    // 兼容某些环境
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error('Supabase library not loaded!');
}
