#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

class AdvancedUserAnalyzer {
  constructor() {
    this.analysis = {
      totalMessages: 0,
      userMessages: 0,
      assistantMessages: 0,
      avgMessageLength: 0,
      scores: {
        politeness: 0,
        technical: 0,
        patience: 0,
        curiosity: 0,
        collaboration: 0,
        emotion: 0
      },
      keywords: {},
      emotions: {},
      timePatterns: {},
      communicationStyle: {
        directCommands: 0,
        questions: 0,
        feedback: 0,
        appreciation: 0,
        corrections: 0
      },
      messageTypes: {
        code: 0,
        japanese: 0,
        english: 0,
        mixed: 0
      },
      sessions: [],
      conversationFlow: []
    };
  }

  analyzePersonality() {
    const { scores } = this.analysis;
    let personality = "🎭 総合的な印象:\n\n";
    
    // 丁寧さの評価
    if (scores.politeness > 8) {
      personality += "🌸 非常に礼儀正しく、思いやりのある方です。相手への配慮が行き届いています。\n";
    } else if (scores.politeness > 5) {
      personality += "😊 バランスの取れた丁寧さで、プロフェッショナルなコミュニケーションができる方です。\n";
    } else if (scores.politeness > 3) {
      personality += "💼 効率的で実務的なコミュニケーションスタイルの方です。\n";
    } else {
      personality += "⚡ 非常に効率重視で、直接的なコミュニケーションを好む方です。\n";
    }

    // 技術的興味
    if (scores.technical > 8) {
      personality += "🔬 深い技術的知識と探究心を持ち、複雑な技術的課題を楽しむ方です。\n";
    } else if (scores.technical > 5) {
      personality += "💻 技術的な内容を理解し、実践的に活用できる方です。\n";
    }

    // 我慢強さ
    if (scores.patience > 8) {
      personality += "🧘 非常に忍耐強く、じっくりと問題に取り組む方です。\n";
    } else if (scores.patience > 5) {
      personality += "⏱️ 適度な忍耐力を持ち、効率と品質のバランスを取れる方です。\n";
    }

    // 好奇心
    if (scores.curiosity > 8) {
      personality += "🚀 非常に好奇心旺盛で、新しいアイデアや可能性を探求することを楽しむ方です。\n";
    } else if (scores.curiosity > 5) {
      personality += "🎯 目的意識を持って学習し、実用的な知識を追求する方です。\n";
    }

    // コラボレーション
    if (scores.collaboration > 7) {
      personality += "🤝 協調性が高く、一緒に問題を解決することを楽しむ方です。\n";
    }

    // 感情表現
    if (scores.emotion > 6) {
      personality += "❤️ 感情表現が豊かで、人間味のあるコミュニケーションを大切にする方です。\n";
    }

    return personality;
  }

