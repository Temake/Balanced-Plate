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
  token: {
    access: string;
    refresh: string;
  };
  message?:{
    phone_number:string,
    password:string,
    email?:string
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
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  forgetPassword: (email: string) => Promise<string>;
  otpVerify: (email: string, otpCode: string) => Promise<string>;
  resetPassword: (email: string, password: string, confirmPassword: string) => Promise<string>;
  SignUp: (credentials: SignupCredentials) => Promise<SignupResponse>;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  loadCurrentUser: () => Promise<void>;
  setAuthStatus: (status: boolean) => void;
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