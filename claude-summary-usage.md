# Claude Summary Terminal 使い方ガイド

## 基本的な使い方

### 1. 通常モード（全言語のキーワードを分析）
```bash
node claude-summary-terminal.js
```
- 日本語と英語の両方のキーワードを抽出します
- プログラミング用語は自動的に除外されます

### 2. 日本語のみモード
```bash
node claude-summary-terminal.js --japanese-only
# または短縮形
node claude-summary-terminal.js -j
```
- 日本語のキーワードのみを抽出します
- 英語の単語は完全に除外されます

### 3. 自動でブラウザを開く
```bash
# 通常モード + 自動オープン
node claude-summary-terminal.js --open

# 日本語のみモード + 自動オープン
node claude-summary-terminal.js --japanese-only --open
```

## キーワード分析の違い

### 通常モード
```
よく使う言葉 TOP10:
- エラーが発生しました (16回)
- Processing (54回)
- Failed (26回)
- ...
```

### 日本語のみモード
```
よく使う言葉 TOP10:
- エラーが発生しました (16回)
- スタックトレース (16回)
- 配置モード状態 (10回)
- ...
```

## 分析結果の確認

生成されたHTMLファイル:
```
/Users/Yugox/Documents/Program/KnowledgeSite/claude-analysis-result.html
```

このファイルには以下の情報が含まれます：
- 📊 基本統計（メッセージ数、質問回数など）
- 🏷️ あだ名候補（性格に基づいて生成）
- ⚾ パワプロ風能力評価（S〜Gランク）
- 💝 Claude相性度
- 🎯 性格分析（レーダーチャート）
- 📝 よく使う言葉 TOP10
- ⏰ 活動時間帯

## オプション一覧

| オプション | 短縮形 | 説明 |
|-----------|--------|------|
| --japanese-only | -j | 日本語キーワードのみを抽出 |
| --open | なし | 分析後、自動的にブラウザで結果を開く |

## 推奨される使い方

日本語での会話が多い場合：
```bash
node claude-summary-terminal.js -j --open
```

これにより、より正確な日本語の使用パターンが把握できます。