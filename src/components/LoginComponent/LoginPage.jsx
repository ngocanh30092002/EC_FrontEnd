import React, { useState } from 'react'
import './LoginStyle.css'

const LoginPage = () => {
  return (
    <div className='container flex max-w-full'>
      <div className='login-background-light flex-1'></div>
      <div className='login-background-bold flex-1'></div>

      <div className='login-wrapper flex'>
        <div className='login-content flex-1 p-[10px]'>
          <div className='login-containter__icon'>
            <img src='src/assets/imgs/logo.svg' className='container__icon' />
          </div>
          <div className='login-containter__title text-center'>Welcome Back</div>
          <ProviderButton
            imageUrl='src/assets/imgs/googleLogo.svg'
            providerName='Log in with Google' />
          <div className='login-container__seperate seperate-title mt-[20px]'>
            OR LOGIN WITH ACCOUNT
          </div>
          <div className='login-container__info'>
            <LoginButton />
            <input type='text' className='infor-username' placeholder='Your Email' />
            <input type='password' className='infor-password' placeholder='Your Password' />

            <div className="infor-extension">
              <input type="checkbox" className='infor-checkbox' id='cb-keep-login'></input>
              <label htmlFor="cb-keep-login">Keep me logged in</label>
              <span className='infor-forgot-password underline'>Forgot password</span>
            </div>
          </div>
        </div>


        <div className="login-img flex-1" >
          <div className='test'>
            <h1>hello</h1>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProviderButton({ imageUrl, providerName, ...props }) {
  return (
    <a className='login-provider' href={props.link || "#"}>
      <img src={imageUrl} className='login-provider__image' />
      <span className='login-provider__title flex-1'>{providerName}</span>
    </a>
  )
}

function LoginButton() {
  const [isBlurred , setIsBlurred] = useState(true);


  const handleFocusInput = (e) =>{
    if(!e.target.value){
      setIsBlurred(false);
    }
    else{
      setIsBlurred(true);
    }
  }

  const handleBlurInput = (e) =>{
    if(!e.target.value){
      setIsBlurred(false);
    }
    else{
      setIsBlurred(false);
    }
  }

  return (
    <div className='login-button'>
      <div className='login-button__wrapper'>
        <input type='text' className='login-button__text' onBlur={handleBlurInput} onFocus={handleFocusInput} />
        <div className={`login-button__label ${isBlurred ? '' : 'hidden'}`} >Your Email</div>
      </div>
    </div>
  )
}

export default LoginPage