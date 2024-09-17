import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ACCESS_TOKEN, CLIENT_URL, REFRESH_TOKEN } from '~/GlobalConstant';
import { SetCookie } from '@/helper/CookiesHelper';

function LogoutPage() {

    const navigate = useNavigate();

    useEffect(() => {
        SetCookie(ACCESS_TOKEN,'', 0);
        SetCookie(REFRESH_TOKEN,'', 0);
        navigate("/account/login");
    }, [])
    return (
        <></>
    )
}

export default LogoutPage