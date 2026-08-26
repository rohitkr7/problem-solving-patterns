# Pattern 21: Island (Matrix Traversal)

This pattern is based on traversing a <b>2D matrix</b> as if it were a graph.

The whole trick here is a change of perspective. A grid <i>looks</i> like a table of numbers, but it is really an <b>implicit graph</b>: every cell `(row, col)` is a node, and its edges are the neighbouring cells. Nobody hands us an adjacency list — we compute a cell's neighbours on the fly by adding offsets to its coordinates. In most problems a cell has up to <b>4 neighbours</b> (up, down, left, right), and in some variants up to <b>8</b> (the diagonals as well).

Once you accept that framing, every graph traversal you already know applies unchanged. The two workhorses are the same two we used on trees:

1. <b>DFS (flood fill)</b> — go as deep as possible from a starting cell, then unwind. This is the same recursion we used in <b>Pattern 08: Tree Depth First Search</b>, except that instead of two children (`left`, `right`) we recurse into up to four neighbours. Reach for DFS when the question is <i>"what belongs to this blob?"</i> — the size of a connected component, whether a region touches the border, how many components exist.
2. <b>BFS (level expansion)</b> — push a cell into a <b>Queue</b>, then peel off one full ring of neighbours at a time. This is exactly the `levelSize` loop from <b>Pattern 07: Tree Breadth First Search</b>. Reach for BFS when the question involves <i>distance</i> or <i>time</i> — the shortest path through a grid, the minutes for something to spread, the distance from every cell to the nearest zero.

The distinction matters more than it looks. <b>BFS visits cells in non-decreasing order of distance from its sources</b>, so the first time BFS reaches a cell it has already found the shortest way there. DFS gives no such guarantee — it can arrive by a long winding route, mark the cell visited, and block the short route that would have come later. So: <i>counting and sizing components → DFS is simpler; measuring distance or simultaneous spread → BFS is required</i>.

### The standard toolkit

<b>The `directions` array idiom.</b> Rather than four near-identical `if` blocks, keep the neighbour offsets in one array — `[[-1,0], [1,0], [0,-1], [0,1]]` — and loop over it. For 8-connectivity just add the diagonals `[-1,-1], [-1,1], [1,-1], [1,1]`. This keeps the traversal body short and makes switching between 4 and 8 neighbours trivial.

<b>Bounds checking.</b> Grids have edges and a graph traversal has no idea about them, so every candidate neighbour must be validated before we dereference it. Check bounds <i>before</i> reading the cell's value — `grid[-1]` is `undefined`, so `grid[-1][0]` would throw — which means the order of these conditions is not a matter of taste:

````js
const grid = [
  [1, 1, 0],
  [0, 1, 0],
];

const rows = grid.length;
const cols = grid[0].length;
const directions = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
];

//collect the land neighbours of the top-left corner
const row = 0;
const col = 0;
const neighbours = [];

for (const [rowDelta, colDelta] of directions) {
  const nextRow = row + rowDelta;
  const nextCol = col + colDelta;

  //bounds check BEFORE reading the cell
  if (nextRow < 0 || nextRow >= rows) continue;
  if (nextCol < 0 || nextCol >= cols) continue;
  if (grid[nextRow][nextCol] !== 1) continue;

  neighbours.push([nextRow, nextCol]);
}

//the corner has only two in-bounds neighbours, and just one of them is land
console.log(JSON.stringify(neighbours));
//[[0,1]]
````

<b>Marking cells visited: in place vs. a separate set.</b> Without a visited marker, any traversal will bounce between two adjacent cells forever. Two options:

- <b>In place</b> — overwrite the cell as we consume it (`grid[row][col] = '0'`, i.e. "sink the island"). Costs `O(1)` extra space and is beautifully short, but it <b>destroys the caller's input</b>. Fine in an interview if you say so out loud, and it is what several of these problems expect.
- <b>A separate `visited` matrix</b> — costs `O(M*N)`, but leaves the input intact, and it is <i>mandatory</i> when you must traverse the same grid more than once under different rules. <b>Pacific Atlantic Water Flow</b> at the end of this file is the clearest case: it needs two independent visited sets, one per ocean, so mutating the grid is simply not an option.

One rule that catches people out in the BFS version: <b>mark a cell visited the moment you enqueue it, never when you dequeue it</b>. Wait until dequeue and the same cell can be pushed by several neighbours before any of them is processed, and it gets expanded multiple times.

## Number of Islands (medium)
https://leetcode.com/problems/number-of-islands/

> Given an `m x n` 2D binary grid which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.
>
> An <b>island</b> is surrounded by water and is formed by connecting adjacent lands <b>horizontally or vertically</b>. You may assume all four edges of the grid are all surrounded by water.

