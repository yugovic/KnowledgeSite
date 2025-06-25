# Claude Code Summary Analyzer

A comprehensive analyzer for Claude Code usage that generates personality insights, usage patterns, and fun nicknames based on your conversation history with Claude.

## Features

- 🤖 **Personality Analysis**: Analyzes your communication style across 4 dimensions:
  - 😊 Politeness (丁寧さ)
  - 🔬 Technical level (技術的)
  - 🧘 Patience (我慢強さ)
  - 🚀 Curiosity (好奇心)

- 🏷️ **Nickname Generation**: Creates a unique Japanese nickname based on your dominant personality traits

- 📊 **Usage Statistics**: 
  - Total messages exchanged
  - User vs Claude message ratio
  - Most used keywords and commands
  - Project-by-project breakdown

- 🎨 **Multiple Interfaces**:
  - Command-line analyzer
  - Web-based analyzer
  - Integrated into website profile section

## Usage

### 1. Command Line Analysis

```bash
# Analyze specific project (only recent files)
node analyze-user.js

# Analyze ALL Claude Code sessions
node analyze-all-claude-sessions.js

# Run advanced analyzer with dashboard
node claude-companion.js --dashboard
```

### 2. Web-Based Analyzer

Open `claude-summary-analyzer.html` in your browser and upload JSONL files from `~/.claude/projects/`

### 3. Integrated in Website

1. Navigate to the main website
2. Click on "Myself" in the floating navigation
3. Find the "Claude Code Analysis" section
4. Click the analyze button and upload your JSONL files

## File Locations

Claude Code stores conversation logs in:
```
~/.claude/projects/[project-name]/*.jsonl
```

## Personality Scoring

The analyzer evaluates messages for:

- **Politeness**: Use of polite expressions (ください, お願い, ありがとう)
- **Technical**: Technical terms and commands usage
- **Patience**: Repetition of similar requests, persistence
- **Curiosity**: Questions, exploratory language

## Example Nicknames

Based on personality combinations:
- 🎩 礼儀正しいエンジニア (Polite Engineer)
- 🧙‍♂️ コードウィザード (Code Wizard)  
- 🚀 技術探検家 (Tech Explorer)
- 🌟 学びの求道者 (Learning Seeker)
- ⚡ マスタークラフター (Master Crafter)

## Development

The analyzer consists of:
- `js/claude-analyzer.js` - Core analysis engine
- `analyze-user.js` - Basic CLI analyzer
- `claude-companion.js` - Advanced analyzer with dashboard
- `claude-summary-analyzer.html` - Standalone web interface

## Notes

- The analyzer filters out tool results and command messages
- Scores are normalized to 0-10 scale
- Best results with multiple JSONL files from different sessions
- Japanese text detection is fully supported