# Estate Archive — CMS Manager (Visual Page Builder) Guide

> অন্য প্রজেক্টে implement করার জন্য সম্পূর্ণ architecture, data model, API, frontend flow ও diagram।

---

## ১. সংক্ষিপ্ত সারাংশ

CMS Manager হলো একটি **Visual Page Builder** যেখানে admin:

- Website page-এর **preview** দেখে
- Section / Block **add, edit, delete, hide, reorder** করে
- **Reset** দিয়ে default design ফেরায়
- Save করলেই **live public site** আপডেট হয়

মূল মডেল: **Page → Section → Block**

```mermaid
flowchart TB
  subgraph Admin["Admin Portal"]
    CMS["/portal/admin/cms<br/>VisualCmsEditor"]
  end

  subgraph API["Laravel API"]
    PublicAPI["GET /api/cms/pages/{slug}"]
    AdminAPI["/api/admin/cms/*"]
    Service["CmsPageLayoutService<br/>(default layouts)"]
  end

  subgraph DB["MySQL"]
    Pages["cms_pages"]
    Sections["cms_sections"]
    Blocks["cms_blocks"]
  end

  subgraph Public["Public Website"]
    Driven["CmsDrivenPage(slug)"]
    Renderer["CmsSectionRenderer<br/>(type → UI)"]
  end

  CMS --> AdminAPI
  AdminAPI --> Pages
  Pages --> Sections --> Blocks
  Service --> Pages
  Driven --> PublicAPI
  PublicAPI --> Pages
  Driven --> Renderer
```

---

## ২. Data Model (৩-লেয়ার)

```mermaid
erDiagram
  CMS_PAGES ||--o{ CMS_SECTIONS : has
  CMS_SECTIONS ||--o{ CMS_BLOCKS : has

  CMS_PAGES {
    bigint id PK
    string slug UK
    string title
    string path
    int sort_order
    boolean is_published
  }

  CMS_SECTIONS {
    bigint id PK
    bigint page_id FK
    string slug
    string title
    string type
    int sort_order
    boolean is_visible
    json settings
  }

  CMS_BLOCKS {
    bigint id PK
    bigint section_id FK
    string type
    string label
    json content
    int sort_order
    boolean is_visible
  }
```

### টেবিল বিবরণ

| Table | কাজ |
|-------|-----|
| `cms_pages` | Home / Explore / How It Works — page-level meta |
| `cms_sections` | Hero, Steps, Footer ইত্যাদি — `type` দিয়ে UI নির্ধারণ |
| `cms_blocks` | Heading, text, button, image — আসল content JSON-এ |

**Cascade:** Page delete → sections delete → blocks delete।

**Migration:** `backend/database/migrations/2024_01_01_000009_create_cms_page_layout_tables.php`

---

## ৩. Architecture Overview

```mermaid
flowchart LR
  subgraph Frontend
    A1[CmsManager.tsx]
    A2[VisualCmsEditor]
    A3[DraggableRow]
    A4[pageLayoutApi.ts]
    A5[CmsDrivenPage]
    A6[CmsSectionRenderer]
  end

  subgraph Backend
    B1[PageLayoutController]
    B2[CmsPageLayoutService]
    B3[CmsMediaController]
    B4[EnsureAdmin]
  end

  A1 --> A2
  A2 --> A3
  A2 --> A4
  A4 --> B1
  A4 --> B3
  B1 --> B2
  B1 --> B4
  A5 --> A4
  A5 --> A6
```

---

## ৪. File Map (কপি করার ফাইল)

### Backend

```
backend/
├── database/migrations/2024_01_01_000009_create_cms_page_layout_tables.php
├── app/Models/CmsPage.php
├── app/Models/CmsSection.php
├── app/Models/CmsBlock.php
├── app/Http/Controllers/PageLayoutController.php
├── app/Http/Controllers/CmsMediaController.php
├── app/Services/CmsPageLayoutService.php
├── app/Http/Middleware/EnsureAdmin.php
├── database/seeders/CmsPageLayoutSeeder.php
└── routes/api.php
```

### Frontend

```
src/
├── pages/admin/CmsManager.tsx
├── services/pageLayoutApi.ts
├── components/cms/
│   ├── CmsDrivenPage.tsx
│   ├── CmsSectionRenderer.tsx
│   └── editor/
│       ├── VisualCmsEditor.tsx
│       └── DraggableRow.tsx
└── app/routes.tsx   → /portal/admin/cms
```

