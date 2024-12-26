import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
import { CourseMainContext } from './CourseMainDetail';

function SideBar({ className }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const detailData = useContext(CourseMainContext);

    return (
        <div className={`${className}`}>
            <ul className='sbmd__wrapper'>
                {detailData.map((item, index) => {
                    return (
                        <SideBarItem item={item} key={index} index={index} isActive={activeIndex == index} setActive={setActiveIndex} />
                    )
                })}
            </ul>
        </div>
    )
}

function SideBarItem({ item, isActive, setActive, index }) {
    const location = useLocation();

    const getSubstringAfterDetail = () => {
        const currentPath = window.location.pathname;
        const startIndex = currentPath.indexOf('detail');

        if (startIndex !== -1) {
            const substring = currentPath.substring(startIndex + 'detail'.length + 1);
            return substring;
        }

        return '';
    };

    useEffect(() => {
        const pathName = getSubstringAfterDetail();

        if (pathName.includes(item.link.replace("/*", ''))) {
            setActive(index);
        }
    }, [location])

    const handleClickSideBar = (e) => {
        setActive(index);
    }

    return (
        <li className={`psi__item ${isActive ? "active" : ""}`} onClick={(e) => handleClickSideBar(e)}>
            <Link to={item.link.replace("/*", "")} className='psi__item--link' >
                {item.name}
            </Link>
        </li>
    )
}

export default SideBar