# Algorithmic complexity

> Objectives: measure the cost of an algorithm without timing it, and read O(...) notation.

## Why measure complexity

Complexity measures how well an algorithm performs. Timing a program depends on the machine, the language and whatever else is running. Instead we count how many operations the algorithm performs as a function of the input size **n**.

### Time complexity

Time complexity measures running time, that is, the number of elementary operations (a comparison, an addition, an array access) as a function of n.

Take the maximum search again: a loop of n − 1 comparisons. If n doubles, the work doubles. We say the complexity is **linear** and write O(n).

To get a feel for it, picture a phone book of 1,000,000 names sorted alphabetically. Reading names one by one takes up to 1,000,000 steps. Opening the book in the middle and discarding half of it each time takes at most 20 steps. That is binary search, covered later in this course.

### Space complexity

Space complexity measures the extra memory used beyond the input. `find_max` uses two variables whatever the size of the array: its space complexity is constant, O(1). An algorithm that copies the array in order to sort it needs O(n) extra memory.

## Big O notation

O(f(n)) gives an **order of magnitude** for how the cost grows when n gets large. We ignore constants and lower-order terms: 3n + 10 is O(n), and n² + 5n + 2 is O(n²).

| Complexity | Name | Example |
|---|---|---|
| O(1) | constant | reading array cell `a[i]` |
| O(log n) | logarithmic | binary search |
| O(n) | linear | scanning an array |
| O(n log n) | linearithmic | merge sort |
| O(n²) | quadratic | two nested loops over n elements |
| O(2ⁿ) | exponential | trying every subset |

With n = 1,000,000 and a machine doing a billion operations per second, an O(n) algorithm takes a thousandth of a second, an O(n²) algorithm about 17 minutes, and an O(2ⁿ) algorithm longer than the age of the universe.

### Worst case and best case

Complexity sometimes depends on the data itself. Looking for a value in an unsorted array: if it is in first position, one comparison is enough (best case); if it is absent, every element must be checked (worst case). Unless stated otherwise, we quote the **worst case**, because it is the guarantee we can give.

## Practice: counting steps

Work these out, type the answer and press **Check**.

```exercise
Binary search discards half of the remaining elements at each step. How many times can you halve 1,024 elements before only 1 is left?
--- answer
10
--- explain
1,024 = 2¹⁰, so log₂(1,024) = 10 halvings. This is why binary search is O(log n).
--- hint
What power of 2 is 1,024?
```

## Key takeaways: complexity

- We count operations as a function of n; we do not time the program.
- O(...) keeps the dominant term and ignores constants.
- The order to know: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).
- We usually quote the worst case.

```quiz
A function has two nested loops, each going over the n elements of an array. What is its time complexity?
- [ ] O(n)
- [ ] O(2n)
- [x] O(n²)
- [ ] O(log n)
> n × n operations: the complexity is quadratic.
```

```quiz
What does n stand for in O(n)?
- [ ] The number of lines of code
- [x] The size of the input
- [ ] The running time in seconds
> Complexity describes how the cost grows with the size of the input.
```
