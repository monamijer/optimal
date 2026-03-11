# Optimal

![Angular](https://img.shields.io/badge/Angular-19-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

Optimal is a modern academic documentation platform designed to help students access, read, and navigate course materials with clarity and efficiency.

Inspired by high-quality documentation platforms such as MDN, Optimal aims to bring the same level of structure and readability to university courses.

Instead of fragmented notes or scattered files, Optimal provides a centralized, structured, and scalable documentation system for academic learning.

---

# ✨ Features

### 📚 Course Documentation
Courses are written in Markdown and rendered into a clean reading experience.

- Markdown based course system
- Automatic heading anchors
- Clean documentation layout

### 🧭 Intelligent Navigation

Optimal provides structured navigation to help students move through courses easily.

- Sidebar course navigation
- Breadcrumb navigation
- Dynamic table of contents

### 📑 Table of Contents + ScrollSpy

A dynamic table of contents is generated automatically from course headings.

- Highlights current section while reading
- Helps students track their reading progress

### 🌗 Dark Mode

Optimal supports modern accessibility standards.

- automatic system preference detection
- manual toggle
- Bootstrap theme integration

### ⚡ Modern Angular Architecture

The project uses the latest Angular features:

- Angular 19
- Standalone components
- Signals
- Modern control flow (`@if`, `@for`)
- Lazy loading

### 🚀 Performance First

Optimal prioritizes fast rendering and scalability.

- IntersectionObserver ScrollSpy
- Optimized markdown parsing
- Sanitized HTML rendering
- Signal-based state management

---

# 🏗️ Project Architecture

The application follows a **feature-based scalable architecture**.


src/
│
├── app/
│
├── core/
│ global services
│ ├── markdown.service.ts
│ ├── scrollspy.service.ts
│ ├── theme.service.ts
│
├── layout/
│ layout components
│ ├── header/
│ ├── sidebar/
│
├── shared/
│ reusable UI components
│
└── features/
└── courses/
├── models/
├── services/
├── pages/
└── components/


Course content lives in:


src/assets/courses/


---

# 📚 Writing Courses

Courses are written in Markdown files.

Example:


assets/courses/algorithms.md


Example Markdown:

```markdown
# Algorithms

## Introduction

Algorithms are fundamental to computer science.

## Complexity

We measure algorithm efficiency using complexity analysis.
```
Optimal automatically generates:

anchor links

table of contents

scroll navigation

🚀 Getting Started

Install dependencies:
```
npm install
```
Start development server:
```
ng serve
```
Open:
```
http://localhost:4200
```
🧪 Testing

Run unit tests:
```
ng test
```
🛠 Tech Stack

### Angular 19

### TypeScript

### Bootstrap

### Marked

### DOMPurify

## 🎯 Vision

Optimal aims to evolve into a flexible academic learning platform where:

students can study efficiently

professors can publish structured courses

documentation remains clear and maintainable

The long-term goal is to support:

advanced course search

versioned documentation

collaborative content editing

large-scale academic knowledge bases

🤝 Contributing

Contributions are welcome.

If you'd like to improve Optimal:

open an issue

suggest features

submit a pull request

Please read the CONTRIBUTING.md file before submitting changes.
