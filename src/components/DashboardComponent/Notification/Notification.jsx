import { useStore } from '@/store';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { APP_URL, IMG_URL_BASE } from '~/GlobalConstant';
import { homeComponents, settingComponents, studyComponents } from '../SideBarInfo';
import NotificationBoard from './NotificationBoard';
import "./NotificationStyle.css";

function Notification({ className }) {
    const [isShowSearchInput, setShowInput] = useState(false);
    const [pageTitle, setPageTitle] = useState();
    const unknownUserImage = IMG_URL_BASE + "unknown_user.jpg";
    const location = useLocation();
    const [userInfo, setUserInfo] = useState();
    const [state] = useStore();

    const getUserInfo = useCallback(async () =>{
        try{
            const response = await appClient.get("api/students/user-background-info")
            const data = response.data;

            if(data.success){
                setUserInfo(data.message);
            }
        }
        catch(error){
           
        }
    }, [])

    useEffect(() => {
        setPageTitle("Welcome back, Ngoc Anh");
        getUserInfo();
    }, [])

    useEffect(( ) =>{
        if(state.isReloadUserBackground){
            getUserInfo();
        }

    }, [state.isReloadUserBackground])

    useEffect(() => {
        const getCurrentPage = () => {
            const pathItem = location.pathname.slice(1).split("/");
            let item = homeComponents.find(i => pathItem.includes(i.linkToRedirect.slice(1)));
            if (item) return item;

            item = studyComponents.find(i => pathItem.includes(i.linkToRedirect.slice(1)));
            if (item) return item;

            item = settingComponents.find(i => pathItem.includes(i.linkToRedirect.slice(1)) );
            return item;
        }

        const currentPageInfo = getCurrentPage();
        if (currentPageInfo) {
            setPageTitle(currentPageInfo.name);
            document.title = currentPageInfo.name;
        }
    }, [location])


    return (
        <div className={`flex justify-end items-center pr-[10px] md:justify-between md:px-[20px] md:overflow-visible overflow-hidden ${className}`}>
            <div className='noti__welcome hidden md:block'>{pageTitle}</div>
            <div className='h-[70px] flex justify-end items-center overflow-visible flex-1 bg-white'>
                {isShowSearchInput && <input type='text' className='noti__search-input w-[150px] md:w-[200px]' />}
                <div className='noti__item' onClick={() => setShowInput(!isShowSearchInput)}>
                    <img src={IMG_URL_BASE + "search_icon.svg"} alt="" className="w-[24px] noti__item--img" />
                </div>

                <NotificationBoard />
                <a className='noti__user-infor-wrapper' href='#'>
                    <img src={userInfo?.image ? APP_URL + userInfo.image : unknownUserImage} alt="user image" className="user-infor__img" />
                    <div className="user-infor__body">
                        <div className="user-infor__name" title={userInfo?.userName ?? "User Name"}>
                            {userInfo?.userName ?? "User Name"}
                        </div>
                        <div className='user-infor__role'>
                            {userInfo?.roles[0] ?? "Role"}
                        </div>
                    </div>
                </a>
            </div>
        </div>
    )
}


export default Notification