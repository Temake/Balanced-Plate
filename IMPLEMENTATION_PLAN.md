# Balanced Plate AI — Nigerian Food Accountability System Refactor

Transform the existing nutrition-tracking app into a **Nigerian-focused food accountability and behavior-change system** with conversational AI responses, onboarding personalization, meal planning, and more.

---

## Current State vs. Target State

| Area | What Already Exists ✅ | What's Missing / Needs Change ❌ |
|------|----------------------|--------------------------------|
| **AI Prompts** | Already culturally localized for Nigeria/West Africa with `naija_grocery_list`, `stamina_forecast`, `simple_food_swaps` | Response still returns technical JSON (confidence scores, macros in grams). Need **conversational Nigerian-tone feedback** instead |
| **User Profile Fields** | `dietary_goal` (weight_loss, muscle_gain, energy_focus, general_health) and `dietary_preference` (none, vegetarian, vegan, keto, gluten_free) already exist on Account model | Missing: `health_conditions` (diabetes, hypertension), `onboarding_completed` flag. Need to **expand dietary_goal** to include "eat_healthier" and "maintain" |
| **Food Recognition** | Gemini Vision already recognizes Nigerian foods | AI response format needs redesign — less clinical, more conversational |
| **Onboarding** | Direct signup → dashboard (no guided flow) | Need 4-5 screen onboarding wizard to collect goal, diet, health conditions |
| **Health Personalization** | ❌ Not implemented | AI must dynamically adjust responses for diabetes, keto, hypertension, weight loss |
| **Meal Planning** | ❌ Not implemented | Weekly meal timetable with AI-suggested Nigerian meals |
| **Blog/Education** | "Coming Soon" placeholder | Actual articles with Nigerian food tips |
| **Cooking Assistant** | "Coming Soon" placeholder (Recipes page) | Step-by-step chat-like cooking guide |
| **Ingredient Ordering** | "Coming Soon" placeholder (Shopping page) | Market/store suggestions with cart UI |
| **Healthcare Sharing** | ❌ Not implemented | Weekly PDF/text summary export |
| **Design** | Tailwind v4 + Shadcn/ui, green accent, dark/light mode | Needs softer green palette, Inter font, calmer premium feel |
| **Navigation** | Desktop header + mobile hamburger sidebar | Need bottom tab navigation for mobile-first feel |

### 🐛 Bugs Found During Research

> [!WARNING]
> **Duplicate AuthProvider**: `AuthProvider` is wrapped TWICE — once in [main.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/main.tsx) and once in [App.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/App.tsx). The inner one in `App.tsx` creates a separate context, causing the outer one (which `WebSocketProvider` uses) to be disconnected from the actual user state. **Must fix**.

> [!NOTE]
> **Empty HeroSection**: [HeroSection.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/components/HeroSection.tsx) at root level is an empty placeholder (just an empty div). The actual landing hero is in `components/landing/HeroSection.tsx`. The root one can be deleted.

---

## User Review Required

## Confirmed Decisions

> [!NOTE]
> - **Tech Stack**: Keeping current **Vite + React + TypeScript** frontend with **Django + PostgreSQL + Celery + Redis** backend
> - **AI Provider**: Keeping **Google Gemini 2.0 Flash** — adjusting prompts only
> - **Blog Content**: **Static data** for MVP (no backend CMS)
> - **Cooking Assistant**: **AI-generated** step-by-step instructions via Gemini
> - **Responsive Design**: Web app with **responsive layouts** for all screen sizes (desktop, tablet, mobile). Bottom tab nav on mobile viewports, top header on desktop

---

## Proposed Changes

---

### Phase 1: Design System & UI Foundation + Bug Fixes

Overhaul the visual identity and fix existing bugs.

#### [MODIFY] [index.css](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/index.css)
- Replace current neutral oklch color system with a **soft green / natural tone** palette
  - Primary: soft sage green (`oklch(0.65 0.12 155)` range)
  - Background: warm off-white (`oklch(0.98 0.005 90)`)
  - Accents: muted terracotta, golden turmeric, deep leafy green