---

## ৫. API Endpoints

### Public (no auth)

| Method | Endpoint | কাজ |
|--------|----------|-----|
| `GET` | `/api/cms/pages` | সব published pages |
| `GET` | `/api/cms/pages/{slug}` | একটা page (visible sections/blocks only) |

### Admin (`auth:sanctum` + `admin` role)

| Method | Endpoint | কাজ |
|--------|----------|-----|
| `GET` | `/api/admin/cms/pages/layout` | Editor-এর জন্য full layout |
| `POST` | `/api/admin/cms/pages` | নতুন page |
| `PATCH` | `/api/admin/cms/pages/{id}` | Page update |
| `DELETE` | `/api/admin/cms/pages/{id}` | Page delete |
| `POST` | `/api/admin/cms/pages/{id}/reset` | এক page default-এ |
| `POST` | `/api/admin/cms/pages/reset-all` | সব default-এ |
| `POST` | `/api/admin/cms/sections` | Section add |
| `PATCH` | `/api/admin/cms/sections/{id}` | Title / type / visibility |
| `DELETE` | `/api/admin/cms/sections/{id}` | Section delete |
| `POST` | `/api/admin/cms/blocks` | Block add |
| `PATCH` | `/api/admin/cms/blocks/{id}` | Content / label / visibility |
| `DELETE` | `/api/admin/cms/blocks/{id}` | Block delete |
| `POST` | `/api/admin/cms/reorder` | Drag-drop sort_order |
| `POST` | `/api/admin/cms/media` | Image upload |

### Auth flow

```mermaid
sequenceDiagram
  participant Admin as Admin Browser
  participant API as Laravel API
  participant DB as Database

  Admin->>API: POST /api/login (email, password)
  API->>DB: Verify user.role = admin
  API-->>Admin: Bearer token + user
  Admin->>API: GET /api/admin/cms/pages/layout<br/>Authorization: Bearer …
  API->>API: auth:sanctum + EnsureAdmin
  API->>DB: Load pages → sections → blocks
  API-->>Admin: Full layout JSON (camelCase)
```

---

## ৬. TypeScript Types

```ts
interface CmsBlockContent {
  text?: string;
  title?: string;
  description?: string;
  desc?: string;
  detail?: string;
  num?: string;
  url?: string;
  cta?: string;
  eyebrow?: string;
  variant?: string;
  cmsKey?: string;
  highlight?: string;
  imageUrl?: string;
  alt?: string;
  [key: string]: string | undefined;
}

interface CmsBlock {
  id: string;
  sectionId: string;
  type: string;       // heading | text | button | card | step | image | eyebrow
  label: string;
  content: CmsBlockContent;
  sortOrder: number;
  isVisible: boolean;
}

interface CmsSection {
  id: string;
  pageId: string;
  slug: string;
  title: string;
  type: string;       // hero | steps | footer | …
  sortOrder: number;
  isVisible: boolean;
  settings: Record<string, unknown>;
  blocks: CmsBlock[];
}

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  path: string;
  sortOrder: number;
  isPublished: boolean;
  sections: CmsSection[];
}
```

---

## ৭. Section Type → React Renderer Map

`CmsSectionRenderer.tsx`-এর switch:

| `section.type` | Component | বর্ণনা |
|----------------|-----------|--------|
| `hero` | `HeroSection` | Headline, tagline, CTA, hero image |
| `choose_path` | `ChooseYourPath` | Investors / Landowners cards |
| `steps` | `StepsSection` | Process step cards |
| `project_grid` | `ProjectGridSection` | Live projects grid |
| `cost_estimator` | `CostEstimator` | Cost calculator widget |
| `page_header` | `PageHeaderSection` | Page title + image |
| `trust_pillars` | `TrustPillarsSection` | Trust cards |
| `cta_banner` | `CtaBannerSection` | Dark CTA strip |
| `footer` | `PublicFooter` | Site footer |
| `quick_links` | `QuickLinksSection` | Link cards |

