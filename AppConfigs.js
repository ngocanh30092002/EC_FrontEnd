import toast from '@/helper/Toast';
import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '~/GlobalConstant';
import TokenHelpers from './src/helper/TokenHelper';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

export const appClient = axios.create({
    baseURL: "https://localhost:44314/",
    withCredentials: true
});

appClient.interceptors.request.use(
    function (request){
        const token = sessionStorage.getItem(ACCESS_TOKEN);
        if(token){
            request.headers['Authorization'] = `Bearer ${token}`;
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
    async function (error) {
        var statusCode = error.response.status;
        const originalRequest = error.config;

        if(statusCode === 401 && !originalRequest._retry){
            if(isRefreshing){
                return new Promise(function(resolve, reject) {
                    failedQueue.push({resolve, reject});
                })
                .then(token => {
                    originalRequest.headers["Authorization"] = "Bearer " + token;
                    return appClient(originalRequest);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try{
                const accessToken = sessionStorage.getItem(ACCESS_TOKEN);
                const IsExpired = TokenHelpers.IsExpired(accessToken);

                if(IsExpired){
                    await TokenHelpers.Renew(true);
                }

                processQueue(null, sessionStorage.getItem(ACCESS_TOKEN));
                isRefreshing = false;
                originalRequest.headers['Authorization'] = 'Bearer ' + sessionStorage.getItem(ACCESS_TOKEN);
                return appClient(originalRequest);
            }
            catch(err){
                processQueue(err, null);
                isRefreshing = false;
                return Promise.reject(err);
            }
        }

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