This is the template every other problem in this file is a variation of.

The key observation: the number of islands is the number of <b>connected components</b> of land cells. So we scan the grid cell by cell, and whenever we hit a land cell we have not seen before, we know we have found a brand new island — increment the counter, then <i>consume the whole island</i> with a flood fill so none of its other cells can start a second count.

That consuming step is the whole algorithm. Here it is with <b>DFS</b>:

````js
function numIslands(grid) {
  //an empty grid has no islands
  if (!grid || grid.length === 0 || grid[0].length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0].length;
  let islandCount = 0;

  //flood-fill every land cell reachable from (row, col)
  function dfs(row, col) {
    //bounds check: we walked off the grid
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;

    //not land (either water, or land we already sank)
    if (grid[row][col] !== '1') return;

    //mark visited in place by sinking the island
    grid[row][col] = '0';

    //recurse into the four neighbours
    dfs(row + 1, col);
    dfs(row - 1, col);
    dfs(row, col + 1);
    dfs(row, col - 1);
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      //every unvisited land cell is the seed of a brand new island
      if (grid[row][col] === '1') {
        islandCount++;
        dfs(row, col);
      }
    }
  }

  return islandCount;
}

//each example gets its own fresh grid, because numIslands() mutates its input
const grid1 = [
  ['1', '1', '1', '1', '0'],
  ['1', '1', '0', '1', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '0', '0', '0'],
];
console.log(`Number of islands: ${numIslands(grid1)}`);
//Number of islands: 1

const grid2 = [
  ['1', '1', '0', '0', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '1', '0', '0'],
  ['0', '0', '0', '1', '1'],
];
console.log(`Number of islands: ${numIslands(grid2)}`);
//Number of islands: 3
````

<b>Sinking the island as we go is what makes the outer double loop safe.</b> Without it, the second cell of the first island would be counted as a second island.

Here is the same algorithm with <b>BFS</b>, worth writing out at least once because it is the shape we reuse for <b>Rotting Oranges</b> and <b>01 Matrix</b>. Instead of recursing, we keep a <b>Queue</b> of cells still to expand:

````js
const directions = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
];

function numIslands(grid) {
  if (!grid || grid.length === 0 || grid[0].length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0].length;
  let islandCount = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] !== '1') continue;

      //found a new island, expand it outwards with BFS
      islandCount++;

      const queue = [[row, col]];
      //mark it visited the moment it is enqueued, never when it is dequeued,
      //otherwise the same cell can be pushed twice
      grid[row][col] = '0';

      while (queue.length > 0) {
        const [currRow, currCol] = queue.shift();

        for (const [rowDelta, colDelta] of directions) {
          const nextRow = currRow + rowDelta;
          const nextCol = currCol + colDelta;

          //bounds check first, then the land check
          if (nextRow < 0 || nextRow >= rows) continue;
          if (nextCol < 0 || nextCol >= cols) continue;
          if (grid[nextRow][nextCol] !== '1') continue;

          grid[nextRow][nextCol] = '0';
          queue.push([nextRow, nextCol]);
        }
      }
    }
  }

  return islandCount;
}

const grid1 = [
  ['1', '1', '1', '1', '0'],
  ['1', '1', '0', '1', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '0', '0', '0'],
];
console.log(`Number of islands: ${numIslands(grid1)}`);
//Number of islands: 1

const grid2 = [
  ['1', '0', '1', '0', '1'],
  ['0', '1', '0', '1', '0'],
  ['1', '0', '1', '0', '1'],
];
console.log(`Number of islands: ${numIslands(grid2)}`);
//Number of islands: 8
````

That checkerboard is a nice sanity check — no two land cells are orthogonally adjacent, so all eight are separate islands.

- The <b>time complexity</b> of the above algorithm is `O(M*N)`, where `M` is the number of rows and `N` is the number of columns. The outer loop visits each cell once, and the flood fill visits each cell at most once more (after which it is no longer `'1'`), so no cell is processed more than a constant number of times.
- The <b>space complexity</b> of the above algorithm is `O(M*N)`. For <b>DFS</b> this is the <b>recursion</b> stack, worst case being an all-land grid where the recursion snakes through every cell before unwinding. For <b>BFS</b> it is the <b>queue</b>. The in-place marking means we spend nothing on a `visited` matrix.

## Max Area of Island (medium)
https://leetcode.com/problems/max-area-of-island/

> You are given an `m x n` binary matrix `grid`. An island is a group of `1`'s (representing land) connected <b>4-directionally</b>. You may assume all four edges of the grid are surrounded by water.
>
> The <b>area</b> of an island is the number of cells with a value `1` in the island. Return the <i>maximum area</i> of an island in `grid`. If there is no island, return `0`.

