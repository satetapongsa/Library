# 📚 Digital Library — Enterprise Online Document & Book Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--DB%20%7C%20Hybrid%20Storage-emerald?style=flat-square)](https://github.com/satetapongsa/Library)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

> A modern, high-performance, full-stack digital library and interactive document reader. Designed with an executive **Clean White Business Theme**, instant search, client-side reading state recall, and a **Zero-DB Standalone Architecture** that runs effortlessly out-of-the-box.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client Layer
        Browser["Modern Web Browser"]
        ReaderUI["Streaming PDF Reader (/read/:id)"]
        CatalogUI["Live Catalog & Filters (/library)"]
        AdminUI["Admin Studio & Analytics (/admin)"]
        LocalStorage["Browser LocalStorage (Bookmarks & Progress)"]
    end

    subgraph Application Layer (Next.js 16 App Router)
        ServerComponents["React Server Components (SSR)"]
        API_Docs["/api/documents (CRUD & Views)"]
        API_Storage["/api/storage (HTTP 206 Streaming)"]
        API_Auth["/api/auth (Stateless JWT Sessions)"]
        API_Upload["/api/upload (PDF Processing Pipeline)"]
    end

    subgraph Service & Persistence Layer
        LibService["LibraryService (Universal State Coordinator)"]
        MemCache["In-Memory Cache (Sub-millisecond SSR Reads)"]
        JSONStore["Local File Store (data/library-store.json)"]
        PDFProc["pdf-lib Pipeline (Metadata & Vector Cover Engine)"]
        StorageEngine["Abstract Storage Provider (Local Disk / S3 / R2)"]
    end

    Browser --> ReaderUI & CatalogUI & AdminUI
    ReaderUI <--> LocalStorage
    ReaderUI --> API_Storage
    CatalogUI --> ServerComponents
    AdminUI --> API_Upload & API_Docs

    ServerComponents & API_Docs & API_Upload --> LibService
    API_Storage --> StorageEngine
    API_Upload --> PDFProc

    LibService --> MemCache
    MemCache <--> JSONStore
```

---

## ✨ Key Features & Engineering Highlights

### 1. 📖 High-Performance Online PDF Reader (`/read/[id]`)
- **HTTP 206 Partial Content Streaming**: Handles multi-megabyte documents seamlessly without forcing client-side file downloads upfront.
- **Reading Progress Recall**: Automatically tracks the reader's last viewed page and restores scroll position upon return.
- **Interactive Top HUD**: Real-time page jumper (`Page X of Y`), dynamic zoom levels (`50%` - `200%`, `Fit Width`, `Fit Page`), fullscreen toggle (`F`), and visual theme contrast modes.
- **Collapsible Visual Thumbnail Sidebar**: Multi-page thumbnail navigator for instant jumping between chapters and sections.
- **Client Bookmark Manager**: Instant bookmarking via toolbar button or `B` key, backed by local state persistence.
- **Accessible Keyboard Controls**:
  - `←` / `→` or `J` / `K`: Navigate previous/next page
  - `+` / `-`: Zoom in / Zoom out
  - `0`: Reset zoom to default
  - `F`: Toggle full-screen reading mode
  - `B`: Toggle bookmark for active page
  - `Esc`: Exit reader back to document overview

### 2. 📂 12 Comprehensive Taxonomy Categories
Tailored for rich discovery across fiction, academia, technology, and entertainment:
1. **อนิเมะ & การ์ตูน (Anime & Manga)** — Light novels, visual arts, anime lore.
2. **นวนิยาย & วรรณกรรม (Novels & Literature)** — Modern fiction, classics, world literature.
3. **เรื่องผี & สยองขวัญ (Horror & Paranormal)** — Ghost tales, urban legends, supernatural thrillers.
4. **ตำนาน & เรื่องเล่าปรัมปรา (Mythology & Folklore)** — Folk stories, mythology, ancient chronicles.
5. **วิทยาศาสตร์ & เทคโนโลยี (Science & Technology)** — Computer science, artificial intelligence, physics.
6. **การเรียน & ติวสอบ (Education & Academics)** — Textbooks, exam preparations, summaries.
7. **การทดลอง & สิ่งประดิษฐ์ (Experiments & Inventions)** — Science laboratory manuals, DIY engineering.
8. **ธุรกิจ & การลงทุน (Business & Finance)** — Startup playbooks, financial models, economics.
9. **การพัฒนาตนเอง & จิตวิทยา (Self-Improvement & Psychology)** — Mindset, productivity, cognitive psychology.
10. **ประวัติศาสตร์ & โบราณคดี (History & Archaeology)** — Historical events, civilization studies.
11. **สุขภาพ & การแพทย์ (Health & Medicine)** — Wellness, nutrition, clinical overviews.
12. **ศิลปะ & ดนตรี (Art & Music)** — Graphic design, composition theory, photography.

### 3. 💼 Enterprise Clean White Business Aesthetic
- **Visual Hierarchy**: Crisp modern typography utilizing **Geist** and sleek system fonts.
- **Subtle Palettes**: Tailored slate neutrals with refined indigo accents, eliminating visual clutter.
- **High Readability**: High-contrast document previews and cards with micro-animations.
- **Theme Versatility**: Clean enterprise white by default with dark mode toggle.

### 4. ⚡ Zero-DB Standalone Persistence
- **No External Database Required**: Eliminates the overhead of configuring PostgreSQL/Docker for local testing or portable deployments.
- **Two-Tier State Sync**:
  1. **In-Memory Cache**: High-speed RAM caching for ultra-fast Server-Side Rendering (SSR).
  2. **Atomic JSON Store (`data/library-store.json`)**: Automatic disk writes whenever documents or categories are added, updated, or deleted.
  3. **Browser LocalStorage**: Instant offline bookmarking and client reading progress state.
- **Future-Proof**: Built on the Repository pattern (`LibraryService`), allowing a seamless swap back to PostgreSQL/Prisma or MongoDB with zero changes to presentation components.

### 5. 🛡️ Admin Studio & PDF Ingestion Engine (`/admin`)
- **Drag-and-Drop Ingestion**: Upload PDF files up to 100MB with real-time progress feedback (`Uploading` → `Processing` → `Ready`).
- **Binary Security Check**: Validates file magic bytes (`%PDF-`) and MIME headers before storage.
- **Automated Metadata Extraction**: Extracts page counts, title, author, and dimensions automatically via `pdf-lib`.
- **Dynamic Vector Cover Generator**: Generates SVG covers dynamically if no custom cover thumbnail is provided.
- **Repository Management**: Searchable, filterable data table with quick edit, publish toggle, and deletion capabilities.

---

## 🚀 Quick Start (Instant Boot)

No database installation, migrations, or cloud credentials required. The project includes 16 seeded books across all 12 categories.

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

## 🔑 Default Credentials

To access the Admin Portal (`/admin`):

| Parameter | Value |
|---|---|
| **Login URL** | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) |
| **Email** | `admin@digitallibrary.local` |
| **Password** | `admin123` |
| **Role** | `ADMIN` (Full Management Privileges) |

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 16.3.4](https://nextjs.org/) | App Router, Server Components, Route Handlers |
| **UI Library** | [React 19](https://react.dev/) | Concurrent rendering, Hooks, Modern Transitions |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict type checking, robust interface contracts |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first CSS design tokens |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible SVG iconography |
| **Authentication** | [Jose](https://github.com/panva/jose) | Stateless HTTP-only JWT session cookies |
| **Validation** | [Zod](https://zod.dev/) | Runtime request schema validation |
| **Document Processing** | [pdf-lib](https://pdf-lib.js.org/) | Native binary PDF parsing, page count, and cover rendering |
| **Persistence** | Zero-DB + LocalStore | Fast In-Memory cache + atomic file sync (`data/library-store.json`) |

---

## 📡 REST API Specifications

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/documents` | Query documents with search, category, sort, and pagination | Public |
| `GET` | `/api/documents/:id` | Fetch document details and related recommendations | Public |
| `POST` | `/api/documents/:id/view` | Increment view telemetry counter | Public |
| `PATCH` | `/api/documents/:id` | Update document metadata, publish state, tags | Admin |
| `DELETE` | `/api/documents/:id` | Remove document and clean up disk/cloud storage | Admin |
| `GET` | `/api/categories` | List all 12 categories with document counts | Public |
| `POST` | `/api/upload` | Multipart upload for PDF files and custom covers | Admin |
| `GET` | `/api/storage/stream/*` | HTTP 206 Byte-Range streaming for document reader | Public |
| `GET` | `/api/storage/download/*` | Secure download handler (respects `allowDownload` flag) | Public |
| `POST` | `/api/auth/login` | Authenticate administrator and set HTTP-only cookie | Public |
| `POST` | `/api/auth/logout` | Clear active session | Public |

