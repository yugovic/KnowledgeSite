// Navigation Functions

function navigateToPage(targetPage) {
    if (targetPage === 'upload') {
        switchToUploadPage();
    } else if (targetPage === 'collections') {
        switchToCollectionsPage();
    } else if (targetPage === 'directory') {
        switchToDirectoryPage();
    } else if (targetPage === 'manage') {
        switchToManagePage();
    }
}

function switchToUploadPage() {
    const uploadSection = document.getElementById('upload-section');
    const gallery = document.getElementById('gallery');
    const galleryHeader = document.querySelector('.gallery-header');
    
    if (gallery) gallery.style.display = 'none';
    if (galleryHeader) galleryHeader.style.display = 'none';
    if (uploadSection) uploadSection.style.display = 'block';
    
    // タブの状態を更新
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const submitTab = document.getElementById('submit-tab');
    if (submitTab) submitTab.classList.add('active');
    
    // ヘッダーを更新
    document.getElementById('page-title').textContent = 'Submit Content';
    document.getElementById('page-description').textContent = 'あなたのAI作品を共有して、他のクリエイターにインスピレーションを与えましょう。';
}

function switchToCollectionsPage() {
    const uploadSection = document.getElementById('upload-section');
    const gallery = document.getElementById('gallery');
    const galleryHeader = document.querySelector('.gallery-header');
    
    if (uploadSection) uploadSection.style.display = 'none';
    if (gallery) gallery.style.display = 'grid';
    if (galleryHeader) galleryHeader.style.display = 'block';
    
    // タブの状態を更新
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector('a[href="#collections"]').classList.add('active');
    
    // ヘッダーは変更しない - メインページのヘッダーを保持
}


function switchToDirectoryPage() {
    const uploadSection = document.getElementById('upload-section');
    const gallery = document.getElementById('gallery');
    const galleryHeader = document.querySelector('.gallery-header');
    
    if (uploadSection) uploadSection.style.display = 'none';
    if (gallery) gallery.style.display = 'grid';
    if (galleryHeader) galleryHeader.style.display = 'block';
    
    // タブの状態を更新
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector('a[href="#directory"]').classList.add('active');
    
    // ヘッダーは変更しない - メインページのヘッダーを保持
}

function switchToManagePage() {
    const manageSection = document.getElementById('manage-section');
    const gallery = document.getElementById('gallery');
    const galleryHeader = document.querySelector('.gallery-header');
    
    if (gallery) gallery.style.display = 'none';
    if (galleryHeader) galleryHeader.style.display = 'none';
    if (manageSection) manageSection.style.display = 'block';
    
    // タブの状態を更新
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const manageTab = document.querySelector('a[href="#manage"]');
    if (manageTab) manageTab.classList.add('active');
    
    // ヘッダーを更新
    document.getElementById('page-title').textContent = 'Manage Content';
    document.getElementById('page-description').textContent = 'コンテンツの投稿・編集・削除を行います。';
    
    // 編集タブがアクティブな場合は編集ギャラリーをロード
    const editTab = document.querySelector('.manage-tab[data-tab="edit"]');
    if (editTab && editTab.classList.contains('active')) {
        loadEditGallery();
    }
}

function initManageTabs() {
    const manageTabs = document.querySelectorAll('.manage-tab');
    const submitContent = document.getElementById('submit-content');
    const editContent = document.getElementById('edit-content');
    
    manageTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all manage tabs
            manageTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show/hide content based on tab
            if (tab.dataset.tab === 'submit') {
                if (submitContent) submitContent.style.display = 'block';
                if (editContent) editContent.style.display = 'none';
            } else if (tab.dataset.tab === 'edit') {
                if (submitContent) submitContent.style.display = 'none';
                if (editContent) editContent.style.display = 'block';
                loadEditGallery();
            }
        });
    });
}

function initNavigation() {
    // タブのクリック処理
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', async (e) => {
            e.preventDefault();
            const href = tab.getAttribute('href');
            
            if (href === '#gallery') {
                // Galleryは認証不要
                switchPage('gallery');
                // タブの状態を更新
                document.querySelectorAll('.nav-tab').forEach(t => {
                    t.classList.remove('active');
                });
                tab.classList.add('active');
            } else if (href === '#manage') {
                // Manage (Submit/Edit)タブは認証が必要
                const isAuthenticated = await checkAuthStatus();
                if (!isAuthenticated) {
                    showAuthModal('manage');
                } else {
                    // 既に認証済みの場合
                    switchToManagePage();
                }
            }
        });
    });
    
    // フローティングナビゲーション
    document.querySelectorAll('.floating-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) {
                // Update active state
                document.querySelectorAll('.floating-nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                item.classList.add('active');
                
                switchPage(page);
            }
        });
    });
}

