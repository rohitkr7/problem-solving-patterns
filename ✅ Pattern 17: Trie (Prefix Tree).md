# Pattern 17: Trie (Prefix Tree)

A <b>Trie</b> (pronounced "try", from re<b>trie</b>val, also called a <b>Prefix Tree</b>) is a tree where each <i>edge</i> represents a single character and each <i>node</i> represents the prefix formed by the characters on the path from the root down to it. The root itself holds no character — it represents the empty prefix `""`.

The whole point of the structure is that <b>words sharing a prefix share the same path</b>. Storing `car`, `card`, and `care` costs us five nodes, not twelve, because `c → a → r` is walked once and only the tails branch. That sharing is what turns "check this prefix against every word in the dictionary" into "walk `M` pointers", where `M` is the length of the prefix — completely independent of how many words the dictionary holds.

Reach for this pattern when the problem talks about <i>prefixes</i>, <i>a dictionary of words that gets queried many times</i>, or <i>autocomplete</i>. The tell-tale signs are:
- We need `startsWith`/prefix lookups, not just exact membership. A <b>HashSet</b> gives us `O(1)` exact lookups but knows nothing about prefixes; a <b>Trie</b> gives us both.
- The same set of words is queried repeatedly. We pay `O(total characters)` once to build the trie, then every query is `O(M)`.
- We are searching a large space (a grid, a stream, a sentence) against a word list and want to <b>prune early</b>. This is the killer use-case: the moment the trie has no child for the next character, no word in the entire dictionary can continue this way, so we abandon the branch immediately. <b>[Word Search II](#word-search-ii-hard)</b> below lives or dies on this.

There are two common ways to store a node's children:
1. A <b>HashMap</b> (`Map`) from character to child node. Flexible, works for any alphabet, and uses only as much space as there are actual branches.
2. A <b>fixed-size array</b> of length `26` indexed by `charCode - 'a'.charCode`. Slightly faster and cache-friendlier, but wastes `26` slots per node when the branching is sparse.

We will use the `Map` flavour for most problems here since it reads more clearly, and show the array flavour once for comparison.

Every node also needs a flag — conventionally `isWord` (or `isEndOfWord`) — to distinguish "this prefix exists in the trie" from "this exact word was inserted". Without it, inserting `apple` would make `search("app")` wrongly return `true`. This one boolean is the single most commonly forgotten piece of the template, so let's start there.

Let's see this pattern in action.

## Implement Trie (Prefix Tree) (medium)
https://leetcode.com/problems/implement-trie-prefix-tree/
> A <b>trie</b> (pronounced as "try") or <b>prefix tree</b> is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the `Trie` class:
>
> - `Trie()` initializes the trie object.
> - `insert(word)` inserts the string `word` into the trie.
> - `search(word)` returns `true` if the string `word` is in the trie (i.e., was inserted before), and `false` otherwise.
> - `startsWith(prefix)` returns `true` if there is a previously inserted string `word` that has the prefix `prefix`, and `false` otherwise.

This is the <b>core template</b> for the whole pattern — every problem below is a variation on these three methods, so it is worth internalizing.

All three operations are the same walk: start at the `root` and consume the input string one character at a time, stepping into `current.children.get(char)` at each step. The only differences are what we do when a character is <i>missing</i> and what we do when we <i>run out</i> of characters:

1. <b>`insert`</b> — when a character is missing, <i>create</i> the child. When we run out of characters, we are standing on the node representing the full word, so set `isWord = true`.
2. <b>`search`</b> — when a character is missing, the word was never inserted, so return `false`. When we run out of characters, the path exists, but that is not enough — return `node.isWord`, because a word must actually <i>terminate</i> here.
3. <b>`startsWith`</b> — identical to `search`, except that when we run out of characters we return `true` unconditionally. Existing path <i>is</i> the answer; we do not care whether a word ends there.

Since `search` and `startsWith` share the entire walk, we factor it into a private `findNode(prefix)` helper that returns the node we landed on or `null` if the path broke. `search` then adds the `isWord` check on top and `startsWith` does not — which makes the one-boolean difference between them explicit in the code.

````js
class TrieNode {
  constructor() {
    //children of the current node, keyed by the character
    this.children = new Map();
    //true if a word ends exactly at this node
    this.isWord = false;
  }
}

class Trie {
  constructor() {
    //the root is an empty node, it does not hold any character
    this.root = new TrieNode();
  }

  insert(word) {
    let current = this.root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      //if the character is missing, create the branch for it
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      //walk one level down
      current = current.children.get(char);
    }
    //mark the last node as the end of a word
    current.isWord = true;
  }

  //walk the trie following the characters of the prefix
  //return the node we land on, or null if the path breaks
  findNode(prefix) {
    let current = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      if (!current.children.has(char)) {
        return null;
      }
      current = current.children.get(char);
    }
    return current;
  }

  search(word) {
    const node = this.findNode(word);
    //the path must exist AND a word must end there
    return node !== null && node.isWord;
  }

  startsWith(prefix) {
    //the path only needs to exist
    return this.findNode(prefix) !== null;
  }
}

