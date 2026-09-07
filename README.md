# 📚 Digital Library — Online Document & Book Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Theme](https://img.shields.io/badge/Theme-Pure%20Bright%20White-blue?style=flat-square)](https://github.com/satetapongsa/Library)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--DB%20%7C%20Standalone-emerald?style=flat-square)](https://github.com/satetapongsa/Library)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

<p align="center">
  <img src="public/logo.svg" alt="Digital Library Logo" width="128" height="128" />
</p>

> A modern, high-performance, full-stack digital library and interactive document reader. Designed with an executive **100% Pure Bright White Theme**, instant search, embedded OpenGraph social card previews, client-side reading progress recall, and a **Zero-DB Standalone Architecture** that runs effortlessly out-of-the-box.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client Layer
        Browser["Modern Web Browser"]
        ReaderUI["Streaming PDF Reader (/read/:id)"]
        CatalogUI["Live Catalog & Filters (/library)"]
        DetailUI["Publication Details (/document/:id)"]
        LocalStorage["Browser LocalStorage (Bookmarks & Reading Progress)"]
    end

    subgraph Application Layer (Next.js 16 App Router)
        ServerComponents["React Server Components (SSR)"]
        OpenGraph["OpenGraph Card Engine (Dynamic 1200x630 Social Banner)"]
        API_Docs["/api/documents (Instant Query & Recommendations)"]
        API_Storage["/api/storage (HTTP 206 Byte-Range Streaming)"]
    end

    subgraph Service & Persistence Layer
        LibService["LibraryService (State Coordinator)"]
        MemCache["In-Memory Cache (Sub-millisecond SSR Reads)"]
        JSONStore["Local File Store (data/library-store.json)"]
        PDFStore["PDF Document Assets (public/uploads/documents)"]
    end

    Browser --> ReaderUI & CatalogUI & DetailUI
    ReaderUI <--> LocalStorage
    ReaderUI --> API_Storage
    CatalogUI --> ServerComponents
    ServerComponents & API_Docs --> LibService
    API_Storage --> PDFStore
    LibService --> MemCache
    MemCache <--> JSONStore
```

---

## ✨ Key Features & Highlights

### 1. 🖼️ Embedded Logo & Social Previews (OpenGraph & Twitter Card)
- **Vector Logo (`public/logo.svg`)**: Crisp, modern SVG brand icon representing an illuminated digital book.
- **Dynamic Social Card (`app/opengraph-image.tsx`)**: High-resolution 1200x630 preview card generated on-the-fly when sharing the website link on LINE, Facebook, Discord, X, or Telegram.
- **Automatic Favicon (`app/icon.svg`)**: Seamless tab icon and bookmark rendering across mobile and desktop browsers.

### 2. 📖 High-Performance Online PDF Reader (`/read/[id]`)
- **HTTP 206 Partial Content Streaming**: Handles multi-megabyte documents seamlessly without forcing client-side file downloads upfront.
- **Reading Progress Recall**: Automatically tracks the reader's last viewed page and restores scroll position upon return.
- **Interactive Top HUD**: Real-time page jumper (`Page X of Y`), dynamic zoom levels (`50%` - `200%`), fullscreen toggle (`F`), and pure bright reading surface.
- **Collapsible Visual Thumbnail Sidebar**: Multi-page thumbnail navigator for instant jumping between chapters and sections.
- **Client Bookmark Manager**: Instant bookmarking via toolbar button or `B` key, backed by local state persistence.
- **Accessible Keyboard Controls**:
  - `←` / `→` or `J` / `K`: Navigate previous/next page
  - `+` / `-`: Zoom in / Zoom out
  - `B`: Toggle bookmark for active page
  - `F`: Toggle full-screen reading mode
  - `Esc`: Exit reader back to document overview

### 3. 📂 12 Comprehensive Taxonomy Categories
Tailored for rich discovery across fiction, academia, technology, and entertainment:
1. **อนิเมะ & การ์ตูน (Anime & Manga)** — Light novels, visual arts, anime storytelling.
2. **นวนิยาย & วรรณกรรม (Novels & Literature)** — Modern fiction, classics, world literature.
3. **เรื่องผี & สยองขวัญ (Horror & Paranormal)** — Ghost tales, urban legends, supernatural mysteries.
4. **ตำนาน & เรื่องเล่าปรัมปรา (Mythology & Folklore)** — Folk stories, ancient mythology, world chronicles.
5. **วิทยาศาสตร์ & เทคโนโลยี (Science & Technology)** — Computer science, artificial intelligence, physics.
6. **การเรียน & ติวสอบ (Education & Academics)** — Textbooks, exam preparations, summaries.
7. **การทดลอง & สิ่งประดิษฐ์ (Experiments & Inventions)** — Science laboratory manuals, DIY engineering.
8. **ธุรกิจ & การลงทุน (Business & Finance)** — Startup playbooks, financial models, leadership.
9. **การพัฒนาตนเอง & จิตวิทยา (Self-Improvement & Psychology)** — Mindset, productivity, cognitive psychology.
10. **ประวัติศาสตร์ & โบราณคดี (History & Archaeology)** — Historical events, civilization studies.
11. **สุขภาพ & การแพทย์ (Health & Medicine)** — Wellness, nutrition, clinical overviews.
12. **ศิลปะ & ดนตรี (Art & Music)** — Graphic design, composition theory, creative arts.

### 4. ☀️ 100% Pure Bright White Theme
- **No Dark Mode**: Permanently locked to clean, crisp white backgrounds (`#ffffff`).
- **High-Contrast Typography**: Headings in solid Slate 900 (`#0f172a`) and body in Slate 700 (`#334155`), ensuring maximum readability without color bugs.
- **Minimalist Business Aesthetic**: Clean borders, subtle shadows, and vibrant blue accents.

