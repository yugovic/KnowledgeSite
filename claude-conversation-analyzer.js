#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

class ClaudeConversationAnalyzer {
  constructor(options = {}) {
    this.options = {
      japaneseOnly: options.japaneseOnly || false,
      ...options
    };
    
    this.analysis = {
      totalMessages: 0,
      actualConversations: 0,
      excludedMessages: {
        toolResults: 0,
        commands: 0,
        errorLogs: 0,
        systemMessages: 0
      },
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
      inputMethod: {
        typing: 0,
        voice: 0
      },
      communicationStyle: {
        questions: 0,
        feedback: 0,
        appreciation: 0,
        instructions: 0,
        reports: 0
      },
      keywords: {},
      timePatterns: {},
      projectStats: {},
      conversations: [] // 実際の会話を保存
    };
  }

  // ツール結果メッセージの判定
  isToolResultMessage(data) {
    if (!data.message || !data.message.content) return false;
    
    if (Array.isArray(data.message.content)) {
      return data.message.content.some(item => 
        item.type === 'tool_result' || 
        item.tool_use_id !== undefined
      );
    }
    
    if (typeof data.message.content === 'string') {
      const content = data.message.content;
      if (content.includes('has been modified successfully') ||
          content.includes('Tool result:') ||
          content.includes('Execution result:') ||
          content.match(/^Found \d+ files?$/)) {
        return true;
      }
    }
    
    return false;
  }

  // コマンドの判定
  isCommand(content) {
    if (!content || typeof content !== 'string') return false;
    return content.match(/^(npx|node|npm|yarn|git|cc|ccusage)\s/) && content.length < 100;
  }

  // エラーログの判定
  isErrorLog(content) {
    if (!content || typeof content !== 'string') return false;
    
    const lines = content.split('\n');
    if (lines.length > 5) {
      const errorIndicators = [
        content.includes('TypeError'),
        content.includes('ReferenceError'),
        content.includes('SyntaxError'),
        content.includes('at '),
        content.includes('Error:'),
        content.includes('stack trace'),
        content.includes('スタックトレース')
      ];
      
      const errorCount = errorIndicators.filter(x => x).length;
      if (errorCount >= 2) return true;
    }
    
    return false;
  }

  // メッセージコンテンツを取得
  getMessageContent(data) {
    if (!data.message || !data.message.content) return '';
    
    if (Array.isArray(data.message.content)) {
      const textContent = data.message.content.find(item => 
        typeof item === 'string' || (item.type === 'text' && item.text)
      );
      return textContent?.text || textContent || '';
    }
    
    return data.message.content;
  }

  // 実際の会話かどうかを判定
  isActualConversation(data) {
    if (this.isToolResultMessage(data)) {
      this.analysis.excludedMessages.toolResults++;
      return false;
    }
    
    const content = this.getMessageContent(data);
    if (!content || typeof content !== 'string') {
      this.analysis.excludedMessages.systemMessages++;
      return false;
    }
    
    // コマンドやエラーログを除外
    if (this.isCommand(content)) {
      this.analysis.excludedMessages.commands++;
      return false;
    }
    if (this.isErrorLog(content)) {
      this.analysis.excludedMessages.errorLogs++;
      return false;
    }
    
    // 非常に短いメッセージ（「はい」など）も会話として含める
    // ただし空白のみは除外
    if (content.trim().length === 0) {
      this.analysis.excludedMessages.systemMessages++;
      return false;
    }
    
    return true;
  }

  // ソースコードの判定
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

  // あだ名の生成
  generateNicknames() {
    const { personality, communicationStyle } = this.analysis;
    const nicknames = [];
    
    if (personality.curiosity > 8) {
      nicknames.push('好奇心旺盛なマスター');
      nicknames.push('探究心のあるハッカー');
      nicknames.push('質問好きなデベロッパー');
    }
    
    if (personality.politeness > 5) {
      nicknames.push('礼儀正しいコーダー');
      nicknames.push('紳士的なプログラマー');
    }
    
    if (personality.technical > 7) {
      nicknames.push('技術愛好家');
      nicknames.push('コード職人');
    }
    
    if (personality.patience > 6) {
      nicknames.push('根気強いデバッガー');
      nicknames.push('忍耐のマスター');
    }
    
    if (communicationStyle.appreciation > 10) {
      nicknames.push('感謝の達人');
    }
    
    if (nicknames.length === 0) {
      nicknames.push('バランス型プログラマー');
      nicknames.push('オールラウンダー');
      nicknames.push('マルチタレント');
    }
    
    return nicknames;
  }