This follows the <b>Number of Islands</b> pattern almost exactly. We still scan for unvisited land and flood-fill each component — the only change is that instead of counting components we need to <i>measure</i> them.

The elegant way is to have `dfs` <b>return the size of the component it just consumed</b>: a cell contributes `1` for itself plus whatever its four neighbours report back. Because we sink each cell the instant we enter it, every cell contributes to exactly one of these sums, so there is no double counting.

This is a good illustration of why <b>DFS suits connected-component questions</b> — the recursive return value composes the answer for free, with no queue and no bookkeeping.

````js
function maxAreaOfIsland(grid) {
  if (!grid || grid.length === 0 || grid[0].length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0].length;
  let maxArea = 0;

  //returns the size of the connected component containing (row, col)
  function dfs(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return 0;
    if (grid[row][col] !== 1) return 0;

    //sink the cell so it is counted exactly once
    grid[row][col] = 0;

    //1 for the current cell, plus whatever the four neighbours contribute
    return (
      1 +
      dfs(row + 1, col) +
      dfs(row - 1, col) +
      dfs(row, col + 1) +
      dfs(row, col - 1)
    );
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === 1) {
        maxArea = Math.max(maxArea, dfs(row, col));
      }
    }
  }

  return maxArea;
}

const grid1 = [
  [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0],
  [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
];
console.log(`Max area of island: ${maxAreaOfIsland(grid1)}`);
//Max area of island: 6

const grid2 = [[0, 0, 0, 0, 0, 0, 0, 0]];
console.log(`Max area of island: ${maxAreaOfIsland(grid2)}`);
//Max area of island: 0
````

`grid2` has no land at all, and since `maxArea` starts at `0` the "no island" case falls out without a special branch.

- The <b>time complexity</b> of the above algorithm is `O(M*N)`, where `M` is the number of rows and `N` is the number of columns, since each cell is visited a constant number of times.
- The <b>space complexity</b> of the above algorithm is `O(M*N)` for the <b>recursion</b> stack in the worst case, which happens when the grid is one island covering every cell.

## Flood Fill (easy)
https://leetcode.com/problems/flood-fill/

> You are given an image represented by an `m x n` grid of integers, where `image[i][j]` represents the pixel value of the image. You are also given three integers `sr`, `sc`, and `color`. Your task is to perform a <b>flood fill</b> on the image starting from the pixel `image[sr][sc]`.
>
> To perform a flood fill: begin with the starting pixel and change its colour to `color`, then perform the same process for each pixel that is <b>directly adjacent</b> (up, down, left, right) and shares the <i>same colour as the starting pixel</i>. Return the modified image.

The pattern stripped to its essentials — literally the paint-bucket tool from any image editor, and the origin of the name "flood fill" we have been using. There is no outer scan here: we are handed the single starting cell.

Two details are worth pausing on:

1. <b>The comparison is against the <i>original</i> colour of the source pixel, not its current value.</b> We must capture `startColor` <i>before</i> repainting anything, because the very first assignment changes `image[sr][sc]` and would break every later comparison.
2. <b>The `startColor === color` guard is not an optimisation, it is a correctness fix.</b> If the new colour equals the old one, repainting never changes a cell, so it never stops matching, and the recursion bounces between two adjacent cells until the stack overflows. This is the single most common bug in this problem.

Here the repaint <i>is</i> the visited marker — the cleanest possible case of marking in place.

````js
function floodFill(image, sr, sc, color) {
  const rows = image.length;
  const cols = image[0].length;
  const startColor = image[sr][sc];

  //if the source already has the target colour there is nothing to do,
  //and skipping this guard would cause infinite recursion
  if (startColor === color) return image;

  function dfs(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;

    //only repaint cells that share the original colour
    if (image[row][col] !== startColor) return;

    //repainting is itself the "visited" marker
    image[row][col] = color;

    dfs(row + 1, col);
    dfs(row - 1, col);
    dfs(row, col + 1);
    dfs(row, col - 1);
  }

  dfs(sr, sc);
  return image;
}

const image1 = [
  [1, 1, 1],
  [1, 1, 0],
  [1, 0, 1],
];
console.log(JSON.stringify(floodFill(image1, 1, 1, 2)));
//[[2,2,2],[2,2,0],[2,0,1]]

//fresh input: floodFill() repaints the array it is handed
const image2 = [
  [0, 0, 0],
  [0, 1, 1],
];
console.log(JSON.stringify(floodFill(image2, 1, 1, 1)));
//[[0,0,0],[0,1,1]]
````

The bottom-right `1` in `image1` survives: it is only diagonally adjacent to the filled region, and diagonals do not count under 4-connectivity. `image2` exercises the `startColor === color` guard and correctly returns its input untouched.

- The <b>time complexity</b> of the above algorithm is `O(M*N)`, where `M` is the number of rows and `N` is the number of columns, since in the worst case the whole image is one uniform colour and every pixel is repainted once.
- The <b>space complexity</b> of the above algorithm is `O(M*N)` for the <b>recursion</b> stack, again in the uniform-image worst case.

## Island Perimeter (easy)
https://leetcode.com/problems/island-perimeter/

> You are given `row x col` grid representing a map where `grid[i][j] = 1` represents land and `grid[i][j] = 0` represents water. Grid cells are connected <b>horizontally/vertically</b> (not diagonally). The grid is completely surrounded by water, and there is <b>exactly one island</b>.
>
> The island doesn't have "lakes", meaning the water inside isn't connected to the water around the island. One cell is a square with side length 1. Determine the <b>perimeter</b> of the island.

This is the odd member of the family, and that is why it is instructive: <b>it needs no traversal at all</b>.

Because there is exactly one island we never have to identify components — only count edges. Think locally, one cell at a time. Each land cell is a unit square with four sides, and a side is part of the perimeter <i>if and only if</i> the thing across it is water or the outside of the grid. A side facing another land cell is an interior wall between two squares and contributes nothing.

So we reuse the `directions` array and the bounds check with <b>no visited marking, no queue and no recursion</b> — a single pass summing exposed sides:

````js
function islandPerimeter(grid) {
  const rows = grid.length;
  const cols = grid[0].length;

  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ];

  let perimeter = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] !== 1) continue;

      //each land cell contributes one edge per side that faces
      //water or the outside of the grid
      for (const [rowDelta, colDelta] of directions) {
        const nextRow = row + rowDelta;
        const nextCol = col + colDelta;

        const outOfBounds =
          nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols;

        if (outOfBounds || grid[nextRow][nextCol] === 0) {
          perimeter++;
        }
      }
    }
  }

  return perimeter;
}