### 5. ⚡ Zero-DB Standalone Persistence
- **No Database Setup Required**: Runs immediately after `git clone` without configuring PostgreSQL or Docker.
- **In-Memory Cache**: High-speed RAM caching for instant Server-Side Rendering (SSR).
- **Atomic JSON Store (`data/library-store.json`)**: Automatic disk persistence for documents and categories.

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/satetapongsa/Library.git
cd Library
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Specifications

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/documents` | Query documents with search, category, sort, and pagination | Public |
| `GET` | `/api/documents/:id` | Fetch document details and related recommendations | Public |
| `POST` | `/api/documents/:id/view` | Increment view telemetry counter | Public |
| `GET` | `/api/categories` | List all 12 categories with document counts | Public |
| `GET` | `/api/storage/stream/*` | HTTP 206 Byte-Range streaming for document reader | Public |
| `GET` | `/api/storage/download/*` | Download handler (respects `allowDownload` flag) | Public |
| `POST` | `/api/bookmarks` | Sync reader bookmarks | Public |

---

## 📂 Project Directory Structure

```text
digital-library/
├── app/
│   ├── layout.tsx                   # Global layout with Logo, SEO, and OpenGraph tags
│   ├── page.tsx                     # Landing page with hero, search, categories, featured books
│   ├── globals.css                  # Pure white styles & theme tokens
│   ├── icon.svg                     # Vector app icon & favicon
│   ├── opengraph-image.tsx          # Dynamic 1200x630 social card generator
│   ├── library/page.tsx             # Document catalog with filters & pagination
│   ├── document/[id]/page.tsx       # Document details & related items
│   ├── read/[id]/page.tsx           # Fullscreen online streaming PDF reader
│   └── api/                         # REST API Route Handlers
├── components/
│   ├── layout/                      # Header (with Logo), Footer
│   ├── library/                     # DocumentCard, SearchBar, DocumentActions
│   └── reader/                      # PdfReader, Thumbnails, Page navigation
├── data/
│   └── library-store.json           # Local persistent JSON database
├── lib/
│   ├── data/
│   │   ├── initialData.ts           # 12 Categories and 16 seed PDF books
│   │   └── libraryService.ts        # Zero-DB state management service
│   ├── pdf/                         # Magic-byte check, page counter, vector cover generator
│   └── storage/                     # Streaming storage engine
└── public/
    ├── logo.svg                     # High-resolution vector logo
    └── uploads/documents/           # Seeded PDF documents
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Developed with ❤️ by **[satetapongsa](https://github.com/satetapongsa)**.
