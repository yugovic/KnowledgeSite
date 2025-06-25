// Claude Code Analyzer for Web Integration
class ClaudeAnalyzer {
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
      sessions: [],
      mostUsedCommands: {},
      personality: '',
      nickname: '',
      emoji: '🤖'
    };
  }

  // Generate nickname based on personality scores
  generateNickname() {
    const { politenessScore, technicalnessScore, patienceScore, curiosityScore } = this.analysis;
    
    // Find dominant trait
    const traits = {
      politeness: politenessScore,
      technical: technicalnessScore,
      patience: patienceScore,
      curiosity: curiosityScore
    };
    
    const dominantTrait = Object.entries(traits)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    // Generate nickname based on dominant trait and secondary traits
    let nickname = '';
    let emoji = '🤖';
    
    if (dominantTrait === 'politeness') {
      if (technicalnessScore > 6) {
        nickname = '礼儀正しいエンジニア';
        emoji = '🎩';
      } else if (curiosityScore > 6) {
        nickname = '優しい探究者';
        emoji = '😊';
      } else {
        nickname = '丁寧な協力者';
        emoji = '🤝';
      }
    } else if (dominantTrait === 'technical') {
      if (politenessScore > 6) {
        nickname = 'テックマスター紳士';
        emoji = '🔬';
      } else if (patienceScore > 6) {
        nickname = '根気強いデバッガー';
        emoji = '🛠️';
      } else {
        nickname = 'コードウィザード';
        emoji = '🧙‍♂️';
      }
    } else if (dominantTrait === 'patience') {
      if (technicalnessScore > 6) {
        nickname = '忍耐のプログラマー';
        emoji = '🧘';
      } else if (curiosityScore > 6) {
        nickname = '粘り強い研究者';
        emoji = '🔍';
      } else {
        nickname = '継続の達人';
        emoji = '💪';
      }
    } else if (dominantTrait === 'curiosity') {
      if (politenessScore > 6) {
        nickname = '好奇心旺盛な紳士';
        emoji = '🎓';
      } else if (technicalnessScore > 6) {
        nickname = '技術探検家';
        emoji = '🚀';
      } else {
        nickname = 'イノベーター';
        emoji = '💡';
      }
    }
    
    // Add special cases for extreme combinations
    if (politenessScore > 8 && curiosityScore > 8) {
      nickname = '学びの求道者';
      emoji = '🌟';
    } else if (technicalnessScore > 8 && patienceScore > 8) {
      nickname = 'マスタークラフター';
      emoji = '⚡';
    } else if (curiosityScore > 8 && technicalnessScore > 8) {
      nickname = 'テックエクスプローラー';
      emoji = '🌌';
    }
    
    this.analysis.nickname = nickname;
    this.analysis.emoji = emoji;
    return { nickname, emoji };
  }

  // Analyze personality based on scores
  analyzePersonality() {
    const { politenessScore, technicalnessScore, patienceScore, curiosityScore } = this.analysis;
    
    let personality = "";
    
    if (politenessScore > 7) {
      personality += "とても優しく丁寧な方ですね。相手を思いやる心が素敵です。";
    } else if (politenessScore > 4) {
      personality += "礼儀正しく、バランスの取れたコミュニケーションを心がけている方ですね。";
    } else {
      personality += "率直で効率的なコミュニケーションを好む方ですね。目的達成への意識が高いです。";
    }

    if (technicalnessScore > 8) {
      personality += "\n技術的知識が豊富で、深い議論を楽しむタイプです。常に最新技術にアンテナを張っています。";
    } else if (technicalnessScore > 5) {
      personality += "\n適度に技術的な話題に興味をお持ちで、実用性を重視されています。";
    } else {
      personality += "\n実用的な解決策を重視し、シンプルさを好む方ですね。";
    }

    if (patienceScore > 7) {
      personality += "\nとても我慢強く、問題が解決するまで諦めない粘り強さがあります。";
    } else if (patienceScore < 3) {
      personality += "\n効率を重視し、素早い結果を求める行動派です。";
    }

    if (curiosityScore > 8) {
      personality += "\n非常に探究心旺盛で、新しいことへの挑戦を楽しむ方です。";
    } else if (curiosityScore > 5) {
      personality += "\n適度な好奇心を持ち、必要に応じて新しいことを学ぶ姿勢があります。";
    }

    this.analysis.personality = personality;
    return personality;
  }

  // Analyze a single message
  analyzeMessage(content) {
    const scores = {
      politeness: 0,
      technical: 0,
      patience: 0,
      curiosity: 0
    };

    // 基本的な丁寧さ（短いメッセージでも評価）
    if (content.length > 3) {
      scores.politeness = 1;
    }

    // 丁寧語チェック
    const politeWords = ['ありがとう', 'すみません', 'お疲れ', 'よろしく', 'ください', 'です', 'ます', 'thank', 'please', 'sorry', 'お願い', '下さい'];
    const lowerContent = content.toLowerCase();
    const politeCount = politeWords.filter(word => {
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
      scores.patience += 3;
    }
    if (content.trim().length < 30 && content.trim().length > 5) {
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

  // Process JSONL data from Claude sessions
  processJsonlData(jsonlContent) {
    const lines = jsonlContent.trim().split('\n');
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'user' && data.message) {
          this.analysis.userMessages++;
          const messageContent = data.message.content || '';
          
          // Handle array content (tool results)
          let textContent = '';
          if (typeof messageContent === 'string') {
            textContent = messageContent;
          } else if (Array.isArray(messageContent)) {
            // Extract text from tool results
            textContent = messageContent
              .filter(item => item.type === 'text' || item.type === 'tool_result')
              .map(item => item.text || item.content || '')
              .join(' ');
          }
          
          if (textContent && !textContent.includes('<command-') && !textContent.includes('tool_result')) {
            const scores = this.analyzeMessage(textContent);
            this.analysis.politenessScore += scores.politeness;
            this.analysis.technicalnessScore += scores.technical;
            this.analysis.patienceScore += scores.patience;
            this.analysis.curiosityScore += scores.curiosity;
            
            // キーワード抽出
            const words = textContent.split(/[\s\u3000]+/);
            words.forEach(word => {
              const cleanWord = word.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '');
              if (cleanWord.length > 1 && !cleanWord.match(/^\d+$/)) {
                this.analysis.keywords[cleanWord] = (this.analysis.keywords[cleanWord] || 0) + 1;
              }
            });
            
            // コマンド抽出
            if (textContent.includes('npx')) {
              const command = textContent.match(/npx\s+[\w@/-]+/);
              if (command) {
                this.analysis.mostUsedCommands[command[0]] = (this.analysis.mostUsedCommands[command[0]] || 0) + 1;
              }
            }
          }
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

  // Finalize analysis and normalize scores
  finalizeAnalysis() {
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
    
    // Generate personality and nickname
    this.analyzePersonality();
    this.generateNickname();
    
    return this.analysis;
  }

  // Get top keywords
  getTopKeywords(limit = 10) {
    return Object.entries(this.analysis.keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .filter(([word]) => word.length > 2); // Filter out very short words
  }

  // Get top commands
  getTopCommands(limit = 5) {
    return Object.entries(this.analysis.mostUsedCommands)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaudeAnalyzer;
}