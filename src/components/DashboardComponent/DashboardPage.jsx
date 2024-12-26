import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { ROLES } from '~/GlobalConstant';
import MenuContextPage from '../MenuContextComponent/MenuContextPage';
import MainDashboard from './MainDashBoard/MainDashboard';
import Notification from './Notification/Notification';
import SideBar from './SideBar/SideBar';

const DashboardPage = () => {
    const navigation = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getRoleAsync = async () => {
            try {
                setIsLoading(true);
                const response = await appClient.get("api/roles/user")
                const data = response.data;
                if (data.success) {
                    const roles = data.message;
                    if (roles.includes(ROLES.ADMIN)) {
                        setIsLoading(false);
                        return;
                    }

                    if (roles.includes(ROLES.TEACHER)) {
                        navigation("/teacher");
                        setIsLoading(false);
                    }

                    setIsLoading(false);
                }
            }
            catch {

            }
        }
        getRoleAsync();
    }, [])
    return (
        <>
            {isLoading == false &&
                <>
                    <div className='flex w-screen h-screen relative'>
                        <SideBar className={''} />
                        <div className="flex-1 relative">
                            <Notification className={"fixed z-[998] w-full right-0 top-0 md:static"} />

                            <MainDashboard className={"mt-[70px] md:mt-0 overflow-hidden"} />
                        </div>
                    </div>

                    <MenuContextPage />
                </>
            }
        </>
    )
}

export default DashboardPage