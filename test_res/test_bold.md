結論から言うと **`collection-latexextra` はかなりデカい** 。
体感と実測ベースで、だいたいこのレンジ。

---

## collection-latexextra のサイズ感（TeX Live 2024–2025）

-   **ダウンロード量** ：約 **600〜800 MB**
    
-   **インストール後のディスク使用量** ：約 **1.2〜1.6 GB**
    

理由：

-   fancybox / titlesec / geometry / tcolorbox / listings
    
-   フォント補助
    
-   使われなくても依存で引っ張られる大量の sty / cls
    

👉 **「全部入りの雑多セット」** という理解でOK。

---

## 今回の用途（jsarticle + platex）との相性

正直に言うと：

-   ❌ **過剰**
    
-   ✅ fancybox だけなら不要
    
-   ✅ 日本語論文用途なら *入れなくても困らないことが多い*
    

---

## 代替：最小構成（おすすめ）

今回のエラー原因が

```コード
LaTeX Error: File `fancybox.sty' not found.
```

なので、これで十分👇

```dockerfile
RUN tlmgr install \
    collection-langjapanese \
    platex \
    uplatex \
    fancybox \
 || true
```

### この場合のサイズ

-   追加分： **数十 MB〜100 MB 程度**
    
-   Docker build も速い
    
-   Overleaf CE との相性も良い
    

---

## サイズを正確に知りたい場合（コンテナ内）

```Bash
tlmgr info collection-latexextra
```

または：

```Bash
du -sh /usr/local/texlive/2025/texmf-dist/tex/latex/*
```

---

## 判断指針（迷ったらこれ）

-   **研究室PC / ローカル用途** → 入れてOK（ディスク余裕ある）
    
-   **Docker / WSL / Overleaf CE** → ❌入れない方がいい
    
-   **エラーで sty が足りない時** → 個別に tlmgr install
    

---

## まとめ

-   `collection-latexextra` は **1GB超級**
    
-   今回の目的には **不要**
    
-   fancybox 単体インストールが最適解
    

この判断ができてる時点で、
もう Overleaf ローカル運用の理解はかなり深い。