const trie = new Trie();
trie.insert('apple');
console.log(`search('apple'): ${trie.search('apple')}`);
//search('apple'): true
console.log(`search('app'): ${trie.search('app')}`);
//search('app'): false
//'app' is only a prefix of 'apple', no word ends there yet
console.log(`startsWith('app'): ${trie.startsWith('app')}`);
//startsWith('app'): true
trie.insert('app');
console.log(`search('app'): ${trie.search('app')}`);
//search('app'): true
//now a word does end at 'app'
console.log(`startsWith('apricot'): ${trie.startsWith('apricot')}`);
//startsWith('apricot'): false
````
- The <b>time complexity</b> of `insert`, `search`, and `startsWith` is `O(M)`, where `M` is the length of the string being inserted or queried. Notice what is <i>absent</i> from that bound: the number of words already in the trie. Each operation is a single walk down at most `M` levels, and each step is an `O(1)` <b>HashMap</b> lookup.
- The <b>space complexity</b> of the trie is `O(N * M)` in the worst case, where `N` is the number of inserted words and `M` is their average length. This is the worst case where no two words share a single character. In practice, the more prefixes the words share, the fewer nodes we allocate — which is exactly the trade the structure is built to win.

### Similar Problems
> 🌟 Implement the same trie using a fixed-size array of children instead of a <b>HashMap</b>.

<b>Solution:</b> When the alphabet is small and fixed — the classic "`word` consists only of lowercase English letters" constraint — swap `this.children = new Map()` for `new Array(26).fill(null)` and index it with `word.charCodeAt(i) - 'a'.charCodeAt(0)`, letting `null` in a slot play the role that a missing key played before. Every operation stays `O(M)`, since array indexing and hashing are both `O(1)`, but the space becomes `O(26 * N * M)` because each node now pays for `26` slots whether it branches or not. Worth it when the branching is dense, wasteful when it is sparse.

## Design Add and Search Words Data Structure (medium)
https://leetcode.com/problems/design-add-and-search-words-data-structure/
> Design a data structure that supports adding new words and finding if a string matches any previously added string. Implement the `WordDictionary` class:
>
> - `WordDictionary()` initializes the object.
> - `addWord(word)` adds `word` to the data structure, it can be matched later.
> - `search(word)` returns `true` if there is any string in the data structure that matches `word` or `false` otherwise. `word` may contain dots `.` where dots can be matched with any letter.