---

## 📂 Project Directory Structure

```text
digital-library/
├── app/
│   ├── layout.tsx                   # Global layout with SEO tags and theme provider
│   ├── page.tsx                     # Landing page with hero, search, categories, featured books
│   ├── globals.css                  # Tailwind styles & theme variables
│   ├── library/page.tsx             # Document catalog with filters & pagination
│   ├── document/[id]/page.tsx       # Document details, metadata & related items
│   ├── read/[id]/page.tsx           # Standalone high-performance PDF reader
│   ├── admin/
│   │   ├── page.tsx                 # Telemetry metrics, storage usage, activity charts
│   │   ├── login/page.tsx           # Clean admin login portal
│   │   ├── upload/page.tsx          # Drag-and-drop document upload studio
│   │   ├── documents/page.tsx       # Document management table with edit modal
│   │   ├── categories/page.tsx      # Taxonomy management
│   │   └── analytics/page.tsx       # Detailed reading engagement analytics
│   └── api/                         # Comprehensive Next.js Route Handlers
├── components/
│   ├── layout/                      # Header, Footer, Navigation
│   ├── library/                     # DocumentCard, SearchBar, DocumentActions
│   └── reader/                      # PdfReader, Thumbnails, ReaderHUD, Shortcuts
├── data/
│   └── library-store.json           # Local persistent JSON state database
├── lib/
│   ├── auth/                        # JWT signing and session management
│   ├── data/
│   │   ├── initialData.ts           # 12 Categories and 16 seed PDF books
│   │   └── libraryService.ts        # Zero-DB state management service
│   ├── pdf/                         # Magic-byte check, page counter, SVG cover generator
│   ├── storage/                     # Pluggable Local/S3 storage drivers
│   └── validation/                  # Zod validation schemas
└── public/
    └── uploads/                     # Uploaded documents and generated covers
```

---

## 📦 Production Build

To compile a production-optimized build:

```bash
npm run build
npm run start
```

The application runs at [http://localhost:3000](http://localhost:3000) with Turbopack optimizations and prerendered static routes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Developed with ❤️ by **[satetapongsa](https://github.com/satetapongsa)**.
