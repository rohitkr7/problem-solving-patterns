# Pattern 7: Tree Breadth First Search

This pattern is based on the <b>Breadth First Search (BFS)</b> technique to traverse a tree.

Any problem involving the traversal of a tree in a level-by-level order can be efficiently solved using this approach. We will use a <b>Queue</b> to keep track of all the nodes of a level before we jump onto the next level. This also means that the space complexity of the algorithm will be `O(W)`, where `W` is the maximum number of nodes on any level.


## Binary Tree Level Order Traversal (easy)
https://leetcode.com/problems/binary-tree-level-order-traversal/

> Given a binary tree, populate an array to represent its level-by-level traversal. You should populate the values of all <b>nodes of each level from left to right</b> in separate sub-arrays.

Since we need to traverse all nodes of each level before moving onto the next level, we can use the <b>Breadth First Search (BFS)</b> technique to solve this problem.

We can use a <b>Queue</b> to efficiently traverse in <b>BFS</b> fashion. Here are the steps of our algorithm:
1. Start by pushing the `root` node to the queue.
2. Keep iterating until the <b>queue</b> is empty.
3. In each iteration, first count the elements in the <b>queue</b> (let’s call it `levelSize`). We will have these many nodes in the current level.
4. Next, remove `levelSize` nodes from the <b>queue</b> and push their `value` in an array to represent the current level.
5. After removing each node from the queue, insert both of its children into the queue.
6. If the <b>queue</b> is not empty, repeat from <i>step 3</i> for the next level.

````java
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) {
        val = x;
    }
}

class Solution {
    public static List<List<Integer>> traverse(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) {
            return result;
        }

        Queue<TreeNode> queue = new LinkedList<>();
        // Start by pushing the root node to the queue.
        queue.offer(root);
        
        // Keep iterating until the queue is empty.
        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            // In each iteration, first count the elements in the queue (let’s call it levelSize). We will have these many nodes in the current level.
            List<Integer> currentLevel = new ArrayList<>();

            for (int i = 0; i < levelSize; i++) {
                TreeNode currentNode = queue.poll();
                // add the node to the current level
                currentLevel.add(currentNode.val);
                
                // insert the children of current node in the queue
                if (currentNode.left != null) {
                    queue.offer(currentNode.left);
                }
                if (currentNode.right != null) {
                    queue.offer(currentNode.right);
                }
            }
            result.add(currentLevel);
        }

        // Next, remove levelSize nodes from the queue and push their value in an array to represent the current level.
        // After removing each node from the queue, insert both of its children into the queue.
        // If the queue is not empty, repeat from step 3 for the next level.
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(12);
        root.left = new TreeNode(7);
        root.right = new TreeNode(1);
        root.left.left = new TreeNode(9);
        root.right.left = new TreeNode(10);
        root.right.right = new TreeNode(5);
        System.out.println("Level order traversal: " + traverse(root));
    }
}
````

- The time complexity of the above algorithm is `O(N)`, where `N` is the total number of nodes in the tree. This is due to the fact that we traverse each node once.
- The space complexity of the above algorithm will be `O(N)` as we need to return a list containing the level order traversal. We will also need `O(N)` space for the queue. Since we can have a maximum of `N/2` nodes at any level (this could happen only at the lowest level), therefore we will need `O(N)` space to store them in the queue.

### Easier to understand solution w/o `Deque()`
````java
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

class Solution {
    public static List<List<Integer>> levelOrder(TreeNode root) {
        // If root is null return an empty array
        if (root == null) return new ArrayList<>();

        // declare output array
        List<List<Integer>> levels = new ArrayList<>();
        
        // initialize the queue with root
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            // get the length prior to deque
            int queueLength = queue.size();

            // declare this level
            List<Integer> currLevel = new ArrayList<>();

            // loop through to exhuast all options and only to include nodes at currLevel
            for (int i = 0; i < queueLength; i++) {
                // get next node
                TreeNode currNode = queue.poll();

                if (currNode.left != null) {
                    queue.offer(currNode.left);
                }
                if (currNode.right != null) {
                    queue.offer(currNode.right);
                }
                // after we add left and right for current, we add to currLevel
                currLevel.add(currNode.val);
            }
            // Level has been finished. Push into output array
            levels.add(currLevel);
        }