const grid1 = [
  [0, 1, 0, 0],
  [1, 1, 1, 0],
  [0, 1, 0, 0],
  [1, 1, 0, 0],
];
console.log(`Island perimeter: ${islandPerimeter(grid1)}`);
//Island perimeter: 16

const grid2 = [[1]];
console.log(`Island perimeter: ${islandPerimeter(grid2)}`);
//Island perimeter: 4

const grid3 = [
  [1, 1],
  [1, 1],
];
console.log(`Island perimeter: ${islandPerimeter(grid3)}`);
//Island perimeter: 8
````

`grid3` checks the interior-wall logic nicely: a `2 x 2` block has `4 * 4 = 16` sides in total, but four of them are shared internal walls counted from both sides, giving `16 - 8 = 8`. Notice too that this cell-local counting is why the "no lakes" guarantee can be ignored entirely — a lake's shoreline would be counted correctly as well. That guarantee only matters for approaches that trace the outline.

An equivalent formulation you may see is `perimeter = 4 * landCells - 2 * adjacentPairs`, the same idea with shared walls subtracted in bulk.

- The <b>time complexity</b> of the above algorithm is `O(M*N)`, where `M` is the number of rows and `N` is the number of columns. We touch every cell once and do a constant four-neighbour check on the land ones.
- The <b>space complexity</b> of the above algorithm is `O(1)`. This is the one problem in this pattern needing no auxiliary structure at all — no visited set, no queue, no recursion stack.

## Surrounded Regions (medium)
https://leetcode.com/problems/surrounded-regions/

> You are given an `m x n` matrix `board` containing letters `'X'` and `'O'`. <b>Capture</b> regions that are <i>surrounded</i>:
>
> - <b>Connect</b>: A cell is connected to adjacent cells horizontally or vertically.
> - <b>Region</b>: To form a region connect every `'O'` cell.
> - <b>Surround</b>: The region is surrounded with `'X'` cells if you can connect the region with `'X'` cells and none of the region cells are on the edge of the board.
>
> To capture a surrounded region, replace all `'O'`s with `'X'`s in-place in the original board.

The naive reading leads somewhere painful: for each region of `'O'`s, flood fill it and check whether any cell sits on the border. That works, but it means asking a question about a whole component while you are still discovering it.

The better approach is <b>the inversion trick</b>, one of the highest-value ideas in this pattern: <b>instead of hunting for the regions to capture, find the regions that are safe and capture everything else.</b>

Why is that easier? "Surrounded" is awkward to test, but its negation is trivial — a region survives if and only if it touches the border, and <i>the border cells are known before we traverse anything</i>. So we never discover a component and then interrogate it; we start <b>from the borders</b>, and every `'O'` reachable from a border `'O'` is by definition part of a surviving region.