```mermaid
flowchart TB
  S[CmsSection.type] --> SW{switch}
  SW -->|hero| H[HeroSection]
  SW -->|choose_path| C[ChooseYourPath]
  SW -->|steps| ST[StepsSection]
  SW -->|project_grid| P[ProjectGridSection]
  SW -->|cost_estimator| CE[CostEstimator]
  SW -->|page_header| PH[PageHeaderSection]
  SW -->|trust_pillars| T[TrustPillarsSection]
  SW -->|cta_banner| CTA[CtaBannerSection]
  SW -->|footer| F[PublicFooter]
  SW -->|quick_links| Q[QuickLinksSection]
  SW -->|unknown| N[null]
```

**নতুন section যোগ করতে:**

1. Backend default / DB-তে `type` save করুন  
2. `CmsSectionRenderer` switch-এ নতুন case  
3. `VisualCmsEditor` → `SECTION_TYPES` list-এ যোগ  

---

## ৮. Admin UI Layout

```mermaid
flowchart TB
  subgraph Editor["VisualCmsEditor"]
    Top["Header: Reset Page | Reset All | Live Page"]
    Tabs["Page Tabs: Home | Explore | How It Works"]
    subgraph Body
      Preview["Left: Live Preview<br/>CmsPageView preview=true"]
      Panel["Right: Properties Panel<br/>Sections list + Blocks + Edit form"]
    end
  end

  Top --> Tabs --> Body
  Preview <-->|click select| Panel
```

### Properties Panel actions

| Action | API |
|--------|-----|
| Add Section | `POST /admin/cms/sections` |
| Delete Section | `DELETE /admin/cms/sections/{id}` |
| Toggle visibility | `PATCH … { is_visible }` |
| Drag reorder | `POST /admin/cms/reorder` |
| Add / Edit / Delete Block | blocks CRUD |
| Save Block content | `PATCH /admin/cms/blocks/{id}` |
| Upload image | `POST /admin/cms/media` |
| Reset Page | `POST /admin/cms/pages/{id}/reset` |

---

## ৯. Data Flows

### 9.1 Edit → Save → Live site

```mermaid
sequenceDiagram
  participant U as Admin
  participant E as VisualCmsEditor
  participant API as PageLayoutController
  participant DB as DB
  participant P as Public CmsDrivenPage

  U->>E: Edit block text
  U->>E: Click Save Block
  E->>API: PATCH /admin/cms/blocks/{id}
  API->>DB: Update content JSON
  API-->>E: Updated block
  E->>E: Invalidate React Query caches
  P->>API: GET /cms/pages/home
  API->>DB: Published + visible only
  API-->>P: Layout JSON
  P->>P: CmsSectionRenderer render
```

### 9.2 Drag & Drop reorder

```mermaid
sequenceDiagram
  participant U as Admin
  participant E as VisualCmsEditor
  participant API as API

  U->>E: Drag section/block
  E->>E: Optimistic local reorder (sortOrder)
  U->>E: Drop (drag end)
  E->>API: POST /admin/cms/reorder<br/>{ sections: [{id, sort_order}] }
  API-->>E: Order updated
```

### 9.3 Reset to default

```mermaid
sequenceDiagram
  participant U as Admin
  participant E as VisualCmsEditor
  participant API as PageLayoutController
  participant S as CmsPageLayoutService
  participant DB as DB

  U->>E: Reset Page
  E->>API: POST /admin/cms/pages/{id}/reset
  API->>S: resetPageById(id)
  S->>DB: DELETE all sections (cascade blocks)
  S->>DB: Recreate from getDefaultPages()
  S->>DB: Sync cmsKey → dynamic_cms_settings
  S-->>API: Fresh page tree
  API-->>E: Default layout restored
```

---

## ১০. Default Layout (Home)

Default design **PHP code**-এ থাকে: `CmsPageLayoutService::getDefaultPages()` — DB seed file নয়।

### Home page sections (default)

```mermaid
flowchart TB
  Home[home /] --> H[1. hero]
  Home --> CP[2. choose_path]
  Home --> ST[3. steps]
  Home --> PG[4. project_grid]
  Home --> CE[5. cost_estimator]
  Home --> F[6. footer]
```

| Order | Section type | Title |
|-------|--------------|-------|
| 0 | `hero` | Hero |
| 1 | `choose_path` | Choose Your Path |
| 2 | `steps` | Process Steps |
| 3 | `project_grid` | Active Ventures |
| 4 | `cost_estimator` | Cost Estimator |
| 5 | `footer` | Footer |

