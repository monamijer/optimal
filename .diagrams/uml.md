
# 📐 Optimal — UML Architecture

This document describes the software architecture of **Optimal**, a modern academic documentation platform.

The goal is to provide a clear and scalable design before implementation.

---

# 1️⃣ Application Scope

**Optimal** is an academic documentation platform designed for students and professors.

### Core Features

- Course rendering (Markdown → HTML)
- Navigation (Sidebar, Table of Contents, Breadcrumbs)
- ScrollSpy (active section tracking)
- Search داخل course content
- Theme management (Dark / Light)
- User management (future extension)

---

# 2️⃣ Core Entities

| Entity                | Responsibility |
|----------------------|----------------|
| Course               | Represents a course with multiple sections |
| Section              | Represents a part of a course (Markdown content) |
| User (optional)      | Represents a student or professor |
| MarkdownService      | Parses Markdown into sanitized HTML |
| ScrollSpyService     | Tracks active section in viewport |
| ThemeService         | Handles dark/light mode |
| CourseService        | Loads course data from files |
| BreadcrumbService    | Builds navigation hierarchy |

---

# 3️⃣ Class Diagram

```mermaid
classDiagram

class Course {
  id: string
  title: string
  sections: Section[]
}

class Section {
  id: string
  title: string
  content: string
}

class CourseService {
  +loadCourse(id): Observable~Section[]~
}

class MarkdownService {
  +parse(md): string
  +getHeadings(html): Heading[]
}

class ScrollSpyService {
  +observe(ids)
  +activeId()
}

class ThemeService {
  +toggleTheme()
  +getTheme()
}

class BreadcrumbService {
  +getPath()
}

Course --> Section
CourseService --> Course
Section --> MarkdownService
ScrollSpyService --> Section
````

---

# 4️⃣ Component Architecture (Angular)

```mermaid
graph TD

AppComponent --> HeaderComponent
AppComponent --> SidebarComponent
AppComponent --> CourseDetailComponent

CourseDetailComponent --> SectionComponent
CourseDetailComponent --> TOC

SectionComponent --> MarkdownService
TOC --> ScrollSpyService

HeaderComponent --> ThemeService
SidebarComponent --> CourseService
```

---

# 5️⃣ Use Case Diagram

```mermaid
flowchart LR

Student --> ViewCourse
Student --> NavigateSections
Student --> SearchContent
Student --> ToggleTheme

Professor --> CreateCourse
Professor --> EditCourse
Professor --> PublishCourse
```

---

# 6️⃣ Activity Diagram (Course Loading Flow)

```mermaid
flowchart TD

A[User clicks course] --> B[Route changes]
B --> C[CourseService.loadCourse]
C --> D[HTTP request to /courses/...]
D --> E{File exists?}

E -->|No| F[Error 404]
E -->|Yes| G[Load Markdown]

G --> H[Parse sections]
H --> I[Update UI]

I --> J[Render content]
J --> K[Generate headings]
K --> L[ScrollSpy observe]
```

---

# 7️⃣ State Diagram (UI State)

```mermaid
stateDiagram-v2

[*] --> Loading
Loading --> Loaded : success
Loading --> Error : failed

Loaded --> ViewingCourse
ViewingCourse --> SwitchingCourse
SwitchingCourse --> Loading
```

---

# 8️⃣ Sequence Diagram

```mermaid
sequenceDiagram

User->>Router: click course
Router->>CourseService: request course
CourseService->>Server: GET /courses/{id}
Server-->>CourseService: markdown files
CourseService-->>Component: sections
Component->>MarkdownService: parse content
MarkdownService-->>Component: HTML
Component->>ScrollSpyService: observe headings
```

---

# 9️⃣ Communication Diagram

```mermaid
graph LR

User --> Router
Router --> CourseService
CourseService --> HTTP
HTTP --> MarkdownFiles
CourseService --> Component
Component --> MarkdownService
Component --> ScrollSpyService
```

---

# 🔟 Package Diagram

```mermaid
graph TD

core --> services
layout --> components
shared --> ui
features --> courses

courses --> models
courses --> services
courses --> pages
courses --> components
```

---

# 1️⃣1️⃣ Key Architectural Principles

* **Separation of concerns**
* **Reactive data flow**
* **Feature-based architecture**
* **Stateless components when possible**
* **Services handle business logic**

---

# 1️⃣2️⃣ Future Improvements

* Full-text search engine
* Versioned documentation
* Collaborative editing
* API backend integration
* Role-based access (student / professor)

---

# ✅ Conclusion

This UML design provides a scalable and maintainable foundation for Optimal.

It ensures:

* clean architecture
* predictable data flow
* high performance
* extensibility

---

```


