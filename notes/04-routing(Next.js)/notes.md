# 04 - Routing (Next.js App Router)

> Quick Cheat Notes · Come Back Anytime

## Chapter

- [App Router Basics](#app-router-基礎)
- [動態路由](#動態路由)
- [Layout & Template](#layout--template)
- [Navigation](#navigation)
- [Loading & Error](#loading--error)

---

## App Router Basics

**資料夾結構 = URL 路徑**，每個資料夾放一個 `page.tsx` 就是一個頁面

```
app/
├── page.tsx          → /
├── about/
│   └── page.tsx      → /about
├── blog/
│   ├── page.tsx      → /blog
│   └── [slug]/
│       └── page.tsx  → /blog/:slug
└── dashboard/
    ├── layout.tsx
    ├── page.tsx      → /dashboard
    └── settings/
        └── page.tsx  → /dashboard/settings
```

### 特殊檔案

| 檔案 | 用途 |
|------|------|
| `page.tsx` | 頁面 UI |
| `layout.tsx` | 共用框架（不會 re-render） |
| `loading.tsx` | Loading UI |
| `error.tsx` | Error UI |
| `not-found.tsx` | 404 頁面 |
| `route.ts` | API endpoint |

### Server vs Client Component

```tsx
// Server Component（預設）
// 可以直接 fetch、存取 DB，不能用 useState / useEffect
export default async function Page() {
  const data = await fetch('https://api.example.com/posts')
  const posts = await data.json()
  return <div>{posts.map(p => <p key={p.id}>{p.title}</p>)}</div>
}
```

```tsx
// Client Component
// 需要互動、state、瀏覽器 API 才用
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

> Notes：**能用 Server Component 就用 Server Component**，只有需要互動的部分才加 `'use client'`

---

## 動態路由

### 基本動態路由 `[param]`

```
app/blog/[slug]/page.tsx → /blog/hello-world
app/users/[id]/page.tsx  → /users/123
```

```tsx
// app/blog/[slug]/page.tsx
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <h1>Post: {params.slug}</h1>
}
```

### 全捕獲路由 `[...param]`

```
app/docs/[...slug]/page.tsx → /docs/a/b/c
```

```tsx
export default function Docs({ params }: { params: { slug: string[] } }) {
  // params.slug = ['a', 'b', 'c']
  return <p>{params.slug.join('/')}</p>
}
```

### generateStaticParams（靜態生成）

```tsx
// 告訴 Next.js 有哪些路徑要預先產生
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map(post => ({ slug: post.slug }))
}
```

---

## Layout & Template

### Layout

```tsx
// app/layout.tsx（Root Layout，必須有）
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
```

```tsx
// app/dashboard/layout.tsx（Nested Layout）
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

### Route Groups `(folder)`

**用括號的資料夾不影響 URL**，只用來組織結構 / 共用 layout

```
app/
├── (marketing)/
│   ├── layout.tsx   ← 只套用在這組
│   ├── page.tsx     → /
│   └── about/
│       └── page.tsx → /about
└── (dashboard)/
    ├── layout.tsx   ← 只套用在這組
    └── dashboard/
        └── page.tsx → /dashboard
```

---

## Navigation

### Link

```tsx
import Link from 'next/link'

<Link href="/about">About</Link>
<Link href={`/blog/${slug}`}>Post</Link>

// 預取（預設開啟）
<Link href="/about" prefetch={false}>About</Link>
```

### useRouter（程式導航）

```tsx
'use client'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <button onClick={() => router.push('/dashboard')}>
      Go to Dashboard
    </button>
  )
}
```

```tsx
router.push('/path')      // 導航（可回上一頁）
router.replace('/path')   // 導航（不留歷史紀錄）
router.back()             // 回上一頁
router.refresh()          // 重新整理 Server Components
```

### usePathname / useSearchParams

```tsx
'use client'
import { usePathname, useSearchParams } from 'next/navigation'

const pathname = usePathname()       // '/dashboard/settings'
const searchParams = useSearchParams()
const query = searchParams.get('q') // ?q=hello → 'hello'
```

---

## Loading & Error

### loading.tsx（自動 Suspense）

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  )
}
```

### error.tsx

```tsx
// app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <p className="text-red-500">Error：{error.message}</p>
      <button onClick={reset} className="px-4 py-2 bg-blue-500 text-white rounded">
        Try again
      </button>
    </div>
  )
}
```

### not-found.tsx

```tsx
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-500">404 Page Not Found</p>
      <Link href="/" className="text-blue-500 underline">Back to Home</Link>
    </div>
  )
}
```

```tsx
// 在 Server Component 手動觸發 404
import { notFound } from 'next/navigation'

export default async function Page({ params }) {
  const post = await getPost(params.slug)
  if (!post) notFound()
  return <div>{post.title}</div>
}
```

---

## Practice List

- [ ] 建立三個頁面：`/`、`/about`、`/contact`，用 Navbar 的 Link 互相切換
- [ ] 做一個 `/blog/[slug]` 動態路由，點擊文章列表後進入文章詳情頁
- [ ] 用 Route Groups 分離 `(marketing)` 和 `(app)` 兩組 layout
- [ ] 做一個 Dashboard layout：左側 Sidebar + 右側 content，包含 `/dashboard`、`/dashboard/settings` 兩頁
- [ ] 在 dashboard 頁加上 `loading.tsx` 和 `error.tsx`
- [ ] 用 `useRouter` 做一個登入後自動導向 `/dashboard` 的效果

---

*上一章：[03 - Styling & UI](../03-styling-ui/notes.md)　｜　下一章：[05 - Data Fetching](../05-data-fetching/notes.md)*