The implementation uses a <b>three-state trick</b> to stay in place with no extra matrix:

1. Flood fill from every `'O'` on the four borders, marking everything reached with a temporary sentinel `'S'` ("safe").
2. Sweep the board once. Any cell still `'O'` was never reached from a border, so it is genuinely surrounded — flip it to `'X'`. Any `'S'` is restored to `'O'`.

Using a third character rather than a boolean matrix is what lets step 1 double as the visited marker: `'S'` cells are no longer `'O'`, so the recursion will not revisit them.

````js
function solve(board) {
  if (!board || board.length === 0 || board[0].length === 0) return board;

  const rows = board.length;
  const cols = board[0].length;

  //walk every 'O' connected to this border cell and tag it as safe
  function markSafe(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    if (board[row][col] !== 'O') return;

    //'S' means "connected to the border, must survive"
    board[row][col] = 'S';

    markSafe(row + 1, col);
    markSafe(row - 1, col);
    markSafe(row, col + 1);
    markSafe(row, col - 1);
  }

  //seed the traversal from the left and right borders
  for (let row = 0; row < rows; row++) {
    markSafe(row, 0);
    markSafe(row, cols - 1);
  }

  //seed the traversal from the top and bottom borders
  for (let col = 0; col < cols; col++) {
    markSafe(0, col);
    markSafe(rows - 1, col);
  }

  //anything still 'O' was never reached from a border, so it is surrounded;
  //anything marked 'S' goes back to being an 'O'
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col] === 'O') board[row][col] = 'X';
      else if (board[row][col] === 'S') board[row][col] = 'O';
    }
  }

  return board;
}

const board1 = [
  ['X', 'X', 'X', 'X'],
  ['X', 'O', 'O', 'X'],
  ['X', 'X', 'O', 'X'],
  ['X', 'O', 'X', 'X'],
];
console.log(JSON.stringify(solve(board1)));
//[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]

//a fresh board, since solve() rewrites the one it is given
const board2 = [
  ['O', 'O', 'O'],
  ['O', 'O', 'O'],
  ['O', 'O', 'O'],
];
console.log(JSON.stringify(solve(board2)));
//[["O","O","O"],["O","O","O"],["O","O","O"]]
````

Trace `board1` to see the trick pay off. The three-cell region at `(1,1)`, `(1,2)`, `(2,2)` is fully interior, is never reached from a border, and gets captured. The lone `'O'` at `(3,1)` sits on the bottom row, so it is itself a border seed, gets marked `'S'`, and is restored. `board2` shows the other extreme — every cell connects to a border, so nothing is captured.

This border-inversion idea reappears constantly: <b>Number of Enclaves</b>, <b>Number of Closed Islands</b> and <b>Count Sub Islands</b> are the same manoeuvre in different clothes. Whenever a problem asks about regions that <i>do not</i> touch the edge, start from the edge.

- The <b>time complexity</b> of the above algorithm is `O(M*N)`, where `M` is the number of rows and `N` is the number of columns. Border seeding walks `O(M+N)` cells, the flood fills together touch each cell at most once, and the final sweep is one more pass.
- The <b>space complexity</b> of the above algorithm is `O(M*N)` for the <b>recursion</b> stack in the worst case — an all-`'O'` board like `board2`, where one flood fill from the first border cell reaches every cell. The sentinel trick means <b>no</b> extra `visited` matrix, so the recursion stack is the only auxiliary space.

## Rotting Oranges (medium)
https://leetcode.com/problems/rotting-oranges/

> You are given an `m x n` grid where each cell can have one of three values:
>
> - `0` representing an empty cell,
> - `1` representing a fresh orange, or
> - `2` representing a rotten orange.
>
> Every minute, any fresh orange that is <b>4-directionally adjacent</b> to a rotten orange becomes rotten. Return the <i>minimum number of minutes</i> that must elapse until no cell has a fresh orange. If this is impossible, return `-1`.

Now we cross to the BFS half of the pattern, and this problem shows most clearly <b>why DFS cannot be substituted</b>.

The question asks for <i>time</i>, and the rot spreads from all rotten oranges <b>simultaneously</b>. A DFS from each rotten orange would simulate them one after another, so a fresh orange squeezed between two sources could be reached by the long path from the first source before the short path from the second was ever explored. BFS has exactly the property we need: it expands one complete ring at a time, so each fresh orange is rotted by whichever source is nearest.

The technique is <b>multi-source BFS</b>. Rather than one starting cell, we seed the queue with <i>every</i> rotten orange before the loop begins. Conceptually this is a virtual super-source with a zero-cost edge to each rotten orange — the frontier then expands from all of them in lockstep, and each pass of the outer loop is exactly one minute of simulated time.

