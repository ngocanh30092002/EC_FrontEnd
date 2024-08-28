import React, { useState , useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import { CLIENT_URL , APP_API} from '~/GlobalConstant'
import LoginGoogleButton from './LoginGoogle'
import toast from '@/helper/Toast'
import './LoginStyle.css'

const LoginPage = () => {
    const imgUrlBase = '../src/assets/imgs/';

    return (
        <div className='login-wrapper flex'>
            <div className='flex-1 p-3'>
                <div className='w-4/5 lg:w-2/3 2xl:w-3/5 mx-auto h-full flex flex-col justify-between'>
                    <div className='login-containter__title text-center text-5xl lg:text-5xl my-[15px] lg:my-1 2xl:text-6xl 2xl:my-[40px] py-[20px]'>Welcome Back</div>
                    <div className='flex-1'>
                        <LoginGoogleButton imageUrl={imgUrlBase + "googleLogo.svg"} description={"Log in with Google"} redirectUri={"https://localhost:5173/manage"} />

                        <div className='login-container__seperate seperate-title mt-[20px] 2xl:mt-[40px] 2xl:mb-[20px]'>
                            OR LOGIN WITH ACCOUNT
                        </div>

                        <LoginInfor imgUrlBase={imgUrlBase} />

                        <hr className='mt-5 hidden lg:block' />

                        <LoginExtention />
                    </div>
                </div>
            </div>

            <div className='flex-1 login-image--wrapper hidden sm:hidden lg:block'>
                <div className='lg:w-[550px] lg:-right-4 xl:w-[700px] xl:-right-6 xl:-top-10 2xl:w-[900px] 2xl:-right-10 login-img-beside'>
                    <img src={imgUrlBase + "loginImage7.png"} alt="login-beside" className="img-beside" />
                </div>
                <div className='img-beside__background' />
            </div>
        </div>
    )
}

function LoginExtention() {
    return <>
        <div className='login-question flex justify-center mt-[10px] lg:mt-[10px]'>
            Don't have an account yet? &nbsp;
            <a className='login-signup__link' href={CLIENT_URL + "account/sign-up"}>Sign up</a>
        </div>
    </>
}

function LoginInfor({ imgUrlBase }) {
    const [userName, setUserName] = useState();
    const [password, setPassword] = useState();
    const [checked, setChecked] = useState(false);
    const [errorMessage, setErrorMessage] = useState();
    const navigate = useNavigate();


    const submitData = () => {
        if (!userName || !password) {
            return;
        }

        const data = {
            username: userName,
            password: password
        }

        const handleLoginSuccess = (response) => {
            navigate("/")
        }

        const handleLoginError = (error) =>{
            if(error){
                setErrorMessage(error.message);
            }
            else{
                toast({
                    type: "error",
                    duration: 5000,
                    title: "Error",
                    message: "Something is wrong"
                })
            }
        }
        $.ajax({
            method: 'POST',
            url: APP_API + "account/login",
            contentType: "application/json",
            data: JSON.stringify(data),
            dataType: "json",
            xhrFields: {
                withCredentials: true
            },
            success: function (response) {
                handleLoginSuccess(response);
            },
            error: function (xhr, status, error) {
                handleLoginError(xhr.responseJSON);
            }
        });
    }

    return <>
        <form>
            <LoginButton type="text" name="username" placeholder="User Name" required={true} handleSetData={setUserName} />
            <LoginButton type="password" name="password" placeholder="Password" required={true} handleSetData={setPassword} isShowEye={true} />
        </form>

        <div className="infor-extension flex items-center justify-between mt-1">
            <div className='flex justify-center'>
                <input
                    type="checkbox"
                    className='infor-checkbox mr-2'
                    id='cb-keep-login'
                    checked={checked}
                    onChange={() => setChecked(!checked)}></input>
                <label htmlFor="cb-keep-login" className='mt-1'>Keep me logged in</label>
            </div>
            <a className='underline' href='#'>Forgot password</a>
        </div>

        {errorMessage && <div className='error-message'>{errorMessage}</div>}

        <button className='w-full login-submit-button mt-[20px]' onClick={submitData}>
            <div className='flex items-center px-4'>
                <span className='flex-1'>Log in</span>
                <img src={imgUrlBase + "rightArrow.svg"} className='w-[20px] login-submit__icon' alt='arrow' />
            </div>
        </button>
    </>
}

function LoginButton(props) {
    const [isFocus, setFocus] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [isShow , setShow] = useState(false);
    const inputRef = useRef();
    
    const handleBlurEvent = (e) => {
        if (e.target.value) {
            setFocus(true);
            setIsValid(true);
        }
        else {
            setFocus(false);
            setIsValid(false);
        }

        props?.handleSetData?.(e.target.value);
    }

    const handleFocusEvent = () => {
        setFocus(true);
        setIsValid(true);
    }

    const ShowPassword = () =>{
        const className = 'absolute w-12 top-0 right-0 p-2 mt-0.5 z-10 cursor-pointer';
        const handleShowPassword = () =>{
            setShow(!isShow);
            inputRef.current.type = !isShow ? "text" : "password";
        }

        return <>
            {isShow ? 
                <img src='/src/assets/imgs/open_eye.svg' className={className} onClick={handleShowPassword}/> : 
                <img src='/src/assets/imgs/close_eye.svg' className={className} onClick={handleShowPassword}/>
            }
        </> 
    }
    return (
        <div className='pt-[20px]'>
            <div className='login-button__wrapper'>
                <input
                    type= {props.type}
                    name= {props.name}
                    required = {props.required}
                    ref = {inputRef}
                    className={`login-button__text ${isValid ? "" : "error"}`}
                    onBlur={handleBlurEvent}
                    onFocus={handleFocusEvent}
                    autoComplete = "off"
                    />
                <div className={`login-button__label ${isFocus ? 'lable-transform' : ""}`}>{props.placeholder}</div>

                {props.isShowEye && ShowPassword()}
            </div>
        </div>
    )
}

export default LoginPage