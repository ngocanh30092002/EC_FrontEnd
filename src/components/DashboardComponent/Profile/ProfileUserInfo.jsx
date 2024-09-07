import React, { useContext, memo } from 'react'
import { Route, Routes, Link } from 'react-router-dom';
import { ProfileContext } from './ProfilePage';

function ProfileUserInfo({ className }) {
    const {profileInfo}  = useContext(ProfileContext);

    return (
        <div className={className}>
            <Routes>
                {profileInfo.map((itemInfo, index) =>{
                    return <Route path={itemInfo.link} element = {itemInfo.component} key={index} />
                })}
            </Routes>
        </div>
    )
}

export default memo(ProfileUserInfo)