  analyzeMessage(content) {
    const scores = {
      politeness: 0,
      technical: 0,
      patience: 0,
      curiosity: 0,
      collaboration: 0,
      emotion: 0
    };

    // 基本的な丁寧さ（全メッセージに最低限のスコア）
    if (content.length > 0) {
      scores.politeness = 1;
    }

    // 日本語の丁寧表現（改良版）
    const jpPolitePatterns = [
      /ありがとう/g, /すみません/g, /お願い/g, /よろしく/g,
      /です[。、ね]?/g, /ます[。、ね]?/g, /ください/g, /でしょうか/g,
      /いただ[きく]/g, /申し訳/g, /恐れ入り/g, /Good/g, /OK/g,
      /オッケー/g, /はい/g, /わかりました/g, /思います/g,
      /したいです/g, /してください/g, /いいです/g
    ];
    
    jpPolitePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        scores.politeness += matches.length * 2;
      }
    });

    // 技術的内容
    const techKeywords = [
      'function', 'class', 'API', 'json', 'config', 'debug', 'error',
      'コード', 'プログラム', '実装', '機能', 'バグ', 'エラー',
      'リファクタリング', 'デバッグ', 'アセット', 'スライダー',
      'UI', 'UX', 'フレームワーク', 'ライブラリ'
    ];
    
    techKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        scores.technical += 1.5;
      }
    });

    // 我慢強さの指標
    if (content.match(/もう一度|再度|やり直|また|繰り返|続け/)) {
      scores.patience += 3;
    }
    
    // 短いコマンドは効率性を示す
    if (content.trim().length < 30 && content.trim().length > 0) {
      scores.patience += 1;
    }

    // 長い説明は忍耐力を示す
    if (content.length > 200) {
      scores.patience += 2;
    }

    // 好奇心の指標
    const curiousPatterns = [
      /どう[やなのして]/g, /なぜ/g, /どのように/g, /[？?]/g,
      /でき[るそ]う/g, /面白[いそ]/g, /興味/g, /知りたい/g,
      /教えて/g, /説明して/g, /ところで/g, /もしかし/g,
      /例えば/g, /ちなみに/g, /そういえば/g
    ];
    
    curiousPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        scores.curiosity += matches.length * 2.5;
      }
    });

    // コラボレーション指標
    const collabPatterns = [
      /一緒に/g, /協力/g, /手伝/g, /サポート/g,
      /お互い/g, /共に/g, /みたい[ですかな]/g,
      /して[くみ]れ/g, /しましょう/g
    ];
    
    collabPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        scores.collaboration += matches.length * 2;
      }
    });

    // 感情表現
    const emotionPatterns = [
      /[!！]/g, /[♪♫]/g, /笑/g, /嬉し/g, /楽し/g,
      /すご[いく]/g, /素晴らし/g, /最高/g, /いいね/g,
      /がんば/g, /ありがとう/g, /[😊🎉👍💪]/g,
      /かも/g, /かな[ぁあ]/g, /ね[！。]/g, /よ[！。]/g
    ];
    
    emotionPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        scores.emotion += matches.length * 1.5;
      }
    });

    // 正規化（最大10）
    Object.keys(scores).forEach(key => {
      scores[key] = Math.min(10, scores[key]);
    });

    return scores;
  }

  analyzeMessageType(content) {
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(content);
    const hasEnglish = /[a-zA-Z]/.test(content);
    const hasCode = /[{}();=><]/.test(content);

    if (hasCode) {
      this.analysis.messageTypes.code++;
    } else if (hasJapanese && hasEnglish) {
      this.analysis.messageTypes.mixed++;
    } else if (hasJapanese) {
      this.analysis.messageTypes.japanese++;
    } else if (hasEnglish) {
      this.analysis.messageTypes.english++;
    }
  }

  analyzeCommunicationStyle(content) {
    // コマンド形式
    if (content.match(/^(npx|node|npm|yarn|git)\s/) || content.length < 50) {
      this.analysis.communicationStyle.directCommands++;
    }
    
    // 質問
    if (content.includes('？') || content.includes('?') || 
        content.match(/ですか|でしょうか|かな[ぁあ]?$/)) {
      this.analysis.communicationStyle.questions++;
    }
    
    // フィードバック
    if (content.match(/いいね|素晴らし|すご[いく]|完璧|良[いく]/)) {
      this.analysis.communicationStyle.feedback++;
    }
    
    // 感謝
    if (content.match(/ありがとう|感謝|助かり|お疲れ/)) {
      this.analysis.communicationStyle.appreciation++;
    }
    
    // 修正指示
    if (content.match(/違[うい]|ではな[くい]|修正|直し|変更/)) {
      this.analysis.communicationStyle.corrections++;
    }
  }

  extractKeywords(content) {
    // 日本語と英語の単語を抽出
    const words = content.split(/[\s\u3000、。！？,.!?]+/);
    
    words.forEach(word => {
      // 空文字、短すぎる単語、数字のみを除外
      const cleanWord = word.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '');
      
      if (cleanWord.length > 1 && 
          !cleanWord.match(/^[\d\s]+$/) &&
          !['の', 'を', 'に', 'は', 'が', 'で', 'と', 'も', 'や', 'から', 'まで', 'より'].includes(cleanWord)) {
        this.analysis.keywords[cleanWord] = (this.analysis.keywords[cleanWord] || 0) + 1;
      }
    });
  }

  analyzeJsonlFile(filePath, options = {}) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    let messageCount = 0;
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'user' && data.message) {
          messageCount++;
          
          // 最新のメッセージのみを分析する場合
          if (options.recentOnly && messageCount > lines.length - 100) {
            continue;
          }
          
          this.analysis.userMessages++;
          const messageContent = data.message.content || '';
          
          // スコア分析
          const scores = this.analyzeMessage(messageContent);
          Object.keys(scores).forEach(key => {
            this.analysis.scores[key] += scores[key];
          });
          
          // メッセージタイプ分析
          this.analyzeMessageType(messageContent);
          
          // コミュニケーションスタイル分析
          this.analyzeCommunicationStyle(messageContent);
          
          // キーワード抽出
          this.extractKeywords(messageContent);
          
          // 時刻パターン分析
          if (data.timestamp) {
            const hour = new Date(data.timestamp).getHours();
            this.analysis.timePatterns[hour] = (this.analysis.timePatterns[hour] || 0) + 1;
          }
          
          // 会話フロー記録（最新20件）
          if (this.analysis.conversationFlow.length < 20) {
            this.analysis.conversationFlow.push({
              time: data.timestamp,
              preview: messageContent.substring(0, 50) + (messageContent.length > 50 ? '...' : '')
            });
          }
        }
        
        if (data.type === 'assistant') {
          this.analysis.assistantMessages++;
        }
        
        this.analysis.totalMessages++;
        
      } catch (e) {
        // JSON parse error - skip
      }
    }
  }

  findClaudeProjects(projectName = null) {
    const claudeDir = path.join(os.homedir(), '.claude', 'projects');
    if (!fs.existsSync(claudeDir)) {
      return [];
    }

    const projects = [];
    const projectDirs = fs.readdirSync(claudeDir);
    
    for (const dir of projectDirs) {
      if (projectName && !dir.includes(projectName)) {
        continue;
      }
      
      const projectPath = path.join(claudeDir, dir);
      if (fs.statSync(projectPath).isDirectory()) {
        const files = fs.readdirSync(projectPath);
        for (const file of files) {
          if (file.endsWith('.jsonl')) {
            projects.push({
              path: path.join(projectPath, file),
              project: dir,
              file: file,
              stat: fs.statSync(path.join(projectPath, file))
            });
          }
        }
      }
    }
    
    return projects;
  }

  async analyze(projectName = null, options = {}) {
    const projectFiles = this.findClaudeProjects(projectName);
    
    if (projectFiles.length === 0) {
      console.log('Claude Codeのログファイルが見つかりませんでした。');
      return;
    }

    console.log(`\n📊 分析対象: ${projectName || '全プロジェクト'}`);
    console.log(`📁 ${projectFiles.length}個のセッションファイルを発見\n`);
    
    // ファイルサイズでソート（大きい = より活発なセッション）
    const sortedFiles = projectFiles.sort((a, b) => b.stat.size - a.stat.size);
    
    // 最大5ファイルまたは指定数を分析
    const filesToAnalyze = sortedFiles.slice(0, options.maxFiles || 5);
    
    for (const file of filesToAnalyze) {
      console.log(`📄 分析中: ${file.file} (${(file.stat.size / 1024 / 1024).toFixed(1)}MB)`);
      this.analyzeJsonlFile(file.path, options);
    }
    
    // 平均値を計算
    if (this.analysis.userMessages > 0) {
      Object.keys(this.analysis.scores).forEach(key => {
        this.analysis.scores[key] /= this.analysis.userMessages;
        this.analysis.scores[key] = Math.min(10, this.analysis.scores[key]);
      });
    }
    
    // 結果表示
    this.displayResults();
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 Claude Code ユーザー分析レポート（詳細版）');
    console.log('='.repeat(60) + '\n');
    
    // 基本統計
    console.log('📊 基本統計:');
    console.log(`├─ 総メッセージ数: ${this.analysis.totalMessages.toLocaleString()}`);
    console.log(`├─ ユーザーメッセージ: ${this.analysis.userMessages.toLocaleString()}`);
    console.log(`└─ アシスタントメッセージ: ${this.analysis.assistantMessages.toLocaleString()}\n`);
    
    // メッセージタイプ
    console.log('💬 メッセージタイプ:');
    const total = Object.values(this.analysis.messageTypes).reduce((a, b) => a + b, 0);
    if (total > 0) {
      console.log(`├─ 日本語: ${((this.analysis.messageTypes.japanese / total) * 100).toFixed(1)}%`);
      console.log(`├─ 英語: ${((this.analysis.messageTypes.english / total) * 100).toFixed(1)}%`);
      console.log(`├─ 混合: ${((this.analysis.messageTypes.mixed / total) * 100).toFixed(1)}%`);
      console.log(`└─ コード: ${((this.analysis.messageTypes.code / total) * 100).toFixed(1)}%\n`);
    }
    
    // 性格スコア
    console.log('🎯 性格スコア (0-10):');
    console.log(`├─ 😊 丁寧さ: ${this.analysis.scores.politeness.toFixed(1)}`);
    console.log(`├─ 🔬 技術的: ${this.analysis.scores.technical.toFixed(1)}`);
    console.log(`├─ 🧘 我慢強さ: ${this.analysis.scores.patience.toFixed(1)}`);
    console.log(`├─ 🚀 好奇心: ${this.analysis.scores.curiosity.toFixed(1)}`);
    console.log(`├─ 🤝 協調性: ${this.analysis.scores.collaboration.toFixed(1)}`);
    console.log(`└─ ❤️ 感情表現: ${this.analysis.scores.emotion.toFixed(1)}\n`);
    
    // コミュニケーションスタイル
    console.log('🗣️ コミュニケーションスタイル:');
    const styleTotal = Object.values(this.analysis.communicationStyle).reduce((a, b) => a + b, 0);
    if (styleTotal > 0) {
      console.log(`├─ 直接的なコマンド: ${this.analysis.communicationStyle.directCommands}回`);
      console.log(`├─ 質問: ${this.analysis.communicationStyle.questions}回`);
      console.log(`├─ フィードバック: ${this.analysis.communicationStyle.feedback}回`);
      console.log(`├─ 感謝の表現: ${this.analysis.communicationStyle.appreciation}回`);
      console.log(`└─ 修正指示: ${this.analysis.communicationStyle.corrections}回\n`);
    }
    
    // よく使う言葉
    console.log('📝 よく使う言葉 TOP 10:');
    const topKeywords = Object.entries(this.analysis.keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    topKeywords.forEach(([word, count], index) => {
      const prefix = index === topKeywords.length - 1 ? '└─' : '├─';
      console.log(`${prefix} "${word}" (${count}回)`);
    });
    
    // 活動時間帯
    console.log('\n⏰ 活動時間帯:');
    const timeEntries = Object.entries(this.analysis.timePatterns);
    if (timeEntries.length > 0) {
      const sortedTimes = timeEntries.sort(([,a], [,b]) => b - a).slice(0, 3);
      console.log(`最も活発な時間帯: ${sortedTimes.map(([hour, count]) => `${hour}時台(${count}回)`).join(', ')}`);
    }
    
    // 最近の会話サンプル
    if (this.analysis.conversationFlow.length > 0) {
      console.log('\n💭 最近の会話サンプル:');
      this.analysis.conversationFlow.slice(0, 5).forEach((msg, index) => {
        console.log(`${index + 1}. "${msg.preview}"`);
      });
    }
    
    // 総合的な印象
    console.log('\n' + this.analyzePersonality());
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// CLI実行
if (require.main === module) {
  const analyzer = new AdvancedUserAnalyzer();
  
  // コマンドライン引数を解析
  const args = process.argv.slice(2);
  let projectName = null;
  let options = {};
  
  args.forEach((arg, index) => {
    if (arg === '--project' && args[index + 1]) {
      projectName = args[index + 1];
    } else if (arg === '--recent') {
      options.recentOnly = true;
    } else if (arg === '--max-files' && args[index + 1]) {
      options.maxFiles = parseInt(args[index + 1]);
    }
  });
  
  console.log(`
🤖 Claude Code ユーザー分析ツール (Advanced)
========================================

使い方:
  node analyze-user-advanced.js [オプション]

オプション:
  --project <name>    特定のプロジェクトを分析
  --recent           最新のメッセージのみ分析
  --max-files <n>    分析するファイル数を指定
  `);
  
  analyzer.analyze(projectName, options).catch(console.error);
}

module.exports = AdvancedUserAnalyzer;