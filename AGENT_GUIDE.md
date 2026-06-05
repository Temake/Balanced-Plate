# Balanced Plate AI — Agent Onboarding & Development Guide

> A comprehensive guide for any AI agent or developer working on this project.

---

## 1. Project Overview

**Balanced Plate AI** is a Nigerian-focused food accountability and behavior-change web application. Users scan their meals with AI, get culturally relevant advice in a conversational Nigerian tone, plan meals, learn about healthier eating, and track their food habits.

**This is NOT a calorie-counting app.** It is an accountability + behavior-change system.

### Target Users
- Nigerians (primary market)
- Young adults, workers, students
- People trying to eat healthier but lacking discipline
- Users with dietary preferences (keto, vegetarian, etc.)
- Users with medical restrictions (diabetes, hypertension)

---

## 2. Tech Stack

### Frontend
| Tech | Version | Purpose |
|------|---------|---------|
| React | 19.1 | UI framework |
| TypeScript | 5.8 | Type safety |
| Vite | 7.x | Build tool & dev server |
| Tailwind CSS | 4.x (v4) | Styling (via `@tailwindcss/vite` plugin) |
| shadcn/ui | latest | UI component library (new-york style) |
| TanStack React Query | 5.x | Server state management |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Recharts | 3.x | Data visualization |
| Sonner | 2.x | Toast notifications |
| Lucide React | latest | Icon library |
| Zod | 4.x | Schema validation |
| React Hook Form | 7.x | Form management |

### Backend
| Tech | Version | Purpose |
|------|---------|---------|
| Django | 5.2 | Web framework |
| Django REST Framework | 3.16 | REST API |
| PostgreSQL | 15 | Database (SQLite for dev) |
| Redis | 7 | Cache + Celery broker + WebSocket channel layer |
| Celery | 5.5 | Async task processing |
| Django Channels | 4.3 | WebSocket support |
| Daphne | 4.2 | ASGI server |
| Google Gemini AI | 2.0 Flash | Vision + LLM (food analysis, recommendations) |
| SimpleJWT | 5.5 | JWT authentication |
| django-storages + boto3 | latest | S3/DigitalOcean Spaces file storage |

### Deployment
- **Frontend**: Vercel
- **Backend**: Docker Compose (Daphne + Celery + PostgreSQL + Redis + Nginx)
- **Storage**: DigitalOcean Spaces (S3-compatible)

---

## 3. Project Structure

```
Balanced-Plate/
├── frontend/balanced_plate/     # React + TypeScript SPA
│   ├── index.html               # Entry HTML (Inter font, SEO meta)
│   ├── package.json             # Dependencies
│   ├── vite.config.ts           # Vite config (path alias @/ → ./src)
│   ├── components.json          # shadcn/ui config
│   └── src/
│       ├── App.tsx              # Root: providers + routing
│       ├── main.tsx             # Entry: QueryClient + ReactDOM
│       ├── index.css            # Design system (oklch colors, animations)
│       ├── api/
│       │   ├── axios.ts         # Axios instance + JWT interceptors
│       │   ├── constants.ts     # Token keys
│       │   └── types.ts         # All TypeScript interfaces
│       ├── components/
│       │   ├── Header.tsx       # Top nav + mobile bottom tabs
│       │   ├── ProtectedRoute.tsx
│       │   ├── theme-provider.tsx
│       │   ├── toggle.tsx       # Theme toggle
│       │   ├── FoodUploadSection.tsx
│       │   ├── RecentAnalysis.tsx
│       │   ├── common/          # ErrorBoundary, Skeletons
│       │   ├── dashboard/       # Dashboard widgets
│       │   ├── landing/         # Landing page sections
│       │   └── ui/              # shadcn/ui primitives
│       ├── context/
│       │   ├── AuthContext.tsx   # Auth state (login, signup, OTP)
│       │   └── FilesContext.tsx  # File upload state
│       ├── contexts/
│       │   └── WebSocketContext.tsx  # Real-time notifications
│       ├── hooks/
│       │   ├── useAuth.tsx
│       │   ├── useFiles.tsx
│       │   ├── useNutritionAnalytics.ts
│       │   └── useWebSocket.ts
│       ├── pages/               # Route components
│       └── utils/
│           └── imageUrl.ts
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/                  # Django settings, URLs, ASGI, Celery
│   │   ├── settings/base.py     # Main settings
│   │   ├── urls.py              # Root URL config
│   │   └── celery/              # Celery app + queue config
│   ├── core/
│   │   ├── account/             # User model, auth views, serializers
│   │   ├── analytics/           # Nutrition analytics endpoints
│   │   ├── file_storage/        # File upload handling
│   │   ├── recommendations/     # Weekly AI recommendations
│   │   ├── results/             # Food analysis (Gemini AI integration)
│   │   ├── utils/               # Shared: services, permissions, tasks
│   │   └── websocket/           # WS consumers + routing
│   └── devops/                  # Nginx, server scripts
│
├── ai/model/                    # Placeholder for future custom models
└── bot/                         # Telegram bot (image collection)
```

