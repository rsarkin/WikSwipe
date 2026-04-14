export function getAffinityMap() {
    try {
        const stored = localStorage.getItem('affinityMap');
        if (stored) return JSON.parse(stored);
    } catch(e) {}
    return {};
}

export function saveAffinityMap(map) {
    localStorage.setItem('affinityMap', JSON.stringify(map));
}

export function updateAffinity(domain, scoreDelta) {
    const map = getAffinityMap();
    if (!map[domain]) {
        map[domain] = 0;
    }
    map[domain] += scoreDelta;
    // Keep it within some bounding limit to prevent runaway floats
    map[domain] = Math.max(-5.0, Math.min(map[domain], 10.0));
    saveAffinityMap(map);
}

export function handleSwipeInteraction(article, dir, dwellTimeMs) {
    if (!article || !article.domain) return;
    
    let scoreDelta = 0;
    if (dir > 0) {
        // Right swipe
        scoreDelta = 1.0;
    } else {
        // Left swipe
        if (dwellTimeMs < 1000) {
            scoreDelta = -1.0; // immediate skip penalty
        } else {
            scoreDelta = -0.5; // soft penalty
        }
    }
    
    updateAffinity(article.domain, scoreDelta);
}

export function handleTapInteraction(article) {
    if (!article || !article.domain) return;
    updateAffinity(article.domain, 2.0); // Strongest signal
}