To count minutes we reuse the `levelSize` idiom from <b>Pattern 07: Tree Breadth First Search</b> verbatim: snapshot the queue length before the inner loop so one outer iteration processes precisely the current ring, then tick the clock once per ring.

Two subtleties handle the edge cases:

- <b>The impossibility check falls out of a `freshCount`.</b> Count the fresh oranges up front and decrement as each rots. If any remain when the queue drains they were unreachable — walled off by empty cells — so return `-1`.
- <b>A grid with no fresh oranges must return `0`, not `-1`.</b> Guarding on `freshCount === 0` before the loop also prevents an off-by-one where we would tick the clock for a final, fruitless ring.

````js
function orangesRotting(grid) {
  const rows = grid.length;
  const cols = grid[0].length;

  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ];

  //seed the queue with EVERY rotten orange, and count the fresh ones
  const queue = [];
  let freshCount = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === 2) queue.push([row, col]);
      else if (grid[row][col] === 1) freshCount++;
    }
  }

  //nothing fresh to rot, so zero minutes have to pass
  if (freshCount === 0) return 0;

  let minutes = 0;

  while (queue.length > 0 && freshCount > 0) {
    //one iteration of this loop is exactly one minute
    const levelSize = queue.length;
    minutes++;

    for (let i = 0; i < levelSize; i++) {
      const [currRow, currCol] = queue.shift();

      for (const [rowDelta, colDelta] of directions) {
        const nextRow = currRow + rowDelta;
        const nextCol = currCol + colDelta;

        if (nextRow < 0 || nextRow >= rows) continue;
        if (nextCol < 0 || nextCol >= cols) continue;

        //only fresh oranges can rot
        if (grid[nextRow][nextCol] !== 1) continue;

        grid[nextRow][nextCol] = 2;
        freshCount--;
        queue.push([nextRow, nextCol]);
      }
    }
  }

  //if any fresh orange was unreachable, the job is impossible
  return freshCount === 0 ? minutes : -1;
}

const grid1 = [
  [2, 1, 1],
  [1, 1, 0],
  [0, 1, 1],
];
console.log(`Minutes until all rotten: ${orangesRotting(grid1)}`);
//Minutes until all rotten: 4

//each call needs its own grid, because rotting is written back into the input
const grid2 = [
  [2, 1, 1],
  [0, 1, 1],
  [1, 0, 1],
];
console.log(`Minutes until all rotten: ${orangesRotting(grid2)}`);
//Minutes until all rotten: -1

const grid3 = [[0, 2]];
console.log(`Minutes until all rotten: ${orangesRotting(grid3)}`);
//Minutes until all rotten: 0

const grid4 = [
  [1, 1, 1],
  [1, 1, 1],
];
console.log(`Minutes until all rotten: ${orangesRotting(grid4)}`);
//Minutes until all rotten: -1
````

All four cases earn their place. `grid1` rots in `4` minutes. In `grid2` the orange at `(2,0)` is cut off by the empty cells at `(1,0)` and `(2,1)`, so `-1`. `grid3` has no fresh oranges, so the `freshCount === 0` guard returns `0` at once. And `grid4` has no rotten orange to seed the queue with at all, so nothing can ever rot and we again get `-1` — a different route to the same answer as `grid2`.

- The <b>time complexity</b> of the above algorithm is `O(M*N)`, where `M` is the number of rows and `N` is the number of columns. The seeding pass is one full scan, and thereafter each cell is enqueued at most once (it stops being a `1` the moment it is enqueued) and dequeued at most once, doing constant work each time.
- The <b>space complexity</b> of the above algorithm is `O(M*N)` for the <b>queue</b>, worst case being a grid where every cell starts rotten and so every cell is queued at once. The rot is written back into the grid, so no separate `visited` matrix is needed — the value `2` is the marker.

## 01 Matrix (medium)
https://leetcode.com/problems/01-matrix/

> Given an `m x n` binary matrix `mat`, return the distance of the <b>nearest</b> `0` for each cell.
>
> The distance between two adjacent cells is `1`.

At first glance this reads like `M*N` independent shortest-path problems — for each cell, go find the closest zero. A BFS per cell would be `O((M*N)^2)`, far too slow.

Turn the question around and it becomes the same <b>multi-source BFS</b> we just wrote. Instead of "where is the nearest zero to this cell?", ask "how far does each zero reach?" — seed the queue with <i>every</i> zero at distance `0` and let the wave expand. Because BFS discovers cells in non-decreasing order of distance, <b>the first time the wave reaches a cell it has arrived from the nearest zero</b>, so we write that distance down and never revisit. One traversal answers the question for every cell at once.

