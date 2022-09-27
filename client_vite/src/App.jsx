import { useState } from 'react'
import reactLogo from './assets/sdgd-fishtech-V-2.png'
import './App.css'
import {Routes,Route} from 'react-router-dom'
import Navbar from './pages/Navbar'
import Login from './pages/Login'
import Home from './pages/Home'
// import Slide from './pages/Slide'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      {/* <Slide /> */}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login /> } />
      </Routes>
    </>
  )
}

export default App
