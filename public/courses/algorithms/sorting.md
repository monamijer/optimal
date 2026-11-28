# Sorting algorithms

> Objectives: understand two simple O(n²) sorts and merge sort in O(n log n), and know when to use each.

## Why sort

A sorted array can be read in order, searched with binary search, and makes duplicates easy to spot. Sorting is one of the most studied problems in computer science.

## Insertion sort

We build a sorted prefix one element at a time: each new element is inserted at its place among the previous ones, like sorting cards in your hand.

```c
void insertion_sort(int values[], int count) {
    for (int i = 1; i < count; i++) {
        int current = values[i];
        int j = i - 1;
        while (j >= 0 && values[j] > current) {
            values[j + 1] = values[j];     /* shift right */
            j--;
        }
        values[j + 1] = current;
    }
}
```

Worst case (array in reverse order): O(n²). Best case (already sorted): O(n). A good choice for **small** arrays or nearly sorted ones.

## Selection sort

At each round, find the smallest element of the rest of the array and move it to the front.

```c
void selection_sort(int values[], int count) {
    for (int i = 0; i < count - 1; i++) {
        int smallest = i;
        for (int j = i + 1; j < count; j++) {
            if (values[j] < values[smallest]) smallest = j;
        }
        int tmp = values[i];
        values[i] = values[smallest];
        values[smallest] = tmp;
    }
}
```

Always O(n²) comparisons, even on an already sorted array. On the other hand it makes very few swaps (at most n − 1).

## Merge sort

It uses the **divide and conquer** strategy: split the array in two halves, sort each one recursively, then **merge** the two sorted halves into one.

```c
static void merge(int values[], int buffer[], int start, int mid, int end) {
    int i = start, j = mid, k = start;
    while (i < mid && j < end) {
        buffer[k++] = (values[i] <= values[j]) ? values[i++] : values[j++];
    }
    while (i < mid) buffer[k++] = values[i++];
    while (j < end) buffer[k++] = values[j++];
    for (k = start; k < end; k++) values[k] = buffer[k];
}

static void sort_range(int values[], int buffer[], int start, int end) {
    if (end - start < 2) return;               /* 0 or 1 element: already sorted */
    int mid = start + (end - start) / 2;
    sort_range(values, buffer, start, mid);
    sort_range(values, buffer, mid, end);
    merge(values, buffer, start, mid, end);
}

void merge_sort(int values[], int count) {
    int *buffer = malloc(count * sizeof *buffer);
    if (buffer == NULL) return;
    sort_range(values, buffer, 0, count);
    free(buffer);
}
```

We split in two log₂(n) times, and each level of merging goes over n elements: the total cost is **O(n log n)** in every case. The price is an auxiliary array: O(n) extra memory.

## Comparison

| Sort | Worst case | Best case | Extra memory | Note |
|---|---|---|---|---|
| Insertion | O(n²) | O(n) | O(1) | excellent if nearly sorted |
| Selection | O(n²) | O(n²) | O(1) | few swaps |
| Merge | O(n log n) | O(n log n) | O(n) | steady, stable |

For a million elements, n² is a trillion operations while n log n is only about twenty million: the difference is enormous. Standard libraries use O(n log n) sorts (for example `qsort` in C, `sort` in Python or JavaScript). In practice you rarely write your own sort, but you need to know what they cost.

A sort is **stable** if it keeps the relative order of equal elements. The merge sort above is (thanks to the `<=`), and so is insertion sort; selection sort is not.

## Key takeaways: sorting

- Insertion and selection: O(n²), simple, suited to small arrays.
- Merge: O(n log n) in every case, with extra memory.
- "Divide and conquer": split, solve each piece, combine.

```quiz
Which sort is the fastest on an array that is already nearly sorted?
- [x] Insertion sort
- [ ] Selection sort
- [ ] They are all identical
> Insertion sort shifts almost nothing and approaches O(n); selection sort always makes O(n²) comparisons.
```

```quiz
Which are characteristics of merge sort? (several answers)
- [x] O(n log n) complexity in every case
- [x] It uses an auxiliary array
- [ ] It sorts in place with no extra memory
- [ ] It is O(n²) in the worst case
> Dividing and merging gives O(n log n), at the price of O(n) extra memory.
```

```quiz
Why is the cost of merge sort O(n log n)?
- [ ] It compares every pair of elements
- [x] The array is halved about log n times and each level of merging goes over n elements
- [ ] It always swaps n elements once
- [ ] It uses an auxiliary array
> There are about log₂(n) levels of splitting, and each level merges n elements in total.
```

```quiz
What is the maximum number of swaps selection sort makes on an array of 1,000 elements?
- [ ] About 1,000,000
- [x] 999
- [ ] About 10
- [ ] 0, it never swaps
> It makes at most one swap per round and there are n − 1 rounds, so 999.
```
