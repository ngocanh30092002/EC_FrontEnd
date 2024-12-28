import React from 'react'
import { GoogleLogin, GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { CLIENT_GOOGLE_ID, SCOPE_GOOGLE } from '~/GlobalConstant'
import { APP_URL } from '~/GlobalConstant.js';

const LoginGoogleButton = ({ imageUrl, description, redirectUri }) => {

    const GoogleLoginButton = () => {
        const handleGoogleAuth = useGoogleLogin({
            flow: 'auth-code',
            scope: SCOPE_GOOGLE,
            ux_mode: 'redirect',
            redirect_uri: `${APP_URL}sign-in-google`,
            select_account: true
        });

        return (
            <button className='login-provider w-full' onClick={handleGoogleAuth}>
                <img src={imageUrl} className='login-provider__image' />
                <span className='login-provider__title flex-1'>{description}</span>
            </button>
        );
    };

    return (
        <GoogleOAuthProvider clientId={CLIENT_GOOGLE_ID}>
            <GoogleLoginButton />
        </GoogleOAuthProvider>
    )
}

export default LoginGoogleButton