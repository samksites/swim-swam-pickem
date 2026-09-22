import './App.css'
import CreateAndEditCompetition from './pages/CreateAndEditCompetition'
import {Alert} from './components/ui/alert'
import HomePage from './pages/homePage'
import EnterCompetition from './pages/EnterCompetition'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import SignInWithPassword from './pages/SignInWithPassword'
import InactivityManager from './components/InactivityManager'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
      <Alert/>
      <InactivityManager />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/enterCompetition' element={<EnterCompetition />} />
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-in/password' element={<SignInWithPassword />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/adminPage' element={<CreateAndEditCompetition />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