        return levels;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);
        System.out.println(levelOrder(root));
        // [[3], [9, 20], [15, 7]]
        
        TreeNode root2 = new TreeNode(1);
        System.out.println(levelOrder(root2));
        // [[1]]
        
        TreeNode root3 = null;
        System.out.println(levelOrder(root3));
        // []
    }
}
````

## Reverse Level Order Traversal (easy)
https://leetcode.com/problems/binary-tree-level-order-traversal-ii/
> Given a binary tree, populate an array to represent its level-by-level traversal in reverse order, i.e., <b>the lowest level comes first</b>. You should populate the values of all nodes in each level from left to right in separate sub-arrays.

This problem follows the <b>Binary Tree Level Order Traversal</b> pattern. We can follow the same <b>BFS</b> approach. The only difference will be that instead of appending the current level at the end, we will append the current level at the beginning of the result list.
````java
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

class Solution {
    public static List<List<Integer>> reverseLevelOrder(TreeNode root) {
        // If root is null return an empty array
        if (root == null) return new ArrayList<>();

        // declare output array
        List<List<Integer>> levels = new ArrayList<>();
        
        // initialize the queue with root
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            // get the length prior to deque
            int queueLength = queue.size();

            // declare this level
            List<Integer> currLevel = new ArrayList<>();

            // loop through to exhuast all options and only to include nodes at currLevel
            for (int i = 0; i < queueLength; i++) {
                // get next node
                TreeNode currNode = queue.poll();

                if (currNode.left != null) {
                    queue.offer(currNode.left);
                }
                if (currNode.right != null) {
                    queue.offer(currNode.right);
                }
                // after we add left and right for current, we add to currLevel
                currLevel.add(currNode.val);
            }
            // Level has been finished. Push into output array in reverse order
            levels.add(0, currLevel);
        }

        return levels;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(12);
        root.left = new TreeNode(7);
        root.right = new TreeNode(1);
        root.left.left = new TreeNode(9);
        root.left.right = new TreeNode(10);
        root.right.right = new TreeNode(5);
        System.out.println(reverseLevelOrder(root));
        // [[9, 10, 5], [7, 1], [12]];
    }
}
````
- The time complexity of the above algorithm is `O(N)`, where `N` is the total number of nodes in the tree. This is due to the fact that we traverse each node once.
- The space complexity of the above algorithm will be `O(N)` as we need to return a list containing the level order traversal. We will also need `O(N)` space for the queue. Since we can have a maximum of `N/2` nodes at any level (this could happen only at the lowest level), therefore we will need `O(N)` space to store them in the queue.

## 🌴 Zigzag Traversal (medium)
https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/

> Given a binary tree, populate an array to represent its zigzag level order traversal. You should populate the values of all <b>nodes of the first level from left to right</b>, then <b>right to left for the next level</b> and keep alternating in the same manner for the following levels.

This problem follows the <b>Binary Tree Level Order Traversal</b> pattern. We can follow the same <b>BFS</b> approach. The only additional step we have to keep in mind is to alternate the level order traversal, which means that for every other level, we will traverse similar to <b>[Reverse Level Order Traversal](#reverse-level-order-traversal-easy)</b>.


````java
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

class Solution {
    public static List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        // If root is null return an empty array
        if (root == null) return new ArrayList<>();

        // declare output array
        List<List<Integer>> levels = new ArrayList<>();
        boolean leftToRight = true;
        
        // initialize the queue with root
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            // get the length prior to deque
            int queueLength = queue.size();

            // declare this level
            List<Integer> currLevel = new ArrayList<>();

            // loop through to exhaust all options and only to include nodes at currLevel
            for (int i = 0; i < queueLength; i++) {
                // get next node
                TreeNode currNode = queue.poll();

                // add the node to the current level based on the traverse direction
                if (leftToRight) {
                    currLevel.add(currNode.val);
                } else {
                    currLevel.add(0, currNode.val);
                }

                // insert the children of current node in the queue
                if (currNode.left != null) {
                    queue.offer(currNode.left);
                }
                if (currNode.right != null) {
                    queue.offer(currNode.right);
                }
            }
            // Level has been finished. Push into output array
            levels.add(currLevel);

            // reverse the traversal direction
            leftToRight = !leftToRight;
        }
        return levels;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);
        root.right.left = new TreeNode(6);
        root.right.right = new TreeNode(7);
        System.out.println(zigzagLevelOrder(root));
        // [[1], [3, 2], [4, 5, 6, 7]];

        TreeNode root2 = new TreeNode(3);
        root2.left = new TreeNode(9);
        root2.right = new TreeNode(20);
        root2.right.left = new TreeNode(15);
        root2.right.right = new TreeNode(7);
        System.out.println(zigzagLevelOrder(root2));
        // [[3], [20, 9], [15, 7]];

        TreeNode root3 = new TreeNode(1);
        System.out.println(zigzagLevelOrder(root3));
        // [[1]];

        TreeNode root4 = null;
        System.out.println(zigzagLevelOrder(root4));
        // [];
    }
}
````
- The time complexity of the above algorithm is `O(N)`, where `N` is the total number of nodes in the tree. This is due to the fact that we traverse each node once.
- The space complexity of the above algorithm will be `O(N)` as we need to return a list containing the level order traversal. We will also need `O(N)` space for the queue. Since we can have a maximum of `N/2` nodes at any level (this could happen only at the lowest level), therefore we will need `O(N)` space to store them in the queue.

