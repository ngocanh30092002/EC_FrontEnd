import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { GetCookie } from '../../helper/CookiesHelper';
import { ACCESS_TOKEN, APP_API } from '../../../GlobalConstant';
import TokenHelpers from '../../helper/TokenHelper';
import CustomButton from '../ButtonComponent/CustomButton';

const DashboardPage = () => {
    const navigation = useNavigate();

    useEffect( () => {
        async function CheckValidToken(){
            const accessToken = GetCookie(ACCESS_TOKEN);
            if(!accessToken){
                navigation("account/login");
            }

            var result = await TokenHelpers.Verify(accessToken);
            if(!result){
                navigation("account/login");
            }
        }

        CheckValidToken();
    },[])

    return (
        <div>
           <CustomButton type="text" name="username" placeholder="User Name" required={true} minLength = {10} isEmail = {true}/>
        </div>
    )
}

export default DashboardPage