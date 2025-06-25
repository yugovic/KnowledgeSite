// Main Application Initialization

document.addEventListener('DOMContentLoaded', async () => {
    // Supabase初期化
    initSupabase(SUPABASE_URL, SUPABASE_KEY);
    
    // URLハッシュをクリアしてGalleryタブを強制的にアクティブにする
    window.location.hash = '';
    
    // Galleryタブを確実にアクティブにする
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector('a[href="#gallery"]').classList.add('active');
    
    // 認証モーダルが表示されていないことを確認
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'none';
    }
    
    // 初期表示をGalleryページに設定
    const uploadSection = document.getElementById('upload-section');
    const gallery = document.getElementById('gallery');
    const galleryHeader = document.querySelector('.gallery-header');
    const editGallery = document.getElementById('editGallery');
    const editModal = document.getElementById('editModal');
    
    if (uploadSection) uploadSection.style.display = 'none';
    if (gallery) gallery.style.display = 'grid';
    if (galleryHeader) galleryHeader.style.display = 'block';
    if (editGallery) editGallery.style.display = 'none';
    if (editModal) editModal.style.display = 'none';
    
    // ページタイトルとディスクリプションを初期状態に設定
    document.getElementById('page-title').textContent = 'AI Content Gallery';
    document.getElementById('page-description').textContent = 'AIと共創することカタチにできたコンテンツを紹介しています。';
    
    // 認証状態をチェック
    await checkAuthStatus();
    
    // 認証状態の変更を監視
    supabase.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        updateAuthUI();
    });
    
    loadContents();
    
    // すべてのモーダルを確実に非表示にする（二重チェック）
    setTimeout(() => {
        const allModals = document.querySelectorAll('.modal, .auth-modal, #editModal, #authModal');
        allModals.forEach(modal => {
            if (modal) modal.style.display = 'none';
        });
    }, 100);
    
    // 各モジュールの初期化
    initAuthEvents();
    initNavigation();
    initManageTabs();
    initUpload();
    initModalEvents();
    initFormEvents();
});

function initAuthEvents() {
    // 認証モーダルのイベントリスナー
    const loginSubmit = document.getElementById('loginSubmit');
    if (loginSubmit) loginSubmit.addEventListener('click', handleLogin);
    
    const signupSubmit = document.getElementById('signupSubmit');
    if (signupSubmit) signupSubmit.addEventListener('click', handleSignup);
    
    const authCancel = document.getElementById('authCancel');
    if (authCancel) authCancel.addEventListener('click', hideAuthModal);
    
    const signupCancel = document.getElementById('signupCancel');
    if (signupCancel) signupCancel.addEventListener('click', hideAuthModal);
    
    // フォーム切り替え
    const showSignup = document.getElementById('showSignup');
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.auth-form').style.display = 'none';
            document.querySelector('.signup-form').style.display = 'block';
            document.getElementById('authError').style.display = 'none';
            document.getElementById('authSuccess').style.display = 'none';
        });
    }
    
    const showLogin = document.getElementById('showLogin');
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.auth-form').style.display = 'block';
            document.querySelector('.signup-form').style.display = 'none';
            document.getElementById('authError').style.display = 'none';
            document.getElementById('authSuccess').style.display = 'none';
        });
    }
    
    // Enterキーでログイン/登録
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSignup();
            }
        });
    }

    // モーダルの背景クリックで閉じる
    const authModalElement = document.getElementById('authModal');
    if (authModalElement) {
        authModalElement.addEventListener('click', (e) => {
            if (e.target.id === 'authModal') {
                hideAuthModal();
            }
        });
    }
}

function initFormEvents() {
    // フォーム送信処理
    const contentForm = document.getElementById('contentForm');
    if (contentForm) {
        contentForm.addEventListener('submit', handleFormSubmit);
    }
}