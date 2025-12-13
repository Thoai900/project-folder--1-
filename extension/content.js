// Content Script - Inject vào trang AI để thêm nút Refine
// Hoạt động trên ChatGPT, Claude, Gemini, v.v.

(function() {
    'use strict';

    // API Configuration - Update your Vercel domain here
    // This will be the same domain as your main app
    const API_BASE_URL = 'https://project-folder-1.vercel.app';
    const API_ENDPOINT = `${API_BASE_URL}/api/refine-prompt`;

    // Selectors cho các trang AI khác nhau
    const TEXTAREA_SELECTORS = [
        'textarea[placeholder*="Message"]',  // ChatGPT
        'textarea[placeholder*="Send"]',     // Claude
        'textarea[placeholder*="Enter"]',    // Gemini old
        'div[contenteditable="true"]',       // Gemini (main), some Claude
        'textarea[contenteditable="true"]',  // Generic
        '#prompt-textarea',                  // Fallback
        '[data-testid="textbox"]'            // Alternative
    ];

    let currentTextarea = null;
    let refineButton = null;

    // Tìm textarea trên trang
    function findTextarea() {
        for (const selector of TEXTAREA_SELECTORS) {
            const textarea = document.querySelector(selector);
            if (textarea) {
                return textarea;
            }
        }
        return null;
    }

    // Tạo nút Refine
    function createRefineButton() {
        const button = document.createElement('button');
        button.id = 'ai-prompt-refiner-btn';
        button.className = 'ai-refiner-btn';
        button.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            <span>Tinh chỉnh</span>
        `;
        button.title = 'Tinh chỉnh prompt với AI (Ctrl+Shift+R)';
        
        button.addEventListener('click', handleRefineClick);
        
        return button;
    }

    // Xử lý khi click nút Refine
    async function handleRefineClick(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!currentTextarea) return;

        const originalPrompt = currentTextarea.value || currentTextarea.textContent;
        
        if (!originalPrompt || originalPrompt.trim().length < 5) {
            showNotification('⚠️ Vui lòng nhập prompt trước khi tinh chỉnh!', 'warning');
            return;
        }

        // Hiển thị loading
        refineButton.classList.add('loading');
        refineButton.disabled = true;

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: originalPrompt
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Lỗi từ server');
            }

            // Thay thế nội dung
            const refinedPrompt = data.refined;
            
            // Phát hiện loại textarea và set giá trị phù hợp
            if (currentTextarea.contentEditable === 'true') {
                currentTextarea.textContent = refinedPrompt;
                currentTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                currentTextarea.value = refinedPrompt;
                currentTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                currentTextarea.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Focus vào textarea
            currentTextarea.focus();

            // Hiệu ứng highlight
            currentTextarea.classList.add('ai-refined-animation');
            setTimeout(() => {
                currentTextarea.classList.remove('ai-refined-animation');
            }, 1500);

            showNotification('✨ Prompt đã được tinh chỉnh thành công!', 'success');

        } catch (error) {
            console.error('Refine error:', error);
            showNotification('❌ Lỗi: ' + error.message, 'error');
        } finally {
            refineButton.classList.remove('loading');
            refineButton.disabled = false;
        }
    }

    // Hiển thị thông báo
    function showNotification(message, type = 'info') {
        // Xóa notification cũ nếu có
        const existingNotif = document.getElementById('ai-refiner-notification');
        if (existingNotif) existingNotif.remove();

        const notification = document.createElement('div');
        notification.id = 'ai-refiner-notification';
        notification.className = `ai-refiner-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Inject nút vào giao diện
    function injectButton() {
        currentTextarea = findTextarea();
        
        if (!currentTextarea || document.getElementById('ai-prompt-refiner-btn')) {
            return;
        }

        refineButton = createRefineButton();

        // Tìm container phù hợp để chèn nút
        const parent = currentTextarea.closest('form') || 
                      currentTextarea.closest('div[class*="composer"]') ||
                      currentTextarea.parentElement;

        if (parent) {
            // Tạo wrapper container
            const wrapper = document.createElement('div');
            wrapper.className = 'ai-refiner-wrapper';
            wrapper.appendChild(refineButton);
            
            parent.style.position = 'relative';
            parent.appendChild(wrapper);

            console.log('✅ AI Prompt Refiner đã được inject thành công!');
        }
    }

    // Keyboard shortcut: Ctrl+Shift+R
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            if (refineButton && !refineButton.disabled) {
                handleRefineClick(e);
            }
        }
    });

    // Observer để theo dõi thay đổi DOM (SPA navigation)
    const observer = new MutationObserver(() => {
        if (!document.getElementById('ai-prompt-refiner-btn')) {
            injectButton();
        }
    });

    // Khởi động
    function init() {
        // Thử inject ngay lập tức
        setTimeout(injectButton, 1000);
        
        // Thử lại sau 3 giây (cho các trang load chậm)
        setTimeout(injectButton, 3000);

        // Theo dõi thay đổi DOM
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Chạy khi DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
