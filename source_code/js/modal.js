// Modal Functions

// 編集モーダルを開く
function openEditModal(content) {
    const editModal = document.getElementById('editModal');
    
    document.getElementById('editContentId').value = content.id;
    document.getElementById('editTitle').value = content.title;
    document.getElementById('editUrl').value = content.url || '';
    document.getElementById('editCategory').value = content.category || '';
    document.getElementById('editDescription').value = content.description;
    document.getElementById('editBackMessage').value = content.back_message || '';
    
    // 現在の画像を表示
    const editUploadArea = document.getElementById('editUploadArea');
    if (content.thumbnail_url) {
        editUploadArea.innerHTML = `
            <img src="${content.thumbnail_url}" alt="${content.title}" class="current-image-preview">
            <p>新しい画像をアップロードする場合はクリックしてください</p>
        `;
    } else {
        editUploadArea.innerHTML = `
            <div class="no-image-placeholder">
                <span>No Image</span>
            </div>
            <p>画像をアップロードする場合はクリックしてください</p>
        `;
    }
    
    editModal.style.display = 'block';
}

function initModalEvents() {
    const editModal = document.getElementById('editModal');
    const editUploadArea = document.getElementById('editUploadArea');
    const editImageInput = document.getElementById('editImage');

    // モーダル関連のイベントリスナー
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            editModal.style.display = 'none';
        });
    }

    const cancelEdit = document.getElementById('cancelEdit');
    if (cancelEdit) {
        cancelEdit.addEventListener('click', () => {
            editModal.style.display = 'none';
        });
    }

    // モーダル外クリックで閉じる
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    // 編集フォーム用の画像アップロード
    if (editUploadArea && editImageInput) {
        editUploadArea.addEventListener('click', () => editImageInput.click());
        editImageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                editUploadArea.innerHTML = `
                    <p>選択済み: ${file.name}</p>
                    <p style="font-size: 12px; color: var(--text-light); margin-top: 8px;">更新時に新しい画像がアップロードされます</p>
                `;
            }
        });
    }

    // 削除ボタン
    const deleteContent = document.getElementById('deleteContent');
    if (deleteContent) {
        deleteContent.addEventListener('click', handleDelete);
    }

    // 編集フォーム送信
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }
}

async function handleDelete() {
    const contentId = document.getElementById('editContentId').value;
    
    if (!confirm('このコンテンツを削除してもよろしいですか？この操作は元に戻せません。')) {
        return;
    }
    
    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    
    try {
        let tableName = 'contents'; // デフォルト
        if (currentPage === 'ai-knowledge') {
            tableName = 'business_ideas';
        } else if (currentPage === 'collections') {
            tableName = 'collections';
        }
        
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', contentId);
        
        if (error) throw error;
        
        const editModal = document.getElementById('editModal');
        editModal.style.display = 'none';
        loadEditGallery();
        if (currentPage === 'ai-knowledge') {
            loadAIKnowledge();
        } else if (currentPage === 'collections') {
            loadCollections();
        } else {
            loadContents();
        }
        
        alert('コンテンツが削除されました。');
        
    } catch (error) {
        console.error('Error:', error);
        alert('削除中にエラーが発生しました: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const contentId = document.getElementById('editContentId').value;
    const title = document.getElementById('editTitle').value;
    const url = document.getElementById('editUrl').value;
    const category = document.getElementById('editCategory').value;
    const description = document.getElementById('editDescription').value;
    const backMessage = document.getElementById('editBackMessage').value;
    const image = document.getElementById('editImage').files[0];
    
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    try {
        let thumbnailUrl;
        
        // 新しい画像がアップロードされた場合
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
        
        const updateData = { title, url: url || null, category: category || null, description, back_message: backMessage || null };
        if (thumbnailUrl) {
            updateData.thumbnail_url = thumbnailUrl;
        }
        
        let tableName = 'contents'; // デフォルト
        if (currentPage === 'ai-knowledge') {
            tableName = 'business_ideas';
        } else if (currentPage === 'collections') {
            tableName = 'collections';
        }
        
        const { data, error } = await supabase
            .from(tableName)
            .update(updateData)
            .eq('id', contentId)
            .select();

        if (error) throw error;

        const editModal = document.getElementById('editModal');
        editModal.style.display = 'none';
        loadEditGallery();
        if (currentPage === 'ai-knowledge') {
            loadAIKnowledge();
        } else if (currentPage === 'collections') {
            loadCollections();
        } else {
            loadContents();
        }
        
        alert('コンテンツが更新されました。');
        
    } catch (error) {
        console.error('Error:', error);
        alert('更新中にエラーが発生しました: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}