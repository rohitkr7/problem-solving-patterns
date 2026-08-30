/**
 * Problem Solving Patterns - Interactive GitHub Pages Application
 * Developed for Rohit Roy's DSA Portfolio
 */

(function () {
  'use strict';

  // State
  let patternsData = null;
  let currentPattern = null;
  let masteredPatterns = new Set();
  let searchSelectedIdx = 0;
  let searchResults = [];

  // DOM Elements Cache
  const elements = {
    themeToggle: document.getElementById('themeToggle'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebar: document.getElementById('sidebar'),
    sidebarNav: document.getElementById('sidebarNav'),
    filterInput: document.getElementById('patternFilterInput'),
    progressFill: document.getElementById('progressFill'),
    progressCount: document.getElementById('progressCount'),
    mainContent: document.getElementById('mainContent'),
    tocList: document.getElementById('tocList'),
    tocContainer: document.getElementById('tocContainer'),
    searchTrigger: document.getElementById('searchTrigger'),
    searchModalBackdrop: document.getElementById('searchModalBackdrop'),
    searchInput: document.getElementById('searchInput'),
    searchResultsList: document.getElementById('searchResultsList'),
  };

  // Initialize
  async function init() {
    loadTheme();
    loadMasteryState();
    await loadData();
    setupEventListeners();
    setupRouting();
  }

  // Theme Management
  function loadTheme() {
    const savedTheme = localStorage.getItem('dsa_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dsa_theme', next);
  }

  // Mastery Progress (localStorage)
  function loadMasteryState() {
    try {
      const stored = localStorage.getItem('dsa_mastered_patterns');
      if (stored) {
        masteredPatterns = new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load mastery state', e);
    }
  }

  function toggleMastery(patternId) {
    if (masteredPatterns.has(patternId)) {
      masteredPatterns.delete(patternId);
    } else {
      masteredPatterns.add(patternId);
    }
    try {
      localStorage.setItem('dsa_mastered_patterns', JSON.stringify([...masteredPatterns]));
    } catch (e) {}

    updateProgressUI();
    updateSidebarMastery();
    updateHeroMasteryBtn();
  }

  function updateProgressUI() {
    if (!patternsData) return;
    const total = patternsData.patterns.length;
    const completed = masteredPatterns.size;
    const pct = Math.round((completed / total) * 100);

    if (elements.progressCount) {
      elements.progressCount.textContent = `${completed} / ${total} (${pct}%)`;
    }
    if (elements.progressFill) {
      elements.progressFill.style.width = `${pct}%`;
    }
  }

  function updateSidebarMastery() {
    document.querySelectorAll('.pattern-nav-item').forEach(item => {
      const id = parseInt(item.dataset.id, 10);
      if (masteredPatterns.has(id)) {
        item.classList.add('mastered');
      } else {
        item.classList.remove('mastered');
      }
    });
  }

  function updateHeroMasteryBtn() {
    const btn = document.getElementById('masteryBtn');
    if (!btn || !currentPattern) return;
    const isMastered = masteredPatterns.has(currentPattern.id);
    if (isMastered) {
      btn.classList.add('active');
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Mastered
      `;
    } else {
      btn.classList.remove('active');
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
        Mark as Mastered
      `;
    }
  }

  // Load Data
  async function loadData() {
    if (window.PATTERNS_DATA) {
      patternsData = window.PATTERNS_DATA;
    } else {
      try {
        const res = await fetch('data/patterns.json');
        patternsData = await res.json();
      } catch (err) {
        console.error('Could not load patterns data:', err);
        elements.mainContent.innerHTML = `<div class="p-8 text-center text-red-400">Failed to load patterns data. Please check data/patterns.json.</div>`;
        return;
      }
    }

    renderSidebarNav();
    updateProgressUI();
  }

  // Render Sidebar
  function renderSidebarNav() {
    if (!patternsData || !elements.sidebarNav) return;

    const corePatterns = patternsData.patterns.filter(p => p.category === 'Core Patterns');
    const advancedPatterns = patternsData.patterns.filter(p => p.category === 'Advanced Patterns');

    let html = `
      <div class="pattern-nav-item" data-slug="home">
        <a href="#home" class="pattern-nav-link">
          <span class="nav-num-badge">🏠</span>
          <span class="nav-item-title">Overview & CheatSheet</span>
        </a>
      </div>
      
      <div class="nav-group-title">Core Patterns (1–16)</div>
      <ul class="pattern-nav-list">
        ${corePatterns.map(p => createNavItemHtml(p)).join('')}
      </ul>

      <div class="nav-group-title">Advanced Patterns (17–26)</div>
      <ul class="pattern-nav-list">
        ${advancedPatterns.map(p => createNavItemHtml(p)).join('')}
      </ul>
    `;

    elements.sidebarNav.innerHTML = html;
    updateSidebarMastery();
  }

  function createNavItemHtml(p) {
    const isMastered = masteredPatterns.has(p.id) ? 'mastered' : '';
    const numStr = String(p.num).padStart(2, '0');
    return `
      <li class="pattern-nav-item ${isMastered}" data-id="${p.id}" data-slug="${p.slug}" data-title="${p.title.toLowerCase()}">
        <a href="#${p.slug}" class="pattern-nav-link" title="${p.title}">
          <span class="nav-num-badge">${numStr}</span>
          <span class="nav-item-title">${p.cleanTitle}</span>
          <svg class="nav-check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </a>
      </li>
    `;
  }

  // Routing
  function setupRouting() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  function handleRoute() {
    const hash = window.location.hash.replace(/^#/, '').trim();
    if (!patternsData) return;

    // Mobile sidebar close on route change
    if (elements.sidebar) {
      elements.sidebar.classList.remove('open');
    }

    if (!hash || hash === 'home') {
      currentPattern = null;
      renderLandingPage();
      highlightActiveNavItem('home');
      if (elements.tocContainer) elements.tocContainer.style.display = 'none';
      return;
    }

    const pattern = patternsData.patterns.find(p => p.slug === hash || `pattern-${p.num}` === hash);
    if (pattern) {
      currentPattern = pattern;
      renderPattern(pattern);
      highlightActiveNavItem(pattern.slug);
      if (elements.tocContainer) elements.tocContainer.style.display = 'block';
    } else {
      renderLandingPage();
      highlightActiveNavItem('home');
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function highlightActiveNavItem(slug) {
    document.querySelectorAll('.pattern-nav-item').forEach(item => {
      if (item.dataset.slug === slug) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Render Landing Page
  function renderLandingPage() {
    const total = patternsData.patterns.length;
    const completed = masteredPatterns.size;

    let html = `
      <div class="pattern-hero">
        <div class="hero-meta-bar">
          <div class="hero-tags">
            <span class="badge badge-core">26 Essential Patterns</span>
            <span class="badge badge-difficulty">DSA & System Design</span>
            <span class="badge badge-advanced">Interview Master Guide</span>
          </div>
        </div>
        <h1 class="hero-title">Coding Interview Problem Solving Patterns</h1>
        <p class="hero-keyidea">
          A comprehensive, structured reference guide covering the 26 core algorithmic patterns required for top-tier technical interviews. Master each pattern once to solve hundreds of LeetCode problems intuitively.
        </p>
      </div>

      <div class="landing-sections">
        <h2 style="font-size: 1.35rem; font-weight: 700; margin: 2rem 0 1rem; color: var(--text-primary);">
          Core Patterns (1 – 16)
        </h2>
        <div class="landing-grid">
          ${patternsData.patterns.filter(p => p.category === 'Core Patterns').map(p => createCardHtml(p)).join('')}
        </div>

        <h2 style="font-size: 1.35rem; font-weight: 700; margin: 3rem 0 1rem; color: var(--text-primary);">
          Advanced Patterns (17 – 26)
        </h2>
        <div class="landing-grid">
          ${patternsData.patterns.filter(p => p.category === 'Advanced Patterns').map(p => createCardHtml(p)).join('')}
        </div>
      </div>
    `;

    elements.mainContent.innerHTML = html;
  }

  function createCardHtml(p) {
    const isMastered = masteredPatterns.has(p.id);
    return `
      <a href="#${p.slug}" class="pattern-card">
        <div class="card-top">
          <span class="card-icon">${p.icon}</span>
          <span class="card-num">P-${String(p.num).padStart(2, '0')}</span>
        </div>
        <div class="card-title">${p.cleanTitle}</div>
        <div class="card-idea">${p.keyIdea}</div>
        <div class="card-footer">
          <span>${p.difficulty}</span>
          <span>${isMastered ? '<b style="color:var(--accent-emerald);">✓ Mastered</b>' : 'Read Guide →'}</span>
        </div>
      </a>
    `;
  }

  // Render Pattern
  function renderPattern(p) {
    const prevPattern = patternsData.patterns.find(item => item.num === p.num - 1);
    const nextPattern = patternsData.patterns.find(item => item.num === p.num + 1);

    const badgeClass = p.category === 'Core Patterns' ? 'badge-core' : 'badge-advanced';

    // Parse markdown content
    let rawContent = p.content;

    // Clean up top H1 from rawContent to avoid repeating the hero title
    rawContent = rawContent.replace(/^#\s+[^\n]+\n+/, '');

    // Configure Marked.js options
    marked.setOptions({
      gfm: true,
      breaks: false,
      headerIds: true,
      mangle: false,
    });

    const parsedHtml = marked.parse(rawContent);

    let heroHtml = `
      <div class="pattern-hero">
        <div class="hero-meta-bar">
          <div class="hero-tags">
            <span class="badge ${badgeClass}">${p.category}</span>
            <span class="badge badge-difficulty">${p.difficulty}</span>
            <span class="badge" style="background:var(--bg-surface); color:var(--text-secondary); border:1px solid var(--border-color)">
              ${p.icon} Pattern ${p.num} of 26
            </span>
          </div>
          <div class="hero-actions">
            <button id="masteryBtn" class="mastered-btn" onclick="window.toggleMastery(${p.id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
              Mark as Mastered
            </button>
          </div>
        </div>
        <h1 class="hero-title">${p.cleanTitle}</h1>
        <p class="hero-keyidea"><strong>Key Strategy:</strong> ${p.keyIdea}</p>
      </div>
    `;

    let pagerHtml = `
      <div class="pattern-pager">
        ${
          prevPattern
            ? `<a href="#${prevPattern.slug}" class="pager-btn prev">
                <span class="pager-label">← Previous Pattern</span>
                <span class="pager-title">${prevPattern.num}. ${prevPattern.cleanTitle}</span>
              </a>`
            : `<div></div>`
        }
        ${
          nextPattern
            ? `<a href="#${nextPattern.slug}" class="pager-btn next">
                <span class="pager-label">Next Pattern →</span>
                <span class="pager-title">${nextPattern.num}. ${nextPattern.cleanTitle}</span>
              </a>`
            : `<div></div>`
        }
      </div>
    `;

    elements.mainContent.innerHTML = heroHtml + `<div class="markdown-body" id="markdownBody">${parsedHtml}</div>` + pagerHtml;

    updateHeroMasteryBtn();
    postProcessMarkdown();
    buildTableOfContents(p);
  }

  // Post process Markdown (Code blocks, copy buttons, syntax highlighting, Prism)
  function postProcessMarkdown() {
    const md = document.getElementById('markdownBody');
    if (!md) return;

    // Enhance code blocks
    const preBlocks = md.querySelectorAll('pre');
    preBlocks.forEach((pre, index) => {
      const code = pre.querySelector('code');
      if (!code) return;

      const langMatch = (code.className || '').match(/language-([a-zA-Z0-9_-]+)/);
      const lang = langMatch ? langMatch[1] : 'java';

      if (!code.className) {
        code.className = `language-${lang}`;
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      const header = document.createElement('div');
      header.className = 'code-header';
      header.innerHTML = `
        <span class="code-lang-tag">${lang}</span>
        <div class="code-actions">
          <button class="code-copy-btn" data-index="${index}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy
          </button>
        </div>
      `;

      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);

      const copyBtn = header.querySelector('.code-copy-btn');
      copyBtn.addEventListener('click', async () => {
        const text = code.innerText;
        try {
          await navigator.clipboard.writeText(text);
          copyBtn.classList.add('copied');
          copyBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Copied!
          `;
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy
            `;
          }, 2000);
        } catch (e) {
          console.error('Copy failed', e);
        }
      });
    });

    // Fix image paths
    const images = md.querySelectorAll('images, img');
    images.forEach(img => {
      let src = img.getAttribute('src') || '';
      // Ensure relative paths like ./images/xyz.png or images/xyz.png load smoothly
      if (src.startsWith('./images/')) {
        img.src = src.replace('./images/', 'images/');
      }
      img.loading = 'lazy';
    });

    // Run Prism Syntax Highlighting
    if (window.Prism) {
      Prism.highlightAllUnder(md);
    }
  }

  // Build Table of Contents
  function buildTableOfContents(p) {
    if (!elements.tocList) return;
    const md = document.getElementById('markdownBody');
    if (!md) return;

    const headings = md.querySelectorAll('h2, h3');
    if (headings.length === 0) {
      if (elements.tocContainer) elements.tocContainer.style.display = 'none';
      return;
    }

    if (elements.tocContainer) elements.tocContainer.style.display = 'block';

    let html = '';
    headings.forEach((h, idx) => {
      let id = h.id;
      if (!id) {
        id = `heading-${idx}-${h.innerText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`;
        h.id = id;
      }
      const levelClass = h.tagName.toLowerCase() === 'h3' ? 'h3' : 'h2';
      html += `
        <li class="toc-item ${levelClass}">
          <a href="#${id}" data-target="${id}">${h.innerText}</a>
        </li>
      `;
    });

    elements.tocList.innerHTML = html;

    // Smooth scroll for TOC links
    elements.tocList.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = a.getAttribute('data-target');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', `#${currentPattern.slug}`);
        }
      });
    });

    setupScrollSpy();
  }

  // ScrollSpy for TOC
  function setupScrollSpy() {
    const headings = document.querySelectorAll('#markdownBody h2, #markdownBody h3');
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            document.querySelectorAll('.toc-item').forEach(item => {
              const link = item.querySelector('a');
              if (link && link.getAttribute('data-target') === id) {
                item.classList.add('active');
              } else {
                item.classList.remove('active');
              }
            });
          }
        });
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach(h => observer.observe(h));
  }

  // Search Engine
  function openSearchModal() {
    elements.searchModalBackdrop.classList.add('open');
    elements.searchInput.value = '';
    elements.searchInput.focus();
    executeSearch('');
  }

  function closeSearchModal() {
    elements.searchModalBackdrop.classList.remove('open');
  }

  function executeSearch(query) {
    if (!patternsData) return;
    query = query.trim().toLowerCase();

    if (!query) {
      // Default top suggestions
      searchResults = patternsData.patterns.slice(0, 8).map(p => ({
        pattern: p,
        title: p.cleanTitle,
        snippet: p.keyIdea,
        type: 'Pattern'
      }));
    } else {
      searchResults = [];
      patternsData.patterns.forEach(p => {
        let score = 0;
        let snippet = p.keyIdea;

        if (p.cleanTitle.toLowerCase().includes(query)) score += 10;
        if (p.keyIdea.toLowerCase().includes(query)) score += 5;

        // Check problem titles
        p.problems.forEach(prob => {
          if (prob.title.toLowerCase().includes(query)) {
            score += 8;
            snippet = `Problem: ${prob.title}`;
          }
        });

        // Check content
        if (p.content.toLowerCase().includes(query)) score += 2;

        if (score > 0) {
          searchResults.push({
            pattern: p,
            title: `Pattern ${p.num}: ${p.cleanTitle}`,
            snippet: snippet,
            type: p.category,
            score: score
          });
        }
      });

      searchResults.sort((a, b) => b.score - a.score);
    }

    searchSelectedIdx = 0;
    renderSearchResults();
  }

  function renderSearchResults() {
    if (searchResults.length === 0) {
      elements.searchResultsList.innerHTML = `<div class="search-empty">No matching patterns or problems found.</div>`;
      return;
    }

    let html = searchResults.map((item, idx) => {
      const isSelected = idx === searchSelectedIdx ? 'selected' : '';
      return `
        <li class="search-result-item ${isSelected}" data-index="${idx}">
          <span class="search-result-icon">${item.pattern.icon}</span>
          <div class="search-result-info">
            <div class="search-result-title">${item.title}</div>
            <div class="search-result-snippet">${item.snippet}</div>
          </div>
          <span class="badge ${item.pattern.category === 'Core Patterns' ? 'badge-core' : 'badge-advanced'}" style="font-size:0.7rem;">${item.pattern.category}</span>
        </li>
      `;
    }).join('');

    elements.searchResultsList.innerHTML = html;

    // Click handler for results
    elements.searchResultsList.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index, 10);
        selectSearchResult(idx);
      });
    });
  }

  function selectSearchResult(idx) {
    if (!searchResults[idx]) return;
    const targetPattern = searchResults[idx].pattern;
    closeSearchModal();
    window.location.hash = targetPattern.slug;
  }

  // Filter input in sidebar
  function handleSidebarFilter(e) {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.pattern-nav-item[data-id]').forEach(item => {
      const title = item.dataset.title || '';
      if (title.includes(q) || !q) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Theme toggle
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // Sidebar drawer toggle (Mobile)
    if (elements.sidebarToggle && elements.sidebar) {
      elements.sidebarToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('open');
      });
    }

    // Sidebar filter
    if (elements.filterInput) {
      elements.filterInput.addEventListener('input', handleSidebarFilter);
    }

    // Global Search Triggers
    if (elements.searchTrigger) {
      elements.searchTrigger.addEventListener('click', openSearchModal);
    }

    if (elements.searchModalBackdrop) {
      elements.searchModalBackdrop.addEventListener('click', (e) => {
        if (e.target === elements.searchModalBackdrop) closeSearchModal();
      });
    }

    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        executeSearch(e.target.value);
      });

      elements.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (searchSelectedIdx < searchResults.length - 1) {
            searchSelectedIdx++;
            renderSearchResults();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (searchSelectedIdx > 0) {
            searchSelectedIdx--;
            renderSearchResults();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          selectSearchResult(searchSelectedIdx);
        } else if (e.key === 'Escape') {
          closeSearchModal();
        }
      });
    }

    // Keyboard Shortcuts (Cmd+K / Ctrl+K / /)
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearchModal();
      } else if (e.key === '/' && document.activeElement !== elements.searchInput && document.activeElement !== elements.filterInput) {
        e.preventDefault();
        openSearchModal();
      } else if (e.key === 'Escape' && elements.searchModalBackdrop.classList.contains('open')) {
        closeSearchModal();
      }
    });

    // Expose toggleMastery globally for inline button calls
    window.toggleMastery = toggleMastery;
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