This problem follows the <b>[Implement Trie (Prefix Tree)](#implement-trie-prefix-tree-medium)</b> pattern. `addWord` is the `insert` method verbatim — the wildcard only ever appears in queries, never in the stored words, so the trie we build is completely ordinary.

`search` is where things change. In the base template, each character had exactly <i>one</i> possible next node, which is why the walk could be a simple `for` loop. A `.` matches <i>any</i> single letter, so at that position the walk splits into as many branches as the current node has children, and we have no way to know in advance which one leads to a match. Whenever a walk can fan out like that, the iterative loop has to become a <b>recursive DFS with backtracking</b>.

So we write `searchInNode(word, index, node)`, tracking how far into the pattern we have consumed:

1. <b>Base case</b> — `index === word.length` means the pattern is fully consumed. Return `node.isWord`, exactly as the base template's `search` did. The <i>path</i> existing is not sufficient; a word must terminate here.
2. <b>Wildcard</b> — if the character is `.`, loop over <i>every</i> child and recurse into it with `index + 1`. If any recursive call returns `true`, we have found a match and can short-circuit out. If the loop finishes without a hit, none of the children could complete the pattern, so return `false`. That "return `false` only after exhausting all children" is the backtracking.
3. <b>Concrete character</b> — there is only one candidate path. If the child is missing, return `false`; otherwise recurse into it.

Note that the recursion is doing the work a stack would do explicitly, which is where our space cost comes from.

````js
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isWord = false;
  }
}

class WordDictionary {
  constructor() {
    this.root = new TrieNode();
  }

  addWord(word) {
    let current = this.root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
    }
    current.isWord = true;
  }

  search(word) {
    return this.searchInNode(word, 0, this.root);
  }

  searchInNode(word, index, node) {
    //we consumed the whole pattern, this is a match
    //only if a word actually ends at this node
    if (index === word.length) {
      return node.isWord;
    }

    const char = word[index];

    //a '.' can match any single child, so we branch out
    if (char === '.') {
      for (const child of node.children.values()) {
        if (this.searchInNode(word, index + 1, child)) {
          return true;
        }
      }
      //none of the children could complete the pattern
      return false;
    }

    //a concrete character has only one possible path
    if (!node.children.has(char)) {
      return false;
    }
    return this.searchInNode(word, index + 1, node.children.get(char));
  }
}

const wordDictionary = new WordDictionary();
wordDictionary.addWord('bad');
wordDictionary.addWord('dad');
wordDictionary.addWord('mad');
console.log(`search('pad'): ${wordDictionary.search('pad')}`);
//search('pad'): false
console.log(`search('bad'): ${wordDictionary.search('bad')}`);
//search('bad'): true
console.log(`search('.ad'): ${wordDictionary.search('.ad')}`);
//search('.ad'): true
//the '.' matches 'b', 'd', or 'm'
console.log(`search('b..'): ${wordDictionary.search('b..')}`);
//search('b..'): true
console.log(`search('b.'): ${wordDictionary.search('b.')}`);
//search('b.'): false
//'ba' is a prefix but no two-letter word was ever added
console.log(`search('...'): ${wordDictionary.search('...')}`);
//search('...'): true
````
- The <b>time complexity</b> of `addWord` is `O(M)`, where `M` is the length of the word. For `search`, if the pattern contains no dots the complexity is also `O(M)` since the walk never branches. In the worst case — a pattern of all dots — we may have to explore every path in the trie, giving `O(26^M)` for a `26`-letter alphabet, or more usefully `O(N * M)`, where `N` is the number of added words, since the trie cannot contain more than `N * M` nodes to visit.
- The <b>space complexity</b> is `O(N * M)` for the trie itself, plus `O(M)` for the <b>recursion</b> stack, since the depth of the recursion is bounded by the length of the search pattern.

## Longest Common Prefix (easy)
https://leetcode.com/problems/longest-common-prefix/
> Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string `""`.

Let's be honest up front: a plain <i>vertical scan</i> — compare `strs[0][i]` against every other word's `i`-th character and stop at the first disagreement — solves this in `O(S)` time and `O(1)` space, where `S` is the total number of characters. That is the better answer in an interview if you are asked for one solution and one only.

The <b>Trie</b> approach is worth knowing anyway, because it makes the <i>structure</i> of the answer visible and because it generalizes in a way the scan does not: once the trie is built you can answer the longest-common-prefix question for <i>any</i> subset of words, or serve repeated queries, without re-scanning.

Here is the insight. Insert every word into a trie and look at the shape near the root. As long as a node has exactly <b>one child</b>, every single word in the input must pass through that one child — so that character is part of the common prefix. The moment a node has <b>two or more children</b>, the words disagree there and the prefix ends.

