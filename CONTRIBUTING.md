

# 🤝 Contributing to Optimal

Thank you for your interest in contributing to **Optimal**.

Optimal aims to provide a modern documentation platform for academic courses. Contributions that improve usability, performance, documentation, or developer experience are always welcome.

---

# 🚀 Getting Started

### 1. Fork the repository

Click the **Fork** button at the top-right of the repository.

### 2. Clone your fork

```bash
git clone https://github.com/monamijer/optimal.git
````

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
ng serve
```

Open your browser at:

```
http://localhost:4200
```

---

# 🧱 Project Structure

Optimal follows a **feature-based architecture**:

```
src/app/
│
├── core/       global services
├── layout/     layout components
├── shared/     reusable UI components
└── features/   application features
```

Example:

```
features/
  courses/
    models/
    services/
    pages/
    components/
```

---

# 🧑‍💻 Development Guidelines

Please follow these principles when contributing:

### Code Quality

* Write clear and maintainable code
* Follow Angular best practices
* Prefer modern Angular features (signals, standalone components)

### Structure

* Keep the feature-based architecture
* Avoid placing business logic in components
* Prefer services for reusable logic

### Styling

* Use Bootstrap utilities when possible
* Keep styles simple and consistent

---

# 🧪 Testing

Before submitting changes, ensure the project builds successfully.

Run tests with:

```bash
ng test
```

---

# 🔀 Pull Request Process

1. Create a new branch

```bash
git checkout -b feature/your-feature
```

2. Make your changes

3. Commit with a clear message

```bash
git commit -m "Add feature: description"
```

4. Push your branch

```bash
git push origin feature/your-feature
```

5. Open a **Pull Request**

Please describe clearly what your changes do.

---

# 💡 Types of Contributions

We welcome contributions such as:

* new features
* UI improvements
* documentation improvements
* bug fixes
* performance optimizations

---

# 📬 Reporting Issues

If you find a bug or want to request a feature, please open an **Issue**.

When reporting a bug, include:

* a clear description
* steps to reproduce
* screenshots if possible

---

# ❤️ Code of Conduct

Please be respectful and constructive when interacting with others.

Our goal is to build a welcoming and collaborative open-source community.

---

Thank you for helping improve **Optimal**.
