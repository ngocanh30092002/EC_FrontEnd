import React from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import LoginPage from '../LoginComponent/LoginPage'
import SignUpPage from '../SignUpComponent/SignUpPage'
import './AccountStyle.css'

function AccountPage(){
    return <>
    <div className='container flex max-w-full'>
        <div className='account-background-light flex-1'></div>
        {/* <div className='account-background-bold flex-1'></div> */}
        
        <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
        </Routes>
        <Outlet />
    </div>
    </>
}

export default AccountPage