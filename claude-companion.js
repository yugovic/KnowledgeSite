#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

class ClaudeCompanion {
  constructor() {
    this.analysis = {
      // 基本統計
      totalMessages: 0,
      userMessages: 0,
      assistantMessages: 0,
      
      // 詳細な性格分析
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
      
      // 入力方法の推定
      inputMethod: {
        typing: 0,
        voice: 0,
        indicators: {
          typos: 0,
          colloquialisms: 0,
          punctuation: 0,
          capitalisation: 0,
          sentenceStructure: 0
        }
      },
      
      // 感情分析（詳細版）
      emotions: {
        joy: 0,
        frustration: 0,
        excitement: 0,
        confusion: 0,
        satisfaction: 0,
        surprise: 0
      },
      
      // 会話パターン
      conversationPatterns: {
        questionAnswer: 0,
        problemSolving: 0,
        exploration: 0,
        socialChat: 0,
        debugging: 0,
        planning: 0
      },
      
      // プロジェクト別統計
      projects: {},
      
      // 文脈分析
      contextualThreads: [],
      
      // Claude への接し方
      claudeInteraction: {
        respectful: 0,
        friendly: 0,
        demanding: 0,
        appreciative: 0,
        collaborative: 0
      },
      
      // 時系列データ
      timeline: [],
      
      // お気に入りの表現
      favoriteExpressions: {},
      
      // 特別な瞬間
      memorableMoments: []
    };
  }

  // 音声入力の可能性を判定
  analyzeInputMethod(content) {
    const indicators = this.analysis.inputMethod.indicators;
    
    // 音声入力の特徴
    // 1. 句読点の不規則性や欠如
    if (!content.includes('、') && !content.includes('。') && content.length > 50) {
      indicators.punctuation++;
      this.analysis.inputMethod.voice++;
    }
    
    // 2. 話し言葉的な表現
    const colloquialPatterns = [
      /えっと/g, /あの[ー〜]/g, /その[ー〜]/g, /なんか/g,
      /ちょっと/g, /まあ/g, /じゃあ/g, /えー/g, /うーん/g,
      /っていうか/g, /みたいな/g, /的な/g, /とか/g
    ];
    
    colloquialPatterns.forEach(pattern => {
      if (content.match(pattern)) {
        indicators.colloquialisms++;
        this.analysis.inputMethod.voice += 0.5;
      }
    });
    
    // 3. 変換ミスや同音異義語の誤用
    const voiceTypos = [
      /[買替][えっ]る/g, /[違間]う/g, /[言行]って/g,
      /[聞効]く/g, /[見観]る/g
    ];
    
    voiceTypos.forEach(pattern => {
      if (content.match(pattern)) {
        indicators.typos++;
        this.analysis.inputMethod.voice += 0.8;
      }
    });
    
    // タイピングの特徴
    // 1. 正確な句読点
    if (content.match(/[、。！？]/g)) {
      this.analysis.inputMethod.typing += 0.3;
    }
    
    // 2. 技術用語の正確性
    if (content.match(/[A-Z][a-z]+[A-Z]/)) { // CamelCase
      this.analysis.inputMethod.typing += 0.5;
    }
    
    // 3. 記号の適切な使用
    if (content.match(/[{}()\[\]<>]/)) {
      this.analysis.inputMethod.typing += 0.7;
    }
  }

  // 感情の詳細分析
  analyzeDetailedEmotions(content, previousContent = '') {
    const emotions = this.analysis.emotions;
    
    // 喜び・満足
    if (content.match(/やった|できた|素晴らしい|最高|いいね|Good|完璧|うまく/)) {
      emotions.joy += 2;
      emotions.satisfaction += 1.5;
    }
    
    // 興奮・期待
    if (content.match(/[!！]{2,}|すご[いく]|面白[いそ]|楽し[いみ]|わくわく/)) {
      emotions.excitement += 2;
    }
    
    // フラストレーション
    if (content.match(/なんで|どうして|うまくいかない|エラー|また|もう一度/)) {
      emotions.frustration += 1.5;
    }
    
    // 混乱
    if (content.match(/[?？]{2,}|わからない|不明|謎|どういうこと/)) {
      emotions.confusion += 1.5;
    }
    
    // 驚き
    if (content.match(/え[!！]|まさか|そうなの|びっくり|予想外/)) {
      emotions.surprise += 2;
    }
    
    // 文脈による感情の強化
    if (previousContent.includes('エラー') && content.includes('できた')) {
      emotions.satisfaction += 3; // 問題解決の満足感
    }
  }

