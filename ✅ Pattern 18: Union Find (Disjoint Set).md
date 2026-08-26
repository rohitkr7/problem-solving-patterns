# Pattern 18: Union Find (Disjoint Set)

<b>Union Find</b> (also called <b>Disjoint Set Union</b>, or <b>DSU</b>) is the data structure we reach for when a problem is really asking <i>"do these two things belong to the same group?"</i> and the groups keep changing as we go.

It maintains a <i>forest</i> of trees, where each tree is one set and the root of the tree is that set's <b>representative</b>. Two elements are in the same set exactly when they have the same root. That gives us two primitive operations: <b>find(x)</b> returns the representative of the set containing `x`, and <b>union(x, y)</b> merges the set containing `x` with the set containing `y`.

This pattern applies whenever you see one of the following signals:

- <b>Dynamic connectivity:</b> edges arrive one at a time and we need to answer "are `u` and `v` reachable from each other <i>right now</i>?" A <b>DFS</b>/<b>BFS</b> would have to re-traverse the whole graph after every new edge; <b>Union Find</b> answers in near constant time.
- <b>Grouping / counting components:</b> "how many provinces, islands, friend circles, clusters?" Every remaining disjoint set is one component, so the answer often falls out of a single counter.
- <b>Cycle detection in an undirected graph:</b> while adding edge `(u, v)`, if `u` and `v` <i>already</i> share a root, that edge closes a cycle.

That last point is worth contrasting with <b>[Pattern 16: Topological Sort](./✅%20Pattern%2016:%20🔎%20Topological%20Sort%20%28Graph%29.md)</b>. Both patterns detect cycles, but they are not interchangeable. <b>Topological Sort</b> detects cycles in a <b>directed</b> graph: it relies on <i>in-degrees</i> and edge direction, and it reports a cycle indirectly, by failing to produce an ordering that contains every vertex. <b>Union Find</b> detects cycles in an <b>undirected</b> graph, and it has no notion of direction at all - `union(u, v)` and `union(v, u)` are the same call - so it can never tell you that `A` must come before `B`. What it can do is tell you the instant an edge becomes redundant.

Put simply: if the edges have arrows, reach for <b>Topological Sort</b>. If the edges are plain connections and you care about <i>groups</i>, reach for <b>Union Find</b>. Two further boundaries are worth knowing before committing to this pattern: it <b>cannot un-merge</b>, since sets only ever grow, so problems that delete edges usually need to be processed <i>in reverse</i> so that deletions become additions; and it <b>does not give you paths</b>, only the fact that two elements are connected - finding the route between them is a <b>BFS</b>/<b>DFS</b> job.

Let's see this pattern in action.

## Union Find Template (medium)
> Implement a data structure that supports `union(x, y)` to merge two sets and `find(x)` to return the representative of the set containing `x`, both in near constant time.

The whole structure lives in a single `parent` array where `parent[i]` is the parent of element `i`. We seed it so that `parent[i] === i`, meaning every element starts out alone in its own set. `find(x)` walks up the parent pointers until it reaches an element that is its own parent - that is the root. `union(x, y)` finds both roots and, if they differ, hangs one root under the other.

### The naive approach

The straightforward version does exactly that and nothing more.
````js
class NaiveUnionFind {
  constructor(size) {
    //every element starts as its own parent, i.e. its own set
    this.parent = Array(size)
      .fill(0)
      .map((value, index) => index);
  }

  //walk up the parent chain until we hit the representative
  find(x) {
    let current = x;
    while (this.parent[current] !== current) {
      current = this.parent[current];
    }
    return current;
  }

  //blindly hang one root under the other
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;
    this.parent[rootX] = rootY;
    return true;
  }

  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}

const naive = new NaiveUnionFind(6);
naive.union(0, 1);
naive.union(1, 2);
naive.union(2, 3);
naive.union(3, 4);
naive.union(4, 5);

console.log(`Parents: ${naive.parent}`);
//Parents: 1,2,3,4,5,5
console.log(`Root of 0: ${naive.find(0)}`);
//Root of 0: 5
console.log(`Are 0 and 5 connected: ${naive.connected(0, 5)}`);
//Are 0 and 5 connected: true
````
Look closely at that `parent` array: `1,2,3,4,5,5`. Every element points at the next one, so the "tree" has degenerated into a <i>linked list</i> of length `6`. Calling `find(0)` has to walk all five hops to reach the root, and an adversarial order of unions produces this every time.

