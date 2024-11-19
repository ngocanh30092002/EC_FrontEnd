import React, { memo, useContext, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ProfileContext } from './ProfilePage'

function ProfileSideBar({ className }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const {profileInfo} = useContext(ProfileContext);
    
    return (
        <div className={`${className} mb-[20px] md:mb-0 md:border-r`}>
            <ul className='ps__wrapper flex md:block gap-4'>
                {profileInfo.map((item,index) =>{
                    return (
                        <ProfileSideBarItem 
                            key={index} 
                            item={item} 
                            setActive = {setActiveIndex} 
                            isActive ={activeIndex == index}
                            index ={index}/>
                    )
                })}
            </ul>
        </div>
    )
}

function ProfileSideBarItem({item, setActive, isActive, index}) {
    const location = useLocation();
    
    useEffect(() =>{
        const pathName = location.pathname;
        
        if(pathName.includes(item.link)){
            setActive(index);
        }
    }, [location])

    const handleClickSideBar = (e) =>{
        setActive(index);
    }

    return <li className={`psi__item ${isActive ? "active" : ""}` } onClick={(e) => handleClickSideBar(e)}>
        <Link to={item.link} className='psi__item--link' >
            {item.name}    
        </Link>
    </li>
}

export default memo(ProfileSideBar)