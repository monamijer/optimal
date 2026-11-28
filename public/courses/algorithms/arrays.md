# Working with arrays

> Objectives: understand how an array is laid out in memory, and know the cost of its operations.

## What is an array?

An array is a sequence of elements **of the same type** stored one after another in memory. Each element has an **index**, starting at 0.

```c
int scores[5] = {12, 15, 9, 18, 14};
printf("%d\n", scores[3]);   /* prints 18 */
```

## Direct access in O(1)

Because elements are contiguous and have the same size, the address of `scores[i]` is computed directly: start address + i × element size. Reading cell 0 or cell 4,000,000 costs the same, so access is O(1).

This is the great strength of arrays.

## Cost of operations

| Operation | Complexity | Why |
|---|---|---|
| Read or write `a[i]` | O(1) | address computation |
| Visit every element | O(n) | one step per cell |
| Search for a value (unsorted) | O(n) | worst case: it is absent |
| Insert in the middle | O(n) | following elements must shift |
| Delete in the middle | O(n) | the gap must be closed |
| Append at the end (if there is room) | O(1) | write into the next free cell |

Here is insertion at a given position, showing the shift that explains the cost:

```c
/* Inserts value at position pos. The array holds count elements
   and has room for at least count + 1. */
void insert_at(int values[], int count, int pos, int value) {
    for (int i = count; i > pos; i--) {
        values[i] = values[i - 1];     /* shift right */
    }
    values[pos] = value;
}
```

Inserting at the first position shifts all n elements: that is the worst case.

## Fixed size and overflow

In C, the size of an array is fixed when it is created. Writing to `a[n]` or beyond is a **buffer overflow**: the program writes to memory it does not own. The behavior is undefined, and it is a classic source of security vulnerabilities. Always make sure that `0 <= i < n`.

For a variable size, allocate dynamically and grow when needed:

```c
typedef struct {
    int *items;
    int count;
    int capacity;
} IntList;

int list_append(IntList *list, int value) {
    if (list->count == list->capacity) {
        int new_capacity = list->capacity == 0 ? 4 : list->capacity * 2;   /* double */
        int *grown = realloc(list->items, new_capacity * sizeof *grown);
        if (grown == NULL) return 0;                                       /* out of memory */
        list->items = grown;
        list->capacity = new_capacity;
    }
    list->items[list->count++] = value;
    return 1;
}
```

Doubling the capacity each time makes appending O(1) on average (this is called **amortized** cost), even though a single append can cost O(n) when the array is copied.

## Practice: addresses

Work these out, type the answer and press **Check**.

```exercise
An `int` array `scores` starts at address 1000 and each `int` takes 4 bytes. At which address is `scores[5]`? Answer with the number.
--- answer
1020
--- explain
start + i × element size = 1000 + 5 × 4 = 1020.
--- hint
Use start + i × size.
```

## Key takeaways: arrays

- Contiguous elements of the same type, indexed from 0.
- Access by index is O(1); inserting or deleting in the middle is O(n).
- Never go outside the bounds `0..n-1`.
- A dynamic array doubles its capacity to keep appends amortized O(1).

```quiz
Which operation is the most expensive on a large array?
- [ ] Reading `a[0]`
- [ ] Writing `a[n-1]`
- [x] Inserting an element at the first position
- [ ] Reading `a[500]`
> Inserting at the start shifts all n elements: O(n). Access by index is O(1).
```

```quiz
Why is access `a[i]` O(1)?
- [x] Elements are contiguous and the same size, so the address is computed directly
- [ ] The array is always sorted
- [ ] The computer remembers every value in a cache
> address = start + i × element size: a single computation, whatever i is.
```
