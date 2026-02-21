# ChaCopy 仕様書

## 概要

ChaCopy は ChatGPT の各メッセージにワンボタンを追加し、
その発言を **壊れない Markdown 形式へ変換してクリップボードにコピーする Chrome 拡張機能** である。

主目的：

* ChatGPT のコピーボタンでは数式や装飾が壊れる問題の解決
* ワンクリックで再利用可能な Markdown を取得

対象：

* ChatGPT Web UI（chat.openai.com / chatgpt.com）

---

## 主要機能

### 1. ワンクリック Markdown コピー

各 assistant メッセージに「MD」ボタンを追加する。

クリック時：

1. 該当メッセージの DOM を取得
2. Markdown に変換
3. クリップボードへコピー

---

### 2. 数式の変換

ChatGPT の KaTeX 表示を Markdown/LaTeX 互換へ変換する。

#### 変換規則

| ChatGPT     | 出力        |
| ----------- | --------- |
| `\( ... \)` | `$...$`   |
| `\[ ... \]` | `$$...$$` |

#### 抽出方法

KaTeX ノード内部の `annotation` 要素の textContent を使用する

```
<span class="katex">
  <annotation encoding="application/x-tex">LATEX</annotation>
</span>
```

---

### 3. 太字の正規化（重要要件）

ChatGPT 出力は日本語と `**` が密着し Markdown 解釈が壊れることがある。

#### 例（問題）

```
日本語**重要**日本語
```

#### 出力仕様

太字の前後に必ず 1 つ以上のスペースを入れる

```
日本語 **重要** 日本語
```

#### 適用条件

* コードブロック内では実行しない
* インラインコード内では実行しない
* 数式内では実行しない

---


### 6. インラインコードの保持

```

`code`

```

- 内部テキストは絶対変更しない
- 太字正規化対象外

---

### 7. リスト構造の維持
ul / ol のネストを Markdown 形式に復元

---

### 8. 開発言語
TypeScriptを用いる