## Level Averages in a Binary Tree (easy)
https://leetcode.com/problems/average-of-levels-in-binary-tree/

> Given a binary tree, populate an array to represent the <b>averages of all of its levels</b>

This problem follows the <b>Binary Tree Level Order Traversal</b> pattern. We can follow the same <b>BFS</b> approach. The only difference will be that instead of keeping track of all nodes of a level, we will only track the running sum of the values of all nodes in each level. In the end, we will append the average of the current level to the result array.

````java
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

class Solution {
    public static List<Double> findLevelAverages(TreeNode root) {
        // If root is null return an empty array
        if (root == null) return new ArrayList<>();

        // declare output array
        List<Double> result = new ArrayList<>();
        
        // initialize the queue with root
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            double levelSum = 0;

            for (int i = 0; i < levelSize; i++) {
                // get next node
                TreeNode currNode = queue.poll();

                // add the node's value to the running sum
                levelSum += currNode.val;

                // insert the children of current node in the queue
                if (currNode.left != null) {
                    queue.offer(currNode.left);
                }
                if (currNode.right != null) {
                    queue.offer(currNode.right);
                }
            }
            // append the current level's average to the result array
            result.add(levelSum / levelSize);
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(12);
        root.left = new TreeNode(7);
        root.right = new TreeNode(1);
        root.left.left = new TreeNode(9);
        root.left.right = new TreeNode(2);
        root.right.left = new TreeNode(10);
        root.right.right = new TreeNode(5);
        System.out.println("Level averages are: " + findLevelAverages(root));
        // [12.0, 4.0, 6.5];
    }
}
````
- The time complexity of the above algorithm is `O(N)`, where `N` is the total number of nodes in the tree. This is due to the fact that we traverse each node once.
- The space complexity of the above algorithm will be `O(N)` which is required for the queue. Since we can have a maximum of `N/2` nodes at any level (this could happen only at the lowest level), therefore we will need `O(N)` space to store them in the queue

### Level Maximum in a Binary Tree 
https://leetcode.com/problems/maximum-level-sum-of-a-binary-tree/
> 🌟  Find the largest value on each level of a binary tree.

We will follow a similar approach, but instead of having a running sum we will track the maximum value of each level.

`maxValue = Math.max(maxValue, currentNode.val)`

````java
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

class Solution {
    public static List<Integer> largestValue(TreeNode root) {
        // If root is null return an empty array
        if (root == null) return new ArrayList<>();

        // declare output array
        List<Integer> result = new ArrayList<>();
        
        // initialize the queue with root
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            int maxValue = Integer.MIN_VALUE;

            for (int i = 0; i < levelSize; i++) {
                // get next node
                TreeNode currNode = queue.poll();

                maxValue = Math.max(maxValue, currNode.val);

                // insert the children of current node in the queue
                if (currNode.left != null) {
                    queue.offer(currNode.left);
                }
                if (currNode.right != null) {
                    queue.offer(currNode.right);
                }
            }
            // append the current level's max to the result array
            result.add(maxValue);
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(12);
        root.left = new TreeNode(7);
        root.right = new TreeNode(1);
        root.left.left = new TreeNode(9);
        root.left.right = new TreeNode(2);
        root.right.left = new TreeNode(10);
        root.right.right = new TreeNode(5);

        System.out.println("Max value's for each level are: " + largestValue(root));
        // [12, 7, 10];
    }
}
````

