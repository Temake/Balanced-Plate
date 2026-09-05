# 🥗 NutriLens

<div align="center">

![NutriLens Banner](https://img.shields.io/badge/NutriLens-Eat%20well%2C%20Spend%20wise-059669?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTMgMmgxOHY4YTEwIDEwIDAgMCAxLTIwIDB6Ii8+PHBhdGggZD0iTTMgMmgxOHY4YTEwIDEwIDAgMCAxLTIwIDB6Ii8+PC9zdmc+)

**Eat well, Spend wise — Your AI-powered meal planning and nutrition companion**

[![Live App](https://img.shields.io/badge/Live%20Website-nutrilens.site-059669?style=flat-square)](https://nutrilens.site)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square&logo=python)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.0-green?style=flat-square&logo=django)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Overview](#-overview) • [Core Features](#-core-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Architecture](#-architecture) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**NutriLens** is an AI-driven nutrition and meal companion built to make healthy eating simple, practical, and budget-friendly. Instead of rigid calorie counting or expensive diet plans, NutriLens helps users understand everyday home-cooked meals in simple language and creates personalized meal plans designed around their actual food budget.

---

## ✨ Core Features

### 📸 1. Instant Food Scanner & Relatable Insights
- **Everyday Meal Recognition**: Snap a photo of any home-cooked or cultural meal (e.g., Jollof rice, Egusi soup, grilled proteins, salads) for immediate analysis.
- **Relatable Breakdown**: Delivers simple, conversational nutritional explanations without overwhelming scientific jargon.
- **Balance Scoring (0–100%)**: Clear visual scoring of plate balance, calorie estimation, and macronutrients (protein, carbs, fats).

### 💰 2. Budget-Smart Meal Planning
- **Wallet-Friendly Schedules**: Generates daily and weekly custom meal plans tailored to exact spending limits.
- **Accessible Ingredients**: Focuses on affordable, locally available market ingredients.
- **Interactive Calendar & Swaps**: Easily customize, swap, or re-generate specific meals for any day of the week.

### 👨‍🍳 3. Interactive AI Cooking Assistant
- **Step-by-Step Directions**: Guides users through preparing balanced home meals with ingredients they already have.
- **Integrated Timers & Tips**: Built-in cooking timers, portion suggestions, and kitchen guidance.

### 📊 4. Health Analytics & Weekly Reports
- **Dynamic Charts**: Track daily calorie balance, macronutrient ratios, and meal timing.
- **Weekly Health Summaries**: Automatically generated health reports and priority actions delivered every week.
- **Personalized Context**: AI recommendations adjust according to age group (Under 18 to 65+), dietary goals (weight loss, muscle gain, energy), and health conditions (diabetes, hypertension, etc.).

### 💳 5. Billing & Subscription Tiers
- **Paystack Integration**: Secure multi-tier subscription payments (Free, Plus, Pro).
- **Demo Access Invites**: Administrative temporary full-feature invite links with configurable duration and redemption limits.

### 💬 6. Integrated In-App Feedback System
- Direct user feedback submission accessible right from the user profile dropdown.
- Category tagging for bug reports, suggestions, feature requests, and general notes.

### 🛡️ 7. Production-Grade Security & Throttling
- Redis-backed rate limiting across all sensitive and unauthenticated endpoints to stop brute-forcing and email spamming.

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Django 5.0** & **DRF** | Robust REST API backend |
| **Google Gemini 1.5 Vision / Pro** | Multimodal food analysis, meal planning & cooking intelligence |
| **Django Channels & Daphne** | Asynchronous WebSockets for real-time analysis notifications |
| **Celery & Redis** | Asynchronous background tasks, report generation & email dispatch |
| **PostgreSQL** | Primary relational database |
| **Paystack API** | Recurring subscription billing & webhooks |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | High-performance user interface |
| **TypeScript** | Full end-to-end type safety |
| **Vite** | Lightning-fast build tool & dev server |
| **Tailwind CSS & Shadcn/UI** | Responsive, emerald-themed design system |
| **TanStack Query (React Query)** | Client-side caching and asynchronous state management |
| **Lucide React** | Consistent, modern iconography |

---

## 🏗️ Architecture

```
Balanced-Plate/
├── backend/
│   ├── config/                     # Project configuration & settings
│   │   ├── celery/                 # Celery app & task queues
│   │   ├── settings/               # Base, development & production settings
│   │   ├── asgi.py                 # ASGI entrypoint for WebSockets
│   │   └── urls.py                 # Root URL routing
│   └── core/
│       ├── account/                # User authentication, onboarding & profile
│       ├── analytics/              # Nutrition graphs, macro distribution & meal timing
│       ├── billing/                # Subscriptions, Paystack & demo invites
│       ├── cooking/                # AI interactive cooking guides
│       ├── file_storage/           # Cloud/local media uploads
│       ├── meal_plan/              # Budget-aware AI meal plan generation
│       ├── pricing/                # Public pricing tiers
│       ├── recommendations/        # Weekly AI health recommendations
│       ├── results/                # Food scan analysis & Gemini vision engine
│       ├── system/                 # Feedback & platform health
│       └── utils/                  # Shared helpers, email templates & exceptions
│
├── frontend/
│   └── balanced_plate/
│       ├── src/
│       │   ├── api/                # Axios instance & TypeScript definitions
│       │   ├── components/         # Reusable UI, dialogs, charts & layout
│       │   ├── contexts/           # Authentication & application context
│       │   ├── hooks/              # Custom query & mutation hooks
│       │   ├── pages/              # Dashboard, Scanner, Meal Plan, Recipes, Profile
│       │   └── lib/                # Utility helpers & styling functions
│       ├── index.html
│       └── vite.config.ts
```

---

## 📦 Installation & Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**
- **Redis Server**
- **PostgreSQL** (or SQLite for quick local development)
- **Google Gemini API Key**

---

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/Temake/Balanced-Plate.git
cd Balanced-Plate/backend

# Create and activate virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials, GEMINI_API_KEY, and SECRET_KEY

# Run database migrations
python manage.py migrate

# Create an administrator account
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

---

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd ../frontend/balanced_plate

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start frontend development server
npm run dev
```

---

### 3. Celery Worker (Background Tasks)

```bash
# In a separate terminal with virtualenv activated
cd backend
celery -A config.celery worker -l info -Q celery,email-notification,recommendations,beats --pool=solo
```

---

## 📡 API Reference

### Authentication & Account
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/accounts/` | Register new user account |
| `POST` | `/api/auth/login/` | Log in and obtain JWT access/refresh tokens |
| `POST` | `/api/auth/logout/` | Invalidate current session |
| `POST` | `/api/auth/token/refresh/` | Refresh JWT access token |
| `POST` | `/api/auth/signup/resend-otp/` | Resend email verification code |
| `POST` | `/api/auth/signup/verify-otp/` | Verify signup OTP |
| `POST` | `/api/auth/password/reset/initiate/` | Request password reset code |
| `POST` | `/api/auth/password/reset/finalize/` | Reset password using verified OTP |
| `GET` / `PATCH` | `/api/accounts/me/` | View or update profile (age group, goals, diet) |
| `POST` | `/api/accounts/me/complete-onboarding/` | Submit initial onboarding wizard data |

### Food Analysis (AI Vision)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload/` | Upload meal image and trigger AI nutrition analysis |
| `GET` | `/api/results/` | List user's historical meal scans (paginated) |
| `GET` | `/api/results/<id>/` | Retrieve full nutritional breakdown for a scan |

### Budget Meal Planning
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/meal-plans/generate/` | Generate complete weekly meal plan matching budget |
| `POST` | `/api/meal-plans/generate-day/` | Re-generate meal plan for a specific day |
| `GET` | `/api/meal-plans/` | List active user meal plans |
| `POST` | `/api/meal-plans/entries/` | Upsert custom meal entries |

### Interactive Cooking Assistant
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cooking/generate/` | Generate step-by-step guided recipe from ingredients |

### Billing & Demo Invites
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/billing/plans/` | List available subscription tiers |
| `GET` | `/api/billing/subscription/` | Get current user subscription status & entitlements |
| `POST` | `/api/billing/initialize/` | Initialize Paystack payment transaction |
| `POST` | `/api/billing/verify/` | Verify completed Paystack transaction |
| `POST` | `/api/billing/demo-invites/` | *(Admin only)* Create demo access invite token |
| `POST` | `/api/billing/demo-invites/redeem/` | Redeem demo invite token for free Pro access |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/feedback/` | Submit user feedback (bug, suggestion, feature request) |

---

## 🔒 Security & Rate Limiting

The backend enforces intelligent Redis-backed request throttling:
* **Anonymous Requests**: `50/minute`
* **Authenticated Requests**: `120/minute`
* **Login Attempts**: `10/minute`
* **OTP Verification**: `10/hour` (prevents brute-force)
* **OTP Generation**: `5/hour` (prevents email bombing)
* **AI Analysis**: `20/hour` (prevents automated Vision API drain)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">

**Eat well, Spend wise — [NutriLens](https://nutrilens.site)**

</div>