---

## 4. Design System

### Color Palette (oklch)
The app uses a **soft green / natural tone** palette defined in `src/index.css`:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | Sage green | Bright sage | Buttons, active states, CTAs |
| `--background` | Warm off-white | Deep forest green-black | Page backgrounds |
| `--card` | Clean white | Dark card | Card surfaces |
| `--accent` | Light emerald tint | Dark emerald tint | Highlighted surfaces |
| `--muted` | Gentle gray-green | Dark gray-green | Secondary text, disabled |
| `--destructive` | Red | Bright red | Errors, delete actions |

### Chart Colors (food-inspired)
- Chart 1: Leafy green
- Chart 2: Golden turmeric
- Chart 3: Warm terracotta
- Chart 4: Ocean teal
- Chart 5: Berry purple

### Typography
- **Font**: Inter (loaded from Google Fonts)
- **Headings**: font-weight 600-700, letter-spacing -0.01em to -0.02em
- **Body**: Regular weight, readable

### Animations (custom keyframes in index.css)
- `animate-fade-in`, `animate-fade-in-up`, `animate-fade-in-down`
- `animate-scale-in`, `animate-slide-in-right`, `animate-slide-in-left`
- `animate-pulse-soft`, `animate-shimmer`
- Delay utilities: `delay-75` through `delay-500`

### Navigation Pattern
- **Desktop (md+)**: Sticky top header with centered nav links
- **Mobile (<md)**: Bottom tab navigation (5 tabs: Home, Scan, Plan, Explore, Profile)
- **IMPORTANT**: All protected pages must include `BOTTOM_NAV_HEIGHT` class (`pb-20 md:pb-0`) to prevent content from being hidden behind the mobile bottom nav.

```tsx
import Header, { BOTTOM_NAV_HEIGHT } from '@/components/Header';

// In the page component:
<div className={`min-h-screen bg-background flex flex-col ${BOTTOM_NAV_HEIGHT} md:pb-0`}>
  <Header />
  <main>...</main>
</div>
```

---

## 5. API Endpoints

### Base URL
- Production: `https://api.balancedplate.me/api`
- WebSocket: `wss://api.balancedplate.me/ws/notifications/`
- Dev: configured via `.env` → `VITE_API_BASE_URL`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login/` | Login → JWT tokens + user data |
| POST | `/auth/logout/` | Logout (blacklists refresh) |
| POST | `/auth/token/refresh/` | Refresh access token |
| POST | `/accounts/` | Register new user |
| GET | `/accounts/me/` | Get current user profile |
| PATCH | `/accounts/me/` | Update user profile |

### Food Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/files/` | Upload food image (auto-triggers analysis) |
| GET | `/results/` | List all analyses |
| GET | `/results/<id>/` | Analysis detail |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/nutrition/<id>/food-group-grams/` | Food group data |
| GET | `/analytics/nutrition/<id>/daily-balance-score/` | Daily balance scores |
| GET | `/analytics/meal-timing/` | Hourly calorie distribution |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations/` | List weekly recommendations |

---

## 6. Provider Hierarchy

```
QueryClientProvider (React Query)
  └── ThemeProvider (light/dark)
       └── AuthProvider (single instance — NOT duplicated)
            └── WebSocketProvider (needs auth for JWT token)
                 └── FilesProvider
                      └── BrowserRouter + Routes
```

> ⚠️ **CRITICAL**: AuthProvider must be a SINGLE instance. It was previously duplicated in both main.tsx and App.tsx — this was fixed in Phase 1.

---

## 7. Routing

