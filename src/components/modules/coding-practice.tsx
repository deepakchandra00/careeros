"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";
import {
  Code2,
  Play,
  RotateCcw,
  Lightbulb,
  Check,
  CheckCircle2,
  Search,
  X,
  Trophy,
  AlertCircle,
  Clock,
  Database,
  Zap,
  Sparkles,
  ListTree,
  FileCode2,
  Terminal,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AIButton,
  AIEmptyState,
  ModuleHeader,
  Pill,
  ScoreRing,
  TypingDots,
} from "@/components/shared/blocks";
import { useMounted, fetchWithFallback } from "@/components/shared/utils";
import { cn } from "@/lib/utils";

// ---------- Types ----------
type Difficulty = "Easy" | "Medium" | "Hard";
type Language = "JavaScript" | "TypeScript" | "Python" | "Java";

interface TestCase {
  /** JSON string of the arguments array, e.g. "[[2,7,11,15],9]". */
  input: string;
  /** Stringified expected value, e.g. "[0,1]". */
  expected: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  language: Language;
  topics: string[];
  description: string;
  example: string;
  starterCode: string;
  solution: string;
  /**
   * Function name exposed by the user's code. For JavaScript problems we
   * alias this to `solution` before sending to the run-code API so the
   * sandbox can locate it.
   */
  fnName?: string;
  /** Test cases in the run-code API format. All problems have these. */
  tests: TestCase[];
}

interface CodeReview {
  correctness: "Correct" | "Mostly Correct" | "Has Bugs" | "Incorrect";
  score: number;
  complexity: { time: string; space: string };
  strengths: string[];
  issues: string[];
  suggestions: string[];
  betterApproach: string;
}

type OutputMode = "idle" | "running" | "review" | "solution";

interface RunResultCase {
  label: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
}

interface RunResult {
  passed: number;
  total: number;
  allPassed: boolean;
  runtimeError: string | null;
  cases: RunResultCase[];
}

// ---------- Constants ----------
const MONACO_LANG: Record<Language, string> = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  Python: "python",
  Java: "java",
};

const DIFFICULTY_TONE: Record<Difficulty, "good" | "warn" | "bad"> = {
  Easy: "good",
  Medium: "warn",
  Hard: "bad",
};

const LANGUAGE_COLOR: Record<Language, string> = {
  JavaScript: "oklch(0.75 0.16 70)",
  TypeScript: "oklch(0.6 0.18 250)",
  Python: "oklch(0.62 0.15 162)",
  Java: "oklch(0.6 0.18 25)",
};

// ---------- Problems (15) ----------
const PROBLEMS: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    language: "JavaScript",
    topics: ["Array", "Hash Table"],
    description:
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution, and you may not use the same element twice.",
    example: "Input: nums = [2,7,11,15], target = 9 → Output: [0,1]",
    starterCode: `function twoSum(nums, target) {
  // your code here
  return [];
}
`,
    solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return [];
}`,
    fnName: "twoSum",
    tests: [
      { input: "[[2,7,11,15],9]", expected: "[0,1]" },
      { input: "[[3,2,4],6]", expected: "[1,2]" },
      { input: "[[3,3],6]", expected: "[0,1]" },
    ],
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    language: "JavaScript",
    topics: ["String", "Stack"],
    description:
      "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid. A string is valid if open brackets are closed by the same type, in the correct order.",
    example: 'Input: s = "()[]{}" → Output: true',
    starterCode: `function isValid(s) {
  // your code here
  return false;
}
`,
    solution: `function isValid(s) {
  const map = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const c of s) {
    if (c === "(" || c === "[" || c === "{") stack.push(c);
    else if (stack.pop() !== map[c]) return false;
  }
  return stack.length === 0;
}`,
    fnName: "isValid",
    tests: [
      { input: "[\"()\"]", expected: "true" },
      { input: "[\"()[]{}\"]", expected: "true" },
      { input: "[\"(]\"]", expected: "false" },
      { input: "[\"([)]\"]", expected: "false" },
      { input: "[\"{[]}\"]", expected: "true" },
    ],
  },
  {
    id: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "Easy",
    language: "Python",
    topics: ["Math"],
    description:
      "Given an integer `x`, return `true` if `x` is a palindrome integer. An integer is a palindrome when it reads the same backward as forward. For a follow-up challenge, solve it without converting the integer to a string.",
    example: "Input: x = 121 → Output: true",
    starterCode: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        # your code here
        return False
`,
    solution: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0:
            return False
        s = str(x)
        return s == s[::-1]`,
    tests: [
      { input: "[121]", expected: "true" },
      { input: "[-121]", expected: "false" },
      { input: "[10]", expected: "false" },
    ],
  },
  {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "Easy",
    language: "Java",
    topics: ["Linked List", "Recursion"],
    description:
      "Given the `head` of a singly linked list, reverse the list and return the new head. Try solving both iteratively and recursively.",
    example: "Input: head = [1,2,3,4,5] → Output: [5,4,3,2,1]",
    starterCode: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        // your code here
        return null;
    }
}
`,
    solution: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        while (head != null) {
            ListNode next = head.next;
            head.next = prev;
            prev = head;
            head = next;
        }
        return prev;
    }
}`,
    tests: [
      { input: "[1,2,3,4,5]", expected: "[5,4,3,2,1]" },
      { input: "[1,2]", expected: "[2,1]" },
      { input: "[]", expected: "[]" },
    ],
  },
  {
    id: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    language: "TypeScript",
    topics: ["Linked List", "Recursion"],
    description:
      "Merge two sorted linked lists `list1` and `list2` into one sorted list by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    example: "Input: list1 = [1,2,4], list2 = [1,3,4] → Output: [1,1,2,3,4,4]",
    starterCode: `/**
 * Definition for singly-linked list.
 * class ListNode {
 *   val: number
 *   next: ListNode | null
 * }
 */
