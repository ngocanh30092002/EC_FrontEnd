import { Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import LoginPage from './components/LoginComponent/LoginPage'
import MainPage from './components/MainComponent/MainPage'
import ManagerPage from './components/ManagerComponent/ManagePage'
import DashboardPage from './components/DashboardComponent/DashboardPage'
import LockoutPage from './components/AccountComponent/LockoutPage'
import AccountPage from './components/AccountComponent/AccountPage'

function App() {
    return (
        <>
            <Routes>
                <Route path='account/*' element={<AccountPage />} />
                <Route path='/main' element={<MainPage />} />
                <Route path='/manage' element={<ManagerPage />} />
                <Route path='/' element={<DashboardPage />} />
            </Routes>
        </>
    )
}

export default App
