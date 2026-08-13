export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  city?: string;
  is_verified?: boolean;
  is_superuser?:boolean
  phone_number:string
  is_phone_number_verified:boolean
  is_email_verified:boolean
  gender:string
  dob:Date
  is_banned:boolean
  account_type:string
  country:string,
  state?:string
  dietary_goal?: string;
  dietary_preference?: string;
  health_conditions?: string[];
  onboarding_completed?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: {
    access: string;
    refresh: string;
  };
}

export interface SignupCredentials{
  first_name:string,
  last_name:string,
  email:string,
  gender:string,
  dob?: string,
  phone_number:string,
  password: string,
  password2?:string,
  country?:string



}
export interface SignupResponse{
  user: User;
  message?: string | {
    phone_number?: string | string[],
    password?: string | string[],
    email?: string | string[]
  }

}

export interface ResponseError{
  status:number
    message:{
      phone_number?:string,
      password?:string
      email?:string


    }
  
}
export interface OnboardingData {
  dietary_goal: string;
  dietary_preference: string;
  health_conditions: string[];
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  forgetPassword: (email: string) => Promise<string>;
  otpVerify: (email: string, otpCode: string) => Promise<string>;
  verifyAccount: (email: string, otpCode: string) => Promise<string>;
  resendAccountVerificationOtp: (email: string) => Promise<string>;
  resetPassword: (email: string, password: string, confirmPassword: string) => Promise<string>;
  SignUp: (credentials: SignupCredentials) => Promise<SignupResponse>;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  loadCurrentUser: () => Promise<void>;
  setAuthStatus: (status: boolean) => void;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
}


export interface FileType {
  id: string;
  file: string;
  purpose: "avatar" | "food image";
  mime_type?: string;
  original_name?: string;
  currently_under_processing?: boolean;
  upload_session_id?: string;
  size?: number;
  date_added: string;
  owner: number;
  analysis_id?: number;
  /**
   * Set when the upload succeeded but analysis did not start — most often because
   * the daily photo-analysis allowance is used up. Carries the message to show.
   */
  analysis_error?: string;
}

export interface FilesContextType {
  files: FileType[];
  isLoading: boolean;
  error: string | null;
  uploadFile: (file: File, purpose: "avatar" | "food image") => Promise<FileType>;
  fetchFiles: () => Promise<void>;
  getFile: (id: string) => Promise<FileType>;
  clearError: () => void;
}

// ============ Food Analysis Types ============

export interface DetectedFood {
  id: number;
  name: string;
  confidence: string;
  portion_estimate: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface NextMealRecommendations {
  nutritional_recommendations?: string[];
  balance_improvements?: string[];
  timing_recommendations?: string[];
}

export interface FoodAnalysis {
  id: number;
  owner: number;
  owner_name: string;
  food_image: string;
  image_url: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | null;
  balance_score: string;
  next_meal_recommendations: NextMealRecommendations;
  is_mock_data: boolean;
  analysis_status: 'analysis_pending' | 'analysis_processing' | 'analysis_completed' | 'analysis_failed';
  error_message: string | null;
  food_name: string | null;
  conversational_feedback: string | null;
  actionable_suggestion: string | null;
  alternative_suggestion: string | null;
  detected_foods: DetectedFood[];
  total_calories: string;
  total_protein: string;
  total_carbs: string;
  total_fat: string;
  date_added: string;
  date_last_modified?: string;
}

export interface FoodAnalysisListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FoodAnalysis[];
}

// ============ Meal Plan Types ============

export interface MealEntry {
  id: number;
  day: string;
  meal_type: string;
  food_name: string;
  description: string;
  prep_time_minutes: number | null;
  health_notes: string;
  is_ai_generated: boolean;
  date_added: string;
}

export interface MealPlan {
  id: number;
  week_start_date: string;
  budget_level: 'low' | 'medium' | 'flexible';
  is_ai_generated: boolean;
  entries: MealEntry[];
  date_added: string;
}

export interface GenerateMealPlanRequest {
  week_start_date: string;
  budget_level: string;
}

export interface GenerateDayMealPlanRequest extends GenerateMealPlanRequest {
  day: string;
}

