# 03 - Styling & UI

> Quick Cheat Notes · Come Back Anytime

## Chapter

- [Tailwind CSS](#tailwind-css)
- [CSS Modules](#css-modules)
- [shadcn/ui](#shadcnui)
- [主題設計](#主題設計)

---

## Tailwind CSS

**Utility-first CSS 框架**，直接在 className 上寫樣式，不用另開 CSS 檔

```tsx
// 不用 CSS，直接在 className 寫
<div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

### Common Class Cheat Sheet

**排版**

```tsx
// Flexbox
<div className="flex items-center justify-between gap-4"></div>

// Grid
<div className="grid grid-cols-3 gap-6"></div>

// 寬高
<div className="w-full h-screen max-w-4xl mx-auto"></div>
```

**間距**（數字 × 4 = px）

```tsx
// padding / margin
<div className="p-4">        // padding: 16px 全部
<div className="px-6 py-3">  // x軸 24px, y軸 12px
<div className="mt-8 mb-4">  // margin top 32px, bottom 16px
```

**Text**

```tsx
<p className="text-sm font-medium text-gray-500">
<h1 className="text-3xl font-bold tracking-tight">
```

**Color**

```tsx
<div className="bg-blue-500 text-white">
<div className="border border-gray-200 rounded-lg">
```

**Hover / Focus / Active**

```tsx
<button className="bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all">
<input className="border focus:outline-none focus:ring-2 focus:ring-blue-500">
```

### RWD 斷點

```
sm  → 640px
md  → 768px
lg  → 1024px
xl  → 1280px
```

```tsx
// mobile first：預設小螢幕，大螢幕再覆蓋
<div className="flex-col md:flex-row">
<p className="text-sm lg:text-base">
<div className="hidden md:block">   // 只在 md 以上顯示
```

### 條件樣式（搭配 clsx）

```tsx
import clsx from 'clsx'

<button
  className={clsx(
    'px-4 py-2 rounded-lg font-medium',
    isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
  )}
>
```

> Install：`npm install clsx`

---

## CSS Modules

**Scoped 樣式**，class 名稱自動加 hash，不會汙染全域

```
Button.module.css
Button.tsx
```

```css
/* Button.module.css */
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
}

.primary {
  background: #3b82f6;
  color: white;
}

.secondary {
  background: #f3f4f6;
  color: #374151;
}
```

```tsx
// Button.tsx
import styles from './Button.module.css'

export default function Button({ variant = 'primary', children }) {
  return (
    <button className={`${styles.btn} ${styles[variant]}`}>
      {children}
    </button>
  )
}
```

### 與 Tailwind 搭配

```tsx
// 複雜動畫 / 特殊樣式 → CSS Modules
// 一般排版間距 → Tailwind
import styles from './Card.module.css'

<div className={`${styles.card} p-6 rounded-xl`}>
```

---

## shadcn/ui

**複製到專案的元件庫**，程式碼自己擁有，可以隨意修改

### Install

```bash
npx shadcn@latest init

npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

### 常用元件

**Button**

```tsx
import { Button } from '@/components/ui/button'

<Button>預設</Button>
<Button variant="outline">外框</Button>
<Button variant="destructive">刪除</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">小</Button>
<Button size="lg">大</Button>
```

**Card**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>標題</CardTitle>
  </CardHeader>
  <CardContent>
    <p>內容</p>
  </CardContent>
</Card>
```

**Input**

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="flex flex-col gap-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

**Badge / Avatar / Separator**

```tsx
import { Badge } from '@/components/ui/badge'

<Badge>New</Badge>
<Badge variant="outline">Draft</Badge>
<Badge variant="destructive">Error</Badge>
```

---

## 主題設計

### 設計 Token 觀念

**不要 hardcode 顏色**，統一管理讓整份 UI 一致

```css
/* globals.css */
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-surface: #ffffff;
  --color-surface-muted: #f9fafb;
  --color-border: #e5e7eb;
  --color-text: #111827;
  --color-text-muted: #6b7280;

  --radius: 8px;
  --radius-lg: 12px;

  --font-sans: 'Inter', sans-serif;
}
```

### 間距比例

```
4px  → 超小間距（icon 之間）
8px  → 小（標籤內 padding）
12px → 中小
16px → 標準（p-4）
24px → 中大（section 之間）
32px → 大（p-8）
48px → 超大（section 頂部）
```

### Dark Mode（Tailwind）

```tsx
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // 手動切換
}
```

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

```tsx
// 切換 dark mode
document.documentElement.classList.toggle('dark')
```

### 常用 UI Pattern

**Card with hover**

```tsx
<div className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
```

**Pill Badge**

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
  Active
</span>
```

**Loading Skeleton**

```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>
```

---

## Practice List

### Tailwind CSS

- [ ] 用 Tailwind 刻一個 Navbar：左邊 Logo、右邊三個導覽連結，RWD 在手機版隱藏連結
- [ ] 做一張 Profile Card：頭像、姓名、職稱、三個 Social 按鈕
- [ ] 用 `grid-cols` 做一個 3 欄的商品列表，手機版變成 1 欄
- [ ] 用 `hover:` / `transition` 做一個按鈕的 hover 動畫效果

### CSS Modules

- [ ] 把你的 Counter component 的樣式改用 CSS Modules 管理
- [ ] 建立一個 `Tag.module.css`，支援 `primary`、`success`、`danger` 三種 variant

### shadcn/ui

- [ ] 安裝 shadcn/ui，新增 Button、Card、Input 三個元件
- [ ] 用 Card + Input + Button 組一個 Login 表單頁面
- [ ] 用 Badge 做一個 Todo List，每個 todo 有狀態標籤（pending / done）

### 綜合實作

- [ ] 做一個完整的 Landing Page：Navbar + Hero Section + Feature 卡片 × 3 + Footer
- [ ] 實作 Dark Mode 切換按鈕，整個頁面跟著切換

---

*上一章：[02 - Advanced Hooks](../02-advanced-hooks/notes.md)　｜　下一章：[04 - Routing (Next.js App Router)](../04-routing(Next.js)/notes.md)*