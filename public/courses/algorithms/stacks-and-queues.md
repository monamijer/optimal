# Stacks (LIFO) and queues (FIFO)

> Objectives: tell a stack from a queue, know their uses and implement them.

## Stacks: last in, first out

A **stack** works like a pile of plates: you always add and remove at the top. The last element added is the first one removed. This is the **LIFO** principle (*Last In, First Out*).

Operations:

- `push(x)`: add x on top;
- `pop()`: remove and return the top;
- `peek()`: read the top without removing it;
- `is_empty()`.

All of them are O(1).

### Implementation with an array

```c
#define CAPACITY 100

typedef struct {
    int items[CAPACITY];
    int size;
} Stack;

void stack_init(Stack *s)          { s->size = 0; }
int  stack_is_empty(const Stack *s) { return s->size == 0; }

int push(Stack *s, int value) {
    if (s->size == CAPACITY) return 0;    /* stack is full */
    s->items[s->size++] = value;
    return 1;
}

int pop(Stack *s, int *value) {
    if (stack_is_empty(s)) return 0;       /* stack is empty */
    *value = s->items[--s->size];
    return 1;
}
```

### Common uses of stacks

- the "Undo" button of an editor;
- the function call stack (see the chapter on recursion);
- checking parentheses: push each `(` and pop on each `)`; the expression is balanced if the stack is empty at the end and was never popped while empty.

## Queues: first in, first out

A **queue** works like a waiting line: the first to arrive is the first served. This is the **FIFO** principle (*First In, First Out*).

- `enqueue(x)`: add x at the back;
- `dequeue()`: remove and return the front element.

With a linked list that keeps a pointer to both the head **and** the tail, both operations are O(1). With an array, use a **circular buffer**: the start and end indexes wrap back to 0 after the last cell (`(i + 1) % CAPACITY`), which avoids shifting elements at each removal.

### Common uses of queues

- a print queue;
- messages waiting in a server;
- breadth-first traversal of a graph.

## Stack or queue?

| | Stack | Queue |
|---|---|---|
| Output order | most recent to oldest | oldest to most recent |
| Principle | LIFO | FIFO |
| Example | undoing an action | waiting at a counter |

## Key takeaways: stacks and queues

- Stack = LIFO, queue = FIFO; their basic operations are O(1).
- A stack is simple to implement with an array, a queue with a linked list or a circular buffer.
- Always test "empty" before removing and "full" before adding.

```quiz
You push 1, 2, 3 onto a stack, then pop once. Which value do you get?
- [ ] 1
- [ ] 2
- [x] 3
- [ ] It cannot be known
> LIFO: the last element pushed (3) is the first removed.
```

```quiz
You enqueue 1, 2, 3 in a queue, then dequeue once. Which value do you get?
- [x] 1
- [ ] 2
- [ ] 3
> FIFO: the first element enqueued (1) comes out first.
```

```quiz
Parentheses are checked with a stack: push on each `(`, pop on each `)`. What is the verdict for `(()`?
- [ ] Balanced
- [x] Not balanced: the stack is not empty at the end
- [ ] Not balanced: a pop happens on an empty stack
- [ ] Balanced, because there are more `(` than `)`
> One `(` is never popped, so the stack still holds an element at the end.
```

```quiz
Why use a circular buffer to implement a queue with an array?
- [ ] To make the queue sorted
- [x] To avoid shifting elements at each removal
- [ ] To allow direct access to any element
- [ ] To make the queue unlimited in size
> The start and end indexes wrap around with `% CAPACITY`, so dequeue never moves the other elements.
```