## Minimum Depth of a Binary Tree (easy)
https://leetcode.com/problems/minimum-depth-of-binary-tree/

> Find the minimum depth of a binary tree. The minimum depth is the number of nodes along the <b>shortest path from the root node to the nearest leaf node</b>.

This problem follows the <b>Binary Tree Level Order Traversal</b> pattern. We can follow the same <b>BFS</b> approach. The only difference will be, instead of keeping track of all the nodes in a level, we will only track the depth of the tree. As soon as we find our first leaf node, that level will represent the minimum depth of the tree.

````java
import java.util.LinkedList;
import java.util.Queue;

class Solution {
    public static int findMinimumDepth(TreeNode root) {
        if (root == null) return 0;
        
        // initialize the queue with root
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        int minimumTreeDepth = 0;

        while (!queue.isEmpty()) {
            minimumTreeDepth++;
            int levelSize = queue.size();

            for (int i = 0; i < levelSize; i++) {
                // get next node
                TreeNode currNode = queue.poll();

                // check if this is a leaf node
                if (currNode.left == null && currNode.right == null) {
                    return minimumTreeDepth;
                }

                // insert the children of current node in the queue
                if (currNode.left != null) {
                    queue.offer(currNode.left);
                }
                if (currNode.right != null) {
                    queue.offer(currNode.right);
                }
            }
        }
        return minimumTreeDepth;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(12);
        root.left = new TreeNode(7);
        root.right = new TreeNode(1);
        root.right.left = new TreeNode(10);
        root.right.right = new TreeNode(5);
        System.out.println("Tree Minimum Depth: " + findMinimumDepth(root));
        root.left.left = new TreeNode(9);
        root.right.left.left = new TreeNode(11);
        System.out.println("Tree Minimum Depth: " + findMinimumDepth(root));
    }
}
````
- The time complexity of the above algorithm is `O(N)`, where `N` is the total number of nodes in the tree. This is due to the fact that we traverse each node once.
- The space complexity of the above algorithm will be `O(N)` which is required for the queue. Since we can have a maximum of `N/2` nodes at any level (this could happen only at the lowest level), therefore we will need `O(N)` space to store them in the queue.

### Maximum Depth of a Binary Tree
https://leetcode.com/problems/maximum-depth-of-binary-tree/
> Given a binary tree, find its maximum depth (or height).

We will follow a similar approach. Instead of returning as soon as we find a leaf node, we will keep traversing for all the levels, incrementing `maximumDepth` each time we complete a level. 
````java
import java.util.LinkedList;
import java.util.Queue;

class Solution {
    public static int findMaximumDepth(TreeNode root) {
        if (root == null) return 0;
        
        // initialize the queue with root
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        int maximumTreeDepth = 0;

        while (!queue.isEmpty()) {
            maximumTreeDepth++;
            int levelSize = queue.size();

            for (int i = 0; i < levelSize; i++) {
                // get next node
                TreeNode currNode = queue.poll();

                // insert the children of current node in the queue
                if (currNode.left != null) {
                    queue.offer(currNode.left);
                }
                if (currNode.right != null) {
                    queue.offer(currNode.right);
                }
            }
        }
        return maximumTreeDepth;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(12);
        root.left = new TreeNode(7);
        root.right = new TreeNode(1);
        root.right.left = new TreeNode(10);
        root.right.right = new TreeNode(5);
        System.out.println("Tree Maximum Depth: " + findMaximumDepth(root));
        root.left.left = new TreeNode(9);
        root.right.left.left = new TreeNode(11);
        System.out.println("Tree Maximum Depth: " + findMaximumDepth(root));
    }
}
````
## Level Order Successor (easy) 
> Given a binary tree and a node, find the level order successor of the given node in the tree. The level order successor is the node that appears right after the given node in the level order traversal.

This problem follows the <b>Binary Tree Level Order Traversal</b> pattern. We can follow the same <b>BFS</b> approach. The only difference will be that we will not keep track of all the levels. Instead we will keep inserting child nodes to the queue. As soon as we find the given node, we will return the next node from the <b>queue</b> as the level order successor.

````java
import java.util.LinkedList;
import java.util.Queue;

