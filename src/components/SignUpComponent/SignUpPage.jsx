import "./SignUpStyle.css"
import CustomButton from "../ButtonComponent/CustomButton"
import { APP_API, CLIENT_URL } from "../../../GlobalConstant"

function SignUpPage() {
    const imgUrlBase = "../src/assets/imgs/";

    const handleBackToLogin = () => {
       window.location.href = CLIENT_URL + "account/login";
    }

    return (
        <div className='sign-up-wrapper flex'>
            <div className="hidden lg:block lg:w-1/2 m-[15px]  ">
                <div className="sign-up-background relative">
                    <span className="sign-up-slogan-img xl:text-3xl 2xl:text-5xl">The simplest way to improve yourself
                        <span className="sign-up-sub-slogan lg:translate-x-[-70%] xl:translate-x-[-90%] 2xl:translate-x-[-100%] 2xl:top-[60px] 2xl:text-3xl">Sign up to begin</span>
                    </span>
                </div>
                <img src={imgUrlBase + "signupImage.svg"} alt="login-beside" className="hidden absolute lg:block  lg:w-[600px] lg:bottom-[10%] lg:left-[-7%] xl:w-[700px] xl:top-[15%] xl:left-[-6%] 2xl:w-[950px] 2xl:left-[-6%]" />
            </div>
            <div className="w-full lg:w-1/2 px-7 py-4 relative z-10">
                <span className="sign-up-slogan text-5xl h-[65px]">Join us now</span>
                <SignUpForm imgBase = {imgUrlBase}/>  

                <button className="sign-up-back" onClick={handleBackToLogin} >
                    <div className='flex items-center px-4 relative'>
                        <img src={imgUrlBase + "left-Arrow.svg"} className='w-[20px] absolute top-0 left-[10px]' alt='arrow' />
                        <span className='flex-1'>Log in</span>
                    </div>
                </button>    
            </div>
        </div>
    )
}


function SignUpForm({imgBase}) {
    const handleSignUpSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        fetch(APP_API + "Account/Register", {
            method: "POST",
            headers:{
            },
            body: formData
        })
        .then(res => res.json())
        .then(data => console.log(data));
    }

    return (
        <form method="POST" onSubmit={(e) =>{handleSignUpSubmit(e)}}>
            <CustomButton
                type="text"
                name="UserName"
                require={true}
                placeholder="User Name"
                minLength={5}
                maxLength={50}/>

            <div className="flex">
                <CustomButton
                    type="text"
                    name="FirstName"
                    require={true}
                    placeholder="First Name"
                    minLength={0}
                    maxLength={50}
                    className ="flex-1"/>
                <div className="w-[20px]"/>
                <CustomButton
                    type="text"
                    name="LastName"
                    require={true}
                    placeholder="Last Name"
                    minLength={0}
                    maxLength={50} 
                    className ="flex-1"/>
            </div>

            <CustomButton
                type="password"
                name="Password"
                require={true}
                placeholder="Password"/>

            <CustomButton
                type="password"
                name="ConfirmPassword"
                require={true}
                placeholder="Confirm Password"/>

            <CustomButton
                type="phone"
                name="Email"
                require={true}
                placeholder="Email"
                isEmail={true} />

            <div className="flex my-4 gender-wrapper">
                <span className="text-md gender-title">Gender </span>
                <div className="flex flex-1 justify-around items-center">
                    <div className="flex items-center">
                        <input type="radio" id="male" name="Gender" value="0" />
                        <label className="ml-2" htmlFor="male">Male</label>
                    </div>
                    <div className="flex items-center">
                        <input type="radio" id="female" name="Gender" value="1" />
                        <label className="ml-2" htmlFor="female">Female</label>
                    </div>
                    <div className="flex items-center">
                        <input type="radio" id="other" name="Gender" value="2" />
                        <label className="ml-2" htmlFor="other">Other</label>
                    </div>
                </div>
            </div>

            <button type="submit" className="sign-up-btn">
                <div className='flex items-center px-4 relative'>
                    <span className='flex-1'>Sign up</span>
                    <img src={ imgBase + "rightArrow.svg"} className='w-[20px] absolute top-0 right-[10px]' alt='arrow' />
                </div>
            </button>
        </form>


    )

}

export default SignUpPage