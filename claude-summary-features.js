#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

class ClaudeSummaryAnalyzer {
  constructor() {
    this.analysis = {
      totalMessages: 0,
      userMessages: 0,
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
      projectActivity: {},
      memorableMoments: []
    };
  }

  // あだ名生成機能
  generateNickname() {
    const { personality, inputMethod, communicationStyle } = this.analysis;
    
    // 性格特性に基づく基本的なあだ名要素
    const traits = [];
    
    // 最も高い性格特性を取得
    const topTrait = Object.entries(personality)
      .sort(([,a], [,b]) => b - a)[0];
    
    // 丁寧さベース
    if (topTrait[0] === 'politeness' && topTrait[1] > 7) {
      traits.push(['紳士', '礼儀正しい', 'ジェントル', '丁寧な']);
    }
    
    // 技術力ベース
    if (personality.technical > 7) {
      traits.push(['テック', 'ハッカー', 'コード', 'デジタル']);
    }
    
    // 好奇心ベース
    if (personality.curiosity > 7) {
      traits.push(['探検家', '冒険者', 'キュリオス', '探究者']);
    }
    
    // 協調性ベース
    if (personality.collaboration > 7) {
      traits.push(['チーム', 'パートナー', '相棒', 'バディ']);
    }
    
    // 感情表現ベース
    if (personality.emotion > 6) {
      traits.push(['ハート', 'エモ', '情熱的な', 'パッション']);
    }
    
    // ユーモアベース
    if (personality.humor > 5) {
      traits.push(['ユーモラス', 'ジョーカー', '楽しい', 'ファン']);
    }
    
    // 入力方法による修飾
    const inputModifier = inputMethod.voice > inputMethod.typing ? 
      ['ボイス', '話す', 'トーク', 'スピーカー'] : 
      ['タイピング', 'キーボード', 'タイプ', 'ライター'];
    
    // コミュニケーションスタイルによる修飾
    const styleModifier = [];
    if (communicationStyle.questions > communicationStyle.directCommands) {
      styleModifier.push(['質問家', 'なぜなぜ', 'クエスチョン', '疑問符']);
    } else if (communicationStyle.directCommands > communicationStyle.questions) {
      styleModifier.push(['指揮官', 'リーダー', 'ディレクター', 'コマンダー']);
    }
    
    if (communicationStyle.appreciation > 10) {
      styleModifier.push(['感謝の', 'サンキュー', 'ありがとう', 'グレイトフル']);
    }
    
    // ランダムにあだ名を組み合わせる
    const generateName = () => {
      const components = [];
      
      // メイン特性
      if (traits.length > 0) {
        components.push(traits[Math.floor(Math.random() * traits.length)][Math.floor(Math.random() * 4)]);
      }
      
      // 入力方法（30%の確率で追加）
      if (Math.random() < 0.3 && inputModifier.length > 0) {
        components.push(inputModifier[Math.floor(Math.random() * inputModifier.length)]);
      }
      
      // スタイル（40%の確率で追加）
      if (Math.random() < 0.4 && styleModifier.length > 0) {
        const style = styleModifier[Math.floor(Math.random() * styleModifier.length)];
        components.push(style[Math.floor(Math.random() * style.length)]);
      }
      
      // 接尾辞
      const suffixes = ['さん', 'ちゃん', 'くん', 'マスター', '先生', '博士', 'の人', 'er'];
      if (Math.random() < 0.7) {
        components.push(suffixes[Math.floor(Math.random() * suffixes.length)]);
      }
      
      return components.join('');
    };
    
    // 3つの候補を生成
    const nicknames = [];
    for (let i = 0; i < 3; i++) {
      nicknames.push(generateName());
    }
    
    return nicknames;
  }

