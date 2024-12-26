import toast from '@/helper/Toast';
import axios from 'axios';
import { APP_URL, CLIENT_URL } from './GlobalConstant';
import TokenHelpers from './src/helper/TokenHelper';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};


export const appClient = axios.create({
    baseURL: APP_URL,
    withCredentials: true
});

appClient.interceptors.request.use(
    function (request){
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
       

        var time = 1;
        if(error.response){
            var statusCode = error?.response?.status;
            const originalRequest = error?.config;
    
            if(statusCode === 401 && !originalRequest._retry){
                if(isRefreshing){
                    return new Promise(function(resolve, reject) {
                        failedQueue.push({resolve, reject});
                    })
                    .then(() => {
                        return appClient(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
                }
    
                originalRequest._retry = true;
                isRefreshing = true;
    
                try{
                    await TokenHelpers.Renew(true);
                    processQueue(null);
                    isRefreshing = false;
    
                    return appClient(originalRequest);
                }
                catch(err){
                    processQueue(err);
                    isRefreshing = false;
                    return Promise.reject(err);
                }
            }

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
                        title: "Error",
                        message: serverReponseError,
                        duration: 4000*time
                    });

                    time = time + 1;
                }
            }
            else{
                var errorCode = error.code
                var errorMessage = error.message;
                
                if(errorMessage.includes("403")){
                    window.location.href = CLIENT_URL + "access-denied";
                }
                else{
                    toast({
                        type: "error",
                        title: errorCode,
                        message: errorMessage,
                        duration: 4000*time
                    });
                }
            }
        }
        else{
            window.location.href = CLIENT_URL + "account/login";
        }

        return Promise.reject(error);
    }
    
)