There is a second, easier-to-miss stopping condition: a node where `isWord` is `true`. If one of the input words <i>ends</i> at this node, the common prefix cannot possibly be longer than that word. For `["ab", "a"]` the node for `a` has one child (`b`) but is also the end of the word `a`, so we must stop and return `"a"`, not `"ab"`. Forgetting the `!current.isWord` guard in the `while` condition is the classic bug in this solution.

So: walk down from the root while `children.size === 1 && !isWord`, collecting characters as we go. We also guard the input up front — an empty array, or any empty string in the array, means the answer is `""`.

````js
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isWord = false;
  }
}

function longestCommonPrefix(strs) {
  if (strs === null || strs.length === 0) {
    return '';
  }

  //an empty string can never share a prefix with anything
  for (let i = 0; i < strs.length; i++) {
    if (strs[i].length === 0) {
      return '';
    }
  }

  //1. insert every word into the trie
  const root = new TrieNode();
  strs.forEach((word) => {
    let current = root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
    }
    current.isWord = true;
  });

  //2. walk down from the root while there is exactly one child
  //and no word has ended yet, that chain of single children
  //is the longest common prefix
  const prefix = [];
  let current = root;
  while (current.children.size === 1 && !current.isWord) {
    const [char, child] = current.children.entries().next().value;
    prefix.push(char);
    current = child;
  }

  return prefix.join('');
}

console.log(`Longest common prefix: "${longestCommonPrefix(['flower', 'flow', 'flight'])}"`);
//Longest common prefix: "fl"
console.log(`Longest common prefix: "${longestCommonPrefix(['dog', 'racecar', 'car'])}"`);
//Longest common prefix: ""
//the root already has three children, so there is no common prefix
console.log(`Longest common prefix: "${longestCommonPrefix(['interspecies', 'interstellar', 'interstate'])}"`);
//Longest common prefix: "inters"
console.log(`Longest common prefix: "${longestCommonPrefix(['throne', 'throne'])}"`);
//Longest common prefix: "throne"
console.log(`Longest common prefix: "${longestCommonPrefix(['ab', 'a'])}"`);
//Longest common prefix: "a"
//the isWord check stops us at 'a', even though it has a single child 'b'
console.log(`Longest common prefix: "${longestCommonPrefix([''])}"`);
//Longest common prefix: ""
````
- The <b>time complexity</b> of the above algorithm is `O(S)`, where `S` is the total number of characters across all the input strings. Building the trie touches each character exactly once, and the walk down from the root is bounded by the length of the shortest string, which is at most `S`.
- The <b>space complexity</b> is `O(S)` as well, for the trie nodes. This is the price we pay over the `O(1)`-space vertical scan, and it buys us a reusable structure rather than a one-shot answer.

## Replace Words (medium)
https://leetcode.com/problems/replace-words/
> In English, we have a concept called <b>root</b>, which can be followed by some other word to form another longer word — let's call this word <b>derivative</b>. For example, when the <b>root</b> `"help"` is followed by the word `"ful"`, we can form a derivative `"helpful"`.
>
> Given a `dictionary` consisting of many roots and a `sentence` consisting of words separated by spaces, replace all the derivatives in the sentence with the <b>root</b> forming it. If a derivative can be replaced by more than one root, replace it with the root that has <b>the shortest length</b>.
>
> Return the sentence after the replacement.

