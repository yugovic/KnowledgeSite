#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Find Claude projects
const claudeDir = path.join(os.homedir(), '.claude', 'projects');
const projectDirs = fs.readdirSync(claudeDir);

let userMessageCount = 0;
const sampleMessages = [];

// Look for KnowledgeSite project
for (const dir of projectDirs) {
  if (dir.includes('KnowledgeSite')) {
    const projectPath = path.join(claudeDir, dir);
    const files = fs.readdirSync(projectPath);
    
    for (const file of files) {
      if (file.endsWith('.jsonl')) {
        const filePath = path.join(projectPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n');
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === 'user' && data.message) {
              const messageContent = data.message.content || '';
              
              // Skip tool results and command messages
              if (typeof messageContent === 'string' && 
                  !messageContent.includes('tool_result') && 
                  !messageContent.includes('<command-') &&
                  messageContent.trim().length > 0) {
                userMessageCount++;
                
                if (sampleMessages.length < 20) {
                  sampleMessages.push({
                    content: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : ''),
                    length: messageContent.length
                  });
                }
              }
            }
          } catch (e) {
            // Skip parse errors
          }
        }
      }
    }
  }
}

console.log(`\n📊 Claude Code KnowledgeSite プロジェクト分析\n`);
console.log(`ユーザーメッセージ総数: ${userMessageCount}\n`);
console.log('サンプルメッセージ:');
console.log('='.repeat(80));

sampleMessages.forEach((msg, index) => {
  console.log(`${index + 1}. [${msg.length}文字] ${msg.content}`);
});

console.log('\n='.repeat(80));