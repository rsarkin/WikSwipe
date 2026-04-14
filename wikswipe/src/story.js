import html2canvas from 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js';

export async function generateStoryCard(article) {
    if (!article) return;
    
    // Create an off-screen container matching 9:16 ratio
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '0';
    container.style.width = '360px';
    container.style.height = '640px';
    container.style.background = article.thumbnail ? `url('${article.thumbnail}') center/cover` : 'linear-gradient(135deg, #1A1A22, #4DA6FF)';
    container.style.color = '#fff';
    container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'flex-end';
    container.style.borderRadius = '0px'; 
    
    // Add overlay to darken background for text readability
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(26,26,34,0.98) 100%)';
    container.appendChild(overlay);

    const content = document.createElement('div');
    content.style.position = 'relative';
    content.style.padding = '32px';
    content.style.zIndex = '1';
    
    // Title truncate helper for story limits
    const shortSummary = article.summary.length > 250 ? article.summary.substring(0, 247) + '...' : article.summary;

    content.innerHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #4DA6FF; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">${article.domain || 'WIKIPEDIA'}</div>
        <div style="font-size: 32px; font-weight: 800; line-height: 1.1; margin-bottom: 20px;">${article.title}</div>
        <div style="font-size: 16px; color: #D0D0D0; line-height: 1.6; margin-bottom: 30px;">${shortSummary}</div>
        
        <div style="display: flex; align-items: center; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 20px;">
            <div style="font-size: 18px; font-weight: 800;">Wik<span style="color:#4DA6FF;">swipe</span></div>
            <div style="margin-left: auto; font-size: 13px; color: #888; font-weight: 600;">Swipe for knowledge</div>
        </div>
    `;
    container.appendChild(content);
    document.body.appendChild(container);

    try {
        const canvas = await html2canvas(container, {
            scale: 3, // Render out at 1080x1920 for high-quality export
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0f0f14'
        });
        
        document.body.removeChild(container);
        
        canvas.toBlob(async (blob) => {
            if (navigator.share && navigator.canShare) {
                const file = new File([blob], 'wikswipe-story.png', { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'Wikswipe Fact',
                        text: `Learn about ${article.title} on Wikswipe!`,
                        files: [file]
                    });
                    return;
                }
            }
            
            // Fallback download if Web Share API is missing (Desktop)
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wikswipe-${article.title.replace(/\s+/g, '-').toLowerCase()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
        
    } catch (e) {
        console.error("Story creation failed", e);
        document.body.removeChild(container);
    }
}