- The <b>time complexity</b> of the above algorithm is `O(N)` per `find` or `union` in the worst case, where `N` is the number of elements, because the unions can build a single chain of `N` elements that `find` must walk end to end.
- The <b>space complexity</b> of the above algorithm is `O(N)`, for the `parent` array.

### The optimized approach

Two small changes fix this, and they compose beautifully.

<b>1. Path compression (in `find`).</b> While walking up to the root anyway, we may as well re-point the nodes we pass so they sit closer to the root next time. The variant below - often called <i>path halving</i> - sets each node's parent to its <i>grandparent</i>, which halves the remaining path on every traversal and needs no second pass or recursion.

<b>2. Union by rank (in `union`).</b> Instead of arbitrarily hanging `rootX` under `rootY`, we track a `rank` (an upper bound on each tree's height) and always attach the <b>shorter</b> tree under the <b>taller</b> one. The taller tree's height is then unchanged, so the height only ever grows when we merge two trees of <i>equal</i> rank - and that can happen at most `logN` times.

Union by rank alone caps the height at `O(logN)`, and path compression alone gives `O(logN)` amortized. Used <i>together</i> they are far better than either: the amortized cost per operation becomes `O(α(N))`, where `α` is the <b>inverse Ackermann function</b>. `α(N)` is under `5` for any `N` that could be written down in the physical universe, so for interview purposes this is <b>effectively O(1)</b> - though it is worth being precise that it is <i>near</i> constant, not constant. We also keep a `count` field holding the number of disjoint sets: it starts at `size` and decrements on every <i>successful</i> merge, which turns "how many components are there?" into a field read.
````js
class UnionFind {
  constructor(size) {
    //every element starts as its own parent, i.e. its own set
    this.parent = Array(size)
      .fill(0)
      .map((value, index) => index);
    //rank is an upper bound on the height of the tree rooted at i
    this.rank = Array(size).fill(1);
    //number of disjoint sets currently in the forest
    this.count = size;
  }

  find(x) {
    let current = x;
    //path compression: re-point each node on the way up to its grandparent,
    //which halves the length of the path on every single traversal
    while (this.parent[current] !== current) {
      this.parent[current] = this.parent[this.parent[current]];
      current = this.parent[current];
    }
    return current;
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);

    //already in the same set, this edge is redundant
    if (rootX === rootY) return false;

    //union by rank: always attach the shorter tree under the taller tree
    //so the height never grows unnecessarily
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this.count--;
    return true;
  }

  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}

const uf = new UnionFind(10);
uf.union(0, 1);
uf.union(2, 3);
uf.union(1, 3);
uf.union(5, 6);

console.log(`Are 0 and 3 connected: ${uf.connected(0, 3)}`);
//Are 0 and 3 connected: true
console.log(`Are 0 and 4 connected: ${uf.connected(0, 4)}`);
//Are 0 and 4 connected: false
console.log(`Number of disjoint sets: ${uf.count}`);
//Number of disjoint sets: 6
console.log(`Parents: ${uf.parent}`);
//Parents: 0,0,0,0,4,5,5,7,8,9
console.log(`Ranks: ${uf.rank}`);
//Ranks: 3,1,2,1,1,2,1,1,1,1

//the same degenerate chain that crippled the naive version
const chain = new UnionFind(6);
chain.union(0, 1);
chain.union(1, 2);
chain.union(2, 3);
chain.union(3, 4);
chain.union(4, 5);
console.log(`Parents of the chain: ${chain.parent}`);
//Parents of the chain: 0,0,0,0,0,0
console.log(`Root of 5: ${chain.find(5)}`);
//Root of 5: 0
````
Compare the two `parent` arrays for the identical chain of unions. The naive version produced `1,2,3,4,5,5` - a five hop walk. The optimized version produced `0,0,0,0,0,0` - a completely flat tree where every `find` is a single lookup. The `Parents: 0,0,0,0,4,5,5,7,8,9` line is worth a second look too: element `3` was originally attached under `2`, but the `connected(0, 3)` <i>query</i> compressed it to point straight at `0`. In <b>Union Find</b>, reads make the structure faster - which is exactly why the cost is <i>amortized</i>.

- The <b>time complexity</b> of the above algorithm is `O(N)` to construct, where `N` is the number of elements, plus `O(α(N))` amortized per `find` or `union`, where `α` is the <i>inverse Ackermann function</i>. Since `α(N) < 5` for all practical `N`, a sequence of `M` operations runs in effectively `O(M)` time.
- The <b>space complexity</b> of the above algorithm is `O(N)`, for the `parent` and `rank` arrays.

