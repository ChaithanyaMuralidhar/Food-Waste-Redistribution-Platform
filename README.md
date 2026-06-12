# Food Waste Redistribution Platform (FoodShare)

A full-stack platform connecting restaurants with surplus food to NGOs and volunteers — reducing waste and feeding communities.

## Problem

Restaurants and events waste large amounts of food while many people go hungry.

## Solution

- **Restaurants** post surplus food listings
- **NGOs & volunteers** receive instant notifications
- **Coordinate pickups** and track redistribution impact
- **AI-ready** extension layer for smart categorization and recommendations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens) |

## Project Structure

```
Food Waste Redistribution Platform/
├── frontend/          # Static HTML/CSS/JS client
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── css/
│   └── js/
├── backend/           # Express REST API
│   ├── server.js
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── services/
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

The API runs at `http://localhost:5000`.

### 2. Frontend Setup

Open the `frontend` folder with any static file server, or use Live Server in VS Code:

```bash
cd frontend
npx serve .
```

The frontend runs at `http://localhost:3000` (or the port your server uses).

> Update `API_BASE` in `frontend/js/api.js` if your backend runs on a different port.

### 3. Create Accounts

Register with different roles to test the full flow:

| Role | Can Do |
|------|--------|
| **Restaurant** | Post surplus food, manage listings |
| **NGO** | Browse, claim food, get notifications |
| **Volunteer** | Browse, claim food, get notifications |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Food Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/food/available` | List available food |
| POST | `/api/food` | Create listing (restaurant) |
| GET | `/api/food/my-listings` | Restaurant's listings |
| GET | `/api/food/my-claims` | NGO/volunteer claims |
| POST | `/api/food/:id/claim` | Claim food |
| POST | `/api/food/:id/pickup` | Mark as picked up |
| POST | `/api/food/:id/cancel` | Cancel listing |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### AI Extension (ready for ML integration)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/classify` | Classify food category |
| POST | `/api/ai/enrich` | Enrich listing with AI metadata |
| GET | `/api/ai/recommendations` | Get prioritized recommendations |
| GET | `/api/ai/stats` | Platform impact statistics |

## User Flow

```
Restaurant posts food → AI enriches listing → NGOs/Volunteers notified
     → Claim food → Coordinate pickup → Mark picked up → Impact tracked
```

## AI Extension

The `backend/services/aiService.js` module provides a pluggable layer:

- **Food classification** — auto-categorize by title/description
- **Priority scoring** — rank by expiry urgency
- **Tag generation** — dietary tags (vegetarian, halal, etc.)
- **Recommendations** — prioritized food suggestions

Replace the rule-based stubs with real ML models (OpenAI, Hugging Face, custom models) without changing the API contract.

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/food-waste-redistribution
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

## License

MIT
