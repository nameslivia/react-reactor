# 02 - Advanced Hooks

> Quick Cheat Notes · Come Back Anytime

## Chapter

- [useEffect](#useeffect)
- [useRef](#useref)
- [useContext](#usecontext)
- [useReducer](#usereducer)
- [useMemo / useCallback](#usememo--usecallback)
- [Custom Hooks](#custom-hooks)

---

## useEffect

**處理副作用（Side Effects）**：資料fetch、訂閱、手動操作 DOM 等，在渲染後執行

```tsx
import { useEffect } from 'react'

useEffect(() => {
  // 副作用邏輯
}, [dependencies])
//   ↑ 依賴陣列
```

### 依賴陣列三種情境

```tsx
// 1. 沒有依賴陣列 → 每次渲染後都執行
useEffect(() => {
  console.log('每次渲染後執行')
})

// 2. 空陣列 → 只在 mount（第一次渲染）時執行
useEffect(() => {
  console.log('只執行一次')
}, [])

// 3. 有依賴 → 依賴變動時才執行
useEffect(() => {
  console.log('count 改變了：', count)
}, [count])
```

### Cleanup 函式

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log('tick')
  }, 1000)

  // return 的函式會在 unmount 或下次 effect 執行前呼叫
  return () => clearInterval(timer)
}, [])
```

> cleanup 常用於：清除 timer、取消訂閱、取消 fetch 請求

### 實際範例：Fetch 資料

```tsx
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data)
        setLoading(false)
      })
  }, [userId])  // userId 改變就重新 fetch

  if (loading) return <p>Loading...</p>
  return <p>{user?.name}</p>
}
```

### 常見錯誤

```tsx
// ✘：在 effect 裡更新 state，卻沒把 state 放進依賴 → lint 警告、邏輯錯誤
useEffect(() => {
  setCount(count + 1)  // count 應該放進依賴陣列
}, [])

// ✔：用 functional update，不需要依賴 count
useEffect(() => {
  setCount(prev => prev + 1)
}, [])
```

---

## useRef

**兩個主要用途：存取 DOM 元素、保存不觸發重新渲染的值**

```tsx
import { useRef } from 'react'

const ref = useRef(initialValue)
// ref.current → 實際的值
```

### 用途一：操作 DOM

```tsx
function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()  // 元件掛載後自動 focus
  }, [])

  return <input ref={inputRef} placeholder="自動 focus" />
}
```

### 用途二：保存不影響渲染的值

```tsx
function Stopwatch() {
  const [time, setTime] = useState(0)
  const timerRef = useRef<number | null>(null)  // 存 timer ID，改變不觸發重渲染

  const start = () => {
    timerRef.current = setInterval(() => {
      setTime(prev => prev + 1)
    }, 1000)
  }

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  return (
    <div>
      <p>時間：{time}s</p>
      <button onClick={start}>開始</button>
      <button onClick={stop}>停止</button>
    </div>
  )
}
```

### useRef vs useState

|  | useRef | useState |
|--|--------|----------|
| 改變時重新渲染 | ✘ | ✔ |
| 存值 | ✔ | ✔ |
| 操作 DOM | ✔ | ✘ |
| 適合用途 | timer ID、DOM ref、前一次的值 | 顯示在畫面上的資料 |

> 一個好的判斷方式：**這個值需要顯示在畫面上嗎？** 需要 → useState，不需要 → useRef

---

## useContext

**跨層傳遞資料，不需要一層一層 props drilling**

### 建立 Context

```tsx
import { createContext, useContext } from 'react'

// 1. 建立 Context（含預設值）
const ThemeContext = createContext<'light' | 'dark'>('light')
```

### 提供 Context

```tsx
// 2. 用 Provider 包住要共享的範圍
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  return (
    <ThemeContext.Provider value={theme}>
      <Navbar />
      <Main />
    </ThemeContext.Provider>
  )
}
```

### 消費 Context

```tsx
// 3. 在任何子元件內取用
function Navbar() {
  const theme = useContext(ThemeContext)
  return <nav className={theme}>Navbar</nav>
}
```

### 實際範例：全域認證狀態

```tsx
type AuthContextType = {
  user: string | null
  login: (name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null)

  return (
    <AuthContext.Provider value={{
      user,
      login: (name) => setUser(name),
      logout: () => setUser(null),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// 自訂 hook 讓使用更方便（常見做法）
function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
```

> Context 不是萬能的，如果只是父子兩層的傳遞，直接用 props 就好

---

## useReducer

**複雜的 state 邏輯，用 reducer 函式集中管理**，概念來自 Redux

```tsx
import { useReducer } from 'react'

const [state, dispatch] = useReducer(reducer, initialState)
//             ↑ 觸發 action 的函式
```

### 基本結構

```tsx
// 1. 定義 Action 類型
type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }

// 2. 定義 State 類型
type State = { count: number }

// 3. 寫 Reducer（純函式：舊 state + action → 新 state）
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT': return { count: state.count + 1 }
    case 'DECREMENT': return { count: state.count - 1 }
    case 'RESET':     return { count: 0 }
    default:          return state
  }
}

// 4. 使用
function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 })

  return (
    <div>
      <p>計數：{state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+1</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-1</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  )
}
```

### useState vs useReducer

|  | useState | useReducer |
|--|----------|------------|
| 適合情境 | 簡單、獨立的值 | 多個相關的 state、複雜邏輯 |
| 更新方式 | setter 直接設值 | dispatch action |
| 邏輯集中 | 分散在各 handler | 集中在 reducer |
| 可測試性 | 較難單獨測試 | reducer 是純函式，易測試 |

> **規則：** 當發現 state 越來越多、更新邏輯越來越複雜時，就是換 useReducer 的時機

---

## useMemo / useCallback

**效能優化**：避免不必要的重複計算或函式重建

### useMemo — 快取計算結果

```tsx
import { useMemo } from 'react'

