import React from 'react'
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import { appClient } from '~/AppConfigs';
import { useState, useCallback, useEffect } from 'react';

function ClassItem({itemInfo}) {
    const [teacherName, setTeacherName] = useState("");
    const defaultImageClass = IMG_URL_BASE + "unknown_user.jpg";
    
    const getFullNameTeacher = useCallback(async() =>{
        try{
            const response = await appClient.get(`api/teachers/${itemInfo.teacherId}`);
            const data = response.data;

            if(data.success){
                setTeacherName(data.message);
            }
        }
        catch(error){

        }
    })

    const changeFormatTime = useCallback((time) =>{
        const date = new Date(time);
        const options = { month: 'short', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options).replace(' ', '-');

        return formattedDate;
    })

    useEffect(() =>{
        getFullNameTeacher();
    }, [itemInfo])

    return (
        <div className='ci__wrapper'>
            <div className='ci__content'>
                <div className="ci__img">
                    <img src={itemInfo?.imageUrl ? APP_URL + itemInfo.imageUrl : defaultImageClass}/>
                </div>

                <div className='ci__info'>
                    <span className='ci__class-name'>
                        {itemInfo.courseId}
                        <span className="ci__class-code">({itemInfo.classId})</span>
                    </span>
                    <span className="ci__teacher-by">
                        By: 
                        <span className='ci__teacher--name'>{teacherName}</span>
                    </span>
                    
                </div>
            </div>

            <div className="ci__sub-content">
                <span className='ci__registered-number'>{itemInfo.registeredNum}/{itemInfo.maxNum} Registered</span>
                <div className='flex items-center'>
                    <span className='ci__start-date'>{changeFormatTime(itemInfo.startDate)}</span>
                    <span className='text-center mx-[5px] ci__seperate'>~</span>
                    <span className='ci__end-date'>{changeFormatTime(itemInfo.endDate)}</span>
                </div>
            </div>
        </div>
    )
}

export default ClassItem