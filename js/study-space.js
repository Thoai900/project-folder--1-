/* ============================================
   Study Space - Main Logic & State Management
   ============================================ */

// State Management
const StudyState = {
    // Current document
    currentDoc: null,
    docType: null, // 'pdf', 'video', 'text'
    
    // PDF specific
    pdfFile: null,
    pdfDoc: null,
    currentPage: 1,
    totalPages: 0,
    pdfScale: 1.5,
    
    // Chat & AI
    chatHistory: [],
    isAIPanelOpen: true,
    currentAITab: 'chat',
    
    // UI
    theme: localStorage.getItem('study-theme') || 'light',
    sidebarOpen: true
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Study Space initialized');
    
    // Initialize theme
    applyTheme(StudyState.theme);
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize Lucide icons
    if (window.lucide) lucide.createIcons();
    
    // Restore from localStorage
    loadFromStorage();
});

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Theme toggle
    document.getElementById('toggle-theme')?.addEventListener('click', () => {
        StudyState.theme = StudyState.theme === 'light' ? 'dark' : 'light';
        applyTheme(StudyState.theme);
        localStorage.setItem('study-theme', StudyState.theme);
    });
    
    // Sidebar toggle
    document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar?.classList.toggle('open');
        StudyState.sidebarOpen = !StudyState.sidebarOpen;
    });
    
    // Chat input
    document.getElementById('ai-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Sidebar nav items
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// ============================================
// THEME MANAGEMENT
// ============================================

function applyTheme(theme) {
    const html = document.documentElement;
    const isDark = theme === 'dark';
    
    if (isDark) {
        html.classList.add('dark');
        html.classList.remove('light');
        document.body.style.backgroundColor = 'var(--dark-bg)';
        document.body.style.color = 'var(--dark-text-primary)';
    } else {
        html.classList.add('light');
        html.classList.remove('dark');
        document.body.style.backgroundColor = 'var(--light-bg)';
        document.body.style.color = 'var(--light-text-primary)';
    }
    
    // Update theme toggle icon
    const btn = document.getElementById('toggle-theme');
    if (btn) {
        btn.innerHTML = isDark ? '<i data-lucide="moon" width="18"></i>' : '<i data-lucide="sun" width="18"></i>';
        if (window.lucide) lucide.createIcons();
    }
}

// ============================================
// DOCUMENT LOADING (PDF/Video/Text)
// ============================================

async function loadDocument(docType, source, title) {
    StudyState.docType = docType;
    StudyState.currentDoc = { type: docType, source, title };
    
    // Update UI
    document.getElementById('doc-title').textContent = title;
    document.getElementById('content-type').textContent = docType.toUpperCase();
    
    // Hide all containers
    document.getElementById('pdf-container').style.display = 'none';
    document.getElementById('video-container').style.display = 'none';
    document.getElementById('text-container').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
    
    // Load based on type
    if (docType === 'pdf') {
        await loadPDF(source);
    } else if (docType === 'video') {
        loadVideo(source);
    } else if (docType === 'text') {
        loadText(source);
    }
    
    // Save to recent docs
    saveToStorage();
    
    // Reset chat
    resetChat();
}

// ============================================
// PDF VIEWER
// ============================================

async function loadPDF(fileOrUrl) {
    try {
        // Show PDF container
        document.getElementById('pdf-container').style.display = 'block';
        
        let pdfData;
        
        // Handle file input or URL
        if (fileOrUrl instanceof File) {
            pdfData = await fileOrUrl.arrayBuffer();
        } else if (typeof fileOrUrl === 'string') {
            const response = await fetch(fileOrUrl);
            pdfData = await response.arrayBuffer();
        }
        
        // Load PDF document
        StudyState.pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
        StudyState.totalPages = StudyState.pdfDoc.numPages;
        StudyState.currentPage = 1;
        
        // Update UI
        updatePDFPageInfo();
        
        // Render first page
        await renderPDFPage(StudyState.currentPage);
        
        // Update footer visibility
        document.getElementById('content-footer').style.display = 'flex';
        
        console.log(`✅ PDF loaded: ${StudyState.totalPages} pages`);
    } catch (error) {
        console.error('❌ Error loading PDF:', error);
        showToast('Lỗi tải PDF');
    }
}

async function renderPDFPage(pageNum) {
    if (!StudyState.pdfDoc || pageNum < 1 || pageNum > StudyState.totalPages) return;
    
    try {
        const page = await StudyState.pdfDoc.getPage(pageNum);
        const canvas = document.getElementById('pdf-canvas');
        const context = canvas.getContext('2d');
        
        const viewport = page.getViewport({ scale: StudyState.pdfScale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        updatePDFPageInfo();
    } catch (error) {
        console.error('❌ Error rendering PDF page:', error);
    }
}

function updatePDFPageInfo() {
    document.getElementById('page-info').textContent = `Trang ${StudyState.currentPage}/${StudyState.totalPages}`;
    document.getElementById('page-input').value = StudyState.currentPage;
    
    // Update button states
    document.getElementById('prev-page-btn').disabled = StudyState.currentPage === 1;
    document.getElementById('next-page-btn').disabled = StudyState.currentPage === StudyState.totalPages;
}

function nextPage() {
    if (StudyState.currentPage < StudyState.totalPages) {
        StudyState.currentPage++;
        renderPDFPage(StudyState.currentPage);
    }
}

function prevPage() {
    if (StudyState.currentPage > 1) {
        StudyState.currentPage--;
        renderPDFPage(StudyState.currentPage);
    }
}

function goToPage(pageNum) {
    const page = parseInt(pageNum, 10);
    if (page >= 1 && page <= StudyState.totalPages) {
        StudyState.currentPage = page;
        renderPDFPage(StudyState.currentPage);
    }
}

function zoomIn() {
    StudyState.pdfScale = Math.min(StudyState.pdfScale + 0.2, 3);
    renderPDFPage(StudyState.currentPage);
}

function zoomOut() {
    StudyState.pdfScale = Math.max(StudyState.pdfScale - 0.2, 0.5);
    renderPDFPage(StudyState.currentPage);
}

// ============================================
// VIDEO VIEWER
// ============================================

function loadVideo(videoUrl) {
    // Extract YouTube video ID if needed
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = videoUrl.match(youtubeRegex);
    const videoId = match ? match[1] : videoUrl;
    
    document.getElementById('video-container').style.display = 'block';
    document.getElementById('video-player').src = `https://www.youtube.com/embed/${videoId}`;
    
    document.getElementById('content-footer').style.display = 'none';
}

// ============================================
// TEXT VIEWER
// ============================================

function loadText(textContent) {
    document.getElementById('text-container').style.display = 'block';
    document.getElementById('text-content').innerHTML = `<p>${escapeHtml(textContent)}</p>`;
    document.getElementById('content-footer').style.display = 'none';
}

// ============================================
// AI CHAT INTERFACE
// ============================================

function switchAITab(tab) {
    // Update tab buttons
    document.querySelectorAll('.ai-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Hide all tabs
    document.getElementById('chat-tab').classList.add('hidden');
    document.getElementById('summary-tab').classList.add('hidden');
    document.getElementById('tools-tab').classList.add('hidden');
    
    // Show selected tab
    document.getElementById(`${tab}-tab`).classList.remove('hidden');
    
    // Show/hide input based on tab
    const chatInput = document.getElementById('chat-input');
    if (tab === 'chat') {
        chatInput.style.display = 'flex';
    } else {
        chatInput.style.display = 'none';
    }
    
    StudyState.currentAITab = tab;
}

function sendMessage() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addChatMessage('user', message);
    input.value = '';
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
        addChatMessage('ai', 'Đây là phản hồi từ AI. Tính năng chat sẽ được tích hợp trong các phiên bản tiếp theo.');
    }, 500);
}

function addChatMessage(role, content) {
    const chatHistory = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex items-start gap-3 fade-in`;
    
    if (role === 'user') {
        messageDiv.innerHTML = `
            <div class="flex-1 flex justify-end">
                <div class="bg-indigo-600 text-white rounded-lg p-3 max-w-xs">
                    <p class="text-sm">${escapeHtml(content)}</p>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <i data-lucide="sparkles" width="16" class="text-white"></i>
            </div>
            <div class="flex-1 bg-gray-100 rounded-lg p-3">
                <p class="text-sm text-gray-700">${escapeHtml(content)}</p>
            </div>
        `;
    }
    
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    if (window.lucide) lucide.createIcons();
    
    // Add to history
    StudyState.chatHistory.push({ role, content, timestamp: new Date() });
}

function handleChatInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function resetChat() {
    StudyState.chatHistory = [];
    document.getElementById('chat-history').innerHTML = `
        <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <i data-lucide="sparkles" width="16" class="text-white"></i>
            </div>
            <div class="flex-1 bg-gray-100 rounded-lg p-3">
                <p class="text-sm text-gray-700">Tôi đã sẵn sàng để giúp bạn với tài liệu này. Hãy đặt câu hỏi!</p>
            </div>
        </div>
    `;
}

// ============================================
// TOOLS & DIALOGS
// ============================================

function openTool(tool) {
    console.log(`Opening tool: ${tool}`);
    showToast(`Công cụ "${tool}" sắp được phát triển`);
}

function closeAIPanel() {
    StudyState.isAIPanelOpen = !StudyState.isAIPanelOpen;
    const panel = document.getElementById('ai-panel');
    if (StudyState.isAIPanelOpen) {
        panel.style.display = 'flex';
    } else {
        panel.style.display = 'none';
    }
}

function toggleFullscreen() {
    const viewer = document.getElementById('content-viewer');
    if (!document.fullscreenElement) {
        viewer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// ============================================
// NAVIGATION
// ============================================

function goToLibrary() {
    // Redirect to main library page
    window.location.href = 'index.html';
}

// ============================================
// STORAGE & PERSISTENCE
// ============================================

function saveToStorage() {
    if (StudyState.currentDoc) {
        localStorage.setItem('study-last-doc', JSON.stringify(StudyState.currentDoc));
        localStorage.setItem('study-current-page', StudyState.currentPage);
    }
}

function loadFromStorage() {
    const lastDoc = localStorage.getItem('study-last-doc');
    if (lastDoc) {
        const doc = JSON.parse(lastDoc);
        const page = parseInt(localStorage.getItem('study-current-page'), 10) || 1;
        StudyState.currentPage = page;
        console.log('Loaded from storage:', doc);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast fixed bottom-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize on load
console.log('Study Space ready');
