import { Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom"
import toast from "react-hot-toast"
import { useEffect } from "react"

import { useAuth } from "./context/AuthContext"

import type { AuthCheckResponse } from "./types/apis/Auth"

import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Home from "./pages/Home"
import UserPage from './pages/UserPage'
import Transactions from "./pages/Transactions"
import CreateTransaction from "./pages/CreateTransaction"
import Journal from "./pages/Journals"
import CreateHoliday from "./pages/CreateHoliday"
import Holidays from "./pages/Holidays"
import ChangePassword from "./pages/ChangePassword"
import ChangeFirstOpeningBalance from "./pages/ChangeFirstOpeningBalance"
import Header from "./components/Header"
import serverUrl from "./var/serverUrl"

import type { User } from "./types/client/User"

function App() {
 
  const {user, setUser} = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const authCheck = async () : Promise<void> => {
    try {
      const res = await fetch(`${serverUrl}api/auth/authcheck`, {
        method: 'GET',
        credentials:'include'
      } )
      if(res.status>=500){
        throw new Error('Internal Server Error: Checking authentication.')
      }
      const data : AuthCheckResponse = await res.json()
      if (!data.status) {
        setUser(null)
        localStorage.removeItem("boj-user")
        throw new Error(data.message)
      }
      const storedUser = localStorage.getItem('boj-user')
      const localUser: User = storedUser ? JSON.parse(storedUser) : null
      if(localUser!=data.user){
        localStorage.setItem('boj-user', JSON.stringify(data.user))
      }
      setUser(data.user)
    } catch (error:unknown) {
      if (error instanceof Error) {
    toast.error(error.message);
    navigate('/login')
  } else {
    toast.error("An unexpected error occurred");
    navigate('/login')
  }
    }
  }

  useEffect(() => {
    if (!(location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgotpassword')) {
      authCheck()
    }
  },[])

  return (
    <Routes>
      <Route element={<Header/>}>
        <Route path="/" element={user?<Navigate to={'/dashboard'}/>:<Home/>}/>
        <Route path="/dashboard" element={user?<Dashboard/>:<Navigate to={'/login'}/>}/>
        <Route path="/login" element={user?<Navigate to={'/'}/>:<Login/>}/>
        <Route path="/signup" element={user?<Navigate to={'/'}/>:<Signup/>}/>
        <Route path="/user" element={user?<UserPage/>:<Navigate to={'/login'}/>}/>
        <Route path="/transactions" element={user?<Transactions/>:<Navigate to={'/login'}/>}/>
        <Route path="/createtransaction" element={user?<CreateTransaction/>:<Navigate to={'/login'}/>}/>
        <Route path="/journal" element={user?<Journal/>:<Navigate to={'/login'}/>}/>
        <Route path="/holidays" element={user?<Holidays/>:<Navigate to={'/login'}/>}/>
        <Route path="/createholiday" element={user?<CreateHoliday/>:<Navigate to={'/login'}/>}/>
        <Route path="/forgotpassword" element={user?<Navigate to={'/'}/>:<ChangePassword/>}/>
        <Route path="/changepassword" element={user?<ChangePassword/>:<Navigate to={'/login'}/>}/>
        <Route path="/changefirstopeningbalance" element={user?<ChangeFirstOpeningBalance/>:<Navigate to={'/login'}/>}/>
      </Route>
    </Routes>
  )
}

export default App
