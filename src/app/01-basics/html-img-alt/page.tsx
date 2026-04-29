/*
    為什麼 alt 是必要的？

    - 無障礙性（Accessibility）：螢幕閱讀器需要 alt 文字來描述圖片給視障使用者
    - 圖片載入失敗時：會顯示替代文字，讓使用者知道圖片內容
    - SEO：搜尋引擎透過 alt 理解圖片內容
    - HTML 規範：alt 是 <img> 的必要屬性（required attribute）
*/

export default function HtmlImgAlt() {
  return (
    <div>
      {/* WRONG */}
      <img src="logo.png" />

      {/* CORRECT */}
      <img src="logo.png" alt="Logo" />
    </div>
  )
}