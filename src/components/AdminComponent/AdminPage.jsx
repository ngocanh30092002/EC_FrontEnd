import React, { useEffect, useState } from 'react'
import SideBarPage from './SideBarAdmin/SideBarPage';
import AdminMainPage from './MainAdmin/AdminMainPage';
import { appClient } from './../../../AppConfigs';
import { ROLES } from '~/GlobalConstant';
import { useNavigate } from 'react-router-dom';
import toast from '@/helper/Toast';


function AdminPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getRoleAsync = async () => {
            try {
                const response = await appClient.get("api/roles/user")
                const data = response.data;
                if (data.success) {
                    const roles = data.message;
                    let isExist = roles.some(r => r == ROLES.ADMIN);
                    if (!isExist) {
                        toast({
                            type: "error",
                            title: "Error",
                            message: "You are not allowed to access this page",
                            duration: 4000
                        });

                        setTimeout(() => {
                            navigate("/");
                        }, 1000);
                    }
                    else {
                        setIsLoading(true);
                    }
                }
            }
            catch {

            }
        }

        getRoleAsync();
    }, [])

    return (
        <>
            {isLoading == true &&
                <div className='flex w-screen h-screen relative'>
                    <SideBarPage />
                    <AdminMainPage />
                </div>}
        </>
    )
}

export default AdminPage