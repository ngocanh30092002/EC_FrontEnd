import React from 'react'
import './LoginStyle.css'

const LoginPage = () => {
  return (
    <div className='container flex max-w-full'>
        <div className='login-background-light flex-1'></div>
        <div className='login-background-bold flex-1'></div>

        <div className='login-wrapper flex'>
          <div className='login-content flex flex-col items-center flex-1 p-[10px]'>
            <div className='login-containter__icon'>Login Logo</div>
            <div className='login-containter__title'>Welcome Back</div>
            <div className='login-container__provider'>
              <div className='provider-icon'></div>
              <div className='provider-text'>Continue with Google</div>
            </div>

            <div className='login-container__seperate seperate-title'>
              OR LOGIN WITH ACCOUNT
            </div>
            <div className='login-container__info'>
              <input type='text' className='infor-username' placeholder='Your Email'/>
              <input type='password' className='infor-password' placeholder='Your Password'/>

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

export default LoginPage