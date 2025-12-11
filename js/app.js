function renderFriendsModal(container) {
    const styles = getStyles();
    const user = state.currentUser;
    const friends = user.friends || [];
    container.innerHTML = `
        <div class="p-6 space-y-6">
            <div class="text-center">
                <h3 class="text-2xl font-bold ${styles.textPrimary} mb-2">Danh sách bạn bè</h3>
                <p class="${styles.textSecondary} text-sm">Bạn có <span class="font-bold ${getColorClass('text-soft')}">${friends.length}</span> bạn bè</p>
            </div>
            <div class="flex gap-2">
                <input type="email" id="friend-email-input" placeholder="Nhập email bạn..." class="flex-1 ${styles.inputBg} border ${styles.border} rounded-lg px-4 py-2 ${styles.textPrimary} text-sm outline-none ${getColorClass('focus')} transition-all">
                <button onclick="addFriend()" class="px-6 py-2 rounded-lg ${getColorClass('bg')} ${getColorClass('bg-hover')} text-white font-bold transition-all flex items-center gap-2">
                    <i data-lucide="user-plus" size="16"></i> Thêm
                </button>
            </div>
            <div class="max-h-96 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                ${friends.length === 0 ? `
                    <div class="text-center py-8 ${styles.textSecondary}">
                        <i data-lucide="users" size="32" class="mx-auto opacity-30 mb-2"></i>
                        <p>Chưa có bạn bè</p>
                    </div>
                ` : friends.map((friend, idx) => `
                    <div class="p-3 rounded-lg ${styles.inputBg} border ${styles.border} flex items-center justify-between">
                        <div>
                            <p class="font-bold ${styles.textPrimary}">${friend.name}</p>
                            <p class="text-xs ${styles.textSecondary}">${friend.email}</p>
                        </div>
                        <button onclick="removeFriend(${idx})" class="p-2 rounded-lg hover:bg-red-500/10 hover:border-red-500/30 text-red-400 transition-all">
                            <i data-lucide="trash-2" size="16"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="flex gap-3 pt-4 border-t ${styles.border}">
                <button onclick="closeModal()" class="btn-core btn-glass flex-1 px-5 py-3 ${styles.textPrimary}">
                    Đóng
                </button>
            </div>
        </div>
    `;
    lucide.createIcons();
}
// ==========================================
// 1. STATE MANAGEMENT & INITIALIZATION
// ==========================================

// Phiên bản dữ liệu (Tăng số này lên để reset localStorage của user nếu cấu trúc dữ liệu thay đổi)
const APP_VERSION = '1.1';

// Primary color palette (fixed indigo theme)
const COLOR_PRESETS = {
    indigo: {
        text: 'text-indigo-600',
        textSoft: 'text-indigo-500',
        bg: 'bg-indigo-600',
        bgHover: 'hover:bg-indigo-500',
        focus: 'focus:border-indigo-500',
        softBg: 'bg-indigo-500/10',
        softHover: 'hover:bg-indigo-500/20',
        border: 'border-indigo-500/30',
        shadow: 'shadow-indigo-500/30',
        ring: 'ring-indigo-400/50',
        gradientMain: 'from-indigo-600 to-purple-600',
        gradientBright: 'from-indigo-500 via-purple-500 to-pink-500'
    },
    emerald: {
        text: 'text-emerald-600',
        textSoft: 'text-emerald-500',
        bg: 'bg-emerald-600',
        bgHover: 'hover:bg-emerald-500',
        focus: 'focus:border-emerald-500',
        softBg: 'bg-emerald-500/10',
        softHover: 'hover:bg-emerald-500/20',
        border: 'border-emerald-500/30',
        shadow: 'shadow-emerald-500/30',
        ring: 'ring-emerald-400/50',
        gradientMain: 'from-emerald-600 to-teal-600',
        gradientBright: 'from-emerald-500 via-teal-500 to-lime-500'
    },
    orange: {
        text: 'text-orange-600',
        textSoft: 'text-orange-500',
        bg: 'bg-orange-600',
        bgHover: 'hover:bg-orange-500',
        focus: 'focus:border-orange-500',
        softBg: 'bg-orange-500/10',
        softHover: 'hover:bg-orange-500/20',
        border: 'border-orange-500/30',
        shadow: 'shadow-orange-500/30',
        ring: 'ring-orange-400/50',
        gradientMain: 'from-orange-600 to-amber-600',
        gradientBright: 'from-orange-500 via-amber-500 to-yellow-500'
    },
    sky: {
        text: 'text-sky-600',
        textSoft: 'text-sky-500',
        bg: 'bg-sky-600',
        bgHover: 'hover:bg-sky-500',
        focus: 'focus:border-sky-500',
        softBg: 'bg-sky-500/10',
        softHover: 'hover:bg-sky-500/20',
        border: 'border-sky-500/30',
        shadow: 'shadow-sky-500/30',
        ring: 'ring-sky-400/50',
        gradientMain: 'from-sky-600 to-blue-600',
        gradientBright: 'from-sky-500 via-cyan-500 to-blue-500'
    },
    cyber: {
        text: 'text-lime-400',
        textSoft: 'text-lime-300',
        bg: 'bg-lime-400',
        bgHover: 'hover:bg-lime-300',
        focus: 'focus:border-lime-300',
        softBg: 'bg-lime-400/10',
        softHover: 'hover:bg-lime-400/20',
        border: 'border-lime-400/40',
        shadow: 'shadow-lime-400/30',
        ring: 'ring-lime-300/60',
        gradientMain: 'from-lime-400 to-cyan-400',
        gradientBright: 'from-lime-400 via-cyan-400 to-emerald-300'
    }
};

// Fixed primary color (remove user switching)
const DEFAULT_PRIMARY_COLOR = 'indigo';

// Function to detect initial theme (Auto Dark/Light Mode)
const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('pm_theme');
    if (savedTheme) return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
};

// Data Migration Logic (Fix lỗi xung đột dữ liệu cũ)
const initializePrompts = () => {
    const savedVersion = localStorage.getItem('pm_version');
    const savedPrompts = localStorage.getItem('pm_data');

    // Nếu chưa có version hoặc version cũ -> Reset về dữ liệu gốc để tránh lỗi
    if (savedVersion !== APP_VERSION) {
        localStorage.setItem('pm_version', APP_VERSION);
        localStorage.setItem('pm_data', JSON.stringify(MASTER_PROMPTS));
        return MASTER_PROMPTS;
    }
    return savedPrompts ? JSON.parse(savedPrompts) : MASTER_PROMPTS;
};

// Application State
let state = {
    theme: getInitialTheme(),
    prompts: initializePrompts(), // Sử dụng hàm khởi tạo an toàn
    activeCategory: "Tất cả",
    activeSubject: null, 
    searchTerm: "",
    currentView: "library",
    modalOpen: false,
    currentModal: null, 
    activePrompt: null,
    activeTool: null, 
    chatHistory: [],
    isListening: false,
    scanResult: "",
    currentUser: JSON.parse(localStorage.getItem('pm_currentUser')) || null,
    users: JSON.parse(localStorage.getItem('pm_users')) || [],
    // Cho phép user nhập key riêng nếu key chung hết hạn
    userApiKey: localStorage.getItem('pm_api_key') || "",
    // Kiểu trả lời: 'fast' (nhanh - hiển thị toàn bộ) hoặc 'detailed' (chi tiết - typewriter)
    responseMode: 'detailed',
    isLoadingPrompts: false,
    loadingTimer: null
};

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

function getStyles() {
    return THEME_CONFIG[state.theme];
}

function getColorClass(type) {
    const palette = COLOR_PRESETS[DEFAULT_PRIMARY_COLOR] || COLOR_PRESETS.indigo;
    switch (type) {
        case 'text': return palette.text;
        case 'text-soft': return palette.textSoft;
        case 'bg-500': return palette.textSoft.replace('text', 'bg');
        case 'bg': return palette.bg;
        case 'bg-hover': return palette.bgHover;
        case 'focus': return palette.focus;
        case 'soft-bg': return palette.softBg;
        case 'soft-hover': return palette.softHover;
        case 'border': return palette.border;
        case 'shadow': return palette.shadow;
        case 'ring': return palette.ring;
        case 'gradient-main': return palette.gradientMain;
        case 'gradient-bright': return palette.gradientBright;
        default: return '';
    }
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('pm_theme', state.theme);
    applyTheme();
    renderApp();
}

function applyTheme() {
    const styles = getStyles();
    const bgDiv = document.getElementById('app-bg');
    bgDiv.className = `fixed inset-0 z-0 pointer-events-none transition-all duration-500 ${styles.bg}`;
    
    if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const content = document.getElementById('toast-content');
    const msgSpan = document.getElementById('toast-message');
    const styles = getStyles();

    content.className = `backdrop-blur-xl border px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 ${state.theme === 'dark' ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-400' : 'bg-white/90 border-emerald-500/30 text-emerald-600'}`;
    msgSpan.innerText = message;

    container.classList.remove('translate-y-10', 'opacity-0');
    container.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        container.classList.add('translate-y-10', 'opacity-0');
        container.classList.remove('translate-y-0', 'opacity-100');
    }, 3000);
}

function copyToClipboard(text) {
    if (!text) return;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showToast("Đã sao chép nội dung!"));
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast("Đã sao chép nội dung!");
        } catch (err) {
            showToast("Lỗi sao chép!");
        }
        document.body.removeChild(textArea);
    }
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Escape regex special chars so placeholders with symbols still replace correctly
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function simpleMarkdown(text) {
    if (!text) return '';
    let codeBlocks = [];
    
    // Lưu code blocks để xử lý sau
    let cleanText = text.replace(/```([\s\S]*?)```/g, (match, content) => {
        codeBlocks.push(content);
        return `__CODEBLOCK_${codeBlocks.length - 1}__`;
    });
    
    cleanText = escapeHtml(cleanText);
    
    // Xử lý Markdown formatting
    let html = cleanText
        .replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`)
        .replace(/\*(.*?)\*/g, `<em>$1</em>`)
        .replace(/^#### (.*$)/gim, `<h4 class="text-base font-semibold mt-3 mb-2 flex items-center gap-2"><span class="w-1 h-4 ${getColorClass('bg-500')} rounded-full"></span>$1</h4>`)
        .replace(/^### (.*$)/gim, `<h3 class="text-lg font-bold mt-4 mb-2 flex items-center gap-2"><span class="w-1 h-5 ${getColorClass('bg-500')} rounded-full"></span>$1</h3>`)
        .replace(/^## (.*$)/gim, `<h2 class="text-xl font-bold mt-5 mb-3 flex items-center gap-2"><span class="w-1 h-6 ${getColorClass('bg-500')} rounded-full"></span>$1</h2>`)
        .replace(/^# (.*$)/gim, `<h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getColorClass('gradient-bright')} mt-6 mb-4 pb-2 border-b border-white/10">$1</h1>`)
        .replace(/^\- (.*$)/gim, `<div class="flex items-start gap-3 ml-2 mb-1"><span class="${getColorClass('text-soft')} mt-2 text-[8px]">●</span><span class="flex-1">$1</span></div>`);
    
    // Xử lý Markdown Tables (markdown table format)
    html = html.replace(/^\|(.+)\n\|[-:\s|]+\n((?:\|.+\n?)*)/gim, (match) => {
        const lines = match.trim().split('\n');
        let tableHtml = `<div class="overflow-x-auto my-4"><table class="w-full border-collapse border ${state.theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}">`;
        
        // Header row
        const headerCells = lines[0].split('|').filter(cell => cell.trim());
        tableHtml += '<thead class="' + (state.theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100') + '">';
        tableHtml += '<tr>';
        headerCells.forEach(cell => {
            tableHtml += `<th class="border ${state.theme === 'dark' ? 'border-slate-600' : 'border-slate-300'} px-4 py-2 font-bold text-left">${cell.trim()}</th>`;
        });
        tableHtml += '</tr></thead>';
        
        // Body rows
        tableHtml += '<tbody>';
        for (let i = 2; i < lines.length; i++) {
            const row = lines[i].trim();
            if (!row) continue;
            const cells = row.split('|').filter(cell => cell.trim());
            tableHtml += '<tr>';
            cells.forEach(cell => {
                tableHtml += `<td class="border ${state.theme === 'dark' ? 'border-slate-600' : 'border-slate-300'} px-4 py-2">${cell.trim()}</td>`;
            });
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table></div>';
        return tableHtml;
    });
    
    // Xử lý code blocks
    html = html.replace(/__CODEBLOCK_(\d+)__/g, (match, index) => {
        const content = codeBlocks[index];
        const styles = getStyles();
        const cleanContent = content.trim();
        
        // Kiểm tra nếu là Mermaid diagram
        if (cleanContent.startsWith('mermaid\n') || cleanContent.startsWith('graph') || 
            cleanContent.startsWith('sequenceDiagram') || cleanContent.startsWith('classDiagram') ||
            cleanContent.startsWith('stateDiagram') || cleanContent.startsWith('erDiagram')) {
            
            const mermaidContent = cleanContent.replace(/^mermaid\n/, '');
            const mermaidId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            
            return `<div class="my-4 p-4 rounded-xl ${state.theme === 'dark' ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-50 border border-slate-300'} overflow-x-auto">
                        <div class="mermaid" id="${mermaidId}">${escapeHtml(mermaidContent)}</div>
                    </div>`;
        }
        
        // Nếu là code block thường
        const displayContent = escapeHtml(cleanContent);
        return `<div class="${styles.codeBlock} rounded-xl overflow-hidden my-4 shadow-sm w-full group transition-colors duration-300">
                    <div class="flex justify-between items-center px-4 py-2 border-b ${styles.border} ${state.theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}">
                        <span class="text-xs font-mono opacity-70 flex items-center gap-2"><i data-lucide="terminal" size="12"></i> Code</span>
                        <button onclick="copyToClipboard(\`${cleanContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" class="opacity-60 hover:opacity-100 transition-colors p-1.5 rounded-md ${state.theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-200'}">
                            <i data-lucide="copy" size="14"></i>
                        </button>
                    </div>
                    <div class="p-4 overflow-x-auto custom-scrollbar"><code class="font-mono text-sm whitespace-pre ${state.theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}">${displayContent}</code></div>
                </div>`;
    });
    
    return `<div class="markdown-body leading-7 text-sm space-y-3 w-full whitespace-pre-wrap ${state.theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}">${html}</div>`;
}

// ==========================================
// 3. LOGIC FUNCTIONS
// ==========================================

// --- Prompt Handling (Switch to dedicated chat view) ---
function switchToChatMode(promptId) {
    const prompt = state.prompts.find(p => p.id === promptId);
    if (!prompt) {
        showToast("Không tìm thấy dữ liệu prompt!");
        return;
    }
    state.activePrompt = prompt;
    state.chatHistory = [];
    state.currentView = 'chat';
    renderApp();
}

function openQuickTestModal(promptId) {
    const prompt = state.prompts.find(p => p.id === promptId);
    if (!prompt) {
        showToast("Không tìm thấy dữ liệu prompt!");
        return;
    }
    state.activePrompt = prompt;
    openModal('test');
}

// --- Auth ---
function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
        state.currentUser = user;
        localStorage.setItem('pm_currentUser', JSON.stringify(user));
        closeModal();
        renderApp();
        showToast(`Chào mừng trở lại, ${user.name}!`);
    } else {
        showToast("Email hoặc mật khẩu không đúng!");
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (state.users.some(u => u.email === email)) {
        showToast("Email này đã được sử dụng!");
        return;
    }

    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        favorites: [],
        customPrompts: [],
        createdAt: new Date().toISOString(),
        apiKey: '',
        avatarColor: 'bg-gradient-to-br from-indigo-600 to-purple-600',
        avatarText: name.charAt(0).toUpperCase(),
        avatarImage: '',
        friends: [],
        sharedPrompts: []
    };

    state.users.push(newUser);
    localStorage.setItem('pm_users', JSON.stringify(state.users));
    state.currentUser = newUser;
    localStorage.setItem('pm_currentUser', JSON.stringify(newUser));
    
    closeModal();
    renderApp();
    showToast("Đăng ký thành công!");
}

function handleLogout() {
    state.currentUser = null;
    localStorage.removeItem('pm_currentUser');
    state.activeCategory = "Tất cả";
    renderApp();
    showToast("Đã đăng xuất.");
}

window.toggleAuthMode = function() {
    window.isRegisterMode = !window.isRegisterMode;
    const title = document.getElementById('auth-title');
    const btn = document.getElementById('auth-btn');
    const form = document.getElementById('auth-form');
    const nameField = document.getElementById('name-field');
    const switchText = document.getElementById('auth-switch-text');
    const switchBtn = document.getElementById('auth-switch-btn');

    if (window.isRegisterMode) {
        title.innerText = "Đăng ký tài khoản";
        btn.innerText = "Tạo tài khoản mới";
        form.onsubmit = handleRegister;
        nameField.classList.remove('hidden');
        nameField.querySelector('input').setAttribute('required', 'true');
        switchText.innerText = "Đã có tài khoản?";
        switchBtn.innerText = "Đăng nhập";
    } else {
        title.innerText = "Đăng nhập";
        btn.innerText = "Đăng nhập ngay";
        form.onsubmit = handleLogin;
        nameField.classList.add('hidden');
        nameField.querySelector('input').removeAttribute('required');
        switchText.innerText = "Chưa có tài khoản?";
        switchBtn.innerText = "Đăng ký";
    }
};

