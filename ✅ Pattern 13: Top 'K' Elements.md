# Pattern 13: Top 'K' Elements

Any problem that asks us to find the <b>top/smallest/frequent K</b> elements among a given set falls under this pattern.

<s>The best data structure that comes to mind to keep track of <b>K</b> elements is <s>Heap</s>. This pattern will make use of the <s><b>Heap</b></s> to solve multiple problems dealing with <b>K</b> elements at a time from a set of given elements.</s>

### ❗ NOTE

Although this course uses <b>Heaps</b> to solve <b>Top 'K' Elements</b> problems, <b>JavaScript</b> does not have a built in method for <b>Heaps/Priority Queues</b>. It can be very time consuming to implement a <b>Heap class</b> from scratch, especially during an interview. After reviewing the <i>JavaScript</i> solutions on <i>Leetcode</i> the most effecient way to solve a <b>Top 'K' Elements</b> problem is usually with <b>[QuickSort](https://github.com/Chanda-Abdul/leetcode/blob/master/0%20%E2%9D%97Sort%20Algorithms.md#-quick-sort)</b>, <b>[BinarySearch](https://github.com/Chanda-Abdul/leetcode/blob/master/0%20%E2%9D%97Sort%20Algorithms.md#binary-search)</b>, <b>[BucketSort](https://initjs.org/bucket-sort-in-javascript-dc040b8f0058)</b>, <b>[Greedy Algorithms](https://github.com/Chanda-Abdul/Grokking-Algorithm-Book-Notes/blob/main/8.%20Greedy%20Algoritms.md)</b>, or <b>[HashMaps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)</b>. For more information take a look at these

- [js heap implementation](https://dandkim.com/js-heap-implementation/)
- [implementing heaps in javascript](https://blog.bitsrc.io/implementing-heaps-in-javascript-c3fbf1cb2e65)
- [heap data structure in javascript](https://learnersbucket.com/tutorials/array/heap-data-structure-in-javascript/)

## Top 'K' Numbers (easy)

> Given an unsorted array of numbers, find the `K` largest numbers in it.

<b>Note:</b> For a detailed discussion about different approaches to solve this problem, take a look at [Kth Smallest Number](#kth-smallest-number-easy).

A <b>brute force solution</b> could be to sort the array and return the <b>largest K numbers</b>. The time complexity of such an algorithm will be `O(N*logN)` as we need to use a sorting algorithm like <b>[Quicksort](https://github.com/Chanda-Abdul/leetcode/blob/master/%E2%9D%97Sort%20Algorithms.md#-quick-sort)</b>. Can we do better than that?

<!-- <s>The best data structure that comes to mind to keep track of top `K` elements is Heap. Let's see if we can use a heap to find a better algorithm.

If we iterate through the array one element at a time and keep `K` largest numbers in a heap such that each time we find a larger number than the smallest number in the heap, we do two things:
1. Take out the smallest number from the heap, and
2. Insert the larger number into the heap.

This will ensure that we always have `K` largest numbers in the heap. The most efficient way to repeatedly find the smallest number among a set of numbers will be to use a min-heap. As we know, we can find the smallest number in a min-heap in constant time `O(1)`, since the smallest number is always at the root of the heap. Extracting the smallest number from a min-heap will take `O(logN)` (if the heap has `N` elements) as the heap needs to readjust after the removal of an element.</s>

Let's take <b>Example 1</b> to go through each step of our algorithm:

Given array: `[3, 1, 5, 12, 2, 11]`, and `K=3`
<s>

1. First, let's insert `K` elements in the min-heap.
2. After the insertion, the heap will have three numbers `[3, 1, 5]` with `1` being the root as it is the smallest element.
3. We`ll iterate through the remaining numbers and perform the above-mentioned two steps if we find a number larger than the root of the heap.
4. The 4th number is `12` which is larger than the root (which is `1`), so let's take out `1` and insert `12`. Now the heap will have `[3, 5, 12]` with `3` being the root as it is the smallest element.
5. The 5th number is `2` which is not bigger than the root of the heap (`3`), so we can skip this as we already have top three numbers in the heap.
6. The last number is `11` which is bigger than the root (which is `3`), so let's take out `3` and insert `11`. Finally, the heap has the largest three numbers: [5, 12, 11]

As discussed above, it will take us `O(logK)` to extract the minimum number from the min-heap. So the overall time complexity of our algorithm will be `O(K*logK+(N-K)*logK)` since, first, we insert `K` numbers in the heap and then iterate through the remaining numbers and at every step, in the worst case, we need to extract the minimum number and insert a new number in the heap. This algorithm is better than `O(N*logN)`.</s> -->

```java
import java.util.*;

class Solution {
    public static List<Integer> findKLargestNumbers(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>((n1, n2) -> n1 - n2);
        // put first 'K' numbers in the min heap
        for (int i = 0; i < k; i++) {
            minHeap.add(nums[i]);
        }

        // go through the remaining numbers of the array, if the number from the array is bigger than the
        // top (smallest) number of the min-heap, remove the top number from heap and add the number from array
        for (int i = k; i < nums.length; i++) {
            if (nums[i] > minHeap.peek()) {
                minHeap.poll();
                minHeap.add(nums[i]);
            }
        }

        // the heap has the top 'K' numbers, return them in a list
        return new ArrayList<>(minHeap);
    }

    public static void main(String[] args) {
        List<Integer> result = findKLargestNumbers(new int[]{3, 1, 5, 12, 2, 11}, 3);
        System.out.println("Here are the top K numbers: " + result);

        result = findKLargestNumbers(new int[]{5, 12, 11, -1, 12}, 3);
        System.out.println("Here are the top K numbers: " + result);
    }
}
```

- As discussed above, the time complexity of this algorithm is `O(K * log K +(N - K) * logK)`, which is asymptotically equal to `O(N*logK)`.
- The space complexity will be `O(K)` since we need to store the top `K` numbers in an array.

## Kth Smallest Number (easy)

https://leetcode.com/problems/kth-largest-element-in-an-array/

> Given an unsorted array of numbers, find `Kth` smallest number in it.
>
> Please note that it is the `Kth` smallest number in the sorted order, not the `Kth` distinct element.

```java
import java.util.*;

class Solution {
    public static int findKthLargestNumber(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>((n1, n2) -> n1 - n2);
        // put first 'K' numbers in the min heap
        for (int i = 0; i < k; i++) {
            minHeap.add(nums[i]);
        }

        // go through the remaining numbers of the array, if the number from the array is bigger than the
        // top (smallest) number of the min-heap, remove the top number from heap and add the number from array
        for (int i = k; i < nums.length; i++) {
            if (nums[i] > minHeap.peek()) {
                minHeap.poll();
                minHeap.add(nums[i]);
            }
        }

        // the root of the heap has the Kth largest number
        return minHeap.peek();
    }

    public static void main(String[] args) {
        int result = findKthLargestNumber(new int[]{3, 2, 3, 1, 2, 4, 5, 5, 6}, 4);
        System.out.println("Here is the top K number: " + result); // 4

        result = findKthLargestNumber(new int[]{3, 1, 5, 12, 2, 11}, 3);
        System.out.println("Here is the top K number: " + result); // 5

        result = findKthLargestNumber(new int[]{5, 12, 11, -1, 12}, 3);
        System.out.println("Here is the top K number: " + result); // 11
    }
}
```

- As discussed above, the time complexity of this algorithm is `O(K * log K +(N - K) * logK)`, which is asymptotically equal to `O(N*logK)`.
- The space complexity will be `O(K)` since we need to store the top `K` numbers in an array.

## 'K' Closest Points to the Origin (easy)

https://leetcode.com/problems/k-closest-points-to-origin/

> Given an array of points in a 2D plane, find `K` closest points to the origin.

<b>Note:</b> For a detailed discussion about different approaches to solve this problem, take a look at [Kth Smallest Number](#kth-smallest-number-easy).

```java
import java.util.*;

class Point {
    int x;
    int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int distFromOrigin() {
        // ignoring sqrt
        return (x * x) + (y * y);
    }
}

class Solution {
    public static List<Point> findClosestPoints(Point[] points, int k) {
        PriorityQueue<Point> maxHeap = new PriorityQueue<>(
                (p1, p2) -> p2.distFromOrigin() - p1.distFromOrigin());
        // put first 'k' points in the max heap
        for (int i = 0; i < k; i++) {
            maxHeap.add(points[i]);
        }

        // go through the remaining points of the input array, if a point is closer to the origin than the top point
        // of the max-heap, remove the top point from heap and add the point from the input array
        for (int i = k; i < points.length; i++) {
            if (points[i].distFromOrigin() < maxHeap.peek().distFromOrigin()) {
                maxHeap.poll();
                maxHeap.add(points[i]);
            }
        }

        // the heap has 'k' points closest to the origin, return them in a list
        return new ArrayList<>(maxHeap);
    }

    public static void main(String[] args) {
        Point[] points = new Point[]{new Point(1, 2), new Point(1, 3)};
        List<Point> result = findClosestPoints(points, 1);
        System.out.print("Here are the k points closest the origin: ");
        for (Point p : result)
            System.out.print("[" + p.x + " , " + p.y + "] ");
        System.out.println();

        points = new Point[]{new Point(1, 3), new Point(3, 4), new Point(2, -1)};
        result = findClosestPoints(points, 2);
        System.out.print("Here are the k points closest the origin: ");
        for (Point p : result)
            System.out.print("[" + p.x + " , " + p.y + "] ");
        System.out.println();
    }
}
```

## Connect Ropes (easy)

https://leetcode.com/problems/minimum-cost-to-connect-sticks/

> Given `N` ropes with different lengths, we need to connect these ropes into one big rope with minimum cost. The cost of connecting two ropes is equal to the sum of their lengths.

```java
import java.util.*;

class Solution {
    public static int minimumCostToConnectRopes(int[] ropeLengths) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<Integer>((n1, n2) -> n1 - n2);
        // add all ropes to the min heap
        for (int i = 0; i < ropeLengths.length; i++) {
            minHeap.add(ropeLengths[i]);
        }

        // go through the values of the heap, in each step take top (lowest) rope lengths from the min heap
        // connect them and add the result back to the min heap.
        // keep doing this until the heap is left with only one rope
        int result = 0;
        int temp = 0;
        while (minHeap.size() > 1) {
            temp = minHeap.poll() + minHeap.poll();
            result += temp;
            minHeap.add(temp);
        }

        return result;
    }

    public static void main(String[] args) {
        int result = minimumCostToConnectRopes(new int[]{1, 3, 11, 5});
        System.out.println("Minimum cost to connect ropes: " + result); // 33
        
        result = minimumCostToConnectRopes(new int[]{3, 4, 5, 6});
        System.out.println("Minimum cost to connect ropes: " + result); // 36
        
        result = minimumCostToConnectRopes(new int[]{1, 3, 11, 5, 2});
        System.out.println("Minimum cost to connect ropes: " + result); // 42
    }
}
```

- Given `N` ropes, we need `O(N^2)` for the <b>Binary Search</b>.
- The space complexity will be `O(1)` .

## 👩🏽‍🦯 Top 'K' Frequent Numbers (medium)

https://leetcode.com/problems/top-k-frequent-elements/

> Given an unsorted array of numbers, find the top `K` frequently occurring numbers in it.

```java
import java.util.*;

class Solution {
    public static List<Integer> findKFrequentNumbers(int[] nums, int k) {
        // find the frequency of each number
        Map<Integer, Integer> numFrequencyMap = new HashMap<>();
        for (int n : nums) {
            numFrequencyMap.put(n, numFrequencyMap.getOrDefault(n, 0) + 1);
        }

        PriorityQueue<Map.Entry<Integer, Integer>> minHeap = new PriorityQueue<>(
                (e1, e2) -> e1.getValue() - e2.getValue());

        // go through all numbers of the map and push them in the minHeap, which will have 
        // top k frequent numbers. If the heap size is more than k, we remove the smallest (top) number
        for (Map.Entry<Integer, Integer> entry : numFrequencyMap.entrySet()) {
            minHeap.add(entry);
            if (minHeap.size() > k) {
                minHeap.poll();
            }
        }

        // create a list of top k numbers
        List<Integer> topNumbers = new ArrayList<>(k);
        while (!minHeap.isEmpty()) {
            topNumbers.add(minHeap.poll().getKey());
        }
        return topNumbers;
    }

    public static void main(String[] args) {
        List<Integer> result = findKFrequentNumbers(new int[]{1, 3, 5, 12, 11, 12, 11}, 2);
        System.out.println("Here are the K frequent numbers: " + result);

        result = findKFrequentNumbers(new int[]{5, 12, 11, 3, 11}, 2);
        System.out.println("Here are the K frequent numbers: " + result);
    }
}
```

## Frequency Sort (medium)

https://leetcode.com/problems/sort-characters-by-frequency/

> Given a string, sort it based on the decreasing frequency of its characters.

```java
import java.util.*;

class Solution {
    public static String sortCharacterByFrequency(String str) {
        // find the frequency of each character
        Map<Character, Integer> characterFrequencyMap = new HashMap<>();
        for (int i = 0; i < str.length(); i++) {
            char chr = str.charAt(i);
            characterFrequencyMap.put(chr, characterFrequencyMap.getOrDefault(chr, 0) + 1);
        }

        PriorityQueue<Map.Entry<Character, Integer>> maxHeap = new PriorityQueue<>(
                (e1, e2) -> e2.getValue() - e1.getValue());

        // add all characters to the max heap
        maxHeap.addAll(characterFrequencyMap.entrySet());

        // build a string, appending the most occurring characters first
        StringBuilder sortedString = new StringBuilder(str.length());
        while (!maxHeap.isEmpty()) {
            Map.Entry<Character, Integer> entry = maxHeap.poll();
            for (int i = 0; i < entry.getValue(); i++) {
                sortedString.append(entry.getKey());
            }
        }
        return sortedString.toString();
    }

    public static void main(String[] args) {
        String result = sortCharacterByFrequency("Programming");
        System.out.println("string after sorting characters by frequency: " + result); // "rrggmmPoain"

        result = sortCharacterByFrequency("abcbab");
        System.out.println("string after sorting characters by frequency: " + result); // "bbbaac"
    }
}
```

## Kth Largest Number in a Stream (medium)

https://leetcode.com/problems/kth-largest-element-in-a-stream/

> Design a class to efficiently find the `Kth` largest element in a stream of numbers.
>
> The class should have the following two things:
>
> 1. The constructor of the class should accept an integer array containing initial numbers from the stream and an integer `K`.
> 2. The class should expose a function `add(num)` which will store the given number and return the <b>Kth largest</b> number.

```java
import java.util.*;

class KthLargest {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>((n1, n2) -> n1 - n2);
    final int k;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        // add the numbers in the min heap
        for (int i = 0; i < nums.length; i++) {
            add(nums[i]);
        }
    }

    public int add(int val) {
        // add the new number in the min heap
        minHeap.add(val);

        // if heap has more than 'k' numbers, remove one number
        if (minHeap.size() > this.k) {
            minHeap.poll();
        }

        // return the 'Kth largest number
        return minHeap.peek();
    }

    public static void main(String[] args) {
        int[] input = new int[]{3, 1, 5, 12, 2, 11};
        KthLargest kthLargest = new KthLargest(4, input);
        System.out.println(kthLargest.add(6)); // return 5
        System.out.println(kthLargest.add(13)); // return 6
        System.out.println(kthLargest.add(4)); // return 6
    }
}
```

- The time complexity of the above algorithm is `O(NlogN)`.
- The space complexity of the above algorithm is `O(1)`

## 'K' Closest Numbers (medium)

https://leetcode.com/problems/find-k-closest-elements/

> Given a sorted number array and two integers `K` and `X`, find `K` closest numbers to `X` in the array. Return the numbers in the sorted order. `X` is not necessarily present in the array.

This problem follows the [Top `K` Numbers](#top-k-numbers-easy) pattern. The biggest difference in this problem is that we need to find the closest (to `X`) numbers compared to finding the overall largest numbers. Another difference is that the given array is sorted.

Utilizing a similar approach, we can find the numbers closest to `X` through the following algorithm:

1. Since the array is sorted, we can first find the number closest to `X` through <b>Binary Search</b>. Let's say that number is `Y`.
2. The `K` closest numbers to `Y` will be adjacent to `Y` in the array. We can search in both directions of `Y` to find the closest numbers.
3. We can use a <s>heap</s> to efficiently search for the closest numbers. We will take `K` numbers in both directions of `Y` and push them in a <s>Min Heap</s> sorted by their absolute difference from `X`. This will ensure that the numbers with the smallest difference from `X` (i.e., closest to `X`) can be extracted easily from <s>Min Heap</s>.
4. Finally, we will extract the top `K` numbers from the <s>Min Heap</s> to find the required numbers.

After finding the number closest to `X` through <b>Binary Search</b>, we can use the <b>[Two Pointers](https://github.com/Chanda-Abdul/Several-Coding-Patterns-for-Solving-Data-Structures-and-Algorithms-Problems-during-Interviews/blob/main/%E2%9C%85%20%20Pattern%2002:%20Two%20Pointers.md)</b> approach to find the `K` closest numbers. Let’s say the closest number is `Y`. We can have a left pointer to move back from `Y` and a right pointer to move forward from `Y`. At any stage, whichever number pointed out by the left or the right pointer gives the smaller difference from `X` will be added to our result list.

To keep the resultant list sorted we can use a <b>Queue</b>. So whenever we take the number pointed out by the left pointer, we will append it at the beginning of the list and whenever we take the number pointed out by the right pointer we will append it at the end of the list.

Here is what our algorithm will look like:

```java
import java.util.*;

class Entry {
    int key;
    int value;

    public Entry(int key, int value) {
        this.key = key;
        this.value = value;
    }
}

class Solution {
    public static List<Integer> findClosestElements(int[] arr, int K, int X) {
        int index = binarySearch(arr, X);
        int low = index - K, high = index + K;
        low = Math.max(low, 0);
        high = Math.min(high, arr.length - 1);

        PriorityQueue<Entry> minHeap = new PriorityQueue<>((n1, n2) -> {
            if (n1.key != n2.key) {
                return n1.key - n2.key;
            }
            return n1.value - n2.value;
        });

        for (int i = low; i <= high; i++) {
            minHeap.add(new Entry(Math.abs(arr[i] - X), arr[i]));
        }

        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < K; i++) {
            result.add(minHeap.poll().value);
        }

        Collections.sort(result);
        return result;
    }

    private static int binarySearch(int[] arr, int target) {
        int low = 0;
        int high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target)
                return mid;
            if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        if (low > 0) {
            return low - 1;
        }
        return low;
    }

    public static void main(String[] args) {
        List<Integer> result = findClosestElements(new int[]{5, 6, 7, 8, 9}, 3, 7);
        System.out.println("'K' closest numbers to 'X' are: " + result); // [6, 7, 8]

        result = findClosestElements(new int[]{2, 4, 5, 6, 9}, 3, 6);
        System.out.println("'K' closest numbers to 'X' are: " + result); // [4, 5, 6]

        result = findClosestElements(new int[]{2, 4, 5, 6, 9}, 3, 10);
        System.out.println("'K' closest numbers to 'X' are: " + result); // [5, 6, 9]

        result = findClosestElements(new int[]{1, 2, 3, 4, 5}, 4, 3);
        System.out.println("'K' closest numbers to 'X' are: " + result); // [1, 2, 3, 4]

        result = findClosestElements(new int[]{1, 2, 3, 4, 5}, 4, -1);
        System.out.println("'K' closest numbers to 'X' are: " + result); // [1, 2, 3, 4]
    }
}
```

- The time complexity of the above algorithm is `O(logN + K)`. We need `O(logN)` for <b>Binary Search</b> and `O(K)`for finding the `K` closest numbers using the two pointers.
- If we ignoring the space required for the output list, the algorithm runs in constant space `O(1)`.

## Maximum Distinct Elements (medium)

https://leetcode.com/problems/least-number-of-unique-integers-after-k-removals/

> Given an array of numbers and a number `K`, we need to remove `K` numbers from the array such that we are left with maximum distinct numbers.

```js
function findMaximumDistinctElements(nums, k) {
  let freqMap = new Map();

  nums.forEach((number) => {
    freqMap.set(number, freqMap.get(number) + 1 || 1);
  });

  let freq = Array.from(freqMap.values());
  freq.sort((a, b) => a - b);

  let results = freq.length;
  for (let n of freq) {
    if (k >= n) {
      k -= n;
      results--;
    } else return results;
  }

  return results;
}

console.log(`Maximum distinct numbers after removing K numbers: 
${findMaximumDistinctElements([5, 5, 4], 1)}`);
//1, Remove the single 4, only 5 is left.

console.log(`Maximum distinct numbers after removing K numbers: 
${findMaximumDistinctElements([4, 3, 1, 1, 3, 3, 2], 3)}`);
//2, Remove 4, 2 and either one of the two 1s or three 3s. 1 and 3 will be left.

console.log(`Maximum distinct numbers after removing K numbers: 
${findMaximumDistinctElements([7, 3, 5, 8, 5, 3, 3], 2)}`);
//3, We can remove two occurrences of 3 to be left with 3 distinct numbers [7, 3, 8],
//we have to skip 5 because it is not distinct and appeared twice.
// Another solution could be to remove one instance of '5' and '3' each to be left with
//three distinct numbers [7, 5, 8], in this case, we have to skip 3 because it appeared twice.

console.log(`Maximum distinct numbers after removing K numbers: 
${findMaximumDistinctElements([3, 5, 12, 11, 12], 3)}`);
//2, We can remove one occurrence of 12, after which all numbers will become distinct.
//Then we can delete any two numbers which will leave us 2 distinct numbers in the result.

console.log(`Maximum distinct numbers after removing K numbers: 
${findMaximumDistinctElements([1, 2, 3, 3, 3, 3, 4, 4, 5, 5, 5], 2)}`); //3, We can remove one occurrence of '4' to get three distinct numbers.
```

- Since we will insert all numbers in a <b>HashMap</b>, this will take `O(N*logN)` where `N` is the total input numbers. While extracting numbers from the map, in the worst case, we will need to take out `K` numbers. This will happen when we have at least `K` numbers with a frequency of two. Since the <s>heap</s> can have a maximum of `N/2` numbers, therefore, extracting an element from the <s>heap</s> will take `O(logN)` and extracting `K` numbers will take `O(KlogN)`. So overall, the time complexity of our algorithm will be `O(N*logN + KlogN)`. We can optimize the above algorithm and only push `K` elements in the <s>heap</s>, as in the worst case we will be extracting `K` elements from the <s>heap</s>. This optimization will reduce the overall time complexity to `O(N*logK + KlogK)`.
- The space complexity will be `O(N)` as, in the worst case, we need to store all the `N` characters in the <b>HashMap</b>.

## Sum of Elements (medium)

https://www.geeksforgeeks.org/sum-elements-k1th-k2th-smallest-elements/

> Given an array, find the sum of all numbers between the `K1th` and `K2th` smallest elements of that array.

```java
import java.util.*;

class Solution {
    public static int findSumOfElements(int[] nums, int k1, int k2) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<Integer>((n1, n2) -> n1 - n2);
        // insert all numbers to the min heap
        for (int i = 0; i < nums.length; i++) {
            minHeap.add(nums[i]);
        }

        // remove k1 small numbers from the min heap
        for (int i = 0; i < k1; i++) {
            minHeap.poll();
        }

        int elementSum = 0;
        // sum next k2 - k1 - 1 numbers
        for (int i = 0; i < k2 - k1 - 1; i++) {
            elementSum += minHeap.poll();
        }

        return elementSum;
    }

    public static void main(String[] args) {
        int result = findSumOfElements(new int[]{1, 3, 12, 5, 15, 11}, 3, 6);
        System.out.println("Sum of all numbers between k1 and k2 smallest numbers: " + result); // 23

        result = findSumOfElements(new int[]{3, 5, 8, 7}, 1, 4);
        System.out.println("Sum of all numbers between k1 and k2 smallest numbers: " + result); // 12
    }
}
```

## Rearrange String (hard)

https://leetcode.com/problems/reorganize-string/

> Given a string, find if its letters can be rearranged in such a way that no two same characters come next to each other.

```java
import java.util.*;

class Solution {
    public static String rearrangeString(String str) {
        Map<Character, Integer> charFrequencyMap = new HashMap<>();
        for (char chr : str.toCharArray()) {
            charFrequencyMap.put(chr, charFrequencyMap.getOrDefault(chr, 0) + 1);
        }

        PriorityQueue<Map.Entry<Character, Integer>> maxHeap = new PriorityQueue<>(
                (e1, e2) -> e2.getValue() - e1.getValue());

        // add all characters to the max heap
        maxHeap.addAll(charFrequencyMap.entrySet());

        Map.Entry<Character, Integer> previousEntry = null;
        StringBuilder resultString = new StringBuilder(str.length());
        while (!maxHeap.isEmpty()) {
            Map.Entry<Character, Integer> currentEntry = maxHeap.poll();
            // add the previous entry back in the heap if its frequency is greater than zero
            if (previousEntry != null && previousEntry.getValue() > 0) {
                maxHeap.add(previousEntry);
            }
            // append the current character to the result string and decrement its count
            resultString.append(currentEntry.getKey());
            currentEntry.setValue(currentEntry.getValue() - 1);
            previousEntry = currentEntry;
        }

        // if we were successful in appending all the characters to the result string, return it
        return resultString.length() == str.length() ? resultString.toString() : "";
    }

    public static void main(String[] args) {
        System.out.println("Rearranged string: " + rearrangeString("aappp"));
        System.out.println("Rearranged string: " + rearrangeString("Programming"));
        System.out.println("Rearranged string: " + rearrangeString("aapa"));
    }
}
```

## 🌟 Rearrange String K Distance Apart (hard)

https://leetcode.com/problems/rearrange-string-k-distance-apart/

> Given a string and a number `K`, find if the string can be rearranged such that the same characters are at least `K` distance apart from each other.

```java
import java.util.*;

class Solution {
    public static String rearrangeString(String str, int k) {
        if (k <= 1) return str;

        Map<Character, Integer> charFrequencyMap = new HashMap<>();
        for (char chr : str.toCharArray())
            charFrequencyMap.put(chr, charFrequencyMap.getOrDefault(chr, 0) + 1);

        PriorityQueue<Map.Entry<Character, Integer>> maxHeap = new PriorityQueue<>(
                (e1, e2) -> e2.getValue() - e1.getValue());

        // add all characters to the max heap
        maxHeap.addAll(charFrequencyMap.entrySet());

        Queue<Map.Entry<Character, Integer>> queue = new LinkedList<>();
        StringBuilder resultString = new StringBuilder(str.length());
        
        while (!maxHeap.isEmpty()) {
            Map.Entry<Character, Integer> currentEntry = maxHeap.poll();
            // append the current character to the result string and decrement its count
            resultString.append(currentEntry.getKey());
            currentEntry.setValue(currentEntry.getValue() - 1);
            queue.offer(currentEntry);
            
            if (queue.size() == k) {
                Map.Entry<Character, Integer> entry = queue.poll();
                if (entry.getValue() > 0)
                    maxHeap.add(entry);
            }
        }

        // if we were successful in appending all the characters to the result string, return it
        return resultString.length() == str.length() ? resultString.toString() : "";
    }

    public static void main(String[] args) {
        System.out.println("Reorganized string: " + rearrangeString("aabbcc", 3)); // abcabc
        System.out.println("Reorganized string: " + rearrangeString("aaabc", 3)); // ""
        System.out.println("Reorganized string: " + rearrangeString("aaadbbcc", 2)); // abacabcd
        System.out.println("Reorganized string: " + rearrangeString("Programming", 3)); // rgmPrgmiano
        System.out.println("Reorganized string: " + rearrangeString("mmpp", 2)); // mpmp
        System.out.println("Reorganized string: " + rearrangeString("aab", 2)); // aba
        System.out.println("Reorganized string: " + rearrangeString("aapa", 3)); // ""
    }
}
```

## 🌟 🔎 Scheduling Tasks (hard)

https://leetcode.com/problems/task-scheduler/

> You are given a list of `tasks` that need to be run, in any order, on a server. Each `task` will take one CPU interval to execute but once a `task` has finished, it has a cooling period during which it cant be run again. If the cooling period for all tasks is `K` intervals, find the minimum number of CPU intervals that the server needs to finish all `tasks`.
>
> If at any time the server can't execute any `task` then it must stay `idle`.

This problem follows the Top `K` Elements pattern and is quite similar to Rearrange [String K Distance Apart](#-rearrange-string-k-distance-apart-hard). We need to rearrange tasks such that same tasks are `K` distance apart.


### A mental model for solving this problem

❗ Explaination referenced [here](https://leetcode.com/problems/task-scheduler/discuss/1874475/Easy-Solution-with-Writeup)

Consider the following input:

```
tasks = ["A", "A", "A", "B", "B", "B", "C", "C", "C", "D", "D", "E"]
n = 2
```

- First let's find the most frequently occuring task and lay it out like so (an underscore represents a cooldown period):

```
A _ _ A _ _ A
```

- Our goal is to insert all the other tasks into this sequence by filling the cooldown periods first.

- We know any other task can be scheduled into this sequence without creating additional cooldown slots because:

1. The number of occurrences of any task `x` is less than or equal to the number occurences of the most frequrntly occuring task `A`; and
2. We can always find a sequence of `k` different tasks to schedule between any pair of tasks `x`.

- Let's insert in the second most frequently occuring task `B` (we fill the two cooldown slots first and append the third task to the end):

```
A B _ A B _ A B
```

- Next let's insert in the third most frequently occuring task `C` (we fill in the two cooldown slots first and append the third task to the end):

```
A B C A B C A B C
```

- Next let's insert the fourth most frequently occuring task `D`. At this point we've used up all our cooldown slots so we can insert these tasks pretty much anywhere we like as long as there are at least `k` tasks between every pair of `D` tasks.

```
D A B D C A B C A B C
```

- Lastly, the least frequently occuring task `E` can be inserted literally anywhere we like. Because it only occurs once there is no cooldown period we need to respect.

```
D A B D C A B C A E B C
```

The sequence above is the shortest possible sequence these tasks can be scheduled in.
<b>Note</b> that there are multiple possible sequences of this length.

The answer to the problem is the number of `tasks` + the number of cooldown periods.

### 😕 Heap Solution

Following a similar approach, we will use a <b>Max Heap</b> to execute the highest frequency task first. After executing a task we decrease its frequency and put it in a waiting list. In each iteration, we will try to execute as many as `k+1` tasks. For the next iteration, we will put all the waiting tasks back in the <b>Max Heap</b> . If, for any iteration, we are not able to execute `k+1` tasks, the CPU has to remain idle for the remaining time in the next iteration.

```java
import java.util.*;

class Solution {
    public static int scheduleTasks(char[] tasks, int k) {
        int intervalCount = 0;
        Map<Character, Integer> taskFrequencyMap = new HashMap<>();
        for (char chr : tasks)
            taskFrequencyMap.put(chr, taskFrequencyMap.getOrDefault(chr, 0) + 1);

        PriorityQueue<Map.Entry<Character, Integer>> maxHeap = new PriorityQueue<>(
                (e1, e2) -> e2.getValue() - e1.getValue());

        maxHeap.addAll(taskFrequencyMap.entrySet());

        while (!maxHeap.isEmpty()) {
            List<Map.Entry<Character, Integer>> waitList = new ArrayList<>();
            int n = k + 1; // try to execute as many as 'k+1' tasks from the max-heap
            for (; n > 0 && !maxHeap.isEmpty(); n--) {
                intervalCount++;
                Map.Entry<Character, Integer> currentEntry = maxHeap.poll();
                if (currentEntry.getValue() > 1) {
                    currentEntry.setValue(currentEntry.getValue() - 1);
                    waitList.add(currentEntry);
                }
            }
            maxHeap.addAll(waitList); // put all the waiting list back on the heap
            if (!maxHeap.isEmpty())
                intervalCount += n; // we'll be having 'n' idle intervals for the next iteration
        }

        return intervalCount;
    }

    public static void main(String[] args) {
        char[] tasks = new char[]{'a', 'a', 'a', 'b', 'c', 'c'};
        System.out.println("Minimum intervals needed to execute all tasks: " + scheduleTasks(tasks, 2));

        tasks = new char[]{'a', 'b', 'a'};
        System.out.println("Minimum intervals needed to execute all tasks: " + scheduleTasks(tasks, 3));
    }
}
```

- The time complexity of the above algorithm is `O(N∗logN)`
  where `N` is the number of tasks. Our while loop will iterate once for each occurrence of the task in the input (i.e. `N`) and in each iteration we will remove a task from the <b>heap</b> which will take `O(logN)`time. Hence the overall time complexity of our algorithm is `O(N*logN)`.
- The space complexity will be `O(N)`, as in the worst case, we need to store all the `N` tasks in the <b>HashMap</b>.

### Greedy HashMap Solution

```java
import java.util.*;

class Solution {
    public static int scheduleTasks(char[] tasks, int k) {
        Map<Character, Integer> taskFreqMap = new HashMap<>();
        int intervalMax = 0;
        int taskCountMax = 0;

        for (char chr : tasks) {
            taskFreqMap.put(chr, taskFreqMap.getOrDefault(chr, 0) + 1);

            // set intervalMax and taskCountMax only if we have a new max
            if (taskFreqMap.get(chr) > intervalMax) {
                intervalMax = taskFreqMap.get(chr);
                taskCountMax = 1;
            } else if (taskFreqMap.get(chr) == intervalMax) {
                // otherwise, increment taskCountMax
                taskCountMax++;
            }
        }

        return Math.max(tasks.length, (intervalMax - 1) * (k + 1) + taskCountMax);
    }

    public static void main(String[] args) {
        System.out.println("Minimum intervals needed to execute all tasks: " + 
            scheduleTasks(new char[]{'A', 'A', 'A', 'B', 'B', 'B'}, 2));
        // 8

        System.out.println("Minimum intervals needed to execute all tasks: " + 
            scheduleTasks(new char[]{'A', 'A', 'A', 'B', 'B', 'B'}, 0));
        // 6

        System.out.println("Minimum intervals needed to execute all tasks: " + 
            scheduleTasks(new char[]{'A', 'A', 'A', 'A', 'A', 'A', 'B', 'C', 'D', 'E', 'F', 'G'}, 2));
        // 16
    }
}
```

## 🌟Frequency Stack (hard)

https://leetcode.com/problems/maximum-frequency-stack/

> Design a class that simulates a Stack data structure, implementing the following two operations:
>
> - `push(int num)`: Pushes the number `num` on the stack.
> - `pop()`: Returns the most frequent number in the stack. If there is a tie, return the number which was pushed later.

### Frequency Map & Stack Solution

❗ Explaination referenced [here](https://leetcode.com/problems/maximum-frequency-stack/discuss/1086543/JS-Python-Java-C%2B%2B-or-Frequency-Map-and-Stack-Solution-w-Explanation)

There are many ways to solve this problem, but the description gives us two clues as to the most efficient way to do so.

- First, any time the word <i>"frequency"</i> is used, we're most likely going to need to make a <b>frequency map</b>.
- Second, they use the word <i>"stack"</i> in the title, so we should look at the possibility of a <b>stack</b> solution.

In this instance, we should consider a <b>2D stack</b>, with frequency on one side and input order on the other. This <b>stack</b> will hold each individual instance of a `value` pushed separately by what the frequency was at the time of insertion.

`freqStack` will work here because it starts at <b>1</b> and will increment from there. If we remember to `pop()` off unused frequencies, then the top of the frequency dimension of our <b>stack</b> `stack[stack.length-1]` will always represent the most frequent element, while the top of the input order dimension will represent the most recently seen value.

Our frequency map `freqMap()` will be used to keep track of the current frequencies of seen elements, so we know where to enter new ones into our stack.

### Implementation:

Since our frequencies are <b>1-indexed</b> and the <b>stack</b> is <b>0-indexed</b>, we have to insert a dummy <b>0-index</b> for all languages except <i>Javascript</i>, which lets you directly access even undefined array elements by index.

```java
import java.util.*;

class Element {
    int number;
    int frequency;
    int sequenceNumber;

    public Element(int number, int frequency, int sequenceNumber) {
        this.number = number;
        this.frequency = frequency;
        this.sequenceNumber = sequenceNumber;
    }
}

class FreqStack {
    int sequenceNumber = 0;
    PriorityQueue<Element> maxHeap;
    Map<Integer, Integer> frequencyMap;

    public FreqStack() {
        maxHeap = new PriorityQueue<>(new ElementComparator());
        frequencyMap = new HashMap<>();
    }

    public void push(int num) {
        frequencyMap.put(num, frequencyMap.getOrDefault(num, 0) + 1);
        maxHeap.add(new Element(num, frequencyMap.get(num), sequenceNumber++));
    }

    public int pop() {
        int num = maxHeap.poll().number;
        
        // decrement the frequency or remove if this is the last number
        if (frequencyMap.get(num) > 1) {
            frequencyMap.put(num, frequencyMap.get(num) - 1);
        } else {
            frequencyMap.remove(num);
        }

        return num;
    }

    static class ElementComparator implements Comparator<Element> {
        public int compare(Element e1, Element e2) {
            if (e1.frequency != e2.frequency) {
                return e2.frequency - e1.frequency;
            }
            // if both elements have same frequency, return the one that was pushed later
            return e2.sequenceNumber - e1.sequenceNumber;
        }
    }

    public static void main(String[] args) {
        FreqStack freqStack = new FreqStack();
        freqStack.push(5);
        freqStack.push(7);
        freqStack.push(5);
        freqStack.push(7);
        freqStack.push(4);
        freqStack.push(5);

        System.out.println(freqStack.pop()); // 5
        System.out.println(freqStack.pop()); // 7
        System.out.println(freqStack.pop()); // 5
        System.out.println(freqStack.pop()); // 4
        
        FreqStack frequencyStack = new FreqStack();
        frequencyStack.push(1);
        frequencyStack.push(2);
        frequencyStack.push(3);
        frequencyStack.push(2);
        frequencyStack.push(1);
        frequencyStack.push(2);
        frequencyStack.push(5);
        System.out.println(frequencyStack.pop()); // 2
        System.out.println(frequencyStack.pop()); // 1
        System.out.println(frequencyStack.pop()); // 2
    }
}
```

- <b>Time Complexity</b> of `O(1)` for both `push()` and `pop()` operations.
- <b>Space Complexity</b> of `O(N)`, where `N` is the number of elements in the `FreqStack()`.
