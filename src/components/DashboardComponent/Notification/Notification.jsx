import { useStore } from '@/store';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { APP_URL, IMG_URL_BASE } from '~/GlobalConstant';
import { adminStudyComponents, adminUserComponents, homeComponents, settingComponents, studyComponents, teacherComponents } from '../SideBarInfo';
import NotificationBoard from './NotificationBoard';
import "./NotificationStyle.css";

function Notification({ className, title, mode = 0 }) {
    const [pageTitle, setPageTitle] = useState(title);
    const unknownUserImage = IMG_URL_BASE + "unknown_user.jpg";
    const location = useLocation();
    const [userInfo, setUserInfo] = useState();
    const [state] = useStore();

    const getUserInfo = useCallback(async () => {
        try {
            const response = await appClient.get("api/users/bg-info")
            const data = response.data;

            if (data.success) {
                setUserInfo(data.message);
                if (title != "") {
                    setPageTitle(title);
                }
                if (!title) {
                    setPageTitle(`Welcome back ${data.message.userName}`)
                }
            }
        }
        catch (error) {

        }
    }, [])

    useEffect(() => {
        getUserInfo();
    }, [])

    useEffect(() => {
        if (state.isReloadUserBackground) {
            getUserInfo();
        }

    }, [state.isReloadUserBackground])

    useEffect(() => {
        const getCurrentPage = () => {

            if (mode == 0) {
                const pathItem = location.pathname.slice(1).split("/");
                let item = homeComponents.find(i => pathItem.includes(i.linkToRedirect.slice(1)));
                if (item) return item;

                item = studyComponents.find(i => pathItem.includes(i.linkToRedirect.slice(1)));
                if (item) return item;

                item = settingComponents.find(i => pathItem.includes(i.linkToRedirect.slice(1)));
                if (item) return item;
            }
            else if (mode == 1) {
                const pathItem = location.pathname.replace("/admin", "").slice(1).split("/");

                let item = adminUserComponents.find(i => pathItem.includes(i.linkToRedirect.replace("/admin", "").slice(1)));
                if (item) return item;

                item = adminStudyComponents.find(i => pathItem.includes(i.linkToRedirect.replace("/admin", "").slice(1)));
                if (item) return item;
            }
            else if (mode == 2) {
                const pathItem = location.pathname.replace("/teacher", "").slice(1).split("/");

                let item = teacherComponents.find(i => pathItem.includes(i.linkToRedirect.replace("/teacher", "").slice(1)));
                if (item) return item;
            }


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