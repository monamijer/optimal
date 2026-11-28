# How linked lists work

> Objectives: understand the principle of a linked list, write one in C, and compare it with an array.

## The principle

A linked list is made of **nodes** scattered in memory. Each node holds a value and a **pointer** to the next node. The last node points to `NULL`. We only keep the address of the first node, the **head**.

```c
typedef struct Node {
    int value;
    struct Node *next;
} Node;
```

Unlike an array, nodes are not side by side: to reach the 4th element, you follow the pointers from the head.

## Inserting at the head in O(1)

Inserting at the beginning needs no shifting: create a node and link it in front of the old head.

```c
Node *push_front(Node *head, int value) {
    Node *node = malloc(sizeof *node);
    if (node == NULL) return head;       /* out of memory */
    node->value = value;
    node->next = head;
    return node;                         /* the new head */
}
```

## Traversing and searching in O(n)

```c
Node *find(Node *head, int value) {
    for (Node *node = head; node != NULL; node = node->next) {
        if (node->value == value) return node;
    }
    return NULL;
}
```

There is no direct access: reaching the i-th element costs O(i).

## Deleting a node

To delete the node that follows a node `prev`, we change a single pointer and then free the memory:

```c
void remove_after(Node *prev) {
    Node *target = prev->next;
    if (target == NULL) return;
    prev->next = target->next;
    free(target);
}
```

If you already hold a pointer to the place of the operation, deleting is O(1): nothing shifts. But to **find** that place you first have to traverse the list.

## Array or linked list?

| | Array | Linked list |
|---|---|---|
| Access to the i-th element | O(1) | O(i) |
| Insert at the head | O(n) | O(1) |
| Insert or delete at a place already reached | O(n) | O(1) |
| Memory | compact | one extra pointer per element |
| Traversal | fast (contiguous cells) | slower (scattered nodes) |

In practice, arrays are often faster than expected because contiguous memory is friendly to the processor cache. A linked list makes sense when you frequently insert and delete at the head or at places you already hold.

Common mistakes: forgetting to `free` deleted nodes, which causes a **memory leak**, and using a node after freeing it, which is undefined behavior.

## Key takeaways: linked lists

- A node = a value + a pointer to the next one; we keep the head.
- Insert at the head in O(1); search and access by position in O(n).
- Every deletion must free the memory, and nothing may be used afterwards.

```quiz
Which operation is O(1) on a singly linked list (given the head)?
- [ ] Reading the last element
- [x] Inserting an element at the first position
- [ ] Searching for a value
- [ ] Reading the element at index i
> We link a new node in front of the head: a few assignments, whatever the size.
```

```quiz
What happens if you delete a node without calling `free`?
- [ ] Nothing, memory is reclaimed automatically in C
- [x] A memory leak: the memory stays reserved
- [ ] The program stops immediately
> C has no garbage collector: memory allocated with `malloc` must be freed by the programmer.
```

```quiz
You already hold a pointer `prev` to a node of a long singly linked list. What is the cost of deleting the node right after it?
- [x] O(1)
- [ ] O(log n)
- [ ] O(n)
- [ ] O(n²)
> Only one pointer changes (`prev->next`) and nothing shifts, so the cost does not depend on the length.
```

```quiz
Both an array and a linked list can be traversed in O(n). Why is the array often faster in practice?
- [ ] It needs fewer comparisons
- [x] Its contiguous cells work well with the processor cache
- [ ] It stores a pointer in each cell
- [ ] It never needs to be freed
> Contiguous memory is read efficiently by the cache, while scattered nodes cause more slow memory accesses.
```
