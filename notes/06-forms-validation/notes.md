# 06 - Forms & Validation

> Quick Cheat Notes · Come Back Anytime

## Chapter

- [Controlled vs Uncontrolled](#controlled-vs-uncontrolled)
- [React Hook Form](#react-hook-form)
- [Zod 驗證](#zod-驗證)
- [RHF + Zod 整合](#rhf--zod-整合)
- [Server Actions](#server-actions)

---

## Controlled vs Uncontrolled

### Controlled（推薦）

**React 控制 input 的值**，每次輸入都更新 state

```tsx
'use client'
import { useState } from 'react'

export default function Form() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ name, email })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button type="submit">Send</button>
    </form>
  )
}
```

### Uncontrolled（少用）

**用 ref 在送出時才讀值**，不追蹤每次輸入

```tsx
import { useRef } from 'react'

export default function Form() {
  const nameRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(nameRef.current?.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} />
      <button type="submit">Send</button>
    </form>
  )
}
```

> 欄位一多就用 **React Hook Form**，不要自己管一堆 state

---

## React Hook Form

**最主流的表單管理套件**，效能好、整合驗證方便

### Install

```bash
npm install react-hook-form
```

### Basic Usage

```tsx
'use client'
import { useForm } from 'react-hook-form'

type FormData = {
  name: string
  email: string
  age: number
}

export default function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    console.log(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

      <div>
        <input
          {...register('name', { required: '姓名必填' })}
          placeholder="姓名"
          className="border rounded px-3 py-2 w-full"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <input
          {...register('email', {
            required: 'Email 必填',
            pattern: { value: /^\S+@\S+$/, message: 'Email 格式錯誤' }
          })}
          placeholder="Email"
          className="border rounded px-3 py-2 w-full"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '送出中...' : '送出'}
      </button>

    </form>
  )
}
```

### Examples

```tsx
register('name', {
  required: '必填',
  minLength: { value: 2, message: '至少 2 個字' },
  maxLength: { value: 20, message: '最多 20 個字' },
})

register('age', {
  min: { value: 18, message: '需年滿 18 歲' },
  max: { value: 100, message: '請輸入合理年齡' },
  valueAsNumber: true,   // 轉成數字
})

register('website', {
  pattern: { value: /^https?:\/\//, message: '請輸入完整網址' },
})
```

### 常用 formState

```tsx
const { errors, isSubmitting, isDirty, isValid, dirtyFields } = formState

isSubmitting  // 送出中
isDirty       // 有欄位被修改過
isValid       // 所有驗證都通過
```

### watch & setValue

```tsx
const { watch, setValue } = useForm()

const nameValue = watch('name')         // 監聽單一欄位
const allValues = watch()               // 監聽全部

setValue('name', 'Jay')                 // 程式設定值
setValue('name', 'Jay', { shouldValidate: true })
```

---

## Zod 驗證

**TypeScript-first 的 schema 驗證**，定義一次，同時有型別和驗證邏輯

### Install

```bash
npm install zod
```

### 定義 Schema

```tsx
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(2, '至少 2 個字').max(20, '最多 20 個字'),
  email: z.string().email('Email 格式錯誤'),
  age: z.number().min(18, '需年滿 18 歲'),
  password: z.string().min(8, '至少 8 個字元'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: '密碼不一致',
  path: ['confirmPassword'],
})

// 從 schema 自動推導型別
type UserForm = z.infer<typeof userSchema>
```

### 常用 Zod 型別

```tsx
z.string()
z.string().email()
z.string().url()
z.string().min(2).max(20)
z.string().optional()           // 可選
z.string().nullable()           // 可為 null

z.number()
z.number().int()
z.number().positive()

z.boolean()

z.enum(['admin', 'user', 'guest'])

z.array(z.string())
z.array(z.string()).min(1, '至少選一個')

z.object({ name: z.string() })
```

### 手動驗證

```tsx
const result = userSchema.safeParse(inputData)

if (!result.success) {
  console.log(result.error.errors)
  // [{ path: ['email'], message: 'Email 格式錯誤' }]
} else {
  console.log(result.data)  // 型別安全的資料
}
```

---

## RHF + Zod 整合

**最佳實踐**：用 Zod 定義 schema，接進 React Hook Form

### Install

```bash
npm install @hookform/resolvers
```

### Examples

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, '至少 2 個字'),
  email: z.string().email('Email 格式錯誤'),
  password: z.string().min(8, '至少 8 個字元'),
})

type FormData = z.infer<typeof schema>

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-sm">

      <div>
        <input {...register('name')} placeholder="姓名" className="input" />
        {errors.name && <p className="error">{errors.name.message}</p>}
      </div>

      <div>
        <input {...register('email')} placeholder="Email" className="input" />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>

      <div>
        <input {...register('password')} type="password" placeholder="密碼" className="input" />
        {errors.password && <p className="error">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '註冊中...' : '註冊'}
      </button>

    </form>
  )
}
```

---

## Server Actions

**在 Server Component 直接處理表單送出**，不需要另建 API route

```tsx
// app/contact/page.tsx
export default function ContactPage() {

  async function sendMessage(formData: FormData) {
    'use server'                              // 這個 function 在 server 執行

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const message = formData.get('message') as string

    await db.message.create({ data: { name, email, message } })
  }

  return (
    <form action={sendMessage} className="flex flex-col gap-4">
      <input name="name" placeholder="姓名" />
      <input name="email" placeholder="Email" />
      <textarea name="message" placeholder="訊息" />
      <button type="submit">送出</button>
    </form>
  )
}
```

### useActionState（處理 Server Action 回傳值）

```tsx
'use client'
import { useActionState } from 'react'
import { sendMessage } from './actions'

export default function Form() {
  const [state, action, isPending] = useActionState(sendMessage, null)

  return (
    <form action={action}>
      <input name="name" />
      <button type="submit" disabled={isPending}>
        {isPending ? '送出中...' : '送出'}
      </button>
      {state?.error && <p className="text-red-500">{state.error}</p>}
      {state?.success && <p className="text-green-500">送出成功！</p>}
    </form>
  )
}
```

```tsx
// app/contact/actions.ts
'use server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export async function sendMessage(prevState: any, formData: FormData) {
  const result = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  await db.message.create({ data: result.data })
  return { success: true }
}
```

---

## Practice List

- [ ] 用 React Hook Form 做一個登入表單（email + 密碼），加上 required 驗證
- [ ] 定義一個 Zod schema 給註冊表單（name、email、password、confirmPassword），確認兩次密碼一致
- [ ] 把登入表單改用 RHF + zodResolver 整合驗證
- [ ] 做一個多步驟表單（Step 1: 基本資料 / Step 2: 帳號設定），步驟之間保留資料
- [ ] 用 Server Action 做一個聯絡表單，送出後顯示成功訊息，不需要前端 JS
- [ ] 在 Server Action 加上 Zod 驗證，驗證失敗時回傳錯誤訊息給 `useActionState`

---

*上一章：[05 - Data Fetching](../05-data-fetching/notes.md)　｜　下一章：[07 - Projects](../07-projects/notes.md)*