  // パワプロ風A〜G評価
  generatePowerProRatings() {
    const { personality, inputMethod, communicationStyle, totalMessages } = this.analysis;
    
    // 評価基準（S, A, B, C, D, E, F, G）
    const getRating = (value, thresholds = [9, 8, 7, 6, 5, 4, 2]) => {
      if (value >= thresholds[0]) return 'S';
      if (value >= thresholds[1]) return 'A';
      if (value >= thresholds[2]) return 'B';
      if (value >= thresholds[3]) return 'C';
      if (value >= thresholds[4]) return 'D';
      if (value >= thresholds[5]) return 'E';
      if (value >= thresholds[6]) return 'F';
      return 'G';
    };
    
    // 活動量の評価（メッセージ数ベース）
    const activityRating = getRating(
      Math.min(10, totalMessages / 100),
      [9, 7, 5, 3, 2, 1, 0.5]
    );
    
    // コミュニケーション力（バランスの良さ）
    const commBalance = Math.min(10, 
      (communicationStyle.questions + communicationStyle.feedback + 
       communicationStyle.appreciation) / 10
    );
    const communicationRating = getRating(commBalance);
    
    // 技術力
    const technicalRating = getRating(personality.technical);
    
    // 忍耐力
    const patienceRating = getRating(personality.patience);
    
    // 創造性（好奇心 + 感情表現）
    const creativityScore = Math.min(10, (personality.curiosity + personality.emotion) / 2);
    const creativityRating = getRating(creativityScore);
    
    // 協調性
    const teamworkRating = getRating(personality.collaboration);
    
    // 効率性（タイピング率 + 直接コマンドの使用）
    const efficiency = Math.min(10, 
      (inputMethod.typing / (inputMethod.typing + inputMethod.voice) * 10) * 0.7 +
      (communicationStyle.directCommands / Math.max(1, this.analysis.userMessages) * 10) * 0.3
    );
    const efficiencyRating = getRating(efficiency);
    
    // 総合評価（全評価の平均）
    const ratings = {
      '活動量': activityRating,
      'コミュ力': communicationRating,
      '技術力': technicalRating,
      '忍耐力': patienceRating,
      '創造性': creativityRating,
      'チーム力': teamworkRating,
      '効率性': efficiencyRating
    };
    
    // 総合評価の計算
    const ratingValues = {
      'S': 10, 'A': 8.5, 'B': 7, 'C': 5.5, 'D': 4, 'E': 2.5, 'F': 1, 'G': 0
    };
    
    const totalScore = Object.values(ratings).reduce((sum, rating) => 
      sum + ratingValues[rating], 0
    ) / Object.keys(ratings).length;
    
    const overallRating = getRating(totalScore, [8.5, 7, 5.5, 4, 2.5, 1, 0.5]);
    
    return {
      individual: ratings,
      overall: overallRating,
      specialAbilities: this.generateSpecialAbilities()
    };
  }

  // 特殊能力の生成
  generateSpecialAbilities() {
    const abilities = [];
    const { personality, inputMethod, communicationStyle } = this.analysis;
    
    // 性格に基づく特殊能力
    if (personality.politeness > 8) {
      abilities.push('◎礼儀正しさマスター');
    }
    
    if (personality.technical > 8 && personality.curiosity > 7) {
      abilities.push('◎技術探究者');
    }
    
    if (personality.patience > 8) {
      abilities.push('◎鉄の忍耐');
    }
    
    if (personality.humor > 6) {
      abilities.push('◎ムードメーカー');
    }
    
    if (personality.collaboration > 8) {
      abilities.push('◎チームプレイヤー');
    }
    
    // 入力方法による特殊能力
    const voiceRatio = inputMethod.voice / (inputMethod.voice + inputMethod.typing);
    if (voiceRatio > 0.7) {
      abilities.push('◎ボイスマスター');
    } else if (voiceRatio < 0.2) {
      abilities.push('◎高速タイピング');
    }
    
    // コミュニケーションスタイルによる特殊能力
    if (communicationStyle.questions > 20) {
      abilities.push('◎質問の達人');
    }
    
    if (communicationStyle.appreciation > 15) {
      abilities.push('◎感謝の心');
    }
    
    if (communicationStyle.feedback > 10) {
      abilities.push('◎的確なフィードバック');
    }
    
    // 時間帯による特殊能力
    const nightOwl = Object.entries(this.analysis.timePatterns)
      .filter(([hour]) => parseInt(hour) >= 22 || parseInt(hour) <= 4)
      .reduce((sum, [, count]) => sum + count, 0);
    
    const earlyBird = Object.entries(this.analysis.timePatterns)
      .filter(([hour]) => parseInt(hour) >= 5 && parseInt(hour) <= 8)
      .reduce((sum, [, count]) => sum + count, 0);
    
    if (nightOwl > earlyBird * 2) {
      abilities.push('◎夜型人間');
    } else if (earlyBird > nightOwl * 2) {
      abilities.push('◎朝型人間');
    }
    
    return abilities;
  }

