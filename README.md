# Optimal

![Angular](https://img.shields.io/badge/Angular-19-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

**Optimal** is a modern academic documentation platform designed to help students **access, read, and navigate course materials efficiently**.

Inspired by documentation platforms like MDN Web Docs, Optimal brings the same **clarity, structure, and usability** to university course materials.

Instead of scattered PDFs and fragmented notes, Optimal provides a **centralized, structured, and scalable documentation system** for academic learning.

---

# ✨ Features

## 📚 Course Documentation

Courses are written in **Markdown** and rendered into a clean, readable interface.

- Markdown-based course system
- Automatic heading anchors
- Clean documentation layout
- Structured academic content

---

## 🧭 Intelligent Navigation

Optimal provides structured navigation so students can move through courses easily.

- Sidebar course navigation
- Breadcrumb navigation
- Dynamic Table of Contents
- Smooth section navigation

---

## 📑 Dynamic Table of Contents + ScrollSpy

A dynamic **Table of Contents** is automatically generated from Markdown headings.

Features include:

- Highlights the current section while reading
- Tracks reading progress
- Improves navigation in long documents

Powered by **IntersectionObserver** for better performance.

---

## 🌗 Dark Mode

Optimal supports modern accessibility and user preferences.

- Automatic system preference detection
- Manual theme toggle
- Bootstrap theme integration

---

## ⚡ Modern Angular Architecture

Optimal is built using the latest Angular features.

- Angular 19
- Standalone Components
- Signals
- Modern control flow (`@if`, `@for`)
- Lazy Loading

---

## 🚀 Performance First

Optimal prioritizes speed, efficiency, and scalability.

- IntersectionObserver ScrollSpy
- Optimized Markdown parsing
- Sanitized HTML rendering
- Signal-based state management

---

# 🏗️ Project Architecture

The application follows a **feature-based scalable architecture**.
src/

├── app/
├── core/
│ Global services
│ ├── markdown.service.ts
│ ├── scrollspy.service.ts
│ └── theme.service.ts
├── layout/
│ Layout components
│ ├── header/
│ └── sidebar/
├── shared/
│ Reusable UI components
└── features/
└── courses/
├── models/
├── services/
├── pages/
└── components

Course content is stored in:


src/assets/courses/


---

# 📚 Writing Courses

Courses are written using **Markdown files**.

Example file:


assets/courses/algorithms.md


Example Markdown content:

```Markdwon
# Algorithms

## Introduction

Algorithms are fundamental to computer science.

## Complexity

We measure algorithm efficiency using complexity analysis.
```
Optimal automatically generates:

Anchor links

Table of Contents

Scroll navigation

Section highlighting

🚀 Getting Started

Install dependencies:

npm install

Start the development server:

ng serve

Open your browser at:

http://localhost:4200

🧪 Testing

Run unit tests:

ng test
🛠 Tech Stack

Angular 19

TypeScript

Bootstrap

Marked

DOMPurify

🎯 Vision

Optimal aims to evolve into a flexible academic learning platform where:

Students can study efficiently

Professors can publish structured courses

Documentation remains clear and maintainable

Future goals include:

Advanced course search

Versioned documentation

Collaborative content editing

Large-scale academic knowledge bases

🤝 Contributing

Contributions are welcome.

If you'd like to improve Optimal:

Open an issue

Suggest a feature

Submit a pull request

Please read the CONTRIBUTING.md file before submitting changes.