class Solution {
    public static TreeNode findSuccessor(TreeNode root, int key) {
        if (root == null) return null;

        // initialize the queue with root
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            // get next node
            TreeNode currNode = queue.poll();

            // insert the children of current node in the queue
            if (currNode.left != null) {
                queue.offer(currNode.left);
            }
            if (currNode.right != null) {
                queue.offer(currNode.right);
            }

            // break if we have found the key
            if (currNode.val == key) {
                break;
            }
        }
        
        if (!queue.isEmpty()) return queue.poll();

        return null;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(12);
        root.left = new TreeNode(7);
        root.right = new TreeNode(1);
        root.left.left = new TreeNode(9);
        root.right.left = new TreeNode(10);
        root.right.right = new TreeNode(5);

        TreeNode result = findSuccessor(root, 12);
        if (result != null) System.out.println(result.val);

        result = findSuccessor(root, 9);
        if (result != null) System.out.println(result.val);
    }
}
````

- The time complexity of the above algorithm is `O(N)`, where `N` is the total number of nodes in the tree. This is due to the fact that we traverse each node once.
- The space complexity of the above algorithm will be `O(N)` which is required for the queue. Since we can have a maximum of `N/2` nodes at any level (this could happen only at the lowest level), therefore we will need `O(N)` space to store them in the queue.

## 😕 Connect Level Order Siblings (medium)
https://leetcode.com/problems/populating-next-right-pointers-in-each-node/
> Given a binary tree, connect each node with its level order successor. The last node of each level should point to a `null` node.

This problem follows the <b>Binary Tree Level Order Traversal</b> pattern. We can follow the same <b>BFS</b> approach. The only difference is that while traversing a level we will remember the previous node to connect it with the current node.
````java
import java.util.LinkedList;
import java.util.Queue;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode next;

    TreeNode(int x) {
        val = x;
    }

    // level order traversal using 'next' pointer
    void printLevelOrder() {
        System.out.println("Level order traversal using 'next' pointer: ");
        TreeNode nextLevelRoot = this;
        while (nextLevelRoot != null) {
            TreeNode currentNode = nextLevelRoot;
            nextLevelRoot = null;
            while (currentNode != null) {
                System.out.print(currentNode.val + " ");
                if (nextLevelRoot == null) {
                    if (currentNode.left != null) {
                        nextLevelRoot = currentNode.left;
                    } else if (currentNode.right != null) {
                        nextLevelRoot = currentNode.right;
                    }
                }
                currentNode = currentNode.next;
            }
            System.out.println();
        }
    }
}

class Solution {
    public static void connectLevelOrderSiblings(TreeNode root) {
        // if root is null return
        if (root == null) return;
        
        // initialize the queue with root
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        
        while (!queue.isEmpty()) {
            TreeNode previousNode = null;
            
            // get length prior to dequeue
            int levelSize = queue.size();
            
            // connect all nodes of this level
            for (int i = 0; i < levelSize; i++) {
                // get the next node
                TreeNode currentNode = queue.poll();
                
                if (previousNode != null) {
                    previousNode.next = currentNode;
                }
                previousNode = currentNode;
                
                // insert the children of currentNode in the queue
                if (currentNode.left != null) {
                    queue.offer(currentNode.left);
                }
                if (currentNode.right != null) {
                    queue.offer(currentNode.right);
                }
            }
        }
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(12);
        root.left = new TreeNode(7);
        root.right = new TreeNode(1);
        root.left.left = new TreeNode(9);
        root.right.left = new TreeNode(10);
        root.right.right = new TreeNode(5);
        
        connectLevelOrderSiblings(root);
        root.printLevelOrder();
    }
}
````
- The time complexity of the above algorithm is `O(N)`, where `N` is the total number of nodes in the tree. This is due to the fact that we traverse each node once.
- The space complexity of the above algorithm will be `O(N)`, which is required for the queue. Since we can have a maximum of `N/2`nodes at any level (this could happen only at the lowest level), therefore we will need `O(N)` space to store them in the queue.

## 🌟 Connect All Level Order Siblings (medium) 
> Given a binary tree, connect each node with its level order successor. The last node of each level should point to the first node of the next level.

This problem follows the <b>Binary Tree Level Order Traversal</b> pattern. We can follow the same <b>BFS</b> approach. The only difference will be that while traversing we will remember (irrespective of the level) the previous node to connect it with the current node.

