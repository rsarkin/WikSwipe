const DOMAIN_COLORS = {
    'History': '#8B5E3C',
    'Biology': '#2D6A4F',
    'Science': '#534AB7',
    'Space': '#1A3A5C',
    'Geo-politics': '#B5451B',
    'Philosophy': '#4A5568',
    'Technology': '#0E7490',
    'Culture': '#9D3572'
};

export function buildCardElement(el, article, isTopCard) {
    if (!el) return;
    
    if (!article) {
        el.innerHTML = '<div class="card-bg">Loading...</div>';
        return;
    }
    
    const domainName = article.domain || 'WIKIPEDIA';
    const accentColor = DOMAIN_COLORS[domainName] || '#7F77DD';
    
    el.style.setProperty('--accent', accentColor);
    
    const bgStyle = article.thumbnail 
        ? `background-image: url('${article.thumbnail}');`
        : `background: linear-gradient(135deg, var(--accent), #1A1A22);`;
        
    el.innerHTML = `
        ${isTopCard ? `
        <div class="swipe-hint hint-like" id="hint-like">LIKE</div>
        <div class="swipe-hint hint-nope" id="hint-nope">NOPE</div>
        ` : ''}
        <div class="card-bg" style="${bgStyle}"></div>
        <div class="card-content">
            <div class="card-domain">${domainName}</div>
            <div class="card-title">${article.title}</div>
            <div class="card-summary">${article.summary}</div>
            <div class="card-footer">
                <a href="${article.url}" target="_blank" class="read-more" style="text-decoration:none;z-index:20;">Read on Wikipedia →</a>
            </div>
        </div>
    `;
}

export function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => {
        t.classList.remove('show');
    }, 2000);
}

export function updateStreak(count) {
    const st = document.getElementById('streak-count');
    if (st) st.textContent = `${count} swiped`;
}

export function toggleLoader(show) {
    const l = document.getElementById('loader');
    if (l) l.style.display = show ? 'block' : 'none';
}
