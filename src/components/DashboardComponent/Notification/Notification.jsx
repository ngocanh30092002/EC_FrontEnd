import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { homeComponents, settingComponents, studyComponents } from '../SideBarInfo';
import "./NotificationStyle.css";
import NotificationBoard from './NotificationBoard';

function Notification({className}) {
    const [isShowSearchInput, setShowInput] = useState(false);
    const [pageTitle, setPageTitle] = useState();
    const imgUrlBase = "../../src/assets/imgs/"
    const location = useLocation();

    useEffect(()=>{
       setPageTitle("Welcome back, Ngoc Anh");
    }, [])

    useEffect(()=>{
        const getCurrentPage = () =>{
            let item = homeComponents.find(i => i.link === location.pathname);
            if(item) return item;

            item = studyComponents.find(i => i.link === location.pathname);
            if(item) return item;

            item = settingComponents.find(i => i.link === location.pathname);
            return item;
        }

        const currentPageInfo = getCurrentPage();
        if(currentPageInfo){
            setPageTitle(currentPageInfo.name);
            document.title = currentPageInfo.name;
        }
    },[location])


    return (
        <div className={`flex justify-end items-center pr-[10px] md:justify-between md:px-[20px] overflow-visible ${className}`}>
            <div className='noti__welcome hidden md:block'>{pageTitle}</div>
            <div className='h-[70px] flex justify-end items-center overflow-visible flex-1 bg-white'>
                {isShowSearchInput && <input type='text' className='noti__search-input w-[150px] md:w-[200px]'/>}
                <div className='noti__item' onClick={() => setShowInput(!isShowSearchInput)}>
                    <img src={imgUrlBase + "search_icon.svg"} alt="" className="w-[24px] noti__item--img"/>
                </div>
                
                <NotificationBoard imgUrlBase={imgUrlBase} />
                <a className='noti__user-infor-wrapper' href='#'>
                    <img src={imgUrlBase + "user_image.jpg"} alt="user image" className="user-infor__img" />
                    <div className="user-infor__body">
                        <div className="user-infor__name">
                            Ngoc Anh
                        </div>
                        <div className='user-infor__role'>
                            Student
                        </div>    
                    </div>               
                </a>
            </div>
        </div>
    )
}


export default Notification