  // パワプロ風評価（適応型評価システム）
  generatePowerProRatings() {
    const { personality, actualConversations, communicationStyle } = this.analysis;
    
    // 相対評価ベースの評価関数（会話数を考慮）
    const getRelativeRating = (value, metric = 'standard') => {
      // メトリックごとの期待値（338回の会話での平均的な値）
      const expectedValues = {
        'politeness': 2.0,      // 礼儀正しさの期待値
        'technical': 6.0,       // 技術的な話題の期待値
        'curiosity': 20.0,      // 質問の期待値（実際86件）
        'patience': 3.0,        // 忍耐力の期待値
        'collaboration': 1.0,   // 協調性の期待値
        'creativity': 2.0       // 創造性の期待値
      };
      
      const expected = expectedValues[metric] || 5.0;
      const ratio = value / expected;
      
      // パーセンタイルベースの評価
      if (ratio >= 2.0) return 'S';
      if (ratio >= 1.5) return 'A';
      if (ratio >= 1.2) return 'B';
      if (ratio >= 0.8) return 'C';
      if (ratio >= 0.5) return 'D';
      if (ratio >= 0.3) return 'E';
      if (ratio >= 0.1) return 'F';
      return 'G';
    };
    
    const getRelativeValue = (value, metric = 'standard') => {
      const expectedValues = {
        'politeness': 2.0,
        'technical': 6.0,
        'curiosity': 20.0,
        'patience': 3.0,
        'collaboration': 1.0,
        'creativity': 2.0
      };
      
      const expected = expectedValues[metric] || 5.0;
      const ratio = value / expected;
      return Math.min(100, Math.round(ratio * 50));
    };
    
    // 基本能力
    const ratings = {
      'コミュ力': { 
        letter: getRelativeRating(personality.politeness + personality.emotion, 'politeness'),
        value: getRelativeValue(personality.politeness + personality.emotion, 'politeness')
      },
      '技術力': { 
        letter: getRelativeRating(personality.technical, 'technical'),
        value: getRelativeValue(personality.technical, 'technical')
      },
      '質問力': { 
        letter: getRelativeRating(personality.curiosity, 'curiosity'),
        value: getRelativeValue(personality.curiosity, 'curiosity')
      },
      '忍耐力': { 
        letter: getRelativeRating(personality.patience, 'patience'),
        value: getRelativeValue(personality.patience, 'patience')
      },
      '協調性': { 
        letter: getRelativeRating(personality.collaboration, 'collaboration'),
        value: getRelativeValue(personality.collaboration, 'collaboration')
      },
      '創造力': { 
        letter: getRelativeRating(personality.creativity, 'creativity'),
        value: getRelativeValue(personality.creativity, 'creativity')
      }
    };
    
    // 特殊能力の判定（実際の数値ベース）
    const specialAbilities = {
      positive: [],  // 青背景（良い特能）
      negative: [],  // 赤背景（マイナス特能）
      unique: []     // 金特能
    };
    
    // ポジティブ特能（実際の数値を基準に）
    if (personality.politeness > 1) specialAbilities.positive.push('礼儀◯');
    if (personality.technical > 3) specialAbilities.positive.push('技術◯');
    if (personality.patience > 2) specialAbilities.positive.push('粘り強さ');
    if (communicationStyle.appreciation >= 1) specialAbilities.positive.push('感謝上手');
    if (communicationStyle.questions > 50) specialAbilities.positive.push('質問王');
    if (personality.humor > 0.5) specialAbilities.positive.push('ムード◯');
    if (actualConversations > 100) specialAbilities.positive.push('会話上手');
    
    // ネガティブ特能（厳しめの条件）
    if (personality.patience < 1 && actualConversations > 100) {
      specialAbilities.negative.push('短気');
    }
    
    // 金特能（特別な条件）
    if (personality.politeness > 2 && personality.collaboration > 0) {
      specialAbilities.unique.push('紳士力');
    }
    if (communicationStyle.questions > 80) {
      specialAbilities.unique.push('探究心');
    }
    if (personality.technical > 5 && personality.creativity > 1) {
      specialAbilities.unique.push('技術革新');
    }
    
    // 会話数ベースの特別な能力
    if (actualConversations < 500 && actualConversations > 200) {
      specialAbilities.unique.push('成長株');
    }
    if (actualConversations > 300) {
      specialAbilities.positive.push('常連');
    }
    
    // ユーザー情報
    const userStats = {
      conversations: actualConversations,
      messages: this.analysis.totalMessages,
      efficiency: ((actualConversations / this.analysis.totalMessages) * 100).toFixed(1)
    };
    
    return { ratings, specialAbilities, userStats };
  }

