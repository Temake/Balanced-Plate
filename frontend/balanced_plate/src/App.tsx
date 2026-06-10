import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import { Suspense } from "react"
import LoginPage from "./pages/login"
import Otp from "./pages/otp"
import VerifyAccount from "./pages/verify-account"
import ResetPassword from "./pages/reset-password"
import ForgetPassword from "./pages/forget-password"
import SignUp from "./pages/signup";
import { ThemeProvider } from "./components/theme-provider";
import Dashboard from "./pages/dashboard";
import LandingPage from "./pages/LandingPage";
import AnalyseFood from "./pages/AnalyseFood";
import Learn from "./pages/Learn";
import Shopping from "./pages/Shopping";
import Profile from "./pages/Profile";
import Recipes from "./pages/Recipes";
import CookingAssistant from "./pages/CookingAssistant";
import AnalysisHistory from "./pages/AnalysisHistory";
import MealPlanner from "./pages/MealPlanner";
import OnboardingPage from "./pages/OnboardingPage";
import HealthReport from "./pages/HealthReport";
import { AuthProvider } from "./context/AuthContext";
import { FilesProvider } from "./context/FilesContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';


const Loading = (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
   <ThemeProvider defaultTheme="light">
    <AuthProvider>
     <WebSocketProvider>
      <FilesProvider>
       <Suspense fallback={Loading}>
       <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage/>}/>
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
          <Route path="/analyze-food" element={<ProtectedRoute><AnalyseFood/></ProtectedRoute>}/>
          <Route path="/learn" element={<ProtectedRoute><Learn/></ProtectedRoute>}/>
          <Route path="/shopping" element={<ProtectedRoute><Shopping/></ProtectedRoute>}/>
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
          <Route path="/recipes" element={<ProtectedRoute><Recipes/></ProtectedRoute>}/>
          <Route path="/history" element={<ProtectedRoute><AnalysisHistory/></ProtectedRoute>}/>
          
          {/* Onboarding */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage/></ProtectedRoute>}/>

          {/* Future Routes */}
          <Route path="/meal-plan" element={<ProtectedRoute><MealPlanner/></ProtectedRoute>}/>
          {/* <Route path="/articles/:id" element={<ProtectedRoute><ArticleDetail/></ProtectedRoute>}/> */}
          <Route path="/cook/:id" element={<ProtectedRoute><CookingAssistant/></ProtectedRoute>}/>
          <Route path="/health-report" element={<ProtectedRoute><HealthReport/></ProtectedRoute>}/>

          {/* Auth Routes */}
          <Route path="/otp" element={<Otp/>}/>
          <Route path="/verify-account" element={<VerifyAccount/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/forget-password" element={<ForgetPassword/>}/>
          <Route path='/reset-password' element={<ResetPassword/>}/>
          
          {/* Catch-all — redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
       </BrowserRouter>
       </Suspense>
      </FilesProvider>
     </WebSocketProvider>
    </AuthProvider>
   </ThemeProvider>
  )
}

export default App
