import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import toast from '../../../helper/Toast';
import MaskedInput from 'react-text-mask';
import DropDownList from './../../CommonComponent/DropDownList';
import { appClient } from '~/AppConfigs';

function NewMember({ onShowBroad, onTriggerReload }) {
    const [roles, setRoles] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [bgFile, setBgFile] = useState(null);
    const [role, setRole] = useState(null);
    const imageInputRef = useRef(null);
    const bgInputRef = useRef(null);
    const inputNameRef = useRef(null);
    const inputEmailRef = useRef(null);
    const inputPasswordRef = useRef(null);
    const inputConfirmPasswordRef = useRef(null);
    const inputFirstRef = useRef(null);
    const inputLastRef = useRef(null);
    const inputPhoneRef = useRef(null);
    const inputDateRef = useRef(null);

    const [gender, setGender] = useState(0);
    const phoneMask = [/0/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/,];
    const dateMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];

    useEffect(() => {
        const getRoles = async () => {
            try {
                const response = await appClient.get("api/roles")
                const data = response.data;
                if (data.success) {
                    setRoles(data.message);
                }
            }
            catch {

            }
        }

        getRoles();
    }, [])

    const handleChangeUserBgImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBgFile(file);
        }
    }

    const handleChangeUserImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
        }
    }

    const handleChangeGender = (e) => {
        setGender(e.target.value);
    }

    const handleSubmitData = (e) => {
        e.preventDefault();

        if (inputNameRef.current && (inputNameRef.current.value == "" || inputNameRef.current.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "User Name is required",
                duration: 4000
            });

            inputNameRef.current.focus();
            inputNameRef.current.classList.toggle("error");

            setTimeout(() => {
                inputNameRef.current.classList.toggle("error");
            }, 2000);
            return;
        }

        if (inputEmailRef.current && (inputEmailRef.current.value == "" || inputEmailRef.current.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Email is required",
                duration: 4000
            });

            inputEmailRef.current.focus();
            inputEmailRef.current.classList.toggle("error");

            setTimeout(() => {
                inputEmailRef.current.classList.toggle("error");
            }, 2000);
            return;
        }

        if (inputPasswordRef.current && (inputPasswordRef.current.value == "" || inputPasswordRef.current.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Password is required",
                duration: 4000
            });

            inputPasswordRef.current.focus();
            inputPasswordRef.current.classList.toggle("error");

            setTimeout(() => {
                inputPasswordRef.current.classList.toggle("error");
            }, 2000);
            return;
        }

        if (inputConfirmPasswordRef.current && (inputConfirmPasswordRef.current.value == "" || inputConfirmPasswordRef.current.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Confirm password is required",
                duration: 4000
            });

            inputConfirmPasswordRef.current.focus();
            inputConfirmPasswordRef.current.classList.toggle("error");

            setTimeout(() => {
                inputConfirmPasswordRef.current.classList.toggle("error");
            }, 2000);
            return;
        }
        else {
            if (inputConfirmPasswordRef.current.value != inputPasswordRef.current.value) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Confirm password doesn't match password",
                    duration: 4000
                });

                inputConfirmPasswordRef.current.focus();
                inputConfirmPasswordRef.current.classList.toggle("error");

                setTimeout(() => {
                    inputConfirmPasswordRef.current.classList.toggle("error");
                }, 2000);
                return;
            }
        }

        if (inputFirstRef.current && (inputFirstRef.current.value == "" || inputFirstRef.current.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "First Name is required",
                duration: 4000
            });

            inputFirstRef.current.focus();
            inputFirstRef.current.classList.toggle("error");

            setTimeout(() => {
                inputFirstRef.current.classList.toggle("error");
            }, 2000);
            return;
        }

        if (inputLastRef.current && (inputLastRef.current.value == "" || inputLastRef.current.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Last Name is required",
                duration: 4000
            });

            inputLastRef.current.focus();
            inputLastRef.current.classList.toggle("error");

            setTimeout(() => {
                inputLastRef.current.classList.toggle("error");
            }, 2000);
            return;
        }

        let inputDate = inputDateRef.current.inputElement;
        if (inputDateRef && inputDate.value) {

            const [month, day, year] = inputDate.value.split("/");
            const date = new Date(year, month - 1, day);
            const isValid = date.getFullYear() === parseInt(year) && date.getMonth() === month - 1 && date.getDate() === parseInt(day)

            if (!isValid) {
                toast({
                    type: "error",
                    title: "Error",
                    message: "Date of birth is invalid",
                    duration: 4000
                });
                return;
            }
        }

        if (role == "" || role == null) {
            toast({
                type: "error",
                title: "Error",
                message: "Role is required",
                duration: 4000
            });
            return;
        }

        const formData = new FormData(e.target);
        if(imageFile){
            formData.append("Image", imageFile);
        }
        if(bgFile){
            formData.append("BackgroundImage",bgFile);
        }
        
        const registerPromise = (formData) =>{
            appClient.post("api/accounts/admin/register", formData)
            .then(res => res.data)
            .then(data =>{
                if(data.success){
                    toast({
                        type: "success",
                        title: "Successfully",
                        message: "User added successfully",
                        duration: 4000
                    });

                    onShowBroad(false);
                    onTriggerReload();
                }
            })
        }

        registerPromise(formData);
    }

    const handleRoleSelected = (item) => {
        if (item != null) {
            setRole(item.key)
        }
        else {
            setRole(item);
        }
    }


    return (
        <div
            className='fixed top-0 left-0 w-full h-screen z-[1000] nmp__wrapper  flex items-center justify-center'
            onClick={(e) => { onShowBroad(false) }}
        >
            <div className='w-[700px]  h-[600px] nmp__content__wrapper bg-white rounded-[10px] ' onClick={(e) => e.stopPropagation()}>
                <div className='relative overflow-visible'>
                    <img
                        src={bgFile ? URL.createObjectURL(bgFile) : IMG_URL_BASE + "default_bg.jpg"}
                        className='w-full cursor-pointer h-[250px] object-cover object-center  rounded-[10px] rounded-b-none'
                        onClick={(e) => { bgInputRef.current?.click() }} />
                    <img
                        src={imageFile ? URL.createObjectURL(imageFile) : IMG_URL_BASE + "unknown_user.jpg"}
                        className='w-[150px] h-[150px] object-cover object-top  rounded-[50%] 
                            absolute bottom-[-50%] left-[50%] translate-x-[-50%]
                            border-[3px] border-gray
                            cursor-pointer
                            translate-y-[-50%]'
                        onClick={(e) => { imageInputRef.current?.click() }}
                    />

                    <input type='file' ref={imageInputRef} className='hidden' onChange={handleChangeUserImage} accept='image/*' />
                    <input type='file' ref={bgInputRef} className='hidden' onChange={handleChangeUserBgImage} />
                </div>

                <form className='p-[20px] overflow-visible mt-[45px]' onSubmit={handleSubmitData}>
                    <div className='flex overflow-visible'>
                        <div className='flex flex-col flex-1'>
                            <div className='nmp__info--title'>User Name</div>
                            <input name='UserName' className='npm__info--input' minLength={0} maxLength={50} ref={inputNameRef} />
                        </div>

                        <div className='flex flex-col flex-1 ml-[20px]'>
                            <div className='nmp__info--title'>Email</div>
                            <input name='Email' type='email' className='npm__info--input' ref={inputEmailRef} />
                        </div>
                    </div>

                    <div className='flex '>
                        <div className='flex flex-col flex-1'>
                            <div className='nmp__info--title'>Password</div>
                            <input name='Password' type='password' className='npm__info--input' ref={inputPasswordRef} />
                        </div>

                        <div className='flex flex-col flex-1 ml-[20px]'>
                            <div className='nmp__info--title'>Confirm Password</div>
                            <input name='ConfirmPassword' type='password' className='npm__info--input' ref={inputConfirmPasswordRef} />
                        </div>
                    </div>

                    <div className='flex'>
                        <div className='flex flex-col flex-1'>
                            <div className='nmp__info--title'>First Name</div>
                            <input name='FirstName' className='npm__info--input' minLength={0} maxLength={50} ref={inputFirstRef} />
                        </div>

                        <div className='flex flex-col flex-1 ml-[20px]'>
                            <div className='nmp__info--title'>Last Name</div>
                            <input name='LastName' className='npm__info--input' minLength={0} maxLength={50} ref={inputLastRef} />
                        </div>
                    </div>

                    <div className='flex'>
                        <div className='flex flex-col flex-1'>
                            <div className='nmp__info--title'>Phone Number</div>
                            <MaskedInput
                                name='PhoneNumber'
                                mask={phoneMask}
                                placeholder="0123456789"
                                className="npm__info--input"
                                ref={inputPhoneRef}
                            />
                        </div>

                        <div className='flex flex-col flex-1 ml-[20px]'>
                            <div className='nmp__info--title'>Date of birth</div>
                            <MaskedInput
                                name='DateOfBirth'
                                ref={inputDateRef}
                                mask={dateMask}
                                placeholder="MM/dd/yyyy"
                                className="npm__info--input"
                            />
                        </div>
                    </div>

                    <div className='flex justify-between items-center py-[15px]'>
                        <div className='nmp__info--title !my-0'>Gender</div>
                        <div className='flex items-center flex-1 justify-around'>
                            <div className='flex items-center'>
                                <input type="radio" id="gender-male" onChange={handleChangeGender} checked={gender == 0} name="Gender" className='npm__gender--input' value={0} />
                                <label className='npm__gender--label' htmlFor="gender-male">Male</label>
                            </div>
                            <div className='flex items-center'>
                                <input type="radio" id="gender-female" onChange={handleChangeGender} checked={gender == 1} name="Gender" className='npm__gender--input' value={1} />
                                <label className='npm__gender--label' htmlFor="gender-female">Female</label>
                            </div>
                            <div className='flex items-center'>
                                <input type="radio" id="gender-other" onChange={handleChangeGender} checked={gender == 2} name="Gender" className='npm__gender--input' value={2} />
                                <label className='npm__gender--label' htmlFor="gender-other">Other</label>
                            </div>
                        </div>
                    </div>

                    <div className='overflow-visible flex items-center'>
                        <div className='nmp__info--title !my-0 mr-[20px]'>Roles</div>
                        <div className='overflow-visible'>
                            <DropDownList data={roles.map((item) => ({ key: item, value: item }))} defaultIndex={-1} onSelectedItem={handleRoleSelected} placeholder={"Select Roles"} name={"Role"} className={"border"} />
                        </div>
                    </div>
                    <div className='flex justify-end mt-[20px]'>
                        <button className='nmp__btn--func' type='submit'>Register</button>
                        <button className='nmp__btn--func' onClick={(e) => onShowBroad(false)}>Cancel</button>
                    </div>
                </form>
            </div>


        </div >
    )
}


export default NewMember