### অন্য pages

| Slug | Path | Sections |
|------|------|----------|
| `explore` | `/explore` | page_header, project_grid, cost_estimator, footer |
| `how-it-works` | `/how-it-works` | page_header, steps, choose_path, trust_pillars, cta_banner, footer |

**Seed:**

```bash
php artisan db:seed --class=CmsPageLayoutSeeder
php artisan storage:link
```

---

## ১১. Public Page Consumption

```tsx
// src/pages/Landing.tsx
export default function Landing() {
  return <CmsDrivenPage slug="home" fallback={<LandingFallback />} />;
}
```

```mermaid
flowchart TD
  Start[CmsDrivenPage slug=home] --> Fetch[GET /api/cms/pages/home]
  Fetch -->|loading| Spin[Loading…]
  Fetch -->|error / empty| FB[Hardcoded Fallback UI]
  Fetch -->|success| View[CmsPageView]
  View --> Loop[For each section sorted]
  Loop --> Ren[CmsSectionRenderer by type]
```

`preview: false` → hidden sections/blocks skip।  
`preview: true` (admin) → সব দেখায়, hidden dimmed।

---

## ১২. Block Content Examples

### Hero heading

```json
{
  "type": "heading",
  "label": "Main Headline",
  "content": {
    "text": "Bangladesh er Prothom Automated Real Estate Co-operative Platform.",
    "highlight": "Automated",
    "cmsKey": "hero_main_headline"
  }
}
```

### Step block

```json
{
  "type": "step",
  "label": "Step 1",
  "content": {
    "num": "1",
    "title": "Select & Verify",
    "desc": "Browse vetted land opportunities…"
  }
}
```

### Image block

```json
{
  "type": "image",
  "label": "Hero Image",
  "content": {
    "imageUrl": "/images/estate/hero-mirage-rosetum.png",
    "alt": "The Mirage Rosetum"
  }
}
```

---

## ১৩. অন্য প্রজেক্টে Implement Checklist

```mermaid
flowchart LR
  A[1. Migration<br/>3 tables] --> B[2. Models]
  B --> C[3. Controller + Routes]
  C --> D[4. Default Service]
  D --> E[5. pageLayoutApi.ts]
  E --> F[6. VisualCmsEditor]
  F --> G[7. SectionRenderer map]
  G --> H[8. CmsDrivenPage]
  H --> I[9. Admin auth guard]
  I --> J[10. Seed + Reset]
```

### Step-by-step

1. **DB** — `cms_pages`, `cms_sections`, `cms_blocks` + cascade FK  
2. **Models** — Eloquent relations + casts  
3. **API** — public show + admin CRUD + reorder + reset  
4. **Defaults** — `getDefaultPages()` in-code tree  
5. **Frontend types + API client**  
6. **Visual editor** — preview + properties + react-dnd  
7. **Renderer registry** — `type` → React component  
8. **Public wrapper** — `CmsDrivenPage(slug, fallback)`  
9. **Auth** — Sanctum Bearer + `role === 'admin'`  
10. **Seed / Reset** — first install + recovery button  

---

## ১৪. Demo Credentials

| Role | Email | Password | Portal |
|------|-------|----------|--------|
| Admin | `admin@estatearchive.bd` | `password` | `/portal/admin` |
| CMS | — | — | `/portal/admin/cms` |

---

## ১৫. Quick Commands

```bash
# Backend
cd backend
php artisan migrate
php artisan db:seed --class=CmsPageLayoutSeeder
php artisan storage:link
php artisan serve

# Frontend
npm run dev
# → http://localhost:5173/portal/admin/cms
```

---

## ১৬. Design Rules (এই প্রজেক্টের)

1. **Section.type** = কোন UI component  
2. **Block.content** = editable text/image data (JSON)  
3. Public API শুধু `is_published` + `is_visible` দেয়  
4. Admin API সব দেয় (hidden সহ)  
5. Default design PHP service-এ — Reset সবসময় original ফেরায়  
6. Optional `cmsKey` → `dynamic_cms_settings` overlay (shared copy)

---

*Generated for Estate Archive (Jarin Corporation) — Visual CMS implementation reference.*