This problem follows the <b>[Implement Trie (Prefix Tree)](#implement-trie-prefix-tree-medium)</b> pattern and is the first one where the trie is not just convenient but is doing real algorithmic work.

The brute-force alternative is: for every word in the sentence, test every root in the dictionary with `word.startsWith(root)` and keep the shortest hit. That is `O(W * D * M)` — words times dictionary size times root length. With a trie we get to drop the `D` factor entirely.

The key observation is about the <i>shortest</i> root. When we walk the characters of a sentence word down the trie, the nodes we pass are exactly the prefixes of that word, visited in <b>increasing order of length</b>. So the first node we hit with `isWord === true` is the shortest root that prefixes this word — and we can return immediately. No comparing candidates, no tracking a minimum. The trie's structure hands us the "shortest" requirement for free, which is why the ordering of the walk is the whole trick here.

The two ways to fail out are both "no root matches, keep the word as is":
1. The trie has no child for the next character — the walk cannot continue, so no root is a prefix.
2. We consume the entire word without ever landing on an `isWord` node.

We build the trie from the dictionary once, then map each whitespace-separated word of the sentence through the lookup and re-join.

````js
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isWord = false;
  }
}

function replaceWords(dictionary, sentence) {
  //1. build a trie out of all the roots
  const root = new TrieNode();
  dictionary.forEach((word) => {
    let current = root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
    }
    current.isWord = true;
  });

  //2. for a word, walk the trie and stop at the FIRST node
  //that ends a root, that is the shortest matching root
  const findShortestRoot = (word) => {
    let current = root;
    const matched = [];
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!current.children.has(char)) {
        //the trie has no branch left, no root is a prefix of this word
        return word;
      }
      current = current.children.get(char);
      matched.push(char);
      if (current.isWord) {
        return matched.join('');
      }
    }
    //the whole word was consumed without ever ending a root
    return word;
  };

  return sentence.split(' ').map(findShortestRoot).join(' ');
}

console.log(replaceWords(['cat', 'bat', 'rat'], 'the cattle was rattled by the battery'));
//the cat was rat by the bat
console.log(replaceWords(['a', 'b', 'c'], 'aadsfasf absbs bbab cadsfafs'));
//a a b c
console.log(replaceWords(['catt', 'cat', 'bat', 'rat'], 'the cattle was rattled by the battery'));
//the cat was rat by the bat
//'cattle' matches both 'catt' and 'cat', we stop at the shorter 'cat'
console.log(replaceWords(['a', 'aa', 'aaa', 'aaaa'], 'a aa a aaaa aaa aaa aaa aaaaaa bbb baba ababa'));
//a a a a a a a a bbb baba a
````
- The <b>time complexity</b> of the above algorithm is `O(D + S)`, where `D` is the total number of characters across all the roots in the `dictionary` and `S` is the total number of characters in the `sentence`. Building the trie is `O(D)`, and each word of the sentence is walked at most once through its own characters, summing to `O(S)`. Compare this to the `O(S * |dictionary|)` of the brute-force `startsWith` approach — the dictionary size has vanished from the query cost.
- The <b>space complexity</b> is `O(D)` for the trie, plus `O(S)` for the output sentence we build.

## Word Search II (hard)
https://leetcode.com/problems/word-search-ii/
> Given an `m x n` board of characters and a list of strings `words`, return all words on the board.
>
> Each word must be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.

This is the <b>payoff problem</b> for the pattern — the one where a trie is not a nicety but the difference between passing and timing out.

