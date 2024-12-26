import React, { createContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant';
import { homeComponents, settingComponents, shorcutToAdminComponent, studyComponents } from "../SideBarInfo";
import './SideBarStyle.css';
const SideBarContext = createContext();

function SideBar({ className }) {
    const [isExpand, setExpand] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [roles, setRoles] = useState([]);
    const [isTeacher, setIsTeacher] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const getCurrentRoles = async () => {
        try {
            const response = await appClient.get("api/roles/user");
            const dataRes = response.data;
            if (dataRes.success) {
                setRoles(dataRes.message);
                setIsAdmin(dataRes.message.some(r => r == "Admin"));
                setIsTeacher(dataRes.message.includes("Teacher") && !dataRes.message.includes("Admin"))
            }
        }
        catch {

        }
    }

    useEffect(() => {
        getCurrentRoles();
    }, [])

    return (
        <div className={`side-bar__wrapper 
            absolute !overflow-hidden z-[999] ${isExpand ? "h-full flex flex-col border-1" : "h-[70px] !border-none"}
            md:static md:h-screen md:border-r md:overflow-visible md:flex-col md:inline-flex md:max-w-[200px] 
            lg:max-w-[230px] ${className}`}>
            <SideBarContext.Provider value={{ isExpand, onSetExpand: setExpand }}>
                <SideBarTitle isExpand={isExpand} onSetExpand={setExpand} />

                <ul className='side-bar__home'>
                    {homeComponents.map((item, index) => <SideBarItem key={index} item={item} isExpand={isExpand} onActive={setActiveIndex} activeIndex={activeIndex} />)}
                </ul>

                <ul className="side-bar__study-info">
                    {studyComponents.map((item, index) => <SideBarItem key={index} item={item} isExpand={isExpand} onActive={setActiveIndex} activeIndex={activeIndex} />)}
                </ul>

                <ul className='side-bar__extension'>
                    {isAdmin && <SideBarItem item ={shorcutToAdminComponent} isExpand={isExpand} onActive={setActiveIndex} activeIndex={activeIndex} />}
                   
                    {settingComponents.map((item, index) => {
                        return item.link === "/issues" ? 
                        isTeacher == false && isAdmin == false ? <SideBarItem key={index} item={item} isExpand={isExpand} onActive={setActiveIndex} activeIndex={activeIndex} />: null
                        :
                        <SideBarItem key={index} item={item} isExpand={isExpand} onActive={setActiveIndex} activeIndex={activeIndex} />
                    })}
                </ul>
            </SideBarContext.Provider>
        </div>
    )
}

function SideBarTitle({ isExpand, onSetExpand }) {
    const imgRef = useRef(null);
    const imgMobileRef = useRef(null);
    const handleCloseSideBarClick = () => {
        onSetExpand(!isExpand);
        imgRef.current.src = isExpand ? IMG_URL_BASE + "next.svg" : IMG_URL_BASE + "previous.svg";
        imgMobileRef.current.src = isExpand ? IMG_URL_BASE + "menu.svg" : IMG_URL_BASE + "close.svg";
    }

    useEffect(() => {
        const handleResizeWindow = () => {
            if (window.innerWidth < 768) {
                onSetExpand(false);
                imgMobileRef.current.src = IMG_URL_BASE + "menu.svg";
            }
        }

        handleResizeWindow();

        window.addEventListener("resize", handleResizeWindow);

        return () => {
            window.removeEventListener('resize', handleResizeWindow);
        }
    }, []);

    useEffect(() => {
        imgRef.current.src = !isExpand ? IMG_URL_BASE + "next.svg" : IMG_URL_BASE + "previous.svg";
    }, [isExpand])

    return (
        <div className="side-bar__title">
            <span className={`sb__title-slogan w-0 text-[22px] md:text-[16px] lg:text-[18px] ${isExpand ? "w-[200px] md:w-[130px] lg:w-[150px]" : "md:w-0 md:mr-0"}`}>LinguaVibe </span>
            <button className='side-bar__btn' onClick={handleCloseSideBarClick}>
                <img src={IMG_URL_BASE + "previous.svg"} alt="" className='hidden md:block md:w-[20px]' ref={imgRef} />
                <img src={IMG_URL_BASE + "close.svg"} alt="" className='w-[20px] block md:hidden' ref={imgMobileRef} />
            </button>
        </div>
    )
}

function SideBarItem({ isExpand, item, onActive, activeIndex }) {
    const location = useLocation();

    useEffect(() => {
        const pathName = location.pathname;
        if (pathName.includes(item.linkToRedirect)) {
            onActive(item.id);
        }
    }, [location])

    const handleClickSideBar = () => {
        onActive(item.id);
    }
    return (
        <li className='overflow-visible'>
            <Link className={`sb-item__wrapper ${isExpand ? "" : "mini"} ${activeIndex == item.id ? "active" : ''}`} to={item.linkToRedirect} onClick={handleClickSideBar}>
                <img src={IMG_URL_BASE + item.img} alt={'image_' + item.name} className='sb-item__img' />
                <span className={`sb-item__text`}>{item.name}</span>

                {!isExpand && <div className='sb-sub__title'>{item.name}</div>}
            </Link>
        </li>
    )
}
export default SideBar