  // Claude相性診断
  calculateClaudeCompatibility() {
    const { personality, communicationStyle, actualConversations } = this.analysis;
    
    // 基礎点（会話している時点で既に相性あり）
    const basePoints = 50;
    
    let points = basePoints;
    
    // 実際の行動に基づく加点
    points += Math.min(10, personality.politeness * 5);           // 礼儀正しさ
    points += Math.min(5, personality.collaboration * 5);          // 協調性
    points += Math.min(10, communicationStyle.appreciation * 2.5); // 感謝
    points += Math.min(5, personality.patience * 2);              // 忍耐力
    points += Math.min(15, communicationStyle.questions / 6);      // 質問（86件なら約14点）
    points += Math.min(5, actualConversations / 100);              // 会話頻度
    
    return Math.min(100, Math.round(points));
  }

  // ファイル分析
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'user' && data.message) {
          this.analysis.totalMessages++;
          
          if (this.isActualConversation(data)) {
            this.analysis.actualConversations++;
            const messageContent = this.getMessageContent(data);
            
            // 会話を保存（最新100件まで）
            if (this.analysis.conversations.length < 100) {
              this.analysis.conversations.push({
                content: messageContent,
                timestamp: data.timestamp,
                project: path.basename(path.dirname(filePath))
              });
            }
            
            // 各種分析
            this.analyzePersonality(messageContent);
            this.analyzeCommunicationStyle(messageContent);
            this.analyzeInputMethod(messageContent);
            
            // キーワード抽出
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
        
      } catch (e) {
        // skip
      }
    }
  }

  analyzePersonality(content) {
    if (typeof content !== 'string') return;
    
    if (content.match(/ありがとう|お願い|すみません|よろしく/)) {
      this.analysis.personality.politeness += 0.5;
    }
    
    if (content.match(/function|class|API|コード|プログラム|実装|デバッグ/i)) {
      this.analysis.personality.technical += 0.3;
    }
    
    if (content.match(/もう一度|再度|やり直|試して|続け|localhost.*起動/)) {
      this.analysis.personality.patience += 0.5;
    }
    
    if (content.match(/どう|なぜ|どのように|？|教えて|でしょうか/)) {
      this.analysis.personality.curiosity += 0.4;
    }
    
    if (content.match(/一緒に|協力|手伝|お互い/)) {
      this.analysis.personality.collaboration += 0.5;
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
    
    if (content.includes('？') || content.includes('?') || content.match(/でしょうか|ですか|ますか/)) {
      this.analysis.communicationStyle.questions++;
    }
    
    if (content.match(/いいね|素晴らし|すご|完璧|Good|うまく/)) {
      this.analysis.communicationStyle.feedback++;
    }
    
    if (content.match(/ありがとう|感謝|助かり/)) {
      this.analysis.communicationStyle.appreciation++;
    }
    
    if (content.match(/して|ください|お願い|頼む|やって/) && !content.includes('？')) {
      this.analysis.communicationStyle.instructions++;
    }
    
    if (content.match(/エラー|問題|できない|うまくいかない|失敗/)) {
      this.analysis.communicationStyle.reports++;
    }
  }

  analyzeInputMethod(content) {
    if (typeof content !== 'string') return;
    
    // 音声入力の特徴
    if (content.match(/^[ぁ-んー]{1,10}$/) || // 単純なひらがな
        content.match(/^[あ-ん]{1,5}[。、]?$/) || // 短い発話
        content.includes('えーっと') ||
        content.includes('あのー')) {
      this.analysis.inputMethod.voice++;
    } else {
      this.analysis.inputMethod.typing++;
    }
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
    
    const words = content.split(/[\s　、。！？,.!?\n\r;:(){}[\]"'`]+/);
    
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

  // 正規化（実際の会話数を考慮した現実的な値に）
  normalizeScores() {
    // 338会話での実際の値を保持しつつ、10段階評価用に調整
    // 正規化は行わず、実際の累積値を使用することで、より現実的な評価を実現
    // 各項目の値は analyzePersonality で既に適切にスケーリングされている
  }

  generateHTML() {
    const nicknames = this.generateNicknames();
    const powerProRatings = this.generatePowerProRatings();
    const compatibility = this.calculateClaudeCompatibility();
    
    // 最新の会話サンプル
    const recentConversations = this.analysis.conversations
      .slice(-5)
      .reverse()
      .map(conv => {
        const preview = conv.content.length > 200 
          ? conv.content.substring(0, 200) + '...' 
          : conv.content;
        return `
                    <div class="conversation-item">
                        <div class="conversation-time">${new Date(conv.timestamp).toLocaleString('ja-JP')}</div>
                        <div>${preview}</div>
                    </div>
                `;
      }).join('\n');
    
    // よく使う言葉TOP10
    const topKeywords = Object.entries(this.analysis.keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => `<div class="keyword">${word}<span>(${count}回)</span></div>`)
      .join('');
    
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Companion - 実際の会話分析</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            text-align: center;
            color: #667eea;
            margin-bottom: 40px;
            font-size: 2.5em;
        }
        
        .section {
            margin-bottom: 40px;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .section h2 {
            color: #764ba2;
            margin-bottom: 20px;
            font-size: 1.8em;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .stat-card h3 {
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .stat-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #764ba2;
        }
        
        .excluded-stats {
            background: #ffebee;
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
        }
        
        .excluded-stats h4 {
            color: #c62828;
            margin-bottom: 10px;
        }
        
        .nickname-container {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .nickname {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 30px;
            border-radius: 30px;
            font-size: 1.2em;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        /* パワプロ風カード */
        .pawapuro-card {
            background: #f0f8ff;
            border: 3px solid #2c5aa0;
            border-radius: 10px;
            overflow: hidden;
            max-width: 800px;
            margin: 0 auto;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .pawapuro-header {
            background: linear-gradient(to bottom, #2c5aa0, #1e3a6f);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .player-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .player-name {
            font-size: 1.5em;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .player-number {
            background: #ffd700;
            color: #1e3a6f;
            padding: 5px 10px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 1.2em;
        }
        
        .player-stats {
            text-align: center;
        }
        
        .stats-value {
            display: block;
            font-size: 1.1em;
            font-weight: bold;
            margin-top: 5px;
        }
        
        .position {
            text-align: center;
        }
        
        .position-value {
            display: inline-block;
            background: white;
            color: #1e3a6f;
            width: 40px;
            height: 40px;
            line-height: 40px;
            border-radius: 50%;
            font-weight: bold;
            font-size: 1.3em;
            margin-top: 5px;
        }
        
        .pawapuro-body {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 20px;
            padding: 20px;
            background: white;
        }
        
        .basic-abilities {
            background: #f8f8f8;
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 15px;
        }
        
        .ability-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .ability-row:last-child {
            border-bottom: none;
        }
        
        .ability-name {
            font-weight: bold;
            color: #333;
        }
        
        .ability-rating {
            text-align: center;
            font-size: 1.5em;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 4px;
        }
        
        .rating-s { background: #ff69b4; color: white; }
        .rating-a { background: #ff4500; color: white; }
        .rating-b { background: #ffa500; color: white; }
        .rating-c { background: #ffff00; color: #333; }
        .rating-d { background: #90ee90; color: #333; }
        .rating-e { background: #87ceeb; color: #333; }
        .rating-f { background: #dda0dd; color: #333; }
        .rating-g { background: #d3d3d3; color: #333; }
        
        .ability-value {
            text-align: right;
            font-size: 1.2em;
            font-weight: bold;
            color: #1e3a6f;
        }
        
        .special-abilities {
            background: #f8f8f8;
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 15px;
        }
        
        .abilities-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }
        
        .ability-item {
            padding: 8px 12px;
            border-radius: 15px;
            font-size: 0.9em;
            font-weight: bold;
            text-align: center;
            border: 2px solid transparent;
            cursor: default;
        }
        
        .ability-item.positive {
            background: #4169e1;
            color: white;
            border-color: #1e3a6f;
        }
        
        .ability-item.negative {
            background: #dc143c;
            color: white;
            border-color: #8b0000;
        }
        
        .ability-item.unique {
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            color: #333;
            border-color: #daa520;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        
        .keyword-cloud {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 20px;
        }
        
        .keyword {
            background: #e3f2fd;
            color: #1976d2;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 1.1em;
        }
        
        .keyword span {
            font-size: 0.8em;
            color: #666;
            margin-left: 5px;
        }
        
        #timeChart {
            width: 100% !important;
            height: 300px !important;
        }
        
        .conversation-samples {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .conversation-item {
            background: white;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .conversation-time {
            font-size: 0.8em;
            color: #666;
            margin-bottom: 5px;
        }
        
        .compatibility-meter {
            width: 100%;
            height: 40px;
            background: #e0e0e0;
            border-radius: 20px;
            overflow: hidden;
            margin: 20px 0;
            position: relative;
        }
        
        .compatibility-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff6b6b, #ffd93d, #51cf66);
            transition: width 1s ease;
        }
        
        .compatibility-text {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: 1.5em;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Claude Companion - 実際の会話分析</h1>
        
        <div class="section">
            <h2>📊 分析統計</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>総メッセージ数</h3>
                    <div class="value">${this.analysis.totalMessages.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <h3>実際の会話</h3>
                    <div class="value">${this.analysis.actualConversations.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <h3>会話の割合</h3>
                    <div class="value">${((this.analysis.actualConversations / this.analysis.totalMessages) * 100).toFixed(1)}%</div>
                </div>
            </div>
            
            <div class="excluded-stats">
                <h4>除外されたメッセージ</h4>
                <p>ツール結果: ${this.analysis.excludedMessages.toolResults}件</p>
                <p>コマンド: ${this.analysis.excludedMessages.commands}件</p>
                <p>エラーログ: ${this.analysis.excludedMessages.errorLogs}件</p>
                <p>システムメッセージ: ${this.analysis.excludedMessages.systemMessages}件</p>
            </div>
        </div>
        
        <div class="section">
            <h2>🗣️ コミュニケーションスタイル</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>質問</h3>
                    <div class="value">${this.analysis.communicationStyle.questions}</div>
                </div>
                <div class="stat-card">
                    <h3>フィードバック</h3>
                    <div class="value">${this.analysis.communicationStyle.feedback}</div>
                </div>
                <div class="stat-card">
                    <h3>感謝の表現</h3>
                    <div class="value">${this.analysis.communicationStyle.appreciation}</div>
                </div>
                <div class="stat-card">
                    <h3>指示・依頼</h3>
                    <div class="value">${this.analysis.communicationStyle.instructions}</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🏷️ あなたのあだ名</h2>
            <div class="nickname-container">
                ${nicknames.map(n => `<div class="nickname">${n}</div>`).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>⚾ パワプロ風能力評価</h2>
            <div class="pawapuro-card">
                <div class="pawapuro-header">
                    <div class="player-info">
                        <span class="player-name">${nicknames[0]}</span>
                        <span class="player-number">#1</span>
                    </div>
                    <div class="player-stats">
                        <span>成績</span>
                        <span class="stats-value">率 ${powerProRatings.userStats.efficiency}% ${powerProRatings.userStats.conversations}本 ${powerProRatings.userStats.messages}点</span>
                    </div>
                    <div class="position">
                        <span class="position-label">守備位置</span>
                        <span class="position-value">会</span>
                    </div>
                </div>
                
                <div class="pawapuro-body">
                    <div class="basic-abilities">
                        ${Object.entries(powerProRatings.ratings).map(([name, rating]) => `
                            <div class="ability-row">
                                <span class="ability-name">${name}</span>
                                <span class="ability-rating rating-${rating.letter.toLowerCase()}">${rating.letter}</span>
                                <span class="ability-value">${rating.value}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="special-abilities">
                        <div class="abilities-grid">
                            ${powerProRatings.specialAbilities.positive.map(a => `<div class="ability-item positive">${a}</div>`).join('')}
                            ${powerProRatings.specialAbilities.negative.map(a => `<div class="ability-item negative">${a}</div>`).join('')}
                            ${powerProRatings.specialAbilities.unique.map(a => `<div class="ability-item unique">${a}</div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>💝 Claude相性度</h2>
            <div class="compatibility-meter">
                <div class="compatibility-fill" style="width: ${compatibility}%"></div>
                <div class="compatibility-text">${compatibility}%</div>
            </div>
            <p style="text-align: center; margin-top: 20px; font-size: 1.2em;">
                ${compatibility >= 80 ? '🌟 素晴らしい相性！最高のパートナーです！' :
                  compatibility >= 60 ? '🌸 良い関係を築けています！これからも一緒に成長しましょう。' :
                  '🌱 これから深まる関係！もっと会話を楽しみましょう。'}
            </p>
        </div>
        
        <div class="section">
            <h2>📝 よく使う言葉 TOP10</h2>
            <div class="keyword-cloud">
                ${topKeywords}
            </div>
        </div>
        
        <div class="section">
            <h2>⏰ 活動時間帯</h2>
            <div style="max-width: 800px; margin: 0 auto;">
                <canvas id="timeChart"></canvas>
            </div>
        </div>
        
        <div class="section">
            <h2>💬 最近の会話サンプル</h2>
            <div class="conversation-samples">
                ${recentConversations}
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // 時間帯グラフ
        const timeCtx = document.getElementById('timeChart').getContext('2d');
        const timeData = ${JSON.stringify(this.analysis.timePatterns)};
        
        const hours = [];
        const counts = [];
        for (let i = 0; i < 24; i++) {
            hours.push(i + '時');
            counts.push(timeData[i] || 0);
        }
        
        new Chart(timeCtx, {
            type: 'bar',
            data: {
                labels: hours,
                datasets: [{
                    label: '会話数',
                    data: counts,
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(102, 126, 234, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '会話数'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '時刻'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    </script>
</body>
</html>`;
    
    return html;
  }

  // プロジェクト統計
  getProjectStats() {
    const projectFiles = this.findClaudeProjects();
    const projectStats = [];
    
    projectFiles.forEach(file => {
      const projectName = file.project;
      if (!projectStats.find(p => p.name === projectName)) {
        projectStats.push({
          name: projectName,
          fileCount: projectFiles.filter(f => f.project === projectName).length,
          totalSize: projectFiles.filter(f => f.project === projectName)
            .reduce((sum, f) => sum + f.size, 0)
        });
      }
    });
    
    return projectStats.sort((a, b) => b.totalSize - a.totalSize);
  }

  async run() {
    console.log(`🤖 Claude Companion - 実際の会話分析
==============================================

実際の会話のみを対象に分析します。
${this.options.japaneseOnly ? '📝 日本語キーワードのみモード' : '📝 全言語キーワードモード'}
`);

    const projectFiles = this.findClaudeProjects();
    
    if (projectFiles.length === 0) {
      console.log('❌ Claude Codeのログファイルが見つかりませんでした。');
      return;
    }

    const projectStats = this.getProjectStats();
    console.log(`
📁 ${projectFiles.length}個のファイルを発見
📊 ${projectStats.length}個のプロジェクト`);
    
    const filesToAnalyze = projectFiles.slice(0, 10);
    
    console.log('\n分析中...');
    filesToAnalyze.forEach((file, index) => {
      console.log(`  ${index + 1}/${filesToAnalyze.length}: ${file.file} (${(file.size / 1024).toFixed(1)}KB)`);
      this.analyzeFile(file.path);
    });
    
    this.normalizeScores();
    
    console.log(`
✨ 分析完了！
  総メッセージ数: ${this.analysis.totalMessages}
  実際の会話数: ${this.analysis.actualConversations}
  会話の割合: ${((this.analysis.actualConversations / this.analysis.totalMessages) * 100).toFixed(1)}%

📊 除外されたメッセージ:
  ツール結果: ${this.analysis.excludedMessages.toolResults}件
  コマンド: ${this.analysis.excludedMessages.commands}件
  エラーログ: ${this.analysis.excludedMessages.errorLogs}件
  システムメッセージ: ${this.analysis.excludedMessages.systemMessages}件`);
    
    // HTMLファイルを生成
    const html = this.generateHTML();
    const outputPath = path.join(__dirname, 'claude-conversation-analysis.html');
    fs.writeFileSync(outputPath, html, 'utf8');
    
    console.log(`
📄 HTMLレポートを生成しました: ${outputPath}

💡 ブラウザで開くには:
   open ${outputPath}  (Mac)
   start ${outputPath} (Windows)
   xdg-open ${outputPath} (Linux)
`);
    
    // ローカルサーバーで開く
    this.startLocalServer(outputPath);
  }

  startLocalServer(filePath) {
    const server = http.createServer((req, res) => {
      if (req.url === '/') {
        const html = fs.readFileSync(filePath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
    
    const port = 8888;
    server.listen(port, () => {
      console.log(`
🌐 ローカルサーバーを起動しました: http://localhost:${port}
   (Ctrl+C で終了)`);
    });
  }
}

// CLI実行
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  if (args.includes('--japanese-only') || args.includes('-j')) {
    options.japaneseOnly = true;
  }
  
  const analyzer = new ClaudeConversationAnalyzer(options);
  analyzer.run().catch(console.error);
}

module.exports = ClaudeConversationAnalyzer;