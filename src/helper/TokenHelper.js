import { jwtDecode } from 'jwt-decode';
import { APP_API , CLIENT_URL } from '../../GlobalConstant.js'


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

async function GenerateNewAccessToken(accessToken, refreshToken){
    try{
        var response = await fetch(APP_API + "Token/renew-token",{
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'AccessToken': accessToken,
                'RefreshToken': refreshToken,
            })
        })
        
        if(!response.ok){
            window.location.href = CLIENT_URL + "account/login";
        }
    }
    catch(e){
        window.location.href = CLIENT_URL + "account/login";
    }
}

async function VerifyAccessToken(accessToken){
    try{
        var response = await fetch(APP_API + "Token/verify-token",{
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
    Renew: async (accessToken, refreshToken) => await GenerateNewAccessToken(accessToken, refreshToken),
    IsExpired: (accessToken) => IsTokenExpired(accessToken)
}

export default TokenHelpers;