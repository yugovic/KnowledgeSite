#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

class ConversationExtractor {
  constructor() {
    this.conversations = [];
  }

  isToolResultMessage(data) {
    if (!data.message || !data.message.content) return false;
    
    if (Array.isArray(data.message.content)) {
      return data.message.content.some(item => 
        item.type === 'tool_result' || 
        item.tool_use_id !== undefined
      );
    }
    
    return false;
  }

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

  isCommand(content) {
    return content.match(/^(npx|node|npm|yarn|git|cc|ccusage)\s/) && content.length < 100;
  }

  isErrorLog(content) {
    // 明らかにエラーログの貼り付け
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

  isConversation(data) {
    if (this.isToolResultMessage(data)) return false;
    
    const content = this.getMessageContent(data);
    if (!content || typeof content !== 'string') return false;
    
    // コマンドやエラーログを除外
    if (this.isCommand(content)) return false;
    if (this.isErrorLog(content)) return false;
    
    // 非常に短いメッセージ（「はい」など）も会話として含める
    // ただし空白のみは除外
    if (content.trim().length === 0) return false;
    
    return true;
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        
        if (data.type === 'user' && data.message && this.isConversation(data)) {
          const messageContent = this.getMessageContent(data);
          this.conversations.push({
            content: messageContent,
            timestamp: data.timestamp,
            project: path.basename(path.dirname(filePath))
          });
        }
      } catch (e) {
        // skip
      }
    }
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

  run() {
    console.log('📝 実際の会話を抽出中...\n');
    
    const projectFiles = this.findClaudeProjects();
    const filesToAnalyze = projectFiles.slice(0, 10);
    
    filesToAnalyze.forEach(file => {
      this.analyzeFile(file.path);
    });
    
    console.log(`\n✨ ${this.conversations.length}件の会話を発見\n`);
    console.log('🗣️ 実際の会話サンプル（最新20件）:\n');
    console.log('='.repeat(80));
    
    // 最新の20件を表示
    const samples = this.conversations.slice(-20).reverse();
    
    samples.forEach((conv, index) => {
      const preview = conv.content.length > 100 
        ? conv.content.substring(0, 100) + '...' 
        : conv.content;
      
      console.log(`\n【${index + 1}】`);
      console.log(`時刻: ${new Date(conv.timestamp).toLocaleString('ja-JP')}`);
      console.log(`内容: ${preview}`);
      console.log('-'.repeat(80));
    });
  }
}

// 実行
const extractor = new ConversationExtractor();
extractor.run();