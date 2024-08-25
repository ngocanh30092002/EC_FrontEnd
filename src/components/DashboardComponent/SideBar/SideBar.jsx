import React, { useRef, useState } from 'react'
import './SideBarStyle.css';

function SideBar() {
    const [isExpand, setExpand] = useState(true); 

    return (
        <div className='side-bar__wrapper'>
            <SideBarTitle isExpand = {isExpand} onSetExpand = {setExpand}/>
            <SideBarHome isExpand = {isExpand}/>
            <SideBarCourses isExpand = {isExpand}/>
            <SideBarExtension isExpand = {isExpand}/>
        </div>
    )
}

function SideBarTitle({isExpand, onSetExpand}) {
    
    const imgUrlBase = "../../src/assets/imgs/";
    const imgRef = useRef(null);

    const handleCloseSideBarClick = () =>{
        onSetExpand(!isExpand);
        imgRef.current.src = isExpand ? imgUrlBase + "next.svg" : imgUrlBase + "previous.svg" ;
    }
    return (
        <div className="side-bar__title">
            <span className={`sb__title-slogan ${isExpand ? "w-[150px]" : "w-0 mr-0"}`}>English Center</span>
            <button className='side-bar__btn' onClick={handleCloseSideBarClick}>
                <img src={imgUrlBase + "previous.svg"} alt="" className='w-[20px]' ref={imgRef} />
            </button>
        </div>
    )
}

function SideBarHome({isExpand}){
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


function SideBarCourses({isExpand}){
    const imgUrlBase = "../../src/assets/imgs/";

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

    console.log(components);

    return (
        <ul className="side-bar__courses-info">
            {components.map((item, index) => <SideBarItem key={index} imgLink={item.img} title = {item.name} isExpand={isExpand}/>)}
        </ul>
    )
}

function SideBarExtension({isExpand}){
    const imgUrlBase = "../../src/assets/imgs/";

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
        </li>
    )
}
export default SideBar