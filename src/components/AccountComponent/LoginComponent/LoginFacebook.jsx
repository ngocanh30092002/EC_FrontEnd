import React, { useState } from "react";
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'

const LoginFacebook = ({imageUrl, description}) => {
    const [imageLink, setImageLink] = useState('');
    const responseFacebook = (response) => {
        // if (response.accessToken) {
        //     // Gửi token lên backend để xử lý
        //     fetch("https://your-backend-api.com/api/auth/facebook-login", {
        //       method: "POST",
        //       headers: {
        //         "Content-Type": "application/json",
        //       },
        //       body: JSON.stringify({ accessToken: response.accessToken }),
        //     })
        //       .then((res) => res.json())
        //       .then((data) => {
        //         console.log("Server Response:", data);
        //         localStorage.setItem("jwtToken", data.token);
        //       })
        //       .catch((error) => console.error("Error:", error));
        //   } else {
        //     console.error("Facebook login failed");
        //   }

        console.log(response);
    };

    return (
        <div>
            <FacebookLogin
                appId="1268312627753338"
                autoLoad={false}
                fields="name,email,picture.width(300).height(300)"
                callback={responseFacebook}
                textButton="Login with Facebook"
                icon="fa-facebook"
                render={(renderProps) => (
                    <button className='login-provider w-full' onClick={renderProps.onClick}>
                        <img src={imageUrl} className='login-provider__image' />
                        <span className='login-provider__title flex-1'>{description}</span>
                    </button>
                )}
            />

        </div>
    );
};

export default LoginFacebook;
