
いいね、テスト用カオスメッセージいこう 😎
DOM→MD変換やコピー処理がバグりそうな要素をわざと詰め込むね。

---

# 🧪 Debug Test Message

## 1. 日本語 + English 混在

これはテスト用メッセージです。
This is a **debug test message** for Markdown conversion.

-   箇条書き（日本語）
    
-   Bullet list (English)
    
-   Mixed 言語 content
    

---

## 2. 太字・斜体・取り消し線

**これは太字です**
**これも太字です**
_これはイタリックです_
_これもイタリックです_
~~これは取り消し線です~~

**ネストのテスト:**
**太字の中に _イタリック_ を含める**

---

## 3. インラインコード

`const x = 42;`

`print("Hello, 世界")`

---

## 4. コードブロック（TypeScript）

```TypeScript
type User = {
  id: number
  name: string
  isAdmin?: boolean
}

const escapeMarkdown = (input: string): string => {
  return input.replace(/\*\*/g, "**")
}
```

---

## 5. コードブロック（Python）

```Python
def greet(name: str) -> str:
    return f"Hello, {name} 👋"

print(greet("世界"))
```

---

## 6. テーブル

| 名前 | Name | 年齢 | Role |
| --- | --- | --- | --- |
| 太郎 | Taro | 20 | Student |
| Alice | アリス | 25 | Engineer |

---

## 7. 引用

> これは引用です。
> Markdownの変換で `>` が消えないか確認。

---

## 8. チェックボックス

-   [x]  完了したタスク
    
-   [ ]  未完了タスク
    

---

## 9. リンク

[OpenAI](https://openai.com)
https://example.com/raw-url-test

---

## 10. ネストしたリスト

1.  第一階層
    
    1.  第二階層
        
        -   第三階層A
            
        -   第三階層B
            
2.  Another top level
    
    -   Sub item 1
        
    -   Sub item 2
        

---

## 11. エスケープが絡むケース

**これはアスタリスクを表示させたいケース**
`\\n` ← 文字列としての改行
`\*` ← バックスラッシュ付き

---

## 12. HTML混在テスト

<div class="test"> <strong>HTMLの太字</strong> <code>inline code</code> </div>

---

## 13. 絵文字

😀 😎 🚀 📦 🧪

---

## 14. 連続アスタリスク地獄

---

_**bold?**_
**bold**
_italic_
****broken****

---

これで：

-   DOM→Markdown変換
    
-   エスケープ処理
    
-   太字のreplace処理
    
-   コードブロック保持
    
-   テーブル保持
    
-   HTML除去 or 変換
    
-   絵文字処理
    
-   ネスト構造
    

あたりがかなり試せる。

もっと壊しにいく？
「Markdownパーサー殺しバージョン」も作れるよ 😈