export interface UpsertMealEntryRequest extends GenerateMealPlanRequest {
  day: string;
  meal_type: string;
  food_name: string;
  description?: string;
  prep_time_minutes?: number | null;
  health_notes?: string;
}

// ============ Weekly Recommendation Types ============

export interface WeeklyRecommendation {
  id: number;
  owner: number;
  week_start_date: string;
  week_end_date: string;
  health_report: string | null;
  recommendations: Record<string, unknown>;
  priority_actions: string[];
  weekly_goals: string[];
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  error_message: string | null;
  is_mock_data: boolean;
  is_read: boolean;
  read_at: string | null;
  notification_sent: boolean;
  notification_sent_at: string | null;
  date_added: string;
}

export interface WeeklyRecommendationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WeeklyRecommendation[];
}

// ============ Analytics Types ============

export interface FoodGroupGramsResponse {
  total_carbs_grams: number;
  total_protein_grams: number;
  total_vegetable_grams: number;
  total_fruit_grams: number;
  total_dairy_grams: number;
  total_fat_grams: number;
}

export interface FoodGroupPercentageResponse {
  carbs_percent: number;
  protein_percent: number;
  vegetable_percent: number;
  fruit_percent: number;
  dairy_percent: number;
}

export interface DailyBalanceScoreResponse {
  monday: number | null;
  tuesday: number | null;
  wednesday: number | null;
  thursday: number | null;
  friday: number | null;
  saturday: number | null;
  sunday: number | null;
}

// ============ Paginated Response ============

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============ WebSocket Event Types ============

export interface WebSocketEvent {
  type: string;
  data: unknown;
}

export interface RecommendationReadyEvent extends WebSocketEvent {
  type: 'recommendation_ready';
  data: {
    recommendation: WeeklyRecommendation;
    week_start_date: string;
    week_end_date: string;
    message: string;
    timestamp: string;
  };
}

export interface AnalysisCompletedEvent extends WebSocketEvent {
  type: 'analysis_completed';
  data: {
    message: string;
    id: number;
    timestamp: string;
  };
}

export interface AnalysisFailedEvent extends WebSocketEvent {
  type: 'analysis_failed';
  data: {
    message: string;
    id: number;
    timestamp: string;
  };
}

// ============ Cooking Assistant Types ============

export interface CookingIngredient {
  name: string;
  quantity: string;
  is_essential: boolean;
}

export interface CookingStep {
  step_number: number;
  instruction: string;
  duration_minutes: number | null;
  tip: string | null;
}

export interface CookingGuide {
  dish_name: string;
  servings: number;
  total_prep_time_minutes: number;
  difficulty: string;
  ingredients: CookingIngredient[];
  steps: CookingStep[];
  health_notes: string | null;
}

// ============ Billing Types ============

export interface BillingPlan {
  key: 'free' | 'plus' | 'pro' | 'demo';
  name: string;
  description: string;
  price_kobo: number;
  price_naira: number;
  currency: 'NGN';
  interval: 'monthly';
  // null on demo access, which is unmetered and so has no limit to report.
  ai_generation_limit: number | null;
  analysis_daily_limit: number | null;
  analysis_monthly_limit: number | null;
  analytics_enabled: boolean;
  reports_enabled: boolean;
  ai_planning_enabled: boolean;
  ai_cooking_enabled: boolean;
}

export interface Subscription {
  plan: BillingPlan;
  status: 'free' | 'pending' | 'active' | 'grace' | 'cancelled' | 'expired' | 'disabled';
  is_paid_access_active: boolean;
  access_source?: 'free' | 'subscription' | 'demo_invite' | 'manual';
  access_expires_at?: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  grace_ends_at: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
}

/**
 * Two separate meters. AI generation credits are a monthly pool for meal plans
 * and cooking guides; photo analyses have their own daily allowance so the daily
 * logging habit can never eat the monthly credits. Every limit is null when
 * `unmetered` is true (active demo invite).
 */
export interface BillingUsage {
  billing_month: string;
  unmetered: boolean;
  ai_generation_limit: number | null;
  ai_generation_used: number;
  ai_generation_remaining: number | null;
  analysis_daily_limit: number | null;
  analysis_used_today: number;
  analysis_remaining_today: number | null;
  analysis_monthly_limit: number | null;
  analysis_used_this_month: number;
}

export interface InitializePaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}
