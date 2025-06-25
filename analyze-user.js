#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

class UserAnalyzer {
  constructor() {
    this.analysis = {
      totalMessages: 0,
      userMessages: 0,
      assistantMessages: 0,
      avgMessageLength: 0,
      politenessScore: 0,
      technicalnessScore: 0,
      patienceScore: 0,
      curiosityScore: 0,
      keywords: {},
      sessions: []
    };
  }

  analyzePersonality() {
    const { politenessScore, technicalnessScore, patienceScore, curiosityScore } = this.analysis;
    
    let personality = "";
    
    if (politenessScore > 7) {
      personality += "とても優しく丁寧な方ですね 😊 ";
    } else if (politenessScore > 4) {
      personality += "礼儀正しい方ですね 🙂 ";
    } else {
      personality += "率直で効率的なコミュニケーションを好む方ですね 💪 ";
    }

    if (technicalnessScore > 8) {
      personality += "技術的知識が豊富で、深い議論を好む方のようです 🔬 ";
    } else if (technicalnessScore > 5) {
      personality += "適度に技術的な話題に興味をお持ちですね 💻 ";
    } else {
      personality += "実用的な解決策を重視する方ですね 🛠️ ";
    }

    if (patienceScore > 7) {
      personality += "とても我慢強く、継続的に取り組む方ですね 🧘 ";
    } else if (patienceScore < 3) {
      personality += "効率を重視し、素早い結果を求める方ですね ⚡ ";
    }

    if (curiosityScore > 8) {
      personality += "非常に探究心旺盛で学習意欲の高い方ですね 🚀 ";
    }

    return personality;
  }

  analyzeMessage(content) {
    const scores = {
      politeness: 0,
      technical: 0,
      patience: 0,
      curiosity: 0
    };

    // 基本的な丁寧さ（短いメッセージでも評価）
    if (content.length > 3) {
      scores.politeness = 1; // ベースライン
    }

    // 丁寧語チェック（大文字小文字を区別しない）
    const politeWords = ['ありがとう', 'すみません', 'お疲れ', 'よろしく', 'ください', 'です', 'ます', 'thank', 'please', 'sorry', 'お願い', '下さい'];
    const lowerContent = content.toLowerCase();
    const politeCount = politeWords.filter(word => {
      // 日本語の場合は大文字小文字の区別なし、英語は小文字で比較
      return content.includes(word) || lowerContent.includes(word.toLowerCase());
    }).length;
    scores.politeness += Math.min(8, politeCount * 2.5);

    // 「〜して」「〜して下さい」パターンの検出
    if (content.match(/して(下さい|ください)?|お願い/)) {
      scores.politeness += 2;
    }

    // 技術的内容チェック
    const techWords = ['npx', 'ccusage', 'session', 'API', 'json', 'jsonl', 'コード', 'エラー', 'デバッグ', 'function', 'class', 'script', 'tool', 'command', 'usage', 'daily', 'blocks', 'localhost', 'model', '起動', 'テスト'];
    const techCount = techWords.filter(word => lowerContent.includes(word.toLowerCase())).length;
    scores.technical = Math.min(10, techCount * 2.5);

    // 我慢強さチェック（繰り返し同じコマンド = 継続性）
    if (content.includes('npx ccusage') || content.includes('ccusage')) {
      scores.patience = 5;
    }
    if (content.includes('localhost') && content.includes('起動')) {
      scores.patience += 3; // 繰り返しlocalhostを起動しようとしている
    }
    if (content.trim().length < 30 && content.trim().length > 5) { // 短めのコマンド
      scores.patience += 1;
    }

    // 好奇心チェック
    const curiousWords = ['どう', 'なぜ', 'どのように', '？', '?', '作れます', '面白い', 'できそう', 'how', 'what', 'why', 'interesting', 'create', 'make', 'tool', '生きて', 'テスト'];
    const curiousCount = curiousWords.filter(word => lowerContent.includes(word.toLowerCase())).length;
    scores.curiosity = Math.min(10, curiousCount * 3);

    // 日本語での質問や提案
    if (content.includes('ところで') || content.includes('例えば') || content.includes('思ってる')) {
      scores.curiosity += 3;
      scores.politeness += 2;
    }

    // 探究心の高い表現
    if (content.includes('面白い') || content.includes('できそう') || content.includes('気もする') || content.includes('しましょう')) {
      scores.curiosity += 3;
    }

    // 丁寧な疑問文
    if (content.includes('ですか') || content.includes('でしょうか') || content.includes('ますか')) {
      scores.politeness += 2;
      scores.curiosity += 1;
    }

    // 疑問文（？で終わる）
    if (content.match(/[？?]$/)) {
      scores.curiosity += 2;
    }

    return scores;
  }

