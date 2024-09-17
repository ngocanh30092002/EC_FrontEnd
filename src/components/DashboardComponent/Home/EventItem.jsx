import React, { useState, useEffect } from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import MaskedInput from 'react-text-mask';
import { appClient } from '~/AppConfigs';

function EventItem({ itemInfo , onRemoveEvent}) {
    const [isEditing, setEdit] = useState(false);
    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isReadOnly, setReadOnly] = useState(true);

    useEffect(() =>{
        setTitle(itemInfo?.title);
        setStartTime(itemInfo?.startTime);
        setEndTime(itemInfo?.endTime);
    }, [itemInfo])

    useEffect(() =>{
        setReadOnly(!isEditing);
    }, [isEditing])
    
    const handleClickEvent = () => {
        if(isEditing){
            onRemoveEvent(itemInfo.scheduleId);
        }
    }

    const handleEditClick = () =>{
        setEdit(!isEditing);

        if(isEditing){
            handleUpdateEvent();
        }
    }

    const handleMouseLeave = () => {
        if(isEditing){
            handleUpdateEvent();
        }
        setEdit(false);
    }

    const handleUpdateEvent = () =>{
        const formData = new FormData();
        formData.append('Title', title);
        formData.append('StartTime', startTime);
        formData.append('EndTime', endTime);
        formData.append('Date', itemInfo.date);

        const submitForm = async () =>{
            try{
                await appClient.put(`api/events/${itemInfo.scheduleId}`, formData)
            }
            catch(error){

            }
        }

        submitForm();
    }

    return (
        <div className={'ae__wrapper justify-between'} onMouseLeave={handleMouseLeave}>
            <div className='flex items-center'>
                <div className='ae__icon' onClick={handleClickEvent}>
                    <img src={IMG_URL_BASE + "calendar-icon1.svg"} alt='add-icon' className={`w-[16px] ${isEditing ? "opacity-0" : "opacity-100"}`}/>                    
                    <img src={IMG_URL_BASE + "trash_icon.svg"} alt='add-icon' className={`w-[20px] ${isEditing ? "opacity-100" : "opacity-0"}`} />
                </div>

                <div className='ae__body'>
                    <input
                        type='text'
                        placeholder='New title event'
                        className={`ae__body--title ae__body--input`}
                        onChange={(e) => setTitle(e.target.value)}
                        readOnly={isReadOnly}
                        value={title}
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
                                readOnly={isReadOnly}
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
                                readOnly={isReadOnly}
                            />
                        </div>

                    </div>
                </div>
            </div>

            <div className='ae__options relative w-[20px] h-[20px]' onClick={handleEditClick}>
                <img src={IMG_URL_BASE + "dot-icon.svg"} className={`${isEditing ? "opacity-0" : "opacity-100"}`} /> 
                <img src={IMG_URL_BASE + "close.svg"} className={`${isEditing ? "opacity-100" : "opacity-0"}`} /> 
            </div>

        </div>
    )
}

export default EventItem