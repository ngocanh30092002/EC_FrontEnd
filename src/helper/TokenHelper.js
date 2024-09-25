import { jwtDecode } from 'jwt-decode';
import { APP_API , CLIENT_URL, ACCESS_TOKEN, REFRESH_TOKEN } from '~/GlobalConstant.js'


function IsTokenExpired(accessToken){
    try{
        const decodeJwt = jwtDecode(accessToken);
        var currentTime = Math.floor(Date.now() / 1000);
        return decodeJwt.exp < currentTime;
    }
    catch (ex){
        return true;
    }
}

async function GenerateNewAccessToken(isRedirect){
    try{
        var accessToken = sessionStorage.getItem(ACCESS_TOKEN);
        var refreshToken = sessionStorage.getItem(REFRESH_TOKEN)
        
        var response = await fetch(APP_API + "tokens/renew",{
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'AccessToken':  encodeURIComponent(accessToken),
                'RefreshToken':  encodeURIComponent(refreshToken),
            })
        })

        if(response.ok){
            var data = await response.json();
            sessionStorage.setItem(ACCESS_TOKEN, data.token);
            sessionStorage.setItem(REFRESH_TOKEN, data.refreshToken);
        }

                
        if(!response.ok && isRedirect){
            window.location.href = CLIENT_URL + "account/login";
        }

    }
    catch(e){
        window.location.href = CLIENT_URL + "account/login";
    }
}

async function VerifyAccessToken(accessToken){
    try{
        var response = await fetch(APP_API + "tokens/verify",{
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(accessToken)
        })

        if(!response.ok){
            window.location.href = CLIENT_URL + "account/login";
        }

        var {isValid} = await response.json();
        return isValid;
    }
    catch(e){
        window.location.href = CLIENT_URL + "account/login";
    }
}

const TokenHelpers = {
    Verify: async (accessToken) => await VerifyAccessToken(accessToken),
    Renew: async (isRedirect = true) => await GenerateNewAccessToken(isRedirect),
    IsExpired: (accessToken) => IsTokenExpired(accessToken)
}

export default TokenHelpers;