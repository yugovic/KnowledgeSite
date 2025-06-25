#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const ClaudeAnalyzer = require('./js/claude-analyzer.js');

console.log(`
🤖 Claude Code 全プロジェクト分析ツール
=====================================
`);

// Find all Claude projects
const claudeDir = path.join(os.homedir(), '.claude', 'projects');
if (!fs.existsSync(claudeDir)) {
  console.error('❌ Claude Codeのプロジェクトフォルダが見つかりません');
  process.exit(1);
}

const analyzer = new ClaudeAnalyzer();
const projectStats = {};
let totalFiles = 0;

// Get all project directories
const projectDirs = fs.readdirSync(claudeDir);

console.log(`📁 ${projectDirs.length}個のプロジェクトを発見しました\n`);

// Process each project
for (const dir of projectDirs) {
  const projectPath = path.join(claudeDir, dir);
  if (!fs.statSync(projectPath).isDirectory()) continue;
  
  const files = fs.readdirSync(projectPath);
  const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));
  
  if (jsonlFiles.length > 0) {
    console.log(`📂 ${dir}: ${jsonlFiles.length}個のセッション`);
    projectStats[dir] = {
      sessions: jsonlFiles.length,
      messages: 0
    };
    
    // Process each JSONL file
    for (const file of jsonlFiles) {
      const filePath = path.join(projectPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      analyzer.processJsonlData(content);
      totalFiles++;
      
      // Count messages for this project
      const lines = content.trim().split('\n');
      let projectMessages = 0;
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.type === 'user' || data.type === 'assistant') {
            projectMessages++;
          }
        } catch (e) {}
      }
      projectStats[dir].messages += projectMessages;
    }
  }
}

// Finalize analysis
const results = analyzer.finalizeAnalysis();

console.log(`
=============================================================
📊 分析完了！
=============================================================

📝 基本統計
-----------
総ファイル数: ${totalFiles}
総メッセージ数: ${results.totalMessages}
ユーザーメッセージ: ${results.userMessages}
Claudeの返答: ${results.assistantMessages}

🎯 あなたのニックネーム
---------------------
${results.emoji} ${results.nickname}

🎭 性格分析
-----------
${results.personality}

📊 性格スコア (0-10)
------------------
😊 丁寧さ: ${results.politenessScore.toFixed(1)}
🔬 技術的: ${results.technicalnessScore.toFixed(1)}
🧘 我慢強さ: ${results.patienceScore.toFixed(1)}
🚀 好奇心: ${results.curiosityScore.toFixed(1)}

🏆 よく使う言葉 TOP10
-------------------`);

const topKeywords = analyzer.getTopKeywords(10);
topKeywords.forEach(([word, count], index) => {
  console.log(`${index + 1}. "${word}" (${count}回)`);
});

console.log(`
💻 よく使うコマンド
-----------------`);

const topCommands = analyzer.getTopCommands();
if (topCommands.length > 0) {
  topCommands.forEach(([command, count], index) => {
    console.log(`${index + 1}. ${command} (${count}回)`);
  });
} else {
  console.log('(コマンドが検出されませんでした)');
}

console.log(`
📁 プロジェクト別統計
-------------------`);

// Sort projects by message count
const sortedProjects = Object.entries(projectStats)
  .sort(([,a], [,b]) => b.messages - a.messages)
  .slice(0, 10);

sortedProjects.forEach(([name, stats]) => {
  const shortName = name.length > 40 ? name.substring(0, 37) + '...' : name;
  console.log(`${shortName}: ${stats.messages}メッセージ (${stats.sessions}セッション)`);
});

console.log(`
=============================================================
💡 分析結果の活用方法
=============================================================

1. 📱 Webブラウザで詳細な分析を見る場合:
   open claude-summary-analyzer.html
   
2. 📊 リアルタイムダッシュボードを起動する場合:
   node claude-companion.js --dashboard

3. 🎨 プロフィールページに統合する場合:
   結果をコピーして navigation.js の createProfileSection() に追加

=============================================================
`);