// --- Favorites ---
function toggleFavorite(e, promptId) {
    e.stopPropagation();
    if (!state.currentUser) {
        openModal('login');
        showToast("Vui lòng đăng nhập để lưu yêu thích!");
        return;
    }

    const userIndex = state.users.findIndex(u => u.id === state.currentUser.id);
    if (userIndex === -1) return;

    const user = state.users[userIndex];
    if (user.favorites.includes(promptId)) {
        user.favorites = user.favorites.filter(id => id !== promptId);
        showToast("Đã xóa khỏi yêu thích.");
    } else {
        user.favorites.push(promptId);
        showToast("Đã thêm vào yêu thích!");
    }

    state.users[userIndex] = user;
    state.currentUser = user;
    localStorage.setItem('pm_users', JSON.stringify(state.users));
    localStorage.setItem('pm_currentUser', JSON.stringify(state.currentUser));
    renderApp();
}

function getAvatarColor(name) {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// --- Data Management ---
function exportData() {
    const dataToExport = {
        users: state.users,
        prompts: state.prompts,
        theme: state.theme,
        timestamp: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "prompt_master_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast("Đã tải xuống file sao lưu!");
}

// Delete prompt from library and user data
function deletePrompt(promptId) {
    if (!promptId) return;
    if (!confirm('Xóa prompt này? Hành động này không thể hoàn tác.')) return;

    // Remove from main list
    state.prompts = state.prompts.filter(p => p.id !== promptId);
    localStorage.setItem('pm_data', JSON.stringify(state.prompts));

    // Remove from users: favorites & customPrompts
    let usersChanged = false;
    state.users = state.users.map(u => {
        const next = { ...u };
        const favLen = next.favorites?.length || 0;
        next.favorites = (next.favorites || []).filter(id => id !== promptId);
        const custLen = next.customPrompts?.length || 0;
        next.customPrompts = (next.customPrompts || []).filter(p => p.id !== promptId);
        if (favLen !== next.favorites.length || custLen !== next.customPrompts.length) usersChanged = true;
        return next;
    });
    if (usersChanged) localStorage.setItem('pm_users', JSON.stringify(state.users));

    // Sync current user cache
    if (state.currentUser) {
        const refreshed = state.users.find(u => u.id === state.currentUser.id);
        if (refreshed) {
            state.currentUser = refreshed;
            localStorage.setItem('pm_currentUser', JSON.stringify(state.currentUser));
        }
    }

    // Reset active prompt if removed
    if (state.activePrompt?.id === promptId) {
        state.activePrompt = null;
        state.currentView = 'library';
    }

    renderApp();
    showToast('Đã xóa prompt thành công');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.users) localStorage.setItem('pm_users', JSON.stringify(importedData.users));
            if (importedData.prompts) localStorage.setItem('pm_data', JSON.stringify(importedData.prompts));
            if (importedData.theme) localStorage.setItem('pm_theme', importedData.theme);
            
            showToast("Khôi phục dữ liệu thành công! Đang tải lại...");
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            console.error("Import error:", error);
            showToast("File không hợp lệ!");
        }
    };
    reader.readAsText(file);
}

// --- Voice & Scan ---
function toggleVoiceInput(targetId, btnId) {
    if (!('webkitSpeechRecognition' in window)) {
        showToast("Trình duyệt không hỗ trợ nhận diện giọng nói!");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    const btn = document.getElementById(btnId);

    recognition.onstart = function() {
        btn.classList.add('text-red-500', 'animate-pulse');
        showToast("Đang nghe...");
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const inputField = document.getElementById(targetId);
        inputField.value = transcript;
        if(targetId === 'preview-prompt') updatePreview(); 
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
    };

    recognition.onerror = function(event) {
        showToast("Lỗi nhận diện: " + event.error);
        btn.classList.remove('text-red-500', 'animate-pulse');
    };

    recognition.onend = function() {
        btn.classList.remove('text-red-500', 'animate-pulse');
    };

    recognition.start();
}

let currentFileBase64 = null;
let currentFileType = null;

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('image-preview');
            const container = document.getElementById('preview-container');
            const placeholder = document.getElementById('upload-placeholder');
            const scanBtn = document.getElementById('scan-btn');
            
            preview.src = e.target.result;
            container.classList.remove('hidden');
            placeholder.classList.add('hidden');
            scanBtn.disabled = false;

            currentFileBase64 = e.target.result.split(',')[1];
            currentFileType = file.type;
        }
        reader.readAsDataURL(file);
    }
}

async function handleImageScan() {
    if (!currentFileBase64) {
        showToast("Vui lòng chọn ảnh trước!");
        return;
    }
    const loading = document.getElementById('scan-loading');
    const resultArea = document.getElementById('scan-result');
    loading.classList.remove('hidden');
    if(loading.querySelector('span')) loading.querySelector('span').innerText = "Đang phân tích ảnh...";

    try {
        // Call internal serverless function for image scanning
        const url = '/api/image-scan';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64: currentFileBase64,
                mimeType: currentFileType,
                action: 'scan'
            })
        });

        const data = await response.json();
        if(data.error) throw new Error(data.error.message || data.error);
        
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không tìm thấy văn bản nào.";
        resultArea.value = text;
        state.scanResult = text;
        showToast("✓ Trích xuất thành công!");
    } catch (error) {
        console.error('handleImageScan Error:', error);
        showToast("✗ Lỗi: " + error.message);
        resultArea.value = "Đã xảy ra lỗi. Vui lòng kiểm tra lại API Key hoặc mạng.";
    } finally {
        loading.classList.add('hidden');
    }
}

async function refineScannedText() {
    const currentText = document.getElementById('scan-result').value;
    if (!currentText || currentText.includes("Đang phân tích") || currentText.includes("lỗi")) {
        showToast("Chưa có nội dung để tinh chỉnh!");
        return;
    }

    const loading = document.getElementById('scan-loading');
    const resultArea = document.getElementById('scan-result');
    if(loading.querySelector('span')) loading.querySelector('span').innerText = "Đang tối ưu hóa prompt...";
    loading.classList.remove('hidden');

    try {
        // Call internal serverless function for text refinement
        const url = '/api/image-scan';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'refine',
                currentText: currentText,
                imageBase64: '',
                mimeType: ''
            })
        });

        const data = await response.json();
        if(data.error) throw new Error(data.error.message || data.error);

        const refinedText = data.candidates?.[0]?.content?.parts?.[0]?.text || currentText;
        resultArea.value = refinedText;
        state.scanResult = refinedText;
        showToast("Đã tinh chỉnh thành công!");
    } catch (error) {
        console.error(error);
        showToast("Lỗi: " + error.message);
    } finally {
        loading.classList.add('hidden');
    }
}

function transferScanToadd() {
    if (!state.scanResult) {
        showToast("Chưa có nội dung để thêm!");
        return;
    }
    openModal('add', { content: state.scanResult });
}

function suggestPromptsFromScan() {
    const scannedText = document.getElementById('scan-result').value.trim();
    if (!scannedText) {
        showToast("Vui lòng trích xuất văn bản từ ảnh trước!");
        return;
    }
    
    // Tìm từ khóa từ text đã trích xuất
    const keywords = scannedText.toLowerCase().split(/[\s,;.!?]+/);
    
    // Tìm prompts phù hợp dựa trên tags
    const suggestedPrompts = state.prompts.filter(prompt => {
        return prompt.tags.some(tag => {
            const tagLower = tag.toLowerCase();
            return keywords.some(keyword => 
                keyword.length > 2 && (
                    tagLower.includes(keyword) || 
                    keyword.includes(tagLower.substring(0, 3))
                )
            );
        });
    }).slice(0, 6); // Giới hạn 6 gợi ý
    
    if (suggestedPrompts.length === 0) {
        showToast("Không tìm thấy prompt phù hợp. Hãy tạo prompt mới!");
        return;
    }
    
    // Tạo modal hiển thị gợi ý
    const styles = getStyles();
    const suggestionsHTML = suggestedPrompts.map(p => `
        <div class="p-4 rounded-xl border ${styles.border} hover:bg-white/5 cursor-pointer transition-all" onclick="selectSuggestedPrompt(${p.id}, '${scannedText.replace(/"/g, '\\"')}')">
            <h4 class="font-bold ${styles.textPrimary} mb-1">${p.title}</h4>
            <p class="text-sm ${styles.textSecondary} mb-2">${p.description}</p>
            <div class="flex flex-wrap gap-2">
                ${p.tags.map(tag => `<span class="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
    
    // Chèn gợi ý vào bên dưới kết quả
    const scanResultArea = document.getElementById('scan-result').parentElement;
    let suggestionsContainer = document.getElementById('scan-suggestions');
    
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'scan-suggestions';
        suggestionsContainer.className = 'mt-4 p-4 rounded-xl bg-white/5 border border-dashed ' + styles.border;
        scanResultArea.parentElement.appendChild(suggestionsContainer);
    }
    
    suggestionsContainer.innerHTML = `
        <h3 class="font-bold ${styles.textPrimary} mb-3 flex items-center gap-2">
            <i data-lucide="lightbulb" size="18"></i> Prompt gợi ý cho đề bài này:
        </h3>
        <div class="space-y-2 max-h-60 overflow-y-auto">
            ${suggestionsHTML}
        </div>
    `;
    
    lucide.createIcons();
    showToast("Đã tìm thấy " + suggestedPrompts.length + " prompt phù hợp!");
}

function selectSuggestedPrompt(promptId, scannedText) {
    const prompt = state.prompts.find(p => p.id === promptId);
    if (prompt && scannedText) {
        state.activePrompt = prompt;
        closeModal();
        
        // Tự động gửi request với text đã trích xuất
        const previewPrompt = document.getElementById('preview-prompt');
        if (previewPrompt) {
            previewPrompt.value = scannedText;
            // Tự động gọi runPrompt
            setTimeout(() => {
                runPrompt();
            }, 100);
        }
        showToast(`Đã chọn: ${prompt.title}`);
        renderApp();
    }
}

async function generateSmartPrompt() {
    const idea = document.getElementById('smart-idea-input').value;
    if (!idea) {
        showToast("Vui lòng nhập ý tưởng trước!");
        return;
    }

    const btn = document.getElementById('smart-gen-btn');
    const loading = document.getElementById('smart-loading');
    
    btn.disabled = true;
    btn.classList.add('opacity-50');
    loading.classList.remove('hidden');

    try {
        // Call internal serverless function for smart prompt generation
        const url = '/api/smart-generate';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idea: idea
            })
        });

        const data = await response.json();
        if(data.error) throw new Error(data.error.message || data.error);

        let jsonText = data.candidates[0].content.parts[0].text;
        
        // Loại bỏ markdown code blocks (```json ... ```)
        jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        
        const result = JSON.parse(jsonText);

        // Kiểm tra các trường bắt buộc
        if (!result.title || !result.description || !result.content) {
            throw new Error("JSON thiếu các trường bắt buộc (title, description, content)");
        }

        document.querySelector('input[name="title"]').value = result.title || '';
        document.querySelector('input[name="description"]').value = result.description || '';
        document.querySelector('textarea[name="content"]').value = result.content || '';
        
        const catSelect = document.querySelector('select[name="category"]');
        if (result.category && CATEGORIES.includes(result.category)) {
            catSelect.value = result.category;
        }
        showToast("✓ Đã tạo prompt thành công!");
    } catch (error) {
        console.error('generateSmartPrompt Error:', error);
        showToast("❌ Lỗi: " + error.message);
    } finally {
        btn.disabled = false;
        btn.classList.remove('opacity-50');
        loading.classList.add('hidden');
    }
}

function handleAddSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newPrompt = {
        id: Date.now(),
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        content: formData.get('content'),
        tags: ["New", "User"]
    };
    
    if (state.currentUser) {
        state.currentUser.customPrompts.push(newPrompt);
        const userIndex = state.users.findIndex(u => u.id === state.currentUser.id);
        if (userIndex !== -1) {
            state.users[userIndex] = state.currentUser;
            localStorage.setItem('pm_users', JSON.stringify(state.users));
        }
        localStorage.setItem('pm_currentUser', JSON.stringify(state.currentUser));
    }

    state.prompts.unshift(newPrompt);
    localStorage.setItem('pm_data', JSON.stringify(state.prompts));
    
    closeModal();
    renderApp();
    showToast("Đã thêm prompt mới!");
}

