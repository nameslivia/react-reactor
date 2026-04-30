# 05 - Data Fetching

> Quick Cheat Notes · Come Back Anytime

## Chapter

- [Server Component Fetch](#server-component-fetch)
- [Client Side Fetching](#client-side-fetching)
- [TanStack Query](#tanstack-query)
- [API Routes](#api-routes)
- [環境變數](#環境變數)

---

## Server Component Fetch

**直接在 async Server Component 裡 fetch**，不需要 useEffect

```tsx
// app/posts/page.tsx
export default async function PostsPage() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts')
  const posts = await res.json()

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### 快取控制

```tsx
// 預設：快取（靜態）
fetch('https://api.example.com/posts')

// 不快取（每次請求都重新 fetch）
fetch('https://api.example.com/posts', { cache: 'no-store' })

// 定時重新驗證（秒）
fetch('https://api.example.com/posts', { next: { revalidate: 60 } })
```

### 平行 fetch

```tsx
// 不要用 await 一個等一個，改用 Promise.all
export default async function Page() {
  const [user, posts] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
  ])

  return <div>{user.name} has {posts.length} posts</div>
}
```

### 錯誤處理

```tsx
export default async function Page() {
  const res = await fetch('https://api.example.com/posts')

  if (!res.ok) {
    throw new Error('Failed to fetch posts')  // 自動被 error.tsx 接住
  }

  const posts = await res.json()
  return <div>{/* ... */}</div>
}
```

---

## Client Side Fetching

**需要使用者互動後才 fetch** 時才用，例如搜尋、篩選、分頁

### 基本寫法（useEffect + useState）

```tsx
'use client'
import { useEffect, useState } from 'react'

export default function Posts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(r => r.json())
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

> 這樣寫太繁瑣 → 用 TanStack Query 取代

---

## TanStack Query

**最主流的 Client Side 資料管理工具**，自動處理 loading、error、快取、refetch

### Install

```bash
npm install @tanstack/react-query
```

### 設定 Provider

```tsx
// app/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

```tsx
// app/layout.tsx
import Providers from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### useQuery（讀取資料）

```tsx
'use client'
import { useQuery } from '@tanstack/react-query'

const fetchPosts = async () => {
  const res = await fetch('/api/posts')
  if (!res.ok) throw new Error('Fetch failed')
  return res.json()
}

export default function Posts() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['posts'],      // 快取的 key
    queryFn: fetchPosts,
  })

  if (isPending) return <p>Loading...</p>
  if (isError) return <p>Error: {error.message}</p>

  return <ul>{data.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

### useMutation（寫入資料）

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

const createPost = async (newPost) => {
  const res = await fetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(newPost),
    headers: { 'Content-Type': 'application/json' },
  })
  return res.json()
}

export default function CreatePost() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })  // 讓列表重新 fetch
    },
  })

  return (
    <button
      onClick={() => mutation.mutate({ title: 'New Post', body: '...' })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Saving...' : 'Create Post'}
    </button>
  )
}
```

### queryKey 設計

```tsx
// 一般列表
useQuery({ queryKey: ['posts'] })

// 帶 ID
useQuery({ queryKey: ['posts', postId] })

// 帶篩選條件
useQuery({ queryKey: ['posts', { status: 'published', page: 1 }] })
```

---

## API Routes

**在 Next.js 裡直接寫後端 API**，放在 `app/api/` 資料夾

```tsx
// app/api/posts/route.ts
import { NextResponse } from 'next/server'

// GET /api/posts
export async function GET() {
  const posts = await db.post.findMany()
  return NextResponse.json(posts)
}

// POST /api/posts
export async function POST(request: Request) {
  const body = await request.json()
  const post = await db.post.create({ data: body })
  return NextResponse.json(post, { status: 201 })
}
```

```tsx
// app/api/posts/[id]/route.ts
// DELETE /api/posts/123
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await db.post.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
```

### 常用 Response

```tsx
NextResponse.json({ data })                      // 200
NextResponse.json({ data }, { status: 201 })     // 201 Created
NextResponse.json({ error: 'Not found' }, { status: 404 })
NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

---

## 環境變數

```bash
# .env.local（不要 commit 到 git！）
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_API_URL="https://api.example.com"
SECRET_KEY="your-secret-key"
```

```tsx
// Server Component / API Route（可以用所有變數）
const secret = process.env.SECRET_KEY

// Client Component（只能用 NEXT_PUBLIC_ 開頭的）
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

> `NEXT_PUBLIC_` 開頭的變數會被打包進前端，**不要放 secret**

---

## Practice List

- [ ] 用 Server Component fetch 公開 API（例如 JSONPlaceholder），顯示文章列表
- [ ] 加上 `loading.tsx` 和 fetch 失敗的 error 處理
- [ ] 用 `Promise.all` 同時 fetch 兩個資料來源
- [ ] 安裝 TanStack Query，把一個 Client Component 的 fetch 改用 `useQuery`
- [ ] 做一個搜尋框，輸入關鍵字後用 `useQuery` 帶參數重新 fetch
- [ ] 建立 `app/api/todos/route.ts`，實作 GET（列表）和 POST（新增）
- [ ] 用 `useMutation` 串接上面的 POST endpoint，新增後自動 refetch 列表

---

*上一章：[04 - Routing (Next.js App Router)](../04-routing(Next.js)/notes.md)　｜　下一章：[06 - Forms & Validation](../06-forms-validation/notes.md)*