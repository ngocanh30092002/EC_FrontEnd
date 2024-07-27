import React, { useState } from 'react'
import './LoginStyle.css'

const LoginPage = () => {
  const imgUrlBase = 'src/assets/imgs/';

  return (
    <div className='container flex max-w-full'>
      <div className='login-background-light flex-1'></div>
      <div className='login-background-bold flex-1'></div>

      <div className='login-wrapper flex'>
        <div className='flex-1 p-3'>
          <div className='w-4/5 lg:w-2/3 2xl:w-3/5 mx-auto h-full flex flex-col justify-between'>
            <div className='login-containter__icon'>
              <img src={imgUrlBase + "logo.svg"} className='container__icon h-[50px] w-[200px] lg:w-[300px] lg:h-[80px]' />
            </div>
            <div className='login-containter__title text-center text-5xl lg:text-4xl my-[15px] lg:my-1'>Welcome Back</div>
            <div className='flex-1'>
              <ProviderInfor imgUrlBase={imgUrlBase} />

              <div className='login-container__seperate seperate-title mt-[20px]'>
                OR LOGIN WITH ACCOUNT
              </div>

              <LoginInfor imgUrlBase={imgUrlBase} />

              <hr className='mt-5 hidden lg:block' />

              <LoginExtention />
            </div>
          </div>
        </div>

        <div className='flex-1 login-image--wrapper hidden sm:hidden lg:block'>
          <div className='w-[450px] login-img-beside'>
            <img src={imgUrlBase + "loginImage6.png"} alt="login-beside" className="img-beside" />
          </div>
          <div className='img-beside__background'/>
        </div>
      </div>
    </div>
  )
}

function LoginExtention() {
  return <>
    <div className='login-question flex justify-center mt-[20px] lg:mt-[10px]'>
      Don't have an account yet? &nbsp;
      <a className='login-signup__link' href="#">Sign up</a>
    </div>
  </>
}

function LoginInfor({ imgUrlBase }) {
  return <>
    <LoginButton type="text" placeholder="User Name" required={true} />
    <LoginButton type="passsword" placeholder="Password" required={true} />

    <div className="infor-extension flex items-center justify-between mt-1">
      <div className='flex justify-center'>
        <input type="checkbox" className='infor-checkbox mr-2' id='cb-keep-login'></input>
        <label htmlFor="cb-keep-login" className='mt-1'>Keep me logged in</label>
      </div>
      <a className='underline' href='#'>Forgot password</a>
    </div>

    <button className='w-full login-submit-button mt-[20px]'>
      <div className='flex items-center px-4'>
        <span className='flex-1'>Log in</span>
        <img src={imgUrlBase + "rightArrow.svg"} className='w-[20px] login-submit__icon' alt='arrow' />
      </div>
    </button>
  </>
}

function ProviderInfor({ imgUrlBase }) {
  const providerInfos = [
    {
      img: "googleLogo.svg",
      des: "Log in with Google"
    },
    {
      img: "facebookLogo.svg",
      des: "Log in with Facebook"
    }
  ]

  return providerInfos.map((info, index) => {
    return <ProviderButton key={index} imageUrl={imgUrlBase + info.img} providerName={info.des} />
  })
}

function ProviderButton({ imageUrl, providerName, ...props }) {
  return (
    <a className='login-provider' href={props.link || "#"}>
      <img src={imageUrl} className='login-provider__image' />
      <span className='login-provider__title flex-1'>{providerName}</span>
    </a>
  )
}

function LoginButton({ placeholder, ...props }) {
  const [isFocus, setFocus] = useState(false);
  const handleBlurEvent = (e) => {
    if (e.target.value) {
      setFocus(true)
    }
    else {
      setFocus(false);
    }
  }

  const handleFocusEvent = () => {
    setFocus(true);
  }

  return (
    <div className='pt-[20px]'>
      <div className='login-button__wrapper'>
        <input
          {...props}
          className='login-button__text'
          onBlur={handleBlurEvent}
          onFocus={handleFocusEvent} />
        <div className={`login-button__label ${isFocus && 'lable-transform'}`}>{placeholder}</div>
      </div>
    </div>
  )
}

export default LoginPage