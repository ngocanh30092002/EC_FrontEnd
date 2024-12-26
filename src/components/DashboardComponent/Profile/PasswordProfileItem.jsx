import React from 'react'
import { InputItem } from './EditProfileItem'
import { appClient } from '~/AppConfigs';
import toast from "@/helper/Toast"

function PasswordProfileItem() {

    const handleSubmitPassword = (e) =>{
        e.preventDefault();
        
        const submitForm = async() =>{
            try{
                const response = await appClient.post("api/users/password", formData);
                const data = response.data;

                if(data.success){
                    toast({
                        type: "success",
                        title: "Success",
                        message: "Updated successfully",
                        duration: 5000
                    })
                }
            }
            catch(error){
                
            }
        }
        const formData = new FormData(e.target);

        const newPassword = formData.get("newPassword");
        const confirmPassword = formData.get("confirmPassword");

        if(newPassword !== confirmPassword){
            toast({
                type: "error",
                title: "Error",
                message: "New password doesn't match confirm password",
                duration: 5000
            });
        }
        else{
            submitForm();
        }
    }

    return (
        <form method='POST' onSubmit={handleSubmitPassword}>
            <span className='profile__title'>Password</span>

            <InputItem field={"Current Password"} name={"currentPassword"} className={''} type='password' />
            <div className='flex'>
                <InputItem field={"New Password"} name={"newPassword"} className={'w-[400px] flex-1'} type='password' />
                <InputItem field={"Confirm Password"} name={"confirmPassword"} className={'w-[400px] flex-1 ml-[30px]'} type='password' />
            </div>

            <div className='flex justify-end'>
                <button className='profile__btn'>Save</button>
            </div>
        </form>
    )
}

export default PasswordProfileItem