// Upload Functions

// 画像関連の変数
let uploadArea, imageInput;

function initUpload() {
    uploadArea = document.getElementById('uploadArea');
    imageInput = document.getElementById('image');
    
    if (!uploadArea || !imageInput) return;
    
    // ドラッグ&ドロップ機能
    uploadArea.addEventListener('click', () => imageInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            imageInput.files = files;
            updateUploadArea(files[0]);
        }
    });

    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            updateUploadArea(e.target.files[0]);
        }
    });

    // CTRL+V画像貼り付け機能
    document.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const blob = items[i].getAsFile();
                if (blob) {
                    // FileListオブジェクトを作成
                    const dt = new DataTransfer();
                    dt.items.add(blob);
                    imageInput.files = dt.files;
                    updateUploadArea(blob);
                }
                break;
            }
        }
    });
}

function updateUploadArea(file) {
    if (!uploadArea) return;
    uploadArea.innerHTML = `<p>選択済み: ${file.name}</p>`;
}

// フォーム送信処理
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!supabase) {
        alert('Supabaseが設定されていません。管理者にお問い合わせください。');
        return;
    }

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const url = formData.get('url');
    const description = formData.get('description');
    const category = formData.get('category');
    const backMessage = formData.get('backMessage');
    const image = imageInput?.files[0];
    
    if (!title || !description) {
        alert('必須項目を入力してください。');
        return;
    }

    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    try {
        let thumbnailUrl = null;
        
        // 画像がアップロードされている場合
        if (image) {
            const resizedImage = await resizeImage(image, 800, 600, 0.8);
            const fileExtension = image.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('thumbnails')
                .upload(fileName, resizedImage);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('thumbnails')
                .getPublicUrl(fileName);
                
            thumbnailUrl = urlData.publicUrl;
        }
        
        // データベースにコンテンツ情報を保存
        let tableName = 'contents'; // デフォルト
        if (currentPage === 'ai-knowledge') {
            tableName = 'business_ideas';
        } else if (currentPage === 'collections') {
            tableName = 'collections';
        }
        
        const insertData = {
            title,
            url: url || null,
            description,
            category: category || null,
            back_message: backMessage || null,
            thumbnail_url: thumbnailUrl,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(tableName)
            .insert([insertData])
            .select();

        if (error) throw error;

        // フォームをリセット
        e.target.reset();
        if (uploadArea) {
            uploadArea.innerHTML = '<p>画像をドラッグ&ドロップするか、クリックして選択してください<br><small>※画像がない場合はプレースホルダーが表示されます</small></p>';
        }
        
        // ギャラリーを更新
        if (currentPage === 'ai-knowledge') {
            loadAIKnowledge();
        } else if (currentPage === 'collections') {
            loadCollections();
        } else {
            loadContents();
        }
        loadEditGallery();
        
        // ギャラリータブに切り替え
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('a[href="#gallery"]').classList.add('active');
        
        const uploadSection = document.getElementById('upload-section');
        const gallery = document.getElementById('gallery');
        const editGallery = document.getElementById('editGallery');
        
        if (uploadSection) uploadSection.style.display = 'none';
        if (gallery) gallery.style.display = 'grid';
        if (editGallery) editGallery.style.display = 'none';
        
        document.getElementById('galleryTitle').textContent = 'Latest';
        let subtitleText = '最新のAIコンテンツを探索する'; // デフォルト
        if (currentPage === 'ai-knowledge') {
            subtitleText = '最新のAIナレッジを探索する';
        } else if (currentPage === 'collections') {
            subtitleText = '最新のコレクションを探索する';
        }
        document.getElementById('gallerySubtitle').textContent = subtitleText;
        
    } catch (error) {
        console.error('Error:', error);
        alert('エラーが発生しました: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

// 画像リサイズ関数
function resizeImage(file, maxWidth, maxHeight, quality) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // アスペクト比を保持してリサイズ
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // 画像を描画
            ctx.drawImage(img, 0, 0, width, height);
            
            // Blobとして出力
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}