function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null
): ListNode | null {
  // your code here
  return null;
}
`,
    solution: `function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null
): ListNode | null {
  const dummy = new ListNode();
  let tail = dummy;
  while (list1 && list2) {
    if (list1.val < list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }
  tail.next = list1 ?? list2;
  return dummy.next;
}`,
    tests: [
      { input: "[[1,2,4],[1,3,4]]", expected: "[1,1,2,3,4,4]" },
      { input: "[[],[]]", expected: "[]" },
      { input: "[[],[0]]", expected: "[0]" },
    ],
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    language: "JavaScript",
    topics: ["Hash Table", "Sliding Window", "String"],
    description:
      "Given a string `s`, find the length of the longest substring without repeating characters. A sliding window with a hash map of last-seen indices solves this in O(n) time.",
    example: 'Input: s = "abcabcbb" → Output: 3',
    starterCode: `function lengthOfLongestSubstring(s) {
  // your code here
  return 0;
}
`,
    solution: `function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let left = 0;
  let max = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (seen.has(c) && seen.get(c) >= left) left = seen.get(c) + 1;
    seen.set(c, right);
    max = Math.max(max, right - left + 1);
  }
  return max;
}`,
    fnName: "lengthOfLongestSubstring",
    tests: [
      { input: "[\"abcabcbb\"]", expected: "3" },
      { input: "[\"bbbbb\"]", expected: "1" },
      { input: "[\"pwwkew\"]", expected: "3" },
      { input: "[\"\"]", expected: "0" },
      { input: "[\" \"]", expected: "1" },
    ],
  },
  {
    id: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    language: "Python",
    topics: ["Array", "Two Pointers", "Greedy"],
    description:
      "Given an integer array `height` of length `n`, find two lines that together with the x-axis form a container that holds the most water. Return the maximum amount of water a container can store.",
    example: "Input: height = [1,8,6,2,5,4,8,3,7] → Output: 49",
    starterCode: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        # your code here
        return 0
`,
    solution: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        left, right = 0, len(height) - 1
        best = 0
        while left < right:
            best = max(best, min(height[left], height[right]) * (right - left))
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return best`,
    tests: [
      { input: "[1,8,6,2,5,4,8,3,7]", expected: "49" },
      { input: "[1,1]", expected: "1" },
      { input: "[4,3,2,1,4]", expected: "16" },
    ],
  },
  {
    id: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    language: "TypeScript",
    topics: ["Array", "Hash Table", "String", "Sorting"],
    description:
      "Given an array of strings `strs`, group the anagrams together. Return the groups in any order. An anagram is a word formed by rearranging the letters of another word.",
    example:
      'Input: strs = ["eat","tea","tan","ate","nat","bat"] → Output: [["bat"],["nat","tan"],["ate","eat","tea"]]',
    starterCode: `function groupAnagrams(strs: string[]): string[][] {
  // your code here
  return [];
}
`,
    solution: `function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();
  for (const s of strs) {
    const key = s.split("").sort().join("");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.values());
}`,
    tests: [
      { input: "[\"a\"]", expected: "[[\"a\"]]" },
      { input: "[\"\",\"\"]", expected: "[[\"\",\"\"]]" },
      { input: "[\"eat\",\"tea\",\"ate\"]", expected: "[[\"eat\",\"tea\",\"ate\"]]" },
    ],
  },
  {
    id: "3sum",
    title: "3Sum",
    difficulty: "Medium",
    language: "JavaScript",
    topics: ["Array", "Two Pointers", "Sorting"],
    description:
      "Given an integer array `nums`, return all unique triplets `[nums[i], nums[j], nums[k]]` such that `i != j != k` and `nums[i] + nums[j] + nums[k] == 0`. The solution set must not contain duplicate triplets.",
    example: "Input: nums = [-1,0,1,2,-1,-4] → Output: [[-1,-1,2],[-1,0,1]]",
    starterCode: `function threeSum(nums) {
  // your code here
  return [];
}
`,
    solution: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1;
    let right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        res.push([nums[i], nums[left], nums[right]]);
        while (nums[left] === nums[left + 1]) left++;
        while (nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return res;
}`,
    fnName: "threeSum",
    tests: [
      {
        input: "[[-1,0,1,2,-1,-4]]",
        expected: "[[-1,-1,2],[-1,0,1]]",
      },
      { input: "[[0,1,1]]", expected: "[]" },
      { input: "[[0,0,0]]", expected: "[[0,0,0]]" },
    ],
  },
  {
    id: "binary-tree-level-order",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    language: "Java",
    topics: ["Tree", "BFS", "Binary Tree"],
    description:
      "Given the `root` of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    example:
      "Input: root = [3,9,20,null,null,15,7] → Output: [[3],[9,20],[15,7]]",
    starterCode: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 * }
 */
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        // your code here
        return new ArrayList<>();
    }
}
`,
    solution: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new ArrayDeque<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = q.poll();
                level.add(node.val);
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
            res.add(level);
        }
        return res;
    }
}`,
    tests: [
      { input: "[3,9,20,null,null,15,7]", expected: "[[3],[9,20],[15,7]]" },
      { input: "[1]", expected: "[[1]]" },
      { input: "[]", expected: "[]" },
    ],
  },
  {
    id: "word-break",
    title: "Word Break",
    difficulty: "Medium",
    language: "Python",
    topics: ["Dynamic Programming", "Trie"],
    description:
      "Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words. The same word may be reused multiple times.",
    example:
      'Input: s = "leetcode", wordDict = ["leet","code"] → Output: true',
    starterCode: `class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        # your code here
        return False
`,
    solution: `class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        words = set(wordDict)
        dp = [False] * (len(s) + 1)
        dp[0] = True
        for i in range(1, len(s) + 1):
            for j in range(i):
                if dp[j] and s[j:i] in words:
                    dp[i] = True
                    break
        return dp[len(s)]`,
    tests: [
      { input: "[\"leetcode\",[\"leet\",\"code\"]]", expected: "true" },
      { input: "[\"applepenapple\",[\"apple\",\"pen\"]]", expected: "true" },
      { input: "[\"catsandog\",[\"cats\",\"dog\",\"sand\",\"and\",\"cat\"]]", expected: "false" },
    ],
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    difficulty: "Hard",
    language: "TypeScript",
    topics: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"],
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement `LRUCache(capacity)`, `get(key)` which returns the value (or -1 if not found), and `put(key, value)` which evicts the LRU key when capacity is exceeded. Both operations must run in O(1) average time.",
    example:
      "LRUCache lru = new LRUCache(2); lru.put(1,1); lru.put(2,2); lru.get(1); lru.put(3,3); // evicts key 2",
    starterCode: `class LRUCache {
  constructor(capacity: number) {
    // your code here
  }

  get(key: number): number {
    // your code here
    return -1;
  }

  put(key: number, value: number): void {
    // your code here
  }
}
`,
    solution: `class LRUCache {
  private capacity: number;
  private map: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key: number): number {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  put(key: number, value: number): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value as number;
      this.map.delete(oldest);
    }
  }
}`,
    tests: [
      {
        input: "[\"LRUCache\",2,[\"put\",1,1],[\"put\",2,2],[\"get\",1],[\"put\",3,3],[\"get\",2],[\"put\",4,4],[\"get\",1],[\"get\",3],[\"get\",4]]",
        expected: "[1,-1,-1,3,4]",
      },
      {
        input: "[\"LRUCache\",1,[\"put\",1,1],[\"get\",1],[\"put\",2,2],[\"get\",1],[\"get\",2]]",
        expected: "[1,-1,2]",
      },
    ],
  },
  {
    id: "median-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    language: "JavaScript",
    topics: ["Array", "Binary Search", "Divide and Conquer"],
    description:
      "Given two sorted arrays `nums1` and `nums2` of size `m` and `n`, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    example: "Input: nums1 = [1,3], nums2 = [2] → Output: 2.0",
    starterCode: `function findMedianSortedArrays(nums1, nums2) {
  // your code here
  return 0;
}
`,
    solution: `function findMedianSortedArrays(nums1, nums2) {
  const merged = [...nums1, ...nums2].sort((a, b) => a - b);
  const n = merged.length;
  if (n % 2 === 1) return merged[Math.floor(n / 2)];
  return (merged[n / 2 - 1] + merged[n / 2]) / 2;
}`,
    fnName: "findMedianSortedArrays",
    tests: [
      { input: "[[1,3],[2]]", expected: "2" },
      { input: "[[1,2],[3,4]]", expected: "2.5" },
    ],
  },
  {
    id: "regex-matching",
    title: "Regular Expression Matching",
    difficulty: "Hard",
    language: "Python",
    topics: ["Dynamic Programming", "Recursion", "String"],
    description:
      "Given an input string `s` and a pattern `p`, implement regular expression matching with support for `.` (matches any single character) and `*` (matches zero or more of the preceding element). The matching should cover the entire input string (not partial).",
    example: 'Input: s = "aab", p = "c*a*b" → Output: true',
    starterCode: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        # your code here
        return False
`,
    solution: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for j in range(2, n + 1):
            if p[j - 1] == "*":
                dp[0][j] = dp[0][j - 2]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if p[j - 1] == "*":
                    dp[i][j] = dp[i][j - 2]
                    if p[j - 2] == s[i - 1] or p[j - 2] == ".":
                        dp[i][j] = dp[i][j] or dp[i - 1][j]
                elif p[j - 1] == s[i - 1] or p[j - 1] == ".":
                    dp[i][j] = dp[i - 1][j - 1]
        return dp[m][n]`,
    tests: [
      { input: "[\"aa\",\"a\"]", expected: "false" },
      { input: "[\"aa\",\"a*\"]", expected: "true" },
      { input: "[\"aab\",\"c*a*b\"]", expected: "true" },
    ],
  },
  {
    id: "design-twitter",
    title: "Design Twitter",
    difficulty: "Hard",
    language: "Java",
    topics: ["Hash Table", "Linked List", "Design", "Heap (Priority Queue)"],
    description:
      "Design a simplified version of Twitter where users can post tweets, follow/unfollow other users, and retrieve a news feed of the 10 most recent tweets in the user's news feed. Each tweet has a monotonically increasing timestamp.",
    example: "twitter.postTweet(1,5); twitter.getNewsFeed(1); // returns [5]",
    starterCode: `class Twitter {
    public Twitter() {
        // your code here
    }

    public void postTweet(int userId, int tweetId) {
        // your code here
    }

    public List<Integer> getNewsFeed(int userId) {
        // your code here
        return new ArrayList<>();
    }

    public void follow(int followerId, int followeeId) {
        // your code here
    }

    public void unfollow(int followerId, int followeeId) {
        // your code here
    }
}
`,
    solution: `class Twitter {
    private int timestamp = 0;
    private Map<Integer, Set<Integer>> following = new HashMap<>();
    private Map<Integer, List<int[]>> tweets = new HashMap<>();

    public Twitter() {}

    public void postTweet(int userId, int tweetId) {
        tweets.computeIfAbsent(userId, k -> new ArrayList<>())
              .add(new int[]{timestamp++, tweetId});
    }

    public List<Integer> getNewsFeed(int userId) {
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> b[0] - a[0]);
        Set<Integer> users = new HashSet<>(following.getOrDefault(userId, new HashSet<>()));
        users.add(userId);
        for (int u : users) {
            List<int[]> t = tweets.get(u);
            if (t != null && !t.isEmpty()) {
                int[] last = t.get(t.size() - 1);
                pq.offer(new int[]{last[0], last[1], u, t.size() - 1});
            }
        }
        List<Integer> res = new ArrayList<>();
        while (!pq.isEmpty() && res.size() < 10) {
            int[] top = pq.poll();
            res.add(top[1]);
            int idx = top[3] - 1;
            if (idx >= 0) {
                int[] prev = tweets.get(top[2]).get(idx);
                pq.offer(new int[]{prev[0], prev[1], top[2], idx});
            }
        }
        return res;
    }

    public void follow(int followerId, int followeeId) {
        following.computeIfAbsent(followerId, k -> new HashSet<>()).add(followeeId);
    }

    public void unfollow(int followerId, int followeeId) {
        following.getOrDefault(followerId, new HashSet<>()).remove(followeeId);
    }
}`,
    tests: [
      {
        input: "[\"Twitter\",[\"postTweet\",1,5],[\"getNewsFeed\",1]]",
        expected: "[[5]]",
      },
      {
        input: "[\"Twitter\",[\"postTweet\",1,5],[\"postTweet\",1,3],[\"getNewsFeed\",1]]",
        expected: "[[3,5]]",
      },
    ],
  },
];

