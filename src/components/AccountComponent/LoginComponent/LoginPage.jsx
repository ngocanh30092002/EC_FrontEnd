import toast from '@/helper/Toast'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { appClient } from '~/AppConfigs'
import { APP_API, CLIENT_URL, IMG_URL_BASE, ROLES } from '~/GlobalConstant'
import LoaderPage from '../../LoaderComponent/LoaderPage'
import LoginFacebook from './LoginFacebook'
import LoginGoogleButton from './LoginGoogle'
import './LoginStyle.css'

const LoginPage = () => {
    const [isShow, setShow] = useState(false);

    return (
        <>
            <div className='login-wrapper flex'>
                <div className='flex-1 p-3'>
                    <div className='w-4/5 lg:w-2/3 2xl:w-3/5 mx-auto h-full flex flex-col justify-between'>
                        <div className='login-containter__title text-center text-5xl lg:text-5xl my-[15px] lg:my-1 2xl:text-6xl 2xl:my-[40px] py-[20px]'>Welcome Back</div>
                        <div className='flex-1'>
                            <LoginGoogleButton imageUrl={IMG_URL_BASE + "googleLogo.svg"} description={"Log in with Google"} />
                            <LoginFacebook imageUrl={IMG_URL_BASE + "facebookLogo.svg"} description={"Log in with Facebook"} />
                            <div className='login-container__seperate seperate-title mt-[20px] 2xl:mt-[40px] 2xl:mb-[20px]'>
                                OR LOGIN WITH ACCOUNT
                            </div>

                            <LoginInfor onShowForgot={setShow} />

                            <hr className='mt-5 hidden lg:block' />

                            <LoginExtention />
                        </div>
                    </div>
                </div>

                <div className='flex-1 login-image--wrapper hidden sm:hidden lg:block'>
                    <div className='lg:w-[550px] lg:-right-4 xl:w-[700px] xl:-right-6 xl:-top-10 2xl:w-[900px] 2xl:-right-10 login-img-beside'>
                        <img src={IMG_URL_BASE + "loginImage7.png"} alt="login-beside" className="img-beside" />
                    </div>
                    <div className='img-beside__background' />
                </div>
            </div>

            {isShow && <ForgotPasswordPage onBackToLogin={setShow} />}
        </>
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

function LoginInfor({ onShowForgot }) {
    const [userName, setUserName] = useState();
    const [password, setPassword] = useState();
    const [checked, setChecked] = useState(false);
    const [errorMessage, setErrorMessage] = useState();
    const [isLoading, setIsLoading] = useState(false);

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
            const handleRedirectWithRole = async () => {
                try {
                    var response = await appClient.get("api/students/roles")
                    var data = response.data;

                    if (data.success) {
                        const roles = data.message;

                        if (roles.includes(ROLES.ADMIN)) {
                            navigate("/admin")
                            toast({
                                type: "success",
                                title: "SUCCESS",
                                message: "Login Successfully",
                                duration: 4000
                            })

                            return;
                        }
                        else if (roles.includes(ROLES.TEACHER)) {
                            navigate("/teacher");
                            toast({
                                type: "success",
                                title: "SUCCESS",
                                message: "Login Successfully",
                                duration: 4000
                            })

                            return;
                        }
                        else {
                            navigate("/")
                            toast({
                                type: "success",
                                title: "SUCCESS",
                                message: "Login Successfully",
                                duration: 4000
                            })
                            return;
                        }
                    }
                }
                catch (error) {

                }
            }

            handleRedirectWithRole();
        }

        const handleLoginError = (error) => {
            if (error) {
                toast({
                    type: "error",
                    duration: 5000,
                    title: "Error",
                    message: error.message
                })
            }
            else {
                toast({
                    type: "error",
                    duration: 5000,
                    title: "Error",
                    message: "Something is wrong"
                })
            }
        }

        setIsLoading(true);

        $.ajax({
            method: 'POST',
            url: APP_API + "accounts/login",
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

        setIsLoading(false);
    }

    return <>
        {isLoading && <LoaderPage />}
        <form>
            <LoginButton type="text" name="username" placeholder="User Name" required={true} handleSetData={setUserName} onEnterKeyDown={submitData} />
            <LoginButton type="password" name="password" placeholder="Password" required={true} handleSetData={setPassword} isShowEye={true} onEnterKeyDown={submitData} />
        </form>

        <div className="infor-extension flex items-center justify-between mt-1">
            <div className='flex justify-center'>
                {errorMessage && <div className='error-message'>{errorMessage}</div>}
            </div>
            <a className='underline cursor-pointer py-[10px]' onClick={(e) => onShowForgot(true)}>Forgot password</a>


        </div>



        <button className='w-full login-submit-button' onClick={submitData}>
            <div className='flex items-center px-4'>
                <span className='flex-1'>Log in</span>
                <img src={IMG_URL_BASE + "rightArrow.svg"} className='w-[20px] login-submit__icon' alt='arrow' />
            </div>
        </button>
    </>
}

function LoginButton(props) {
    const [isFocus, setFocus] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [isShow, setShow] = useState(false);
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

    const ShowPassword = () => {
        const className = 'absolute w-12 top-0 right-0 p-2 mt-0.5 z-10 cursor-pointer';
        const handleShowPassword = () => {
            setShow(!isShow);
            inputRef.current.type = !isShow ? "text" : "password";
        }

        return <>
            {isShow ?
                <img src='/src/assets/imgs/open_eye.svg' className={className} onClick={handleShowPassword} /> :
                <img src='/src/assets/imgs/close_eye.svg' className={className} onClick={handleShowPassword} />
            }
        </>
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            props?.onEnterKeyDown();
        }
    }
    return (
        <div className='pt-[20px]'>
            <div className='login-button__wrapper'>
                <input
                    type={props.type}
                    name={props.name}
                    required={props.required}
                    ref={inputRef}
                    className={`login-button__text ${isValid ? "" : "error"}`}
                    onBlur={handleBlurEvent}
                    onFocus={handleFocusEvent}
                    autoComplete="off"
                    onKeyDown={(e) => handleKeyDown(e)}
                    onChange={(e) => props?.handleSetData?.(e.target.value)}
                />
                <div className={`login-button__label ${isFocus ? 'lable-transform' : ""}`}>{props.placeholder}</div>

                {props.isShowEye && ShowPassword()}
            </div>
        </div>
    )
}

function ForgotPasswordPage({ onBackToLogin }) {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);

    const handleSubmit = () => {
        if (inputRef.current.value === '') {
            setError("Email is required")
        }
        setError(null);

        setIsLoading(true);

        fetch(APP_API + "accounts/renew-password", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inputRef.current.value)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast({
                        type: "success",
                        duration: 5000,
                        title: "Success",
                        message: "Password change successful"
                    })

                    setError(null);

                    setTimeout(() => {
                        onBackToLogin(false);
                    }, 1000);
                }
                else {
                    setError(data.message)
                }
            })
            .catch(error => {
                toast({
                    type: "error",
                    duration: 5000,
                    title: "Error",
                    message: error.message
                })
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    return <>
        {isLoading && <LoaderPage />}
        <div className='forgot-password-wrapper'>
            <div className='fp__wrapper flex flex-col items-center'>
                <img src={IMG_URL_BASE + "unlock.svg"} alt="" className="w-[100px] mt-[40px]" />
                <span className='fp__title'>Forgot Password</span>
                <span className='fp__message'>Enter your email and we'll send you a secret password to login.</span>

                <div className='fp__input--wrapper'>
                    <input type='text' className='fp__input' placeholder="Enter your email" ref={inputRef} />
                    <img src={IMG_URL_BASE + "letter-icon.svg"} alt="" className='w-[30px] fp__image' />
                </div>

                <span className='fp__error h-[18px]'>{error}</span>

                <button type='submit' className='fp__btn mt-[10px]' onClick={handleSubmit}>Submit</button>
                <button type='button' className='fp__btn back-to-login mt-[10px]' onClick={(e) => onBackToLogin(false)}>Back to login</button>
            </div>
        </div>
    </>
}
export default LoginPage