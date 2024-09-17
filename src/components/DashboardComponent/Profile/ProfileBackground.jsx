import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import "./ProfileStyle.css"
import { useStore, actions } from '@/store';
import { appClient } from '~/AppConfigs';
import toast from '@/helper/Toast';
import { APP_URL, IMG_URL_BASE} from '~/GlobalConstant.js';

function ProfileBackground({ className }) {
    const userImageRef = useRef(null);
    const backgroundImageRef = useRef(null);
    const unknownUserImage = IMG_URL_BASE + "unknown_user.jpg";
    const defaultBackgroundImage = IMG_URL_BASE + "default_bg.jpg"
    const [userBackground , setUserBackground] = useState();
    const [state, dispatch] = useStore();
    

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

    const changeImageBackground = useCallback(async (fileData, apiPath, event) => {
        var formData = new FormData();
        formData.append("file", fileData)

        try{
            const response = await appClient.post(apiPath, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            });

            const data = response.data;

            if(data.success){
                toast({
                    type: "success",
                    title: "Success",
                    message: "Uploaded successfully",
                    duration: 5000
                })

                event.target.value = null;
                dispatch(actions.changeUserBackground(true))

                setTimeout(() => {
                    dispatch(actions.changeUserBackground(false));
                }, 1000);
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
        const apiPath = "api/users/profile-image";

        changeImageBackground(fileData, apiPath, e);
    }

    const handleBackgroundChange = (e) =>{
        const fileData = e.target.files[0];
        const apiPath = "api/users/background-image";

        changeImageBackground(fileData,apiPath, e);
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
                <img src={userBackground?.backgroundImage ? APP_URL + userBackground.backgroundImage : defaultBackgroundImage} alt='image-background' className='pb__image--bg' />
                <span className='pb__edit--img' onClick={handleClickUploadBackground}>Edit</span>
            </div>
            
            <div className='pbb__line'>
                <div className="pb__body">
                    <div className="pbb__user">
                        <img src={userBackground?.image ? APP_URL + userBackground.image : unknownUserImage} alt="user-image" className="pbb__user--img" />
                        <img 
                            src={IMG_URL_BASE + 'camera-icon.svg'} 
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
                name='file'
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