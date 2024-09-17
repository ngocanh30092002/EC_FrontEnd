import { Route, Routes } from 'react-router-dom'
import './App.css'
import AccountPage from './components/AccountComponent/AccountPage'
import DashboardPage from './components/DashboardComponent/DashboardPage'
import ManagerPage from './components/ManagerComponent/ManagePage'
import { StoreProvider } from "./store"
import AdminPage from './components/AdminComponent/AdminPage'

function App() {
    return (
        <StoreProvider>
            <Routes>
                <Route path='account/*' element={<AccountPage />} />
                <Route path='admin/*' element={<AdminPage/>}/>
                <Route path='/manage' element={<ManagerPage />} />
                <Route path='/*' element={<DashboardPage />} />
                <Route path='/noti' element={<Notification />} />
            </Routes>

            <div id='toast'/>
        </StoreProvider>
    )
}

export default App
