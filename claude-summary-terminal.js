#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

class ClaudeSummaryTerminal {
  constructor(options = {}) {
    this.options = {
      japaneseOnly: options.japaneseOnly || false,
      ...options
    };
    
    this.analysis = {
      totalMessages: 0,
      userMessages: 0,
      rawUserMessages: 0, // グループ化前の生メッセージ数
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
        directCommands: 0,
        questions: 0,
        feedback: 0,
        appreciation: 0
      },
      keywords: {},
      timePatterns: {},
      projectStats: {},
      memorableMoments: []
    };
  }

  // あだ名生成機能
  generateNickname() {
    const { personality } = this.analysis;
    
    // 最も高い性格特性を取得
    const sortedTraits = Object.entries(personality)
      .sort(([,a], [,b]) => b - a);
    
    const topTrait = sortedTraits[0];
    const secondTrait = sortedTraits[1];
    
    const nicknames = [];
    
    // メイン特性に基づくあだ名
    const traitNames = {
      politeness: ['礼儀正しい', '丁寧な', 'ジェントル'],
      technical: ['テクニカル', 'エンジニア', 'コード'],
      patience: ['忍耐強い', '根気のある', 'じっくり'],
      curiosity: ['好奇心旺盛な', '探究心のある', '質問好きな'],
      collaboration: ['協力的な', 'チームワークの', '助け合いの'],
      emotion: ['感情豊かな', '表現力のある', 'ハートフル'],
      creativity: ['創造的な', 'クリエイティブな', 'アイデア豊富な'],
      humor: ['ユーモアのある', '楽しい', '明るい']
    };
    
    const secondaryNames = {
      politeness: ['紳士', 'マナー人', 'ポライトさん'],
      technical: ['マスター', 'ハッカー', 'デベロッパー'],
      patience: ['修行者', '職人', 'マイスター'],
      curiosity: ['探検家', '研究者', 'なぜなぜ博士'],
      collaboration: ['パートナー', 'バディ', 'チームメイト'],
      emotion: ['アーティスト', 'エモーショナー', 'ハート'],
      creativity: ['イノベーター', 'クリエイター', 'アイデアマン'],
      humor: ['コメディアン', 'ジョーカー', 'スマイル']
    };
    
    // 3つの候補を生成
    if (topTrait[1] > 5) {
      const primary = traitNames[topTrait[0]];
      const secondary = secondaryNames[secondTrait[0]];
      
      nicknames.push(`${primary[0]}${secondary[0]}`);
      nicknames.push(`${primary[1]}${secondary[1]}`);
      nicknames.push(`${primary[2]}${secondary[2]}`);
    } else {
      nicknames.push('バランス型プログラマー');
      nicknames.push('オールラウンダー');
      nicknames.push('マルチタレント');
    }
    
    return nicknames;
  }

  // パワプロ風評価
  generatePowerProRatings() {
    const { personality, userMessages, communicationStyle } = this.analysis;
    
    const getRating = (value) => {
      if (value >= 9) return 'S';
      if (value >= 8) return 'A';
      if (value >= 7) return 'B';
      if (value >= 6) return 'C';
      if (value >= 5) return 'D';
      if (value >= 4) return 'E';
      if (value >= 3) return 'F';
      return 'G';
    };
    
    // 各能力の評価
    const ratings = {
      '活動量': getRating(Math.min(10, userMessages / 100)),
      'コミュ力': getRating((personality.politeness + personality.emotion) / 2),
      '技術力': getRating(personality.technical),
      '忍耐力': getRating(personality.patience),
      '創造性': getRating((personality.creativity + personality.curiosity) / 2),
      'チーム力': getRating(personality.collaboration),
      '効率性': getRating(Math.min(10, communicationStyle.directCommands / 10))
    };
    
    // 特殊能力
    const specialAbilities = [];
    
    if (personality.politeness > 8) specialAbilities.push('◎礼儀正しさマスター');
    if (personality.technical > 8) specialAbilities.push('◎技術探究者');
    if (personality.patience > 8) specialAbilities.push('◎鉄の忍耐');
    if (personality.collaboration > 8) specialAbilities.push('◎チームプレイヤー');
    if (communicationStyle.appreciation > 20) specialAbilities.push('◎感謝の達人');
    if (communicationStyle.questions > 50) specialAbilities.push('◎質問の鬼');
    
    return { ratings, specialAbilities };
  }

  // Claude相性診断
  calculateClaudeCompatibility() {
    const { personality, communicationStyle } = this.analysis;
    
    let points = 50;
    points += personality.politeness * 3;
    points += personality.collaboration * 2.5;
    points += Math.min(20, communicationStyle.appreciation * 2);
    points += personality.patience * 1.5;
    
    return Math.min(100, Math.round(points));
  }

  // ソースコードかどうかを判定
  isSourceCode(content) {
    // contentが文字列でない場合は false を返す
    if (typeof content !== 'string') return false;
    
    // コードブロックのマーカー
    if (content.includes('```')) return true;
    
    // 複数行のコード特徴
    const lines = content.split('\n');
    if (lines.length > 5) {
      let codeIndicators = 0;
      
      // インデントの多い行
      const indentedLines = lines.filter(line => line.match(/^[\s\t]{2,}/)).length;
      if (indentedLines > lines.length * 0.5) codeIndicators++;
      
      // プログラミング記号の頻度
      const codeSymbols = (content.match(/[{}()[\];=><]/g) || []).length;
      const totalChars = content.length;
      if (codeSymbols / totalChars > 0.05) codeIndicators++;
      
      // 関数・変数定義のパターン
      const definitions = (content.match(/\b(function|const|let|var|class|def|import|export)\b/g) || []).length;
      if (definitions > 3) codeIndicators++;
      
      // コメント行
      const commentLines = lines.filter(line => 
        line.trim().startsWith('//') || 
        line.trim().startsWith('#') || 
        line.trim().startsWith('/*') ||
        line.trim().startsWith('*')
      ).length;
      if (commentLines > 2) codeIndicators++;
      
      // 3つ以上の指標が該当したらソースコードと判定
      if (codeIndicators >= 3) return true;
    }
    
    // 1行でも明らかにコードの場合
    if (content.match(/^(import|export|function|class|const|let|var)\s+\w+/)) return true;
    
    // HTMLタグの連続
    if ((content.match(/<[^>]+>/g) || []).length > 5) return true;
    
    // CSSプロパティの連続
    if (content.match(/[\w-]+:\s*[\w\s,()#%-]+;/g)?.length > 3) return true;
    
    return false;
  }

  // メッセージのグループ化を判定
  shouldGroupWithPrevious(currentMsg, previousMsg, timeDiff) {
    if (!previousMsg) return false;
    
    // 時間差が1分以内
    if (timeDiff > 60000) return false; // 60秒以上離れていたら別メッセージ
    
    const current = currentMsg.message?.content || '';
    const previous = previousMsg.message?.content || '';
    
    // 文字列でない場合は false を返す
    if (typeof current !== 'string' || typeof previous !== 'string') return false;
    
    // 両方がエラーログやスタックトレースを含む
    if ((current.includes('Error') || current.includes('error') || current.includes('エラー')) &&
        (previous.includes('Error') || previous.includes('error') || previous.includes('エラー'))) {
      return true;
    }
    
    // 連続したコードブロック
    if (this.isSourceCode(current) && this.isSourceCode(previous)) {
      return true;
    }
    
    // ログの続きのパターン
    if (current.match(/^\s*at\s+/) || current.match(/^\s*\d+\s*\|/) || 
        current.match(/^[\s\t]+/) || current.match(/^\s*File\s+"/)) {
      return true;
    }
    
    // 短いコマンドの連続実行
    if (current.length < 30 && previous.length < 30 && 
        current.match(/^(npx|node|npm|git)\s/) && previous.match(/^(npx|node|npm|git)\s/)) {
      return true;
    }
    
    return false;
  }

  // ファイル分析
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    const messages = [];
    
    // まず全メッセージをパース
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.type === 'user' && data.message && data.message.content) {
          messages.push(data);
        }
        this.analysis.totalMessages++;
      } catch (e) {
        // skip
      }
    }
    
    // メッセージをグループ化して処理
    let previousMsg = null;
    let previousTime = null;
    let groupedMessageCount = 0;
    
    for (let i = 0; i < messages.length; i++) {
      const data = messages[i];
      const currentTime = data.timestamp ? new Date(data.timestamp).getTime() : null;
      const timeDiff = previousTime && currentTime ? currentTime - previousTime : Infinity;
      
      // 生のメッセージ数をカウント
      this.analysis.rawUserMessages++;
      
      // 前のメッセージとグループ化すべきか判定
      const shouldGroup = this.shouldGroupWithPrevious(data, previousMsg, timeDiff);
      
      if (!shouldGroup) {
        // 新しいメッセージグループとしてカウント
        groupedMessageCount++;
        this.analysis.userMessages++;
        
        // 時刻パターン（グループの最初のメッセージの時刻を使用）
        if (data.timestamp) {
          const hour = new Date(data.timestamp).getHours();
          this.analysis.timePatterns[hour] = (this.analysis.timePatterns[hour] || 0) + 1;
        }
      }
      
      const messageContent = data.message.content;
      
      // ソースコードかどうかチェック
      const isCode = this.isSourceCode(messageContent);
      
      // 性格分析（ソースコードでも実行）
      this.analyzePersonality(messageContent);
      
      // コミュニケーションスタイル分析（ソースコードでも実行）
      this.analyzeCommunicationStyle(messageContent);
      
      // キーワード抽出（ソースコードの場合は除外）
      if (!isCode) {
        this.extractKeywords(messageContent);
      }
      
      previousMsg = data;
      previousTime = currentTime;
    }
  }

  analyzePersonality(content) {
    // 文字列でない場合はスキップ
    if (typeof content !== 'string') return;
    
    // 丁寧さ
    if (content.match(/ありがとう|お願い|すみません|よろしく/)) {
      this.analysis.personality.politeness += 0.3;
    }
    
    // 技術力
    if (content.match(/function|class|API|コード|プログラム|実装|デバッグ/i)) {
      this.analysis.personality.technical += 0.2;
    }
    
    // 忍耐力
    if (content.match(/もう一度|再度|やり直|試して|続け/)) {
      this.analysis.personality.patience += 0.4;
    }
    
    // 好奇心
    if (content.match(/どう|なぜ|どのように|？|教えて/)) {
      this.analysis.personality.curiosity += 0.3;
    }
    
    // 協調性
    if (content.match(/一緒に|協力|手伝|お互い/)) {
      this.analysis.personality.collaboration += 0.4;
    }
    
    // 感情表現
    if (content.match(/！|笑|嬉し|楽し|すご|最高/)) {
      this.analysis.personality.emotion += 0.2;
    }
    
    // 創造性
    if (content.match(/アイデア|面白|新しい|思いつ|どうかな/)) {
      this.analysis.personality.creativity += 0.3;
    }
    
    // ユーモア
    if (content.match(/笑|ｗ|草|冗談|面白/)) {
      this.analysis.personality.humor += 0.3;
    }
  }

  analyzeCommunicationStyle(content) {
    // 文字列でない場合はスキップ
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

  extractKeywords(content) {
    // 文字列でない場合はスキップ
    if (typeof content !== 'string') return;
    
    // プログラミング関連の一般的な単語を除外リスト（拡張版）
    const programmingTerms = new Set([
      // 変数名でよく使われる単語
      'data', 'item', 'value', 'key', 'index', 'result', 'error', 'message',
      'name', 'type', 'status', 'content', 'response', 'request', 'config',
      'options', 'params', 'args', 'props', 'state', 'context', 'user',
      'info', 'list', 'array', 'object', 'element', 'node', 'target',
      // 一般的なプログラミング用語
      'function', 'class', 'method', 'variable', 'constant', 'return',
      'true', 'false', 'null', 'undefined', 'string', 'number', 'boolean',
      'array', 'object', 'console', 'log', 'this', 'self', 'that',
      'async', 'await', 'promise', 'callback', 'handler', 'listener',
      'event', 'click', 'change', 'submit', 'load', 'ready', 'init',
      // よく見るプログラミング単語
      'initialize', 'anonymous', 'localhost', 'manager', 'controller',
      'service', 'factory', 'provider', 'module', 'component', 'widget',
      'helper', 'util', 'utils', 'common', 'shared', 'global', 'local',
      'public', 'private', 'static', 'final', 'abstract', 'interface',
      // エラー関連
      'errorhandler', 'exception', 'throw', 'catch', 'finally', 'try',
      // Web開発関連
      'http', 'https', 'url', 'uri', 'api', 'rest', 'graphql', 'ajax',
      'fetch', 'post', 'get', 'put', 'delete', 'patch', 'header', 'body',
      // HTMLタグ名
      'div', 'span', 'button', 'input', 'form', 'table', 'body', 'html',
      'head', 'style', 'script', 'link', 'meta', 'title', 'section',
      'article', 'nav', 'footer', 'header', 'main', 'aside', 'figure'
    ]);
    
    // 日本語の一般的な助詞や接続詞を拡張
    const japaneseStopWords = new Set([
      'です', 'ます', 'する', 'ある', 'なる', 'これ', 'それ', 'あれ',
      'この', 'その', 'あの', 'どの', 'こと', 'もの', 'ため', 'よう',
      'から', 'まで', 'より', 'ほど', 'など', 'とき', 'ところ', 'もの',
      'という', 'といい', 'といった', 'として', 'にて', 'において',
      'について', 'にとって', 'によって', 'のように', 'ように'
    ]);
    
    // 文を分割（句読点、スペース、改行など）
    const words = content.split(/[\s\u3000、。！？,.!?\n\r;:(){}[\]"'`]+/);
    
    words.forEach(word => {
      // 記号を除去してクリーンな単語を取得
      const cleanWord = word.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '');
      
      // プログラミング関連の複合語をチェック
      const isProgrammingCompound = (word) => {
        const lowerWord = word.toLowerCase();
        // manager, handler, controller などで終わる単語
        if (lowerWord.endsWith('manager') || lowerWord.endsWith('handler') || 
            lowerWord.endsWith('controller') || lowerWord.endsWith('service') ||
            lowerWord.endsWith('provider') || lowerWord.endsWith('factory')) {
          return true;
        }
        // UI, API などの略語を含む
        if (lowerWord.includes('ui') || lowerWord.includes('api') || 
            lowerWord.includes('db') || lowerWord.includes('sql')) {
          return true;
        }
        return false;
      };
      
      // 単語の妥当性チェック
      if (cleanWord.length > 2 && cleanWord.length < 20 && // 長さ制限
          !cleanWord.match(/^[0-9]+$/) && // 数字のみは除外
          !cleanWord.match(/^[a-z]{1,2}$/i) && // 1-2文字の英単語は除外
          !programmingTerms.has(cleanWord.toLowerCase()) && // プログラミング用語除外
          !japaneseStopWords.has(cleanWord) && // 日本語ストップワード除外
          !cleanWord.match(/^[A-Z][a-z]+[A-Z]/) && // CamelCaseは除外
          !isProgrammingCompound(cleanWord) // プログラミング複合語を除外
      ) {
        // 日本語のみモードの場合
        if (this.options.japaneseOnly) {
          // 日本語を含む単語のみカウント
          if (cleanWord.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
            this.analysis.keywords[cleanWord] = (this.analysis.keywords[cleanWord] || 0) + 1;
          }
        } else {
          // 通常モード：日本語の単語か、意味のある英単語をカウント
          if (cleanWord.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/) || // 日本語
              (cleanWord.match(/^[A-Z][a-z]+$/) && !isProgrammingCompound(cleanWord))) { // Capitalized英単語（プログラミング用語以外）
            this.analysis.keywords[cleanWord] = (this.analysis.keywords[cleanWord] || 0) + 1;
          }
        }
      }
    });
  }

  normalizeScores() {
    const userMessages = Math.max(1, this.analysis.userMessages);
    
    Object.keys(this.analysis.personality).forEach(key => {
      this.analysis.personality[key] = Math.min(10, this.analysis.personality[key] / userMessages * 20);
    });
  }

  generateHTML() {
    const nicknames = this.generateNickname();
    const powerProRatings = this.generatePowerProRatings();
    const compatibility = this.calculateClaudeCompatibility();
    
    // よく使うキーワードTOP10
    const topKeywords = Object.entries(this.analysis.keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    // 活動時間帯TOP3
    const topHours = Object.entries(this.analysis.timePatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Companion - 分析結果</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
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
            display: flex;
            align-items: center;
            gap: 10px;
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
            transition: transform 0.3s ease;
        }
        
        .nickname:hover {
            transform: translateY(-3px);
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
        
        .rating-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .rating-item {
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        
        .rating-item h4 {
            color: #555;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .rating-bar {
            height: 20px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
        }
        
        .rating-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 1s ease;
        }
        
        .rating-label {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-weight: bold;
            color: white;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .special-abilities {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 20px;
        }
        
        .ability {
            background: #ffd93d;
            color: #333;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            box-shadow: 0 2px 5px rgba(255, 217, 61, 0.3);
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
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .section {
            animation: fadeIn 0.6s ease;
        }
        
        .personality-radar {
            max-width: 400px;
            margin: 20px auto;
        }
        
        #personalityChart {
            width: 100% !important;
            height: auto !important;
        }
        
        #timeChart {
            width: 100% !important;
            height: 300px !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Claude Companion 分析結果</h1>
        
        <div class="section">
            <h2>📊 基本統計</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>総メッセージ数</h3>
                    <div class="value">${this.analysis.totalMessages.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <h3>実際の会話数</h3>
                    <div class="value">${this.analysis.userMessages.toLocaleString()}</div>
                    <p style="font-size: 0.8em; color: #666; margin-top: 5px;">
                        (生データ: ${this.analysis.rawUserMessages.toLocaleString()})
                    </p>
                </div>
                <div class="stat-card">
                    <h3>質問回数</h3>
                    <div class="value">${this.analysis.communicationStyle.questions}</div>
                </div>
                <div class="stat-card">
                    <h3>感謝の表現</h3>
                    <div class="value">${this.analysis.communicationStyle.appreciation}</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🏷️ あなたのあだ名</h2>
            <div class="nickname-container">
                ${nicknames.map(name => `<div class="nickname">${name}</div>`).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>⚾ パワプロ風能力評価</h2>
            <div class="rating-container">
                ${Object.entries(powerProRatings.ratings).map(([ability, rating]) => {
                    const ratingValue = {'S': 100, 'A': 87.5, 'B': 75, 'C': 62.5, 'D': 50, 'E': 37.5, 'F': 25, 'G': 12.5}[rating];
                    return `
                    <div class="rating-item">
                        <h4>${ability}</h4>
                        <div class="rating-bar">
                            <div class="rating-fill" style="width: ${ratingValue}%"></div>
                            <div class="rating-label">${rating}</div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
            
            ${powerProRatings.specialAbilities.length > 0 ? `
            <h3 style="margin-top: 30px; color: #764ba2;">特殊能力</h3>
            <div class="special-abilities">
                ${powerProRatings.specialAbilities.map(ability => `<div class="ability">${ability}</div>`).join('')}
            </div>
            ` : ''}
        </div>
        
        <div class="section">
            <h2>💝 Claude相性度</h2>
            <div class="compatibility-meter">
                <div class="compatibility-fill" style="width: ${compatibility}%"></div>
                <div class="compatibility-text">${compatibility}%</div>
            </div>
            <p style="text-align: center; margin-top: 20px; font-size: 1.2em;">
                ${compatibility >= 90 ? '✨ 最高の相性！Claudeはあなたとの会話が大好きです！' :
                  compatibility >= 75 ? '😊 とても良い相性！楽しく協力できる関係です。' :
                  compatibility >= 60 ? '👍 良い相性！お互いを理解し合える関係です。' :
                  '🌱 これから深まる関係！もっと会話を楽しみましょう。'}
            </p>
        </div>
        
        <div class="section">
            <h2>🎯 性格分析</h2>
            <div class="personality-radar">
                <canvas id="personalityChart"></canvas>
            </div>
        </div>
        
        <div class="section">
            <h2>📝 よく使う言葉 TOP10</h2>
            <div class="keyword-cloud">
                ${topKeywords.map(([word, count]) => 
                    `<div class="keyword">${word}<span>(${count}回)</span></div>`
                ).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>⏰ 活動時間帯</h2>
            <div style="max-width: 800px; margin: 0 auto;">
                <canvas id="timeChart"></canvas>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // 性格レーダーチャート
        const ctx = document.getElementById('personalityChart').getContext('2d');
        const personalityData = ${JSON.stringify(this.analysis.personality)};
        
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['丁寧さ', '技術力', '忍耐力', '好奇心', '協調性', '感情表現', '創造性', 'ユーモア'],
                datasets: [{
                    label: 'あなたの性格',
                    data: [
                        personalityData.politeness,
                        personalityData.technical,
                        personalityData.patience,
                        personalityData.curiosity,
                        personalityData.collaboration,
                        personalityData.emotion,
                        personalityData.creativity,
                        personalityData.humor
                    ],
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 2
                        }
                    }
                }
            }
        });
        
        // アニメーション
        document.querySelectorAll('.rating-fill').forEach((el, index) => {
            setTimeout(() => {
                el.style.width = el.style.width;
            }, index * 100);
        });
        
        // 時間帯グラフ
        const timeCtx = document.getElementById('timeChart').getContext('2d');
        const timeData = ${JSON.stringify(this.analysis.timePatterns)};
        
        // 0-23時のデータを準備
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
                    label: 'メッセージ数',
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
                            text: 'メッセージ数'
                        },
                        ticks: {
                            stepSize: 10
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + '回';
                            }
                        }
                    }
                }
            }
        });
        
        document.querySelector('.compatibility-fill').style.width = '${compatibility}%';
    </script>
</body>
</html>`;
  }

  saveHTML(htmlContent) {
    const outputPath = path.join(process.cwd(), 'claude-analysis-result.html');
    fs.writeFileSync(outputPath, htmlContent);
    return outputPath;
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
        
        // プロジェクト統計
        this.analysis.projectStats[dir] = files.filter(f => f.endsWith('.jsonl')).length;
      }
    });
    
    return projects.sort((a, b) => b.size - a.size);
  }

  async run() {
    console.log(`
🤖 Claude Companion - ターミナル版サマリー機能
==============================================

Claude Codeのログファイルを分析してHTMLレポートを生成します。
${this.options.japaneseOnly ? '📝 日本語キーワードのみモード' : '📝 全言語キーワードモード'}
`);

    const projectFiles = this.findClaudeProjects();
    
    if (projectFiles.length === 0) {
      console.log('❌ Claude Codeのログファイルが見つかりませんでした。');
      return;
    }

    console.log(`\n📁 ${projectFiles.length}個のファイルを発見`);
    console.log(`📊 ${Object.keys(this.analysis.projectStats).length}個のプロジェクト\n`);
    
    // 最大10ファイルを分析（大きいものから）
    const filesToAnalyze = projectFiles.slice(0, 10);
    
    console.log('分析中...');
    filesToAnalyze.forEach((file, index) => {
      console.log(`  ${index + 1}/${filesToAnalyze.length}: ${file.file} (${(file.size / 1024).toFixed(1)}KB)`);
      this.analyzeFile(file.path);
    });
    
    this.normalizeScores();
    
    console.log('\n✨ 分析完了！');
    console.log(`  総メッセージ数: ${this.analysis.totalMessages}`);
    console.log(`  実際の会話数: ${this.analysis.userMessages} (グループ化後)`);
    console.log(`  生のメッセージ数: ${this.analysis.rawUserMessages} (グループ化前)`);
    
    // HTML生成と保存
    const htmlContent = this.generateHTML();
    const outputPath = this.saveHTML(htmlContent);
    
    console.log(`\n📄 HTMLレポートを生成しました: ${outputPath}`);
    console.log('\n💡 ブラウザで開くには:');
    console.log(`   open ${outputPath}  (Mac)`);
    console.log(`   start ${outputPath} (Windows)`);
    console.log(`   xdg-open ${outputPath} (Linux)\n`);
    
    // 自動的にブラウザで開く（オプション）
    if (this.options.autoOpen) {
      const { exec } = require('child_process');
      const command = process.platform === 'darwin' ? 'open' :
                     process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${command} ${outputPath}`);
      console.log('🌐 ブラウザで開いています...\n');
    }
  }
}

// CLI実行
if (require.main === module) {
  // コマンドライン引数を解析
  const args = process.argv.slice(2);
  const options = {};
  
  // --japanese-only または -j オプションをチェック
  if (args.includes('--japanese-only') || args.includes('-j')) {
    options.japaneseOnly = true;
  }
  
  // --open オプションをチェック
  if (args.includes('--open')) {
    options.autoOpen = true;
  }
  
  const analyzer = new ClaudeSummaryTerminal(options);
  analyzer.run().catch(console.error);
}

module.exports = ClaudeSummaryTerminal;