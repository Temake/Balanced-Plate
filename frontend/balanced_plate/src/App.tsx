import { BrowserRouter, Route, Routes} from "react-router-dom"
// import { AuthProvider } from "./context/AuthContext"
import LoginPage from "./pages/login"
import SignUp from "./pages/signup"
import  Main  from "./pages/main"
import Otp from "./pages/otp"
import ResetPassword from "./pages/reset-password"
import { ThemeProvider } from "./components/theme-provider"
import ForgetPassword from "./pages/forget-password"
function App() {
  return (
  //  <ThemeProvider defaultTheme="light">
   <BrowserRouter>
   <Routes>

    <Route path="/" element={<Main/>}/>
    <Route path="/otp" element={<Otp/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/signup" element={<SignUp/>}/>
    <Route path="/forget-password" element={<ForgetPassword/>}/>
    <Route path ='/reset-password' element={<ResetPassword/>}></Route>


   </Routes>
   </BrowserRouter>
// </ThemeProvider>
  )
}

export default App
