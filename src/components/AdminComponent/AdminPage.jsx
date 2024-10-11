import React, { useEffect, useState } from 'react'
import { appClient } from '../../../AppConfigs';
import { APP_URL } from '~/GlobalConstant.js';

function AdminPage() {
    const [audioLink , setAudioLink] = useState(null);

    useEffect(() =>{
        const getAudio = async() =>{
            try{
                const response = await appClient.get("api/lc-images")
                const data = response.data;
                if(data.success){
                    setAudioLink(...data.message);
                }
            }
            catch(error){
    
            }
        }
        
        getAudio();
    }, [])

    console.log(APP_URL + audioLink?.audioUrl);

    return (
        <div>
            {audioLink &&  
            <div>
                <audio controls>
                    <source src={APP_URL + audioLink?.audioUrl} type="audio/mpeg"/>
                </audio>

                <img src={APP_URL + audioLink?.imageUrl}></img>
            </div>
            }
        </div>
    )
}

export default AdminPage