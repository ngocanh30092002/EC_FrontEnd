import React, { useEffect, useRef, useState } from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import MaskedInput from 'react-text-mask';
import toast from '@/helper/Toast';
import { appClient } from '~/AppConfigs';

function AddEvent({ onAddEvent, currentDate }) {
    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState();
    const [endTime, setEndTime] = useState();

    const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(" ");
        const [hoursStr, minutesStr] = time.split(':');
    
        const hours = parseInt(hoursStr, 10); // Chuyển hours sang số
        const minutes = parseInt(minutesStr, 10); // Chuyển minutes sang số
    
        let formatHours;
        if (period === 'AM') {
            formatHours = (hours === 12) ? 0 : hours; // 12 AM -> 0 giờ
        } else { // PM
            formatHours = (hours === 12) ? 12 : hours + 12; // 12 PM giữ nguyên, các giờ khác +12
        }
    
        return new Date(1970, 0, 1, formatHours, minutes);
    };

    const validateTime = timeStr => {
        const [time, period] = timeStr.split(" ");
        const [hours, minutes] = time.split(':');

        return parseInt(hours) <= 12;
    }

    const validateEvent = () =>{
        const timePattern = /^(\d{2}):(\d{2}) (AM|PM)$/;

        if (!timePattern.test(startTime)) {
            toast({
                type: "warning",
                title: "Start Time",
                message: "Time must be entered in correct format",
                duration: 5000
            });
            return false;
        }
        else {
            if (!validateTime(startTime)) {
                toast({
                    type: "warning",
                    title: "Start Time",
                    message: "Hour must be between 0-12",
                    duration: 5000
                });
                setStartTime("");
                return false;
            }
        }

        if (!timePattern.test(endTime)) {
            toast({
                type: "warning",
                title: "End Time",
                message: "Time must be entered in correct format",
                duration: 5000
            });
            return false;
        }
        else {
            if (!validateTime(endTime)) {
                toast({
                    type: "warning",
                    title: "End Time",
                    message: "Hour must be between 0-12",
                    duration: 5000
                });
                setEndTime("");
                return false;
            }
        }

        if (title === "") {
            toast({
                type: "warning",
                title: "Title",
                message: "Title is required",
                duration: 5000
            });

            return false;
        }

        const startDate = parseTime(startTime);
        const endDate = parseTime(endTime);

        console.log(startDate);
        console.log(endDate);

        if (startDate > endDate) {
            toast({
                type: "error",
                title: "Error Time",
                message: "Start time is greater than end time",
                duration: 5000
            });
            return false;
        }

        return true;
    }
   
    const handleSubmitScheduleEvent = (e) =>{
        e.preventDefault();
        if(!validateEvent()) return;

        const formData = new FormData(e.target);
        const submitForm = async () =>{
            try{
                const response = await appClient.post("api/events", formData)
                var data = response.data;

                if(data.success){
                    onAddEvent();
            
                    setTitle('');
                    setStartTime('');
                    setEndTime('');
                }
            }
            catch(error){
               
            }
        }

        submitForm();
    }
    return (
        <div>
            <div className='flex items-center mb-[10px]'>
                <span className='ae__add-event--title mr-[10px]'>Add</span>
                <div className='ae__seperate'></div>
            </div>

            <form className='ae__wrapper' method='POST' onSubmit={handleSubmitScheduleEvent}>
                <button className='ae__icon' type='submit' >
                    <img src={IMG_URL_BASE + "add-icon.svg"} alt='add-icon' className='w-[20px]' />
                </button>

                <div className='ae__body'>
                    <input 
                        type='text' 
                        placeholder='New title event' 
                        className='ae__body--title ae__body--input' 
                        onChange={(e) => setTitle(e.target.value)} 
                        value={title}
                        name='Title'
                        />

                    <div className='ae__body--range'>
                        <div className='w-[80px]'>
                            <MaskedInput
                                mask={[/\d/, /\d/, ':', /\d/, /\d/, ' ', /A|P/, 'M']}
                                placeholder="12:00 PM"
                                guide={false}
                                className="ae__body--input ae__body--time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                name='StartTime'
                            />
                        </div>
                        <div className='ae__body--between'>~</div>
                        <div className='w-[80px]'>
                            <MaskedInput
                                mask={[/\d/, /\d/, ':', /\d/, /\d/, ' ', /A|P/, 'M']}
                                placeholder="12:00 PM"
                                guide={false}
                                className="ae__body--input ae__body--time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                name='EndTime'
                            />
                        </div>
                    </div>
                </div>

                <input type='text' name='Date' value={currentDate} className='hidden' readOnly/>
            </form>
        </div>
    )
}

export default AddEvent