function downloadChatImage() {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;
    showToast("Đang tạo ảnh...");
    
    html2canvas(chatContainer, {
        backgroundColor: state.theme === 'dark' ? '#0b0d14' : '#f8fafc',
        scale: 2 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `chat_export_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        showToast("Đã tải ảnh chat!");
    }).catch(err => {
        console.error(err);
        showToast("Lỗi khi tạo ảnh!");
    });
}

function copyCurrentPrompt() {
    const text = document.getElementById('preview-prompt').value;
    copyToClipboard(text);
}

function copyAndOpen(url) {
    const text = document.getElementById('preview-prompt').value;
    copyToClipboard(text);
    setTimeout(() => window.open(url, '_blank'), 500);
}

function clearChat() {
    state.chatHistory = [];
    document.getElementById('chat-container').innerHTML = `
        <div class="h-full flex flex-col items-center justify-center ${getStyles().textSecondary} gap-4 opacity-50">
            <i data-lucide="bot" size="64" stroke-width="1"></i><p>Sẵn sàng trò chuyện</p>
        </div>
    `;
}

function updatePreview() {
    const inputs = document.querySelectorAll('.variable-input');
    let content = state.activePrompt?.content || '';
    inputs.forEach(input => {
        const key = input.getAttribute('data-key');
        const val = input.value;
        if (!key) return;
        const safeKey = escapeRegExp(key);
        // If input empty, keep placeholder so user sees required variables
        // Use function replacer so special chars ($, \) show literally
        const replacement = val || key;
        content = content.replace(new RegExp(safeKey, 'g'), () => replacement);
    });
    document.getElementById('preview-prompt').value = content;
}

function toggleResponseMode(mode) {
    state.responseMode = mode;
    // Cập nhật UI nút chọn
    document.querySelectorAll('[data-response-mode]').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-500/30');
        btn.classList.add('bg-white/5', 'text-slate-400');
    });
    document.querySelector(`[data-response-mode="${mode}"]`).classList.add('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-500/30');
    document.querySelector(`[data-response-mode="${mode}"]`).classList.remove('bg-white/5', 'text-slate-400');
}

// ==========================================
// TYPEWRITER EFFECT FOR AI MESSAGES
// ==========================================

/**
 * Hàm helper tạo hiệu ứng gõ máy chữ cho tin nhắn AI
 * Hiển thị từ từ smooth, bảo tồn tất cả ký tự đặc biệt
 * @param {HTMLElement} element - Element chứa nội dung
 * @param {string} htmlContent - Nội dung HTML đã được xử lý từ simpleMarkdown
 * @param {number} speed - Tốc độ gõ (ms per character), mặc định 20ms
 */
function typeWriter(element, htmlContent, speed = 100) {
    return new Promise((resolve) => {
        // Parse HTML để lấy danh sách text nodes
        const wrapper = document.createElement('div');
        wrapper.innerHTML = htmlContent;
        
        // Lấy toàn bộ text để đếm ký tự
        const fullText = wrapper.innerText;
        let charIndex = 0;
        
        // Build HTML string progressively
        let builtHTML = '';
        let charCount = 0; // Đếm ký tự đã thêm vào builtHTML
        
        // Parse HTML thành mảng các token
        const tokens = [];
        let i = 0;
        while (i < htmlContent.length) {
            if (htmlContent[i] === '<') {
                // Tag HTML
                const tagEnd = htmlContent.indexOf('>', i);
                if (tagEnd !== -1) {
                    tokens.push({
                        type: 'tag',
                        content: htmlContent.substring(i, tagEnd + 1)
                    });
                    i = tagEnd + 1;
                } else {
                    i++;
                }
            } else {
                // Text node - lấy từng ký tự
                tokens.push({
                    type: 'char',
                    content: htmlContent[i]
                });
                i++;
            }
        }
        
        let tokenIndex = 0;
        
        function typeNextChar() {
            if (charCount >= fullText.length) {
                // Hoàn tất
                element.innerHTML = htmlContent;
                
                // Highlight code blocks
                const codeElements = element.querySelectorAll('pre code');
                codeElements.forEach((block) => {
                    if (window.hljs && block.textContent.trim()) {
                        try {
                            hljs.highlightElement(block);
                        } catch (e) {}
                    }
                });
                
                lucide.createIcons();
                resolve();
                return;
            }
            
            // Thêm token tiếp theo
            if (tokenIndex < tokens.length) {
                const token = tokens[tokenIndex];
                
                if (token.type === 'tag') {
                    // Tag HTML - thêm luôn
                    builtHTML += token.content;
                    tokenIndex++;
                    setTimeout(typeNextChar, 0); // Không delay cho tag
                } else {
                    // Character
                    if (charCount < fullText.length) {
                        builtHTML += token.content;
                        charCount++;
                        tokenIndex++;
                        
                        // Render HTML
                        element.innerHTML = builtHTML;
                        
                        // Highlight code blocks
                        const codeElements = element.querySelectorAll('pre code');
                        codeElements.forEach((block) => {
                            if (window.hljs && block.textContent.trim()) {
                                try {
                                    hljs.highlightElement(block);
                                } catch (e) {}
                            }
                        });
                        
                        setTimeout(typeNextChar, speed);
                    }
                }
            }
        }
        
        typeNextChar();
    });
}

// API Call Logic (Updated with better Error Handling & User Key)
async function runPrompt() {
    const promptText = document.getElementById('preview-prompt').value;
    const temperature = parseFloat(document.getElementById('temp-slider').value);
    
    if(!promptText) return;
    const chatContainer = document.getElementById('chat-container');
    const styles = getStyles();

    if(state.chatHistory.length === 0) chatContainer.innerHTML = '';

    state.chatHistory.push({ role: 'user', content: promptText });
    const userMsgHTML = `
        <div class="flex gap-4 justify-end">
            <div class="max-w-[85%] rounded-2xl p-5 shadow-md bg-indigo-600 text-white rounded-tr-sm">
                <p class="whitespace-pre-wrap text-sm leading-relaxed">${escapeHtml(promptText)}</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center mt-1"><i data-lucide="user" class="text-white" size="16"></i></div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', userMsgHTML);
    lucide.createIcons();
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const loadingId = 'loading-' + Date.now();
    const loadingHTML = `
        <div id="${loadingId}" class="flex gap-4 justify-start">
            <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mt-1 shadow-lg shadow-indigo-600/30"><i data-lucide="loader-2" class="animate-spin text-white" size="16"></i></div>
            <div class="${styles.cardBg} rounded-2xl p-4 border ${styles.border}">
                <div class="flex gap-1"><span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span><span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span><span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span></div>
            </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', loadingHTML);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        // Call internal serverless function endpoint
        const url = '/api/gemini';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: promptText,
                temperature: temperature
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || data.error || "API Error");
        }

        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ AI.";
        
        document.getElementById(loadingId).remove();
        state.chatHistory.push({ role: 'ai', content: responseText });
        
        // Tạo bong bóng chat của AI trước (rỗng)
        const aiMsgHTML = `
            <div class="flex gap-4 justify-start">
                <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mt-1 shadow-lg shadow-indigo-600/30 flex-shrink-0"><i data-lucide="bot" class="text-white" size="16"></i></div>
                <div class="ai-message-content max-w-[85%] rounded-2xl p-5 shadow-md ${styles.cardBg} border ${styles.border} ${styles.textPrimary} rounded-tl-sm min-h-[2rem]">
                    <!-- Content will be filled by typeWriter -->
                </div>
            </div>
        `;
        chatContainer.insertAdjacentHTML('beforeend', aiMsgHTML);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Lấy element content vừa tạo
        const aiContentElement = chatContainer.querySelector('.ai-message-content:last-of-type');
        
        // Xử lý nội dung (highlight code, format markdown, etc)
        const htmlContent = simpleMarkdown(responseText);
        
        // Chọn kiểu hiển thị dựa trên responseMode
        if (state.responseMode === 'fast') {
            // Kiểu Nhanh: Hiển thị toàn bộ ngay lập tức
            aiContentElement.innerHTML = htmlContent;
            
            // Highlight code blocks
            const codeElements = aiContentElement.querySelectorAll('pre code');
            codeElements.forEach((block) => {
                if (window.hljs && block.textContent.trim()) {
                    try {
                        hljs.highlightElement(block);
                    } catch (e) {}
                }
            });
        } else {
            // Kiểu Chi tiết: Typewriter effect
            await typeWriter(aiContentElement, htmlContent, 20);
        }
        
        // Render công thức LaTeX/KaTeX
        if (window.renderMathInElement) {
            renderMathInElement(aiContentElement, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},      // Math hiển thị độc lập ($$...$$)
                    {left: '$', right: '$', display: false},       // Math hiển thị nội tuyến ($...$)
                    {left: '\\(', right: '\\)', display: false},   // Math nội tuyến (\(...\))
                    {left: '\\[', right: '\\]', display: true}     // Math độc lập (\[...\])
                ],
                throwOnError: false
            });
        }
        
        // Render Mermaid diagrams
        if (window.mermaid) {
            try {
                await mermaid.contentLoaded();
            } catch (e) {
                console.error('Mermaid rendering error:', e);
            }
        }
        
        // Tạo icons Lucide
        lucide.createIcons();
        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (error) {
        document.getElementById(loadingId).remove();
        const errorHTML = `
            <div class="flex gap-4 justify-start">
                <div class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center mt-1"><i data-lucide="alert-triangle" class="text-white" size="16"></i></div>
                <div class="max-w-[85%] rounded-2xl p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                    <strong>Lỗi kết nối:</strong> ${error.message}
                    <br/><br/>Gợi ý: Kiểm tra lại kết nối mạng hoặc API Key.
                </div>
            </div>
        `;
        chatContainer.insertAdjacentHTML('beforeend', errorHTML);
        lucide.createIcons();
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// ==========================================
// 4. RENDER FUNCTIONS
// ==========================================

function renderApp() {
    const root = document.getElementById('root');
    const styles = getStyles();
    let contentHTML = `${renderHeader()}`;

    if (state.currentView === 'chat') {
        contentHTML += renderChatView();
    } else if (state.currentView === 'showcase') {
        contentHTML += renderShowcase();
    } else {
        contentHTML += renderLibrary();
    }

    // Restore bottom navigation for mobile
    contentHTML += renderBottomNav();

    root.innerHTML = contentHTML;
    root.className = `relative z-10 transition-colors duration-500 ${styles.textPrimary}`; 
    lucide.createIcons();
    document.getElementById('search-input')?.addEventListener('input', (e) => {
        state.searchTerm = e.target.value;
        renderApp();
        document.getElementById('search-input').focus(); 
    });
}

function renderHeader() {
    const styles = getStyles();
    let userSectionHTML = '';

    if (state.currentUser) {
        const initial = state.currentUser.name.charAt(0).toUpperCase();
        const avatarColor = state.currentUser.avatarColor || getAvatarColor(state.currentUser.name);
        const avatarText = state.currentUser.avatarText || initial;

        userSectionHTML = `
            <div class="flex items-center gap-3 relative group/profile cursor-pointer">
                <div class="text-right hidden sm:block" onclick="openModal('login')">
                    <p class="text-xs ${styles.textSecondary}">Xin chào,</p>
                    <p class="text-sm font-bold ${styles.textPrimary} hover:text-indigo-400 transition-colors">${state.currentUser.name}</p>
                </div>
                <div class="w-10 h-10 ${state.currentUser.avatarImage ? 'bg-cover bg-center' : avatarColor} rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/20 hover:ring-indigo-400/50 transition-all overflow-hidden" style="${state.currentUser.avatarImage ? `background-image: url(${state.currentUser.avatarImage})` : ''}" onclick="openModal('login')">
                    ${!state.currentUser.avatarImage ? avatarText : ''}
                </div>
                
                <div class="absolute top-full right-0 mt-2 w-48 ${styles.cardBg} border ${styles.border} rounded-xl shadow-xl overflow-hidden hidden group-hover/profile:block animate-fadeIn">
                    <div class="py-2">
                        <button onclick="setCategory('Cá nhân')" class="w-full text-left px-4 py-2 text-sm ${styles.textPrimary} hover:bg-white/5 flex items-center gap-2">
                            <i data-lucide="heart" size="16" class="text-red-500"></i> Yêu thích
                        </button>
                        <button onclick="exportData()" class="w-full text-left px-4 py-2 text-sm ${styles.textPrimary} hover:bg-white/5 flex items-center gap-2">
                            <i data-lucide="download" size="16" class="text-blue-500"></i> Sao lưu dữ liệu
                        </button>
                        <label for="import-file" class="w-full text-left px-4 py-2 text-sm ${styles.textPrimary} hover:bg-white/5 flex items-center gap-2 cursor-pointer">
                            <i data-lucide="upload" size="16" class="text-emerald-500"></i> Khôi phục dữ liệu
                        </label>
                        <input type="file" id="import-file" accept=".json" class="hidden" onchange="importData(event)">
                        <button onclick="handleLogout()" class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t ${styles.border}">
                            <i data-lucide="log-out" size="16"></i> Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        userSectionHTML = `
            <button onclick="openModal('login')" class="px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 border ${styles.border} ${state.theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}">
                Đăng nhập
            </button>
        `;
    }

    const quickAction = (icon, label, action, isPrimary = false) => {
        const baseClasses = 'btn-core flex items-center gap-2 px-5 py-2.5 text-sm';
        let styleClasses = '';
        
        // Phân biệt hiệu ứng riêng cho từng nút
        if (label === 'Thư viện') {
            styleClasses = `btn-nav-library ${styles.textPrimary}`;
        } else if (label === 'Showcase') {
            styleClasses = `btn-nav-showcase ${styles.textPrimary}`;
        } else if (isPrimary) {
            styleClasses = 'btn-primary text-white shadow-lg';
        } else {
            styleClasses = `btn-glass ${styles.textPrimary}`;
        }
        
        return `
            <button onclick="${action}" class="${baseClasses} ${styleClasses}">
                <i data-lucide="${icon}" size="16"></i>
                <span>${label}</span>
            </button>
        `;
    };

    return `
        <header class="relative z-40 w-full">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center gap-4">
                <div class="flex items-center gap-3 cursor-pointer group" onclick="switchView('library')">
                    <div class="w-10 h-10 bg-gradient-to-br ${getColorClass('gradient-main')} rounded-xl flex items-center justify-center shadow-lg ${getColorClass('shadow')} group-hover:scale-110 transition-transform">
                        <i data-lucide="terminal" class="text-white" size="22"></i>
                    </div>
                    <span class="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${state.theme === 'dark' ? 'from-white via-slate-200 to-white' : 'from-slate-900 via-slate-700 to-slate-900'} hidden sm:inline">
                        PromptMaster<span class="${getColorClass('text-soft')}">.vn</span>
                    </span>
                </div>

                <div class="flex-1 hidden md:flex items-center justify-center gap-3">
                    ${quickAction('home', 'Thư viện', "switchView('library')", false)}
                    ${quickAction('globe-2', 'Showcase', "switchView('showcase')", false)}
                    ${quickAction('plus-circle', 'Thêm prompt', "openModal('add')", true)}
                    ${quickAction('scan', 'Quét ảnh', "openModal('scan')", true)}
                </div>

                <div class="flex items-center gap-3 ml-auto">
                    ${userSectionHTML}
                </div>
            </div>
        </header>
    `;
}

function renderBottomNav() {
    const styles = getStyles();
    const isDark = state.theme === 'dark';
    const activeKey = state.currentModal === 'add' ? 'add' : (state.currentModal === 'login' ? 'profile' : state.currentView);
    const baseClass = `${isDark ? 'bg-slate-900/90 border-slate-700 text-slate-200' : 'bg-white/90 border-slate-200 text-slate-700'}`;

    const item = (key, icon, label, action) => {
        const isActive = activeKey === key;
        const activeStyles = isActive ? (isDark ? 'text-indigo-300' : 'text-indigo-600') : styles.textSecondary;
        const weight = isActive ? 'font-bold' : 'font-medium';
        const badge = isActive ? (isDark ? 'bg-indigo-500/15' : 'bg-indigo-50') : (isDark ? 'bg-white/5' : 'bg-slate-100');
        return `
            <button onclick="${action}" class="flex flex-col items-center gap-1 flex-1 ${activeStyles} ${weight}">
                <span class="p-2 rounded-full ${badge} border ${styles.border} shadow-sm">
                    <i data-lucide="${icon}" size="18"></i>
                </span>
                <span class="text-[11px] leading-none">${label}</span>
            </button>
        `;
    };

    return `
        <nav class="fixed bottom-0 left-0 w-full ${baseClass} backdrop-blur-md border-t md:hidden z-50 flex justify-around py-3 px-2 gap-1">
            ${item('library', 'home', 'Trang chủ', "switchView('library')")}
            ${item('showcase', 'globe-2', 'Thế giới AI', "switchView('showcase')")}
            ${item('add', 'plus-circle', 'Thêm mới', "openModal('add')")}
            ${item('profile', 'user', 'Tài khoản', "openModal('login')")}
        </nav>
    `;
}

function renderLibrary() {
    const styles = getStyles();
    
    const filteredPrompts = state.prompts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(state.searchTerm.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(state.searchTerm.toLowerCase()));
        
        let matchesCategory = false;
        if (state.activeCategory === "Tất cả") {
            matchesCategory = true;
        } else if (state.activeCategory === "Cá nhân") {
            if (!state.currentUser) return false;
            const isFavorite = state.currentUser.favorites.includes(p.id);
            matchesCategory = isFavorite;
        } else {
            matchesCategory = p.category === state.activeCategory;
        }
        
        const matchesSubject = state.activeCategory === "Giáo dục" && state.activeSubject 
            ? p.tags.some(t => t === state.activeSubject) 
            : true;

        return matchesSearch && matchesCategory && matchesSubject;
    });

    return `
        ${renderHero()}
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 animate-slideUp relative z-10">
            <div class="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x mb-2">
                ${CATEGORIES.map(cat => {
                    if (cat === "Cá nhân" && !state.currentUser) return '';
                    return `
                        <button onclick="setCategory('${cat}')" class="whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 snap-center ${state.activeCategory === cat ? 'btn-core btn-primary text-white shadow-lg transform scale-105' : `btn-core btn-glass ${styles.textSecondary} hover:${styles.textPrimary} hover:scale-105`}">
                            ${cat === "Cá nhân" ? '<i data-lucide="heart" size="14" class="inline mb-0.5 mr-1 text-red-400" fill="currentColor"></i>' : ''} ${cat}
                        </button>
                    `
                }).join('')}
            </div>

            ${state.activeCategory === "Giáo dục" ? `
                <div class="flex gap-2 overflow-x-auto pb-6 scrollbar-hide snap-x mb-2 animate-fadeIn">
                     <button onclick="setSubject(null)" class="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 snap-center border ${styles.border} ${!state.activeSubject ? 'bg-emerald-500 text-white shadow-md' : `${styles.glass} ${styles.textSecondary} hover:bg-emerald-500/10`}">
                        Tất cả
                    </button>
                    ${SUBJECT_LIST.map(sub => `
                        <button onclick="setSubject('${sub}')" class="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 snap-center border ${styles.border} ${state.activeSubject === sub ? 'bg-emerald-500 text-white shadow-md transform scale-105' : `${styles.glass} ${styles.textSecondary} hover:bg-emerald-500/10`}">
                            ${sub}
                        </button>
                    `).join('')}
                </div>
            ` : '<div class="mb-8"></div>'}

            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold ${styles.textPrimary} flex items-center gap-3">
                    <i data-lucide="zap" class="text-indigo-500"></i>
                    ${state.activeCategory === "Tất cả" ? "Khám phá Prompt" : (state.activeSubject ? `${state.activeCategory} > ${state.activeSubject}` : state.activeCategory)}
                </h2>
                <span class="${styles.textSecondary} font-mono text-xs ${styles.glass} px-3 py-1 rounded-full border ${styles.border}">${filteredPrompts.length} kết quả</span>
            </div>

            ${state.isLoadingPrompts
                ? renderSkeletonLoader(6)
                : (filteredPrompts.length > 0
                    ? `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${filteredPrompts.map(p => renderPromptCard(p)).join('')}
                        </div>
                    `
                    : `
                        <div class="text-center py-32 opacity-50">
                            <i data-lucide="${state.activeCategory === 'Cá nhân' ? 'heart-off' : 'search'}" class="w-16 h-16 mx-auto mb-4 text-slate-500"></i>
                            <h3 class="text-xl font-medium">${state.activeCategory === 'Cá nhân' ? 'Bạn chưa lưu prompt nào vào yêu thích' : 'Không tìm thấy kết quả nào'}</h3>
                        </div>
                    `
                )}
        </main>
    `;
}