Two implementation notes:

- <b>The `distances` matrix doubles as the visited set.</b> We initialise it to `-1` for "not known yet", so `distances[nextRow][nextCol] !== -1` means "already settled by an equal-or-closer source" and both prevents revisiting and guarantees the smallest distance wins. Using `0` as the sentinel would be a bug, since `0` is a legitimate answer for the source cells.
- <b>We dequeue with a moving `head` index instead of `shift()`.</b> `Array.prototype.shift()` is `O(N)` in the worst case because it reindexes the array, which can quietly turn an `O(M*N)` BFS into something much worse on large inputs. Advancing an index is `O(1)` per dequeue. (The earlier solutions use `shift()` for readability, matching the rest of this repo — but this is the fix worth knowing, and worth mentioning in an interview.)

Since we build a fresh output matrix, this is a case where we do <b>not</b> mark visited in place, and the input `mat` is left untouched.

````js
function updateMatrix(mat) {
  const rows = mat.length;
  const cols = mat[0].length;

  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ];

  //-1 marks "distance not known yet"
  const distances = Array.from({ length: rows }, () => new Array(cols).fill(-1));

  //every zero is a source sitting at distance 0
  const queue = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (mat[row][col] === 0) {
        distances[row][col] = 0;
        queue.push([row, col]);
      }
    }
  }

  let head = 0;
  //using an index instead of shift() keeps each dequeue O(1)
  while (head < queue.length) {
    const [currRow, currCol] = queue[head];
    head++;

    for (const [rowDelta, colDelta] of directions) {
      const nextRow = currRow + rowDelta;
      const nextCol = currCol + colDelta;

      if (nextRow < 0 || nextRow >= rows) continue;
      if (nextCol < 0 || nextCol >= cols) continue;

      //already settled by an equal-or-closer source
      if (distances[nextRow][nextCol] !== -1) continue;

      distances[nextRow][nextCol] = distances[currRow][currCol] + 1;
      queue.push([nextRow, nextCol]);
    }
  }

  return distances;
}

const mat1 = [
  [0, 0, 0],
  [0, 1, 0],
  [1, 1, 1],
];
console.log(JSON.stringify(updateMatrix(mat1)));
//[[0,0,0],[0,1,0],[1,2,1]]

const mat2 = [
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
];
console.log(JSON.stringify(updateMatrix(mat2)));
//[[4,3,2,3,4],[3,2,1,2,3],[2,1,0,1,2],[3,2,1,2,3],[4,3,2,3,4]]
````

`mat2` is the clearest picture of what BFS is doing: with a single zero in the centre, the output is a perfect diamond of <b>Manhattan distances</b> radiating outwards, one ring per level of the traversal.

Note that unlike <b>Rotting Oranges</b> this solution needs no `levelSize` snapshot. There we had to know <i>which</i> ring we were on to report one number of minutes; here we store a distance per cell, so deriving it from the parent's distance plus one is enough and the ring boundaries never need to be observed.

- The <b>time complexity</b> of the above algorithm is `O(M*N)`, where `M` is the number of rows and `N` is the number of columns. Every cell is enqueued exactly once — enqueueing happens only when its distance flips off `-1`, which happens once — and each dequeue does a constant four-neighbour check.
- The <b>space complexity</b> of the above algorithm is `O(M*N)` for the `distances` matrix and the <b>queue</b>. The matrix is the return value, so discounting the output the queue alone is still `O(M*N)` in the worst case of an all-zero input.

## Pacific Atlantic Water Flow (medium)
https://leetcode.com/problems/pacific-atlantic-water-flow/

> There is an `m x n` rectangular island that borders both the <b>Pacific Ocean</b> and the <b>Atlantic Ocean</b>. The Pacific Ocean touches the island's left and top edges, and the Atlantic Ocean touches the island's right and bottom edges.
>
> The island is partitioned into a grid of square cells. You are given an `m x n` integer matrix `heights` where `heights[r][c]` represents the height above sea level of the cell at coordinate `(r, c)`.
>
> Rain water can flow from a cell to a neighbouring cell directly north, south, east, and west <b>if the neighbouring cell's height is less than or equal to the current cell's height</b>. Water can flow from any cell adjacent to an ocean into the ocean.
>
> Return a list of grid coordinates where rain water can flow to <b>both</b> the Pacific and Atlantic oceans.

This is the payoff problem, and it combines every idea above. LeetCode rates it medium, but it is comfortably the hardest of this set, because getting it right takes <b>two</b> insights rather than one.

The brute force is the obvious thing: from each of the `M*N` cells run a traversal downhill and see which oceans it reaches. That is `O((M*N)^2)`, and worse, the results are not reusable between cells because the traversals start at different heights.

