# 🎓 Optimal

> Transform academic course materials into a clean, structured and high-performance documentation platform.

![Angular](https://img.shields.io/badge/Angular-19-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

Optimal is a modern academic documentation platform designed to help students easily access, read and navigate university course materials.

Inspired by the clarity and structure of MDN Web Docs, Optimal replaces scattered PDFs and notes with a centralized documentation system built for learning.

---

# ✨ Why Optimal?

Traditional academic materials often suffer from:

- fragmented PDF documents
- poor navigation
- outdated formats
- lack of structure

Optimal solves this by providing a **documentation-first learning experience**.

### 👨‍🎓 Student Focus

- intuitive navigation
- readable course pages
- dynamic table of contents
- scroll-aware navigation

### 👩‍🏫 Professor Focus

- simple course writing with Markdown
- structured content organization
- scalable course architecture

### ⚡ Performance Focus

- Angular 19 modern architecture
- optimized Markdown rendering
- IntersectionObserver-based ScrollSpy

---

# 🔥 Core Features

## 📖 Premium Markdown Rendering

Courses are written using Markdown and transformed into clean documentation pages.

Example:

```markdown
# Algorithms

## Introduction
Algorithms are fundamental to computer science.

## Complexity
We measure algorithm efficiency using complexity analysis.
```
Optimal automatically generates:

anchor links

dynamic table of contents.
```
src/
│
├── app/
│
├── core/
│   global services
│   ├── markdown.service.ts
│   ├── scrollspy.service.ts
│   ├── theme.service.ts
│
├── layout/
│   application layout
│   ├── header/
│   ├── sidebar/
│
├── shared/
│   reusable UI components
│
└── features/
    └── courses/
        ├── models/
        ├── services/
        ├── pages/
        └── components/
```
