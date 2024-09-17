import {useState, useRef, useEffect, useContext} from 'react'
import "./CustomeStyle.css";

function CustomButton({errors, ...props}) {
    const [value , setValue] = useState('');
    const [isFocus, setFocus] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const inputRef = useRef();

    const handleBlurEvent = (e) => {
        if (e.target.value) {
            setFocus(true);
        }
        else {
            setFocus(false);
        }
        setValue(e.target.value);
    }

    const handleFocusEvent = (e) => {
        if(props?.onClearError){
            props.onClearError(props.name);
        }
        setFocus(true);
        setValue(e.target.value);
    }

    const handleChangeEvent = (e)=>{
        setValue(e.target.value);
    }

    useEffect(() =>{
        inputRef.current.focus();
        if(!value || !value.trim()){
            setIsValid(false);
            return;
        }

        if(props?.minLength){
            setIsValid(value.trim().length >= props?.minLength);
            return;
        }

        if(props?.maxLengh){
            setIsValid(value.trim().length <= props?.minLength);
            return;
        }

        if(props?.isEmail){
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setIsValid(emailPattern.test(value));
            return;
        }

        if(props?.isPhone){
            const phonePattern = /^(0|84)(2(0[3-9]|1[0-6|8|9]|2[0-2|5-9]|3[2-9]|4[0-9]|5[1|2|4-9]|6[0-3|9]|7[0-7]|8[0-9]|9[0-4|6|7|9])|3[2-9]|5[5|6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])([0-9]{7})$/mg
            setIsValid(phonePattern.test(value));
            return;
        }

        setIsValid(true);
    }, [value])

    useEffect(() =>{
        setIsValid(true);

        if(props?.isDate){
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0]; 
            setValue(formattedDate);
        }

        if(props?.isFocus){
            setFocus(true);
            setTimeout(() => {
                inputRef.current.focus();
            }, 10);
        }
    },[])

    return (
        <div className={`pt-[5px] ${props?.className ?? ''}`}>
            <div className='custom-button__wrapper'>
                <input
                    type= {props.type}
                    name= {props.name}
                    required = {props.required}
                    ref = {inputRef}
                    value={value}
                    className={`custom-button__text${isValid ? " " : " error"}`}
                    onBlur={handleBlurEvent}
                    onFocus={(e) => handleFocusEvent(e)}
                    onChange={(e) => handleChangeEvent(e)}
                    autoComplete = "off"
                    />
                <div className={`custom-button__label ${isFocus ? 'lable-transform' : ""}`}>{props?.placeholder ?? ""}</div>
            </div>

            {errors?.[props.name] &&  <span className='custom-button-error line-clamp-1'>{errors[props.name]}</span>}
        </div>
    )
}

export default CustomButton