import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { ROLES } from '~/GlobalConstant';
import SideBarPage from './SideBarTeacher/SideBarPage';
import MenuContextPage from '../MenuContextComponent/MenuContextPage';
import TeacherMainPage from './../TeacherComponent/MainTeacher/TeacherMainPage';

function TeacherPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getRoleAsync = async () => {
            try {
                const response = await appClient.get("api/roles/user")
                const data = response.data;
                if (data.success) {
                    const roles = data.message;
                    let isExist = roles.some(r => r == ROLES.TEACHER);
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
                    <TeacherMainPage />
                </div>}

            <MenuContextPage />
        </>
    )
}

export default TeacherPage