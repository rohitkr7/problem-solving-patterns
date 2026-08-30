const fs = require('fs');
const path = require('path');

const repoDir = path.resolve(__dirname, '..');
const dataDir = path.join(repoDir, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Map pattern numbers and custom metadata
const patternMetadata = {
  1: { category: 'Core Patterns', icon: '🪟', difficulty: 'Beginner to Intermediate', keyIdea: 'Reuse results of overlapping contiguous sub-arrays/sub-strings' },
  2: { category: 'Core Patterns', icon: '👉👈', difficulty: 'Beginner to Intermediate', keyIdea: 'Iterate with two references from ends or different speeds in sorted structures' },
  3: { category: 'Core Patterns', icon: '🐢🐇', difficulty: 'Beginner to Intermediate', keyIdea: 'Hare & Tortoise pointers moving at 2x & 1x speed to detect cycles & find midpoints' },
  4: { category: 'Core Patterns', icon: '⏱️', difficulty: 'Intermediate', keyIdea: 'Identify and combine overlapping intervals based on start/end times' },
  5: { category: 'Core Patterns', icon: '🔄', difficulty: 'Beginner to Intermediate', keyIdea: 'Place array elements into their natural index [0..n-1] in O(N) time & O(1) space' },
  6: { category: 'Core Patterns', icon: '🔗', difficulty: 'Beginner to Intermediate', keyIdea: 'Reverse linked list node pointers in-place without extra memory allocation' },
  7: { category: 'Core Patterns', icon: '🌲', difficulty: 'Intermediate', keyIdea: 'Traverse trees level-by-level using a FIFO Queue' },
  8: { category: 'Core Patterns', icon: '🌿', difficulty: 'Intermediate', keyIdea: 'Traverse deep down tree branches using recursion or an explicit LIFO Stack' },
  9: { category: 'Core Patterns', icon: '⚖️', difficulty: 'Intermediate to Hard', keyIdea: 'Divide dataset into two halves using a Min-Heap and a Max-Heap (e.g., Running Median)' },
  10: { category: 'Core Patterns', icon: '📦', difficulty: 'Intermediate', keyIdea: 'Generate power sets, subsets, permutations, and combinations' },
  11: { category: 'Core Patterns', icon: '🔍', difficulty: 'Intermediate', keyIdea: 'Binary search with custom boundary logic for rotated, peak, or matrix searches' },
  12: { category: 'Core Patterns', icon: '⚡', difficulty: 'Intermediate', keyIdea: 'Exploit XOR properties (x ^ x = 0, x ^ 0 = x) for missing numbers and single elements' },
  13: { category: 'Core Patterns', icon: '🏆', difficulty: 'Intermediate', keyIdea: 'Use Min-Heap of size K or QuickSelect to find K largest/smallest/frequent items' },
  14: { category: 'Core Patterns', icon: '🔀', difficulty: 'Intermediate to Hard', keyIdea: 'Merge K sorted lists or arrays simultaneously using a Min-Heap' },
  15: { category: 'Core Patterns', icon: '🎒', difficulty: 'Intermediate to Advanced', keyIdea: '0/1, Unbounded, and Subset-Sum Dynamic Programming decision trees' },
  16: { category: 'Core Patterns', icon: '📐', difficulty: 'Intermediate to Advanced', keyIdea: 'Linear ordering of DAG vertices using In-degree tracking (Kahn\'s) or DFS' },
  17: { category: 'Advanced Patterns', icon: '🌳', difficulty: 'Intermediate', keyIdea: 'Prefix tree for high-speed string prefix search and autocomplete' },
  18: { category: 'Advanced Patterns', icon: '🤝', difficulty: 'Intermediate to Hard', keyIdea: 'Disjoint-Set Union (DSU) with path compression & union by rank for graph components' },
  19: { category: 'Advanced Patterns', icon: '📊', difficulty: 'Intermediate to Hard', keyIdea: 'Strictly increasing/decreasing stack for next greater/smaller element queries' },
  20: { category: 'Advanced Patterns', icon: '➕', difficulty: 'Beginner to Intermediate', keyIdea: 'Cumulative sum array allowing O(1) range sum queries and subarray sum targets' },
  21: { category: 'Advanced Patterns', icon: '🏝️', difficulty: 'Intermediate', keyIdea: 'Grid 2D traversal (BFS/DFS) for connected components, flood fill, and perimeter' },
  22: { category: 'Advanced Patterns', icon: '🔙', difficulty: 'Intermediate to Hard', keyIdea: 'Systematic state space exploration with pruning and backtrack state reset' },
  23: { category: 'Advanced Patterns', icon: '🛣️', difficulty: 'Intermediate to Hard', keyIdea: 'Weighted graph shortest path using Dijkstra with PriorityQueue or Bellman-Ford' },
  24: { category: 'Advanced Patterns', icon: '🦅', difficulty: 'Intermediate', keyIdea: 'Locally optimal choice at each step leading to globally optimal solutions' },
  25: { category: 'Advanced Patterns', icon: '0️⃣1️⃣', difficulty: 'Intermediate', keyIdea: 'Bitwise tricks, bitmasks, Brian Kernighan algorithm, and bitwise DP state representation' },
  26: { category: 'Advanced Patterns', icon: '🏗️', difficulty: 'Intermediate to Hard', keyIdea: 'Designing complex composite data structures like LRU Cache, LFU Cache, Trie, and RandomizedSet' }
};

// Find all pattern markdown files
const files = fs.readdirSync(repoDir);
const patternFileRegex = /Pattern\s*0?(\d+)/i;

const patternFiles = files
  .filter(f => f.endsWith('.md') && f.includes('Pattern'))
  .map(f => {
    const match = f.match(patternFileRegex);
    const num = match ? parseInt(match[1], 10) : 999;
    return { filename: f, num };
  })
  .sort((a, b) => a.num - b.num);

console.log(`Found ${patternFiles.length} pattern markdown files.`);

const patterns = [];

patternFiles.forEach(({ filename, num }) => {
  const filePath = path.join(repoDir, filename);
  const rawContent = fs.readFileSync(filePath, 'utf8');

  // Extract clean title from filename or first line
  const lines = rawContent.split('\n');
  let title = `Pattern ${num}`;
  const firstH1 = lines.find(l => l.startsWith('# '));
  if (firstH1) {
    title = firstH1.replace(/^#\s*/, '').trim();
  } else {
    // derive from filename
    title = filename.replace(/^✅\s*/, '').replace(/\.md$/, '').trim();
  }

  // Generate slug
  const cleanTitle = title.replace(/^Pattern\s*\d+\s*:\s*/i, '').replace(/[^\w\s-]/g, '').trim();
  const slug = `pattern-${String(num).padStart(2, '0')}-${cleanTitle.toLowerCase().replace(/\s+/g, '-')}`;

  // Extract problems / subheadings
  const problems = [];
  const headings = [];
  const leetcodeLinks = [];

  const headingRegex = /^(#{2,4})\s+(.+)$/;
  const leetcodeRegex = /https:\/\/leetcode\.com\/problems\/([a-z0-9-]+)/gi;

  let match;
  while ((match = leetcodeRegex.exec(rawContent)) !== null) {
    const url = match[0];
    const problemSlug = match[1];
    const probTitle = problemSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (!leetcodeLinks.some(l => l.url === url)) {
      leetcodeLinks.push({ url, slug: problemSlug, title: probTitle });
    }
  }

  lines.forEach((line, idx) => {
    const hMatch = line.match(headingRegex);
    if (hMatch) {
      const level = hMatch[1].length;
      const text = hMatch[2].replace(/<[^>]*>/g, '').trim();
      const hSlug = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, slug: hSlug, line: idx + 1 });

      // If it looks like a problem (e.g. ### Problem Title or contains (Easy)/(Medium)/(Hard) or LeetCode)
      if (level === 3 || level === 4 || /\((easy|medium|hard)\)/i.test(text)) {
        let diff = 'Medium';
        if (/easy/i.test(text)) diff = 'Easy';
        if (/hard/i.test(text)) diff = 'Hard';

        problems.push({
          title: text,
          difficulty: diff,
          slug: hSlug
        });
      }
    }
  });

  // Extract a 1-2 sentence overview/summary
  let summary = '';
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l && !l.startsWith('#') && !l.startsWith('>') && !l.startsWith('`') && !l.startsWith('|') && !l.startsWith('!')) {
      summary = l.replace(/<[^>]*>/g, '').slice(0, 240);
      if (summary.length >= 240) summary += '...';
      break;
    }
  }

  const meta = patternMetadata[num] || {
    category: num <= 16 ? 'Core Patterns' : 'Advanced Patterns',
    icon: '💡',
    difficulty: 'Intermediate',
    keyIdea: 'Systematic algorithmic optimization technique'
  };

  patterns.push({
    id: num,
    num: num,
    title: title,
    cleanTitle: cleanTitle || title,
    slug: slug,
    filename: filename,
    category: meta.category,
    icon: meta.icon,
    difficulty: meta.difficulty,
    keyIdea: meta.keyIdea,
    summary: summary || meta.keyIdea,
    problemCount: Math.max(problems.length, leetcodeLinks.length, 3),
    problems: problems,
    leetcodeLinks: leetcodeLinks,
    headings: headings,
    content: rawContent
  });
});

// Read README.md for the landing page introduction
let readmeContent = '';
const readmePath = path.join(repoDir, 'README.md');
if (fs.existsSync(readmePath)) {
  readmeContent = fs.readFileSync(readmePath, 'utf8');
}

const dataset = {
  totalPatterns: patterns.length,
  totalCategories: 2,
  generatedAt: new Date().toISOString(),
  categories: ['Core Patterns', 'Advanced Patterns'],
  patterns: patterns,
  readme: readmeContent
};

// Write patterns.json
fs.writeFileSync(path.join(dataDir, 'patterns.json'), JSON.stringify(dataset, null, 2), 'utf8');
console.log(`Saved data/patterns.json (${patterns.length} patterns)`);

// Write patterns-data.js (for direct script tag loading without fetch/CORS requirements)
const jsContent = `/** Generated automatically by scripts/generate-data.js */
window.PATTERNS_DATA = ${JSON.stringify(dataset)};
`;
fs.writeFileSync(path.join(dataDir, 'patterns-data.js'), jsContent, 'utf8');
console.log(`Saved data/patterns-data.js`);
