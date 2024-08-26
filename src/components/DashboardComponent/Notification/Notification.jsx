import React, { useState } from 'react'
import "./NotificationStyle.css";

function Notification() {
    const [isShowSearchInput, setShowInput] = useState(false);
    const imgUrlBase = "../../src/assets/imgs/"
    return (
        <div className='noti__wrapper h-[70px] flex justify-end items-center'>
            {isShowSearchInput && <input type='text' className='noti__search-input'/>}
            <div className='noti__item' onClick={() => setShowInput(!isShowSearchInput)}>
                <img src={imgUrlBase + "search_icon.svg"} alt="" className="w-[24px]" />
            </div>
            <div className='noti__item last'>
                <img src={imgUrlBase + "alert_bell1.svg"} alt="" className="w-[24px]" />
            </div>
            <div className='noti__user-infor-wrapper'>
                <img src={imgUrlBase + "user_image.jpg"} alt="user image" className="user-infor__img" />
                <div className="user-infor__body">
                    <div className="user-infor__name">
                        Ngoc Anh
                    </div>
                    <div className='user-infor__role'>
                        Student
                    </div>    
                </div>               
            </div>
        </div>
    )
}

export default Notification