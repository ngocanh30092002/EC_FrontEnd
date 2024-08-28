import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Notification from './Notification/Notification';
import SideBar from './SideBar/SideBar';
import MainDashboard from './MainDashBoard/MainDashboard';
const DashboardPage = () => {
    const navigation = useNavigate();
    useEffect(() => {
        // async function CheckValidToken(){
        //     const accessToken = GetCookie(ACCESS_TOKEN);
        //     if(!accessToken){
        //         navigation("account/login");
        //     }

        //     var result = await TokenHelpers.Verify(accessToken);
        //     if(!result){
        //         navigation("account/login");
        //     }
        // }

        // CheckValidToken();
    }, []);

    return (
        <>
            <div className='flex w-screen h-screen relative'>
                <SideBar />
                <div className="flex-1">
                    <Notification />

                    <MainDashboard/>
                </div>
            </div>
        </>
    )
}

export default DashboardPage