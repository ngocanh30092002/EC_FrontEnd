import React, { createContext, useContext, useRef, useState, useEffect } from 'react'
import './SideBarStyle.css';

const SideBarContext = createContext();

function SideBar() {
    const [isExpand, setExpand] = useState(true); 


    
    return (
        <div className={`side-bar__wrapper 
            fixed overflow-hidden z-10 ${isExpand ? "h-screen flex flex-col border-1":"h-[70px] border-0"}
            md:static md:h-screen md:border-r md:overflow-x-visible md:flex-col md:inline-flex md:max-w-[200px] 
            lg:max-w-[230px]`}>
            <SideBarContext.Provider value={{isExpand, onSetExpand: setExpand}}>
                <SideBarTitle/>
                <SideBarHome/>
                <SideBarCourses/>
                <SideBarExtension/>
            </SideBarContext.Provider>
        </div>
    )
}

function SideBarTitle() {
    const {isExpand, onSetExpand} = useContext(SideBarContext);

    console.log("rerender");
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
            else{
                onSetExpand(true);
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
            <span className={`sb__title-slogan w-0 text-[25px] md:text-[16px] lg:text-[18px] ${isExpand ? "w-[250px] md:w-[130px] lg:w-[150px]" : "md:w-0 md:mr-0"}`}>English Center</span>
            <button className='side-bar__btn' onClick={handleCloseSideBarClick}>
                <img src={imgUrlBase + "previous.svg"} alt="" className='hidden md:block md:w-[20px]' ref={imgRef} />
                <img src={imgUrlBase + "close.svg"} alt="" className='w-[20px] block md:hidden' ref={imgMobileRef}/>
            </button>
        </div>
    )
}

function SideBarHome(){

    const {isExpand} = useContext(SideBarContext);

    const imgUrlBase = "../../src/assets/imgs/";
    const components = [
        {
            name: "Home",
            img: imgUrlBase + 'home_icon.svg',
        },
        {
            name: "Bookmarks",
            img: imgUrlBase + 'bookmark_icon.svg',
        }
    ]

    return (
        <ul className='side-bar__home'>
            {components.map((item, index) => <SideBarItem key={index} imgLink={item.img} title = {item.name} isExpand={isExpand}/>)}
        </ul>
    )
}


function SideBarCourses(){
    const imgUrlBase = "../../src/assets/imgs/";
    const {isExpand} = useContext(SideBarContext);

    const components = [
        {
            name: "Toeics",
            img: imgUrlBase + 'toeic_icon.svg',
        },
        {
            name: "Courses",
            img: imgUrlBase + 'hat_icon.svg'
        },
        {
            name: "Homework",
            img: imgUrlBase + 'homework_icon.svg'
        },
        {
            name: "Your Dictionary",
            img: imgUrlBase + 'dictionary_icon.svg'
        },
    ]

    return (
        <ul className="side-bar__courses-info">
            {components.map((item, index) => <SideBarItem key={index} imgLink={item.img} title = {item.name} isExpand={isExpand}/>)}
        </ul>
    )
}

function SideBarExtension(){
    const imgUrlBase = "../../src/assets/imgs/";
    const {isExpand} = useContext(SideBarContext);

    const components = [
        {
            name: "Setting",
            img: imgUrlBase + 'setting.svg'
        },
        {
            name: "Help Center",
            img: imgUrlBase + 'question_icon.svg'
        },
        {
            name: "Log Out",
            img: imgUrlBase + 'close_sidebar.svg'
        },
     ]

    return (
        <ul className='side-bar__extension'>
            {components.map((item, index) => <SideBarItem key={index} imgLink={item.img} title = {item.name} isExpand={isExpand}/>)}
        </ul>
    )
}


function SideBarItem({imgLink, title, isExpand}){
    return (
        <li className={`sb-item__wrapper ${isExpand ? "" : "mini"}`} >
            <img src={imgLink} alt={'image_' + title} className='sb-item__img'/>
            <span className={`sb-item__text`}>{title}</span>

            {!isExpand && <div className='sb-sub__title'>{title}</div>}
        </li>
    )
}
export default SideBar