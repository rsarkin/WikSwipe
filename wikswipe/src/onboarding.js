const DOMAINS = ['History', 'Biology', 'Science', 'Space', 'Geo-politics', 'Philosophy', 'Technology', 'Culture'];
const selected = new Set();

export function initOnboarding(onComplete) {
    const obScreen = document.getElementById('onboarding-screen');
    const pillGrid = document.getElementById('interest-pills');
    const btnStart = document.getElementById('btn-start');
    
    // Check if affinityMap exists in local storage
    if (localStorage.getItem('affinityMap')) {
        // Already onboarded
        obScreen.classList.add('hidden');
        onComplete();
        return;
    }

    DOMAINS.forEach(domain => {
        const pill = document.createElement('div');
        pill.className = 'interest-pill';
        pill.textContent = domain;
        pill.addEventListener('click', () => {
            if (selected.has(domain)) {
                selected.delete(domain);
                pill.classList.remove('selected');
            } else {
                selected.add(domain);
                pill.classList.add('selected');
            }
            // Require at least 3 topics
            btnStart.disabled = selected.size < 3;
        });
        pillGrid.appendChild(pill);
    });

    btnStart.addEventListener('click', () => {
        if (selected.size < 3) return;
        
        // Save to localStorage
        const affinityMap = {};
        DOMAINS.forEach(d => {
            // Selected getting a baseline affinity of 2.0, others 0.0
            affinityMap[d] = selected.has(d) ? 2.0 : 0.0;
        });
        localStorage.setItem('affinityMap', JSON.stringify(affinityMap));
        
        obScreen.classList.add('hidden');
        onComplete(); // start main loop
    });
}
