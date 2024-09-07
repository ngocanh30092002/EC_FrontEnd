import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import "./ProfileStyle.css"
import { useStore } from '@/store';
import { appClient } from '~/AppConfigs';
import toast from '@/helper/Toast';

function ProfileBackground({ className }) {
    const userImageRef = useRef(null);
    const backgroundImageRef = useRef(null);
    const imgUrlBase = '/src/assets/imgs/'
    const [userBackground , setUserBackground] = useState();
    const [state] = useStore();
    

    const getUserBackgroundInfo = useCallback(async () =>{
        try{
            const response = await appClient.get("api/users/user-background-info")
            const data = response.data;

            if(data.success){
                setUserBackground(data.message);
            }
            else{
                toast({
                    type: "error",
                    title: "Error",
                    duration: 5000,
                    message: data.message
                })
            }
        }
        catch(error){
            
        }
    }, [])

    const changeImageBackground = useCallback(async (fileData, apiPath) => {
        var formData = new FormData();
        formData.append("file", fileData)
        formData.append("mineType", fileData.type);

        try{
            const response = await appClient.post(apiPath, fileData);
            const data = response.data;

            if(data.success){
                toast({
                    type: "success",
                    title: "Success",
                    message: "Uploaded successfully",
                    duration: 5000
                })
            }
            
        }
        catch(error){

        }

    }, [])

    useEffect(() => {
        if(state.isReloadUserBackground){
            getUserBackgroundInfo();
        }
    }, [state.isReloadUserBackground])


    useEffect(() => {
        getUserBackgroundInfo();
    }, [])


    const handleUserImageChange = (e) =>{
        const fileData = e.target.files[0];
        const apiPath = ""
    }

    const handleBackgroundChange = (e) =>{
        console.log(e.target.files);
    }


    const handleClickUploadUserImage = () =>{
        userImageRef.current.click();
    }

    const handleClickUploadBackground = () =>{
        backgroundImageRef.current.click();
    }
    return (
        <div className={`h-[500px] ${className}`}>
            <div className='h-[300px] relative'>
                <img src={imgUrlBase + "image-background.jpg"} alt='image-background' className='pb__image--bg' />
                <span className='pb__edit--img' onClick={handleClickUploadBackground}>Edit</span>
            </div>
            
            <div className='pbb__line'>
                <div className="pb__body">
                    <div className="pbb__user">
                        <img src={imgUrlBase + "user_image.jpg"} alt="user-image" className="pbb__user--img" />
                        <img 
                            src={imgUrlBase + 'camera-icon.svg'} 
                            alt='image-camera' 
                            className='pbb__user--icon'
                            onClick={handleClickUploadUserImage}/>
                    </div>
                    <div className="pbb__user--info">
                        <span className="pbb__user-name">{userBackground?.userName ?? "User Name"}</span>
                        <span className="pbb__user-descriptions">{userBackground?.description ?? "Description"}</span>
                    </div>
                </div>
            </div>

            <input 
                type='file' 
                ref ={userImageRef} 
                className='hidden'
                accept="image/*"
                onChange={handleUserImageChange}/>

            <input 
                type='file' 
                ref ={backgroundImageRef} 
                className='hidden'
                accept="image/*"
                onChange={handleBackgroundChange}/>
        </div>
    )
}

export default memo(ProfileBackground)