# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **KnowledgeSite** - a Japanese AI content gallery web application that showcases AI-generated content and business ideas. The project consists of two main HTML pages with no build system - it's a static site that uses modern web technologies.

## Architecture

- **Type**: Static HTML/CSS/JavaScript web application
- **Language**: Japanese (ja)
- **Backend**: Supabase (Database + Storage + Authentication)
- **Frontend**: Pure HTML with modern CSS and vanilla JavaScript
- **Styling**: CSS Grid, Flexbox, CSS Custom Properties, GSAP animations
- **Dependencies**: 
  - Supabase JS SDK (via CDN)
  - GSAP (via CDN)
  - Poppins font (Google Fonts)

## File Structure

```
source_code/
├── index.html          # Main gallery page - AI content showcase
├── business-ideas.html # Business ideas page with CRUD functionality
├── YOUWARE.md         # Project documentation
└── *.png              # Image assets
```

## Key Pages

### index.html
- Main AI content gallery with authentication
- Features: Gallery view, collections, directory, upload with auth
- Supabase tables: `contents` table
- Authentication: Email/password with Supabase Auth

### business-ideas.html  
- Business ideas showcase with full CRUD operations
- Features: Card flip animations, image upload, edit/delete functionality
- Supabase tables: `business_ideas` table
- No authentication required

## Database Schema

### Required Supabase Tables:

**contents** (for index.html):
- `id` (UUID, primary key)
- `title` (text)
- `url` (text) 
- `description` (text)
- `category` (text)
- `back_message` (text)
- `thumbnail_url` (text)
- `created_at` (timestamp)

**business_ideas** (for business-ideas.html):
- `id` (UUID, primary key)
- `title` (text)
- `url` (text)
- `description` (text) 
- `back_message` (text)
- `thumbnail_url` (text)
- `created_at` (timestamp)

### Required Supabase Storage:
- `thumbnails` bucket for image uploads with public access

## Development Commands

This is a static site with no build process. To develop:

```bash
# Serve locally (any static server)
python -m http.server 8000
# or
npx serve source_code/
```

## Key Features

- **Responsive Design**: Mobile-first approach with CSS Grid
- **Image Upload**: Drag & drop with automatic resizing (800x600, 0.8 quality)
- **Card Animations**: Flip cards with GSAP animations and CSS transforms
- **Authentication**: Supabase Auth integration (index.html only)
- **CRUD Operations**: Full create, read, update, delete (business-ideas.html)
- **Japanese UI**: All interface text in Japanese

## Supabase Configuration

Both pages require Supabase configuration with hardcoded credentials in JavaScript:
- `SUPABASE_URL` and `SUPABASE_KEY` constants
- RLS policies should be configured appropriately
- Storage bucket permissions for image uploads

## Styling Architecture

- **CSS Custom Properties**: Consistent color scheme and spacing
- **Modern CSS**: Grid, Flexbox, backdrop-filter, CSS animations
- **Component-based**: Modular CSS classes for cards, modals, forms
- **Responsive**: Breakpoints for mobile (<768px)

## Image Handling

- **Upload**: Automatic resizing to 800x600 with 0.8 JPEG quality
- **Storage**: Supabase Storage with public URLs
- **Fallback**: CSS background on image load errors
- **Optimization**: File naming with timestamps + random strings

## Animation System

- **GSAP**: Used for complex animations (index.html)
- **CSS Animations**: Fade-in effects with staggered delays
- **Transitions**: Smooth hover effects and modal animations
- **3D Effects**: Card flip animations with CSS transforms

## Translation and Conversation Memories

- **Translation Request**: Actual conversation samples requested
  - 1. Interest in obtaining 20 real conversation samples for translation purposes

When working on this project, focus on maintaining the Japanese language interface and the modern, clean design aesthetic. The codebase uses vanilla JavaScript with async/await patterns for Supabase operations.