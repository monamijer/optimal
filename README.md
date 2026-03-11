
# 🎓 Optimal

 Transform academic course materials into a clean, structured and high-performance documentation platform.

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
````

Optimal automatically generates:

* anchor links
* dynamic table of contents
* scroll navigation between sections

---

## 🧭 Intelligent Navigation

Optimal helps students explore course material efficiently.

* **Dynamic Sidebar**
  structured navigation for course modules

* **Table of Contents + ScrollSpy**
  highlights the current section while reading

* **Breadcrumb Navigation**
  keeps users aware of their location in the documentation

---

## 🌗 Dark Mode

Accessibility and comfort matter.

Optimal supports:

* automatic system preference detection
* manual theme toggle
* Bootstrap theme integration

---

## ⚡ Modern Angular Architecture

Optimal is built using the latest Angular ecosystem.

* Angular 19
* Signals
* Standalone components
* Modern control flow (`@if`, `@for`)
* Lazy loaded features

This ensures excellent performance and maintainability.

---

# 🏗 Project Architecture

Optimal follows a **feature-based scalable architecture**.

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

Course content is stored as Markdown files:

```
src/assets/courses/
```

---

# 🚀 Getting Started

### 1️⃣ Clone the repository

```
git clone https://github.com/monamijer/optimal.git
```

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Start development server

```
ng serve
```

Open your browser at:

```
http://localhost:4200
```

---

# 🧪 Testing

Run unit tests:

```
ng test
```

---

# 🛠 Tech Stack

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Angular 19 | Frontend Framework        |
| TypeScript | Type-safe development     |
| Signals    | Reactive state management |
| Marked     | Markdown parsing          |
| DOMPurify  | HTML sanitization         |
| Bootstrap  | UI framework              |

---

# 🎯 Vision

Optimal aims to evolve into a flexible academic knowledge platform where:

* students can study efficiently
* professors can publish structured course documentation
* academic knowledge remains searchable and maintainable

Future goals include:

* advanced full-text search
* collaborative content editing
* versioned documentation
* large academic knowledge bases

---

# 🤝 Contributing

Contributions are welcome and appreciated.

To contribute:

1. Fork the repository
2. Create a new branch

```
git checkout -b feature/amazing-feature
```

3. Commit your changes

```
git commit -m "Add amazing feature"
```

4. Push your branch

```
git push origin feature/amazing-feature
```

5. Open a Pull Request

Please read **CONTRIBUTING.md** before submitting changes.

---

# 📄 License

This project is licensed under the **MIT License**.

