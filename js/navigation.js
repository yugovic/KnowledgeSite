// Navigation Functions

function navigateToPage(targetPage) {
    if (targetPage === 'upload') {
        switchToUploadPage();
    } else if (targetPage === 'collections') {
        switchToCollectionsPage();
    } else if (targetPage === 'directory') {
        switchToDirectoryPage();
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
            } else {
                // Gallery以外は認証が必要
                const isAuthenticated = await checkAuthStatus();
                if (!isAuthenticated) {
                    if (href === '#upload') {
                        showAuthModal('upload');
                    } else if (href === '#collections') {
                        showAuthModal('collections');
                    } else if (href === '#directory') {
                        showAuthModal('directory');
                    }
                } else {
                    // 既に認証済みの場合
                    if (href === '#upload') {
                        switchToUploadPage();
                    } else if (href === '#collections') {
                        switchToCollectionsPage();
                    } else if (href === '#directory') {
                        switchToDirectoryPage();
                    }
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
                        
                        <div class="bio-section fade-in stagger-4">
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
}