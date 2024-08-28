import React, { createContext, useContext, useRef, useState, useEffect } from 'react'
import './SideBarStyle.css';
import { Link, useLocation } from 'react-router-dom';
import {homeComponents, studyComponents, settingComponents} from "../SideBarInfo"
const SideBarContext = createContext();

function SideBar() {
    const [isExpand, setExpand] = useState(true); 
    return (
        <div className={`side-bar__wrapper 
            fixed overflow-hidden z-10 ${isExpand ? "h-screen flex flex-col border-1":"h-[70px] border-0"}
            md:static md:h-screen md:border-r md:overflow-visible md:flex-col md:inline-flex md:max-w-[200px] 
            lg:max-w-[230px]`}>
            <SideBarContext.Provider value={{isExpand, onSetExpand: setExpand}}>
                <SideBarTitle isExpand={isExpand} onSetExpand={setExpand}/>

                <ul className='side-bar__home'>
                    {homeComponents.map((item, index) => <SideBarItem key={index} item={item} isExpand={isExpand}/>)}
                </ul>

                <ul className="side-bar__study-info">
                    {studyComponents.map((item, index) => <SideBarItem key={index} item={item} isExpand={isExpand}/>)}
                </ul>

                <ul className='side-bar__extension'>
                    {settingComponents.map((item, index) =><SideBarItem key={index} item={item} isExpand={isExpand}/>)}
                </ul>
            </SideBarContext.Provider>
        </div>
    )
}

function SideBarTitle({isExpand, onSetExpand}) {
    const imgUrlBase = "../../src/assets/imgs/";
    const imgRef = useRef(null);
    const imgMobileRef = useRef(null);
    const handleCloseSideBarClick = () =>{
        onSetExpand(!isExpand);
        imgRef.current.src = isExpand ? imgUrlBase + "next.svg" : imgUrlBase + "previous.svg" ;
        imgMobileRef.current.src = isExpand ? imgUrlBase + "menu.svg" : imgUrlBase + "close.svg";
    }

    useEffect(() =>{
        const handleResizeWindow = () =>{
            if(window.innerWidth < 768){
                onSetExpand(false);
                imgMobileRef.current.src = imgUrlBase + "menu.svg";
            }
        }

        handleResizeWindow();
        
        window.addEventListener("resize", handleResizeWindow);

        return () =>{
            window.removeEventListener('resize', handleResizeWindow);
        }
    },[]);
    
    useEffect(() =>{
        imgRef.current.src = !isExpand ? imgUrlBase + "next.svg" : imgUrlBase + "previous.svg" ;
    }, [isExpand])

    return (
        <div className="side-bar__title">
            <span className={`sb__title-slogan w-0 text-[22px] md:text-[16px] lg:text-[18px] ${isExpand ? "w-[200px] md:w-[130px] lg:w-[150px]" : "md:w-0 md:mr-0"}`}>E-Center</span>
            <button className='side-bar__btn' onClick={handleCloseSideBarClick}>
                <img src={imgUrlBase + "previous.svg"} alt="" className='hidden md:block md:w-[20px]' ref={imgRef} />
                <img src={imgUrlBase + "close.svg"} alt="" className='w-[20px] block md:hidden' ref={imgMobileRef}/>
            </button>
        </div>
    )
}

function SideBarItem({isExpand, item}){
    const [isActive, setActive] = useState(false);
    const location = useLocation();
    const imgUrlBase = "../../src/assets/imgs/";

    useEffect(() =>{
        var nameUrl = window.location.pathname;
        nameUrl = nameUrl.substring(1);
        if(nameUrl == item.name.toLowerCase().replace(" ",'')){
            setActive(true);
        }
        else if(nameUrl === '' && item.name.toLowerCase() === 'home'){
            setActive(true);
        }
        else{
            setActive(false);
        }
    }, [location] )

    return (
        <li className='overflow-visible'>
            <Link className={`sb-item__wrapper ${isExpand ? "" : "mini"} ${isActive ? "active" : ''}`} to={item.link}>
                <img src={imgUrlBase + item.img} alt={'image_' + item.name} className='sb-item__img'/>
                <span className={`sb-item__text`}>{item.name}</span>

                {!isExpand && <div className='sb-sub__title'>{item.name}</div>}
            </Link>
        </li>
    )
}
export default SideBar