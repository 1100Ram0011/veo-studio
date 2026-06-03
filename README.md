# VeoStudio — AI Video + Script Platform

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Setup Checklist

### 1. Backend .env file bharo
`backend/.env` file mein ye values daalo:
- `MONGO_URI` — MongoDB Atlas se free cluster banao
- `JWT_SECRET` — koi bhi random string
- `FRONTEND_URL` — deployment ke baad Vercel URL

### 2. Gemini API Key
- aistudio.google.com pe jao
- Free API key lo
- App ke Script tab mein daalo

### 3. Deploy karna hai?
- **Backend** → railway.app (free)
- **Frontend** → vercel.com (free)
- **Database** → mongodb.com/atlas (free M0 cluster)

## Project Structure

```
veo-studio/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScriptGenerator.jsx  ← Gemini AI Script (NEW)
│   │   │   ├── Generate.jsx         ← VeoAI Video
│   │   │   ├── History.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Plans.jsx
│   │   ├── App.jsx
│   │   └── config.js
│   └── package.json
└── backend/
    ├── services/
    │   └── veoai.js     ← Auto nonce fetch + cookie jar (FIXED)
    ├── routes/
    │   ├── video.js
    │   └── auth.js
    ├── server.js
    ├── .env             ← Fill karo!
    └── package.json
```

## Tabs
- ✍️ Script — Gemini AI se video script banao
- ⚡ Generate — VeoAI se video banao
- 📁 History — Purani videos
- 📊 Analytics — Stats
- 💎 Plans — Upgrade
