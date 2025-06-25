#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// 簡易テスト版
class SimpleAnalyzer {
  constructor() {
    this.stats = {
      total: 0,
      user: 0,
      assistant: 0,
      voiceIndicators: 0,
      typingIndicators: 0,
      emotions: {
        positive: 0,
        negative: 0,
        neutral: 0
      }
    };
  }
  
  analyzeMessage(content) {
    if (typeof content !== 'string') return;
    
    // 音声入力の特徴
    if (content.match(/えっと|あの|その|なんか|ちょっと|まあ/)) {
      this.stats.voiceIndicators++;
    }
    
    // タイピングの特徴
    if (content.match(/[{}()\[\]<>]/) || content.includes('function')) {
      this.stats.typingIndicators++;
    }
    
    // 感情分析
    if (content.match(/ありがとう|Good|できた|素晴らしい/)) {
      this.stats.emotions.positive++;
    } else if (content.match(/エラー|失敗|うまくいかない/)) {
      this.stats.emotions.negative++;
    } else {
      this.stats.emotions.neutral++;
    }
  }
  
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    console.log(`\n📄 ${path.basename(filePath)} を分析中...`);
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        this.stats.total++;
        
        if (data.type === 'user') {
          this.stats.user++;
          if (data.message && data.message.content) {
            this.analyzeMessage(data.message.content);
          }
        } else if (data.type === 'assistant') {
          this.stats.assistant++;
        }
      } catch (e) {
        // skip
      }
    }
  }
  
  showResults() {
    const totalInput = this.stats.voiceIndicators + this.stats.typingIndicators || 1;
    const voicePercent = Math.round((this.stats.voiceIndicators / totalInput) * 100);
    const typingPercent = Math.round((this.stats.typingIndicators / totalInput) * 100);
    
    console.log('\n📊 分析結果:');
    console.log(`├─ 総メッセージ: ${this.stats.total}`);
    console.log(`├─ ユーザー: ${this.stats.user}`);
    console.log(`└─ Claude: ${this.stats.assistant}`);
    
    console.log('\n🎤 入力方法の推定:');
    console.log(`├─ 音声入力の可能性: ${voicePercent}%`);
    console.log(`└─ タイピングの可能性: ${typingPercent}%`);
    
    console.log('\n😊 感情分析:');
    console.log(`├─ ポジティブ: ${this.stats.emotions.positive}`);
    console.log(`├─ ネガティブ: ${this.stats.emotions.negative}`);
    console.log(`└─ ニュートラル: ${this.stats.emotions.neutral}`);
  }
}

// 実行
const analyzer = new SimpleAnalyzer();
const claudeDir = path.join(os.homedir(), '.claude', 'projects');

if (fs.existsSync(claudeDir)) {
  const projects = fs.readdirSync(claudeDir);
  
  // 最初の3プロジェクトだけ分析
  projects.slice(0, 3).forEach(project => {
    const projectPath = path.join(claudeDir, project);
    const files = fs.readdirSync(projectPath);
    
    files.forEach(file => {
      if (file.endsWith('.jsonl')) {
        const filePath = path.join(projectPath, file);
        const stat = fs.statSync(filePath);
        if (stat.size < 1024 * 1024 * 2) { // 2MB以下のファイルのみ
          analyzer.analyzeFile(filePath);
        }
      }
    });
  });
  
  analyzer.showResults();
}