<b>Insight one: reverse the traversal.</b> Instead of "from this cell, can water get out?", ask "from this ocean, how far inland can we get?" Start at the ocean borders and walk <b>uphill</b>, stepping only to neighbours <i>at least as high</i> as the current cell. That is the exact reverse of the flow condition, so a cell is reachable from an ocean in our uphill walk if and only if water would flow from that cell down to that ocean. `M*N` traversals collapse into a handful.

<b>Insight two: two independent visited sets, then intersect.</b> Water must reach <i>both</i> oceans, which are two different questions about the same cell. So we run the reverse traversal twice with separate bookkeeping — once seeded from the <b>Pacific</b> border (top row and left column), once from the <b>Atlantic</b> border (bottom row and right column) — and the answer is every cell in <i>both</i> sets.

This is exactly the case flagged in the toolkit where <b>marking visited in place is not an option</b>. If the Pacific pass sank cells in `heights`, the Atlantic pass would be reading a corrupted map. We need two parallel boolean matrices, and that `O(M*N)` space is unavoidable here.

Note also that the reachability condition uses `>=`, not `>`. Water flows across flat ground, so a plateau of equal heights is traversable in both directions — which is precisely why the `reachable` check must come <i>before</i> the height check, or a flat region would loop forever.

````js
function pacificAtlantic(heights) {
  if (!heights || heights.length === 0 || heights[0].length === 0) return [];

  const rows = heights.length;
  const cols = heights[0].length;

  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ];

  //two separate visited sets, one per ocean
  const pacific = Array.from({ length: rows }, () => new Array(cols).fill(false));
  const atlantic = Array.from({ length: rows }, () => new Array(cols).fill(false));

  //we walk UPHILL from the ocean, which is the reverse of how water flows
  function dfs(row, col, reachable) {
    reachable[row][col] = true;

    for (const [rowDelta, colDelta] of directions) {
      const nextRow = row + rowDelta;
      const nextCol = col + colDelta;

      if (nextRow < 0 || nextRow >= rows) continue;
      if (nextCol < 0 || nextCol >= cols) continue;

      //already known to reach this ocean
      if (reachable[nextRow][nextCol]) continue;

      //water only flows downhill, so going backwards we may only step
      //to a neighbour that is at least as high as the current cell
      if (heights[nextRow][nextCol] < heights[row][col]) continue;

      dfs(nextRow, nextCol, reachable);
    }
  }

  //Pacific touches the top row and the left column,
  //Atlantic touches the bottom row and the right column
  for (let row = 0; row < rows; row++) {
    dfs(row, 0, pacific);
    dfs(row, cols - 1, atlantic);
  }
  for (let col = 0; col < cols; col++) {
    dfs(0, col, pacific);
    dfs(rows - 1, col, atlantic);
  }

  //the answer is the intersection of the two sets
  const result = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (pacific[row][col] && atlantic[row][col]) {
        result.push([row, col]);
      }
    }
  }

  return result;
}

const heights1 = [
  [1, 2, 2, 3, 5],
  [3, 2, 3, 4, 4],
  [2, 4, 5, 3, 1],
  [6, 7, 1, 4, 5],
  [5, 1, 1, 2, 4],
];
console.log(JSON.stringify(pacificAtlantic(heights1)));
//[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]

const heights2 = [
  [10, 10, 10],
  [10, 1, 10],
  [10, 10, 10],
];
console.log(JSON.stringify(pacificAtlantic(heights2)));
//[[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]]
````

`heights2` shows the plateau behaviour together with the `<` rejection: the whole ring of `10`s is one flat region touching both oceans, while the pit of height `1` in the middle drains nowhere and is correctly excluded.

Note that <b>DFS is fine here even though we run four traversals</b>, because this is a reachability question, not a distance question. BFS would give the same answer; we would just swap the recursion for a queue. That is the rule of this pattern restated one last time: <i>reachability and component structure admit either traversal, but distance and simultaneous spread demand BFS</i>.

- The <b>time complexity</b> of the above algorithm is `O(M*N)`, where `M` is the number of rows and `N` is the number of columns. Each traversal visits each cell at most once — the `reachable` check guarantees it — so the four border loops together are `O(M*N)`, and the final intersection sweep is one more pass.
- The <b>space complexity</b> of the above algorithm is `O(M*N)`. This covers the two boolean `reachable` matrices, unavoidable since the grid must be traversed twice under different rules, plus the <b>recursion</b> stack, which on a completely flat grid can reach every cell before unwinding.

###### #Island #MatrixTraversal #BFS #DFS #JavaScript #GrokkingTheCodingInterviewPatterns #LeetCode #DataStructures #Algorithms
