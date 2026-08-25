import './App.css'
import CreateAndEditCompetition from './pages/CreateAndEditCompetition'
import {Alert} from './components/ui/alert'
import HomePage from './pages/homePage'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
      <Alert/>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/adminPage' element={<CreateAndEditCompetition />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
