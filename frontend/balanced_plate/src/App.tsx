import { BrowserRouter, Route, Routes} from "react-router-dom"
// import { AuthProvider } from "./context/AuthContext"
import LoginPage from "./pages/login"
import SignUp from "./pages/signup"
import  Main  from "./pages/main"
function App() {
  return (

   <BrowserRouter>
   <Routes>

    <Route path="/" element={<Main/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/signup" element={<SignUp/>}/>


   </Routes>
   </BrowserRouter>

  )
}

export default App
