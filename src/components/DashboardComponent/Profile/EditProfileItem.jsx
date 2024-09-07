import React, { useCallback, useEffect, useState } from 'react'
import { appClient } from '~/AppConfigs';
import  toast from '@/helper/Toast';

function EditProfileItem() {
    const [userInfo , setUserInfo] = useState(null);
    const [gender, setGender] = useState(0);

    const getUserInfo = useCallback(async () =>{
        try{
            var response = await appClient.get("api/user/get-user-infor");
            
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
        }
        catch(error){
        }
    }, []);

    useEffect(() =>{
        getUserInfo();
    }, [])

    useEffect(() =>{
        if(userInfo?.gender){
            setGender(userInfo.gender);
        }

    }, [userInfo])


    const handleGenderChange = (e) =>{
        setGender(e.target.value);
    }

    const handleSubmitUserInfo = (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);

        const submitFormData = async() =>{
            try{
                const resposne = await appClient.post("api/user/change-user-info", formData);
                const data = resposne.data;

                if(data.success){
                    toast({
                        type: "success",
                        title: "Success",
                        message: "Updated successfully",
                        duration: 5000
                    })

                    getUserInfo();
                }
                
            }
            catch(error){
                
            }
        }

        submitFormData();
    }


    return (
        <form method="POST" onSubmit={(e) => handleSubmitUserInfo(e)}>
            <div className='flex'>
                <div className='flex-1'>
                    <div className='profile__title'>Personal</div>
                    <div>
                        <InputItem field="First Name" name={"firstName"} itemInfo= {userInfo}/>
                        <InputItem field="Last Name" name={"lastName"} itemInfo= {userInfo}/>
                        <InputItem field="Date of birth" name={"dateOfBirth"} itemInfo= {userInfo} type="date"/>

                        <div className="flex flex-col my-3 ">
                            <span className='input__item-gender--title'>Gender </span>
                            <div className="flex flex-1 justify-around items-center input__item-gender--wrapper">
                                <div className="flex items-center">
                                    <input type="radio" id="male" name="Gender" value="0" checked={gender == 0} onChange={(e) => handleGenderChange(e)} />
                                    <label className="ml-2" htmlFor="male">Male</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="radio" id="female" name="Gender" value="1"  checked={gender == 1} onChange={(e) => handleGenderChange(e)} />
                                    <label className="ml-2" htmlFor="female">Female</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="radio" id="other" name="Gender" value="2"  checked={gender == 2} onChange={(e) => handleGenderChange(e)} />
                                    <label className="ml-2" htmlFor="other">Other</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex-1 ml-[20px]'>
                    <div className='profile__title'>Contact</div>
                    <div>
                        <InputItem field="Email" name={"email"} type='email'  itemInfo= {userInfo}/>
                        <InputItem field="PhoneNumber" name={"phoneNumber"} itemInfo={userInfo} />
                        <InputItem field="Address" name={"address"} itemInfo={userInfo}/>
                    </div>
                </div>
            </div>

            <div className='flex justify-end'>
                <button type='submit' className='profile__btn'>Save</button>
            </div>
        </form>
    )
}

export function InputItem({ name, className, itemInfo , field, type = 'text' }) {

    const [inputValue, setInputValue] = useState("");

    useEffect(() =>{
        if(itemInfo?.[name]){
            setInputValue(itemInfo[name]);
        }
    }, [itemInfo])

    const handleChangeInput = (e) =>{
        setInputValue(e.target.value);
    }
    return (
        <div className={`input__item ${className}`}>
            <label htmlFor={name} className='input__item--title'>{field}</label>
            <input 
                type={type} 
                id={name}
                name={name} 
                className='input__item--input w-full' 
                value ={inputValue} onChange={(e) => handleChangeInput(e)}
                autoComplete='on' />
        </div>
    )
}

export default EditProfileItem