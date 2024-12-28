import React, { useEffect, useState } from 'react'
import { FACEBOOK_APP_ID } from '../../../../GlobalConstant';
import { appClient } from '~/AppConfigs';
import { useNavigate } from 'react-router-dom';
import LoaderPage from '../../LoaderComponent/LoaderPage';

const LoginFacebook = ({ imageUrl, description }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        window.fbAsyncInit = function () {
            FB.init({
                appId: FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v21.0'
            });

            FB.AppEvents.logPageView();

        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, []);

    const handleLoginFacebook = async (accessToken) => {
        try {
            setIsLoading(true);
            const responsePost = await appClient.post("sign-in-facebook", accessToken, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            let data = responsePost.data;
            if (data.success) {
                navigate("/");
                FB.logout();
            }
            setIsLoading(false);
        }
        catch {
            setIsLoading(false);
        }
        
    }

    const handleLogin = () => {
        FB.getLoginStatus((response) => {
            if (response.status === 'connected') {
                const accessToken = response.authResponse.accessToken;
                handleLoginFacebook(accessToken);
            } else {
                window.FB.login((response) => {
                    if (response.status === 'connected') {
                        const accessToken = response.authResponse.accessToken;
                        handleLoginFacebook(accessToken);
                    }
                }, { scope: 'public_profile,email' });
            }
        });
    };

    return (
        <>
            {isLoading == true && <LoaderPage />}
            <button className='login-provider w-full' onClick={handleLogin}>
                <img src={imageUrl} className='login-provider__image' />
                <span className='login-provider__title flex-1'>{description}</span>
            </button>
        </>
    );
};

export default LoginFacebook;
