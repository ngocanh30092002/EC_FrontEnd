import React from 'react'
import './AccountStyle.css'
import LoginPage from '../LoginComponent/LoginPage'
import { Route, Routes, Outlet} from 'react-router-dom'
import SignUpPage from '../SignUpComponent/SignUpPage'

function AccountPage(){
    return <>
    <div className='container flex max-w-full'>
        <div className='account-background-light flex-1'></div>
        <div className='account-background-bold flex-1'></div>
        
        <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
        </Routes>
        <Outlet />
    </div>
    </>
}

export default AccountPage