// Gallery Functions

// コンテンツ読み込み
async function loadContents() {
    if (!supabase) return;

    try {
        const { data, error } = await supabase
            .from('contents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        displayContents(data);
    } catch (error) {
        console.error('Error loading contents:', error);
    }
}

// コンテンツ表示
function displayContents(contents) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    
    contents.forEach((content, index) => {
        const date = new Date(content.created_at).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const card = document.createElement('div');
        card.className = `content-card-container fade-in stagger-${(index % 3) + 1}`;
        
        // カード用の内部コンテナを追加
        const cardInner = document.createElement('div');
        cardInner.className = 'content-card';
        
        // Check if this is AI knowledge or collections page (both have back message cards)
        const isAIKnowledgePage = currentPage === 'ai-knowledge';
        const isCollectionsPage = currentPage === 'collections';
        const hasBackMessage = content.back_message;
        
        if (isAIKnowledgePage || isCollectionsPage) {
            const imageContent = content.thumbnail_url ? 
                `<img src="${content.thumbnail_url}" alt="${content.title}" class="card-image">` :
                `<div class="card-image no-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">●</div>`;
            
            // カテゴリとアイコンをページ別に設定
            const categoryText = isAIKnowledgePage ? 'AI KNOWLEDGE' : 'COLLECTIONS';
            const backIcon = isAIKnowledgePage ? '●' : '●';
            const fallbackMessage = isAIKnowledgePage 
                ? 'このAIナレッジの詳細情報はまだ追加されていません。'
                : 'このコレクションの詳細情報はまだ追加されていません。';
            
            cardInner.innerHTML = `
                <div class="card-face">
                    ${imageContent}
                    <div class="card-content">
                        <div class="card-header">
                            <h3 class="card-title">${content.title}</h3>
                            <div class="card-category">${categoryText}</div>
                        </div>
                        <p class="card-description">${content.description}</p>
                        <div class="card-footer">
                            <div class="card-date">${date}</div>
                        </div>
                    </div>
                </div>
                <div class="card-face card-back">
                    <div class="back-icon">${backIcon}</div>
                    <p>${content.back_message || fallbackMessage}</p>
                </div>
            `;
            
            // カードコンテナに追加
            card.appendChild(cardInner);
            
            // Add click handler for card flip with GSAP
            cardInner.addEventListener('click', () => {
                flipCard(cardInner);
            });
        } else {
            const imageContent = content.thumbnail_url ? 
                `<img src="${content.thumbnail_url}" alt="${content.title}" class="card-image">` :
                `<div class="card-image no-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">●</div>`;
            
            const categoryDisplay = content.category || 'Nothing';
            
            cardInner.innerHTML = `
                <div class="card-face">
                    ${imageContent}
                    <div class="card-content">
                        <div class="card-header">
                            <div>
                                <h3 class="card-title">${content.title}</h3>
                                <div class="card-category">${categoryDisplay}</div>
                            </div>
                        </div>
                        <p class="card-description">${content.description}</p>
                        <div class="card-footer">
                            <div class="card-date">${date}</div>
                        </div>
                    </div>
                </div>
            `;
            
            // カードコンテナに追加
            card.appendChild(cardInner);
            
            // Add click handler for the entire card
            cardInner.addEventListener('click', () => {
                if (content.url) {
                    window.open(content.url, '_blank');
                }
            });
        }
        
        gallery.appendChild(card); // コンテナをギャラリーに追加
    });
}

// 編集用ギャラリーを読み込む
async function loadEditGallery() {
    if (!supabase) return;

    try {
        let tableName = 'contents'; // デフォルト
        if (currentPage === 'ai-knowledge') {
            tableName = 'business_ideas';
        } else if (currentPage === 'collections') {
            tableName = 'collections';
        }
        
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        displayEditGallery(data);
    } catch (error) {
        console.error('Error loading edit gallery:', error);
    }
}

// 編集用ギャラリー表示
function displayEditGallery(contents) {
    const editGallery = document.getElementById('editGallery');
    editGallery.innerHTML = '';
    
    contents.forEach((content) => {
        const card = document.createElement('div');
        card.className = 'edit-card';
        
        const imageContent = content.thumbnail_url ? 
            `<img src="${content.thumbnail_url}" alt="${content.title}" class="edit-card-image">` :
            `<div class="edit-card-image no-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">●</div>`;
        
        card.innerHTML = `
            ${imageContent}
            <div class="edit-card-content">
                <h3 class="edit-card-title">${content.title}</h3>
            </div>
        `;
        
        // カードクリックでモーダルを開く
        card.addEventListener('click', () => {
            openEditModal(content);
        });
        
        editGallery.appendChild(card);
    });
}

// GSAPを使ったカードフリップ関数
function flipCard(card) {
    if (!window.gsap) {
        console.warn('GSAP is not loaded');
        return;
    }
    
    const isFlipped = card.classList.contains('flipped');
    
    if (isFlipped) {
        // カードを戻す
        gsap.to(card, { 
            duration: 0.6, 
            rotationY: 0, 
            ease: "power2.inOut",
            onComplete: () => {
                card.classList.remove('flipped');
            }
        });
    } else {
        // カードをフリップ（右から左に回転）
        gsap.to(card, { 
            duration: 0.6, 
            rotationY: -180, 
            ease: "power2.inOut",
            onComplete: () => {
                card.classList.add('flipped');
            }
        });
    }
}