## Number of Provinces (medium)
https://leetcode.com/problems/number-of-provinces/

> There are `n` cities. Some of them are connected, while some are not. If city `a` is connected directly with city `b`, and city `b` is connected directly with city `c`, then city `a` is connected indirectly with city `c`.
>
> A <b>province</b> is a group of directly or indirectly connected cities and no other cities outside of the group.
>
> You are given an `n x n` matrix `isConnected` where `isConnected[i][j] = 1` if the `i`th city and the `j`th city are directly connected, and `isConnected[i][j] = 0` otherwise. Return the total number of provinces.

This is the purest form of the pattern: a <i>province</i> is precisely a <b>connected component</b>, and a connected component is precisely a disjoint set. So we `union` every pair of directly connected cities and then read off `count`.

The input is an <i>adjacency matrix</i> rather than an edge list, so we scan it to find the edges. Two observations shrink the work: the matrix is <b>symmetric</b> (`isConnected[i][j] === isConnected[j][i]`), and the diagonal is always `1` since every city is connected to itself, which tells us nothing. Both are handled by starting the inner loop at `j = i + 1` so we only visit the strict upper triangle. Note also that we never need to check whether a `union` succeeded here - if cities `i` and `j` are already in the same province, `union` returns `false` and leaves `count` alone, which is exactly the behaviour we want.
````js
class UnionFind {
  constructor(size) {
    this.parent = Array(size)
      .fill(0)
      .map((value, index) => index);
    this.rank = Array(size).fill(1);
    this.count = size;
  }

  find(x) {
    let current = x;
    while (this.parent[current] !== current) {
      this.parent[current] = this.parent[this.parent[current]];
      current = this.parent[current];
    }
    return current;
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this.count--;
    return true;
  }
}

function findCircleNum(isConnected) {
  const n = isConnected.length;
  const unionFind = new UnionFind(n);

  //the matrix is symmetric, so only the upper triangle matters
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isConnected[i][j] === 1) {
        unionFind.union(i, j);
      }
    }
  }

  //every remaining disjoint set is one province
  return unionFind.count;
}

console.log(`Number of provinces: ${findCircleNum([[1, 1, 0], [1, 1, 0], [0, 0, 1]])}`);
//Number of provinces: 2
console.log(`Number of provinces: ${findCircleNum([[1, 0, 0], [0, 1, 0], [0, 0, 1]])}`);
//Number of provinces: 3
console.log(`Number of provinces: ${findCircleNum([[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1], [0, 0, 1, 1]])}`);
//Number of provinces: 2
console.log(`Number of provinces: ${findCircleNum([[1]])}`);
//Number of provinces: 1
````
- The <b>time complexity</b> of the above algorithm is `O(N²)`, where `N` is the number of cities. We are forced to read `O(N²)` matrix cells no matter what, and each cell costs at most one `union` at `O(α(N))` amortized, which is effectively constant.
- The <b>space complexity</b> of the above algorithm is `O(N)`, for the `parent` and `rank` arrays. This is a real win over a <b>DFS</b>/<b>BFS</b> solution, which needs a `visited` array plus an `O(N)` recursion stack or queue.

<b>Similar problem - Number of Connected Components in an Undirected Graph:</b> identical, only the input format changes. Instead of scanning a matrix, iterate the edge list directly and `union(edge[0], edge[1])`, then return `count`. That drops the time complexity to `O(V+E)`.

## Graph Valid Tree (medium)
https://leetcode.com/problems/graph-valid-tree/

> You have a graph of `n` nodes labeled from `0` to `n - 1`. You are given an integer `n` and a list of `edges` where `edges[i] = [aᵢ, bᵢ]` indicates that there is an undirected edge between nodes `aᵢ` and `bᵢ` in the graph.
>
> Return `true` if the edges of the given graph make up a valid tree, and `false` otherwise.

A graph is a <b>valid tree</b> if and only if it satisfies two conditions at once:
1. It is <b>fully connected</b> - there is exactly one component, so every node is reachable from every other node.
2. It is <b>acyclic</b> - it contains no cycles.

<b>Union Find</b> gives us both in one pass, which is what makes this the textbook demonstration of the pattern: the `count` field answers condition `1`, and the `false` return from `union` answers condition `2`.

