import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ACCESS_TOKEN, CLIENT_URL, REFRESH_TOKEN } from '~/GlobalConstant';
import { SetCookie } from '@/helper/CookiesHelper';
import { appClient } from '~/AppConfigs';

function LogoutPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async() =>{
            var response = await appClient.post("api/accounts/logout");
            var data = response.data;
            if(data.success){
                navigate("/account/login");
            }
        }

        logout();
    }, [])
    return (
        <></>
    )
}

export default LogoutPage