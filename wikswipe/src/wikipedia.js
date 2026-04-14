export async function fetchRandomArticles(count = 3) {
  const articles = [];
  
  // 1. Get preferred domains from affinityMap
  let preferredDomains = [];
  try {
      const stored = localStorage.getItem('affinityMap');
      if (stored) {
          const map = JSON.parse(stored);
          preferredDomains = Object.keys(map).filter(k => map[k] > 0);
      }
  } catch (e) {
      console.warn("Failed to parse affinityMap");
  }

  const keywords = {
      'History': ['history', 'war', 'century', 'ancient', 'empire'],
      'Biology': ['biology', 'animal', 'plant', 'species', 'family', 'genus'],
      'Science': ['science', 'physics', 'chemistry', 'research', 'mathematics'],
      'Space': ['space', 'astronomy', 'planet', 'galaxy', 'star', 'orbit'],
      'Geo-politics': ['politics', 'government', 'election', 'country', 'state', 'treaty'],
      'Philosophy': ['philosophy', 'thinker', 'theory', 'logic', 'ideology'],
      'Technology': ['technology', 'software', 'computer', 'digital', 'engine'],
      'Culture': ['culture', 'art', 'music', 'literature', 'film', 'festival']
  };

  try {
    for (let i = 0; i < count; i++) {
        let title, extract, thumbnail, url;
        let assignedDomain = "WIKIPEDIA";
        
        // Decide whether to use personalized topic (85%) or random explore (15%)
        const usePersonalized = preferredDomains.length > 0 && Math.random() < 0.85;

        if (usePersonalized) {
            // Pick a random preferred domain
            assignedDomain = preferredDomains[Math.floor(Math.random() * preferredDomains.length)];
            const searchOffset = Math.floor(Math.random() * 50); // randomize search results
            
            const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(assignedDomain)}&gsroffset=${searchOffset}&gsrlimit=10&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=600&exintro=1&explaintext=1&origin=*`;
            const res = await fetch(searchUrl);
            if (!res.ok) { i--; continue; }
            const data = await res.json();
            
            if (!data.query || !data.query.pages) {
                i--; continue;
            }
            
            const pages = Object.values(data.query.pages);
            const page = pages[Math.floor(Math.random() * pages.length)];
            
            if (!page.extract || page.extract.length < 50 || page.title.includes("disambiguation")) {
                i--; continue;
            }
            
            title = page.title;
            extract = page.extract;
            thumbnail = page.thumbnail ? page.thumbnail.source : null;
            url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
            
        } else {
            // Wikipedia Random Summary endpoint
            const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
            if (!res.ok) { i--; continue; }
            const data = await res.json();
            
            if (data.type !== 'standard' || !data.extract) {
                // Retry if we get disambiguation pages or empty pages
                i--;
                continue;
            }
            
            title = data.title;
            extract = data.extract;
            thumbnail = data.thumbnail ? data.thumbnail.source : null;
            url = data.content_urls ? data.content_urls.desktop.page : `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
            
            // Basic classification heuristic for demo
            const summaryLower = extract.toLowerCase();
            for (const [domain, words] of Object.entries(keywords)) {
                if (words.some(w => summaryLower.includes(w))) {
                    assignedDomain = domain;
                    break;
                }
            }
        }

        let aiSummary = extract;
        try {
            const aiRes = await fetch('http://localhost:8787/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ extract: extract })
            });
            if (aiRes.ok) {
                const aiData = await aiRes.json();
                if (aiData.summary) aiSummary = aiData.summary;
            }
        } catch (e) {
            console.log('AI worker offline, falling back to raw extract for demo');
        }

        articles.push({
            title: title,
            summary: aiSummary,
            thumbnail: thumbnail,
            url: url,
            domain: assignedDomain
        });
    }
  } catch (err) {
      console.error("Failed to fetch Wikipedia articles:", err);
  }
  return articles;
}
