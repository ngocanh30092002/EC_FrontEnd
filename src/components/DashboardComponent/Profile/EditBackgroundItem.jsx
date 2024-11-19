import React, { useEffect, useState } from 'react'
import { InputItem } from './EditProfileItem'
import { appClient } from '~/AppConfigs';
import toast from '@/helper/Toast';
import { actions, useStore } from '../../../store';

function EditBackgroundItem() {
    const [userInfo, setUserInfo] = useState(null);
    const [roles, setRoles] = useState([]);
    const [description, setDescription] = useState(null);
    const [state, dispatch] = useStore();

    useEffect(() => {
        const getUserInfo = async () =>{
            try{
                var response = await appClient.get("api/students/user-background-info");
                var data = response.data;
                if(!data.success){
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: error.message,
                        duration: 5000
                    })
                }

                setUserInfo(data.message);
                setDescription(data.message?.description)
            }
            catch(error){
                
            }
        }

        const getCurrentRoles = async() =>{
            try{
                var response = await appClient.get("api/students/roles");
                var data = response.data;
                if(!data.success){
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: error.message,
                        duration: 5000
                    })
                }

                setRoles(data.message);
            }
            catch(erorr){

            }
        }

        getUserInfo();
        getCurrentRoles();
    }, [])


    const handleChangeDes = (e) =>{
        setDescription(e.target.value);
    }

    const handleSubmitForm = (e) =>{
        e.preventDefault();
        const formData = new FormData(e.target);

        const submitForm = async () =>{
            try{
                const response = await appClient.post("api/students/user-background", formData)

                var data = response.data;

                if(data.success){
                    toast({
                        type: "success",
                        title: "Success",
                        duration: 5000,
                        message: "Updated information successfully"
                    })

                    dispatch(actions.changeUserBackground(true));

                    setTimeout(() => {
                        dispatch(actions.changeUserBackground(false));
                    }, 1000);
                }
            }
            catch(error){
               
            }
        }

        submitForm();
    }

    return (
        <form method='POST' onSubmit={handleSubmitForm}>
            <span className='profile__title'>Background</span>

            <div>
                <InputItem field={"User Name"} name={"userName"} itemInfo ={userInfo} className={''} type='text' />

                <label htmlFor='Description' className='input__item--title mt-[10px]'>Description</label>
                <textarea 
                    rows={5} 
                    id='Description' 
                    name={"Description"} 
                    className='input__item--input w-full h-auto resize-none pt-[10px]'
                    value={description == null ? "": description}
                    onChange={handleChangeDes} />
                

                <div className='flex items-center mt-[10px]'>
                    <span className='input__item--title'>Current Role:</span>
                    {roles.map((item,index) => <span key={index} className='input__item--hashtag'>{item}</span>)}
                </div>

                <div className='flex justify-end'>
                    <button type='submit' className='profile__btn'>Save</button>
                </div>
            </div>
        </form>
    )
}

export default EditBackgroundItem