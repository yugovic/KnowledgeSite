#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

class ClaudeSummaryTerminalV2 {
  constructor(options = {}) {
    this.options = {
      japaneseOnly: options.japaneseOnly || false,
      userTypedOnly: options.userTypedOnly !== false, // デフォルトはtrue
      ...options
    };
    
    this.analysis = {
      totalMessages: 0,
      userMessages: 0,
      toolResultMessages: 0, // ツール結果のメッセージ数
      actualUserTyped: 0,    // 実際にユーザーがタイプしたメッセージ数
      personality: {
        politeness: 0,
        technical: 0,
        patience: 0,
        curiosity: 0,
        collaboration: 0,
        emotion: 0,
        creativity: 0,
        humor: 0
      },
      communicationStyle: {
        directCommands: 0,
        questions: 0,
        feedback: 0,
        appreciation: 0
      },
      keywords: {},
      timePatterns: {},
      projectStats: {},
      messageTypes: {
        userTyped: 0,
        toolResult: 0,
        command: 0,
        conversation: 0,
        error: 0
      }
    };
  }

  // メッセージがツール結果かどうかを判定
  isToolResultMessage(data) {
    if (!data.message || !data.message.content) return false;
    
    // contentが配列の場合
    if (Array.isArray(data.message.content)) {
      // tool_resultタイプが含まれているか確認
      return data.message.content.some(item => 
        item.type === 'tool_result' || 
        item.tool_use_id !== undefined
      );
    }
    
    // contentが文字列でも、特定のパターンを持つ場合はツール結果
    if (typeof data.message.content === 'string') {
      const content = data.message.content;
      // 自動生成されたメッセージのパターン
      if (content.includes('has been modified successfully') ||
          content.includes('Tool result:') ||
          content.includes('Execution result:') ||
          content.match(/^Found \d+ files?$/)) {
        return true;
      }
    }
    
    return false;
  }

  // メッセージの種類を分類
  classifyMessage(data) {
    const content = this.getMessageContent(data);
    if (!content) return 'unknown';
    
    // ツール結果
    if (this.isToolResultMessage(data)) {
      return 'toolResult';
    }
    
    // コマンド（短いコマンド）
    if (content.match(/^(npx|node|npm|yarn|git|cc)\s/) && content.length < 50) {
      return 'command';
    }
    
    // エラーメッセージの貼り付け
    if (content.includes('Error') || content.includes('error') || 
        content.includes('エラー') || content.includes('TypeError')) {
      return 'error';
    }
    
    // 通常の会話
    return 'conversation';
  }

  // メッセージコンテンツを取得（配列でも文字列でも対応）
  getMessageContent(data) {
    if (!data.message || !data.message.content) return '';
    
    if (Array.isArray(data.message.content)) {
      // 配列の場合は最初のテキストコンテンツを返す
      const textContent = data.message.content.find(item => 
        typeof item === 'string' || (item.type === 'text' && item.text)
      );
      return textContent?.text || textContent || '';
    }
    
    return data.message.content;
  }

