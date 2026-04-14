import { fetchRandomArticles } from './wikipedia.js';
import { buildCardElement, showToast, updateStreak, toggleLoader } from './ui.js';
import { initOnboarding } from './onboarding.js';
import { handleSwipeInteraction, handleTapInteraction } from './affinity.js';
import { generateStoryCard } from './story.js';

let cardShowTime = Date.now();

let articlesPool = [];
let currentIndex = 0;
let swipedCount = 0;

let dragging = false;
let startX = 0, curX = 0;
let card1, card2, card3;

async function init() {
    card1 = document.getElementById('card1');
    card2 = document.getElementById('card2');
    card3 = document.getElementById('card3');
    
    // Wire up buttons
    document.getElementById('btn-nope').addEventListener('click', swipeLeft);
    document.getElementById('btn-like').addEventListener('click', swipeRight);
    document.getElementById('btn-share').addEventListener('click', () => {
        showToast('Generating story card...');
        generateStoryCard(articlesPool[currentIndex % articlesPool.length]);
    });
    
    initOnboarding(async () => {
        toggleLoader(true);
        await loadMoreArticles();
        toggleLoader(false);
        
        renderCards();
        setupGestures();
    });
}

async function loadMoreArticles() {
    const newArts = await fetchRandomArticles(5);
    articlesPool = articlesPool.concat(newArts);
}

function renderCards() {
    // If running low on articles, fetch more quietly
    if (currentIndex >= articlesPool.length - 2) {
        loadMoreArticles();
    }
    
    // We loop back if we somehow run completely out
    const a1 = articlesPool[currentIndex % articlesPool.length];
    const a2 = articlesPool[(currentIndex + 1) % articlesPool.length];
    const a3 = articlesPool[(currentIndex + 2) % articlesPool.length];
    
    buildCardElement(card1, a1, true);
    buildCardElement(card2, a2, false);
    buildCardElement(card3, a3, false);
    
    // Reset top card — start slightly below then animate up
    card1.style.transition = 'none';
    card1.style.transform = 'translateY(12px)';
    card1.style.opacity = '0';
    
    // Force reflow then animate in
    card1.getBoundingClientRect();
    card1.style.transition = 'transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
    card1.style.transform = '';
    card1.style.opacity = '1';
    
    cardShowTime = Date.now();
}

function animateSwipe(dir) {
    card1.style.transition = 'transform 0.42s cubic-bezier(0.55, 0, 0.85, 0.36), opacity 0.35s ease';
    card1.style.transform = `translateX(${dir * 520}px) rotate(${dir * 18}deg)`;
    card1.style.opacity = '0';
    
    
    const a1 = articlesPool[currentIndex % articlesPool.length];
    const dwellTimeMs = Date.now() - cardShowTime;
    handleSwipeInteraction(a1, dir, dwellTimeMs);

    if (dir > 0) {
        showToast('Saved to interests ♥');
    } else {
        showToast('Skipped');
    }
    
    setTimeout(() => {
        currentIndex++;
        swipedCount++;
        updateStreak(swipedCount);
        renderCards();
    }, 420);
}

function swipeLeft() { animateSwipe(-1); }
function swipeRight() { animateSwipe(1); }

function setupGestures() {
    card1.addEventListener('pointerdown', e => {
        if (e.target.tagName.toLowerCase() === 'a') return; // Ignore links
        dragging = true;
        startX = e.clientX;
        curX = 0;
        // Disable CSS transition during drag so card tracks finger instantly
        card1.style.transition = 'none';
        card1.setPointerCapture(e.pointerId);
    });
    
    card1.addEventListener('pointermove', e => {
        if (!dragging) return;
        curX = e.clientX - startX;
        const rot = curX * 0.08;
        card1.style.transform = `translateX(${curX}px) rotate(${rot}deg)`;
        
        const lh = document.getElementById('hint-like');
        const nh = document.getElementById('hint-nope');
        const threshold = 50;
        
        if (lh && nh) {
            lh.style.opacity = curX > threshold ? Math.min((curX - threshold) / 60, 1) : '0';
            nh.style.opacity = curX < -threshold ? Math.min((-curX - threshold) / 60, 1) : '0';
        }
    });
    
    card1.addEventListener('pointerup', () => {
        if (!dragging) return;
        dragging = false;
        
        const threshold = 100;
        if (curX > threshold) {
            animateSwipe(1);
        } else if (curX < -threshold) {
            animateSwipe(-1);
        } else {
            // Snap back
            card1.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card1.style.transform = '';
            
            const lh = document.getElementById('hint-like');
            const nh = document.getElementById('hint-nope');
            if (lh) lh.style.opacity = '0';
            if (nh) nh.style.opacity = '0';
        }
    });

    document.getElementById('stack').addEventListener('click', (e) => {
        if (e.target.closest('.read-more')) {
            const a1 = articlesPool[currentIndex % articlesPool.length];
            handleTapInteraction(a1);
        }
    });
}

window.addEventListener('DOMContentLoaded', init);