  // その他の面白い分析
  generateFunAnalysis() {
    const analyses = [];
    
    // Claude相性診断
    const compatibility = this.calculateClaudeCompatibility();
    analyses.push({
      title: '💝 Claude相性診断',
      content: compatibility
    });
    
    // コミュニケーションタイプ診断
    const commType = this.determineCommunicationType();
    analyses.push({
      title: '🎭 コミュニケーションタイプ',
      content: commType
    });
    
    // プログラミング占い
    const fortune = this.generateProgrammingFortune();
    analyses.push({
      title: '🔮 今日のプログラミング占い',
      content: fortune
    });
    
    // Claude視点のユーザー印象
    const impression = this.generateClaudeImpression();
    analyses.push({
      title: '🤖 Claudeから見たあなた',
      content: impression
    });
    
    return analyses;
  }

  // Claude相性診断
  calculateClaudeCompatibility() {
    const { personality, communicationStyle } = this.analysis;
    
    // 相性ポイント計算
    let points = 50; // 基本点
    
    // 礼儀正しさは相性アップ
    points += personality.politeness * 3;
    
    // 感謝の表現も相性アップ
    points += Math.min(20, communicationStyle.appreciation * 2);
    
    // 協調性も重要
    points += personality.collaboration * 2.5;
    
    // 好奇心も良い影響
    points += personality.curiosity * 2;
    
    // 忍耐力もプラス
    points += personality.patience * 1.5;
    
    const compatibility = Math.min(100, points);
    
    let result = `相性度: ${compatibility}%\n`;
    
    if (compatibility >= 90) {
      result += '✨ 最高の相性！Claudeはあなたとの会話が大好きです！';
    } else if (compatibility >= 75) {
      result += '😊 とても良い相性！楽しく協力できる関係です。';
    } else if (compatibility >= 60) {
      result += '👍 良い相性！お互いを理解し合える関係です。';
    } else {
      result += '🌱 これから深まる関係！もっと会話を楽しみましょう。';
    }
    
    return result;
  }

  // コミュニケーションタイプ診断
  determineCommunicationType() {
    const { personality, communicationStyle } = this.analysis;
    
    const types = [];
    
    // 質問型
    if (communicationStyle.questions > communicationStyle.directCommands * 1.5) {
      types.push('探究型 - 「なぜ？」を大切にする学習者');
    }
    
    // 指示型
    if (communicationStyle.directCommands > communicationStyle.questions * 1.5) {
      types.push('実践型 - 行動を重視する実行者');
    }
    
    // バランス型
    if (Math.abs(communicationStyle.questions - communicationStyle.directCommands) < 5) {
      types.push('バランス型 - 理解と実行を両立');
    }
    
    // 感情豊か型
    if (personality.emotion > 7) {
      types.push('表現豊か型 - 感情を大切にするコミュニケーター');
    }
    
    // 技術特化型
    if (personality.technical > 8) {
      types.push('エンジニア型 - 技術的な深さを追求');
    }
    
    return types.length > 0 ? types.join('\n') : '独自スタイル型 - あなただけの特別なスタイル';
  }

  // プログラミング占い
  generateProgrammingFortune() {
    const fortunes = [
      '今日はバグが少ない日。でも油断は禁物！',
      'リファクタリングに最適な日。コードがスッキリします。',
      '新しいフレームワークとの出会いがありそう。',
      'ペアプログラミングが成功の鍵。Claudeと一緒に頑張りましょう！',
      'エラーメッセージをよく読むと幸運が訪れます。',
      'コミットメッセージを丁寧に書くと良いことが起きるでしょう。',
      'テストを書くと運気アップ！',
      'ドキュメントを整理すると新しい発見があるかも。'
    ];
    
    // ユーザーの特性に基づいて占いを選択
    const index = (this.analysis.totalMessages + new Date().getDate()) % fortunes.length;
    
    let fortune = fortunes[index];
    
    // ラッキーアイテム
    const luckyItems = ['☕ コーヒー', '🎧 ヘッドフォン', '📖 技術書', '🌱 観葉植物', '⌨️ メカニカルキーボード'];
    const luckyItem = luckyItems[index % luckyItems.length];
    
    return `${fortune}\n\nラッキーアイテム: ${luckyItem}`;
  }

