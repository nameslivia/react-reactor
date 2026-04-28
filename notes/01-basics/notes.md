# 01 - React Basics

> Quick Cheat Notes · Come Back Anytime

## Chapter

- [JSX](#jsx)
- [Component](#component)
- [Props](#props)
- [useState](#usestate)

---

## JSX

**在 JavaScript 裡面寫看起來像 HTML 的東西**，透過 Babel 編譯成真正的 JS

```jsx
const element = <h1>Hello, World!</h1>
// 編譯後
const element = React.createElement('h1', null, 'Hello, World!')
```

### Rules

**1. 只能有一個根元素 → 用 Fragment 包**

```jsx
return (
  <>
    <h1>Title</h1>
    <p>Paragraph</p>
  </>
)
```

**2. 用 `{}` 插入 JavaScript**

```jsx
const name = 'Jay'
const age = 25

return (
  <div>
    <p>My name is {name}</p>
    <p>Next year will be {age + 1} years old</p>
  </div>
)
```

**3. `class` → `className`**

```jsx
<div className="box">
```

**4. 標籤要關閉**

```jsx
<input type="text" />
```

**5. 條件渲染**

```jsx
{isLoggedIn ? <p>Welcome Back！</p> : <p>Login First</p>}
{isLoggedIn && <p>You have new messages</p>}
```

**6. 列表渲染**

```jsx
const fruits = ['Apple', 'Banana', 'Orange']

return (
  <ul>
    {fruits.map((fruit, index) => (
      <li key={index}>{fruit}</li>
    ))}
  </ul>
)
```

> `key` 是必須的，幫助 React 識別每個項目，避免不必要的重新渲染

---

## Component

**回傳 JSX 的函式**，名稱一定要大寫開頭

```tsx
function Hello() {
  return <h1>你好！</h1>
}

// 箭頭函式也可以
const Hello = () => <h1>你好！</h1>
```

> 小寫開頭 React 會把它當成 HTML 標籤，不是 Component

### 使用

```tsx
function App() {
  return (
    <div>
      <Hello />
      <Hello />  {/* 可以重複使用 */}
    </div>
  )
}
```

### 拆分結構

```tsx
function App() {
  return (
    <div>
      <Navbar />
      <Main />
      <Footer />
    </div>
  )
}
```

好處：**可重用**、**好維護**（改一處、全部更新）、**拆分複雜度**

---

## Props

**從父傳資料進 Component**，像 HTML 屬性，但可以傳任何東西

### 基本用法

```tsx
// 接收（用解構，不用一直寫 props.xxx）
function Greeting({ name, age }: { name: string; age: number }) {
  return <p>{name} is {age} years old</p>
}

// 傳入
<Greeting name="Liam" age={25} />
```

### 可選 Props + 預設值

```tsx
type ButtonProps = {
  text: string
  color?: string       // ? 代表可選
  onClick: () => void
}

function Button({ text, color = 'blue', onClick }: ButtonProps) {
  return (
    <button style={{ background: color }} onClick={onClick}>
      {text}
    </button>
  )
}
```

### children

```tsx
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>
}

<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

### 單向資料流

Props 只能**從父傳子**，子不能修改 props。要讓子影響父，傳入函式：

```tsx
function Parent() {
  const handleClick = () => alert('子觸發了！')
  return <Child onClick={handleClick} />
}

function Child({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Click</button>
}
```

---

## useState

**Component 自己管理的資料**，改變時 React 自動重新渲染畫面

```tsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  //     ↑ 目前的值   ↑ 修改的函式  ↑ 初始值

  return (
    <div>
      <p>目前計數：{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}
```

### 重要規則

**不能直接修改 state，要用 setter：**

```tsx
// ✘：畫面不會更新
count = count + 1

// ✔
setCount(count + 1)
```

**修改陣列 / 物件要產生新的：**

```tsx
// 陣列
setItems([...items, newItem])         // 新增
setItems(items.filter(i => i !== x))  // 刪除

// 物件
setUser({ ...user, age: 26 })         // 修改某個欄位
```

### 常見情境

```tsx
// 表單輸入
const [value, setValue] = useState('')
<input value={value} onChange={e => setValue(e.target.value)} />
```

### State vs Props

|  | Props | State |
|--|-------|-------|
| 來源 | 父 Component 傳入 | Component 自己管理 |
| 能否修改 | ✘ 唯讀 | ✔ 用 setter 修改 |
| 改變時重新渲染 | ✔ | ✔ |
| 用途 | 接收外部資料 | 管理內部狀態 |

---

## Practice List

### JSX

- [ ] 建立一個變數 `isLoggedIn = true`，條件渲染「Welcome Back！」或「Login First」
- [ ] 用 `.map()` 渲染一個城市列表，記得加 `key`
- [ ] 找出錯誤：`<div class="box"><img src="logo.png"></div>`

### Component

- [ ] 建立一個 `Greeting` component，顯示「Hello，World！」
- [ ] 把一個有 navbar、main、footer 的頁面拆成三個獨立 component
- [ ] 找出錯誤：`function myButton() { return <button>Click</button> }`

### Props

- [ ] 建立 `UserCard` component，接收 `name` 和 `role` 兩個 props 並顯示
- [ ] 幫 `color` prop 加上預設值 `'gray'`
- [ ] 用 `children` 包一個 `<section>` 當容器 component
- [ ] 建立父子 component，子按鈕點擊後觸發父的 alert

### useState

- [ ] 建立一個計數器，有 +1 / -1 兩顆按鈕
- [ ] 建立一個 todo list，可以新增項目（用 input + button）
- [ ] 建立一個顯示 / 隱藏的切換按鈕
- [ ] 找出錯誤：`count = count + 1`（畫面為什麼沒有更新？）

---

*上一章：（無）　｜　下一章：*