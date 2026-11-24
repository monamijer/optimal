# Searching algorithms

> Objectives: write linear search and binary search, and know when to use which.

## Linear search

To find a value in an unsorted array, the only option is to look at the elements one by one. The function returns the index where the value is found, or -1.

```c
int linear_search(const int values[], int count, int target) {
    for (int i = 0; i < count; i++) {
        if (values[i] == target) return i;
    }
    return -1;
}
```

Worst case: the value is absent and we make n comparisons. The complexity is O(n).

## Binary search

If the array is **sorted**, we can do much better. Compare the target with the middle element:

- if they are equal, we are done;
- if the middle element is greater than the target, search the left half;
- otherwise, search the right half.

At each step, half of the candidates are discarded.

```c
int binary_search(const int values[], int count, int target) {
    int low = 0, high = count - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;   /* avoids int overflow */
        if (values[mid] == target)      return mid;
        else if (values[mid] < target)  low = mid + 1;
        else                            high = mid - 1;
    }
    return -1;
}
```

Computing `low + (high - low) / 2` instead of `(low + high) / 2` avoids an integer overflow on very large arrays.

### Why O(log n)

After one step n/2 candidates remain, after two n/4, and so on. We stop when one is left, so after about log₂(n) steps.

| Array size | Linear search (worst case) | Binary search (worst case) |
|---|---|---|
| 1,000 | 1,000 comparisons | about 10 |
| 1,000,000 | 1,000,000 comparisons | about 20 |
| 1,000,000,000 | 1,000,000,000 comparisons | about 30 |

This is why a sorted directory of a million names can be searched in at most 20 steps.

## The cost of sorting

Binary search requires a sorted array, and sorting usually costs O(n log n). If you search **only once**, linear search is cheaper. If you search **often** in the same data, sort once (see the next chapter) and then search fast every time.

Another limit: binary search needs direct access to the middle element, so it needs an array. On a linked list, reaching the middle costs O(n) and the advantage disappears.

## Key takeaways: searching

- Unsorted: linear search, O(n).
- Sorted and stored in an array: binary search, O(log n).
- Sorting first only pays off if you search several times.

```quiz
Roughly how many comparisons does binary search need, at most, in a sorted array of 1,000,000 elements?
- [x] About 20
- [ ] About 1,000
- [ ] About 500,000
- [ ] 1,000,000
> log₂(1,000,000) ≈ 20: each comparison discards half of the elements.
```

```quiz
Which condition is required to use binary search?
- [ ] The array has no duplicates
- [x] The array is sorted
- [ ] The array has fewer than 1,000 elements
> Without order, comparing with the middle element does not let us discard a half.
```