// ---------- Helpers ----------
interface RunCodeResponse {
  results: { input: string; expected: string; actual: string; passed: boolean }[];
  allPassed: boolean;
  runtimeError: string | null;
}

/**
 * The run-code API's JavaScript sandbox only auto-detects `solution` or
 * `twoSum`. We alias the problem's `fnName` to `solution` so the sandbox
 * can locate any user-defined function.
 */
function aliasSolutionFn(code: string, fnName?: string): string {
  if (!fnName) return code;
  return `${code}\nvar solution = typeof ${fnName} !== "undefined" ? ${fnName} : null;\n`;
}

// ---------- Subcomponents ----------
function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Pill tone={DIFFICULTY_TONE[difficulty]}>{difficulty}</Pill>;
}

function LanguageTag({ language }: { language: Language }) {
  const color = LANGUAGE_COLOR[language];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ color, borderColor: `${color}40`, backgroundColor: `${color}14` }}
    >
      <FileCode2 className="size-3" />
      {language}
    </span>
  );
}

function ProblemListItem({
  problem,
  solved,
  active,
  onClick,
}: {
  problem: Problem;
  solved: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border bg-card/60 p-4 text-left transition-all hover:border-primary/50 hover:bg-accent/40",
        active
          ? "border-primary/70 bg-primary/5 ring-1 ring-primary/30"
          : "border-border/70"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "text-sm font-semibold leading-tight",
                active ? "text-primary" : "text-foreground"
              )}
            >
              {problem.title}
            </h3>
            {solved && (
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <DifficultyBadge difficulty={problem.difficulty} />
            <LanguageTag language={problem.language} />
          </div>
        </div>
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5",
            active && "text-primary"
          )}
        />
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1">
        {problem.topics.map((t) => (
          <span
            key={t}
            className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </button>
  );
}

function OutputPanel({
  mode,
  runResult,
  review,
  reviewLoading,
  solution,
  problem,
}: {
  mode: OutputMode;
  runResult: RunResult | null;
  review: CodeReview | null;
  reviewLoading: boolean;
  solution: string | null;
  problem: Problem;
}) {
  if (mode === "idle") {
    return (
      <AIEmptyState
        icon={Terminal}
        title="Run code or get AI review"
        description="Execute your solution against test cases, or ask the AI for an in-depth review with complexity analysis and improvement tips."
      />
    );
  }

  if (mode === "running") {
    if (!runResult) {
      return (
        <div className="flex items-center gap-2 rounded-xl border p-4 text-sm text-muted-foreground">
          <TypingDots /> Running tests…
        </div>
      );
    }
    const allPassed = runResult.allPassed;
    return (
      <div className="space-y-3">
        <div
          className={cn(
            "flex items-center justify-between rounded-xl border p-4",
            allPassed
              ? "border-primary/30 bg-primary/5"
              : "border-amber-500/30 bg-amber-500/5"
          )}
        >
          <div className="flex items-center gap-2">
            {allPassed ? (
              <CheckCircle2 className="size-5 text-primary" />
            ) : (
              <AlertCircle className="size-5 text-amber-500" />
            )}
            <span className="font-semibold">
              {allPassed
                ? "All tests passed!"
                : `${runResult.passed}/${runResult.total} tests passed`}
            </span>
          </div>
          <Pill tone={allPassed ? "good" : "warn"}>
            {runResult.passed}/{runResult.total}
          </Pill>
        </div>
        {runResult.runtimeError && (
          <pre className="overflow-x-auto rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-600 dark:text-red-300">
            <span className="font-semibold">Runtime error: </span>
            {runResult.runtimeError}
          </pre>
        )}
        <div className="space-y-2">
          {runResult.cases.map((c, i) => (
            <div
              key={i}
              className={cn(
                "rounded-lg border p-3 text-sm",
                c.passed
                  ? "border-primary/20 bg-primary/5"
                  : "border-red-500/20 bg-red-500/5"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  {c.passed ? (
                    <Check className="size-4 text-primary" />
                  ) : (
                    <X className="size-4 text-red-500" />
                  )}
                  {c.label}
                </span>
                <Pill tone={c.passed ? "good" : "bad"}>
                  {c.passed ? "PASS" : "FAIL"}
                </Pill>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground">Input: </span>
                  <code className="font-mono">{c.input}</code>
                </div>
                {c.error ? (
                  <pre className="overflow-x-auto rounded bg-red-500/10 p-2 text-red-600 dark:text-red-300">
                    {c.error}
                  </pre>
                ) : (
                  <div className="grid gap-1 sm:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground">Output: </span>
                      <code className="font-mono">{c.actual}</code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected: </span>
                      <code className="font-mono">{c.expected}</code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "review") {
    if (reviewLoading) {
      return (
        <div className="flex items-center gap-2 rounded-xl border p-4 text-sm text-muted-foreground">
          <TypingDots /> AI is reviewing your solution…
        </div>
      );
    }
    if (!review) {
      return (
        <AIEmptyState
          icon={Sparkles}
          title="Review unavailable"
          description="Could not generate an AI review. Try again in a moment."
        />
      );
    }
    const correctnessTone: "good" | "warn" | "bad" =
      review.correctness === "Correct"
        ? "good"
        : review.correctness === "Mostly Correct"
          ? "warn"
          : "bad";
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card/60 p-5 sm:flex-row sm:items-center">
          <ScoreRing value={review.score} size={104} label="Score" />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="text-base font-semibold">AI Code Review</span>
              <Pill tone={correctnessTone}>{review.correctness}</Pill>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:justify-start">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground">
                <Clock className="size-3" /> {review.complexity.time}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground">
                <Database className="size-3" /> {review.complexity.space}
              </span>
            </div>
          </div>
        </div>

        <ReviewSection
          icon={CheckCircle2}
          title="Strengths"
          tone="good"
          items={review.strengths}
        />
        <ReviewSection
          icon={AlertCircle}
          title="Issues"
          tone="bad"
          items={review.issues}
          emptyText="No issues identified."
        />
        <ReviewSection
          icon={Lightbulb}
          title="Suggestions"
          tone="info"
          items={review.suggestions}
        />
        {review.betterApproach && review.betterApproach !== "N/A" && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Zap className="size-4" /> Better Approach
            </div>
            <p className="mt-1.5 text-sm text-foreground/90">
              {review.betterApproach}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (mode === "solution" && solution) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Lightbulb className="size-4" /> Reference Solution · {problem.title}
        </div>
        <pre className="overflow-x-auto rounded-xl border bg-muted/40 p-4 text-xs leading-relaxed">
          <code className="font-mono">{solution}</code>
        </pre>
        <p className="text-xs text-muted-foreground">
          Treat this as a reference. Try to understand the approach before
          moving on — and consider comparing complexity with your own.
        </p>
      </div>
    );
  }

  return null;
}

function ReviewSection({
  icon: Icon,
  title,
  tone,
  items,
  emptyText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone: "good" | "warn" | "bad" | "info";
  items: string[];
  emptyText?: string;
}) {
  const toneColor = {
    good: "text-primary",
    warn: "text-amber-500",
    bad: "text-red-500",
    info: "text-purple-500",
  }[tone];
  const toneDot = {
    good: "bg-primary",
    warn: "bg-amber-500",
    bad: "bg-red-500",
    info: "bg-purple-500",
  }[tone];
  return (
    <div className="rounded-xl border bg-card/60 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className={cn("size-4", toneColor)} />
        {title}
        <span className="text-xs font-normal text-muted-foreground">
          ({items.length})
        </span>
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {emptyText ?? "None."}
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/90">
              <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", toneDot)} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Main module ----------
export function CodingPracticeModule() {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();
  const monacoTheme = resolvedTheme === "dark" ? "vs-dark" : "vs";

  const [solved, setSolved] = React.useState<Set<string>>(new Set());
  const [activeId, setActiveId] = React.useState<string>(PROBLEMS[0].id);
  const [codeByProblem, setCodeByProblem] = React.useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(PROBLEMS.map((p) => [p.id, p.starterCode]))
  );
  const [languageOverride, setLanguageOverride] = React.useState<
    Record<string, Language>
  >({});

  // Filters
  const [diffFilter, setDiffFilter] = React.useState<"All" | Difficulty>("All");
  const [langFilter, setLangFilter] = React.useState<"All" | Language>("All");
  const [query, setQuery] = React.useState("");

  // Mobile view toggle
  const [mobileView, setMobileView] = React.useState<"list" | "editor">(
    "list"
  );

  // Output state
  const [outputMode, setOutputMode] = React.useState<OutputMode>("idle");
  const [runResult, setRunResult] = React.useState<RunResult | null>(null);
  const [running, setRunning] = React.useState(false);
  const [review, setReview] = React.useState<CodeReview | null>(null);
  const [reviewLoading, setReviewLoading] = React.useState(false);
  const [showSolution, setShowSolution] = React.useState(false);

  const activeProblem = React.useMemo(
    () => PROBLEMS.find((p) => p.id === activeId)!,
    [activeId]
  );

  const filtered = React.useMemo(() => {
    return PROBLEMS.filter((p) => {
      if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
      if (langFilter !== "All" && p.language !== langFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.topics.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [diffFilter, langFilter, query]);

  const code = codeByProblem[activeId] ?? activeProblem.starterCode;
  const language =
    languageOverride[activeId] ?? activeProblem.language;

  // ---------- Actions ----------
  const onCodeChange = (value: string | undefined) => {
    setCodeByProblem((prev) => ({ ...prev, [activeId]: value ?? "" }));
  };

  const onSelectProblem = (id: string) => {
    setActiveId(id);
    setOutputMode("idle");
    setRunResult(null);
    setReview(null);
    setShowSolution(false);
    setMobileView("editor");
  };

  const onReset = () => {
    setCodeByProblem((prev) => ({
      ...prev,
      [activeId]: activeProblem.starterCode,
    }));
    setLanguageOverride((prev) => {
      const next = { ...prev };
      delete next[activeId];
      return next;
    });
    setOutputMode("idle");
    setRunResult(null);
    toast.info("Reset to starter code");
  };

  const onRun = async () => {
    if (running) return;
    setRunning(true);
    setOutputMode("running");
    setRunResult(null);
    setReview(null);
    setShowSolution(false);
    try {
      const payload = {
        code: aliasSolutionFn(code, activeProblem.fnName),
        language,
        testCases: activeProblem.tests,
      };
      const data = await fetchWithFallback<RunCodeResponse>(
        "/api/ai/run-code",
        payload,
      );
      const passedCount = data.results.filter((r) => r.passed).length;
      const result: RunResult = {
        passed: passedCount,
        total: data.results.length,
        allPassed: !!data.allPassed,
        runtimeError: data.runtimeError ?? null,
        cases: data.results.map((r, i) => ({
          label: `Test ${i + 1}`,
          input: r.input,
          expected: r.expected,
          actual: r.actual,
          passed: r.passed,
        })),
      };
      setRunResult(result);
      if (result.allPassed) {
        setSolved((prev) => {
          if (prev.has(activeId)) return prev;
          const next = new Set(prev);
          next.add(activeId);
          return next;
        });
        toast.success("All tests passed — problem marked as solved!");
      } else {
        toast.error(`${result.passed}/${result.total} tests passed`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Run failed");
      setRunResult(null);
      setOutputMode("idle");
    } finally {
      setRunning(false);
    }
  };

  const onAIReview = async () => {
    setOutputMode("review");
    setRunResult(null);
    setShowSolution(false);
    setReview(null);
    setReviewLoading(true);
    try {
      const review = await fetchWithFallback<CodeReview>(
        "/api/ai/code-review",
        {
          code,
          language: activeProblem.language,
          problem: {
            title: activeProblem.title,
            description: activeProblem.description,
            difficulty: activeProblem.difficulty,
          },
        },
      );
      setReview(review);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI review failed");
      setReview(null);
    } finally {
      setReviewLoading(false);
    }
  };

  const onShowSolution = () => {
    setOutputMode("solution");
    setShowSolution(true);
    setRunResult(null);
    setReview(null);
  };

  const progress = (solved.size / PROBLEMS.length) * 100;

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Code2}
        title="Coding Practice"
        description="Sharpen your DSA skills with a mini LeetCode-style IDE and AI review"
      >
        <Card className="w-full px-4 py-3 sm:w-72">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Trophy className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Solved</p>
                <p className="text-sm font-semibold">
                  {solved.size} / {PROBLEMS.length}
                </p>
              </div>
            </div>
            <Pill tone="good">{Math.round(progress)}%</Pill>
          </div>
          <Progress value={progress} className="mt-3 h-1.5" />
        </Card>
      </ModuleHeader>

      {/* Mobile view toggle */}
      <div className="flex items-center gap-2 lg:hidden">
        <Button
          size="sm"
          variant={mobileView === "list" ? "default" : "outline"}
          onClick={() => setMobileView("list")}
          className="gap-1.5"
        >
          <ListTree className="size-3.5" /> Problems
        </Button>
        <Button
          size="sm"
          variant={mobileView === "editor" ? "default" : "outline"}
          onClick={() => setMobileView("editor")}
          className="gap-1.5"
        >
          <Code2 className="size-3.5" /> Editor
        </Button>
      </div>

      <div className="lg:grid lg:grid-cols-[40%_60%] lg:gap-6">
        {/* LEFT — Problem list */}
        <div
          className={cn(
            "space-y-3",
            mobileView === "list" ? "block" : "hidden",
            "lg:block"
          )}
        >
          <Card className="gap-0">
            <CardHeader className="gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ListTree className="size-4 text-primary" />
                Problems
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title or topic…"
                  className="pl-8"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:bg-accent"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={diffFilter}
                  onValueChange={(v) => setDiffFilter(v as "All" | Difficulty)}
                >
                  <SelectTrigger size="sm" className="h-8 w-[120px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={langFilter}
                  onValueChange={(v) => setLangFilter(v as "All" | Language)}
                >
                  <SelectTrigger size="sm" className="h-8 w-[130px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Languages</SelectItem>
                    <SelectItem value="JavaScript">JavaScript</SelectItem>
                    <SelectItem value="TypeScript">TypeScript</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Java">Java</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-22rem)] pr-3">
                <div className="space-y-2">
                  {filtered.length === 0 ? (
                    <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                      No problems match your filters.
                    </div>
                  ) : (
                    filtered.map((p) => (
                      <ProblemListItem
                        key={p.id}
                        problem={p}
                        solved={solved.has(p.id)}
                        active={p.id === activeId}
                        onClick={() => onSelectProblem(p.id)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Detail + Editor + Output */}
        <div
          className={cn(
            "space-y-4",
            mobileView === "editor" ? "block" : "hidden",
            "lg:block"
          )}
        >
          {/* Problem detail */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">
                  {activeProblem.title}
                </CardTitle>
                <DifficultyBadge difficulty={activeProblem.difficulty} />
                <LanguageTag language={activeProblem.language} />
                {solved.has(activeProblem.id) && (
                  <Pill tone="good">
                    <CheckCircle2 className="size-3" /> Solved
                  </Pill>
                )}
              </div>
              <CardDescription className="flex flex-wrap gap-1 pt-1">
                {activeProblem.topics.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm leading-relaxed text-foreground/90">
                {activeProblem.description}
              </p>
              <div className="rounded-lg border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground/90">
                {activeProblem.example}
              </div>
            </CardContent>
          </Card>

          {/* Editor + language select */}
          <Card className="gap-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Code2 className="size-4 text-primary" />
                Editor
              </div>
              <Select
                value={language}
                onValueChange={(v) =>
                  setLanguageOverride((prev) => ({
                    ...prev,
                    [activeId]: v as Language,
                  }))
                }
              >
                <SelectTrigger size="sm" className="h-8 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JavaScript">JavaScript</SelectItem>
                  <SelectItem value="TypeScript">TypeScript</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Java">Java</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-[400px] w-full">
              {mounted ? (
                <Editor
                  height="400px"
                  language={MONACO_LANG[language]}
                  theme={monacoTheme}
                  value={code}
                  onChange={onCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    tabSize: 2,
                    automaticLayout: true,
                    padding: { top: 12, bottom: 12 },
                  }}
                />
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">
                  Loading editor…
                </div>
              )}
            </div>
          </Card>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={onRun}
              size="sm"
              className="gap-1.5"
              disabled={running}
            >
              {running ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5" />
              )}
              {running ? "Running…" : "Run"}
            </Button>
            <AIButton
              onClick={onAIReview}
              loading={reviewLoading}
              disabled={running}
            >
              AI Review
            </AIButton>
            <Button
              onClick={onShowSolution}
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={running}
            >
              <Lightbulb className="size-3.5" /> Show Solution
            </Button>
            <Button
              onClick={onReset}
              size="sm"
              variant="ghost"
              className="ml-auto gap-1.5"
              disabled={running}
            >
              <RotateCcw className="size-3.5" /> Reset
            </Button>
          </div>

          {/* Output panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Terminal className="size-4 text-primary" /> Output
                {outputMode === "running" && running && !runResult && (
                  <Pill tone="info">Running…</Pill>
                )}
                {outputMode === "running" && runResult && (
                  <Pill tone={runResult.allPassed ? "good" : "warn"}>
                    {runResult.passed}/{runResult.total}
                  </Pill>
                )}
                {outputMode === "review" && review && (
                  <Pill tone="info">Score {review.score}/100</Pill>
                )}
              </CardTitle>
              <CardDescription>
                {language === "JavaScript"
                  ? "Live execution — Run to validate your code against test cases."
                  : "AI-simulated execution — Run to validate your code against test cases."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OutputPanel
                mode={outputMode}
                runResult={runResult}
                review={review}
                reviewLoading={reviewLoading}
                solution={showSolution ? activeProblem.solution : null}
                problem={activeProblem}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