- Import **Inter** font from Google Fonts
- Add subtle animation keyframes (fade-in, slide-up, scale-in for micro-interactions)
- Keep dark mode support but with softer, warmer dark tones

#### [MODIFY] [index.html](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/index.html)
- Add Inter font preconnect + stylesheet link from Google Fonts
- Update `<title>` and meta description for Nigerian audience
- Add proper SEO meta tags (og:title, og:description, etc.)

#### [MODIFY] [main.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/main.tsx)
- **FIX BUG**: Remove the duplicate `AuthProvider` (keep it only in `App.tsx` or only in `main.tsx`, not both)
- Restructure provider hierarchy so WebSocketProvider has access to the single AuthProvider

#### [MODIFY] [App.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/App.tsx)
- Fix provider nesting (related to AuthProvider bug)
- Add `/onboarding` route (Phase 2)
- Add `/meal-plan` route (Phase 4)
- Add `/articles/:id` route (Phase 5)
- Add `/cook/:id` route (Phase 6)
- Add `/health-report` route (Phase 8)
- Add onboarding guard: redirect to `/onboarding` if `onboarding_completed === false`

#### [DELETE] [HeroSection.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/components/HeroSection.tsx)
- Empty placeholder component, not used by any real page

#### [MODIFY] [Header.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/components/Header.tsx)
- Restyle to match premium, minimal design with soft green palette
- Update navigation items: **Home, Scan, Plan, Explore, Profile**
- Add **bottom tab navigation** component for mobile viewports
- Simplify desktop header (thinner, more elegant)

---

### Phase 2: Onboarding Flow (CRITICAL NEW FEATURE)

Build a 5-screen guided onboarding that collects user preferences **after signup, before first dashboard access**.

#### [NEW] [Onboarding.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/Onboarding.tsx)
- Multi-step wizard with smooth slide transitions
- **Screen 1 — Welcome**: Soft food illustration, "Let's personalize your experience", "Get Started" CTA
- **Screen 2 — Goal Selection**: Card-based selection
  - "Lose Weight" / "Maintain Weight" / "Eat Healthier"
  - Maps to existing `dietary_goal` field (extend choices on backend)
- **Screen 3 — Diet Type**: Icon cards
  - "Keto" / "Vegetarian" / "Vegan" / "No Preference"
  - Maps to existing `dietary_preference` field
- **Screen 4 — Health Conditions**: Multi-select chips
  - "Diabetes" / "Hypertension" / "None"
  - Maps to new `health_conditions` JSONField
- **Screen 5 — All Set!**: "We'll guide your meals based on your lifestyle." → route to `/dashboard`
- Progress dots indicator at bottom
- "Skip" option (sets `onboarding_completed = true` with defaults)

#### [MODIFY] [types.ts](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/api/types.ts)
- Add `health_conditions: string[]`, `onboarding_completed: boolean` to `User` interface
- Update `dietary_goal` type to include new options ("maintain", "eat_healthier")
- Add `OnboardingData` interface

#### [MODIFY] [AuthContext.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/context/AuthContext.tsx)
- Add `completeOnboarding(data: OnboardingData)` method
- Update `loadCurrentUser` to always re-fetch (remove the `if (user) return` early exit that prevents profile refresh)

#### [MODIFY] [ProtectedRoute.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/components/ProtectedRoute.tsx)
- Add onboarding check: if authenticated but `onboarding_completed === false`, redirect to `/onboarding`

#### Backend Changes:

#### [MODIFY] [models.py](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/backend/core/account/models.py)
- Add `health_conditions` JSONField (default=list, stores ["diabetes", "hypertension"])
- Add `onboarding_completed` BooleanField (default=False)
- Extend `dietary_goal` choices: add "maintain", "eat_healthier"
- Keep existing `dietary_preference` choices (already has keto, vegetarian, vegan, none)