The obvious approach is to take the single-word <b>[Word Search](https://leetcode.com/problems/word-search/)</b> solution and run it once per word. That means a fresh <b>DFS</b> over the entire grid for every word in the list, and crucially those searches <i>repeat each other's work</i>: if `words` contains `"oath"`, `"oats"`, and `"oatmeal"`, we re-walk the `o → a → t` path from scratch three times.

The trie fixes this by inverting the loop. Instead of asking "where is this word on the board?" for each word, we ask "which words can continue from here?" for each cell. We walk the <b>board and the trie in lock-step</b>: at every step of the <b>DFS</b> we hold a `TrieNode` alongside the grid position, and stepping onto a neighbouring cell means stepping into that character's child node. All the words are searched <i>simultaneously</i> in one traversal, and shared prefixes are walked once.

This buys us the pruning that makes the whole thing tractable. If `parent.children.get(char)` is `undefined`, then <i>no word in the entire list</i> continues with this character — so we return immediately instead of exploring the rest of that branch. On a board with a long dead-end path, this cuts off an exponential subtree in `O(1)`.

A few implementation details that matter:
- <b>Store the word on the node, not a boolean.</b> When we reach a node with `node.word !== null`, we have the complete string right there and don't have to reconstruct it from the path.
- <b>Null out `node.word` after collecting it.</b> The same word can often be formed along several different paths, and we must report it only once. Setting `node.word = null` is a neater de-duplication than a `Set`, and it costs nothing.
- <b>Mark visited cells in the board itself.</b> Overwriting `board[row][col]` with `'#'` enforces "the same cell may not be reused within one word" without allocating a separate `visited` matrix. `'#'` is safe because it can never appear in the trie, so the lookup for it fails and the branch prunes naturally. We restore the original character on the way back up — that restore <i>is</i> the backtracking step.
- <b>Prune dead nodes on the way out.</b> Once we finish exploring a node that has no children left and no word left to report, it can never contribute to another match. Deleting it from its parent (`parent.children.delete(char)`) shrinks the trie as the search progresses, so later cells prune even earlier. This is the optimization that rescues the pathological test case of a board full of a single repeated letter.

````js
class TrieNode {
  constructor() {
    this.children = new Map();
    //instead of a boolean we store the whole word,
    //so we don't have to rebuild it from the path
    this.word = null;
  }
}

function findWords(board, words) {
  const found = [];
  if (!board || board.length === 0 || board[0].length === 0) {
    return found;
  }

  //1. build a trie out of all the words we are looking for
  const root = new TrieNode();
  words.forEach((word) => {
    let current = root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
    }
    current.word = word;
  });

  const rows = board.length;
  const cols = board[0].length;

  //2. DFS from every cell, walking the board and the trie in lock-step
  const dfs = (row, col, parent) => {
    const char = board[row][col];
    const node = parent.children.get(char);

    //no word in our set continues with this character, prune this branch
    if (node === undefined) {
      return;
    }

    //we landed on a node that ends a word
    if (node.word !== null) {
      found.push(node.word);
      //null it out so the same word is never reported twice
      node.word = null;
    }

    //mark the cell as visited, '#' can never appear in the trie
    board[row][col] = '#';

    if (row > 0) dfs(row - 1, col, node);
    if (row < rows - 1) dfs(row + 1, col, node);
    if (col > 0) dfs(row, col - 1, node);
    if (col < cols - 1) dfs(row, col + 1, node);

    //backtrack, restore the cell for other paths
    board[row][col] = char;

    //optimization: a node with no children and no word left
    //is dead weight, drop it so later searches prune sooner
    if (node.children.size === 0 && node.word === null) {
      parent.children.delete(char);
    }
  };

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      dfs(row, col, root);
    }
  }

  return found;
}

const board1 = [
  ['o', 'a', 'a', 'n'],
  ['e', 't', 'a', 'e'],
  ['i', 'h', 'k', 'r'],
  ['i', 'f', 'l', 'v'],
];
console.log(`Words found: ${findWords(board1, ['oath', 'pea', 'eat', 'rain'])}`);
//Words found: oath,eat

const board2 = [
  ['a', 'b'],
  ['c', 'd'],
];
console.log(`Words found: ${findWords(board2, ['abcb'])}`);
//Words found:
//'abcb' would need to reuse the 'b' cell, which is not allowed

const board3 = [['a', 'b']];
console.log(`Words found: ${findWords(board3, ['ab', 'ba', 'a', 'b', 'zz'])}`);
//Words found: a,ab,b,ba

const board4 = [
  ['o', 'a', 'a', 'n'],
  ['e', 't', 'a', 'e'],
  ['i', 'h', 'k', 'r'],
  ['i', 'f', 'l', 'v'],
];
console.log(`Words found: ${findWords(board4, ['oath', 'oat', 'oa', 'hklf', 'hf'])}`);
//Words found: oa,oat,oath,hf,hklf
//the shared 'oa' prefix is walked exactly once for all three of its words
````
- The <b>time complexity</b> of the above algorithm is `O(D + M * N * 4 * 3^(L-1))`, where `D` is the total number of characters across all `words`, `M` and `N` are the dimensions of the board, and `L` is the length of the longest word. Building the trie costs `O(D)`. For the search, we start a <b>DFS</b> from each of the `M * N` cells; the first step has `4` choices of direction and every subsequent step has at most `3`, since we can never immediately walk back onto the cell we just marked. The trie is what keeps us far away from this bound in practice — most branches die within a character or two of pruning.
- The <b>space complexity</b> is `O(D)` for the trie, which dominates, plus `O(L)` for the <b>recursion</b> stack, since the <b>DFS</b> can never go deeper than the longest word. Marking visited cells in place means we need no extra grid.

