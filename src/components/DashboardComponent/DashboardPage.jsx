import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Notification from './Notification/Notification';
import SideBar from './SideBar/SideBar';
import MainDashboard from './MainDashBoard/MainDashboard';
const DashboardPage = () => {
    const navigation = useNavigate();
    return (
        <>
            <div className='flex w-screen h-screen relative'>
                <SideBar className={''}/>
                <div className="flex-1 relative">
                    <Notification className={"fixed z-[998] w-full right-0 top-0 md:static"}/>

                    <MainDashboard className={"mt-[70px] md:mt-0 overflow-hidden"}/>
                </div>
            </div>
        </>
    )
}

export default DashboardPage