There is also a well known shortcut worth stating first: a tree on `n` nodes has <b>exactly</b> `n - 1` edges. With fewer the graph cannot possibly be connected; with more it must contain a cycle. So we can reject on the edge count alone before touching the graph. Given that check passes, we process the edges - and if any `union` returns `false`, both endpoints already shared a root, meaning there was already a path between them, so this edge creates a cycle and we bail out. If all `n - 1` unions succeed, each reduced `count` by exactly one, so `count` lands on `1` and the graph is connected.

<i>This is precisely the case that <b>Topological Sort</b> cannot handle.</i> The edges here have no direction, so there are no <i>sources</i> and no <i>in-degrees</i> to peel away. Note also that a two node cycle - the edge `[0, 1]` listed twice - is a genuine cycle in an undirected graph and `union` catches it, whereas in a directed graph `0 -> 1` twice is just a duplicate edge.
````js
class UnionFind {
  constructor(size) {
    this.parent = Array(size)
      .fill(0)
      .map((value, index) => index);
    this.rank = Array(size).fill(1);
    this.count = size;
  }

  find(x) {
    let current = x;
    while (this.parent[current] !== current) {
      this.parent[current] = this.parent[this.parent[current]];
      current = this.parent[current];
    }
    return current;
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    //returning false is the cycle signal: both ends already share a root
    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this.count--;
    return true;
  }
}

function validTree(n, edges) {
  //a tree on n nodes has exactly n-1 edges, no more and no less
  if (edges.length !== n - 1) return false;

  const unionFind = new UnionFind(n);

  for (let i = 0; i < edges.length; i++) {
    const u = edges[i][0];
    const v = edges[i][1];
    //if the union fails, this edge closes a cycle
    if (!unionFind.union(u, v)) return false;
  }

  //n-1 successful unions always collapse the forest into a single set
  return unionFind.count === 1;
}

console.log(`Is a valid tree: ${validTree(5, [[0, 1], [0, 2], [0, 3], [1, 4]])}`);
//Is a valid tree: true
console.log(`Is a valid tree: ${validTree(5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]])}`);
//Is a valid tree: false
console.log(`Is a valid tree: ${validTree(4, [[0, 1], [2, 3]])}`);
//Is a valid tree: false
console.log(`Is a valid tree: ${validTree(1, [])}`);
//Is a valid tree: true
console.log(`Is a valid tree: ${validTree(4, [[0, 1], [1, 2], [2, 0]])}`);
//Is a valid tree: false
````
Trace the second case, `n = 5` with edges `[[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]`. It has `4` edges for `5` nodes, so the edge count guard passes. The first three unions succeed, putting `0`, `1`, `2` and `3` in one set. Then `union(1, 3)` finds that both already have the same root and returns `false` - the edge `1-3` closes the cycle `1-2-3-1`. The third case shows why connectivity must be checked separately from acyclicity: `4` nodes with edges `[[0, 1], [2, 3]]` is perfectly acyclic, but it is two disjoint trees - a <i>forest</i>, not a tree - and here the edge count guard rejects it, since `2 !== 3`.

- The <b>time complexity</b> of the above algorithm is `O(V+E)`, where `V` is the number of nodes and `E` is the number of edges. Building the `parent` and `rank` arrays costs `O(V)` and each of the `E` edges costs `O(α(V))` amortized, which is effectively constant.
- The <b>space complexity</b> of the above algorithm is `O(V)`, for the `parent` and `rank` arrays. A <b>DFS</b> solution would need `O(V+E)` to hold the adjacency list as well.

## Redundant Connection (medium)
https://leetcode.com/problems/redundant-connection/

> In this problem, a tree is an undirected graph that is connected and has no cycles.
>
> You are given a graph that started as a tree with `n` nodes labeled from `1` to `n`, with one additional edge added. The added edge has two <i>different</i> vertices chosen from `1` to `n`, and was not an edge that already existed.
>
> Return an edge that can be removed so that the resulting graph is a tree of `n` nodes. If there are multiple answers, return the answer that occurs last in the input.