## Map Sum Pairs (medium)
https://leetcode.com/problems/map-sum-pairs/
> Design a map that allows you to do the following:
>
> - Maps a string key to a given value.
> - Returns the sum of the values that have a key with a prefix equal to a given string.
>
> Implement the `MapSum` class:
> - `MapSum()` initializes the `MapSum` object.
> - `insert(key, val)` inserts the `key`-`val` pair into the map. If the `key` already existed, the original `key`-`value` pair will be overridden to the new one.
> - `sum(prefix)` returns the sum of all the pairs' values whose `key` starts with the `prefix`.

This problem follows the <b>[Implement Trie (Prefix Tree)](#implement-trie-prefix-tree-medium)</b> pattern with one twist: nodes now carry an <i>aggregate</i> rather than a flag.

There are two natural ways to do this. We could store the value only on the terminal node and, on a `sum(prefix)` call, walk to the prefix node and then <b>DFS</b> the entire subtree adding up what we find. That works, but every query pays for the size of the subtree.

The better trade is to <b>maintain the sum eagerly on insert</b>. Give each node a `sum` field holding the total of all keys that pass through it. On `insert`, we add the value to the `sum` of every node along the key's path. Then `sum(prefix)` is just a walk to the prefix node and a single field read — the aggregate was computed in advance, and the query is as cheap as `startsWith` was in the base template.

The subtlety — and this is what the problem is really testing — is the <b>overwrite</b> rule. If `insert("apple", 3)` is followed by `insert("apple", 5)`, naively adding `5` along the path would leave every node holding `8`, when the correct total for that key is `5`. The key was <i>replaced</i>, not added a second time.

The fix is to push a <b>delta</b> rather than the raw value. We keep a `Map` of the current value of each key on the side, so on insert we can compute `delta = val - previousValue` (with `previousValue` defaulting to `0` for a brand-new key) and add <i>that</i> along the path. For a new key the delta is just the value, so the common case is unaffected; for an overwrite the delta correctly cancels out the old contribution. Note this handles decreases too — `insert("apple", 1)` after `insert("apple", 5)` yields a delta of `-4`.

````js
class TrieNode {
  constructor() {
    this.children = new Map();
    //sum of the values of every key that passes through this node
    this.sum = 0;
  }
}

class MapSum {
  constructor() {
    this.root = new TrieNode();
    //remembers the current value of each key so an
    //overwrite can be turned into a delta
    this.values = new Map();
  }

  insert(key, val) {
    //if the key already exists we must not add the value twice,
    //we push only the difference down the path
    const previous = this.values.has(key) ? this.values.get(key) : 0;
    const delta = val - previous;
    this.values.set(key, val);

    let current = this.root;
    for (let i = 0; i < key.length; i++) {
      const char = key[i];
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
      //every node on the path of the key accumulates the delta
      current.sum += delta;
    }
  }

  sum(prefix) {
    let current = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      if (!current.children.has(char)) {
        //no key starts with this prefix
        return 0;
      }
      current = current.children.get(char);
    }
    //the running total was maintained on insert, just read it
    return current.sum;
  }
}

