import React, { useContext, useEffect, useState } from 'react'
import { ClassPageContext } from '../ClassPage';
import { APP_URL, IMG_URL_BASE } from '~/GlobalConstant.js';

function MemberItem({ data }) {
    const {chats} = useContext(ClassPageContext);
    let message = "";
    if(data.isDelete == true){
        message = "This message has been deleted."
    }
    else if(data.lastMessage){
        message = data.lastMessage;
    }
    else{
        message = "Say hi with friend"
    }

    const handleShowChat = () => {
        chats.add(data);
    }


    return (
        <div className='member-item__wrapper flex items-center' onClick={handleShowChat}>
            <div className='inline-block relative z-0 overflow-visible'>
                <img src={data?.image ? APP_URL + data?.image : IMG_URL_BASE + "unknown_user.jpg"} className='mi__image ' />

                <div className={`mi__image-status ${data?.online == true ? "online" : ""}`}></div>
            </div>

            <div className='flex-1 ml-[10px]'>
                <div className='mi__name-user line-clamp-1'>
                    {data?.userName}
                </div>

                <div className='mi__last-message line-clamp-1'>
                    {message}
                </div>
            </div>

            {
                data?.isRead === false && data?.lastMessage && <div className='mi__read-noti'></div>
            }
        </div>
    )
}

export default MemberItem