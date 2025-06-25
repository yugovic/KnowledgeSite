#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdvancedUserAnalyzer = require('./analyze-user-advanced.js');

class VisualReportGenerator extends AdvancedUserAnalyzer {
  generateVisualReport() {
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code ユーザー分析レポート</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        h1 {
            text-align: center;
            color: #5a67d8;
            margin-bottom: 40px;
            font-size: 2.5em;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 3em;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .stat-label {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .personality-section {
            background: #f7fafc;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .score-bar {
            margin: 20px 0;
        }
        
        .score-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-weight: 600;
        }
        
        .score-track {
            background: #e2e8f0;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
        }
        
        .score-fill {
            background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
            height: 100%;
            border-radius: 10px;
            transition: width 1s ease-out;
            position: relative;
        }
        
        .keywords-cloud {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding: 20px;
            background: #f7fafc;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .keyword-tag {
            background: #5a67d8;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .keyword-tag:hover {
            background: #434190;
            transform: scale(1.1);
        }
        
        .communication-chart {
            background: #f7fafc;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .chart-bar {
            display: flex;
            align-items: center;
            margin: 15px 0;
        }
        
        .chart-label {
            width: 150px;
            font-weight: 600;
        }
        
        .chart-value {
            flex: 1;
            background: #e2e8f0;
            height: 30px;
            border-radius: 15px;
            position: relative;
            overflow: hidden;
        }
        
        .chart-fill {
            background: linear-gradient(90deg, #9f7aea 0%, #805ad5 100%);
            height: 100%;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 10px;
            color: white;
            font-weight: bold;
        }
        
        .personality-result {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 40px;
            border-radius: 20px;
            margin-top: 40px;
            font-size: 1.2em;
            line-height: 1.8;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .personality-result h2 {
            margin-bottom: 20px;
            font-size: 1.8em;
        }
        
        .time-chart {
            background: #f7fafc;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .time-bars {
            display: flex;
            align-items: flex-end;
            justify-content: space-around;
            height: 200px;
            margin-top: 20px;
        }
        
        .time-bar {
            width: 30px;
            background: linear-gradient(180deg, #4299e1 0%, #3182ce 100%);
            border-radius: 5px 5px 0 0;
            position: relative;
            transition: all 0.3s ease;
        }
        
        .time-bar:hover {
            background: linear-gradient(180deg, #63b3ed 0%, #4299e1 100%);
        }
        
        .time-label {
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            white-space: nowrap;
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
        
        .fade-in {
            animation: fadeIn 0.8s ease-out;
        }
    </style>
</head>
<body>
    <div class="container fade-in">
        <h1>🤖 Claude Code ユーザー分析レポート</h1>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">総メッセージ数</div>
                <div class="stat-number">${this.analysis.totalMessages.toLocaleString()}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">ユーザーメッセージ</div>
                <div class="stat-number">${this.analysis.userMessages.toLocaleString()}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">アシスタント応答</div>
                <div class="stat-number">${this.analysis.assistantMessages.toLocaleString()}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">平均応答率</div>
                <div class="stat-number">${(this.analysis.assistantMessages / this.analysis.userMessages).toFixed(1)}</div>
            </div>
        </div>
        
        <div class="personality-section">
            <h2>🎯 性格スコア分析</h2>
            ${this.generateScoreBars()}
        </div>
        
        <div class="communication-chart">
            <h2>🗣️ コミュニケーションスタイル</h2>
            ${this.generateCommunicationChart()}
        </div>
        
        <div class="keywords-cloud">
            <h2 style="width: 100%; margin-bottom: 20px;">📝 よく使う言葉</h2>
            ${this.generateKeywordTags()}
        </div>
        
        <div class="time-chart">
            <h2>⏰ 活動時間帯</h2>
            ${this.generateTimeChart()}
        </div>
        
        <div class="personality-result">
            <h2>🎭 総合的な印象</h2>
            ${this.analyzePersonality().replace(/\n/g, '<br>')}
        </div>
    </div>
    
    <script>
        // アニメーション効果
        document.addEventListener('DOMContentLoaded', () => {
            // スコアバーのアニメーション
            document.querySelectorAll('.score-fill').forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
            
            // チャートのアニメーション
            document.querySelectorAll('.chart-fill').forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 300);
            });
        });
    </script>
</body>
</html>
    `;
    
    return html;
  }
  
  generateScoreBars() {
    const scores = [
      { label: '😊 丁寧さ', value: this.analysis.scores.politeness, color: '#f56565' },
      { label: '🔬 技術的', value: this.analysis.scores.technical, color: '#4299e1' },
      { label: '🧘 我慢強さ', value: this.analysis.scores.patience, color: '#48bb78' },
      { label: '🚀 好奇心', value: this.analysis.scores.curiosity, color: '#ed8936' },
      { label: '🤝 協調性', value: this.analysis.scores.collaboration, color: '#9f7aea' },
      { label: '❤️ 感情表現', value: this.analysis.scores.emotion, color: '#f687b3' }
    ];
    
    return scores.map(score => `
      <div class="score-bar">
        <div class="score-label">
          <span>${score.label}</span>
          <span>${score.value.toFixed(1)}/10</span>
        </div>
        <div class="score-track">
          <div class="score-fill" style="width: ${score.value * 10}%; background: ${score.color};"></div>
        </div>
      </div>
    `).join('');
  }
  
  generateCommunicationChart() {
    const styles = this.analysis.communicationStyle;
    const total = Math.max(Object.values(styles).reduce((a, b) => a + b, 0), 1);
    
    return Object.entries(styles).map(([key, value]) => {
      const labels = {
        directCommands: '直接的なコマンド',
        questions: '質問',
        feedback: 'フィードバック',
        appreciation: '感謝の表現',
        corrections: '修正指示'
      };
      
      return `
        <div class="chart-bar">
          <div class="chart-label">${labels[key]}</div>
          <div class="chart-value">
            <div class="chart-fill" style="width: ${(value / total) * 100}%;">
              ${value}回
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  generateKeywordTags() {
    const topKeywords = Object.entries(this.analysis.keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);
    
    return topKeywords.map(([word, count]) => {
      const size = Math.min(Math.max(14 + Math.log(count) * 2, 14), 24);
      return `<span class="keyword-tag" style="font-size: ${size}px;">${word} (${count})</span>`;
    }).join('');
  }
  
  generateTimeChart() {
    const timeData = this.analysis.timePatterns;
    const maxCount = Math.max(...Object.values(timeData), 1);
    
    // 24時間分のバーを作成
    const bars = [];
    for (let hour = 0; hour < 24; hour++) {
      const count = timeData[hour] || 0;
      const height = (count / maxCount) * 100;
      
      if (count > 0) {
        bars.push(`
          <div class="time-bar" style="height: ${height}%;" title="${hour}時: ${count}回">
            <div class="time-label">${hour}時</div>
          </div>
        `);
      }
    }
    
    return `<div class="time-bars">${bars.join('')}</div>`;
  }
  
  async generateAndSaveReport(projectName = null, options = {}) {
    await this.analyze(projectName, options);
    
    const html = this.generateVisualReport();
    const filename = `claude-analysis-${projectName || 'all'}-${Date.now()}.html`;
    const filepath = path.join(process.cwd(), filename);
    
    fs.writeFileSync(filepath, html);
    console.log(`\n📊 ビジュアルレポートを生成しました: ${filename}`);
    console.log(`🌐 ブラウザで開いてください: file://${filepath}`);
    
    return filepath;
  }
}

// CLI実行
if (require.main === module) {
  const reporter = new VisualReportGenerator();
  
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
  
  reporter.generateAndSaveReport(projectName, options).catch(console.error);
}

module.exports = VisualReportGenerator;