This problem follows the <b>[Graph Valid Tree](#graph-valid-tree-medium)</b> pattern, and it is almost a simplification of it. There we knew the answer was a boolean; here we are told a cycle definitely exists and asked to <i>name</i> the edge that created it.

The insight is that "the answer that occurs last in the input" comes for free from processing the edges in order. As we sweep left to right, every edge that joins two <i>different</i> sets is a legitimate tree edge. The <b>first</b> edge whose `union` fails is the point at which the graph first became cyclic - and since the input is a tree plus exactly one extra edge, that edge is by definition the last one needed to close the cycle, so we return it immediately.

The only real implementation trap is that nodes are labeled from `1` to `n` rather than `0` to `n - 1`. We size the `UnionFind` at `edges.length + 1` and never touch index `0`. Since a tree plus one edge has exactly `n` edges, that is `n + 1` slots, giving us valid indices for `1..n`.
````js
class UnionFind {
  constructor(size) {
    this.parent = Array(size)
      .fill(0)
      .map((value, index) => index);
    this.rank = Array(size).fill(1);
    this.count = size;
  }

  find(x) {
    let current = x;
    while (this.parent[current] !== current) {
      this.parent[current] = this.parent[this.parent[current]];
      current = this.parent[current];
    }
    return current;
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this.count--;
    return true;
  }
}

function findRedundantConnection(edges) {
  //nodes are labelled 1..n, so allocate one extra slot and ignore index 0
  const unionFind = new UnionFind(edges.length + 1);

  for (let i = 0; i < edges.length; i++) {
    const u = edges[i][0];
    const v = edges[i][1];
    //the first edge whose union fails is the last edge that created the cycle
    if (!unionFind.union(u, v)) return [u, v];
  }

  return [];
}

console.log(`Redundant connection: ${findRedundantConnection([[1, 2], [1, 3], [2, 3]])}`);
//Redundant connection: 2,3
console.log(`Redundant connection: ${findRedundantConnection([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]])}`);
//Redundant connection: 1,4
console.log(`Redundant connection: ${findRedundantConnection([[1, 4], [3, 4], [1, 3], [1, 2]])}`);
//Redundant connection: 1,3
````
The third case is a good check on the "occurs last" requirement. The cycle is `1-4-3-1`, so removing <i>any</i> of `[1, 4]`, `[3, 4]` or `[1, 3]` would leave a valid tree. Because we sweep in input order, `[1, 4]` and `[3, 4]` both merge new sets successfully, and `[1, 3]` is the first failure - which is also the last of the three in the input. The greedy sweep gets the tie-break right without any extra bookkeeping.

- The <b>time complexity</b> of the above algorithm is `O(N)`, where `N` is the number of edges. We touch each edge at most once and each `union` costs `O(α(N))` amortized, which is effectively constant.
- The <b>space complexity</b> of the above algorithm is `O(N)`, for the `parent` and `rank` arrays.

<b>Similar problem - Redundant Connection II:</b> the same setup, but the graph is <b>directed</b>. This is much harder and is <i>not</i> a plain <b>Union Find</b> problem, precisely because direction matters: the extra edge can leave a node with two parents, form a directed cycle, or both. The standard approach is to first scan for a node with two parents, then use <b>Union Find</b> to test which of the two candidate edges can be removed. It is a good illustration of the boundary of this pattern - <b>Union Find</b> is blind to edge direction.

## Number of Islands (medium)
https://leetcode.com/problems/number-of-islands/

> Given an `m x n` 2D binary `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.
>
> An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

Let me be upfront: <b>DFS</b> or <b>BFS</b> flood fill is the usual - and frankly the more natural - way to solve this one. Sweep the grid, and each time you hit an unvisited `'1'`, increment a counter and sink the entire island by flooding it. It is shorter to write and easier to explain.

It is still worth solving with <b>Union Find</b> for two reasons. First, it teaches the <b>grid-as-graph</b> trick that shows up constantly in this pattern. Second, <b>Union Find</b> is the right tool for the <i>follow up</i> that interviewers love to ask: "now what if land cells are added one at a time and you must report the island count after each addition?" A flood fill would have to re-scan the grid after every addition; <b>Union Find</b> just calls `union` a few times.

The grid trick is to <b>flatten</b> each `(row, col)` cell into a single integer id with `row * cols + col`, giving us `rows * cols` elements to feed the `UnionFind`. Then, for each land cell, we union it with its land neighbours. Two details make this work cleanly:
- We only look <b>right and down</b>, never left or up. When we visited the cell to the left, it already unioned itself with us, so checking both directions would just do redundant work.
- <b>Water cells are still their own disjoint sets.</b> The `UnionFind` was initialized with every one of the `rows * cols` cells alone, and we never union the `'0'`s with anything. So `count` overcounts by exactly the number of water cells - we tally them as we sweep and subtract at the end.
````js
class UnionFind {
  constructor(size) {
    this.parent = Array(size)
      .fill(0)
      .map((value, index) => index);
    this.rank = Array(size).fill(1);
    this.count = size;
  }

  find(x) {
    let current = x;
    while (this.parent[current] !== current) {
      this.parent[current] = this.parent[this.parent[current]];
      current = this.parent[current];
    }
    return current;
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this.count--;
    return true;
  }
}

function numIslands(grid) {
  if (grid.length === 0 || grid[0].length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0].length;

  //flatten (row, col) into a single id: row * cols + col
  const unionFind = new UnionFind(rows * cols);
  let waterCells = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === '0') {
        //water cells are still their own set, so subtract them at the end
        waterCells++;
        continue;
      }

      //only look right and down, the left and up edges
      //were already merged when we visited those cells
      if (row + 1 < rows && grid[row + 1][col] === '1') {
        unionFind.union(row * cols + col, (row + 1) * cols + col);
      }
      if (col + 1 < cols && grid[row][col + 1] === '1') {
        unionFind.union(row * cols + col, row * cols + col + 1);
      }
    }
  }

  return unionFind.count - waterCells;
}

console.log(`Number of islands: ${numIslands([['1', '1', '1', '1', '0'], ['1', '1', '0', '1', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '0', '0', '0']])}`);
//Number of islands: 1
console.log(`Number of islands: ${numIslands([['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']])}`);
//Number of islands: 3
console.log(`Number of islands: ${numIslands([['1', '0', '1'], ['0', '1', '0'], ['1', '0', '1']])}`);
//Number of islands: 5
````
The last case is a useful sanity check on the "no diagonals" rule. The checkerboard has five `'1'`s, none of them horizontally or vertically adjacent, so the answer is `5` distinct islands - not `1`.

- The <b>time complexity</b> of the above algorithm is `O(M*N)`, where `M` is the number of rows and `N` the number of columns. We visit each cell once and perform at most two `union` calls per cell, each `O(α(M*N))` amortized.
- The <b>space complexity</b> of the above algorithm is `O(M*N)`, for the `parent` and `rank` arrays. Note this is <i>worse</i> than the <b>DFS</b> approach when the input grid may be modified in place, since flood fill can mark visited cells directly in the grid.

## Accounts Merge (medium)
https://leetcode.com/problems/accounts-merge/

> Given a list of `accounts` where each element `accounts[i]` is a list of strings, where the first element `accounts[i][0]` is a name, and the rest of the elements are emails representing emails of the account.
>
> Now, we would like to merge these accounts. Two accounts definitely belong to the same person if there is some common email to both accounts. Note that even if two accounts have the same name, they may belong to different people as people could have the same name. A person can have any number of accounts initially, but all of their accounts definitely have the same name.
>
> After merging the accounts, return the accounts in the following format: the first element of each account is the name, and the rest of the elements are emails <b>in sorted order</b>.

This is the problem that shows <b>Union Find</b> handling something other than integers, and it is where the pattern really earns its keep. The transitive rule - if `A` shares an email with `B`, and `B` shares a <i>different</i> email with `C`, then all three are one person - is exactly transitive connectivity, which is what disjoint sets model.

The key design decision is <b>what the elements of the disjoint sets should be</b>. Two choices work, and picking the simpler one matters:
- <b>Union the emails.</b> Requires mapping every distinct email string to an integer id first.
- <b>Union the account indices.</b> The accounts already have natural integer ids - their positions in the input array. Much cleaner, so that is what we do.

The algorithm is then three passes:

1. <b>Union accounts that share an email.</b> We keep a `Map` from email to the first account index that claimed it. When we meet an email we have seen before, we union the current account with that earlier owner. Remember that index `0` of each account is the <i>name</i>, so emails start at index `1`.
2. <b>Bucket the emails by root.</b> For each email in the map, find the root of its owning account and push the email into that root's bucket. This is where the transitive chains pay off - emails first seen under different accounts land in the same bucket if those accounts were ever merged.
3. <b>Assemble the output.</b> Sort each bucket, then prepend the name. Since the problem guarantees that all of a person's accounts share the same name, we can take the name from <i>any</i> account in the group - the root's is the convenient one.
````js
class UnionFind {
  constructor(size) {
    this.parent = Array(size)
      .fill(0)
      .map((value, index) => index);
    this.rank = Array(size).fill(1);
    this.count = size;
  }

  find(x) {
    let current = x;
    while (this.parent[current] !== current) {
      this.parent[current] = this.parent[this.parent[current]];
      current = this.parent[current];
    }
    return current;
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this.count--;
    return true;
  }
}

function accountsMerge(accounts) {
  const unionFind = new UnionFind(accounts.length);
  //remembers the first account index that claimed each email
  const emailToAccount = new Map();

  //1. union every account that shares at least one email
  for (let account = 0; account < accounts.length; account++) {
    //index 0 is the owner's name, the emails start at index 1
    for (let i = 1; i < accounts[account].length; i++) {
      const email = accounts[account][i];
      if (emailToAccount.has(email)) {
        unionFind.union(account, emailToAccount.get(email));
      } else {
        emailToAccount.set(email, account);
      }
    }
  }

  //2. bucket every email under the root of its account
  const groups = new Map();
  emailToAccount.forEach((account, email) => {
    const root = unionFind.find(account);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(email);
  });

  //3. the name of any account in the group is the name of the merged account
  const merged = [];
  groups.forEach((emails, root) => {
    emails.sort();
    merged.push([accounts[root][0], ...emails]);
  });

  return merged;
}

console.log(JSON.stringify(accountsMerge([
  ['John', 'johnsmith@mail.com', 'john_newyork@mail.com'],
  ['John', 'johnsmith@mail.com', 'john00@mail.com'],
  ['Mary', 'mary@mail.com'],
  ['John', 'johnnybravo@mail.com'],
])));
//[["John","john00@mail.com","john_newyork@mail.com","johnsmith@mail.com"],["Mary","mary@mail.com"],["John","johnnybravo@mail.com"]]

console.log(JSON.stringify(accountsMerge([
  ['Alex', 'alex@mail.com'],
  ['Alex', 'alex@mail.com', 'alex.work@mail.com'],
  ['Alex', 'alex.work@mail.com'],
])));
//[["Alex","alex.work@mail.com","alex@mail.com"]]

console.log(JSON.stringify(accountsMerge([
  ['Gabe', 'Gabe0@m.co', 'Gabe3@m.co'],
  ['Kevin', 'Kevin3@m.co', 'Kevin5@m.co'],
])));
//[["Gabe","Gabe0@m.co","Gabe3@m.co"],["Kevin","Kevin3@m.co","Kevin5@m.co"]]
````
The first case is the canonical one: accounts `0` and `1` both list `johnsmith@mail.com`, so they merge into a single `John` with three emails. Account `3` is <i>also</i> named `John` but shares no email with anyone, so it stays separate - the name is not evidence of identity.

The second case exercises the transitive chain. Account `0` claims `alex@mail.com`; account `1` shares that email so it merges with `0`, and also introduces `alex.work@mail.com`; account `2` shares <i>that</i> email and so merges in too. All three collapse into one group, even though accounts `0` and `2` have no email in common.

The third case is the counterpart: two accounts with no shared emails, so nothing merges and both come back separately. It also confirms the per-group sort, since the emails are emitted in sorted order.

- The <b>time complexity</b> of the above algorithm is `O(N*K*log(N*K))`, where `N` is the number of accounts and `K` is the maximum number of emails in one account. The union pass visits each of the `N*K` emails once at `O(α(N))` amortized each, and the final <i>sorting</i> of the email groups dominates at `O(N*K*log(N*K))`.
- The <b>space complexity</b> of the above algorithm is `O(N*K)`, since the `emailToAccount` map and the `groups` map together hold every email.

## Most Stones Removed with Same Row or Column (medium)
https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/

> On a 2D plane, we place `n` stones at some integer coordinate points. Each coordinate point may have at most one stone.
>
> You are given an array `stones` of length `n` where `stones[i] = [xᵢ, yᵢ]` represents the location of the `i`th stone. A stone can be removed if it shares either <b>the same row or the same column</b> as another stone that has not been removed.
>
> Given an array `stones`, return the largest possible number of stones that can be removed.

This one looks like a greedy simulation problem and is actually a disguised counting problem. The trick is a reframing.

Say we group the stones so that two stones are in the same group whenever they share a row or a column, transitively. Now consider one group of `k` stones. Because the group is connected, we can always order the removals so that we peel off stones one at a time, each time picking a stone that still has a surviving partner in its row or column. The way to see this is that a connected graph has a <i>spanning tree</i>, and repeatedly removing a <b>leaf</b> of that tree always leaves the rest connected. So we can strip a group of `k` stones down to exactly `1` stone, removing `k - 1`. And we can never do better, because the last stone in a group has no partner left.

Therefore the answer is `total stones - number of groups`, which is `stones.length - count`. No simulation at all.
````js
class UnionFind {
  constructor(size) {
    this.parent = Array(size)
      .fill(0)
      .map((value, index) => index);
    this.rank = Array(size).fill(1);
    this.count = size;
  }

  find(x) {
    let current = x;
    while (this.parent[current] !== current) {
      this.parent[current] = this.parent[this.parent[current]];
      current = this.parent[current];
    }
    return current;
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this.count--;
    return true;
  }
}

function removeStones(stones) {
  const unionFind = new UnionFind(stones.length);

  //two stones belong to the same group if they share a row or a column
  for (let i = 0; i < stones.length; i++) {
    for (let j = i + 1; j < stones.length; j++) {
      if (stones[i][0] === stones[j][0] || stones[i][1] === stones[j][1]) {
        unionFind.union(i, j);
      }
    }
  }

  //each connected group of k stones can be reduced to exactly 1 stone
  return stones.length - unionFind.count;
}

console.log(`Stones removed: ${removeStones([[0, 0], [0, 1], [1, 0], [1, 2], [2, 1], [2, 2]])}`);
//Stones removed: 5
console.log(`Stones removed: ${removeStones([[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]])}`);
//Stones removed: 3
console.log(`Stones removed: ${removeStones([[0, 0]])}`);
//Stones removed: 0
console.log(`Stones removed: ${removeStones([[0, 1], [1, 0]])}`);
//Stones removed: 0
````
The first case has all six stones in one group, so `6 - 1 = 5`. The second case has two groups - `{[0,0], [0,2], [2,0], [2,2]}` and the lone `{[1,1]}` - so `5 - 2 = 3`. The last case is the important negative check: `[0, 1]` and `[1, 0]` share neither a row nor a column, so they are two groups and nothing can be removed.

- The <b>time complexity</b> of the above algorithm is `O(N²)`, where `N` is the number of stones, because we compare every pair of stones. Each `union` is `O(α(N))` amortized.
- The <b>space complexity</b> of the above algorithm is `O(N)`, for the `parent` and `rank` arrays.

There is a sharper `O(N)` variant worth knowing for a follow up. Stop unioning <b>stones</b> and start unioning <b>coordinates</b>: for each stone, `union(its row label, its column label)`, prefixing rows with `r` and columns with `c` so that row `3` and column `3` never collide. A stone then becomes the <i>edge</i> connecting a row to a column, and two stones land in the same group exactly when their row and column labels are transitively connected. This needs a <i>sparse</i> <b>Union Find</b> backed by a `Map` instead of an array, since the keys are now arbitrary labels, and it performs one `union` per stone rather than one per pair.

## Pattern Summary

The recipe for recognising and applying <b>Union Find</b>:

1. <b>Identify the elements.</b> They must be things that get grouped - accounts, cities, grid cells, row/column labels. Picking the wrong elements is the most common way to make one of these problems harder than it is.
2. <b>Map them to integer ids,</b> or use a `Map`-backed sparse variant if the labels are strings or sparse coordinates. For grids, flatten with `row * cols + col`.
3. <b>Union on every relation</b> given by the input.
4. <b>Read off the answer,</b> which is almost always the `count` of disjoint sets (<i>counting components</i>), whether `count === 1` (<i>full connectivity</i>), or a `union` that returned `false` (<i>a cycle</i>).

And the boundaries of the pattern, worth knowing before you commit to it in an interview:

- It has <b>no notion of direction</b>. For anything involving ordering or dependencies, use <b>[Pattern 16: Topological Sort](./✅%20Pattern%2016:%20🔎%20Topological%20Sort%20%28Graph%29.md)</b> instead.
- It <b>cannot un-merge</b>. Sets only ever grow, so problems that delete edges usually need to be processed <i>in reverse</i> so that deletions become additions.
- It <b>does not give you paths</b>. It can tell you that `u` and `v` are connected, but not how to get from one to the other - that is a <b>BFS</b>/<b>DFS</b> job.

###### #UnionFind #DisjointSet #JavaScript #GrokkingTheCodingInterviewPatterns #LeetCode #DataStructures #Algorithms