function switchPage(page) {
    currentPage = page;
    
    const uploadSection = document.getElementById('upload-section');
    const gallery = document.getElementById('gallery');
    const galleryHeader = document.querySelector('.gallery-header');
    const container = document.querySelector('.container');
    const profileSection = document.getElementById('profile-section');
    
    // Hide profile section if it exists
    if (profileSection) {
        profileSection.style.display = 'none';
    }
    
    // Show main container by default
    if (container) container.style.display = 'block';
    
    if (page === 'myself') {
        // Hide main container and show profile section
        if (container) container.style.display = 'none';
        
        // Create profile section if it doesn't exist
        if (!document.getElementById('profile-section')) {
            createProfileSection();
        }
        
        // Show profile section
        document.getElementById('profile-section').style.display = 'block';
        return; // Skip the rest of the function
    } else if (page === 'main') {
        // Main page functionality
        switchPage('gallery');
        return;
    }
    
    if (uploadSection) uploadSection.style.display = 'none';
    if (gallery) gallery.style.display = 'grid';
    if (galleryHeader) galleryHeader.style.display = 'block';
    
    // ページ切り替え時は必ずGalleryタブをアクティブにする
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const galleryTab = document.querySelector('a[href="#gallery"]');
    if (galleryTab) galleryTab.classList.add('active');
    
    // ページに応じた処理
    if (page === 'gallery') {
        document.getElementById('page-title').textContent = 'AI Content Gallery';
        document.getElementById('page-description').textContent = 'AIと共創することカタチにできたコンテンツを紹介しています。';
        loadContents();
    } else if (page === 'ai-knowledge') {
        document.getElementById('page-title').textContent = 'AI Knowledge';
        document.getElementById('page-description').textContent = 'AIナレッジベースを探索する。';
        loadAIKnowledge();
    } else if (page === 'collections') {
        document.getElementById('page-title').textContent = 'Collections';
        document.getElementById('page-description').textContent = 'テーマ別に整理されたコンテンツコレクション。関連するプロジェクトやアイデアをまとめて探索できます。';
        loadCollections();
    }
}

