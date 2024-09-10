import React from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant';

function NoNotification() {
    return (
        <div className='flex flex-col justify-center items-center h-full'>
            <img src={IMG_URL_BASE + "no_notifications.svg"} alt="no-notifications" className='w-[100px]'/>
            <span>No notifications</span>
        </div>

    )
}

export default NoNotification