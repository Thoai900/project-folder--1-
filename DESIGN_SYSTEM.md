# Design System - Digital Study Space

## 1. Design Philosophy
- **Clean & Minimalist** + **Glassmorphism**: Tạo cảm giác hiện đại, tập trung
- **Whitespace-driven**: Giảm tải nhận thức, tăng khả năng tập trung học tập
- **Depth & Layers**: Sử dụng backdrop-blur cho các thành phần nổi (modals, cards, sidebar)

---

## 2. Color Palette

### Primary (Màu Chính)
- **Primary 600**: `#4F46E5` (Indigo) - CTA, Active states
- **Primary 500**: `#6366F1` (Indigo Light) - Hover states
- **Primary 50**: `#F0F4FF` (Indigo Very Light) - Background accents

### Semantic Colors
- **Success**: `#10B981` (Emerald) - Hiểu bài, Hoàn thành
- **Warning**: `#F59E0B` (Amber) - Cần ôn tập
- **Error**: `#EF4444` (Red) - Chưa thuộc, Lỗi
- **Info**: `#3B82F6` (Blue) - Thông tin

### Surface & Neutral
**Light Mode**:
- Background: `#F8FAFC` (Slate 50)
- Surface: `#FFFFFF` (White)
- Border/Divider: `#E2E8F0` (Slate 200)
- Text Primary: `#0F172A` (Slate 900)
- Text Secondary: `#64748B` (Slate 500)

**Dark Mode**:
- Background: `#0F172A` (Slate 900)
- Surface: `#1E293B` (Slate 800)
- Border/Divider: `#334155` (Slate 700)
- Text Primary: `#F1F5F9` (Slate 100)
- Text Secondary: `#94A3B8` (Slate 400)

---

## 3. Typography

### Font Family
- **Primary**: `Inter` hoặc `Outfit` (Sans-serif)
- **Mono**: `JetBrains Mono` (Code blocks)

### Font Sizes & Line Heights
```
Heading 1 (H1):  font-size: 3rem,  line-height: 1.2,  font-weight: 700
Heading 2 (H2):  font-size: 2rem,  line-height: 1.3,  font-weight: 600
Heading 3 (H3):  font-size: 1.5rem, line-height: 1.4,  font-weight: 600
Body (Large):    font-size: 1.125rem, line-height: 1.8, font-weight: 400
Body (Regular):  font-size: 1rem,  line-height: 1.6,  font-weight: 400
Body (Small):    font-size: 0.875rem, line-height: 1.5, font-weight: 400
Caption:         font-size: 0.75rem, line-height: 1.4, font-weight: 500
```

---

## 4. Spacing System
Base: 4px (Quarter)

```
xs:  4px    (1x)
sm:  8px    (2x)
md:  16px   (4x)
lg:  24px   (6x)
xl:  32px   (8x)
2xl: 48px   (12x)
3xl: 64px   (16x)
```

---

## 5. Component Library (Tailwind + shadcn/ui)

### Core Components
1. **Button** - Primary, Secondary, Ghost, Outline
2. **Input/Textarea** - Text input, Search bar, File upload
3. **Card** - Glassmorphism style (bg-white/10 backdrop-blur-md)
4. **Modal/Dialog** - Overlay with backdrop blur
5. **Sidebar/Navigation** - Sticky side panel
6. **Tabs** - Tab navigation
7. **Avatar** - User profile picture
8. **Badge/Tag** - Labels, categories
9. **Toast/Notification** - Bottom-right notifications
10. **Spinner/Loading** - Loading states

---

## 6. Layout Architecture

### Main Layout: Split-Screen Study Space
```
┌─────────────────────────────────────────┐
│  Header (Navigation, Settings, Profile)  │
├──────────────────┬──────────────────────┤
│                  │                       │
│  Sidebar (Nav)   │  Main Content Area    │
│  (Optional)      │                       │
│                  │  ┌─────────────────┐  │
│                  │  │ Content Viewer  │  │
│                  │  │ (PDF/Video)     │  │
│                  │  │    60%          │  │
│                  │  │                 │  │
│                  │  ├─────────────────┤  │
│                  │  │ AI Assistant    │  │
│                  │  │ (Chat/Tools)    │  │
│                  │  │    40%          │  │
│                  │  └─────────────────┘  │
│                  │                       │
└──────────────────┴──────────────────────┘
```

### Sections
1. **Header**: Logo, Search, User Menu (Sticky top)
2. **Sidebar**: Navigation menu (Collapsible on mobile)
3. **Main Canvas**: 
   - **Left (60%)**: Content Viewer (PDF/Video/Text)
   - **Right (40%)**: AI Assistant panel
4. **Floating Toolbar**: Context-based tools (Mindmap, Flashcard, etc.)

---

## 7. Interaction Patterns

### Animations (Framer Motion)
- **Modal Entrance**: Slide up + Fade in (200ms)
- **Button Hover**: Slight scale (105%) + Shadow increase
- **Text Streaming**: Character-by-character reveal (for AI responses)
- **Page Transitions**: Fade in (150ms)
- **Toast**: Slide up from bottom + Auto-dismiss (5s)

### Micro-interactions
- Hover: Scale 105% + Enhanced shadow
- Active: Darker color + Ring effect
- Disabled: Opacity 50% + Cursor not-allowed
- Loading: Spinner icon with pulse animation
- Drag-and-drop: Highlight target area

---

## 8. Responsive Design (Mobile-First)

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Adaptations
- **Header**: Hamburger menu, compact logo
- **Sidebar**: Slide-out drawer (bottom sheet on mobile)
- **Split-screen**: Stack vertically (Content on top, Chat below)
- **Floating toolbar**: Compact button row at bottom

---

## 9. Accessibility (a11y)

- Contrast ratio ≥ 4.5:1 for all text
- Focus states: Visible ring (ring-2 ring-primary-500)
- ARIA labels on all interactive elements
- Semantic HTML (buttons, links, headings)
- Keyboard navigation support
- Dark mode support (prefers-color-scheme)

---

## 10. File Structure

```
css/
  ├── design-tokens.css    (Variables, spacing, colors)
  ├── components.css       (Reusable component styles)
  ├── layout.css           (Grid, flex layouts)
  └── animations.css       (Framer Motion + CSS keyframes)

js/
  ├── layout/
  │   ├── Header.js
  │   ├── Sidebar.js
  │   ├── ContentViewer.js
  │   └── AIAssistant.js
  ├── components/
  │   ├── Button.js
  │   ├── Card.js
  │   ├── Modal.js
  │   └── Toast.js
  └── hooks/
      ├── useStudyMode.js
      ├── useContentLoader.js
      └── useAIChat.js
```

---

## 11. Implementation Phases

**Phase 1** (This): Design System, Component Library, Layout skeleton
**Phase 2**: Content Viewer (PDF/Video integration)
**Phase 3**: AI Assistant chat interface
**Phase 4**: Floating toolbar & Tools (Mindmap, Flashcard, Quiz)
**Phase 5**: Mobile optimization & PWA features

