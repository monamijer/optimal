# Introduction to algorithms

> Objectives: say what an algorithm is, why we compare them, and how this course is organized.

## What is an algorithm?

An algorithm is a precise sequence of steps that turns input data into an output. A cooking recipe is one: the ingredients are the input, the dish is the output, and every step is unambiguous.

Algorithms are at the heart of computing. Sorting your contacts, finding the shortest route on a map, compressing a photo or checking a password all rely on algorithms.

A good algorithm is:

- **correct**: it gives the right result for every expected input;
- **finite**: it always stops;
- **efficient**: it uses a reasonable amount of time and memory.

## A first example: finding the largest number

The problem: find the largest element of an array of integers. The idea fits in three sentences. Keep the first element as the "best candidate", look at the others one by one, and whenever one is larger, it becomes the new candidate.

```c
int find_max(const int values[], int count) {
    int best = values[0];
    for (int i = 1; i < count; i++) {
        if (values[i] > best) {
            best = values[i];
        }
    }
    return best;
}
```

Each element is read exactly once. With 10 elements we make 9 comparisons; with 1,000,000 elements we make 999,999. The work grows in proportion to the size of the data. This is the starting point of the notion of complexity, covered in the next chapter.

## Why algorithms matter

They let us solve problems efficiently. On small inputs almost every algorithm is fast enough. On large inputs, the difference between two methods can be the difference between one second and several days.

Choosing the right **data structure** (how information is stored) matters as much as choosing the right algorithm. The same problem can be easy or painful depending on how the data is organized.

## How this course is organized

1. **Complexity**, to compare algorithms.
2. **Data structures**: arrays, linked lists, stacks and queues.
3. **Classic algorithms**: searching, sorting and recursion.

Each chapter ends with key takeaways and a quiz. Examples are written in C. If you know variables, loops and functions, you have the background you need.

## Key takeaways: introduction

- An algorithm turns an input into an output through precise steps.
- We judge an algorithm on correctness, termination and efficiency.
- The data structure you choose directly affects efficiency.

```quiz
Which of these is NOT a quality expected from an algorithm?
- [ ] It is correct
- [ ] It terminates
- [x] It is written in C
- [ ] It is reasonably efficient
> An algorithm is independent of the language: it can be written in C, Python or plain English.
```
