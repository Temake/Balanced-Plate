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
// import Learn from "./pages/Learn";
import Shopping from "./pages/Shopping";
import Profile from "./pages/Profile";
import Recipes from "./pages/Recipes";
import CookingAssistant from "./pages/CookingAssistant";
import AnalysisHistory from "./pages/AnalysisHistory";
import MealPlanner from "./pages/MealPlanner";
import OnboardingPage from "./pages/OnboardingPage";
import HealthReport from "./pages/HealthReport";
import Billing from "./pages/Billing";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import DemoInvite from "./pages/DemoInvite";
import { AuthProvider } from "./context/AuthContext";
import { FilesProvider } from "./context/FilesContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import ProtectedRoute from './components/ProtectedRoute';
import InstallAppPrompt from './components/InstallAppPrompt';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './api/constants';
import { Toaster } from 'sonner';


/**
 * "/" serves the marketing page to visitors and the dashboard to anyone signed in.
 *
 * The token check reads localStorage synchronously — deriving this from auth context
 * would render the landing page for a beat before redirecting, which a signed-in user
 * sees as a flash of the wrong screen every time they open the installed app. A stale
 * token is harmless here: /dashboard is protected and bounces to /login.
 */
const RootRoute = () => {
  const hasSession = Boolean(
    localStorage.getItem(ACCESS_TOKEN) && localStorage.getItem(REFRESH_TOKEN)
  );
  return hasSession ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};


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
        <InstallAppPrompt />
        <Routes>
          {/* Landing page for visitors, dashboard for signed-in users */}
          <Route path="/" element={<RootRoute/>}/>
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
          <Route path="/analyze-food" element={<ProtectedRoute><AnalyseFood/></ProtectedRoute>}/>
          {/* Explore/Learn is paused for now. */}
          {/* <Route path="/learn" element={<ProtectedRoute><Learn/></ProtectedRoute>}/> */}
          <Route path="/shopping" element={<ProtectedRoute><Shopping/></ProtectedRoute>}/>
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
          <Route path="/recipes" element={<ProtectedRoute><Recipes/></ProtectedRoute>}/>
          <Route path="/history" element={<ProtectedRoute><AnalysisHistory/></ProtectedRoute>}/>
          
          {/* Onboarding */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage/></ProtectedRoute>}/>

          {/* Future Routes */}
          <Route path="/meal-plan" element={<ProtectedRoute><MealPlanner/></ProtectedRoute>}/>
          {/* <Route path="/articles/:id" element={<ProtectedRoute><ArticleDetail/></ProtectedRoute>}/> */}
          <Route path="/cook" element={<ProtectedRoute><CookingAssistant/></ProtectedRoute>}/>
          <Route path="/cook/:id" element={<ProtectedRoute><CookingAssistant/></ProtectedRoute>}/>
          <Route path="/health-report" element={<ProtectedRoute><HealthReport/></ProtectedRoute>}/>
          <Route path="/billing" element={<ProtectedRoute><Billing/></ProtectedRoute>}/>
          <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccess/></ProtectedRoute>}/>
          <Route path="/demo/invite/:token" element={<DemoInvite/>}/>

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
