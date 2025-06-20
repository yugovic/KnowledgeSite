# AI Content Gallery - YOUWARE Guide

## Project Overview
AIで作成したコンテンツを紹介するためのスタイリッシュなギャラリーサイトです。Supabaseをバックエンドとして使用し、画像アップロードとデータ管理を行います。

## Architecture
- **Frontend**: Pure HTML/CSS/JavaScript with modern design
- **Backend**: Supabase (Database + Storage)
- **Styling**: CSS Grid, Flexbox, CSS animations
- **Image Storage**: Supabase Storage bucket

## Database Schema
### Required Tables:
- `contents` table with columns:
  - `id` (UUID, primary key)
  - `title` (text)
  - `url` (text)
  - `description` (text)
  - `thumbnail_url` (text)
  - `created_at` (timestamp)

### Required Storage:
- `thumbnails` bucket for image uploads

## Supabase Setup Required
1. Create `contents` table with the schema above
2. Create `thumbnails` storage bucket
3. Set up appropriate RLS policies
4. Update the JavaScript constants:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`

## Key Features
- Responsive 3-column grid layout
- Drag & drop image upload
- Smooth animations and transitions
- Real-time content loading
- Mobile-first responsive design

## Development Notes
- Uses CSS Grid for responsive layout
- Implements backdrop-filter for glassmorphism effect
- Staggered animations for content cards
- Error handling for upload failures
- Form validation and user feedback

## Customization Points
- Color scheme in CSS variables
- Card layout and spacing
- Animation timings and effects
- Upload file size limits
- Image optimization settings