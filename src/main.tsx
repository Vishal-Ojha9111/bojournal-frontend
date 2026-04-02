import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './hooks/AuthProvider.tsx'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { ThemeProvider } from './context/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
    <BrowserRouter>
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
    <App />
      <Toaster/>
      </LocalizationProvider>
    </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
)
