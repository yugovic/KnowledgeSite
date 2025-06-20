// Supabase Configuration
const SUPABASE_URL = 'https://qmdjelrbvfskqdisthrn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZGplbHJidmZza3FkaXN0aHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODk1OTksImV4cCI6MjA2NTQ2NTU5OX0.StEGkVLEGHHNjsmubOdE182yPf-UZGjdpQ_CBr6zGYg';

let supabase = null;
let currentUser = null;
let currentPage = 'gallery';
let pendingPage = '';

// Supabase初期化関数
function initSupabase(url, key) {
    supabase = window.supabase.createClient(url, key);
}