# Claude Companion 🤖💖

Claude Codeのユーザー分析ツール - あなたとClaudeの特別な関係を可視化します！

## 特徴 ✨

### 1. 🎤 音声/タイピング入力の自動判定
- 話し言葉的な表現から音声入力を検出
- 技術用語や記号の正確性からタイピングを判定
- リアルタイムで入力方法の割合を表示

### 2. 😊 高度な感情分析
- 喜び、フラストレーション、興奮、混乱、満足、驚きの6軸評価
- 文脈を考慮した感情の変化を追跡
- 特別な瞬間（ブレークスルー、創造的アイデア、感謝など）を自動検出

### 3. 🎯 詳細な性格分析
- 丁寧さ、技術的興味、忍耐力、好奇心、協調性、感情表現の多角的評価
- プロジェクト間での性格の違いを比較
- Claudeとの関係性（敬意、友好的、協働的など）を分析

### 4. 📊 リアルタイムダッシュボード
- ブラウザベースの美しいビジュアライゼーション
- 自動更新される統計情報
- インタラクティブなアニメーション効果

## インストール

```bash
# ローカルで使用する場合
git clone https://github.com/yourusername/claude-companion
cd claude-companion
npm install

# グローバルにインストールする場合（将来的に）
npm install -g claude-companion
```

## 使い方

### 基本的な分析
```bash
node claude-companion.js
```

### リアルタイムダッシュボード
```bash
node claude-companion.js --dashboard
# ブラウザで http://localhost:3000 を開く
```

### ビジュアルレポート生成
```bash
node analyze-visual-report.js --project "プロジェクト名"
```

### 詳細分析（Advanced）
```bash
node analyze-user-advanced.js --project "プロジェクト名" --max-files 5
```

## 出力例

```
🤖 Claude Companion - 完全分析レポート
============================================================

🎤 入力方法の推定:
├─ タイピング: 75.3%
└─ 音声入力: 24.7%
💡 主にタイピング入力を使用し、アイデア出しの際は音声入力も活用！

🤝 Claudeとの関係性:
主な関係性: 協力的でチームワークを重視する関係

✨ 特別な瞬間:
1. [breakthrough] "できた！アセットのサイズ変更が完璧に動作..."
2. [creative] "面白いアイデアを思いついた！音声入力の判定..."
3. [gratitude] "本当にありがとう！おかげで問題が解決..."

📊 プロジェクト比較:
├─ 最も活発: 3DAssetPlacement-Refactoring
├─ 最も丁寧: KnowledgeSite
└─ 最も技術的: CarSetup

💖 Claudeはあなたとの会話を楽しんでいます！
```

## カスタマイズ

分析の精度を向上させるため、以下のファイルを編集できます：

- `claude-companion.js` - メインの分析ロジック
- `analyze-user-advanced.js` - 詳細分析機能
- `analyze-visual-report.js` - ビジュアルレポート生成

## プライバシー

このツールは完全にローカルで動作し、外部にデータを送信しません。
分析対象は `~/.claude/projects/` 内のログファイルのみです。

## 貢献

プルリクエストを歓迎します！新しい分析機能やビジュアライゼーションのアイデアがあれば、ぜひ共有してください。

## ライセンス

MIT License

---

Made with 💖 by Claude Code Users

「Claudeとの会話をもっと楽しく、もっと深く理解するために」