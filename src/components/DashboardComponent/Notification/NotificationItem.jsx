import React from 'react'
import { appClient } from '~/AppConfigs';
import { APP_URL } from '~/GlobalConstant';
import toast from '@/helper/Toast';

function NotificationItem({itemInfo, onMarkNoti}){
    const getTimeBefore = (time) =>{
        const pastDate = new Date(time);
        const timeDifference = new Date() - pastDate;

        const minuteDiff = timeDifference / (1000 * 60);
        const hoursDiff = timeDifference / (1000 * 60 * 60);
        const dayDiff = timeDifference / (1000 * 60 * 60 * 24);


        if(Math.floor(minuteDiff) === 0){
            return 'Just now'
        }
        else if(minuteDiff < 60){
            return `${Math.floor(minuteDiff)} minutes`
        }
        else if(hoursDiff <= 24) {
            return `${Math.floor(hoursDiff)} hours`
        }
        else{
            return `${Math.floor(dayDiff)} days`
        }
    }

    const handleNotiClick = (e) =>{
        try{
            appClient.patch(`api/Notification/mark-read/${itemInfo.NotiStuId}`)
        }
        catch(error){
           
        }


        onMarkNoti(itemInfo.NotiStuId);

        e.preventDefault();
    }

    return (
        <a className='nli__item flex items-center' href="/courses" onClick={(e) => {handleNotiClick(e)}}>
            <div className='noti-item__header'>
                <img src={APP_URL + itemInfo.Image}/>
            </div>

            <div className='noti-item__body flex flex-col'>
                <span className='noti-item__body--title'>{itemInfo.Title}</span>
                <span className='noti-item__body--des line-clamp-2'>{itemInfo.Description}</span>
                <span className='noti-item__body--time'>{getTimeBefore(itemInfo.Time)}</span>
            </div>

            <div className={itemInfo.IsRead ? "" : "noti-item__unread"}></div>
        </a>
    )
}

export default NotificationItem