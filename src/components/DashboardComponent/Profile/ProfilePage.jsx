import React, { createContext, useState } from 'react'
import "./ProfileStyle.css"
import ProfileBackground from './ProfileBackground'
import ProfileSideBar from './ProfileSideBar'
import ProfileUserInfo from './ProfileUserInfo'
import EditProfileItem from './EditProfileItem'
import PasswordProfileItem from './PasswordProfileItem'
import EditBackgroundItem from './EditBackgroundItem'

export const ProfileContext = createContext();

function ProfilePage() {
    var contextData = {
        profileInfo: [
            {
                name: "Edit Profile",
                link: "",
                component: <EditProfileItem />
            },
            {
                name: "Edit Background",
                link: "edit-background",
                component: <EditBackgroundItem/>
            },
            {
                name:"Password",
                link:"password",
                component: <PasswordProfileItem/>
            }
        ],
    }

    return (
        <div className='m-[20px]'>
            <ProfileContext.Provider value={contextData}>
                <ProfileBackground className={""} />

                <div className='md:flex min-h-[400px]'>
                    <ProfileSideBar className={"w-full flex justify-center md:w-[280px] md:block "} />
                    <ProfileUserInfo className={"flex-1 px-[20px]"} />
                </div>
            </ProfileContext.Provider>
        </div>
    )
}

export default ProfilePage