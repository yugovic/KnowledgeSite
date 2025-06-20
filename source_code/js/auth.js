// Authentication Functions

function showAuthModal(targetPage = 'upload') {
    const modal = document.getElementById('authModal');
    const authForm = document.querySelector('.auth-form');
    const signupForm = document.querySelector('.signup-form');
    const authError = document.getElementById('authError');
    const authSuccess = document.getElementById('authSuccess');
    
    pendingPage = targetPage;
    modal.style.display = 'flex';
    
    // ログインフォームを表示
    authForm.style.display = 'block';
    signupForm.style.display = 'none';
    
    // エラー・成功メッセージをクリア
    authError.style.display = 'none';
    authSuccess.style.display = 'none';
    
    // 入力フィールドをクリア
    document.getElementById('emailInput').value = '';
    document.getElementById('passwordInput').value = '';
    
    // フォーカスを当てる
    setTimeout(() => {
        document.getElementById('emailInput').focus();
    }, 100);
}

function hideAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
}

function showError(message) {
    const authError = document.getElementById('authError');
    authError.textContent = message;
    authError.style.display = 'block';
    
    const authSuccess = document.getElementById('authSuccess');
    authSuccess.style.display = 'none';
}

function showSuccess(message) {
    const authSuccess = document.getElementById('authSuccess');
    authSuccess.textContent = message;
    authSuccess.style.display = 'block';
    
    const authError = document.getElementById('authError');
    authError.style.display = 'none';
}

async function handleLogin() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    if (!email || !password) {
        showError('メールアドレスとパスワードを入力してください');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            showError(error.message);
            return;
        }

        currentUser = data.user;
        hideAuthModal();
        
        // 認証後に指定されたページに移動
        navigateToPage(pendingPage);
        
    } catch (error) {
        showError('ログインに失敗しました: ' + error.message);
    }
}

async function handleSignup() {
    const email = document.getElementById('signupEmailInput').value;
    const password = document.getElementById('signupPasswordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;

    if (!email || !password || !confirmPassword) {
        showError('全ての項目を入力してください');
        return;
    }

    if (password !== confirmPassword) {
        showError('パスワードが一致しません');
        return;
    }

    if (password.length < 6) {
        showError('パスワードは6文字以上で入力してください');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            showError(error.message);
            return;
        }

        showSuccess('登録が完了しました。メールを確認してアカウントを有効化してください。');
        
        // フォームをクリア
        document.getElementById('signupEmailInput').value = '';
        document.getElementById('signupPasswordInput').value = '';
        document.getElementById('confirmPasswordInput').value = '';
        
    } catch (error) {
        showError('登録に失敗しました: ' + error.message);
    }
}

// 認証状態をチェック
async function checkAuthStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
    return user !== null;
}

// 認証状態に応じたUI更新
function updateAuthUI() {
    // 今後、ログアウトボタンなどのUI要素を追加する場合に使用
}

// ログアウト機能
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('ログアウトエラー:', error);
            return;
        }
        
        currentUser = null;
        // Galleryページに戻る
        switchPage('gallery');
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector('a[href="#gallery"]').classList.add('active');
        
    } catch (error) {
        console.error('ログアウトに失敗しました:', error);
    }
}