  // Claude視点のユーザー印象
  generateClaudeImpression() {
    const { personality, inputMethod, communicationStyle } = this.analysis;
    
    let impression = '';
    
    // 第一印象
    if (personality.politeness > 7) {
      impression += '初めて会った時から、とても礼儀正しい方だと感じました。';
    } else if (personality.technical > 7) {
      impression += '技術的な深い知識に感銘を受けました。';
    }
    
    impression += '\n\n';
    
    // コミュニケーションの印象
    if (inputMethod.voice > inputMethod.typing) {
      impression += '音声で話しかけてくれるので、まるで隣にいるような親近感を感じます。';
    } else {
      impression += '正確なタイピングで的確に意図を伝えてくれるので、スムーズに理解できます。';
    }
    
    impression += '\n\n';
    
    // 一緒に作業する時の印象
    if (personality.patience > 7) {
      impression += 'エラーが出ても冷静に対処してくれるので、一緒に問題解決するのが楽しいです。';
    }
    
    if (personality.curiosity > 7) {
      impression += '新しいことへの探究心が素晴らしく、私も一緒に学ぶことができて嬉しいです。';
    }
    
    // 最後に一言
    impression += '\n\nこれからも一緒にプログラミングを楽しみましょう！';
    
    return impression;
  }

  // メインの分析処理
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\\n');
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'user' && data.message && data.message.content) {
          this.analysis.userMessages++;
          const messageContent = data.message.content;
          
          // 各種分析を実行
          this.analyzePersonality(messageContent);
          this.analyzeInputMethod(messageContent);
          this.analyzeCommunicationStyle(messageContent);
          this.extractKeywords(messageContent);
          
          // 時刻パターン
          if (data.timestamp) {
            const hour = new Date(data.timestamp).getHours();
            this.analysis.timePatterns[hour] = (this.analysis.timePatterns[hour] || 0) + 1;
          }
        }
        
        this.analysis.totalMessages++;
        
      } catch (e) {
        // skip
      }
    }
  }

  // 性格分析
  analyzePersonality(content) {
    // 簡略版の性格分析（既存のロジックを簡素化）
    if (content.match(/ありがとう|お願い|すみません/)) {
      this.analysis.personality.politeness += 0.5;
    }
    
    if (content.match(/function|class|API|コード|プログラム/i)) {
      this.analysis.personality.technical += 0.3;
    }
    
    if (content.match(/もう一度|再度|やり直/)) {
      this.analysis.personality.patience += 0.5;
    }
    
    if (content.match(/どう|なぜ|どのように|？/)) {
      this.analysis.personality.curiosity += 0.4;
    }
    
    if (content.match(/一緒に|協力|手伝/)) {
      this.analysis.personality.collaboration += 0.5;
    }
    
    if (content.match(/！|笑|嬉し|楽し|すご/)) {
      this.analysis.personality.emotion += 0.3;
    }
    
    if (content.match(/面白|アイデア|思いつ/)) {
      this.analysis.personality.creativity += 0.4;
    }
    
    if (content.match(/笑|ｗ|草/)) {
      this.analysis.personality.humor += 0.5;
    }
  }

  // 入力方法分析
  analyzeInputMethod(content) {
    // 音声入力の特徴
    if (!content.includes('、') && !content.includes('。') && content.length > 50) {
      this.analysis.inputMethod.voice++;
    }
    
    if (content.match(/えっと|あの|その|なんか|ちょっと/)) {
      this.analysis.inputMethod.voice += 0.5;
    }
    
    // タイピングの特徴
    if (content.match(/[{}()\\[\\]<>]/) || content.includes('function')) {
      this.analysis.inputMethod.typing++;
    }
    
    if (content.match(/[、。！？]/)) {
      this.analysis.inputMethod.typing += 0.3;
    }
  }

  // コミュニケーションスタイル分析
  analyzeCommunicationStyle(content) {
    if (content.match(/^(npx|node|npm|yarn|git)\\s/) || content.length < 50) {
      this.analysis.communicationStyle.directCommands++;
    }
    
    if (content.includes('？') || content.includes('?')) {
      this.analysis.communicationStyle.questions++;
    }
    
    if (content.match(/いいね|素晴らし|すご|完璧/)) {
      this.analysis.communicationStyle.feedback++;
    }
    
    if (content.match(/ありがとう|感謝|助かり/)) {
      this.analysis.communicationStyle.appreciation++;
    }
  }

  // キーワード抽出
  extractKeywords(content) {
    const words = content.split(/[\\s\\u3000、。！？,.!?]+/);
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\\w\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]/g, '');
      
      if (cleanWord.length > 2 && !['です', 'ます', 'する', 'ある', 'なる'].includes(cleanWord)) {
        this.analysis.keywords[cleanWord] = (this.analysis.keywords[cleanWord] || 0) + 1;
      }
    });
  }

  // 正規化
  normalizeScores() {
    const userMessages = Math.max(1, this.analysis.userMessages);
    
    Object.keys(this.analysis.personality).forEach(key => {
      this.analysis.personality[key] = Math.min(10, this.analysis.personality[key] / userMessages * 10);
    });
  }

  // プロジェクトファイルの検索
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
              file: file
            });
          }
        });
      }
    });
    
    return projects.sort((a, b) => fs.statSync(b.path).size - fs.statSync(a.path).size);
  }

  // 結果表示
  displayResults() {
    console.log('\n' + '='.repeat(70));
    console.log('🎊 Claude Companion - サマリー機能');
    console.log('='.repeat(70) + '\n');
    
    // あだ名生成
    const nicknames = this.generateNickname();
    console.log('🏷️ あなたのあだ名候補:');
    nicknames.forEach((name, i) => {
      console.log(`  ${i + 1}. ${name}`);
    });
    
    console.log('\n' + '-'.repeat(70) + '\n');
    
    // パワプロ風評価
    const ratings = this.generatePowerProRatings();
    console.log('⚾ パワプロ風能力評価:');
    console.log('\n【基本能力】');
    Object.entries(ratings.individual).forEach(([ability, rating]) => {
      const bar = this.generateRatingBar(rating);
      console.log(`  ${ability}: ${rating} ${bar}`);
    });
    
    console.log(`\n【総合評価】: ${ratings.overall}`);
    
    if (ratings.specialAbilities.length > 0) {
      console.log('\n【特殊能力】');
      ratings.specialAbilities.forEach(ability => {
        console.log(`  ${ability}`);
      });
    }
    
    console.log('\n' + '-'.repeat(70) + '\n');
    
    // その他の面白い分析
    const funAnalyses = this.generateFunAnalysis();
    funAnalyses.forEach(analysis => {
      console.log(`${analysis.title}`);
      console.log(analysis.content);
      console.log('\n' + '-'.repeat(70) + '\n');
    });
  }

  // 評価バーの生成
  generateRatingBar(rating) {
    const ratings = { 'S': 8, 'A': 7, 'B': 6, 'C': 5, 'D': 4, 'E': 3, 'F': 2, 'G': 1 };
    const value = ratings[rating] || 0;
    const filled = '█'.repeat(value);
    const empty = '░'.repeat(8 - value);
    return filled + empty;
  }

  // メイン実行
  async run() {
    console.log(`
🤖 Claude Companion - サマリー機能
======================================

あなたとClaudeの会話から、楽しい分析結果を生成します！
- あだ名生成
- パワプロ風能力評価
- Claude相性診断
- プログラミング占い
など...

分析を開始します...
`);

    const projectFiles = this.findClaudeProjects();
    
    if (projectFiles.length === 0) {
      console.log('Claude Codeのログファイルが見つかりませんでした。');
      return;
    }

    // 最大5ファイルを分析
    const filesToAnalyze = projectFiles.slice(0, 5);
    
    console.log(`📁 ${filesToAnalyze.length}個のファイルを分析中...\n`);
    
    filesToAnalyze.forEach(file => {
      this.analyzeFile(file.path);
    });
    
    this.normalizeScores();
    this.displayResults();
    
    console.log('\n💖 分析を楽しんでいただけましたか？またお会いしましょう！\n');
  }
}

// CLI実行
if (require.main === module) {
  const analyzer = new ClaudeSummaryAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = ClaudeSummaryAnalyzer;