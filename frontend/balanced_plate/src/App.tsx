import { BrowserRouter, Route, Routes} from "react-router-dom"
// import { AuthProvider } from "./context/AuthContext"
import LoginPage from "./pages/login"

import Main from './pages/main';
import Otp from "./pages/otp"
import ResetPassword from "./pages/reset-password"
import ForgetPassword from "./pages/forget-password"
import SignUp from "./pages/signup";
import { ThemeProvider } from "./components/theme-provider";
import Dashboard from "./pages/dashboard";
import AnalyseFood from "./pages/AnalyseFood";
import Learn from "./pages/Learn";
import Shopping from "./pages/Shopping";
import Profile from "./pages/Profile";
import Recipes from "./pages/Recipes";
function App() {
  return (
   <ThemeProvider defaultTheme="light">
   <BrowserRouter>
   <Routes>

    <Route path="/" element={<Dashboard/>}/>
    <Route path="/analyze-food" element={<AnalyseFood/>}/>
    <Route path="/learn" element={<Learn/>}/>
    <Route path="/shopping" element={<Shopping/>}/>
    <Route path="/profile" element={<Profile/>}/>
    <Route path="/recipes" element={<Recipes/>}/>

    <Route path="/otp" element={<Otp/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/signup" element={<SignUp/>}/>
    <Route path="/forget-password" element={<ForgetPassword/>}/>
    <Route path ='/reset-password' element={<ResetPassword/>}></Route>
    <Route path="*" element={<Main/>} />


   </Routes>
   </BrowserRouter>
 </ThemeProvider>
  )
}

export default App