// AI Knowledge専用の読み込み関数
async function loadAIKnowledge() {
    if (!supabase) return;

    try {
        const { data, error } = await supabase
            .from('business_ideas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        displayContents(data);
    } catch (error) {
        console.error('Error loading AI knowledge:', error);
    }
}

// Collections専用の読み込み関数
async function loadCollections() {
    if (!supabase) return;

    try {
        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        displayContents(data);
    } catch (error) {
        console.error('Error loading collections:', error);
    }
}

// Create profile section
function createProfileSection() {
    const profileSection = document.createElement('div');
    profileSection.id = 'profile-section';
    profileSection.className = 'profile-section';
    
    profileSection.innerHTML = `
        <div class="container">
            <!-- Profile Header Section -->
            <div class="header">
                <h1>Profile</h1>
                <p>AIと共創するクリエイターのプロフィールページ。経歴、スキル、プロジェクトなどを紹介しています。</p>
            </div>
        
            <!-- Profile Content Section -->
            <div class="profile-content-section">
                <div class="profile-container">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <div class="avatar-placeholder">YW</div>
                        </div>
                        <div class="profile-title">
                            <h1 class="profile-name">Your Name</h1>
                            <p class="profile-tagline">AI Creator & Innovator</p>
                        </div>
                    </div>
                    
                    <div class="profile-bio">
                        <div class="bio-section fade-in stagger-1">
                            <h2>About Me</h2>
                            <p>AIと共に創造的なプロジェクトを展開するクリエイターです。テクノロジーと芸術の融合点を探求し、新しい表現方法を模索しています。</p>
                        </div>
                        
                        <div class="bio-section fade-in stagger-2">
                            <h2>Skills</h2>
                            <div class="skills-container">
                                <div class="skill-tag">AI</div>
                                <div class="skill-tag">Design</div>
                                <div class="skill-tag">Web Development</div>
                                <div class="skill-tag">Creative Direction</div>
                                <div class="skill-tag">UX/UI</div>
                            </div>
                        </div>
                        
                        <div class="bio-section fade-in stagger-3">
                            <h2>Featured Projects</h2>
                            <div class="projects-grid">
                                <div class="project-card">
                                    <div class="project-card-inner">
                                        <div class="project-card-front">
                                            <div class="project-icon">🎨</div>
                                            <h3>AI Art Gallery</h3>
                                        </div>
                                        <div class="project-card-back">
                                            <p>AIを活用したアート作品のオンラインギャラリー。視覚表現の新しい可能性を探求しています。</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="project-card">
                                    <div class="project-card-inner">
                                        <div class="project-card-front">
                                            <div class="project-icon">💡</div>
                                            <h3>Innovation Hub</h3>
                                        </div>
                                        <div class="project-card-back">
                                            <p>AIを活用したビジネスアイデアの共有プラットフォーム。未来志向の起業家コミュニティを形成しています。</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="project-card">
                                    <div class="project-card-inner">
                                        <div class="project-card-front">
                                            <div class="project-icon">🚀</div>
                                            <h3>Future Lab</h3>
                                        </div>
                                        <div class="project-card-back">
                                            <p>次世代テクノロジーを活用した実験的プロジェクト。AIと人間の共創の可能性を追求しています。</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Claude Code Analysis Section -->
                        <div class="bio-section fade-in stagger-4">
                            <h2>Claude Code Analysis</h2>
                            <div class="claude-analysis-container">
                                <button class="analyze-btn" onclick="showClaudeAnalysis()">
                                    <span class="analyze-icon">🤖</span>
                                    <span>Claude Codeの使用状況を分析</span>
                                </button>
                                <div id="claude-analysis-result" style="display: none;">
                                    <div class="analysis-loading">
                                        <div class="spinner"></div>
                                        <p>JSONLファイルをアップロードしてください...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bio-section fade-in stagger-5">
                            <h2>Connect</h2>
                            <div class="connect-links">
                                <a href="#" class="connect-link">Twitter</a>
                                <a href="#" class="connect-link">LinkedIn</a>
                                <a href="#" class="connect-link">GitHub</a>
                                <a href="#" class="connect-link">Portfolio</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(profileSection);
    
    // Add Claude Analysis styles
    const style = document.createElement('style');
    style.textContent = `
        .claude-analysis-container {
            margin-top: 20px;
        }
        
        .analyze-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 30px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 0 auto;
        }
        
        .analyze-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
        }
        
        .analyze-icon {
            font-size: 1.5em;
            animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        
        .analysis-loading {
            text-align: center;
            padding: 20px;
        }
        
        .spinner {
            border: 3px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 3px solid #667eea;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .claude-stats {
            background: rgba(102, 126, 234, 0.1);
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
        }
        
        .claude-nickname {
            font-size: 1.8em;
            font-weight: bold;
            color: #667eea;
            text-align: center;
            margin-bottom: 10px;
        }
        
        .claude-personality {
            text-align: center;
            color: #666;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        
        .claude-scores {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 20px;
        }
        
        .score-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .score-bar {
            flex: 1;
            height: 10px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 5px;
            overflow: hidden;
        }
        
        .score-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 1s ease;
        }
        
        .file-upload-area {
            border: 2px dashed #667eea;
            border-radius: 10px;
            padding: 30px;
            text-align: center;
            margin-top: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .file-upload-area:hover {
            background: rgba(102, 126, 234, 0.05);
        }
        
        .file-upload-area.dragover {
            background: rgba(102, 126, 234, 0.1);
            border-color: #764ba2;
        }
    `;
    document.head.appendChild(style);
}

// Show Claude Analysis
window.showClaudeAnalysis = function() {
    const resultDiv = document.getElementById('claude-analysis-result');
    resultDiv.style.display = 'block';
    
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.jsonl';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', handleClaudeFiles);
    document.body.appendChild(fileInput);
    fileInput.click();
};

// Handle Claude JSONL files
async function handleClaudeFiles(event) {
    const files = Array.from(event.target.files).filter(f => f.name.endsWith('.jsonl'));
    
    if (files.length === 0) {
        alert('JSONLファイルを選択してください');
        return;
    }
    
    const resultDiv = document.getElementById('claude-analysis-result');
    resultDiv.innerHTML = `
        <div class="analysis-loading">
            <div class="spinner"></div>
            <p>分析中... ${files.length}個のファイルを処理しています</p>
        </div>
    `;
    
    // Load the analyzer script dynamically
    const script = document.createElement('script');
    script.src = 'js/claude-analyzer.js';
    script.onload = async () => {
        const analyzer = new ClaudeAnalyzer();
        
        // Process all files
        for (const file of files) {
            const content = await file.text();
            analyzer.processJsonlData(content);
        }
        
        // Get results
        const results = analyzer.finalizeAnalysis();
        
        // Display results
        resultDiv.innerHTML = `
            <div class="claude-stats">
                <div class="claude-nickname">
                    <span style="font-size: 1.5em;">${results.emoji}</span>
                    ${results.nickname}
                </div>
                <div class="claude-personality">${results.personality}</div>
                
                <div style="text-align: center; margin: 20px 0;">
                    <p><strong>総メッセージ数:</strong> ${results.totalMessages}</p>
                    <p><strong>ユーザーメッセージ:</strong> ${results.userMessages}</p>
                </div>
                
                <div class="claude-scores">
                    <div class="score-item">
                        <span>😊 丁寧さ</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${results.politenessScore * 10}%"></div>
                        </div>
                    </div>
                    <div class="score-item">
                        <span>🔬 技術的</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${results.technicalnessScore * 10}%"></div>
                        </div>
                    </div>
                    <div class="score-item">
                        <span>🧘 我慢強さ</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${results.patienceScore * 10}%"></div>
                        </div>
                    </div>
                    <div class="score-item">
                        <span>🚀 好奇心</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${results.curiosityScore * 10}%"></div>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <a href="claude-summary-analyzer.html" target="_blank" style="color: #667eea;">
                        詳細な分析を見る →
                    </a>
                </div>
            </div>
        `;
    };
    
    document.head.appendChild(script);
}