````java
import java.util.LinkedList;
import java.util.Queue;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode next;

    TreeNode(int x) {
        val = x;
    }

    // tree traversal using 'next' pointer
    void printTree() {
        System.out.print("Traversal using 'next' pointer: ");
        TreeNode current = this;
        while (current != null) {
            System.out.print(current.val + " ");
            current = current.next;
        }
        System.out.println();
    }
}

class Solution {
    public static void connectAllSiblings(TreeNode root) {
        if (root == null) {
            return;
        }
        
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        
        TreeNode currentNode = null;
        TreeNode previousNode = null;
        
        while (!queue.isEmpty()) {
            currentNode = queue.poll();
            
            if (previousNode != null) {
                previousNode.next = currentNode;
            }
            
            previousNode = currentNode;
            
            // insert the children of the currentNode into the queue
            if (currentNode.left != null) {
                queue.offer(currentNode.left);
            }
            if (currentNode.right != null) {
                queue.offer(currentNode.right);
            }
        }
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(12);
        root.left = new TreeNode(7);
        root.right = new TreeNode(1);
        root.left.left = new TreeNode(9);
        root.right.left = new TreeNode(10);
        root.right.right = new TreeNode(5);
        
        connectAllSiblings(root);
        root.printTree();
    }
}
````

- The time complexity of the above algorithm is `O(N)`, where `N` is the total number of nodes in the tree. This is due to the fact that we traverse each node once.
- The space complexity of the above algorithm will be `O(N)` which is required for the queue. Since we can have a maximum of `N/2` nodes at any level (this could happen only at the lowest level), therefore we will need `O(N)` space to store them in the queue.
## 🌟 Right View of a Binary Tree (easy) 
https://leetcode.com/problems/binary-tree-right-side-view/

> Given a binary tree, return an array containing nodes in its right view. The right view of a binary tree is the set of <b>nodes visible when the tree is seen from the right side</b>.

````java
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) {
        val = x;
    }
}

class Solution {
    public static List<Integer> treeRightView(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        
        if (root == null) {
            return result;
        }
        
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        
        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            
            for (int i = 0; i < levelSize; i++) {
                TreeNode currentNode = queue.poll();
                
                // if it is the last node of this level,
                // add it to the result
                if (i == levelSize - 1) {
                    result.add(currentNode.val);
                }
                
                // insert the children of current node in the queue
                if (currentNode.left != null) {
                    queue.offer(currentNode.left);
                }
                if (currentNode.right != null) {
                    queue.offer(currentNode.right);
                }
            }
        }

        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(12);
        root.left = new TreeNode(7);
        root.right = new TreeNode(1);
        root.left.left = new TreeNode(9);
        root.right.left = new TreeNode(10);
        root.right.right = new TreeNode(5);
        root.left.left.left = new TreeNode(3);
        System.out.println("Tree right view: " + treeRightView(root));
    }
}
````
- The time complexity of the above algorithm is `O(N)`, where `N` is the total number of nodes in the tree. This is due to the fact that we traverse each node once
- The space complexity of the above algorithm will be `O(N)` as we need to return a list containing the level order traversal. We will also need `O(N)` space for the queue. Since we can have a maximum of `N/2` nodes at any level (this could happen only at the lowest level), therefore we will need `O(N)` space to store them in the queue.

### Similar Questions
> Given a binary tree, return an array containing nodes in its left view. The left view of a binary tree is the set of nodes visible when the tree is seen from the left side.

We will be following a similar approach, but instead of appending the last element of each level, we will be appending the first element of each level to the output array.

````java
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) {
        val = x;
    }
}

class Solution {
    public static List<Integer> treeLeftView(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        
        if (root == null) {
            return result;
        }
        
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        
        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            
            for (int i = 0; i < levelSize; i++) {
                TreeNode currentNode = queue.poll();
                
                // if it is the first node of this level,
                // add it to the result
                if (i == 0) {
                    result.add(currentNode.val);
                }
                
                // insert the children of current node in the queue
                if (currentNode.left != null) {
                    queue.offer(currentNode.left);
                }
                if (currentNode.right != null) {
                    queue.offer(currentNode.right);
                }
            }
        }

        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(12);
        root.left = new TreeNode(7);
        root.right = new TreeNode(1);
        root.left.left = new TreeNode(9);
        root.right.left = new TreeNode(10);
        root.right.right = new TreeNode(5);
        root.left.left.left = new TreeNode(3);
        System.out.println("Tree left view: " + treeLeftView(root));
    }
}
````
