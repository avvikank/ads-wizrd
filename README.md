# Meta Ad Agent: High-Density Intelligence Dashboard

An expert-grade AI system for analyzing Meta ads and generating high-performance creative hooks. This project was built for professional media buyers who require high-density data deconstruction and rapid creative iteration.

## 🚀 Key Features
- **Ultra-Dense Bento Dashboard**: 12-column widget grid designed for maximum information density.
- **KPI Intelligence Row**: Instant insights into Primary Levers, Statistical Weights, and Market Moats.
- **Hook Sandbox**: Interactive playground for rapidly prototyping psychological ad triggers.
- **Variant Matrix**: Comparative analysis of competitor creative atoms in a condensed, scrutinizable format.
- **Deep Market Synthesis**: AI-driven "Competitor Contrast" and "Immutable Creative Laws".

## 🛠️ Architecture
- **Frontend**: Next.js 14, React, Tailwind CSS (Vanilla CSS Design System).
- **Backend**: FastAPI, Google Gemini Pro API, Playwright (Scraping).
- **Design Standard**: 8px/16px Grid System, "Midnight Slate" Palette.

## 📦 Deployment Instructions
Please refer to the [Deployment Guide](./brain/deployment_guide.md) for step-by-step instructions on hosting this application on Vercel and Render.

## Setup Instructions

### Backend
1. Navigate to the root folder.
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend
**Note**: Requires Node.js installed on your machine.

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

## workflow
1. **Input**: Enter a URL to automatically extract keywords.
2. **Search**: Use the generated Meta Ad Library links.
3. **Collect**: Paste ad snapshot URLs into the collector.
4. **Analyze**: Get structured teardowns and new ad concepts.
