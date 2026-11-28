# Thinking recursively

> Objectives: write a correct recursive function, understand the call stack, and spot the cost of a badly designed recursion.

## A function that calls itself

A function is **recursive** when it calls itself on a smaller problem. Every correct recursive function has:

1. a **base case**: a situation so simple that we answer directly, with no further call;
2. a **recursive call** on data that gets closer to the base case.

Without a base case, or if we never get closer to it, the function never stops.

## Example: factorial

n! = n × (n − 1) × … × 1, with 0! = 1. The definition is itself recursive: n! = n × (n − 1)!.

```c
unsigned long factorial(unsigned int n) {
    if (n == 0) return 1;                  /* base case */
    return n * factorial(n - 1);           /* call on a smaller problem */
}
```

For `factorial(3)`, the calls unfold like this: 3 × factorial(2), which waits for 2 × factorial(1), which waits for 1 × factorial(0), which returns 1. The results then come back up: 1, then 1, then 2, then 6.

## The call stack

Each function call reserves space in memory (local variables, return address) on the **call stack**, a real stack in the sense of the earlier chapter. For `factorial(3)`, four calls are pending at the same time.

A recursion that is too deep (or endless) fills the stack and causes a **stack overflow**, which stops the program. The depth of the recursion therefore counts in the space complexity: `factorial(n)` uses O(n) of stack.

## When recursion costs too much

The Fibonacci sequence (0, 1, 1, 2, 3, 5, 8, …) is defined by F(n) = F(n − 1) + F(n − 2):

```c
unsigned long fib(unsigned int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);        /* two calls: be careful */
}
```

This version recomputes the same values a huge number of times: `fib(n)` calls `fib(n-1)` and `fib(n-2)`, which each call their two neighbors, and so on. The number of calls grows exponentially (roughly O(1.6ⁿ)): `fib(50)` needs tens of billions of calls. An iterative version does the same computation in O(n):

```c
unsigned long fib_iterative(unsigned int n) {
    unsigned long previous = 0, current = 1;
    for (unsigned int i = 0; i < n; i++) {
        unsigned long next = previous + current;
        previous = current;
        current = next;
    }
    return previous;
}
```

You can also keep the recursive version and **memoize** the results already computed: each value is then computed only once.

## Recursion or loop?

Every recursive function can be written with a loop, and the other way around. Choose recursion when it expresses the problem more clearly: tree traversal, merge sort (previous chapter), binary search written recursively. Choose a loop when the depth may be large or when the recursion recomputes the same things.

## Practice: tracing calls

Work these out, type the answer and press **Check**.

```exercise
What does `factorial(5)` return, with the function shown above?
--- answer
120
--- explain
5 × 4 × 3 × 2 × 1 = 120.
--- hint
Unfold the calls like the factorial(3) example.
```

```exercise
How many calls to `factorial` happen in total for `factorial(5)`, counting the first call and the one that hits the base case?
--- answer
6
--- explain
The calls are for 5, 4, 3, 2, 1 and 0: six calls.
--- hint
The recursion stops at n == 0.
```

## Key takeaways: recursion

- Base case + a call on a smaller problem.
- Each pending call uses stack space: too much depth means a stack overflow.
- Beware of recursions that split in two (naive Fibonacci): the cost becomes exponential.

```quiz
What happens if a recursive function has no base case?
- [ ] It returns 0
- [x] Calls pile up until the stack overflows
- [ ] The compiler refuses to compile it
> Without a base case the recursion never stops and the call stack fills up.
```

```quiz
Why is the naive recursive Fibonacci very slow?
- [ ] Because recursion is always slower than a loop
- [x] Because it recomputes the same values a very large number of times
- [ ] Because it uses numbers that are too large
> The number of calls grows exponentially; a loop or memoization gives O(n).
```
