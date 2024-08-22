import "./SignUpStyle.css"
import CustomButton from "../ButtonComponent/CustomButton"
import { APP_API } from "../../../GlobalConstant"

function SignUpPage() {
    return (
        <div className='sign-up-wrapper flex'>
            <div className="w-1/2 bg-slate-500">

            </div>
            <div className="w-1/2">
                <SignUpForm />      
            </div>
        </div>
    )
}


function SignUpForm() {

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

            <CustomButton
                type="text"
                name="FirstName"
                require={true}
                placeholder="First Name"
                minLength={0}
                maxLength={50}/>
            
            <CustomButton
                type="text"
                name="LastName"
                require={true}
                placeholder="Last Name"
                minLength={0}
                maxLength={50} />

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

            <CustomButton
                type="tel"
                name="PhoneNumber"
                require={true}
                placeholder="Phone Number"
                isPhone={true} />

            <CustomButton
                type="text"
                name="Address"
                require={true}
                placeholder="Address" />

            <CustomButton
                type="date"
                name="DateOfBirth"
                require={true}
                placeholder="Birthday"
                isDate={true}  />

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

            <button type="submit" > Sign up </button>
        </form>
    )

}

export default SignUpPage