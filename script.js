// 配置信息 - 请修改为你的实际信息
const CONFIG = {
    API_BASE_URL: 'https://your-vercel-app.vercel.app/api', // 替换为你的Vercel应用域名
    VISITOR_ID: 'wang_student_birthday_2024' // 用于标识这次生日访问的唯一ID
};

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initPage();
    recordVisit('page_load');
    createPetals(15);
    
    // 隐藏统计面板的快捷键（Ctrl+Shift+S）
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            showStats();
        }
    });
});

// 初始化页面
function initPage() {
    // 检查本地存储，恢复状态
    const blessingsOpened = localStorage.getItem('blessingsOpened');
    if (blessingsOpened === 'true') {
        showBlessings();
    }
}

// 创建花瓣效果
function createPetals(count) {
    const container = document.querySelector('.petals-container');
    for (let i = 0; i < count; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        petal.style.left = Math.random() * 100 + 'vw';
        petal.style.animationDuration = (Math.random() * 3 + 2) + 's';
        petal.style.animationDelay = Math.random() * 5 + 's';
        petal.style.opacity = Math.random() * 0.5 + 0.3;
        petal.style.width = petal.style.height = (Math.random() * 15 + 10) + 'px';
        container.appendChild(petal);
    }
}

// 切换祝福语显示
function toggleBlessings() {
    const blessings = document.getElementById('detailedBlessings');
    const toggleBtn = document.querySelector('.toggle-btn span');
    
    if (blessings.style.display === 'block') {
        blessings.style.display = 'none';
        toggleBtn.textContent = '展开祝福 ✨';
    } else {
        showBlessings();
    }
}

function showBlessings() {
    const blessings = document.getElementById('detailedBlessings');
    const toggleBtn = document.querySelector('.toggle-btn span');
    
    blessings.style.display = 'block';
    toggleBtn.textContent = '收起祝福 ✨';
    
    // 记录祝福语展开
    recordVisit('blessings_opened');
    localStorage.setItem('blessingsOpened', 'true');
    
    // 添加显示动画
    const items = blessings.querySelectorAll('.blessing-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// 许愿功能
function makeWish() {
    const effect = document.getElementById('wishEffect');
    const btn = document.querySelector('.wish-btn .btn-text');
    
    // 记录许愿
    recordVisit('wish_made');
    
    // 按钮效果
    btn.textContent = '愿望已发送 🌟';
    const btnText = btn.textContent;
    
    // 创建许愿效果
    effect.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.textContent = '✨';
            star.style.fontSize = '2em';
            star.style.animation = `wishFloat ${Math.random() * 1 + 0.5}s ease-in forwards`;
            effect.appendChild(star);
            
            setTimeout(() => star.remove(), 2000);
        }, i * 300);
    }
    
    // 3秒后恢复按钮
    setTimeout(() => {
        btn.textContent = '愿望成真！ 🎉';
    }, 2000);
}

// 添加许愿动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes wishFloat {
        to {
            transform: translateY(-50px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 记录访问数据
async function recordVisit(action = 'page_load') {
    try {
        const visitData = {
            visitorId: CONFIG.VISITOR_ID,
            action: action,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            screenSize: `${screen.width}x${screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/record-visit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(visitData)
        });
        
        if (!response.ok) {
            console.warn('记录访问失败:', response.status);
        }
    } catch (error) {
        console.warn('记录访问出错:', error);
    }
}

// 统计面板功能
async function showStats() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/get-stats?visitorId=${CONFIG.VISITOR_ID}`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('firstVisit').textContent = 
                new Date(data.stats.firstVisit).toLocaleString('zh-CN');
            document.getElementById('lastVisit').textContent = 
                new Date(data.stats.lastVisit).toLocaleString('zh-CN');
            document.getElementById('totalVisits').textContent = data.stats.totalVisits;
            document.getElementById('blessingOpens').textContent = data.stats.blessingOpens;
            document.getElementById('wishCount').textContent = data.stats.wishCount;
            
            document.getElementById('statsPanel').style.display = 'flex';
        }
    } catch (error) {
        console.warn('获取统计失败:', error);
        alert('获取统计信息失败');
    }
}

function hideStats() {
    document.getElementById('statsPanel').style.display = 'none';
}

// 页面卸载时记录离开时间
window.addEventListener('beforeunload', function() {
    recordVisit('page_unload');
});

// 记录页面可见性变化（切换标签页等）
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        recordVisit('page_hidden');
    } else {
        recordVisit('page_visible');
    }
});