import axios from 'axios';
import { ACCESS_TOKEN, PROVIDER, APP_API, REFRESH_TOKEN, CLIENT_URL } from './GlobalConstant';
import {GetCookie} from './src/helper/CookiesHelper';
import TokenHelpers from './src/helper/TokenHelper';

export const appClient = axios.create({
    baseURL: "https://localhost:44314/",
    withCredentials: true
});

appClient.interceptors.request.use(
    async function (request){
        var accessToken = GetCookie(ACCESS_TOKEN);
        var refreshToken = GetCookie(REFRESH_TOKEN);
        var provider = GetCookie(PROVIDER);
        if(TokenHelpers.IsExpired(accessToken,refreshToken)){
            await TokenHelpers.Renew(accessToken, refreshToken, provider);
        }

        return request;
    },
    function (error){
        return Promise.reject(error);
    }
)