const memoizedValue = useMemo(() => {
  return expensiveCalculation(a, b)
}, [a, b])  // a 或 b 改變才重新計算
```

```tsx
// 實際範例：過濾大量資料
function ProductList({ products, keyword }: Props) {
  const filtered = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(keyword.toLowerCase())
    )
  }, [products, keyword])  // 只有這兩個改變時才重新過濾

  return <ul>{filtered.map(p => <li key={p.id}>{p.name}</li>)}</ul>
}
```

### useCallback — 快取函式本身

```tsx
import { useCallback } from 'react'

const memoizedFn = useCallback(() => {
  doSomething(a, b)
}, [a, b])  // a 或 b 改變才產生新的函式
```

```tsx
// 實際範例：傳給子元件的函式，避免子元件不必要的重渲染
function Parent() {
  const [count, setCount] = useState(0)

  // 沒有 useCallback：每次 Parent 重渲染，handleClick 都是新的函式
  // → 子元件每次都重渲染
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])  // 不依賴任何值，永遠同一個函式

  return <Child onClick={handleClick} />
}
```

### 什麼時候用？

```
useMemo  → 計算很昂貴（大量資料處理、複雜運算）
useCallback → 函式傳給有用 React.memo 包住的子元件
```

> **不要過早優化！** 大多數情況不需要，加了反而增加程式複雜度。先寫，覺得慢了再加。

---

## Custom Hooks

**把重複的 hook 邏輯抽出來，變成自己的 hook**，名稱必須以 `use` 開頭

### 範例一：useFetch

```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed')
        return res.json()
      })
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [url])

  return { data, loading, error }
}

// 使用
function App() {
  const { data, loading, error } = useFetch<User[]>('/api/users')

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

### 範例二：useLocalStorage

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setStoredValue = (newValue: T) => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  return [value, setStoredValue] as const
}

// 使用
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  return <button onClick={() => setTheme('dark')}>切換深色</button>
}
```

### 範例三：useDebounce

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

// 使用：搜尋框防抖
function Search() {
  const [input, setInput] = useState('')
  const debouncedInput = useDebounce(input, 300)

  useEffect(() => {
    // debouncedInput 停止輸入 300ms 後才會更新
    console.log('搜尋：', debouncedInput)
  }, [debouncedInput])

  return <input onChange={e => setInput(e.target.value)} />
}
```

> Custom Hook 的好處：**邏輯可重用**、**元件更乾淨**、**容易測試**

---

## Practice List

### useEffect

- [ ] 元件 mount 時，用 `fetch` 打一個公開 API（例如 `https://jsonplaceholder.typicode.com/users`），把結果顯示出來
- [ ] 讓搜尋框每次輸入都 `console.log`，但要在元件 unmount 時清除
- [ ] 建立一個計時器，每秒 +1，unmount 時正確清除（用 cleanup）
- [ ] 找出錯誤：`useEffect(() => { setCount(count + 1) }, [])` — 為什麼 count 永遠是 1？

### useRef

- [ ] 建立一個 input，頁面載入後自動 focus
- [ ] 建立碼錶，開始 / 停止按鈕，用 `useRef` 儲存 timer ID
- [ ] 用 `useRef` 記錄「前一次的 count 值」，顯示「上次：X，現在：Y」

### useContext

- [ ] 建立一個 `ThemeContext`，在最外層切換 `light / dark`，最內層的元件直接讀取並改變背景色
- [ ] 把 `useContext` 包裝成 `useTheme()` custom hook，加上 Provider 不存在時的錯誤提示
- [ ] 建立 `LanguageContext`，支援中文 / 英文切換，兩個子元件分別顯示對應語言的文字

### useReducer

- [ ] 把之前的計數器改用 `useReducer` 實作，支援 `INCREMENT`、`DECREMENT`、`RESET`
- [ ] 建立一個 Todo List，用 `useReducer` 管理 `ADD_TODO`、`TOGGLE_TODO`、`DELETE_TODO`
- [ ] 建立一個購物車，用 `useReducer` 處理加入 / 移除 / 清空商品

### useMemo / useCallback

- [ ] 有一個含 10000 筆資料的列表，用 `useMemo` 實作關鍵字過濾，觀察效能差異
- [ ] 把一個傳給子元件的函式用 `useCallback` 包住，搭配 `React.memo` 避免子元件重渲染
- [ ] 找出過度使用的情境：什麼時候加 `useMemo` 反而是多餘的？

### Custom Hooks

- [ ] 實作 `useFetch`，支援 loading / error / data 三種狀態
- [ ] 實作 `useToggle`：回傳 `[value, toggle]`，呼叫 `toggle` 就切換 boolean
- [ ] 實作 `useDebounce`，用在搜尋框，輸入停止 500ms 後才觸發搜尋
- [ ] 實作 `useWindowSize`，即時回傳 `{ width, height }`，視窗改變時自動更新

---

*上一章：[01 - React Basics](../01-basics/notes.md)　｜　下一章：（待續）*