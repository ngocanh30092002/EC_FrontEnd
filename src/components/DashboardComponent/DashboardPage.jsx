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
                <SideBar className={''}/>
                <div className="flex-1 relative">
                    <Notification className={"fixed w-full right-0 top-0 md:static"}/>

                    <MainDashboard className={"mt-[70px] md:mt-0"}/>
                </div>
            </div>
        </>
    )
}

export default DashboardPage