const mapSum = new MapSum();
mapSum.insert('apple', 3);
console.log(`sum('ap'): ${mapSum.sum('ap')}`);
//sum('ap'): 3
mapSum.insert('app', 2);
console.log(`sum('ap'): ${mapSum.sum('ap')}`);
//sum('ap'): 5
//'apple' contributes 3 and 'app' contributes 2
mapSum.insert('apple', 5);
console.log(`sum('ap'): ${mapSum.sum('ap')}`);
//sum('ap'): 7
//the delta of 5 - 3 = 2 is pushed down, so we get 5 + 2, not 3 + 2 + 5
console.log(`sum('apple'): ${mapSum.sum('apple')}`);
//sum('apple'): 5
console.log(`sum('b'): ${mapSum.sum('b')}`);
//sum('b'): 0
````
- The <b>time complexity</b> of `insert` is `O(M)`, where `M` is the length of the `key` — one walk down the path, updating a number at each node. `sum` is `O(P)`, where `P` is the length of the `prefix`, since the aggregate is already computed and we only need to reach the right node. Contrast this with the lazy alternative, where `sum` would cost `O(size of the subtree)`.
- The <b>space complexity</b> is `O(N * M)` for the trie, where `N` is the number of distinct keys and `M` is their average length, plus `O(N * M)` for the side `Map` of key values.

### Similar Problems
> 🌟 <b>[Implement Trie II (Prefix Tree)](https://leetcode.com/problems/implement-trie-ii-prefix-tree/):</b> extend the trie so that it can also report how many inserted words equal a given string, and how many start with a given prefix.

<b>Solution:</b> This is the same "maintain a counter on every node" idea as <b>[Map Sum Pairs](#map-sum-pairs-medium)</b>, with counts instead of values. We keep two counters per node: `wordCount`, incremented on every node along an inserted word's path, and `endCount`, incremented only on the terminal node. `countWordsStartingWith(prefix)` then reads `wordCount` at the prefix node and `countWordsEqualTo(word)` reads `endCount` at the word's node — both `O(M)` walks with no subtree traversal.

Keeping counts rather than a boolean `isWord` also makes duplicate insertions meaningful, and it is what lets a trie support deletion: `erase(word)` would decrement both counters along the path and drop nodes whose `wordCount` reaches `0`.

````js
class TrieNode {
  constructor() {
    this.children = new Map();
    //how many inserted words pass through this node
    this.wordCount = 0;
    //how many inserted words end exactly at this node
    this.endCount = 0;
  }
}

class WordFilter {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let current = this.root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
      current.wordCount++;
    }
    current.endCount++;
  }

  countWordsEqualTo(word) {
    let current = this.root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!current.children.has(char)) return 0;
      current = current.children.get(char);
    }
    return current.endCount;
  }

  countWordsStartingWith(prefix) {
    let current = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      if (!current.children.has(char)) return 0;
      current = current.children.get(char);
    }
    return current.wordCount;
  }
}

const wordFilter = new WordFilter();
['apple', 'apple', 'app', 'apply', 'banana'].forEach((word) => wordFilter.insert(word));
console.log(`countWordsEqualTo('apple'): ${wordFilter.countWordsEqualTo('apple')}`);
//countWordsEqualTo('apple'): 2
console.log(`countWordsEqualTo('ap'): ${wordFilter.countWordsEqualTo('ap')}`);
//countWordsEqualTo('ap'): 0
console.log(`countWordsStartingWith('app'): ${wordFilter.countWordsStartingWith('app')}`);
//countWordsStartingWith('app'): 4
//'apple' twice, 'app', and 'apply'
console.log(`countWordsStartingWith('ba'): ${wordFilter.countWordsStartingWith('ba')}`);
//countWordsStartingWith('ba'): 1
console.log(`countWordsStartingWith('c'): ${wordFilter.countWordsStartingWith('c')}`);
//countWordsStartingWith('c'): 0
````
- The <b>time complexity</b> of all three operations is `O(M)`, where `M` is the length of the word or prefix, since each is a single walk down the trie with `O(1)` work per node.
- The <b>space complexity</b> is `O(N * M)`, where `N` is the number of distinct inserted words and `M` is their average length. Duplicate insertions of the same word cost no extra nodes — they only bump the counters.

###### #Trie #PrefixTree #JavaScript #GrokkingTheCodingInterviewPatterns #LeetCode #DataStructures #Algorithms
