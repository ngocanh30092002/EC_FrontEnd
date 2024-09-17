import axios from 'axios';
import { ACCESS_TOKEN, PROVIDER, APP_API, REFRESH_TOKEN, CLIENT_URL, REDIRECT_HEADER } from './GlobalConstant';
import {GetCookie} from './src/helper/CookiesHelper';
import TokenHelpers from './src/helper/TokenHelper';
import toast from '@/helper/Toast';

export const appClient = axios.create({
    baseURL: "https://localhost:44314/",
    withCredentials: true
});

appClient.interceptors.request.use(
    async function (request){
        var accessToken = GetCookie(ACCESS_TOKEN);
        var refreshToken = GetCookie(REFRESH_TOKEN);
        var isRedirect = request.headers[REDIRECT_HEADER] ?? true;
        if(TokenHelpers.IsExpired(accessToken,refreshToken)){
            await TokenHelpers.Renew(accessToken, refreshToken, JSON.parse(isRedirect));
        }

        return request;
    },
    function (error){
        return Promise.reject(error);
    }
)

appClient.interceptors.response.use(
    function (response){
        return response
    },
    function (error) {
        var time = 1;
        if(error.response){
            const serverReponseError = error.response.data.message;
            const invalidError = error.response.data.errors;

            if(invalidError){
                for(const key in invalidError){
                    if(invalidError.hasOwnProperty(key)){
                        const propertyValue = invalidError[key];
                        if(Array.isArray(propertyValue)){
                            propertyValue.forEach((item, index) => {
                                toast({
                                    type: "error",
                                    title: key.toUpperCase(),
                                    message: item,
                                    duration: 4000*time
                                });

                                time = time + 1;
                            });
                        }
                        else{
                            toast({
                                type: "error",
                                title: key.toUpperCase(),
                                message: propertyValue,
                                duration: 4000*time
                            })
                        }

                        time = time + 1;
                    }
                }
            }
            else if(serverReponseError){
                if(Array.isArray(serverReponseError)){
                    for(const errorItem of serverReponseError){ 
                        toast({
                            type: "error",
                            title: error.code,
                            message: errorItem,
                            duration: 4000*time
                        });
    
                        time = time + 1;
                    }
                }
                else{
                    toast({
                        type: "error",
                        title: error.code,
                        message: serverReponseError,
                        duration: 4000*time
                    });

                    time = time + 1;
                }
            }
            else{
                var errorCode = error.code
                var errorMessage = error.message;

                toast({
                    type: "error",
                    title: errorCode,
                    message: errorMessage,
                    duration: 4000*time
                });
            }
        }

        return Promise.reject(error);
    }
    
)