#### [MODIFY] [serializers.py](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/backend/core/account/serializers.py)
- Add `health_conditions`, `onboarding_completed` to serializer fields
- Create `OnboardingSerializer` for the onboarding PATCH endpoint

#### [MODIFY] [views.py](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/backend/core/account/views.py)
- Add `@action(detail=False, methods=['patch']) complete_onboarding` endpoint
- Accepts `dietary_goal`, `dietary_preference`, `health_conditions` and sets `onboarding_completed = True`

---

### Phase 3: AI Response Overhaul — Conversational + Health-Personalized

The AI prompts are already Nigerian-localized, but responses are still structured/clinical. Refactor to **conversational Nigerian-tone** responses that are **personalized to health conditions**.

#### Backend Changes:

#### [MODIFY] [services.py](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/backend/core/results/services.py) (GeminiAnalysisService)
- Refactor `ANALYSIS_PROMPT` to request a new response format:
  - `food_name`: What the AI identifies (e.g., "Jollof Rice with Chicken")
  - `conversational_feedback`: 3-5 sentence natural Nigerian-tone response (not metrics)
  - `actionable_suggestion`: 1 small practical tip
  - `alternative_suggestion`: Optional healthier alternative
  - Keep `detected_foods`, `meal_type`, `balance_score` for backend analytics (but don't prominently display them)
- **Add health-aware prompt context**: Before analysis, inject user's profile:
  ```
  User Profile: Goal={dietary_goal}, Diet={dietary_preference}, Conditions={health_conditions}
  
  If user has diabetes: Highlight sugar/carb impact, suggest lower-carb alternatives
  If user has hypertension: Highlight salt/oil concerns, suggest lighter preparation
  If user is on keto: Warn when food is high-carb, suggest fat/protein alternatives
  If user wants weight loss: Emphasize portion control, suggest balance
  ```
- Pass `user` object to `analyze_image()` so it can build personalized prompts

#### [MODIFY] `analyze_food_image_task` (Celery task in `core/utils/tasks/`)
- Pass user profile data (dietary_goal, dietary_preference, health_conditions) to the analysis service

#### [MODIFY] [models.py](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/backend/core/results/models.py) (FoodAnalysis)
- Add `food_name` CharField (max_length=200)
- Add `conversational_feedback` TextField
- Add `actionable_suggestion` TextField
- Add `alternative_suggestion` TextField (null=True, blank=True)
- Keep existing fields (`detected_foods`, `balance_score`, etc.) for backward compatibility

#### [MODIFY] [serializers.py](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/backend/core/results/serializers.py)
- Add new fields to the `FoodAnalysisSerializer`

#### Frontend Changes:

#### [MODIFY] [FoodUploadSection.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/components/FoodUploadSection.tsx)
- Redesign analysis result display:
  - Show food image + identified food name prominently
  - Display `conversational_feedback` as a friendly chat-like bubble (not a data table)
  - Show `actionable_suggestion` as a highlighted green tip card
  - Show `alternative_suggestion` if present as a secondary card
  - **Remove**: Balance scores, macronutrient grams, confidence percentages from the primary view
  - Add expandable "See Nutrition Details" section for power users who want the data

#### [MODIFY] [RecentAnalysis.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/components/RecentAnalysis.tsx)
- Show food name + feedback snippet instead of scores/technical data

---

### Phase 4: Meal Planning System (NEW FEATURE)

Weekly meal timetable with AI-suggested Nigerian meals.

#### [NEW] [MealPlanner.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/MealPlanner.tsx)
- Weekly calendar grid (Mon–Sun × Breakfast/Lunch/Dinner/Snack)
- Tap cell to add/edit a meal manually
- **"AI Suggest Week"** button → calls backend to generate culturally relevant meal plan
- Respects user's dietary_preference, health_conditions, dietary_goal
- Budget filter (Low / Medium / Flexible)
- Each meal card: food name, brief note, prep time estimate

#### [NEW] [MealPlanCard.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/components/meal-plan/MealPlanCard.tsx)
- Rounded card for individual meals with soft shadow
- Food name, health compatibility badge (green checkmark for compatible, amber warning for caution)

#### [NEW] [useMealPlan.ts](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/hooks/useMealPlan.ts)
- React Query hook for meal plan CRUD + AI generation

#### Backend:

#### [NEW] `backend/core/meal_plan/` — New Django app
- **models.py**:
  - `MealPlan`: `owner` (FK→Account), `week_start_date`, `budget_level` (low/medium/flexible), `created_at`
  - `MealEntry`: `meal_plan` (FK→MealPlan), `day` (mon-sun), `meal_type` (breakfast/lunch/dinner/snack), `food_name`, `description`, `prep_time_minutes`, `health_notes`, `is_ai_generated`
  - Unique together: `[owner, week_start_date]` on MealPlan
- **services.py**: `MealPlanGenerationService` extends `GeminiBaseService`
  - Sends user profile + budget + week dates to Gemini
  - Prompt asks for 7 days × 3-4 meals of realistic, affordable Nigerian meals
  - Returns structured JSON
- **views.py**: ModelViewSet + `@action generate_ai_plan`
- **serializers.py**: Standard DRF serializers
- **urls.py**: REST endpoints under `/api/meal-plans/`
- Register app in `INSTALLED_APPS` and `config/urls.py`

---

### Phase 5: Blog / Education Section (UPGRADE FROM PLACEHOLDER)

Replace the [Learn.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/Learn.tsx) "Coming Soon" with real content.

#### [MODIFY] [Learn.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/Learn.tsx)
- Replace "Coming Soon" with article feed
- Category tabs: "Eating Tips", "Food Swaps", "Health Basics", "Nigerian Kitchen"
- Article cards: title, excerpt, read time, category badge, soft rounded design
- Tapping card navigates to article detail

#### [NEW] [ArticleDetail.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/ArticleDetail.tsx)
- Full article view with rich text content
- Share button, related articles section
- Back navigation

#### [NEW] [articles.ts](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/data/articles.ts)
- Static article data for MVP (10-15 articles):
  - "Better ways to eat jollof without overdoing it"
  - "Simple swaps for healthier Nigerian meals"
  - "How to eat well on a student budget in Nigeria"
  - "Understanding what goes into your egusi soup"
  - "Why your garri and groundnut habit might need a tweak"
  - "Healthy suya — is it possible?"
  - "What to drink instead of soft drinks"
  - Articles for diabetics, hypertension patients, keto followers
- Each article: `id`, `title`, `excerpt`, `content` (markdown), `category`, `readTime`, `coverImage`

---

### Phase 6: Cooking Assistant (UPGRADE FROM PLACEHOLDER)

Replace [Recipes.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/Recipes.tsx) "Coming Soon" with a functional cooking guide.

#### [MODIFY] [Recipes.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/Recipes.tsx)
- Replace with a recipe browser
- Recipe cards: name, image placeholder, prep time, difficulty, dietary compatibility tags
- Search and category filter (Soups, Rice dishes, Swallow, Snacks, Drinks, etc.)
- "Start Cooking" button → navigates to cooking assistant

#### [NEW] [CookingAssistant.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/CookingAssistant.tsx)
- Chat-like step-by-step interface **powered by Gemini AI**
- User selects a dish name (from recipe list or types custom)
- AI generates full ingredient list + step-by-step instructions in real-time
- Ingredient checklist at top (checkable items)
- Each step shown as a message bubble with clear instructions
- "Next Step" / "Previous Step" buttons
- Step counter ("Step 3 of 8")
- Timer button on steps that require waiting (e.g., "Cook for 15 minutes")
- AI considers user's dietary preferences and health conditions

#### [NEW] [recipes.ts](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/data/recipes.ts)
- Static Nigerian recipe catalog for **browsing** (10-15 recipes):
  - Egusi Soup, Jollof Rice, Pepper Soup, Moi Moi, Efo Riro, Fried Rice
  - Ogbono Soup, Akara, Suya, Plantain Porridge, Beans Porridge
- Each recipe: `id`, `name`, `description`, `prepTime`, `difficulty`, `servings`, `dietaryTags`, `healthNotes`
- When user taps "Start Cooking", AI generates full instructions dynamically

#### Backend:

#### [NEW] `CookingAssistantService` in `backend/core/utils/services/`
- Extends `GeminiBaseService`
- `generate_cooking_guide(dish_name, dietary_preference, health_conditions)` → sends prompt to Gemini
- Returns: `ingredients[]`, `steps[]` (each with instruction, duration, tip)
- Prompt is Nigerian-aware: uses local measurements (cups, handfuls, etc.), local ingredient names

#### [NEW] Cooking API endpoint in `backend/core/results/views.py` or new app
- `POST /api/cooking/generate/` — accepts `dish_name`, returns AI-generated cooking guide
- Uses user's profile for health-aware adjustments

---

### Phase 7: Ingredient Ordering (UPGRADE FROM PLACEHOLDER)

Replace [Shopping.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/Shopping.tsx) "Coming Soon" with functional shopping UI.

#### [MODIFY] [Shopping.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/Shopping.tsx)
- Replace with functional ingredient/shopping list UI
- **Shopping List**: Generated from selected recipes or meal plan (or manually added)
  - Each item: ingredient name, quantity, estimated price (₦), checkbox
  - "Add Item" button for manual additions
  - "Clear Completed" button
- **Nearby Markets** section (static/mock for MVP):
  - Market cards with name, location, distance, opening hours
  - e.g., "Mile 12 Market", "Oyingbo Market", "Shoprite Lekki"
- **Total estimated cost** at bottom
- "Share List" button (copies text list to clipboard)

---

### Phase 8: Healthcare Sharing (NEW FEATURE)

Weekly summary export for healthcare providers.

#### [NEW] [HealthReport.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/HealthReport.tsx)
- Weekly eating pattern summary (uses existing analytics data)
- Simple visual: meals logged count, most common foods, eating consistency
- Health risk indicators based on user's conditions:
  - For diabetics: carb intake trend
  - For hypertension: flagged high-salt meals
- AI-generated suggestions summary (from existing weekly recommendations)
- **"Export as PDF"** button (uses `window.print()` with print-specific CSS)
- **"Copy as Text"** button (formatted text summary to clipboard)

#### [NEW] [useHealthReport.ts](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/hooks/useHealthReport.ts)
- Aggregates data from existing `/api/analytics/` and `/api/recommendations/` endpoints
- Formats for display and export
- No new backend endpoints needed — reuses existing data

---

### Phase 9: Profile Enhancement

Extend [Profile.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/Profile.tsx) with health/diet preferences.

#### [MODIFY] [Profile.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/Profile.tsx)
- Add new **"Health & Diet Preferences"** card section:
  - **Goal**: Dropdown (Lose Weight, Maintain, Eat Healthier, etc.) — maps to existing `dietary_goal`
  - **Diet Type**: Dropdown (Keto, Vegetarian, Vegan, None) — maps to existing `dietary_preference`
  - **Health Conditions**: Multi-select chips (Diabetes, Hypertension, None) — maps to new `health_conditions`
- Visual indicator: "Your AI is personalized for: Keto diet, Diabetes management"
- Inline editing using existing `EditableField` pattern
- Position this section prominently (above Location)

---

### Phase 10: Dashboard Redesign

Refactor [dashboard.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/dashboard.tsx) from analytics-heavy to accountability-focused.

#### [MODIFY] [dashboard.tsx](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/pages/dashboard.tsx)
- New simplified layout:
  - **Greeting card**: "Good morning, Chidi! 🌿" with daily summary ("You've scanned 2 meals today")
  - **Primary CTA**: Large, prominent "Scan Your Food" button (most important element)
  - **Recent meals**: Last 3 scanned foods showing food name + conversational feedback snippet (not metrics)
  - **Quick links row**: "Plan Meals" / "Read Tips" / "Cook Something" (rounded icon buttons)
  - **Weekly streak**: Simple "4/7 days tracked this week" progress indicator
- Move detailed analytics to secondary view accessible via "View Analytics" link
- Keep existing dashboard components but demote them from the primary view

#### [MODIFY] Dashboard components in [dashboard/](file:///c:/Users/USER/Downloads/projects/Balanced-Plate/frontend/balanced_plate/src/components/dashboard/)
- **NutritionSummaryCards**: Simplify to show meal count, consistency streak, and encouragement rather than gram-level macros
- **RecommendationsPanel**: Show conversational tips (from the new-format AI responses) instead of technical recommendations
- Keep **AnalyticsSection**, **HealthInsights** as-is but accessible via "View Details" (not primary view)

---

## Verification Plan

### Automated Tests

```bash
# Backend: Run migrations and check for errors
cd backend && python manage.py makemigrations --check
cd backend && python manage.py migrate
cd backend && python manage.py test

# Frontend: TypeScript compilation check
cd frontend/balanced_plate && npm run build
```

### Manual Verification

| # | Test | What to Verify |
|---|------|----------------|
| 1 | **AuthProvider Bug Fix** | WebSocket notifications work correctly, user state is consistent across all components |
| 2 | **Onboarding** | Signup → see onboarding screens → complete → arrive at dashboard. Revisiting any protected route doesn't re-trigger onboarding |
| 3 | **Food Scan** | Upload Nigerian food image → get conversational response (not technical metrics) → response mentions health conditions if set |
| 4 | **Health Personalization** | Set diabetes in profile → scan food → verify response highlights carb/sugar impact. Same for keto, hypertension |
| 5 | **Meal Planner** | Create weekly plan → AI suggests Nigerian meals → verify dietary filter works |
| 6 | **Blog** | Browse articles → read full article → navigation works |
| 7 | **Cooking Assistant** | Select recipe → step through cooking guide → timer works |
| 8 | **Shopping** | View ingredient list → check items → market suggestions visible |
| 9 | **Health Report** | Generate report → PDF export works → text copy works |
| 10 | **Profile** | Edit health conditions → verify food scan responses change accordingly |
| 11 | **Design** | Verify soft green palette, Inter font, rounded cards, subtle shadows on all pages |
| 12 | **Mobile** | Test all pages at mobile viewport → bottom tab nav works → layouts are responsive |

---

## Implementation Priority & Effort Estimate

| Priority | Phase | Effort | Impact | Notes |
|----------|-------|--------|--------|-------|
| 🔴 P0 | Phase 1: Design System + Bug Fixes | Medium | High | Sets visual foundation, fixes AuthProvider bug |
| 🔴 P0 | Phase 2: Onboarding | Medium | High | Critical first-time user experience |
| 🔴 P0 | Phase 3: AI Response Overhaul | High | High | Core differentiator — conversational + personalized |
| 🟡 P1 | Phase 10: Dashboard Redesign | Medium | High | First thing users see daily |
| 🟡 P1 | Phase 9: Profile Enhancement | Low | Medium | Enables personalization visibility |
| 🟡 P1 | Phase 4: Meal Planning | High | High | Major new feature, needs backend app |
| 🟢 P2 | Phase 5: Blog/Education | Low | Medium | Static content, no backend needed |
| 🟢 P2 | Phase 6: Cooking Assistant | Medium | Medium | Static recipes, chat-like UI |
| 🟢 P2 | Phase 7: Ingredient Ordering | Low | Low | Mock/static for MVP |
| 🟢 P2 | Phase 8: Healthcare Sharing | Medium | Medium | Reuses existing analytics data |

> [!TIP]
> I recommend executing **P0 phases first** (Design → Onboarding → AI Overhaul), then **P1** (Dashboard → Profile → Meal Planning), then **P2** (Blog → Cooking → Shopping → Health Report). Each phase is designed to be independently deployable.