| Path | Component | Auth | Status |
|------|-----------|------|--------|
| `/` | LandingPage | Public | ✅ |
| `/login` | LoginPage | Public | ✅ |
| `/signup` | SignUp | Public | ✅ |
| `/otp` | Otp | Public | ✅ |
| `/forget-password` | ForgetPassword | Public | ✅ |
| `/reset-password` | ResetPassword | Public | ✅ |
| `/dashboard` | Dashboard | Protected | ✅ |
| `/analyze-food` | AnalyseFood | Protected | ✅ |
| `/learn` | Learn | Protected | 🚧 Placeholder |
| `/shopping` | Shopping | Protected | 🚧 Placeholder |
| `/recipes` | Recipes | Protected | 🚧 Placeholder |
| `/history` | AnalysisHistory | Protected | ✅ |
| `/profile` | Profile | Protected | ✅ |
| `/onboarding` | — | Protected | ❌ Not yet |
| `/meal-plan` | — | Protected | ❌ Not yet |
| `/articles/:id` | — | Protected | ❌ Not yet |
| `/cook/:id` | — | Protected | ❌ Not yet |
| `/health-report` | — | Protected | ❌ Not yet |

---

## 8. Remaining Implementation Phases

| Phase | Description | Priority | Status |
|-------|-------------|----------|--------|
| 1 | Design System + Bug Fixes | P0 | ✅ Complete |
| 2 | Onboarding Flow (5-screen wizard) | P0 | ❌ Not started |
| 3 | AI Response Overhaul (conversational + health-personalized) | P0 | ❌ Not started |
| 10 | Dashboard Redesign (accountability-focused) | P1 | ❌ Not started |
| 9 | Profile Enhancement (diet/health fields) | P1 | ❌ Not started |
| 4 | Meal Planning System | P1 | ❌ Not started |
| 5 | Blog/Education (static articles) | P2 | ❌ Not started |
| 6 | Cooking Assistant (AI-generated via Gemini) | P2 | ❌ Not started |
| 7 | Ingredient Ordering (mock shopping UI) | P2 | ❌ Not started |
| 8 | Healthcare Sharing (PDF/text export) | P2 | ❌ Not started |

See the full implementation plan at: `implementation_plan.md` in the conversation artifacts.

---

## 9. Key Backend Models

### Account (custom user model)
- Existing fields: `dietary_goal` (weight_loss/muscle_gain/energy_focus/general_health), `dietary_preference` (none/vegetarian/vegan/keto/gluten_free)
- **Needs adding**: `health_conditions` (JSONField), `onboarding_completed` (BooleanField)

### FoodAnalysis
- Current: returns structured JSON with `detected_foods`, `balance_score`, `next_meal_recommendations`
- **Needs adding**: `food_name`, `conversational_feedback`, `actionable_suggestion`, `alternative_suggestion`

### AI Prompts (already Nigerian-localized)
- Located in `core/results/services.py` (GeminiAnalysisService)
- Currently returns technical metrics — needs refactoring to return conversational Nigerian-tone feedback

---

## 10. Development Commands

```bash
# Frontend
cd frontend/balanced_plate
npm install          # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # Production build (tsc + vite build)
npx tsc --noEmit     # Type check only

# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver       # Development
daphne config.asgi:application   # Production (ASGI + WebSocket)
celery -A config worker -l info  # Celery worker
celery -A config beat -l info    # Celery scheduler
```

---

## 11. Important Rules for Agents

1. **Always use `bg-background`** instead of hardcoded `bg-gray-50 dark:bg-gray-900` — this uses the design system tokens
2. **Always import `BOTTOM_NAV_HEIGHT`** from Header.tsx and apply it to protected page containers
3. **Never duplicate AuthProvider** — it lives in App.tsx only
4. **Use Inter font** — it's loaded globally, no need to specify font-family
5. **Follow the soft green palette** — primary is sage green, avoid harsh colors or neon gradients
6. **Nigerian context first** — all food references, language, and suggestions should prioritize Nigerian culture
7. **Conversational AI tone** — AI responses should sound like a smart Nigerian friend, not a medical textbook
8. **Keep responses short** — AI feedback should be 3-5 sentences max
9. **Test with `npx tsc --noEmit`** before committing — ensure zero TypeScript errors
10. **Use existing shadcn/ui components** from `src/components/ui/` — don't reinvent buttons, dialogs, etc.
