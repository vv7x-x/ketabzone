const showToast = (message, type = 'success') => {
    // إنشاء حاوية الإشعارات إذا لم تكن موجودة
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }

    // إنشاء الإشعار نفسه
    const toast = document.createElement('div');
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };

    toast.className = 'toast-notification active';
    toast.style.cssText = `
        background: ${colors[type] || colors.success};
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        font-family: 'Tajawal', sans-serif;
        font-weight: 600;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 280px;
        transform: translateX(-150%);
        transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        pointer-events: auto;
        direction: rtl;
    `;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    toastContainer.appendChild(toast);

    // التحريك للداخل
    setTimeout(() => toast.style.transform = 'translateX(0)', 10);

    // الاختفاء التلقائي
    setTimeout(() => {
        toast.style.transform = 'translateX(-150%)';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
};

window.ketabToast = showToast;
