import React, { useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import "@components/DashboardComponent/Class/ClassStyle.css"
import ClassMainPage from './ClassMain/ClassMainPage';
function ClassPage() {
    return (
        <div className='cpa__wrapper'>
            <ClassMainPage/>
        </div>
    )
}

export default ClassPage