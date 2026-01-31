import { BrowserRouter, Route, Routes} from "react-router-dom"
import { Suspense } from "react"
import LoginPage from "./pages/login"
import Main from './pages/main';
import Otp from "./pages/otp"
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
import { AuthProvider } from "./context/AuthContext";
import { FilesProvider } from "./context/FilesContext";
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';


const Loading = <div className="flex items-center justify-center h-screen">Loading...</div>;

function App() {
  return (
   <ThemeProvider defaultTheme="light">
    <AuthProvider>
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

    {/* Auth Routes */}
    <Route path="/otp" element={<Otp/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/signup" element={<SignUp/>}/>
    <Route path="/forget-password" element={<ForgetPassword/>}/>
    <Route path ='/reset-password' element={<ResetPassword/>}></Route>
    <Route path="*" element={<Main/>} />


       </Routes>
      </BrowserRouter>
      </Suspense>
     </FilesProvider>
    </AuthProvider>
   </ThemeProvider>
  )
}

export default App
