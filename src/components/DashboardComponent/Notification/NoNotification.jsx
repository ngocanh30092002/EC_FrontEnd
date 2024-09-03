import React from 'react'

function NoNotification() {
    const imgUrlBase = '../../src/assets/imgs/';

    return (
        <div className='flex flex-col justify-center items-center h-full'>
            <img src={imgUrlBase + "no_notifications.svg"} alt="no-notifications" className='w-[100px]'/>
            <span>No notifications</span>
        </div>

    )
}

export default NoNotification