  findClaudeProjects() {
    const claudeDir = path.join(os.homedir(), '.claude', 'projects');
    if (!fs.existsSync(claudeDir)) {
      return [];
    }

    const projects = [];
    const projectDirs = fs.readdirSync(claudeDir);
    
    for (const dir of projectDirs) {
      const projectPath = path.join(claudeDir, dir);
      if (fs.statSync(projectPath).isDirectory()) {
        const files = fs.readdirSync(projectPath);
        for (const file of files) {
          if (file.endsWith('.jsonl')) {
            projects.push(path.join(projectPath, file));
          }
        }
      }
    }
    
    return projects;
  }

  analyzeJsonlFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'user' && data.message) {
          this.analysis.userMessages++;
          const messageContent = data.message.content || '';
          
          const scores = this.analyzeMessage(messageContent);
          this.analysis.politenessScore += scores.politeness;
          this.analysis.technicalnessScore += scores.technical;
          this.analysis.patienceScore += scores.patience;
          this.analysis.curiosityScore += scores.curiosity;
          
          // キーワード抽出（日本語対応）
          const words = messageContent.split(/[\s\u3000]+/); // 全角スペースも考慮
          words.forEach(word => {
            // 特殊文字や数字のみを除外
            const cleanWord = word.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '');
            if (cleanWord.length > 1 && !cleanWord.match(/^\d+$/)) {
              this.analysis.keywords[cleanWord] = (this.analysis.keywords[cleanWord] || 0) + 1;
            }
          });
        }
        
        if (data.type === 'assistant') {
          this.analysis.assistantMessages++;
        }
        
        this.analysis.totalMessages++;
        
      } catch (e) {
        // JSON parse error - skip line
      }
    }
  }

  async analyze() {
    const projectFiles = this.findClaudeProjects();
    
    if (projectFiles.length === 0) {
      console.log('Claude Codeのログファイルが見つかりませんでした。');
      return;
    }

    console.log(`📊 ${projectFiles.length}個のセッションファイルを分析中...`);
    
    // 最新のファイルを優先的に分析
    const sortedFiles = projectFiles
      .map(file => ({ 
        path: file, 
        stat: fs.statSync(file) 
      }))
      .sort((a, b) => b.stat.mtime - a.stat.mtime)
      .slice(0, 10); // 最新10ファイルのみ
    
    for (const file of sortedFiles) {
      this.analyzeJsonlFile(file.path);
    }
    
    // 平均値を計算
    if (this.analysis.userMessages > 0) {
      this.analysis.politenessScore /= this.analysis.userMessages;
      this.analysis.technicalnessScore /= this.analysis.userMessages;
      this.analysis.patienceScore /= this.analysis.userMessages;
      this.analysis.curiosityScore /= this.analysis.userMessages;
    }
    
    // スコアを0-10の範囲に正規化
    this.analysis.politenessScore = Math.min(10, this.analysis.politenessScore);
    this.analysis.technicalnessScore = Math.min(10, this.analysis.technicalnessScore);
    this.analysis.patienceScore = Math.min(10, this.analysis.patienceScore);
    this.analysis.curiosityScore = Math.min(10, this.analysis.curiosityScore);
    
    // 結果表示
    this.displayResults();
  }

  displayResults() {
    console.log('\n🤖 Claude Code ユーザー分析レポート\n');
    console.log('='.repeat(50));
    
    console.log(`📝 総メッセージ数: ${this.analysis.totalMessages}`);
    console.log(`👤 ユーザーメッセージ: ${this.analysis.userMessages}`);
    console.log(`🤖 アシスタントメッセージ: ${this.analysis.assistantMessages}`);
    
    console.log('\n📊 性格スコア (0-10):');
    console.log(`😊 丁寧さ: ${this.analysis.politenessScore.toFixed(1)}`);
    console.log(`🔬 技術的: ${this.analysis.technicalnessScore.toFixed(1)}`);
    console.log(`🧘 我慢強さ: ${this.analysis.patienceScore.toFixed(1)}`);
    console.log(`🚀 好奇心: ${this.analysis.curiosityScore.toFixed(1)}`);
    
    console.log('\n🎯 よく使う言葉 TOP5:');
    const topKeywords = Object.entries(this.analysis.keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    topKeywords.forEach(([word, count], index) => {
      console.log(`${index + 1}. "${word}" (${count}回)`);
    });
    
    console.log('\n🎭 AIから見たあなたの印象:');
    console.log(this.analyzePersonality());
    
    console.log('\n' + '='.repeat(50));
  }
}

// CLI実行
if (require.main === module) {
  const analyzer = new UserAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = UserAnalyzer;