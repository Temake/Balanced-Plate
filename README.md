# 🥗 Balanced Plate.AI

<div align="center">

![Balanced Plate Logo](https://img.shields.io/badge/Balanced%20Plate-AI%20Powered%20Nutrition-green?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTMgMmgxOHY4YTEwIDEwIDAgMCAxLTIwIDB6Ii8+PHBhdGggZD0iTTMgMmgxOHY4YTEwIDEwIDAgMCAxLTIwIDB6Ii8+PC9zdmc+)

**Transform your eating habits with AI-powered nutrition analysis**

[![Python](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square&logo=python)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.0-green?style=flat-square&logo=django)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Architecture](#-architecture) • [API](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**Balanced Plate.AI** is a comprehensive nutrition tracking application that leverages Google's Gemini AI to analyze food images and provide detailed nutritional insights. Simply snap a photo of your meal, and our AI instantly identifies food items, calculates nutritional content, and provides personalized recommendations for a healthier lifestyle.

### Why Balanced Plate?

- 🎯 **Accurate AI Analysis** - Powered by Google Gemini Vision for precise food recognition
- ⚡ **Instant Results** - Get nutritional breakdown in seconds
- 📊 **Comprehensive Tracking** - Monitor calories, macros, and micronutrients
- 🎨 **Beautiful Interface** - Modern, responsive design with dark mode support
- 🔄 **Real-time Updates** - WebSocket integration for live notifications
- 📱 **Mobile-Ready** - Fully responsive design for all devices

---

## ✨ Features

### 🍽️ Food Analysis
- **AI-Powered Recognition** - Upload or capture food images for instant analysis
- **Detailed Nutrition Data** - Calories, proteins, carbs, fats, and micronutrients
- **Portion Estimation** - Smart portion size detection
- **Balance Scoring** - Get a 0-100 meal balance score

### 📊 Dashboard & Analytics
- **Real-time Statistics** - Daily, weekly, and monthly nutrition overview
- **Interactive Charts** - Visualize your nutrition journey
- **Meal Timing Analysis** - Track when and what you eat
- **Food Group Distribution** - See your diet composition

### 🎯 Personalized Recommendations
- **AI-Generated Insights** - Smart suggestions based on your eating patterns
- **Weekly Reports** - Comprehensive weekly nutrition summaries
- **Goal Tracking** - Set and monitor nutritional goals
- **Improvement Tips** - Actionable advice for better nutrition

### 🔔 Smart Notifications
- **Real-time Alerts** - WebSocket-powered instant notifications
- **Analysis Completion** - Get notified when food analysis is ready
- **Weekly Summaries** - Automated weekly recommendation generation

---

## 🖥️ Demo

### Landing Page
![Landing Page](docs/images/landing.png)

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Food Analysis
![Food Analysis](docs/images/analysis.png)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Django 5.0** | Web framework |
| **Django REST Framework** | API development |
| **Django Channels** | WebSocket support |
| **Celery** | Async task processing |
| **Redis** | Message broker & caching |
| **PostgreSQL** | Primary database |
| **Google Gemini AI** | Food image analysis |
| **Daphne** | ASGI server |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **TanStack Query** | Data fetching & caching |
| **Tailwind CSS** | Styling |
| **Recharts** | Data visualization |
| **Shadcn/ui** | UI components |
| **React Router** | Navigation |

### AI/ML
| Technology | Purpose |
|------------|---------|
| **Google Gemini 1.5** | Vision & text AI model |
| **Food Segmentation** | Image preprocessing |

---

## 📦 Installation

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Redis Server**
- **PostgreSQL** (optional, SQLite for development)
- **Google Cloud API Key** (for Gemini AI)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/balanced-plate.git
cd balanced-plate

# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend/balanced_plate

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Running Celery Workers

```bash
# In a separate terminal, navigate to backend
cd backend

# Activate virtual environment
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Start Celery worker
celery -A config.celery worker -l info -Q celery,email-notification,recommendations,beats --pool=solo
```

### Running with WebSocket Support

```bash
# Use Daphne instead of Django's runserver
cd backend
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgres://user:password@localhost:5432/balanced_plate

# Redis
REDIS_URL=redis://localhost:6379/0

# Google AI
GOOGLE_API_KEY=your-google-api-key

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_HOST=localhost:8000
```

---

## 🏗️ Architecture

```
balanced-plate/
├── backend/                    # Django backend
│   ├── config/                # Project configuration
│   │   ├── settings/         # Environment-specific settings
│   │   ├── celery/           # Celery configuration
│   │   └── urls.py           # Main URL routing
│   ├── core/                  # Core application modules
│   │   ├── account/          # User authentication & profiles
│   │   ├── analytics/        # Nutrition analytics API
│   │   ├── file_storage/     # File upload handling
│   │   ├── recommendations/  # AI recommendations
│   │   ├── results/          # Food analysis results
│   │   ├── utils/            # Shared utilities
│   │   └── websocket/        # WebSocket consumers
│   ├── media/                # User uploaded files
│   └── requirements.txt      # Python dependencies
│
├── frontend/                  # React frontend
│   └── balanced_plate/
│       ├── src/
│       │   ├── api/          # API client & types
│       │   ├── components/   # React components
│       │   │   ├── dashboard/   # Dashboard components
│       │   │   ├── landing/     # Landing page components
│       │   │   └── ui/          # Shadcn UI components
│       │   ├── contexts/     # React contexts
│       │   ├── hooks/        # Custom React hooks
│       │   ├── pages/        # Page components
│       │   └── utils/        # Utility functions
│       └── package.json      # Node dependencies
│
├── ai/                        # AI model documentation
│   └── model/
│       ├── food-segmentation/
│       └── food-vision/
│
└── bot/                       # Telegram bot (optional)
```

---

## 📡 API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup/` | POST | Register new user |
| `/api/auth/login/` | POST | User login |
| `/api/auth/logout/` | POST | User logout |
| `/api/auth/token/refresh/` | POST | Refresh JWT token |

### Food Analysis

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/results/` | GET | List all analyses |
| `/api/results/<id>/` | GET | Get analysis details |
| `/api/upload/` | POST | Upload food image for analysis |

### Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/nutrition/<id>/food-group-grams/` | GET | Get food group data in grams |
| `/api/analytics/nutrition/<id>/food-group-percentage/` | GET | Get food group percentages |
| `/api/analytics/nutrition/<id>/daily-balance-score/` | GET | Get daily balance scores |
| `/api/analytics/meal-timing/` | GET | Get meal timing data |

### Recommendations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/recommendations/` | GET | List weekly recommendations |
| `/api/recommendations/<id>/` | GET | Get recommendation details |

---

## 🔌 WebSocket Events

Connect to: `ws://localhost:8000/ws/notifications/?token=<jwt_token>`

### Events

| Event Type | Description |
|------------|-------------|
| `connection_established` | WebSocket connected successfully |
| `analysis_completed` | Food analysis finished |
| `analysis_failed` | Food analysis failed |
| `recommendation_ready` | New weekly recommendation available |

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
cd frontend/balanced_plate
npm run test
```

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

1. Set `DEBUG=False` in production
2. Configure production database (PostgreSQL recommended)
3. Set up Redis for Celery and Channels
4. Use Daphne or Uvicorn for ASGI
5. Configure reverse proxy (Nginx recommended)
6. Set up SSL certificates

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Python**: Follow PEP 8, use Black formatter
- **TypeScript**: Follow ESLint configuration
- **Commits**: Use conventional commits

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Lead Developer** - Full-stack development
- **AI Engineer** - Gemini AI integration
- **UI/UX Designer** - Interface design

---

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powerful vision capabilities
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Django](https://djangoproject.com/) for robust backend framework

---

<div align="center">

**Made with ❤️ for healthier lives**

[⬆ Back to Top](#-balanced-plateai)

</div>
