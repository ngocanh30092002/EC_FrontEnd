import { Route, Routes } from 'react-router-dom'
import './App.css'
import AccountPage from './components/AccountComponent/AccountPage'
import DashboardPage from './components/DashboardComponent/DashboardPage'
import MainPage from './components/MainComponent/MainPage'
import ManagerPage from './components/ManagerComponent/ManagePage'

function App() {
    return (
        <>
            <Routes>
                <Route path='account/*' element={<AccountPage />} />
                <Route path='/main' element={<MainPage />} />
                <Route path='/manage' element={<ManagerPage />} />
                <Route path='/*' element={<DashboardPage />} />
                <Route path='/noti' element={<Notification />} />
            </Routes>

            <div id='toast'/>
        </>
    )
}

export default App