  // ファイル分析
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'user' && data.message) {
          const messageType = this.classifyMessage(data);
          const isToolResult = this.isToolResultMessage(data);
          
          // 全体のユーザーメッセージ数
          this.analysis.userMessages++;
          
          // メッセージタイプ別カウント
          this.analysis.messageTypes[messageType] = 
            (this.analysis.messageTypes[messageType] || 0) + 1;
          
          if (isToolResult) {
            this.analysis.toolResultMessages++;
          } else {
            // 実際にユーザーがタイプしたメッセージ
            this.analysis.actualUserTyped++;
            
            const messageContent = this.getMessageContent(data);
            
            // ユーザーがタイプしたメッセージのみを分析
            if (this.options.userTypedOnly && !isToolResult) {
              // 性格分析
              this.analyzePersonality(messageContent);
              
              // コミュニケーションスタイル分析
              this.analyzeCommunicationStyle(messageContent);
              
              // キーワード抽出（ソースコードでなければ）
              if (!this.isSourceCode(messageContent)) {
                this.extractKeywords(messageContent);
              }
              
              // 時刻パターン
              if (data.timestamp) {
                const hour = new Date(data.timestamp).getHours();
                this.analysis.timePatterns[hour] = (this.analysis.timePatterns[hour] || 0) + 1;
              }
            }
          }
        }
        
        this.analysis.totalMessages++;
        
      } catch (e) {
        // skip
      }
    }
  }

  // 統計情報の表示
  displayStats() {
    console.log('\n📊 メッセージタイプ別統計:');
    console.log(`├─ 実際の会話: ${this.analysis.messageTypes.conversation || 0}回`);
    console.log(`├─ コマンド実行: ${this.analysis.messageTypes.command || 0}回`);
    console.log(`├─ エラーログ: ${this.analysis.messageTypes.error || 0}回`);
    console.log(`└─ ツール結果: ${this.analysis.toolResultMessages}回`);
    
    const reductionPercent = ((1 - this.analysis.actualUserTyped / this.analysis.userMessages) * 100).toFixed(1);
    console.log(`\n💡 自動生成メッセージを除外: ${reductionPercent}%削減`);
  }

  // 既存のメソッドをコピー（analyzePersonality, analyzeCommunicationStyle, etc.）
  analyzePersonality(content) {
    if (typeof content !== 'string') return;
    
    if (content.match(/ありがとう|お願い|すみません|よろしく/)) {
      this.analysis.personality.politeness += 0.3;
    }
    
    if (content.match(/function|class|API|コード|プログラム|実装|デバッグ/i)) {
      this.analysis.personality.technical += 0.2;
    }
    
    if (content.match(/もう一度|再度|やり直|試して|続け/)) {
      this.analysis.personality.patience += 0.4;
    }
    
    if (content.match(/どう|なぜ|どのように|？|教えて/)) {
      this.analysis.personality.curiosity += 0.3;
    }
    
    if (content.match(/一緒に|協力|手伝|お互い/)) {
      this.analysis.personality.collaboration += 0.4;
    }
    
    if (content.match(/！|笑|嬉し|楽し|すご|最高/)) {
      this.analysis.personality.emotion += 0.2;
    }
    
    if (content.match(/アイデア|面白|新しい|思いつ|どうかな/)) {
      this.analysis.personality.creativity += 0.3;
    }
    
    if (content.match(/笑|ｗ|草|冗談|面白/)) {
      this.analysis.personality.humor += 0.3;
    }
  }

  analyzeCommunicationStyle(content) {
    if (typeof content !== 'string') return;
    
    if (content.match(/^(npx|node|npm|yarn|git)\s/) || content.length < 50) {
      this.analysis.communicationStyle.directCommands++;
    }
    
    if (content.includes('？') || content.includes('?')) {
      this.analysis.communicationStyle.questions++;
    }
    
    if (content.match(/いいね|素晴らし|すご|完璧|Good/)) {
      this.analysis.communicationStyle.feedback++;
    }
    
    if (content.match(/ありがとう|感謝|助かり/)) {
      this.analysis.communicationStyle.appreciation++;
    }
  }

  isSourceCode(content) {
    if (typeof content !== 'string') return false;
    
    if (content.includes('```')) return true;
    
    const lines = content.split('\n');
    if (lines.length > 5) {
      let codeIndicators = 0;
      
      const indentedLines = lines.filter(line => line.match(/^[\s\t]{2,}/)).length;
      if (indentedLines > lines.length * 0.5) codeIndicators++;
      
      const codeSymbols = (content.match(/[{}()[\];=><]/g) || []).length;
      const totalChars = content.length;
      if (codeSymbols / totalChars > 0.05) codeIndicators++;
      
      const definitions = (content.match(/\b(function|const|let|var|class|def|import|export)\b/g) || []).length;
      if (definitions > 3) codeIndicators++;
      
      const commentLines = lines.filter(line => 
        line.trim().startsWith('//') || 
        line.trim().startsWith('#') || 
        line.trim().startsWith('/*') ||
        line.trim().startsWith('*')
      ).length;
      if (commentLines > 2) codeIndicators++;
      
      if (codeIndicators >= 3) return true;
    }
    
    return false;
  }

  extractKeywords(content) {
    if (typeof content !== 'string') return;
    
    const programmingTerms = new Set([
      'data', 'item', 'value', 'key', 'index', 'result', 'error', 'message',
      'name', 'type', 'status', 'content', 'response', 'request', 'config',
      'function', 'class', 'method', 'variable', 'constant', 'return',
      'true', 'false', 'null', 'undefined', 'string', 'number', 'boolean',
      'initialize', 'anonymous', 'localhost', 'manager', 'controller'
    ]);
    
    const japaneseStopWords = new Set([
      'です', 'ます', 'する', 'ある', 'なる', 'これ', 'それ', 'あれ',
      'この', 'その', 'あの', 'どの', 'こと', 'もの', 'ため', 'よう'
    ]);
    
    const words = content.split(/[\s\u3000、。！？,.!?\n\r;:(){}[\]"'`]+/);
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '');
      
      const isProgrammingCompound = (word) => {
        const lowerWord = word.toLowerCase();
        if (lowerWord.endsWith('manager') || lowerWord.endsWith('handler') || 
            lowerWord.endsWith('controller') || lowerWord.endsWith('service')) {
          return true;
        }
        return false;
      };
      
      if (cleanWord.length > 2 && cleanWord.length < 20 && 
          !cleanWord.match(/^[0-9]+$/) && 
          !cleanWord.match(/^[a-z]{1,2}$/i) && 
          !programmingTerms.has(cleanWord.toLowerCase()) && 
          !japaneseStopWords.has(cleanWord) && 
          !cleanWord.match(/^[A-Z][a-z]+[A-Z]/) && 
          !isProgrammingCompound(cleanWord)) {
        
        if (this.options.japaneseOnly) {
          if (cleanWord.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
            this.analysis.keywords[cleanWord] = (this.analysis.keywords[cleanWord] || 0) + 1;
          }
        } else {
          if (cleanWord.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/) || 
              cleanWord.match(/^[A-Z][a-z]+$/)) {
            this.analysis.keywords[cleanWord] = (this.analysis.keywords[cleanWord] || 0) + 1;
          }
        }
      }
    });
  }

  findClaudeProjects() {
    const claudeDir = path.join(os.homedir(), '.claude', 'projects');
    if (!fs.existsSync(claudeDir)) {
      return [];
    }

    const projects = [];
    const projectDirs = fs.readdirSync(claudeDir);
    
    projectDirs.forEach(dir => {
      const projectPath = path.join(claudeDir, dir);
      if (fs.statSync(projectPath).isDirectory()) {
        const files = fs.readdirSync(projectPath);
        files.forEach(file => {
          if (file.endsWith('.jsonl')) {
            projects.push({
              path: path.join(projectPath, file),
              project: dir,
              file: file,
              size: fs.statSync(path.join(projectPath, file)).size
            });
          }
        });
      }
    });
    
    return projects.sort((a, b) => b.size - a.size);
  }

  normalizeScores() {
    const actualMessages = Math.max(1, this.analysis.actualUserTyped);
    
    Object.keys(this.analysis.personality).forEach(key => {
      this.analysis.personality[key] = Math.min(10, this.analysis.personality[key] / actualMessages * 20);
    });
  }

  async run() {
    console.log(`
🤖 Claude Companion V2 - ユーザータイプ分析
==============================================

実際にユーザーがタイピングしたメッセージのみを分析します。
${this.options.japaneseOnly ? '📝 日本語キーワードのみモード' : '📝 全言語キーワードモード'}
`);

    const projectFiles = this.findClaudeProjects();
    
    if (projectFiles.length === 0) {
      console.log('❌ Claude Codeのログファイルが見つかりませんでした。');
      return;
    }

    console.log(`\n📁 ${projectFiles.length}個のファイルを発見`);
    
    const filesToAnalyze = projectFiles.slice(0, 10);
    
    console.log('分析中...');
    filesToAnalyze.forEach((file, index) => {
      console.log(`  ${index + 1}/${filesToAnalyze.length}: ${file.file} (${(file.size / 1024).toFixed(1)}KB)`);
      this.analyzeFile(file.path);
    });
    
    this.normalizeScores();
    
    console.log('\n✨ 分析完了！');
    console.log(`  総メッセージ数: ${this.analysis.totalMessages}`);
    console.log(`  全ユーザーメッセージ: ${this.analysis.userMessages}`);
    console.log(`  実際のユーザー入力: ${this.analysis.actualUserTyped}`);
    console.log(`  ツール結果（除外）: ${this.analysis.toolResultMessages}`);
    
    this.displayStats();
    
    // キーワードTOP10を表示
    const topKeywords = Object.entries(this.analysis.keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    if (topKeywords.length > 0) {
      console.log('\n📝 よく使う言葉 TOP10:');
      topKeywords.forEach(([word, count], i) => {
        console.log(`  ${i + 1}. ${word} (${count}回)`);
      });
    }
  }
}

// CLI実行
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  if (args.includes('--japanese-only') || args.includes('-j')) {
    options.japaneseOnly = true;
  }
  
  const analyzer = new ClaudeSummaryTerminalV2(options);
  analyzer.run().catch(console.error);
}

module.exports = ClaudeSummaryTerminalV2;