function renderChatView() {
    const styles = getStyles();
    const prompt = state.activePrompt;

    if (!prompt) {
        return `
            <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fadeIn">
                <div class="${styles.cardBg} border ${styles.border} rounded-2xl p-10 text-center shadow-lg space-y-4">
                    <div class="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                        <i data-lucide="alert-circle" size="24"></i>
                    </div>
                    <h2 class="text-2xl font-bold ${styles.textPrimary}">Chưa chọn Prompt để chạy thử</h2>
                    <p class="${styles.textSecondary}">Quay lại thư viện và chọn một Prompt để mở chế độ chat.</p>
                    <div class="pt-2">
                        <button onclick="switchView('library')" class="btn-core btn-primary px-6 py-3 text-white shadow-lg">Quay lại thư viện</button>
                    </div>
                </div>
            </main>
        `;
    }

    templateVariables = {};
    const matches = prompt.content.match(/\[(.*?)\]/g);
    if (matches) matches.forEach(m => templateVariables[m] = '');

    return `
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 animate-fadeIn">
            <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <p class="${styles.textSecondary} text-xs uppercase tracking-widest">Chế độ Chat thử</p>
                    <h1 class="text-2xl font-bold ${styles.textPrimary} flex items-center gap-2">
                        <i data-lucide="message-square" size="18" class="text-emerald-500"></i>
                        ${prompt.title}
                    </h1>
                </div>
                <div class="flex gap-2">
                    <button onclick="switchView('library')" class="btn-core btn-glass px-5 py-2 ${styles.textPrimary} flex items-center gap-2">
                        <i data-lucide="arrow-left" size="16"></i> Quay lại thư viện
                    </button>
                    ${state.currentUser ? `<button onclick="deletePrompt(${prompt.id})" class="btn-core btn-danger px-4 py-2 text-white flex items-center gap-2">
                        <i data-lucide="trash-2" size="16"></i> Xóa
                    </button>` : ''}
                </div>
            </div>

            <div class="grid gap-6 lg:grid-cols-[32%_1fr] items-start">
                <section class="${styles.cardBg} border ${styles.border} rounded-2xl shadow-lg flex flex-col h-full">
                    <div class="p-5 border-b ${styles.border} flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-indigo-500/20 rounded-lg text-indigo-500"><i data-lucide="sparkles" size="18"></i></div>
                            <div>
                                <p class="text-sm font-bold ${styles.textPrimary}">Cấu hình Prompt</p>
                                <p class="text-xs ${styles.textSecondary}">Điền biến số & chỉnh Temperature</p>
                            </div>
                        </div>
                        <span class="text-[11px] font-mono ${styles.textSecondary} px-2 py-1 rounded-lg border ${styles.border}">${prompt.category}</span>
                    </div>

                    <div class="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar" id="variables-container">
                        ${Object.keys(templateVariables).length > 0 ? Object.keys(templateVariables).map((key, idx) => `
                            <div>
                                <label class="text-xs font-bold ${styles.textAccent} mb-1.5 flex justify-between ml-1">
                                    ${key.replace(/[\[\]]/g, '')}
                                    <button onclick="toggleVoiceInput('var-input-${idx}', 'mic-btn-${idx}')" id="mic-btn-${idx}" class="text-xs opacity-50 hover:opacity-100 hover:text-indigo-500 transition-colors" title="Nói để nhập"><i data-lucide="mic" size="12"></i></button>
                                </label>
                                <div class="flex gap-2">
                                    <input id="var-input-${idx}" class="variable-input flex-1 ${styles.inputBg} border ${styles.border} rounded-lg px-3 py-2 text-sm ${styles.textPrimary} focus:border-indigo-500 outline-none transition-all" placeholder="..." data-key="${key}" oninput="updatePreview()">
                                </div>
                            </div>
                        `).join('') : `<div class="text-center ${styles.textSecondary} italic text-sm mt-6">Prompt này không có biến số cần điền.</div>`}

                        <div class="pt-4 border-t ${styles.border}">
                            <label class="text-xs font-bold ${styles.textSecondary} mb-2 block flex justify-between">
                                Độ sáng tạo (Temperature) <span id="temp-val">0.7</span>
                            </label>
                            <input type="range" id="temp-slider" min="0" max="1" step="0.1" value="0.7" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" oninput="document.getElementById('temp-val').innerText = this.value">
                        </div>

                        <div class="pt-2">
                            <label class="text-xs font-bold ${styles.textSecondary} mb-2 block">Preview Prompt</label>
                            <textarea id="preview-prompt" class="w-full ${styles.inputBg} border ${styles.border} rounded-lg p-3 text-xs ${styles.textSecondary} font-mono h-32 resize-none focus:border-indigo-500 outline-none" readonly>${prompt.content}</textarea>
                            <button onclick="copyCurrentPrompt()" class="mt-2 text-xs flex items-center gap-1 text-indigo-500 hover:text-indigo-400 font-bold ml-auto"><i data-lucide="copy" size="12"></i> Sao chép</button>
                        </div>

                        <div class="pt-2 border-t ${styles.border} space-y-3">
                            <div class="text-[10px] font-bold uppercase tracking-widest ${styles.textSecondary} text-center">Kiểu trả lời</div>
                            <div class="grid grid-cols-2 gap-2">
                                <button data-response-mode="fast" onclick="toggleResponseMode('fast')" class="py-2 px-3 rounded-lg border ${styles.border} bg-white/5 text-slate-400 text-xs font-bold transition-all hover:bg-white/10">
                                    <i data-lucide="zap" size="14" class="inline mr-1"></i> Nhanh
                                </button>
                                <button data-response-mode="detailed" onclick="toggleResponseMode('detailed')" class="py-2 px-3 rounded-lg border ${styles.border} bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all">
                                    <i data-lucide="type" size="14" class="inline mr-1"></i> Chi tiết
                                </button>
                            </div>
                        </div>

                        <button onclick="runPrompt()" class="btn-core btn-primary w-full px-6 py-3 text-white shadow-lg flex items-center justify-center gap-2">
                            <i data-lucide="play" size="18" fill="currentColor"></i> Gửi cho Gemini
                        </button>

                        <div class="pt-4 border-t ${styles.border} space-y-2">
                            <div class="text-[10px] font-bold uppercase tracking-widest ${styles.textSecondary} text-center">Chạy nhanh trên nền tảng khác</div>
                            <div class="grid grid-cols-4 gap-2">
                                ${AI_TOOLS.map(tool => `
                                    <button onclick="copyAndOpen('${tool.url}')" class="aspect-square rounded-xl border ${styles.border} hover:bg-white/5 flex flex-col items-center justify-center gap-1 transition-all group relative overflow-hidden" title="Copy & Mở ${tool.name}">
                                        <div class="w-6 h-6"><img src="${tool.icon}" class="w-full h-full object-contain"></div>
                                        <span class="text-[9px] font-medium opacity-60 group-hover:opacity-100 transition-opacity ${styles.textSecondary}">${tool.name}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </section>

                <section class="rounded-2xl border ${styles.border} ${styles.cardBg} h-[calc(100vh-220px)] min-h-[520px] flex flex-col relative overflow-hidden">
                    <div class="p-4 border-b ${styles.border} flex justify-between items-center ${styles.glass} sticky top-0 left-0 right-0 z-10">
                        <span class="text-sm font-bold text-emerald-500 flex items-center gap-2"><i data-lucide="bot" size="16"></i> Chat Session</span>
                        <div class="flex gap-2">
                            <button onclick="downloadChatImage()" class="text-xs ${styles.textSecondary} hover:text-indigo-500 px-3 py-1 rounded-full border ${styles.border} hover:border-indigo-500/30 transition-all flex items-center gap-1">
                                <i data-lucide="image-down" size="14"></i> Tải ảnh chat
                            </button>
                            <button onclick="clearChat()" class="text-xs ${styles.textSecondary} hover:text-red-500 px-3 py-1 rounded-full border ${styles.border} hover:border-red-500/30 transition-all">Clear</button>
                        </div>
                    </div>
                    <div id="chat-container" class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        <div class="h-full flex flex-col items-center justify-center ${styles.textSecondary} gap-4 opacity-50">
                            <i data-lucide="bot" size="64" stroke-width="1"></i><p>Sẵn sàng trò chuyện</p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    `;
}

// ==========================================
// SUBMIT PROBLEM MODAL & SUGGESTION
// ==========================================
function renderSubmitProblemModal(container) {
    const styles = getStyles();
    container.innerHTML = `
        <div class="p-6 border-b ${styles.border} bg-gradient-to-r from-indigo-900/10 to-purple-900/10">
            <h2 class="text-2xl font-bold ${styles.textPrimary} flex items-center gap-3"><i data-lucide="send" class="text-indigo-500"></i> Gửi đề bài & Nhận gợi ý Prompt</h2>
            <p class="text-sm ${styles.textSecondary} mt-2">Mô tả đề bài của bạn, chúng tôi sẽ gợi ý các prompt phù hợp hoặc tạo prompt mới để giải quyết.</p>
        </div>
        <div class="p-8 flex-1 overflow-y-auto">
            <div class="space-y-6">
                <!-- Tab buttons -->
                <div class="flex gap-2 border-b ${styles.border}">
                    <button onclick="switchProblemTab('text')" class="px-4 py-2 border-b-2 border-indigo-500 text-indigo-500 font-bold transition-all flex items-center gap-2" id="tab-text">
                        <i data-lucide="type" size="18"></i> Nhập văn bản
                    </button>
                    <button onclick="switchProblemTab('image')" class="px-4 py-2 text-slate-500 hover:text-slate-400 font-bold transition-all flex items-center gap-2" id="tab-image">
                        <i data-lucide="image" size="18"></i> Tải ảnh lên
                    </button>
                </div>
                
                <!-- Text input tab -->
                <div id="text-tab-content" class="space-y-4">
                    <div>
                        <label class="block text-sm font-bold ${styles.textPrimary} mb-2">Nhập đề bài / Mô tả vấn đề của bạn</label>
                        <textarea id="problem-input" placeholder="VD: Tôi cần giải bài toán về hàm số bậc 2. Cho f(x) = x² + 2x + 3. Tìm đỉnh của parabol..." class="w-full h-40 ${styles.inputBg} border ${styles.border} rounded-xl px-4 py-3 ${styles.textPrimary} placeholder-slate-400 focus:border-indigo-500 outline-none resize-none"></textarea>
                    </div>
                </div>
                
                <!-- Image upload tab -->
                <div id="image-tab-content" class="hidden space-y-4">
                    <div class="upload-area rounded-2xl border-2 border-dashed ${state.theme === 'dark' ? 'border-slate-700 hover:border-indigo-500 bg-slate-800/30' : 'border-slate-300 hover:border-indigo-500 bg-slate-50'} flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all relative group">
                        <input type="file" id="problem-image-input" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10" onchange="handleProblemImageSelect(event)">
                        <div id="problem-preview-placeholder" class="pointer-events-none">
                            <div class="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                                <i data-lucide="image-plus" size="32"></i>
                            </div>
                            <p class="font-bold ${styles.textPrimary} mb-1">Tải ảnh chứa đề bài lên</p>
                            <p class="text-sm ${styles.textSecondary}">Hoặc kéo thả ảnh vào đây</p>
                        </div>
                        <div id="problem-image-preview" class="hidden absolute inset-0 z-0 p-4">
                            <img id="problem-preview-img" class="w-full h-full object-contain rounded-xl">
                            <div class="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span class="text-white bg-black/50 px-4 py-2 rounded-lg font-medium">Thay đổi ảnh</span>
                            </div>
                        </div>
                    </div>
                    <button onclick="recognizeImageText()" class="btn-core btn-primary w-full px-6 py-3 text-white shadow-lg flex items-center justify-center gap-2" id="ocr-btn">
                        <i data-lucide="search" size="18"></i>
                        Nhận diện văn bản
                    </button>
                    <div id="ocr-loading" class="hidden text-center">
                        <div class="inline-flex items-center gap-2 text-indigo-500">
                            <i data-lucide="loader-2" class="animate-spin" size="20"></i>
                            <span>Đang nhận diện văn bản...</span>
                        </div>
                    </div>
                </div>
                
                <div id="suggestions-container" class="hidden">
                    <h3 class="font-bold ${styles.textPrimary} mb-3">Các Prompt gợi ý:</h3>
                    <div id="suggestions-list" class="space-y-3">
                        <!-- Suggestions will be inserted here -->
                    </div>
                </div>
                
                <div id="custom-prompt-container" class="hidden">
                    <h3 class="font-bold ${styles.textPrimary} mb-3">Hoặc tạo Prompt tùy chỉnh:</h3>
                    <textarea id="custom-prompt-text" placeholder="Prompt được tạo sẽ hiển thị ở đây..." class="w-full h-32 ${styles.inputBg} border ${styles.border} rounded-xl px-4 py-3 ${styles.textPrimary} focus:border-indigo-500 outline-none resize-none" readonly></textarea>
                    <button onclick="useCustomPrompt()" class="btn-core btn-primary mt-3 w-full px-6 py-3 text-white shadow-lg">
                        Sử dụng Prompt này
                    </button>
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button onclick="suggestPromptsForProblem()" class="btn-core btn-primary flex-1 px-6 py-3 text-white shadow-lg flex items-center justify-center gap-2">
                        <i data-lucide="search" size="18"></i>
                        Tìm Prompt phù hợp
                    </button>
                    <button onclick="generatePromptForProblem()" class="btn-core btn-glass flex-1 px-5 py-3 ${styles.textPrimary} flex items-center justify-center gap-2">
                        <i data-lucide="sparkles" size="18"></i>
                        Tạo Prompt mới
                    </button>
                </div>
            </div>
        </div>
    `;
}

function suggestPromptsForProblem() {
    const problemText = document.getElementById('problem-input').value.trim();
    if (!problemText) {
        showToast('Vui lòng nhập đề bài!');
        return;
    }
    
    // Tìm từ khóa từ đề bài
    const keywords = problemText.toLowerCase().split(/[\s,;.!?]+/);
    
    // Tìm prompts phù hợp dựa trên tags
    const suggestedPrompts = state.prompts.filter(prompt => {
        return prompt.tags.some(tag => {
            const tagLower = tag.toLowerCase();
            return keywords.some(keyword => 
                keyword.length > 2 && (
                    tagLower.includes(keyword) || 
                    keyword.includes(tagLower.substring(0, 3))
                )
            );
        });
    }).slice(0, 5); // Giới hạn 5 gợi ý
    
    // Hiển thị gợi ý
    const suggestionsList = document.getElementById('suggestions-list');
    if (suggestedPrompts.length > 0) {
        suggestionsList.innerHTML = suggestedPrompts.map(p => `
            <div class="p-4 rounded-xl border ${getStyles().border} hover:bg-white/5 cursor-pointer transition-all" onclick="selectPromptForProblem(${p.id})">
                <h4 class="font-bold ${getStyles().textPrimary} mb-1">${p.title}</h4>
                <p class="text-sm ${getStyles().textSecondary} mb-2">${p.description}</p>
                <div class="flex flex-wrap gap-2">
                    ${p.tags.map(tag => `<span class="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');
        document.getElementById('suggestions-container').classList.remove('hidden');
    } else {
        showToast('Không tìm thấy prompt phù hợp. Hãy thử tạo prompt mới!');
    }
}

function selectPromptForProblem(promptId) {
    const prompt = state.prompts.find(p => p.id === promptId);
    const problemText = document.getElementById('problem-input').value.trim();
    
    if (prompt && problemText) {
        state.activePrompt = prompt;
        closeModal();
        
        // Tự động gửi request với đề bài
        const previewPrompt = document.getElementById('preview-prompt');
        if (previewPrompt) {
            previewPrompt.value = problemText;
            // Tự động gọi runPrompt
            setTimeout(() => {
                runPrompt();
            }, 100);
        }
        showToast(`Đã chọn: ${prompt.title}`);
        renderApp();
    }
}

function generatePromptForProblem() {
    const problemText = document.getElementById('problem-input').value.trim();
    if (!problemText) {
        showToast('Vui lòng nhập đề bài!');
        return;
    }
    
    // Tạo prompt tự động từ đề bài
    const customPrompt = `Tôi có một đề bài như sau: ${problemText}\n\nHãy:\n1. Phân tích đề bài và xác định vấn đề cần giải quyết.\n2. Đề xuất các bước giải quyết chi tiết.\n3. Cung cấp ví dụ hoặc giải thích cụ thể nếu cần.\n4. Tóm tắt kết luận cuối cùng.`;
    
    document.getElementById('custom-prompt-text').value = customPrompt;
    document.getElementById('custom-prompt-container').classList.remove('hidden');
    showToast('Prompt đã được tạo!');
}

function useCustomPrompt() {
    const customPrompt = document.getElementById('custom-prompt-text').value;
    const problemText = document.getElementById('problem-input').value.trim();
    
    // Tạo prompt tạm thời
    const tempPrompt = {
        id: Date.now(),
        title: 'Prompt từ đề bài',
        category: 'Khác',
        description: 'Prompt được tạo từ đề bài của bạn',
        content: customPrompt,
        tags: ['Tùy chỉnh']
    };
    
    state.activePrompt = tempPrompt;
    closeModal();
    
    // Tự động gửi request với đề bài
    const previewPrompt = document.getElementById('preview-prompt');
    if (previewPrompt && problemText) {
        previewPrompt.value = problemText;
        setTimeout(() => {
            runPrompt();
        }, 100);
    }
    
    showToast('Đang giải quyết đề bài...');
    renderApp();
}

// ==========================================
// PROBLEM IMAGE & OCR FUNCTIONS
// ==========================================
function switchProblemTab(tab) {
    const textTab = document.getElementById('tab-text');
    const imageTab = document.getElementById('tab-image');
    const textContent = document.getElementById('text-tab-content');
    const imageContent = document.getElementById('image-tab-content');
    
    if (tab === 'text') {
        textTab.classList.add('border-b-2', 'border-indigo-500', 'text-indigo-500');
        textTab.classList.remove('text-slate-500', 'hover:text-slate-400');
        imageTab.classList.remove('border-b-2', 'border-indigo-500', 'text-indigo-500');
        imageTab.classList.add('text-slate-500', 'hover:text-slate-400');
        textContent.classList.remove('hidden');
        imageContent.classList.add('hidden');
    } else {
        imageTab.classList.add('border-b-2', 'border-indigo-500', 'text-indigo-500');
        imageTab.classList.remove('text-slate-500', 'hover:text-slate-400');
        textTab.classList.remove('border-b-2', 'border-indigo-500', 'text-indigo-500');
        textTab.classList.add('text-slate-500', 'hover:text-slate-400');
        imageContent.classList.remove('hidden');
        textContent.classList.add('hidden');
    }
    lucide.createIcons();
}

function handleProblemImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.getElementById('problem-preview-img');
        img.src = e.target.result;
        document.getElementById('problem-image-preview').classList.remove('hidden');
        document.getElementById('problem-preview-placeholder').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

function recognizeImageText() {
    const img = document.getElementById('problem-preview-img');
    if (!img.src) {
        showToast('Vui lòng chọn ảnh trước!');
        return;
    }
    
    const ocrBtn = document.getElementById('ocr-btn');
    const ocrLoading = document.getElementById('ocr-loading');
    
    ocrBtn.disabled = true;
    ocrLoading.classList.remove('hidden');
    
    // Sử dụng Tesseract.js để nhận diện văn bản
    // Nếu chưa load, sẽ load từ CDN
    if (!window.Tesseract) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
        script.onload = () => {
            performOCR(img.src, ocrBtn, ocrLoading);
        };
        document.head.appendChild(script);
    } else {
        performOCR(img.src, ocrBtn, ocrLoading);
    }
}

async function performOCR(imageSrc, ocrBtn, ocrLoading) {
    try {
        // Nhận diện tiếng Việt
        const { data: { text } } = await Tesseract.recognize(imageSrc, 'vie');
        
        // Đưa kết quả vào textarea
        const problemInput = document.getElementById('problem-input');
        problemInput.value = text;
        
        // Chuyển về tab text
        switchProblemTab('text');
        
        showToast('Nhận diện thành công! Hãy bấm "Tìm Prompt phù hợp" hoặc "Tạo Prompt mới"');
    } catch (error) {
        console.error('OCR error:', error);
        showToast('Lỗi: Không thể nhận diện văn bản. Vui lòng thử lại hoặc nhập thủ công.');
    } finally {
        ocrBtn.disabled = false;
        ocrLoading.classList.add('hidden');
    }
}

function renderHero() {
    const styles = getStyles();
    const heroBgStyle = "background-image: url('images/bia chinh.png'); background-size: cover; background-position: center;";
    const overlayClass = state.theme === 'dark' ? 'bg-black/70' : 'bg-white/60 backdrop-blur-[2px]';

    const fireflies = Array.from({ length: 15 }).map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 5 + Math.random() * 10;
        const size = 2 + Math.random() * 4;
        return `<div class="firefly-dot animate-firefly" style="left: ${left}%; top: ${top}%; width: ${size}px; height: ${size}px; animation-delay: -${delay}s; animation-duration: ${duration}s;"></div>`;
    }).join('');

        return `
        <div class="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
            <div class="absolute inset-0 z-0 pointer-events-none transition-all duration-500" style="${heroBgStyle}">
                 <div class="absolute inset-0 ${overlayClass} transition-colors duration-500"></div> 
            </div>
            <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">${fireflies}</div>
            <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none ${styles.blobOpacity}">
                <div class="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" style="animation-duration: 8s"></div>
                <div class="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px] animate-duration: 10s; animation-delay: 1s"></div>
            </div>
            
            <div class="absolute inset-0 max-w-7xl mx-auto pointer-events-none hidden md:block">
                <div class="absolute top-20 left-[12%] animate-float pointer-events-auto cursor-pointer transition-transform hover:scale-110" style="animation-delay: 0s" onclick="openToolModal('gemini')">
                    <div class="w-16 h-16 rounded-2xl ${styles.glass} flex items-center justify-center shadow-lg"><img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg" class="w-10"></div>
                </div>
                <div class="absolute bottom-20 right-[12%] animate-float pointer-events-auto cursor-pointer transition-transform hover:scale-110" style="animation-delay: 2s" onclick="openToolModal('gpt')">
                    <div class="w-16 h-16 rounded-2xl ${styles.glass} flex items-center justify-center shadow-lg"><img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" class="w-10"></div>
                </div>
                <div class="absolute top-32 right-[18%] animate-float pointer-events-auto cursor-pointer transition-transform hover:scale-110" style="animation-delay: 1s" onclick="openToolModal('claude')">
                    <div class="w-16 h-16 rounded-2xl ${styles.glass} flex items-center justify-center shadow-lg"><img src="https://sm.pcmag.com/t/pcmag_uk/review/c/claude/claude_5gnz.1200.jpg" class="w-10 rounded-lg"></div>
                </div>
                <div class="absolute bottom-32 left-[18%] animate-float pointer-events-auto cursor-pointer transition-transform hover:scale-110" style="animation-delay: 3s" onclick="openToolModal('copilot')">
                    <div class="w-16 h-16 rounded-2xl ${styles.glass} flex items-center justify-center shadow-lg"><img src="https://socialsciences.mcmaster.ca/app/uploads/2023/11/Untitled-design-81.png" class="w-10"></div>
                </div>
            </div>

            <div class="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <h1 class="text-5xl md:text-7xl font-black ${state.theme === 'dark' ? 'text-white' : 'text-slate-900'} tracking-tight mb-8 leading-tight drop-shadow-xl">
                    Khai phá tiềm năng <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x">AI Chatbot</span>
                </h1>
                <p class="text-xl ${styles.textSecondary} max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                    Kho tàng các câu lệnh (prompts) được tinh chỉnh kỹ lưỡng giúp bạn làm việc nhanh hơn gấp 10 lần.
                </p>
                <div class="max-w-2xl mx-auto relative group transition-all duration-300 hover:scale-[1.02]">
                    <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    <div class="relative flex items-center ${styles.glass} rounded-xl p-2">
                        <i data-lucide="search" class="ml-4 ${styles.textSecondary} group-focus-within:text-indigo-500 transition-colors" size="24"></i>
                        <input type="text" id="search-input" placeholder="Bạn muốn AI giúp gì hôm nay? (VD: Viết code, Soạn email...)" class="w-full bg-transparent border-none focus:outline-none ${styles.textPrimary} placeholder-slate-400 py-3 px-4 text-lg font-medium outline-none" value="${state.searchTerm}" autofocus>
                    </div>
                </div>
                <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button onclick="openModal('scan')" class="px-5 py-3 rounded-lg ${getColorClass('bg')} ${getColorClass('bg-hover')} text-white font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 button-glow">
                        <i data-lucide="scan" size="18"></i> Quét ảnh OCR
                    </button>
                    <button onclick="openModal('add')" class="px-5 py-3 rounded-lg ${styles.glass} ${styles.glassHover} border ${styles.border} ${styles.textPrimary} font-semibold flex items-center gap-2 button-glow">
                        <i data-lucide="sparkles" size="18"></i> Tạo prompt mới
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderPromptCard(prompt) {
    const styles = getStyles();
    const placeholderContent = prompt.content || '';
    const escapedContent = placeholderContent
        .replace(/`/g, "\\`")
        .replace(/\$/g, "\\$")
        .replace(/\n/g, "\\n");
    let iconPath = "";

    if (prompt.category === "Giáo dục") {
        const subjectTag = prompt.tags.find(tag => SUBJECT_ICONS[tag]);
        if (subjectTag) iconPath = SUBJECT_ICONS[subjectTag];
    }
    if (!iconPath) iconPath = CATEGORY_ICONS[prompt.category];

    const iconHTML = iconPath
        ? `<img src="${iconPath}" alt="${prompt.category}" class="w-full h-full object-contain drop-shadow-sm">`
        : `<i data-lucide="sparkles" class="text-yellow-500" size="20"></i>`;

    const isFavorite = state.currentUser?.favorites.includes(prompt.id);
    const heartIcon = isFavorite 
        ? `<i data-lucide="heart" fill="#ef4444" class="text-red-500" size="20"></i>` 
        : `<i data-lucide="heart" class="text-slate-400 group-hover:text-red-400 transition-colors" size="20"></i>`;

    return `
        <div class="group relative ${styles.glass} ${styles.glassHover} rounded-2xl p-6 flex flex-col h-full transition-all duration-300 overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] group-hover:bg-indigo-500/20 transition-all"></div>
            <div class="flex justify-between items-start mb-5 relative z-10">
                <div class="p-2.5 ${styles.iconBg} rounded-xl border ${styles.border} group-hover:scale-110 transition-transform duration-300 w-12 h-12 flex items-center justify-center overflow-hidden relative">
                    ${iconHTML}
                    <div class="absolute -top-3 -right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <button onclick="copyToClipboard(\`${escapedContent}\`)" class="p-1.5 rounded-lg bg-slate-900/80 text-white shadow-lg hover:bg-indigo-600 transition-colors text-[10px] leading-none" title="Copy nhanh">Copy</button>
                        <button onclick="switchToChatMode(${prompt.id})" class="p-1.5 rounded-lg bg-white/90 text-slate-800 shadow-lg hover:bg-emerald-200 transition-colors text-[10px] leading-none" title="Xem chi tiết">Preview</button>
                        <button onclick="openQuickTestModal(${prompt.id})" class="p-1.5 rounded-lg bg-emerald-500/90 text-white shadow-lg hover:bg-emerald-400 transition-colors text-[10px] leading-none" title="Test nhanh trong popup">Test</button>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                     <button onclick="toggleFavorite(event, ${prompt.id})" class="p-2 rounded-full hover:bg-white/10 transition-colors relative z-20" title="${isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}">
                        ${heartIcon}
                    </button>
                    <span class="text-[10px] font-bold uppercase tracking-wider ${styles.textSecondary} ${styles.iconBg} px-2 py-1 rounded-md border ${styles.border}">${prompt.category}</span>
                </div>
            </div>
            <h3 class="text-xl font-bold ${styles.textPrimary} mb-2 group-hover:text-indigo-500 transition-colors relative z-10">${prompt.title}</h3>
            <p class="${styles.textSecondary} text-sm mb-6 line-clamp-2 relative z-10">${prompt.description}</p>
            <div class="mt-auto pt-4 border-t ${styles.border} flex items-center justify-between relative z-10">
                <div class="flex gap-2">
                    ${prompt.tags.slice(0, 2).map(tag => `<span class="text-xs ${styles.textSecondary} font-medium">#${tag}</span>`).join('')}
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    <button onclick="switchToChatMode(${prompt.id})" class="p-2 bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-600 rounded-lg transition-colors" title="Chạy thử (chế độ chat)"><i data-lucide="play" size="16" fill="currentColor"></i></button>
                    <button onclick="openQuickTestModal(${prompt.id})" class="p-2 bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-600 rounded-lg transition-colors" title="Test nhanh (popup)"><i data-lucide="sparkles" size="16"></i></button>
                    <button onclick='copyToClipboard(\`${prompt.content.replace(/`/g, "\\`").replace(/\n/g, "\\n")}\`)' class="p-2 bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-600 rounded-lg transition-colors" title="Sao chép"><i data-lucide="copy" size="16"></i></button>
                    ${state.currentUser ? `<button onclick="deletePrompt(${prompt.id})" class="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-600 rounded-lg transition-colors" title="Xóa prompt"><i data-lucide="trash-2" size="16"></i></button>` : ''}
                </div>
            </div>
        </div>
    `;
}

function renderSkeletonLoader(count = 6) {
    const styles = getStyles();
    const placeholderBg = state.theme === 'dark' ? 'bg-slate-700/60' : 'bg-slate-200/70';

    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${Array.from({ length: count }).map(() => `
                <div class="rounded-2xl border ${styles.border} ${styles.glass} p-6 animate-pulse h-full">
                    <div class="flex justify-between items-start mb-5">
                        <div class="w-12 h-12 rounded-xl ${placeholderBg}"></div>
                        <div class="flex gap-2">
                            <div class="w-8 h-8 rounded-full ${placeholderBg}"></div>
                            <div class="w-14 h-6 rounded-md ${placeholderBg}"></div>
                        </div>
                    </div>
                    <div class="h-5 w-3/4 rounded-md ${placeholderBg} mb-2"></div>
                    <div class="h-4 w-full rounded-md ${placeholderBg} mb-2"></div>
                    <div class="h-4 w-2/3 rounded-md ${placeholderBg} mb-6"></div>
                    <div class="pt-4 border-t ${styles.border} flex items-center justify-between">
                        <div class="flex gap-2">
                            <div class="w-12 h-4 rounded-full ${placeholderBg}"></div>
                            <div class="w-10 h-4 rounded-full ${placeholderBg}"></div>
                        </div>
                        <div class="flex gap-2">
                            <div class="w-8 h-8 rounded-lg ${placeholderBg}"></div>
                            <div class="w-8 h-8 rounded-lg ${placeholderBg}"></div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderShowcase() {
    const styles = getStyles();
    const heroBgStyle = "background-image: url('images/Gemini_Generated_Image_xpwlbixpwlbixpwl.png'); background-size: cover; background-position: center;";
    const overlayClass = state.theme === 'dark' ? 'bg-black/60' : 'bg-white/80';

    return `
        <div class="max-w-7xl mx-auto px-4 py-20 pb-28 animate-fadeIn relative z-10">
             <div class="relative mb-24 rounded-3xl overflow-hidden p-12 text-center border ${styles.border} shadow-2xl group">
                <div class="absolute inset-0 z-0 pointer-events-none transition-all duration-500" style="${heroBgStyle}">
                     <div class="absolute inset-0 ${overlayClass} backdrop-blur-sm transition-all duration-500"></div>
                </div>
                <div class="relative z-10 flex flex-col items-center">
                    <div class="mb-6 p-4 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-lg animate-float">
                        <i data-lucide="layout-grid" size="32" class="text-indigo-500"></i>
                    </div>
                    <h2 class="text-5xl md:text-7xl font-black ${styles.textPrimary} mb-6 tracking-tight">Thế Giới <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Siêu Trí Tuệ</span></h2>
                    <p class="text-xl ${styles.textSecondary} max-w-2xl mx-auto mb-10 leading-relaxed">Khám phá và so sánh sức mạnh của những mô hình ngôn ngữ lớn (LLM) hàng đầu thế giới.</p>
                </div>
            </div>

            <!-- Prompt Engineering Section -->
            <div class="mb-24">
                <div class="rounded-3xl p-10 md:p-16 border border-indigo-500/30 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 relative overflow-hidden" style="background-image: url('images/Gemini_Generated_Image_kjo9sgkjo9sgkjo9.png'); background-size: cover; background-position: center; background-attachment: fixed;">
                    <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/60 to-purple-900/60 rounded-3xl"></div>
                    <div class="absolute top-0 left-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px]"></div>
                    <div class="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]"></div>
                    
                    <div class="relative z-10">
                        <div class="text-center mb-12">
                            <h3 class="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                                ✨ Prompt Engineering - Chìa khóa AI
                            </h3>
                            <p class="text-lg text-gray-300 max-w-3xl mx-auto">
                                Trong thời đại AI, cách bạn <span class="text-indigo-400 font-bold">đặt câu hỏi</span> quyết định chất lượng câu trả lời. Prompt tốt = Kết quả tuyệt vời.
                            </p>
                        </div>

                        <div class="grid md:grid-cols-3 gap-6 mb-12">
                            <div class="bg-indigo-500/10 p-8 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/50 transition-all">
                                <div class="text-4xl mb-4">🎯</div>
                                <h4 class="text-xl font-bold text-white mb-3">Specificity (Cụ thể)</h4>
                                <p class="text-gray-400 text-sm">Prompt càng chi tiết, AI hiểu ý bạn càng tốt. Thay vì "Viết về AI" hãy "Viết bài 1000 từ về ứng dụng AI trong y tế"</p>
                            </div>
                            
                            <div class="bg-purple-500/10 p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all">
                                <div class="text-4xl mb-4">🎨</div>
                                <h4 class="text-xl font-bold text-white mb-3">Context (Bối cảnh)</h4>
                                <p class="text-gray-400 text-sm">Cung cấp thông tin nền tảng giúp AI hiểu rõ nội dung. "Tôi là một người mới bắt đầu lập trình, giải thích React cho tôi"</p>
                            </div>

                            <div class="bg-pink-500/10 p-8 rounded-2xl border border-pink-500/20 hover:border-pink-500/50 transition-all">
                                <div class="text-4xl mb-4">🔄</div>
                                <h4 class="text-xl font-bold text-white mb-3">Iteration (Cải tiến)</h4>
                                <p class="text-gray-400 text-sm">Tinh chỉnh lại prompt dựa trên kết quả. Kết quả chưa ưng ý? Hãy điều chỉnh và thử lại ngay!</p>
                            </div>
                        </div>

                        <div class="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8 mb-12">
                            <h4 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <i data-lucide="lightbulb" class="text-yellow-400" size="24"></i>
                                Ví dụ: Prompt tồi vs Prompt tốt
                            </h4>
                            <div class="grid md:grid-cols-2 gap-6">
                                <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                    <p class="text-sm font-bold text-red-400 mb-2">❌ Prompt Tồi:</p>
                                    <p class="text-gray-400 text-sm italic">"Giải thích machine learning"</p>
                                </div>
                                <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                    <p class="text-sm font-bold text-green-400 mb-2">✅ Prompt Tốt:</p>
                                    <p class="text-gray-400 text-sm italic">"Giải thích machine learning cho một người không có background về toán học. Sử dụng ví dụ thực tế từ đời sống hàng ngày. Tập trung vào các thuật toán phổ biến như Linear Regression, Decision Tree."</p>
                                </div>
                            </div>
                        </div>

                        <div class="text-center">
                            <h4 class="text-2xl font-bold text-white mb-6">Muốn tinh chỉnh Prompt nhanh hơn?</h4>
                            <button onclick="installExtension()" class="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl">
                                <i data-lucide="download" size="20"></i>
                                Cài đặt Extension Tinh chỉnh Prompt
                            </button>
                            <p class="text-sm text-gray-300 mt-4">
                                🚀 Cài đặt miễn phí trên Chrome. Tinh chỉnh prompt ngay trên ChatGPT, Gemini, Claude!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                ${AI_TOOLS.map(tool => `
                    <div class="${styles.cardBg} rounded-3xl p-8 border ${styles.border} hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden shadow-sm hover:shadow-xl">
                        <div class="absolute top-0 left-0 w-full h-1 ${tool.bg.replace('bg-', 'bg-gradient-to-r from-transparent via-')}"></div>
                        <div class="w-16 h-16 mb-6 relative"><div class="absolute inset-0 ${tool.bg} blur-xl rounded-full opacity-50"></div><div class="relative z-10 w-full h-full"><img src="${tool.icon}" class="w-full h-full object-contain"></div></div>
                        <h4 class="text-2xl font-bold ${tool.color} mb-2">${tool.name}</h4>
                        <p class="text-xs ${styles.textSecondary} font-bold uppercase tracking-widest mb-4">${tool.company}</p>
                        <p class="${styles.textSecondary} text-sm leading-relaxed mb-8">${tool.description}</p>
                        <a href="${tool.url}" target="_blank" class="mt-auto flex items-center justify-center w-full py-3 rounded-xl ${styles.iconBg} hover:bg-indigo-500 hover:text-white border ${styles.border} hover:border-indigo-500 ${styles.textPrimary} font-medium transition-all">Truy cập ngay <i data-lucide="external-link" size="14" class="ml-2"></i></a>
                    </div>
                `).join('')}
            </div>

            <div class="mb-24">
                <h3 class="text-3xl font-bold ${styles.textPrimary} mb-8 flex items-center gap-3"><i data-lucide="file-text" class="text-indigo-500"></i> Báo cáo & Nghiên cứu Uy tín</h3>
                <div class="grid md:grid-cols-2 gap-6">
                    ${RELIABLE_ARTICLES.map(article => `
                        <a href="${article.url}" target="_blank" class="group block p-6 rounded-2xl ${styles.glass} hover:border-indigo-500/50 transition-all duration-300">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-xs font-bold text-indigo-500 uppercase tracking-wider">${article.org}</span>
                                <i data-lucide="arrow-up-right" size="16" class="${styles.textSecondary} group-hover:text-indigo-500 transition-colors"></i>
                            </div>
                            <h4 class="text-xl font-bold ${styles.textPrimary} mb-2 group-hover:text-indigo-500 transition-colors">${article.title}</h4>
                            <p class="${styles.textSecondary} text-sm line-clamp-2">${article.desc}</p>
                        </a>
                    `).join('')}
                </div>
            </div>

            <div class="rounded-3xl p-10 md:p-16 border ${styles.border} bg-gradient-to-br from-emerald-900/10 to-teal-900/10 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
                <div class="relative z-10">
                    <div class="text-center mb-12">
                        <h3 class="text-3xl md:text-4xl font-black ${styles.textPrimary} mb-4">Đạo đức & Hướng dẫn Sử dụng AI</h3>
                        <p class="text-lg ${styles.textSecondary} max-w-3xl mx-auto">Công nghệ chỉ thực sự mạnh mẽ khi được sử dụng một cách có trách nhiệm.</p>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        ${ETHICS_GUIDE.map(item => `
                            <div class="${styles.cardBg} p-6 rounded-2xl border ${styles.border} shadow-lg hover:-translate-y-1 transition-transform duration-300">
                                <div class="w-12 h-12 rounded-full bg-white/10 ${item.color} flex items-center justify-center mb-4 text-2xl">
                                    <i data-lucide="${item.icon}" size="24"></i>
                                </div>
                                <h4 class="text-lg font-bold ${styles.textPrimary} mb-2">${item.title}</h4>
                                <p class="${styles.textSecondary} text-sm leading-relaxed">${item.content}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- Modals ---
function openModal(type, data = null) {
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalContent = document.getElementById('modal-content-wrapper');
    const modalBody = document.getElementById('modal-body');
    const styles = getStyles();

    modalContent.className = `rounded-3xl w-full max-w-6xl border ${styles.border} shadow-2xl overflow-hidden relative flex flex-col h-[90vh] md:h-[85vh] transform scale-95 transition-transform duration-300 ${styles.modalBg}`;
    document.getElementById('modal-close-btn').className = `absolute top-4 right-4 p-2 ${styles.iconBg} rounded-full ${styles.textSecondary} hover:${styles.textPrimary} z-50 transition-colors`;

    state.currentModal = type;
    if (type === 'add') renderAddModal(modalBody, data); 
    else if (type === 'test') renderTestModal(modalBody);
    else if (type === 'tool') {
        modalContent.classList.replace('max-w-6xl', 'max-w-lg');
        modalContent.style.height = 'auto';
        renderToolModal(modalBody);
    }
    else if (type === 'scan') {
        modalContent.classList.replace('max-w-6xl', 'max-w-4xl');
        renderScanModal(modalBody);
    }
    else if (type === 'login') {
        modalContent.classList.replace('max-w-6xl', 'max-w-lg');
        modalContent.style.height = 'auto';
        renderLoginModal(modalBody);
    }
    else if (type === 'submitProblem') {
        modalContent.classList.replace('max-w-6xl', 'max-w-2xl');
        renderSubmitProblemModal(modalBody);
    }
    else if (type === 'share') {
        modalContent.classList.replace('max-w-6xl', 'max-w-lg');
        modalContent.style.height = 'auto';
        renderShareModal(modalBody);
    }
    else if (type === 'friends') {
        modalContent.classList.replace('max-w-6xl', 'max-w-lg');
        modalContent.style.height = 'auto';
        renderFriendsModal(modalBody);
    }

    modalBackdrop.classList.remove('hidden');
    void modalBackdrop.offsetWidth;
    modalBackdrop.classList.remove('opacity-0');
    modalContent.classList.remove('scale-95');
    modalContent.classList.add('scale-100');
    lucide.createIcons();
}

function closeModal() {
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalContent = document.getElementById('modal-content-wrapper');
    modalBackdrop.classList.add('opacity-0');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        modalBackdrop.classList.add('hidden');
        modalContent.classList.replace('max-w-lg', 'max-w-6xl');
        modalContent.classList.replace('max-w-4xl', 'max-w-6xl');
        modalContent.style.height = ''; 
        state.currentModal = null;
        state.activePrompt = null;
        state.activeTool = null;
        state.chatHistory = [];
        state.scanResult = ""; 
    }, 300);
}

function openToolModal(toolId) {
    console.log('openToolModal called with toolId:', toolId);
    console.log('AI_TOOLS:', AI_TOOLS);
    state.activeTool = AI_TOOLS.find(t => t.id === toolId);
    console.log('state.activeTool:', state.activeTool);
    if(state.activeTool) {
        openModal('tool');
    } else {
        console.error('Tool not found:', toolId);
    }
}

function renderToolModal(container) {
    const tool = state.activeTool;
    const styles = getStyles();
    container.innerHTML = `
        <div class="p-8 text-center flex flex-col items-center justify-center h-full">
            <div class="w-24 h-24 mb-6 relative">
                <div class="absolute inset-0 ${tool.bg} blur-xl rounded-full opacity-50"></div>
                <div class="relative z-10 w-full h-full"><img src="${tool.icon}" class="w-full h-full object-contain"></div>
            </div>
            <h2 class="text-3xl font-bold ${tool.color} mb-2">${tool.name}</h2>
            <p class="text-sm font-bold uppercase tracking-widest ${styles.textSecondary} mb-4">${tool.company}</p>
            <p class="${styles.textSecondary} mb-8 leading-relaxed">${tool.description}</p>
            <a href="${tool.url}" target="_blank" class="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                Truy cập ngay <i data-lucide="external-link" size="20" class="ml-2"></i>
            </a>
        </div>
    `;
}

function renderLoginModal(container) {
    const styles = getStyles();
    
    // Nếu đã đăng nhập
    if (state.currentUser) {
        const user = state.currentUser;
        const favoriteCount = user.favorites ? user.favorites.length : 0;
        // Thu nhỏ modal, thêm max-height và overflow-y-auto cho phần nội dung
        container.innerHTML = `
            <div class="flex flex-col h-full max-h-[75vh] md:max-h-[65vh]">
                <!-- Header -->
                <div class="text-center mb-6 pb-4 border-b ${styles.border}">
                    <div class="relative inline-block group mb-3">
                        <div id="user-avatar-display" class="w-16 h-16 ${user.avatarImage ? 'bg-cover bg-center' : user.avatarColor || 'bg-gradient-to-br from-indigo-600 to-purple-600'} rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-bold text-xl overflow-hidden" style="${user.avatarImage ? `background-image: url(${user.avatarImage})` : ''}">
                            ${!user.avatarImage ? user.avatarText || user.name.charAt(0).toUpperCase() : ''}
                        </div>
                        <button type="button" onclick="openAvatarPicker()" class="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <i data-lucide="camera" size="16"></i>
                        </button>
                    </div>
                    <h2 class="text-2xl font-bold ${styles.textPrimary} mb-1">${user.name}</h2>
                    <p class="text-xs ${styles.textSecondary}">${user.email}</p>
                </div>
                <!-- Nội dung profile có thanh cuộn -->
                <div class="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
                    <!-- Thống kê -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="p-3 rounded-xl ${styles.cardBg} border ${styles.border} text-center">
                            <div class="text-xl font-bold text-indigo-500 mb-1">${favoriteCount}</div>
                            <p class="text-xs ${styles.textSecondary}">Prompt yêu thích</p>
                        </div>
                        <div class="p-3 rounded-xl ${styles.cardBg} border ${styles.border} text-center">
                            <div class="text-xl font-bold text-purple-500 mb-1">${user.customPrompts ? user.customPrompts.length : 0}</div>
                            <p class="text-xs ${styles.textSecondary}">Prompt tạo</p>
                        </div>
                    </div>
                    <!-- Thông tin tài khoản -->
                    <div>
                        <h3 class="font-bold ${styles.textPrimary} mb-2 text-xs">THÔNG TIN TÀI KHOẢN</h3>
                        <div class="space-y-2">
                            <div class="p-2 rounded-lg ${styles.inputBg} border ${styles.border}">
                                <p class="text-[10px] ${styles.textSecondary} mb-1">Tên hiển thị</p>
                                <p class="${styles.textPrimary} font-medium text-sm">${user.name}</p>
                            </div>
                            <div class="p-2 rounded-lg ${styles.inputBg} border ${styles.border}">
                                <p class="text-[10px] ${styles.textSecondary} mb-1">Email</p>
                                <p class="${styles.textPrimary} font-medium text-sm">${user.email}</p>
                            </div>
                            <div class="p-2 rounded-lg ${styles.inputBg} border ${styles.border}">
                                <p class="text-[10px] ${styles.textSecondary} mb-1">Ngày tham gia</p>
                                <p class="${styles.textPrimary} font-medium text-sm">${new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>
                    <!-- API Key -->
                    <div>
                        <h3 class="font-bold ${styles.textPrimary} mb-2 text-xs">API KEY CÁ NHÂN</h3>
                        <div class="p-3 rounded-xl ${styles.cardBg} border ${styles.border}">
                            <p class="text-[10px] ${styles.textSecondary} mb-2">Nhập API Key riêng của bạn (tùy chọn):</p>
                            <input type="password" id="user-api-key-input" value="${state.userApiKey}" class="w-full ${styles.inputBg} border ${styles.border} rounded-lg px-3 py-2 ${styles.textPrimary} text-xs outline-none focus:border-indigo-500 transition-all" placeholder="sk-...">
                            <p class="text-[10px] ${styles.textSecondary} mt-2">💡 Nếu để trống, sẽ dùng API Key chung.</p>
                        </div>
                    </div>
                </div>
                <!-- Social Actions -->
                <div class="grid grid-cols-2 gap-2 pt-3">
                    <button onclick="openFriendsModal()" class="py-2 rounded-xl border ${styles.border} ${styles.textPrimary} hover:border-blue-500/50 hover:bg-blue-500/5 font-bold transition-all flex items-center justify-center gap-2 text-xs">
                        <i data-lucide="users" size="16"></i> Bạn bè
                    </button>
                    <button onclick="openModal('share')" class="py-2 rounded-xl border ${styles.border} ${styles.textPrimary} hover:border-green-500/50 hover:bg-green-500/5 font-bold transition-all flex items-center justify-center gap-2 text-xs">
                        <i data-lucide="share-2" size="16"></i> Chia sẻ
                    </button>
                </div>
                <!-- Actions -->
                <div class="mt-4 pt-4 border-t ${styles.border} flex gap-2">
                    <button onclick="saveUserApiKey()" class="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all flex items-center justify-center gap-2 text-xs">
                        <i data-lucide="save" size="16"></i> Lưu
                    </button>
                    <button onclick="logoutUser()" class="flex-1 py-2 rounded-xl border ${styles.border} ${styles.textPrimary} hover:bg-red-500/10 hover:border-red-500/30 font-bold transition-all flex items-center justify-center gap-2 text-xs">
                        <i data-lucide="log-out" size="16"></i> Đăng xuất
                    </button>
                </div>
            </div>
        `;
    } else {
        // Nếu chưa đăng nhập
        container.innerHTML = `
            <div class="p-8 h-full flex flex-col items-center justify-center">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-4">
                        <i data-lucide="user-circle" class="text-white" size="32"></i>
                    </div>
                    <h2 class="text-3xl font-bold ${styles.textPrimary} mb-2" id="auth-title">Đăng nhập</h2>
                    <p class="${styles.textSecondary}">Tham gia cộng đồng để lưu trữ Prompt của riêng bạn.</p>
                </div>
                
                <form id="auth-form" onsubmit="handleLogin(event)" class="w-full space-y-4">
                    <div id="name-field" class="hidden">
                        <label class="block text-sm font-medium ${styles.textSecondary} mb-2">Tên hiển thị</label>
                        <div class="relative">
                            <i data-lucide="user" size="18" class="absolute left-4 top-3.5 ${styles.textSecondary}"></i>
                            <input type="text" name="name" class="w-full ${styles.inputBg} border ${styles.border} rounded-xl pl-12 pr-4 py-3 ${styles.textPrimary} outline-none focus:border-indigo-500 transition-all" placeholder="VD: Minh Nhật">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium ${styles.textSecondary} mb-2">Email</label>
                        <div class="relative">
                            <i data-lucide="mail" size="18" class="absolute left-4 top-3.5 ${styles.textSecondary}"></i>
                            <input type="email" name="email" required class="w-full ${styles.inputBg} border ${styles.border} rounded-xl pl-12 pr-4 py-3 ${styles.textPrimary} outline-none focus:border-indigo-500 transition-all" placeholder="name@example.com">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium ${styles.textSecondary} mb-2">Mật khẩu</label>
                        <div class="relative">
                            <i data-lucide="lock" size="18" class="absolute left-4 top-3.5 ${styles.textSecondary}"></i>
                            <input type="password" name="password" required class="w-full ${styles.inputBg} border ${styles.border} rounded-xl pl-12 pr-4 py-3 ${styles.textPrimary} outline-none focus:border-indigo-500 transition-all" placeholder="••••••••">
                        </div>
                    </div>

                    <button type="submit" id="auth-btn" class="btn-core btn-primary w-full px-6 py-4 text-white text-lg shadow-lg flex items-center justify-center gap-2">
                        Đăng nhập ngay
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="${styles.textSecondary} text-sm">
                        <span id="auth-switch-text">Chưa có tài khoản?</span>
                        <button onclick="toggleAuthMode()" class="text-indigo-500 font-bold hover:underline ml-1" id="auth-switch-btn">Đăng ký</button>
                    </p>
                </div>
            </div>
        `;
    }
    window.isRegisterMode = false;
}

function renderScanModal(container) {
    const styles = getStyles();
    container.innerHTML = `
        <div class="p-6 border-b ${styles.border} bg-gradient-to-r from-indigo-900/10 to-purple-900/10">
            <h2 class="text-2xl font-bold ${styles.textPrimary} flex items-center gap-3"><i data-lucide="scan-line" class="text-indigo-500"></i> Trích xuất Prompt từ Ảnh (OCR)</h2>
        </div>
        <div class="flex-1 p-8 flex flex-col md:flex-row gap-8 overflow-hidden">
            <div class="w-full md:w-1/2 flex flex-col gap-4">
                <div id="drop-zone" class="upload-area flex-1 rounded-2xl border-2 border-dashed ${state.theme === 'dark' ? 'border-slate-700 hover:border-indigo-500 bg-slate-800/30' : 'border-slate-300 hover:border-indigo-500 bg-slate-50'} flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all relative overflow-hidden group">
                    <input type="file" id="file-input" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10" onchange="handleFileSelect(event)">
                    <div id="preview-container" class="hidden absolute inset-0 z-0">
                        <img id="image-preview" class="w-full h-full object-contain p-2">
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="text-white bg-black/50 px-4 py-2 rounded-lg font-medium">Thay đổi ảnh</span>
                        </div>
                    </div>
                    <div id="upload-placeholder" class="pointer-events-none">
                        <div class="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                            <i data-lucide="image-plus" size="32"></i>
                        </div>
                        <h3 class="font-bold ${styles.textPrimary} mb-1">Tải ảnh lên</h3>
                        <p class="text-sm ${styles.textSecondary}">Kéo thả hoặc nhấn để chọn ảnh</p>
                    </div>
                </div>
                <button id="scan-btn" onclick="handleImageScan()" class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2" disabled>
                    <i data-lucide="sparkles" size="18"></i> Trích xuất văn bản
                </button>
            </div>

            <div class="w-full md:w-1/2 flex flex-col">
                <label class="block text-sm font-bold ${styles.textSecondary} mb-2">Kết quả trích xuất:</label>
                <div class="flex-1 relative">
                    <textarea id="scan-result" class="w-full h-full ${styles.inputBg} border ${styles.border} rounded-xl p-4 ${styles.textPrimary} font-mono text-sm outline-none focus:border-indigo-500 transition-all resize-none" placeholder="Nội dung văn bản sẽ xuất hiện tại đây..." readonly></textarea>
                    <div id="scan-loading" class="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center hidden">
                        <div class="flex flex-col items-center gap-3 text-white">
                            <i data-lucide="loader-2" class="animate-spin" size="32"></i>
                            <span>Đang phân tích ảnh...</span>
                        </div>
                    </div>
                </div>
                <div class="flex gap-3 mt-4">
                    <button onclick="copyToClipboard(document.getElementById('scan-result').value)" class="btn-core btn-glass flex-1 px-4 py-2.5 ${styles.textPrimary} flex items-center justify-center gap-2">
                        <i data-lucide="copy" size="16"></i> Copy
                    </button>
                    <button onclick="refineScannedText()" class="btn-core btn-success flex-1 px-4 py-2.5 text-white shadow-lg flex items-center justify-center gap-2">
                        <i data-lucide="wand-2" size="18"></i> Tinh chỉnh
                    </button>
                    <button onclick="suggestPromptsFromScan()" class="btn-core btn-primary flex-1 px-4 py-2.5 text-white shadow-lg flex items-center justify-center gap-2">
                        <i data-lucide="search" size="18"></i> Gợi ý
                    </button>
                    <button onclick="transferScanToadd()" class="btn-core btn-success flex-1 px-4 py-2.5 text-white shadow-lg flex items-center justify-center gap-2">
                        <i data-lucide="file-plus" size="18"></i> Tạo Prompt
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderAddModal(container, initialData = null) {
    const styles = getStyles();
    const defaultContent = initialData ? initialData.content : "";
    
    container.innerHTML = `
        <div class="p-8 border-b ${styles.border} bg-gradient-to-r from-indigo-900/10 to-purple-900/10">
            <h2 class="text-2xl font-bold ${styles.textPrimary} flex items-center gap-3"><i data-lucide="plus" class="text-indigo-500"></i> Đóng góp Prompt</h2>
        </div>
        
        <div class="px-8 pt-6 pb-2">
            <div class="p-4 rounded-xl border border-dashed ${state.theme === 'dark' ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-300 bg-purple-50'}">
                <div class="flex items-center gap-2 mb-3">
                    <div class="p-1.5 bg-purple-500/10 rounded-lg text-purple-600"><i data-lucide="sparkles" size="16"></i></div>
                    <span class="text-sm font-bold ${styles.textAccent}">Tạo Prompt Thông Minh</span>
                </div>
                <div class="flex gap-2">
                    <input id="smart-idea-input" class="flex-1 ${styles.inputBg} border ${styles.border} rounded-xl px-4 py-2 text-sm ${styles.textPrimary} focus:border-purple-500 outline-none transition-all" placeholder="Nhập ý tưởng ngắn (VD: Viết email xin nghỉ phép...)">
                    <button onclick="generateSmartPrompt()" id="smart-gen-btn" class="whitespace-nowrap px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2">
                        <i data-lucide="zap" size="14"></i> Tạo ngay
                    </button>
                </div>
                <div id="smart-loading" class="hidden mt-2 text-xs text-purple-500 flex items-center gap-2">
                    <i data-lucide="loader-2" class="animate-spin" size="12"></i> Đang suy nghĩ và viết prompt...
                </div>
            </div>
        </div>

        <form onsubmit="handleAddSubmit(event)" class="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 ${styles.modalBg}">
            <div class="grid grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium ${styles.textSecondary} mb-2">Tiêu đề</label>
                    <input required name="title" class="w-full ${styles.inputBg} border ${styles.border} rounded-xl px-4 py-3 ${styles.textPrimary} focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="VD: Sáng tạo slogan">
                </div>
                <div>
                    <label class="block text-sm font-medium ${styles.textSecondary} mb-2">Danh mục</label>
                    <select name="category" class="w-full ${styles.inputBg} border ${styles.border} rounded-xl px-4 py-3 ${styles.textPrimary} outline-none">
                        ${CATEGORIES.filter(c => c !== 'Tất cả' && c !== 'Cá nhân').map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium ${styles.textSecondary} mb-2">Mô tả ý tưởng</label>
                <input required name="description" class="w-full ${styles.inputBg} border ${styles.border} rounded-xl px-4 py-3 ${styles.textPrimary} outline-none" placeholder="Prompt này dùng để làm gì?">
            </div>
            <div>
                <label class="block text-sm font-medium ${styles.textSecondary} mb-2 flex justify-between">
                    Nội dung Prompt
                    <button type="button" onclick="toggleVoiceInput('add-content-input', 'mic-btn-add')" id="mic-btn-add" class="text-xs text-indigo-500 hover:text-indigo-400 flex items-center gap-1">
                        <i data-lucide="mic" size="14"></i> Nhập bằng giọng nói
                    </button>
                </label>
                <div class="relative">
                    <textarea id="add-content-input" required name="content" rows="8" class="w-full ${styles.inputBg} border ${styles.border} rounded-xl px-4 py-3 ${styles.textPrimary} font-mono text-sm outline-none focus:border-indigo-500 transition-all" placeholder="Nhập nội dung...">${defaultContent}</textarea>
                </div>
                ${initialData ? `<p class="text-xs text-emerald-500 mt-2 flex items-center gap-1"><i data-lucide="check-circle" size="12"></i> Đã điền tự động từ kết quả Scan ảnh</p>` : ''}
            </div>
            <button type="submit" class="w-full justify-center py-4 font-bold text-lg relative overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95 px-5 rounded-xl flex items-center gap-2 backdrop-blur-md bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/30">Thêm vào thư viện</button>
        </form>
    `;
}

let templateVariables = {};
function renderTestModal(container) {
    const styles = getStyles();
    const prompt = state.activePrompt;
    const matches = prompt.content.match(/\[(.*?)\]/g);
    templateVariables = {};
    if(matches) matches.forEach(m => templateVariables[m] = '');

    container.innerHTML = `
        <div class="flex h-full flex-col md:flex-row">
            <div class="w-full md:w-4/12 ${styles.iconBg} border-r ${styles.border} flex flex-col h-full">
                 <div class="p-6 border-b ${styles.border} ${styles.modalBg}">
                     <div class="flex items-center gap-3 mb-2"><div class="p-2 bg-indigo-500/20 rounded-lg text-indigo-500"><i data-lucide="sparkles" size="18"></i></div><h3 class="font-bold ${styles.textPrimary}">Cấu hình Prompt</h3></div>
                     <p class="text-xs ${styles.textSecondary}">Điền thông tin vào các ô trống để hoàn thiện câu lệnh.</p>
                 </div>
                 <div class="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar" id="variables-container">
                     ${Object.keys(templateVariables).length > 0 ? Object.keys(templateVariables).map((key, idx) => `
                        <div>
                            <label class="text-xs font-bold ${styles.textAccent} mb-1.5 flex justify-between ml-1">
                                ${key.replace(/[\[\]]/g, '')}
                                <button onclick="toggleVoiceInput('var-input-${idx}', 'mic-btn-${idx}')" id="mic-btn-${idx}" class="text-xs opacity-50 hover:opacity-100 hover:text-indigo-500 transition-colors" title="Nói để nhập"><i data-lucide="mic" size="12"></i></button>
                            </label>
                            <div class="flex gap-2">
                                <input id="var-input-${idx}" class="variable-input flex-1 ${styles.inputBg} border ${styles.border} rounded-lg px-3 py-2 text-sm ${styles.textPrimary} focus:border-indigo-500 outline-none transition-all" placeholder="..." data-key="${key}" oninput="updatePreview()">
                            </div>
                        </div>
                     `).join('') : `<div class="text-center ${styles.textSecondary} italic text-sm mt-10">Prompt này không có biến số cần điền.</div>`}
                     
                     <div class="pt-4 border-t ${styles.border}">
                        <label class="text-xs font-bold ${styles.textSecondary} mb-2 block flex justify-between">
                            Độ sáng tạo (Temperature) <span id="temp-val">0.7</span>
                        </label>
                        <input type="range" id="temp-slider" min="0" max="1" step="0.1" value="0.7" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" oninput="document.getElementById('temp-val').innerText = this.value">
                     </div>

                     <div class="pt-4 border-t ${styles.border}">
                       <label class="text-xs font-bold ${styles.textSecondary} mb-2 block">Preview Prompt</label>
                       <textarea id="preview-prompt" class="w-full ${styles.inputBg} border ${styles.border} rounded-lg p-3 text-xs ${styles.textSecondary} font-mono h-32 resize-none focus:border-indigo-500 outline-none" readonly>${prompt.content}</textarea>
                       <button onclick="copyCurrentPrompt()" class="mt-2 text-xs flex items-center gap-1 text-indigo-500 hover:text-indigo-400 font-bold ml-auto"><i data-lucide="copy" size="12"></i> Sao chép</button>
                     </div>
                 </div>
                 <div class="p-4 border-t ${styles.border} ${styles.modalBg} space-y-4">
                     <div class="space-y-2">
                        <div class="text-xs font-bold ${styles.textSecondary} text-center mb-2">Kiểu Trả Lời</div>
                        <div class="grid grid-cols-2 gap-2">
                            <button data-response-mode="fast" onclick="toggleResponseMode('fast')" class="py-2 px-3 rounded-lg border ${styles.border} bg-white/5 text-slate-400 text-xs font-bold transition-all hover:bg-white/10">
                                <i data-lucide="zap" size="14" class="inline mr-1"></i> Nhanh
                            </button>
                            <button data-response-mode="detailed" onclick="toggleResponseMode('detailed')" class="py-2 px-3 rounded-lg border ${styles.border} bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all">
                                <i data-lucide="type" size="14" class="inline mr-1"></i> Chi tiết
                            </button>
                        </div>
                     </div>
                     <button onclick="runPrompt()" class="w-full justify-center relative overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 backdrop-blur-md bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                        <i data-lucide="play" size="18" fill="currentColor"></i> Gửi cho Gemini
                     </button>
                     <div>
                       <div class="text-[10px] font-bold uppercase tracking-widest ${styles.textSecondary} text-center mb-3">Chạy nhanh trên nền tảng khác</div>
                       <div class="grid grid-cols-4 gap-2">
                         ${AI_TOOLS.map(tool => `
                           <button onclick="copyAndOpen('${tool.url}')" class="aspect-square rounded-xl border ${styles.border} hover:bg-white/5 flex flex-col items-center justify-center gap-1 transition-all group relative overflow-hidden" title="Copy & Mở ${tool.name}">
                             <div class="w-6 h-6"><img src="${tool.icon}" class="w-full h-full object-contain"></div>
                             <span class="text-[9px] font-medium opacity-60 group-hover:opacity-100 transition-opacity ${styles.textSecondary}">${tool.name}</span>
                           </button>
                         `).join('')}
                       </div>
                     </div>
                 </div>
            </div>
            <div class="flex-1 flex flex-col ${state.theme === 'dark' ? 'bg-[#0b0d14]' : 'bg-slate-50'} relative">
                <div class="p-4 border-b ${styles.border} flex justify-between items-center ${styles.glass} absolute top-0 left-0 right-0 z-10">
                    <span class="text-sm font-bold text-emerald-500 flex items-center gap-2"><i data-lucide="bot" size="16"></i> Chat Session</span>
                    <div class="flex gap-2">
                        <button onclick="downloadChatImage()" class="text-xs ${styles.textSecondary} hover:text-indigo-500 px-3 py-1 rounded-full border ${styles.border} hover:border-indigo-500/30 transition-all flex items-center gap-1">
                            <i data-lucide="image-down" size="14"></i> Tải ảnh chat
                        </button>
                        <button onclick="clearChat()" class="text-xs ${styles.textSecondary} hover:text-red-500 px-3 py-1 rounded-full border ${styles.border} hover:border-red-500/30 transition-all">Clear</button>
                    </div>
                </div>
                <div id="chat-container" class="flex-1 overflow-y-auto p-6 space-y-6 pt-20 custom-scrollbar">
                    <div class="h-full flex flex-col items-center justify-center ${styles.textSecondary} gap-4 opacity-50">
                        <i data-lucide="bot" size="64" stroke-width="1"></i><p>Sẵn sàng trò chuyện</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function switchView(view) {
    state.currentView = view;
    renderApp();
}

function setCategory(cat) {
    state.activeCategory = cat;
    state.activeSubject = null;
    if (state.loadingTimer) {
        clearTimeout(state.loadingTimer);
    }
    state.isLoadingPrompts = true;
    renderApp();
    state.loadingTimer = setTimeout(() => {
        state.isLoadingPrompts = false;
        renderApp();
    }, 600);
}

function setSubject(sub) {
    state.activeSubject = sub;
    if (state.loadingTimer) {
        clearTimeout(state.loadingTimer);
    }
    state.isLoadingPrompts = true;
    renderApp();
    state.loadingTimer = setTimeout(() => {
        state.isLoadingPrompts = false;
        renderApp();
    }, 600);
}

// ==========================================
// INITIALIZATION
// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================
function setupShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Phím Esc: Đóng modal
        if (e.key === 'Escape') {
            if (state.currentModal) {
                closeModal();
            }
            return;
        }
        
        // Phím /: Focus vào search bar
        if (e.key === '/') {
            // Kiểm tra không đang gõ trong input/textarea
            const activeElement = document.activeElement;
            const isTyping = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
            
            if (!isTyping) {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        }
        
        // Phím Ctrl+Enter (hoặc Cmd+Enter): Gửi prompt
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const previewPrompt = document.getElementById('preview-prompt');
            
            // Kiểm tra nếu đang focus vào ô nhập liệu chat
            if (document.activeElement === previewPrompt && previewPrompt.value.trim()) {
                e.preventDefault();
                runPrompt();
            }
        }
    });
}

// ==========================================
// USER PROFILE FUNCTIONS
// ==========================================
function saveUserApiKey() {
    const apiKeyInput = document.getElementById('user-api-key-input');
    if (!apiKeyInput) return;
    
    const newApiKey = apiKeyInput.value.trim();
    state.userApiKey = newApiKey;
    localStorage.setItem('pm_api_key', newApiKey);
    
    // Update current user if exists
    if (state.currentUser) {
        state.currentUser.apiKey = newApiKey;
        const users = JSON.parse(localStorage.getItem('pm_users') || '[]');
        const userIndex = users.findIndex(u => u.email === state.currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = state.currentUser;
            localStorage.setItem('pm_users', JSON.stringify(users));
        }
    }
    
    showToast('✓ API Key đã được cập nhật!');
}

function logoutUser() {
    state.currentUser = null;
    localStorage.removeItem('pm_currentUser');
    closeModal();
    renderApp();
    showToast('✓ Đã đăng xuất thành công!');
}

// ==========================================
// AVATAR FUNCTIONS
// ==========================================
const AVATAR_COLORS = [
    'bg-gradient-to-br from-indigo-600 to-purple-600',
    'bg-gradient-to-br from-pink-600 to-rose-600',
    'bg-gradient-to-br from-blue-600 to-cyan-600',
    'bg-gradient-to-br from-green-600 to-emerald-600',
    'bg-gradient-to-br from-yellow-600 to-orange-600',
    'bg-gradient-to-br from-red-600 to-pink-600',
    'bg-gradient-to-br from-purple-600 to-pink-600',
    'bg-gradient-to-br from-teal-600 to-green-600',
    'bg-gradient-to-br from-violet-600 to-purple-600',
    'bg-gradient-to-br from-sky-600 to-blue-600'
];

const AVATAR_EMOJIS = ['😊', '😎', '🤗', '😍', '🎉', '⭐', '🚀', '💎', '🎨', '🌟', '🎭', '🎪', '🎸', '📚', '🌈'];

function openAvatarPicker() {
    const styles = getStyles();
    const user = state.currentUser;
    
    const modalContent = `
        <div class="p-6 space-y-6">
            <div class="text-center">
                <h3 class="text-2xl font-bold ${styles.textPrimary} mb-2">Chọn ảnh đại diện</h3>
                <p class="${styles.textSecondary} text-sm">Chọn màu hoặc emoji yêu thích của bạn</p>
            </div>
            
            <!-- Tab chọn -->
            <div class="flex gap-2 border-b ${styles.border} overflow-x-auto">
                <button onclick="switchAvatarTab('color')" class="px-4 py-2 border-b-2 border-indigo-500 text-indigo-500 font-bold transition-all flex items-center gap-2 whitespace-nowrap" id="tab-color">
                    <i data-lucide="palette" size="18"></i> Màu sắc
                </button>
                <button onclick="switchAvatarTab('emoji')" class="px-4 py-2 text-slate-500 hover:text-slate-400 font-bold transition-all flex items-center gap-2 whitespace-nowrap" id="tab-emoji">
                    <i data-lucide="smile" size="18"></i> Emoji
                </button>
                <button onclick="switchAvatarTab('letter')" class="px-4 py-2 text-slate-500 hover:text-slate-400 font-bold transition-all flex items-center gap-2 whitespace-nowrap" id="tab-letter">
                    <i data-lucide="type" size="18"></i> Chữ cái
                </button>
                <button onclick="switchAvatarTab('image')" class="px-4 py-2 text-slate-500 hover:text-slate-400 font-bold transition-all flex items-center gap-2 whitespace-nowrap" id="tab-image">
                    <i data-lucide="image" size="18"></i> Ảnh
                </button>
            </div>
            
            <!-- Color tab -->
            <div id="color-tab-content">
                <p class="text-sm ${styles.textSecondary} mb-4">Chọn một trong những màu gradient này:</p>
                <div class="grid grid-cols-5 gap-3">
                    ${AVATAR_COLORS.map((color, idx) => `
                        <button onclick="selectAvatarColor('${color}')" class="w-12 h-12 ${color} rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all ring-2 ring-transparent hover:ring-white/50 ${user.avatarColor === color ? 'ring-indigo-400 scale-110' : ''}"></button>
                    `).join('')}
                </div>
            </div>
            
            <!-- Emoji tab -->
            <div id="emoji-tab-content" class="hidden">
                <p class="text-sm ${styles.textSecondary} mb-4">Chọn emoji yêu thích:</p>
                <div class="grid grid-cols-6 gap-2">
                    ${AVATAR_EMOJIS.map(emoji => `
                        <button onclick="selectAvatarEmoji('${emoji}')" class="w-12 h-12 text-2xl rounded-lg ${styles.inputBg} border ${styles.border} hover:border-indigo-500 hover:bg-indigo-500/10 transition-all flex items-center justify-center ${user.avatarText === emoji ? 'border-indigo-500 bg-indigo-500/10' : ''}">
                            ${emoji}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <!-- Letter tab -->
            <div id="letter-tab-content" class="hidden">
                <p class="text-sm ${styles.textSecondary} mb-4">Nhập một chữ cái hoặc ký tự:</p>
                <input type="text" id="avatar-letter-input" maxlength="1" value="${user.avatarText && user.avatarText.length === 1 && !AVATAR_EMOJIS.includes(user.avatarText) ? user.avatarText : user.name.charAt(0).toUpperCase()}" class="w-full ${styles.inputBg} border ${styles.border} rounded-lg px-4 py-3 ${styles.textPrimary} text-center text-2xl font-bold outline-none focus:border-indigo-500 transition-all" placeholder="A">
                <p class="text-xs ${styles.textSecondary} mt-2">Ký tự sẽ được hiển thị trong avatar</p>
            </div>
            
            <!-- Image tab -->
            <div id="image-tab-content" class="hidden">
                <p class="text-sm ${styles.textSecondary} mb-4">Tải ảnh lên làm hình đại diện:</p>
                <div class="upload-area rounded-2xl border-2 border-dashed ${state.theme === 'dark' ? 'border-slate-700 hover:border-indigo-500 bg-slate-800/30' : 'border-slate-300 hover:border-indigo-500 bg-slate-50'} flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all relative group">
                    <input type="file" id="avatar-image-input" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10" onchange="handleAvatarImageSelect(event)">
                    <div id="avatar-placeholder" class="pointer-events-none">
                        <div class="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                            <i data-lucide="image-plus" size="32"></i>
                        </div>
                        <p class="font-bold ${styles.textPrimary} mb-1">Tải ảnh lên</p>
                        <p class="text-sm ${styles.textSecondary}">Hoặc kéo thả ảnh vào đây</p>
                    </div>
                    <div id="avatar-image-preview" class="hidden absolute inset-0 z-0 p-4">
                        <img id="avatar-preview-img" class="w-full h-full object-cover rounded-xl">
                        <div class="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="text-white bg-black/50 px-4 py-2 rounded-lg font-medium">Thay đổi ảnh</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t ${styles.border}">
                <button onclick="saveAvatar()" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all flex items-center justify-center gap-2">
                    <i data-lucide="check" size="18"></i> Lưu
                </button>
                <button onclick="closeModal()" class="flex-1 py-3 rounded-xl border ${styles.border} ${styles.textPrimary} hover:bg-white/5 font-bold transition-all">
                    Hủy
                </button>
            </div>
        </div>
    `;
    
    state.currentModal = 'avatarPicker';
    document.getElementById('modal-content-wrapper').innerHTML = modalContent;
    document.getElementById('modal-backdrop').classList.remove('hidden');
    lucide.createIcons();
    window.currentAvatarColor = user.avatarColor || AVATAR_COLORS[0];
    window.currentAvatarText = user.avatarText || user.name.charAt(0).toUpperCase();
}

function switchAvatarTab(tab) {
    document.getElementById('color-tab-content').classList.toggle('hidden', tab !== 'color');
    document.getElementById('emoji-tab-content').classList.toggle('hidden', tab !== 'emoji');
    document.getElementById('letter-tab-content').classList.toggle('hidden', tab !== 'letter');
    document.getElementById('image-tab-content').classList.toggle('hidden', tab !== 'image');
    
    document.getElementById('tab-color').classList.toggle('border-b-2', tab === 'color');
    document.getElementById('tab-color').classList.toggle('border-indigo-500', tab === 'color');
    document.getElementById('tab-color').classList.toggle('text-indigo-500', tab === 'color');
    document.getElementById('tab-color').classList.toggle('text-slate-500', tab !== 'color');
    
    document.getElementById('tab-emoji').classList.toggle('border-b-2', tab === 'emoji');
    document.getElementById('tab-emoji').classList.toggle('border-indigo-500', tab === 'emoji');
    document.getElementById('tab-emoji').classList.toggle('text-indigo-500', tab === 'emoji');
    document.getElementById('tab-emoji').classList.toggle('text-slate-500', tab !== 'emoji');
    
    document.getElementById('tab-letter').classList.toggle('border-b-2', tab === 'letter');
    document.getElementById('tab-letter').classList.toggle('border-indigo-500', tab === 'letter');
    document.getElementById('tab-letter').classList.toggle('text-indigo-500', tab === 'letter');
    document.getElementById('tab-letter').classList.toggle('text-slate-500', tab !== 'letter');
    
    document.getElementById('tab-image').classList.toggle('border-b-2', tab === 'image');
    document.getElementById('tab-image').classList.toggle('border-indigo-500', tab === 'image');
    document.getElementById('tab-image').classList.toggle('text-indigo-500', tab === 'image');
    document.getElementById('tab-image').classList.toggle('text-slate-500', tab !== 'image');
}

function selectAvatarColor(color) {
    window.currentAvatarColor = color;
    window.currentAvatarText = state.currentUser.name.charAt(0).toUpperCase();
    // Highlight button
    document.querySelectorAll('#color-tab-content button').forEach(btn => {
        btn.classList.remove('ring-indigo-400', 'scale-110');
        btn.classList.add('ring-transparent');
    });
    event.target.closest('button').classList.add('ring-indigo-400', 'scale-110');
}

function selectAvatarEmoji(emoji) {
    window.currentAvatarText = emoji;
    window.currentAvatarColor = 'bg-gradient-to-br from-indigo-600 to-purple-600';
    // Highlight button
    document.querySelectorAll('#emoji-tab-content button').forEach(btn => {
        btn.classList.remove('border-indigo-500', 'bg-indigo-500/10');
    });
    event.target.closest('button').classList.add('border-indigo-500', 'bg-indigo-500/10');
}

function saveAvatar() {
    const letterInput = document.getElementById('avatar-letter-input');
    const imagePreview = document.getElementById('avatar-image-preview');
    const currentTab = !document.getElementById('letter-tab-content').classList.contains('hidden');
    const imageTab = !document.getElementById('image-tab-content').classList.contains('hidden');
    
    if (currentTab) {
        const letter = letterInput.value.trim().toUpperCase();
        if (!letter) {
            showToast('⚠️ Vui lòng nhập một ký tự!');
            return;
        }
        window.currentAvatarText = letter;
        window.currentAvatarColor = AVATAR_COLORS[0];
    }
    
    if (imageTab && !imagePreview.classList.contains('hidden')) {
        // Save image avatar
        const img = document.getElementById('avatar-preview-img');
        window.currentAvatarImage = img.src;
    }
    
    // Save to state
    state.currentUser.avatarColor = window.currentAvatarColor;
    state.currentUser.avatarText = window.currentAvatarText;
    state.currentUser.avatarImage = window.currentAvatarImage || '';
    
    // Save to localStorage
    const users = JSON.parse(localStorage.getItem('pm_users') || '[]');
    const userIndex = users.findIndex(u => u.email === state.currentUser.email);
    if (userIndex !== -1) {
        users[userIndex] = state.currentUser;
        localStorage.setItem('pm_users', JSON.stringify(users));
    }
    localStorage.setItem('pm_currentUser', JSON.stringify(state.currentUser));
    
    closeModal();
    openModal('login');
    showToast('✓ Ảnh đại diện đã được cập nhật!');
}

function handleAvatarImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.getElementById('avatar-preview-img');
        img.src = e.target.result;
        window.currentAvatarImage = e.target.result;
        
        document.getElementById('avatar-placeholder').classList.add('hidden');
        document.getElementById('avatar-image-preview').classList.remove('hidden');
        
        showToast('✓ Ảnh đã được tải!');
    };
    reader.readAsDataURL(file);
}

// ==========================================
// SOCIAL FEATURES (Friends & Share)
// ==========================================
function openFriendsModal() {
    openModal('friends');
}

function addFriend() {
    const emailInput = document.getElementById('friend-email-input');
    const email = emailInput.value.trim();
    
    if (!email) {
        showToast('⚠️ Vui lòng nhập email!');
        return;
    }
    
    const user = state.currentUser;
    if (!user.friends) user.friends = [];
    
    if (user.friends.some(f => f.email === email)) {
        showToast('ℹ️ Bạn này đã trong danh sách!');
        return;
    }
    
    const friendUser = state.users.find(u => u.email === email);
    if (!friendUser) {
        showToast('❌ Không tìm thấy người dùng!');
        return;
    }
    
    if (friendUser.email === user.email) {
        showToast('❌ Không thể kết bạn với chính mình!');
        return;
    }
    
    user.friends.push({
        id: friendUser.id,
        name: friendUser.name,
        email: friendUser.email
    });
    
    // Save
    localStorage.setItem('pm_currentUser', JSON.stringify(user));
    const users = JSON.parse(localStorage.getItem('pm_users') || '[]');
    const idx = users.findIndex(u => u.email === user.email);
    if (idx !== -1) {
        users[idx] = user;
        localStorage.setItem('pm_users', JSON.stringify(users));
    }
    
    emailInput.value = '';
    showToast('✓ Đã kết bạn thành công!');
    openFriendsModal();
}

function removeFriend(index) {
    const user = state.currentUser;
    if (!user.friends) return;
    
    user.friends.splice(index, 1);
    
    localStorage.setItem('pm_currentUser', JSON.stringify(user));
    const users = JSON.parse(localStorage.getItem('pm_users') || '[]');
    const idx = users.findIndex(u => u.email === user.email);
    if (idx !== -1) {
        users[idx] = user;
        localStorage.setItem('pm_users', JSON.stringify(users));
    }
    
    openFriendsModal();
    showToast('✓ Đã xóa bạn bè!');
}

function sharePrompt(promptId) {
    const prompt = state.data.find(p => p.id === promptId);
    if (!prompt) return;
    
    const user = state.currentUser;
    const friends = user.friends || [];
    
    if (friends.length === 0) {
        showToast('❌ Bạn chưa có bạn bè để chia sẻ!');
        return;
    }
    
    const styles = getStyles();
    const modalContent = `
        <div class="p-6 space-y-6">
            <div class="text-center">
                <h3 class="text-2xl font-bold ${styles.textPrimary} mb-2">Chia sẻ Prompt</h3>
                <p class="${styles.textSecondary} text-sm">Chia sẻ "<strong>${prompt.title}</strong>" với bạn bè</p>
            </div>
            
            <!-- Friends list -->
            <div class="max-h-96 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                ${friends.map((friend, idx) => `
                    <button onclick="sendPromptToFriend(${promptId}, ${idx})" class="w-full p-3 rounded-lg ${styles.inputBg} border ${styles.border} hover:border-indigo-500/50 hover:bg-indigo-500/5 text-left transition-all flex items-center justify-between group">
                        <div>
                            <p class="font-bold ${styles.textPrimary} group-hover:text-indigo-400">${friend.name}</p>
                            <p class="text-xs ${styles.textSecondary}">${friend.email}</p>
                        </div>
                        <i data-lucide="send" class="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" size="16"></i>
                    </button>
                `).join('')}
            </div>
            
            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t ${styles.border}">
                <button onclick="closeModal()" class="flex-1 py-3 rounded-xl border ${styles.border} ${styles.textPrimary} hover:bg-white/5 font-bold transition-all">
                    Hủy
                </button>
            </div>
        </div>
    `;
    
    state.currentModal = 'sharePrompt';
    document.getElementById('modal-content-wrapper').innerHTML = modalContent;
    lucide.createIcons();
}

function sendPromptToFriend(promptId, friendIndex) {
    const user = state.currentUser;
    const friend = user.friends[friendIndex];
    const prompt = state.data.find(p => p.id === promptId);
    
    if (!friend || !prompt) return;
    
    // Create share record
    if (!user.sharedPrompts) user.sharedPrompts = [];
    user.sharedPrompts.push({
        promptId: promptId,
        friendEmail: friend.email,
        sharedAt: new Date().toISOString()
    });
    
    // Save
    localStorage.setItem('pm_currentUser', JSON.stringify(user));
    const users = JSON.parse(localStorage.getItem('pm_users') || '[]');
    const idx = users.findIndex(u => u.email === user.email);
    if (idx !== -1) {
        users[idx] = user;
        localStorage.setItem('pm_users', JSON.stringify(users));
    }
    
    closeModal();
    showToast(`✓ Đã chia sẻ với ${friend.name}!`);
}

function renderShareModal(container) {
    const styles = getStyles();
    const user = state.currentUser;
    
    if (!user.customPrompts || user.customPrompts.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center">
                <div class="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                    <i data-lucide="share-2" size="32"></i>
                </div>
                <h3 class="text-2xl font-bold ${styles.textPrimary} mb-2">Chưa có Prompt để chia sẻ</h3>
                <p class="${styles.textSecondary}">Hãy tạo hoặc thêm Prompt trước khi chia sẻ</p>
            </div>
        `;
        return;
    }
    
    const friends = user.friends || [];
    
    container.innerHTML = `
        <div class="p-6 space-y-6 h-full flex flex-col">
            <div class="text-center">
                <h3 class="text-2xl font-bold ${styles.textPrimary} mb-2">Chia sẻ Prompt</h3>
                <p class="${styles.textSecondary} text-sm">Chọn Prompt để chia sẻ với bạn bè</p>
            </div>
            
            ${friends.length === 0 ? `
                <div class="text-center py-8 ${styles.textSecondary}">
                    <p class="mb-3">Bạn chưa có bạn bè</p>
                    <button onclick="openFriendsModal()" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all">
                        Thêm bạn bè
                    </button>
                </div>
            ` : `
                <!-- Prompts list -->
                <div class="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                    ${user.customPrompts.map((promptId, idx) => {
                        const prompt = state.data.find(p => p.id === promptId);
                        return prompt ? `
                            <button onclick="sharePrompt(${promptId})" class="w-full p-3 rounded-lg ${styles.inputBg} border ${styles.border} hover:border-indigo-500/50 hover:bg-indigo-500/5 text-left transition-all group">
                                <p class="font-bold ${styles.textPrimary} group-hover:text-indigo-400 truncate">${prompt.title}</p>
                                <p class="text-xs ${styles.textSecondary} truncate">${prompt.description || 'Không có mô tả'}</p>
                            </button>
                        ` : '';
                    }).join('')}
                </div>
            `}
            
            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t ${styles.border}">
                <button onclick="closeModal()" class="flex-1 py-3 rounded-xl border ${styles.border} ${styles.textPrimary} hover:bg-white/5 font-bold transition-all">
                    Hủy
                </button>
            </div>
        </div>
    `;
}

// Install Extension Function
function installExtension() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detect browser
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
        // Chrome browser
        showToast('📖 Hướng dẫn cài đặt được hiển thị dưới đây', 'info');
        
        const instructionHTML = `
            <div class="text-center p-8">
                <h3 class="text-2xl font-bold text-indigo-600 mb-6">Cài đặt AI Prompt Refiner Extension</h3>
                
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left rounded">
                    <p class="font-bold text-blue-900 mb-2">📝 Các bước cài đặt:</p>
                    <ol class="list-decimal list-inside text-sm text-blue-800 space-y-2">
                        <li>Mở Chrome và vào: <code class="bg-white px-2 py-1 rounded">chrome://extensions/</code></li>
                        <li>Bật <strong>Developer mode</strong> (toggle góc trên bên phải)</li>
                        <li>Click <strong>"Load unpacked"</strong></li>
                        <li>Chọn thư mục <code class="bg-white px-2 py-1 rounded">extension</code> từ GitHub repo</li>
                        <li>✨ Hoàn thành! Extension sẽ xuất hiện trên toolbar</li>
                    </ol>
                </div>

                <div class="bg-green-50 border-l-4 border-green-500 p-4 text-left rounded">
                    <p class="font-bold text-green-900 mb-2">🚀 Sau khi cài đặt:</p>
                    <ul class="list-disc list-inside text-sm text-green-800 space-y-1">
                        <li>Vào ChatGPT, Gemini, Claude</li>
                        <li>Nhập prompt vào textarea</li>
                        <li>Click nút tím <strong>"Tinh chỉnh"</strong> hoặc nhấn <strong>Ctrl+Shift+R</strong></li>
                        <li>Xem prompt được cải thiện tự động! ✨</li>
                    </ul>
                </div>

                <p class="text-gray-600 text-sm mt-6">
                    👉 Lấy extension từ: 
                    <a href="https://github.com/Thoai900/project-folder--1-" target="_blank" class="text-indigo-600 font-bold hover:underline">GitHub Repository</a>
                </p>
            </div>
        `;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-800"></h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-800">
                        <i data-lucide="x" size="24"></i>
                    </button>
                </div>
                <div class="p-8">
                    ${instructionHTML}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        lucide.createIcons();
    } else if (userAgent.includes('firefox')) {
        showToast('🔜 Firefox support coming soon!', 'warning');
    } else if (userAgent.includes('safari')) {
        showToast('🔜 Safari support coming soon!', 'warning');
    } else {
        showToast('⚠️ Vui lòng sử dụng Chrome để cài đặt extension này!', 'warning');
    }
}

window.onload = () => {
    applyTheme();
    setupShortcuts();
    renderApp();
};