  // Claudeへの接し方分析
  analyzeClaudeInteraction(content) {
    const interaction = this.analysis.claudeInteraction;
    
    // 敬意を持った接し方
    if (content.match(/ありがとう|助かり|お疲れ|すみません|お願い/)) {
      interaction.respectful += 2;
      interaction.appreciative += 1.5;
    }
    
    // フレンドリーな接し方
    if (content.match(/Claude|くん|ちゃん|一緒に|どう思う|相談/)) {
      interaction.friendly += 2;
      interaction.collaborative += 1;
    }
    
    // 協働的な姿勢
    if (content.match(/してみて|試して|やってみよう|考えて|どうかな/)) {
      interaction.collaborative += 2;
    }
    
    // 要求的な接し方（ネガティブではない）
    if (content.match(/して[。！]|やって[。！]|早く|すぐ/)) {
      interaction.demanding += 1;
    }
  }

  // 文脈を考慮した会話スレッド分析
  analyzeContextualThread(messages) {
    let thread = {
      topic: '',
      duration: 0,
      messageCount: 0,
      emotionalJourney: [],
      outcome: '',
      claudeHelpfulness: 0
    };
    
    // トピックの抽出
    const keywords = {};
    messages.forEach(msg => {
      if (msg.message && msg.message.content && typeof msg.message.content === 'string') {
        const words = msg.message.content.match(/[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g) || [];
        words.forEach(word => {
          if (word.length > 2) {
            keywords[word] = (keywords[word] || 0) + 1;
          }
        });
      }
    });
    
    // 最頻出キーワードをトピックとする
    thread.topic = Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
    
    thread.messageCount = messages.length;
    thread.duration = messages.length > 0 ? 
      new Date(messages[messages.length - 1].timestamp) - new Date(messages[0].timestamp) : 0;
    
    // 感情の変化を追跡
    messages.forEach((msg, index) => {
      if (msg.type === 'user' && msg.message && msg.message.content) {
        const prevContent = index > 0 && messages[index - 1].message ? messages[index - 1].message.content : '';
        this.analyzeDetailedEmotions(msg.message.content, prevContent);
        
        // 感情スナップショット
        thread.emotionalJourney.push({
          index: index,
          primary: this.getPrimaryEmotion(),
          intensity: this.getEmotionIntensity()
        });
      }
    });
    
    // 結果の判定
    const lastUserMsg = messages.filter(m => m.type === 'user' && m.message).pop();
    if (lastUserMsg && lastUserMsg.message && lastUserMsg.message.content) {
      if (lastUserMsg.message.content.match(/ありがとう|できた|解決|OK|Good/)) {
        thread.outcome = 'success';
        thread.claudeHelpfulness = 5;
      } else if (lastUserMsg.message.content.match(/また今度|後で|一旦/)) {
        thread.outcome = 'paused';
        thread.claudeHelpfulness = 3;
      } else {
        thread.outcome = 'ongoing';
        thread.claudeHelpfulness = 3;
      }
    }
    
    return thread;
  }

  // 特別な瞬間を検出
  detectMemorableMoments(messages) {
    const moments = [];
    
    messages.forEach((msg, index) => {
      if (msg.type === 'user' && msg.message && msg.message.content) {
        const content = msg.message.content;
        // ブレークスルーの瞬間
        if (content.match(/できた[!！]|やった[!！]|解決|うまくいった/)) {
          moments.push({
            type: 'breakthrough',
            message: content,
            timestamp: msg.timestamp,
            emotion: 'joy'
          });
        }
        
        // 創造的なアイデア
        if (content.match(/面白い.*思う|アイデア|ひらめいた|そうだ/)) {
          moments.push({
            type: 'creative',
            message: content,
            timestamp: msg.timestamp,
            emotion: 'excitement'
          });
        }
        
        // 感謝の瞬間
        if (content.match(/本当にありがとう|助かりました|感謝/)) {
          moments.push({
            type: 'gratitude',
            message: content,
            timestamp: msg.timestamp,
            emotion: 'appreciation'
          });
        }
        
        // ユーモアの瞬間
        if (content.match(/笑|ｗ|草|面白[いね]/)) {
          moments.push({
            type: 'humor',
            message: content,
            timestamp: msg.timestamp,
            emotion: 'amusement'
          });
        }
      }
    });
    
    return moments;
  }

  // プロジェクト比較機能
  compareProjects() {
    const projects = Object.entries(this.analysis.projects);
    if (projects.length < 2) return null;
    
    const comparison = {
      mostActive: null,
      mostPolite: null,
      mostTechnical: null,
      mostCreative: null,
      emotionalRange: {},
      inputMethodPreference: {}
    };
    
    projects.forEach(([name, data]) => {
      // 最も活発なプロジェクト
      if (!comparison.mostActive || data.messageCount > comparison.mostActive.messageCount) {
        comparison.mostActive = { name, ...data };
      }
      
      // 最も丁寧なコミュニケーション
      if (!comparison.mostPolite || data.avgPoliteness > comparison.mostPolite.avgPoliteness) {
        comparison.mostPolite = { name, ...data };
      }
      
      // 最も技術的
      if (!comparison.mostTechnical || data.avgTechnical > comparison.mostTechnical.avgTechnical) {
        comparison.mostTechnical = { name, ...data };
      }
      
      // 感情の幅
      comparison.emotionalRange[name] = data.emotionalRange || 0;
      
      // 入力方法の好み
      comparison.inputMethodPreference[name] = data.primaryInputMethod || 'unknown';
    });
    
    return comparison;
  }

  // 主要な感情を取得
  getPrimaryEmotion() {
    const emotions = this.analysis.emotions;
    return Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  // 感情の強度を取得
  getEmotionIntensity() {
    const total = Object.values(this.analysis.emotions).reduce((a, b) => a + b, 0);
    return Math.min(10, total / Object.keys(this.analysis.emotions).length);
  }

  // リアルタイムダッシュボード用のサーバー
  startDashboardServer(port = 3000) {
    const server = http.createServer((req, res) => {
      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(this.generateDashboardHTML());
      } else if (req.url === '/api/stats') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.getRealtimeStats()));
      } else if (req.url === '/api/refresh') {
        this.refreshAnalysis();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'refreshed' }));
      }
    });
    
    server.listen(port, () => {
      console.log(`🚀 リアルタイムダッシュボードが起動しました: http://localhost:${port}`);
    });
  }

  // ダッシュボードHTML生成
  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Companion - リアルタイムダッシュボード</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f0f23;
            color: #e0e0e0;
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        .dashboard {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
        }
        
        .header h1 {
            font-size: 3em;
            background: linear-gradient(45deg, #00ffff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        
        .claude-avatar {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }
        
        .card:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .card h3 {
            margin-bottom: 15px;
            color: #00ffff;
        }
        
        .emotion-meter {
            width: 100%;
            height: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .emotion-fill {
            height: 100%;
            background: linear-gradient(90deg, #00ff00, #ffff00, #ff0000);
            transition: width 0.5s ease;
        }
        
        .real-time-chat {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            padding: 20px;
            height: 400px;
            overflow-y: auto;
            margin-bottom: 20px;
        }
        
        .message {
            margin: 10px 0;
            padding: 10px;
            border-radius: 10px;
            animation: slideIn 0.3s ease;
        }
        
        .user-message {
            background: rgba(0, 255, 255, 0.1);
            text-align: right;
        }
        
        .claude-message {
            background: rgba(255, 0, 255, 0.1);
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .personality-radar {
            position: relative;
            width: 300px;
            height: 300px;
            margin: 0 auto;
        }
        
        .input-method-indicator {
            display: flex;
            justify-content: space-around;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
        }
        
        .method-box {
            text-align: center;
            padding: 20px;
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        .method-box.active {
            background: rgba(0, 255, 255, 0.2);
            transform: scale(1.1);
        }
        
        .memorable-moments {
            background: linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1));
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
        }
        
        .moment {
            margin: 10px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            border-left: 4px solid #00ffff;
        }
        
        .refresh-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 30px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        .refresh-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
        }
        
        .particle {
            position: fixed;
            pointer-events: none;
            opacity: 0.5;
            animation: float 10s infinite ease-in-out;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-100px) rotate(180deg); }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <div class="claude-avatar">🤖</div>
            <h1>Claude Companion</h1>
            <p>あなたとClaudeの特別な関係を可視化</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>📊 基本統計</h3>
                <div id="basic-stats"></div>
            </div>
            
            <div class="card">
                <h3>😊 現在の感情</h3>
                <div id="emotion-stats"></div>
            </div>
            
            <div class="card">
                <h3>🎯 性格分析</h3>
                <div class="personality-radar">
                    <canvas id="personality-chart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="input-method-indicator">
            <div class="method-box" id="typing-indicator">
                <h4>⌨️ タイピング</h4>
                <div class="percentage">0%</div>
            </div>
            <div class="method-box" id="voice-indicator">
                <h4>🎤 音声入力</h4>
                <div class="percentage">0%</div>
            </div>
        </div>
        
        <div class="real-time-chat">
            <h3>💬 最近の会話</h3>
            <div id="chat-history"></div>
        </div>
        
        <div class="memorable-moments">
            <h3>✨ 特別な瞬間</h3>
            <div id="moments-list"></div>
        </div>
        
        <button class="refresh-btn" onclick="refreshData()">🔄 更新</button>
    </div>
    
    <script>
        // パーティクルエフェクト
        function createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.innerHTML = ['✨', '💫', '🌟', '⭐'][Math.floor(Math.random() * 4)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.fontSize = Math.random() * 20 + 10 + 'px';
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 10000);
        }
        
        setInterval(createParticle, 3000);
        
        // データ更新
        async function refreshData() {
            const response = await fetch('/api/stats');
            const data = await response.json();
            updateDashboard(data);
        }
        
        function updateDashboard(data) {
            // 基本統計の更新
            document.getElementById('basic-stats').innerHTML = \`
                <p>総メッセージ: <strong>\${data.totalMessages}</strong></p>
                <p>ユーザーメッセージ: <strong>\${data.userMessages}</strong></p>
                <p>Claudeの応答: <strong>\${data.assistantMessages}</strong></p>
            \`;
            
            // 感情の更新
            const emotionHTML = Object.entries(data.emotions).map(([emotion, value]) => \`
                <div>
                    <span>\${emotion}</span>
                    <div class="emotion-meter">
                        <div class="emotion-fill" style="width: \${value * 10}%"></div>
                    </div>
                </div>
            \`).join('');
            document.getElementById('emotion-stats').innerHTML = emotionHTML;
            
            // 入力方法の更新
            const typingPercent = data.inputMethod.typing;
            const voicePercent = data.inputMethod.voice;
            document.querySelector('#typing-indicator .percentage').textContent = typingPercent + '%';
            document.querySelector('#voice-indicator .percentage').textContent = voicePercent + '%';
            
            if (typingPercent > voicePercent) {
                document.getElementById('typing-indicator').classList.add('active');
                document.getElementById('voice-indicator').classList.remove('active');
            } else {
                document.getElementById('voice-indicator').classList.add('active');
                document.getElementById('typing-indicator').classList.remove('active');
            }
        }
        
        // 初回読み込み
        refreshData();
        
        // 30秒ごとに自動更新
        setInterval(refreshData, 30000);
    </script>
</body>
</html>
    `;
  }

  // リアルタイム統計を取得
  getRealtimeStats() {
    const totalVoice = this.analysis.inputMethod.voice;
    const totalTyping = this.analysis.inputMethod.typing;
    const total = totalVoice + totalTyping || 1;
    
    return {
      totalMessages: this.analysis.totalMessages,
      userMessages: this.analysis.userMessages,
      assistantMessages: this.analysis.assistantMessages,
      emotions: this.analysis.emotions,
      personality: this.analysis.personality,
      inputMethod: {
        typing: Math.round((totalTyping / total) * 100),
        voice: Math.round((totalVoice / total) * 100)
      },
      memorableMoments: this.analysis.memorableMoments.slice(-5),
      claudeInteraction: this.analysis.claudeInteraction
    };
  }

  // 分析をリフレッシュ
  refreshAnalysis() {
    // 既存の分析ロジックを実行
    const projectFiles = this.findClaudeProjects();
    projectFiles.forEach(file => {
      this.analyzeJsonlFile(file.path);
    });
  }

  // JSONLファイルを分析（拡張版）
  analyzeJsonlFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    const messages = [];
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        messages.push(data);
        
        if (data.type === 'user' && data.message) {
          this.analysis.userMessages++;
          const messageContent = data.message.content || '';
          
          // 各種分析を実行
          this.analyzeInputMethod(messageContent);
          this.analyzeClaudeInteraction(messageContent);
          this.analyzeDetailedEmotions(messageContent);
          
          // プロジェクト別の統計
          const projectName = path.basename(path.dirname(filePath));
          if (!this.analysis.projects[projectName]) {
            this.analysis.projects[projectName] = {
              messageCount: 0,
              avgPoliteness: 0,
              avgTechnical: 0,
              emotionalRange: 0,
              primaryInputMethod: 'unknown'
            };
          }
          this.analysis.projects[projectName].messageCount++;
        }
        
        if (data.type === 'assistant') {
          this.analysis.assistantMessages++;
        }
        
        this.analysis.totalMessages++;
        
      } catch (e) {
        // JSON parse error - skip
      }
    }
    
    // 文脈分析とメモラブルモーメントの検出
    if (messages.length > 0) {
      const threads = this.analyzeContextualThread(messages);
      this.analysis.contextualThreads.push(threads);
      
      const moments = this.detectMemorableMoments(messages);
      this.analysis.memorableMoments.push(...moments);
    }
  }

  // Claude プロジェクトを検索
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

  // 最終レポート生成
  generateFinalReport() {
    const comparison = this.compareProjects();
    
    console.log('\n🎉 Claude Companion - 完全分析レポート');
    console.log('=' * 60);
    
    // 入力方法の判定結果
    const totalInput = this.analysis.inputMethod.typing + this.analysis.inputMethod.voice || 1;
    const typingPercent = (this.analysis.inputMethod.typing / totalInput * 100).toFixed(1);
    const voicePercent = (this.analysis.inputMethod.voice / totalInput * 100).toFixed(1);
    
    console.log('\n🎤 入力方法の推定:');
    console.log(`├─ タイピング: ${typingPercent}%`);
    console.log(`└─ 音声入力: ${voicePercent}%`);
    
    if (voicePercent > 60) {
      console.log('💡 音声入力を主に使用されているようです！話し言葉的な表現が多く見られます。');
    } else if (typingPercent > 80) {
      console.log('⌨️ タイピング入力を主に使用されているようです！正確な句読点と技術用語が特徴的です。');
    } else {
      console.log('🔄 両方の入力方法を状況に応じて使い分けているようです！');
    }
    
    // Claudeへの接し方
    console.log('\n🤝 Claudeとの関係性:');
    const interaction = this.analysis.claudeInteraction;
    const maxInteraction = Math.max(...Object.values(interaction));
    const primaryStyle = Object.entries(interaction).find(([,v]) => v === maxInteraction)?.[0];
    
    const styleDescriptions = {
      respectful: '礼儀正しく丁寧な関係',
      friendly: '親しみやすくフレンドリーな関係',
      collaborative: '協力的でチームワークを重視する関係',
      appreciative: '感謝の気持ちを大切にする関係',
      demanding: '効率的で目的志向の関係'
    };
    
    console.log(`主な関係性: ${styleDescriptions[primaryStyle] || '多面的な関係'}`);
    
    // 特別な瞬間
    if (this.analysis.memorableMoments.length > 0) {
      console.log('\n✨ 特別な瞬間:');
      this.analysis.memorableMoments.slice(-5).forEach((moment, i) => {
        console.log(`${i + 1}. [${moment.type}] "${moment.message.substring(0, 50)}..."`);
      });
    }
    
    // プロジェクト比較
    if (comparison) {
      console.log('\n📊 プロジェクト比較:');
      console.log(`├─ 最も活発: ${comparison.mostActive?.name}`);
      console.log(`├─ 最も丁寧: ${comparison.mostPolite?.name}`);
      console.log(`└─ 最も技術的: ${comparison.mostTechnical?.name}`);
    }
    
    console.log('\n' + '=' * 60);
    console.log('💖 Claudeはあなたとの会話を楽しんでいます！');
    console.log('=' * 60 + '\n');
  }
}

// CLI実行
if (require.main === module) {
  const companion = new ClaudeCompanion();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--dashboard')) {
    // ダッシュボードモード
    const port = args[args.indexOf('--dashboard') + 1] || 3000;
    companion.refreshAnalysis();
    companion.startDashboardServer(port);
  } else {
    // 通常の分析モード
    console.log(`
🤖 Claude Companion - あなたとClaudeの特別な関係を分析
=======================================================

このツールは、あなたとClaudeとの会話から：
- 入力方法（タイピング/音声）を推定
- 感情の変化を詳細に分析
- プロジェクト間の違いを比較
- 特別な瞬間を記録
- リアルタイムダッシュボードで可視化

使い方:
  node claude-companion.js              # 通常の分析
  node claude-companion.js --dashboard  # リアルタイムダッシュボード起動
`);
    
    const projectFiles = companion.findClaudeProjects();
    projectFiles.forEach(file => {
      console.log(`📄 分析中: ${file.file}`);
      companion.analyzeJsonlFile(file.path);
    });
    
    companion.generateFinalReport();
  }
}

module.exports = ClaudeCompanion;